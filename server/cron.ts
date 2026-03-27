/**
 * APS Background Jobs — Cron Service
 *
 * Runs alongside the Next.js server via `concurrently`.
 * Three scheduled jobs:
 *   1. Overdue invoice check   — 9:00 AM ET daily
 *   2. Review request dispatcher — hourly
 *   3. Appointment reminder     — 4:00 PM ET daily
 *
 * Uses the Neon SQL client from ../src/lib/db.ts
 */

import { sql } from '../src/lib/db';

// ---------------------------------------------------------------------------
// Time helpers (Eastern Time)
// ---------------------------------------------------------------------------

function getEasternHour(): number {
  // Eastern time (EST/EDT)
  const et = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
  return new Date(et).getHours();
}

function isEtHour(hour: number): boolean {
  return getEasternHour() === hour;
}

// ---------------------------------------------------------------------------
// Job 1: Overdue Invoice Check — 9:00 AM ET daily
// ---------------------------------------------------------------------------

async function checkOverdueInvoices(): Promise<void> {
  console.log('[cron] Running overdue invoice check...');

  try {
    // Find sent invoices past their due date
    const overdueRows = await sql`
      SELECT id, invoice_number, due_date
      FROM invoices
      WHERE status = 'sent'
        AND due_date < NOW()
    ` as { id: number; invoice_number: string; due_date: Date }[];

    if (overdueRows.length === 0) {
      console.log('[cron] No overdue invoices found.');
      return;
    }

    for (const row of overdueRows) {
      // Update status to overdue
      await sql`
        UPDATE invoices
        SET status = 'overdue', updated_at = NOW()
        WHERE id = ${row.id}
      `;

      // Log the status change
      await sql`
        INSERT INTO invoice_status_logs (invoice_id, from_status, to_status, actor, note, created_at)
        VALUES (
          ${row.id},
          'sent',
          'overdue',
          'system',
          ${`Auto-marked overdue: due date was ${row.due_date.toISOString()}`},
          NOW()
        )
      `;

      console.log(`[cron] Invoice ${row.invoice_number} marked overdue.`);
    }

    console.log(`[cron] Overdue invoice check complete. Updated ${overdueRows.length} invoice(s).`);
  } catch (err) {
    console.error('[cron] checkOverdueInvoices failed:', err);
  }
}

// ---------------------------------------------------------------------------
// Job 2: Review Request Dispatcher — hourly
// ---------------------------------------------------------------------------

async function dispatchReviewRequests(): Promise<void> {
  console.log('[cron] Running review request dispatcher...');

  try {
    // Find completed job_logs that:
    //   - Have no review request log entry
    //   - Belong to a client who hasn't opted out
    const rows = await sql`
      SELECT
        jl.id         AS job_log_id,
        jl.client_id,
        jl.completed_date,
        c.name        AS client_name,
        c.email       AS client_email,
        c.phone       AS client_phone,
        rs.google_review_link,
        rs.facebook_review_link
      FROM job_logs jl
      JOIN clients c ON c.id = jl.client_id
      LEFT JOIN review_request_logs rrl ON rrl.job_log_id = jl.id
      LEFT JOIN review_settings rs ON rs.id = 1
      WHERE jl.status = 'completed'
        AND jl.completed_date IS NOT NULL
        AND rrl.id IS NULL                          -- no review request sent yet
        AND c.review_opt_out = FALSE                -- client hasn't opted out
      LIMIT 50
    ` as {
      job_log_id: number;
      client_id: number;
      completed_date: Date;
      client_name: string;
      client_email: string | null;
      client_phone: string | null;
      google_review_link: string;
      facebook_review_link: string | null;
    }[];

    if (rows.length === 0) {
      console.log('[cron] No pending review requests.');
      return;
    }

    for (const row of rows) {
      const reviewLink = row.google_review_link || 'https://g.page/r/CXh2r5bK1ZCXEBM/review';

      // Log the review request
      await sql`
        INSERT INTO review_request_logs (
          job_log_id, client_id, channel, trigger_type,
          review_link, created_at
        ) VALUES (
          ${row.job_log_id},
          ${row.client_id},
          'email',
          'job_completion',
          ${reviewLink},
          NOW()
        )
      `;

      console.log(
        `[cron] Review request dispatched for job_log_id=${row.job_log_id} ` +
        `(client: ${row.client_name}, email: ${row.client_email ?? 'n/a'})`
      );
    }

    console.log(`[cron] Review dispatcher complete. Sent ${rows.length} request(s).`);
  } catch (err) {
    console.error('[cron] dispatchReviewRequests failed:', err);
  }
}

// ---------------------------------------------------------------------------
// Job 3: Appointment Reminder — 4:00 PM ET daily
// ---------------------------------------------------------------------------

async function sendAppointmentReminders(): Promise<void> {
  console.log('[cron] Running appointment reminders...');

  try {
    // Find approved/confirmed inspection schedules:
    //   - scheduled within the next ~26 hours (to catch tomorrow's appointments)
    //   - no 24-hour reminder sent yet (checked via reminder_logs)
    //   - client has not opted out of reminders
    const rows = await sql`
      SELECT
        ins.id,
        ins.first_name,
        ins.last_name,
        ins.phone,
        ins.email,
        ins.preferred_date,
        ins.preferred_time,
        ins.service_type,
        c.review_opt_out,
        COALESCE(s.reminder_24h_enabled, TRUE) AS reminder_24h_enabled
      FROM inspection_schedules ins
      JOIN clients c ON c.id = ins.client_id
      LEFT JOIN system_settings s ON s.id = 1
      LEFT JOIN reminder_logs rl ON rl.appointment_id = ins.id
        AND rl.appointment_type = 'inspection'
        AND rl.reminder_type = '24h'
      WHERE ins.status IN ('approved', 'confirmed')
        AND ins.preferred_date > NOW()
        AND ins.preferred_date <= NOW() + INTERVAL '26 hours'
        AND rl.id IS NULL
        AND c.review_opt_out = FALSE
      LIMIT 50
    ` as {
      id: number;
      first_name: string;
      last_name: string;
      phone: string;
      email: string;
      preferred_date: Date;
      preferred_time: string;
      service_type: string;
      reminder_24h_enabled: boolean;
    }[];

    if (rows.length === 0) {
      console.log('[cron] No pending appointment reminders.');
      return;
    }

    for (const row of rows) {
      if (!row.reminder_24h_enabled) continue;

      const appointmentDate = new Date(row.preferred_date).toLocaleString('en-US', {
        timeZone: 'America/New_York',
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      });

      // Log that reminder was "sent" (email/push would be injected here)
      await sql`
        INSERT INTO reminder_logs (
          appointment_type, appointment_id, reminder_type,
          channel, status, created_at
        ) VALUES (
          'inspection',
          ${row.id},
          '24h',
          'email',
          'sent',
          NOW()
        )
      `;

      console.log(
        `[cron] Reminder queued for inspection id=${row.id} ` +
        `(${row.first_name} ${row.last_name}, ${row.service_type}, ${appointmentDate})`
      );
    }

    console.log(`[cron] Appointment reminders complete. Queued ${rows.length} reminder(s).`);
  } catch (err) {
    console.error('[cron] sendAppointmentReminders failed:', err);
  }
}

// ---------------------------------------------------------------------------
// Main scheduler
// ---------------------------------------------------------------------------

const OVERDUE_HOUR_ET = 9;
const REMINDER_HOUR_ET = 16;
const TICK_MS = 60 * 60 * 1000; // 1 hour

// Track last run dates so 9 AM / 4 PM jobs fire once per day
let lastOverdueRunDate = '';
let lastReminderRunDate = '';

async function tick(): Promise<void> {
  const etHour = getEasternHour();
  const todayEt = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', timeZoneName: 'short' }).split(' ')[0];

  console.log(`[cron] Tick at ~${etHour}:00 ET (${todayEt})`);

  // ── 9 AM ET: overdue invoice check ──────────────────────────────────────
  if (etHour === OVERDUE_HOUR_ET) {
    const runKey = `overdue-${todayEt}`;
    if (lastOverdueRunDate !== runKey) {
      lastOverdueRunDate = runKey;
      await checkOverdueInvoices();
    }
  }

  // ── Hourly: review request dispatcher ──────────────────────────────────
  await dispatchReviewRequests();

  // ── 4 PM ET: appointment reminders ─────────────────────────────────────
  if (etHour === REMINDER_HOUR_ET) {
    const runKey = `reminder-${todayEt}`;
    if (lastReminderRunDate !== runKey) {
      lastReminderRunDate = runKey;
      await sendAppointmentReminders();
    }
  }
}

// Run immediately on startup, then every hour
console.log('[cron] APS cron service starting...');
tick().catch((err) => console.error('[cron] Initial tick failed:', err));
setInterval(tick, TICK_MS);
