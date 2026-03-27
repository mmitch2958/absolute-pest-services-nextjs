/**
 * APS Background Jobs — Cron Service
 *
 * This script runs alongside the Next.js server (via `concurrently`).
 * It handles scheduled background tasks such as:
 *   - Sending appointment reminder emails
 *   - Fetching Google Ads performance data
 *   - Cleaning up stale data
 *
 * Import sql from ../lib/db.ts to run database queries.
 */

import sql from '../src/lib/db';

const CRON_INTERVAL_MS = 60 * 60 * 1000; // Run every 60 minutes

async function runJobs() {
  console.log('[cron] Running scheduled jobs...');

  try {
    // TODO: Add job implementations as features are migrated from Replit.
    // Examples:
    // await sendAppointmentReminders();
    // await fetchGoogleAdsReports();
    // await cleanupStaleData();
    console.log('[cron] Jobs completed successfully.');
  } catch (err) {
    console.error('[cron] Job run failed:', err);
  }
}

// Run once on startup, then on interval
runJobs();
setInterval(runJobs, CRON_INTERVAL_MS);
