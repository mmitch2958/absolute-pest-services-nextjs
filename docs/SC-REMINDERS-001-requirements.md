# Requirements: Automated Appointment Reminders
**Doc ID:** SC-REMINDERS-001  
**Status:** Draft  
**Author:** 3CP0 (Research/Product)  
**Date:** 2026-03-09  
**Project:** AbsolutePestServices.com  

---

## Overview

Automated reminders sent to customers before upcoming service appointments. This reduces no-shows, improves customer satisfaction, and reduces manual follow-up calls by the business.

**Scope:** Email reminders only (Phase 1). SMS deferred to Phase 2. Covers `inspectionSchedules`, `serviceRequests` (with `scheduledDate`), and `jobLogs` (with `status = 'scheduled'`).

---

## Functional Requirements

### FR-001: Reminder Trigger — Inspection Schedules

**As an** Absolute Pest Services customer,  
**I want** to receive an email reminder before my scheduled inspection,  
**So that** I don't forget and can ensure access to my property.

- Given an `inspectionSchedules` record with `preferredDate` set and `status != 'cancelled'`
- A reminder email SHALL be sent 24 hours before `preferredDate`
- A same-day reminder email SHALL be sent at 8:00 AM on the day of the appointment

**Acceptance Criteria:**
- [ ] Given an inspection is scheduled for tomorrow at any time, when the 24-hour cron fires, then a reminder email is sent to the customer's `email` field
- [ ] Given an inspection is scheduled for today, when the 8 AM cron fires, then a same-day reminder email is sent
- [ ] Given an inspection has `status = 'cancelled'`, then NO reminder is sent
- [ ] Given a reminder has already been sent for an appointment, it is not sent again (idempotency)

---

### FR-002: Reminder Trigger — Service Requests (Scheduled Jobs)

**As a** portal customer,  
**I want** to receive a reminder before my service appointment,  
**So that** I'm prepared for the technician's arrival.

- Given a `serviceRequests` record with `scheduledDate` set and `status = 'scheduled'`
- A 24-hour advance reminder SHALL be sent
- A same-day reminder at 8:00 AM SHALL be sent

**Acceptance Criteria:**
- [ ] Given `scheduledDate` is set and `status = 'scheduled'`, when the cron fires within the 24-hour window, then a reminder email is sent to the linked user's email
- [ ] Given `status` changes to `cancelled` or `completed` before the reminder fires, then no reminder is sent
- [ ] Given the same appointment, the 24-hour reminder and same-day reminder are two distinct emails (both sent, not one replacing the other)

---

### FR-003: Reminder Trigger — Field Job Logs (Scheduled Jobs)

**As a** customer with a recurring contract,  
**I want** to receive a reminder before a technician visits,  
**So that** I know when to expect them.

- Given a `jobLogs` record with `status = 'scheduled'` and `jobDate` set
- A 24-hour advance reminder SHALL be sent (if the client has an email on record)
- A same-day reminder at 8:00 AM SHALL be sent

**Acceptance Criteria:**
- [ ] Given `jobLogs.status = 'scheduled'`, when cron fires, then a reminder is sent to the associated `clients.email`
- [ ] Given no client email is available, the reminder is silently skipped (no error thrown)
- [ ] Given `status` changes to `completed` or `cancelled` before the cron fires, reminder is suppressed

---

### FR-004: Reminder Channel — Email (Phase 1)

All reminders in Phase 1 SHALL be sent via email using the existing **SendGrid** integration (`server/email.ts`).

- Use existing `sendEmail()` function with `FROM_EMAIL = 'rob@absolutepestservices.com'`
- New `sendAppointmentReminderEmail()` function to be added to `server/email.ts`
- Email content must include: appointment type, date/time, address, service type, and a contact number
- Include a "Need to reschedule?" prompt with phone number `(484) 643-2225`

---

### FR-005: Reminder Timing — Standard Schedule

| Reminder | Timing | Trigger |
|---|---|---|
| 24-Hour Advance | Day before, fires at 9:00 AM | `cron('0 9 * * *')` — check appointments 24–36 hours out |
| Same-Day | Day of appointment, fires at 8:00 AM | `cron('0 8 * * *')` — check appointments today |

> **Note:** The 24-hour reminder window is 24–36 hours before appointment time (not exactly 24h) to ensure morning-fired crons catch all tomorrow's appointments.

---

### FR-006: Idempotency — Prevent Duplicate Reminders

**The system SHALL NOT send the same reminder twice for the same appointment.**

- A new table `reminder_logs` SHALL track sent reminders (see schema section below)
- Before sending a reminder, check if a record exists for `(appointment_type, appointment_id, reminder_type)`
- If found, skip sending
- If not found, send and insert the log record

**Acceptance Criteria:**
- [ ] Given a reminder was sent for appointment X (24h), when the cron fires again the next day, the reminder is NOT resent
- [ ] Given the server restarts between cron runs, previously-sent reminders are not re-sent (persisted in DB, not memory)

---

### FR-007: Customer Opt-Out (Phase 1 — Simple)

Phase 1 implements a **per-appointment opt-out** approach. Full customer preferences management is Phase 2.

- Customers MAY call or message to opt out; admin manually disables reminders for that appointment
- No self-service opt-out link in email (Phase 1 simplification)
- Admin can set `reminders_enabled = false` on the `reminder_logs` suppression record

**Open Question for Mike:** Should Phase 1 include an unsubscribe link in the email footer? This would require a token-based preferences endpoint.

---

### FR-008: Admin Controls

**As an admin,** I want to be able to control reminders globally and per-appointment.

- `GET /api/admin/reminders/settings` — retrieve global reminder settings
- `PATCH /api/admin/reminders/settings` — enable/disable reminders globally, adjust timing offsets
- `POST /api/admin/reminders/preview` — preview what reminder email would look like for a given appointment ID
- `DELETE /api/admin/reminders/logs/:id` — delete a reminder log entry (force re-send on next cron)

**Global Settings** (stored in a `system_settings` table or env-based config):
- `reminders_enabled` (boolean, default: `true`)
- `reminder_advance_hours` (integer, default: `24`)
- `reminder_same_day_enabled` (boolean, default: `true`)

---

### FR-009: Reminder Email Content

Each reminder email SHALL include:

| Field | Source |
|---|---|
| Customer name | `firstName + lastName` (inspections/service) or client `name` (job logs) |
| Service type | `serviceType` or job log `workPerformed` summary |
| Appointment date | Formatted as "Monday, March 10, 2026" |
| Appointment time | `preferredTime` (inspections) or "TBD" (service requests without time) |
| Address | `address + city` |
| Contact number | Hard-coded `(484) 643-2225` |
| Reschedule prompt | "To reschedule, call (484) 643-2225" |
| Brand footer | Absolute Pest Services standard footer |

---

## Non-Functional Requirements

### NFR-001: Reliability
- Cron job failures SHALL be logged to console with full error details
- A failed reminder send SHALL NOT crash the cron process
- Each appointment's reminder send is independently retryable

### NFR-002: Performance
- Reminder query SHALL only fetch upcoming appointments within a defined window (not all records)
- DB query for 24h check: `WHERE date BETWEEN now() AND now() + 36 hours`
- DB query for same-day check: `WHERE DATE(date) = TODAY`

### NFR-003: Observability
- Each sent reminder SHALL be logged to `reminder_logs` table with `sentAt` timestamp
- Cron output SHALL include count of reminders sent: `"Sent 3 appointment reminders"`
- Failed sends SHALL be logged: `"[Reminder] Failed to send to customer@email.com: ..."`

### NFR-004: Timezone
- All appointment times are stored in UTC in Postgres
- Cron runs in server local time (UTC in Replit)
- Formatted email dates SHALL display in Eastern Time using `America/New_York` locale
- Same-day check fires at 8 AM server time; business is in Eastern Time — **open question whether server time matches ET**

---

## Schema Changes Required

### New Table: `reminder_logs`

```typescript
export const reminderLogs = pgTable("reminder_logs", {
  id: serial("id").primaryKey(),
  appointmentType: text("appointment_type").notNull(), // 'inspection', 'service_request', 'job_log'
  appointmentId: integer("appointment_id").notNull(),
  reminderType: text("reminder_type").notNull(), // '24h', 'same_day'
  recipientEmail: text("recipient_email").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  success: boolean("success").notNull().default(true),
  errorMessage: text("error_message"),
});

// Unique constraint to prevent duplicates:
// UNIQUE(appointment_type, appointment_id, reminder_type)
```

### Existing Tables — No Changes Required

| Table | Relevant Fields | Notes |
|---|---|---|
| `inspectionSchedules` | `preferredDate`, `email`, `firstName`, `lastName`, `status`, `serviceType`, `address`, `city`, `preferredTime` | All fields present |
| `serviceRequests` | `scheduledDate`, `status`, `serviceType`, `address`, `city`, `firstName`, `lastName` | Needs JOIN to `users` for email |
| `jobLogs` | `jobDate`, `status`, `customerName`, `clientId`, `siteLocation`, `workPerformed` | Needs JOIN to `clients` for email |
| `clients` | `email`, `name` | Email target for job log reminders |
| `users` | `email` | Email target for service request reminders (via `userId`) |

---

## API Requirements

### New Endpoints

#### `GET /api/admin/reminders/logs`
Returns recent reminder log entries for admin visibility.

**Query Params:** `?appointmentType=`, `?appointmentId=`, `?limit=50`  
**Auth:** `requireAdmin`

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": 1,
      "appointmentType": "inspection",
      "appointmentId": 42,
      "reminderType": "24h",
      "recipientEmail": "customer@email.com",
      "sentAt": "2026-03-09T09:00:00Z",
      "success": true
    }
  ]
}
```

#### `POST /api/admin/reminders/send-now` *(optional, admin-triggered)*
Manually trigger a reminder for a specific appointment.

**Body:** `{ "appointmentType": "inspection", "appointmentId": 42, "reminderType": "24h" }`  
**Auth:** `requireAdmin`  
**Notes:** Bypasses idempotency check (allows re-send). Useful for testing.

---

## Implementation Architecture

### Cron Jobs (add to `server/index.ts`)

```typescript
// 24-hour advance reminders — runs daily at 9 AM
cron.schedule("0 9 * * *", async () => {
  try {
    const count = await sendUpcomingReminders('24h');
    if (count > 0) console.log(`Sent ${count} 24h appointment reminders`);
  } catch (err) {
    console.error("Error in 24h reminder cron:", err);
  }
});

// Same-day reminders — runs daily at 8 AM
cron.schedule("0 8 * * *", async () => {
  try {
    const count = await sendUpcomingReminders('same_day');
    if (count > 0) console.log(`Sent ${count} same-day appointment reminders`);
  } catch (err) {
    console.error("Error in same-day reminder cron:", err);
  }
});
```

### New Module: `server/reminders.ts`

Primary logic module for reminder orchestration:

```typescript
export async function sendUpcomingReminders(type: '24h' | 'same_day'): Promise<number>
```

**Internal logic:**
1. Query `inspectionSchedules`, `serviceRequests`, `jobLogs` for appointments in the target window
2. For each appointment, check `reminder_logs` for existing entry (idempotency)
3. If not sent: compose email, call `sendAppointmentReminderEmail()`, insert `reminder_logs` record
4. Return count of reminders sent

### New Email Function: `sendAppointmentReminderEmail()`

Add to `server/email.ts`:

```typescript
export async function sendAppointmentReminderEmail(data: {
  recipientEmail: string;
  customerName: string;
  serviceType: string;
  appointmentDate: Date;
  appointmentTime?: string;
  address: string;
  city: string;
  reminderType: '24h' | 'same_day';
}): Promise<boolean>
```

---

## Assumptions

1. Customers have valid email addresses — the system skips reminders when email is missing or null
2. The Replit server runs in UTC; cron times may not align with Eastern Time without explicit timezone handling
3. `inspectionSchedules.preferredDate` stores the full datetime (not just date) — confirmed in schema
4. `serviceRequests.scheduledDate` is the confirmed appointment time, not just a requested date
5. Job logs with `status = 'scheduled'` represent booked appointments (distinct from completed/in-progress)
6. Phase 1 does NOT require SMS; SendGrid email only
7. `node-cron` is already installed (v4.2.1 in package.json) — no new dependency needed

---

## Mike's Answers (Mar 9, 2026)

1. **Reminder timing:** Daily at 4pm, configurable by user
2. **Channel:** Both Email + SMS
3. **Opt-out:** Yes, customers can unsubscribe
4. **Admin controls:** Settings page with on/off toggle, time config, appointment type filters, sending stats
5. **Timezone:** Business timezone configurable in admin (default: EST/EDT), reminders fire at correct local time
6. **Same-day:** No reminders sent after appointment passes

---

## Open Questions

1. **Timezone alignment:** The server cron fires at server time. If Replit runs UTC and the business is Eastern (UTC-4/5), an 8 AM cron fires at 8 AM UTC = 3 AM ET. Does this need adjustment? *Recommend: configure crons at 13:00 UTC (9 AM ET) and 12:00 UTC (8 AM ET).*

2. **Customer opt-out (Phase 1):** Should the reminder email include a plain-text "To stop receiving reminders, call us at (484) 643-2225" line, or is a link-based unsubscribe needed for Phase 1?

3. **Admin toggle:** Should the global `reminders_enabled` flag live in a DB `system_settings` table (more flexible) or a `.env` variable (simpler)? Recommendation: env variable for Phase 1.

4. **Inspection schedules without confirmed status:** `inspectionSchedules` records start as `'pending'` — should reminders fire on `pending` status (customer submitted a request) or only on an `'approved'`/`'confirmed'` status? *Currently there is no `confirmed` status in schema — open question for Mike.*

5. **Job log reminders — customer email lookup:** `jobLogs` records have `clientId → clients.email`. If the client has no email but the job has a `customerName`, should we attempt a lookup via `fieldCustomers` table? *Recommendation: skip if no email, log the skip.*

6. **Admin notification CC:** Should the business (rob@absolutepestservices.com) receive a BCC or daily digest of reminders sent, or is the `reminder_logs` table sufficient?

---

## Research Sources

- Codebase inspection: `shared/schema.ts`, `server/email.ts`, `server/routes.ts`, `server/index.ts`
- Existing cron pattern: `index.ts` lines 94-103 (overdue invoice checker)
- Existing email pattern: `sendInvoiceOverdueEmail()` in `email.ts` — direct model for reminder emails
- Dependencies confirmed: `@sendgrid/mail ^8.1.5`, `node-cron ^4.2.1` (package.json)
- Prior art in project: `SC-INV-001` overdue invoice reminders (same cron + email pattern)

---

## Recommended Next Steps

1. **Mike:** Answer open questions #1 (timezone), #4 (inspection status gate), and #6 (admin CC)
2. **Akbar:** Review schema addition (`reminder_logs` table) and architecture for `server/reminders.ts` module
3. **Luke:** Implementation after Akbar sign-off
   - Phase 1 estimated complexity: Medium (3–5 days)
   - New files: `server/reminders.ts`
   - Modified files: `server/email.ts`, `server/index.ts`, `shared/schema.ts`
   - Migration: `npm run db:push` after schema change
