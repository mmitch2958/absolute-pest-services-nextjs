# Requirements: Review Request Automation
**Doc ID:** SC-REVIEWS-001  
**Status:** Draft  
**Author:** 3CP0 (Research/Product)  
**Date:** 2026-03-09  
**Project:** AbsolutePestServices.com  

---

## Overview

After a job is completed, automatically send the customer a friendly email (Phase 1) or SMS (Phase 2) asking them to leave a review on Google Reviews. This boosts Absolute Pest Services' online reputation with minimal manual effort.

**Scope:** Email-first (SendGrid, same pattern as SC-INV-001 and SC-REMINDERS-001). Google Reviews as primary destination. Covers `jobLogs` (field-completed jobs) and `invoices` (after payment). SMS and Facebook deferred to Phase 2.

---

## Context: Existing System

From codebase inspection (March 2026):

| Piece | What Exists |
|---|---|
| Email infrastructure | `server/email.ts` — SendGrid via `@sendgrid/mail ^8.1.5` |
| Cron infrastructure | `node-cron ^4.2.1` — already used for overdue invoice checker in `server/index.ts` |
| Job completion tracking | `jobLogs.status` — values: `scheduled`, `in_progress`, **`completed`**, `invoiced`, `paid` |
| Invoice payment tracking | `invoices.status` — values: `draft`, `sent`, `viewed`, **`paid`**, `overdue`, `void` |
| Idempotency pattern | `reminder_logs` (SC-REMINDERS-001) — same pattern needed here |
| Google Review link | Hard-coded in `sendServiceRequestStatusUpdate()`: `https://g.page/r/CXh2r5bK1ZCXEBM/review` |
| Customer email fields | `clients.email` (via `jobLogs.clientId`), `users.email` (for portal customers via `serviceRequests`) |

**Key observation:** The existing `sendServiceRequestStatusUpdate()` already includes a Google Review CTA when `status = 'completed'` — but it's buried in a larger status-update email and not a dedicated review request flow.

---

## Functional Requirements

### FR-001: Trigger — Job Log Completion

**As a** field technician submitting a completed job log,  
**I want** the system to automatically notify the customer to leave a review,  
**So that** Absolute Pest Services collects timely, authentic reviews.

- Given a `jobLogs` record with `status` transitioning to `'completed'`
- AND the associated `clients.email` is not null
- A review request email SHALL be sent to the client email
- Default delay: **1 hour after job completion** (see FR-005 for configurable timing)

**Status trigger:** `status = 'completed'` on `jobLogs`  
*(Note: jobs start as `scheduled` → `in_progress` → `completed` → `invoiced` → `paid`)*

**Acceptance Criteria:**
- [ ] Given `jobLogs.status` is updated to `'completed'` via `PATCH /api/admin/job-logs/:id`, when the delay period expires, then a review request email is sent to `clients.email` (via `jobLogs.clientId`)
- [ ] Given `jobLogs.clientId` is null or `clients.email` is null/empty, then the review request is silently skipped
- [ ] Given a review request was already sent for this job log, the system does NOT send a duplicate

---

### FR-002: Trigger — Invoice Payment

**As an** admin who marks an invoice as paid,  
**I want** a review request sent to the customer automatically,  
**So that** payment confirmation and review request arrive in the same post-service window.

- Given `invoices.status` transitions to `'paid'`
- AND the associated `clients.email` is available
- A review request email SHALL be sent (same delay as FR-001)
- If a review request was already sent for the same `clientId` within 30 days, skip this trigger (anti-spam)

**Acceptance Criteria:**
- [ ] Given an invoice is marked `paid`, when the delay period expires, then a review request is sent to `clients.email`
- [ ] Given the same client already received a review request from a job log completion within 30 days, the invoice trigger is suppressed
- [ ] Given an invoice is voided before the delay fires, the queued review request is cancelled

**Open Question #1 for Mike:** Should review requests trigger on both job completion AND invoice payment, or only one? Risk: customers could receive two requests for the same job if both triggers fire.

---

### FR-003: Review Destination

**Primary:** Google Reviews  
- Link: `https://g.page/r/CXh2r5bK1ZCXEBM/review` (existing, confirmed in `email.ts`)
- This link is already hard-coded in the codebase — confirm it's current before launch

**Secondary (Phase 2):** Facebook Reviews (requires a separate Facebook Page review URL)

**Admin control:** Review destination URL shall be configurable via admin settings (see FR-008) so the business can update it without a code deploy.

---

### FR-004: Channel — Email (Phase 1)

All review requests in Phase 1 SHALL be sent via email using the existing SendGrid integration.

- Use existing `sendEmail()` function from `server/email.ts`
- `FROM_EMAIL`: `rob@absolutepestservices.com`
- New function `sendReviewRequestEmail()` to be added to `server/email.ts`
- Phase 2: SMS via Twilio (requires new dependency and phone number on record)

**Open Question #2 for Mike:** Do customers consistently have phone numbers in `clients.phone` and `users.phone`? This affects Phase 2 SMS feasibility.

---

### FR-005: Timing — Configurable Delay

Review requests SHALL NOT be sent immediately — customers need time to experience the result of the service.

| Setting | Default | Range |
|---|---|---|
| Delay after trigger | 24 hours | 1–72 hours |
| Single send only | Yes | — |

**Recommendation (opinion):** 24 hours gives the customer time to see results and reflect; same-day sends have lower response rates in service industries.

**Implementation approach:** Since there's no job queue, the delay shall be implemented via a **cron job** that checks for "due" review requests in the `review_request_logs` table. Trigger-time is stored; cron fires hourly and dispatches anything past the delay window.

---

### FR-006: Anti-Spam & Customer Protection

The system SHALL NOT bombard customers with review requests.

**Rules:**
- **One request per job:** A review request is sent at most once per `jobLogId` or `invoiceId`
- **30-day cooldown per client:** Even if a client has multiple jobs in a month, only one review request is sent per 30-day rolling window
- **Opt-out respected:** If a client is flagged `review_opt_out = true`, no review requests are sent (see FR-007)
- **Maximum per year:** No more than 6 review requests per `clientId` per calendar year (hard cap)

**Tracking table:** `review_request_logs` (see Schema section)

---

### FR-007: Opt-Out / "Don't Ask Again"

**As a** customer who does not want review requests,  
**I want** to be able to opt out,  
**So that** I don't receive unwanted emails after every service.

**Phase 1 — Admin-managed:**
- Add `review_opt_out` boolean field to `clients` table (default: `false`)
- Admin can toggle per-client via admin panel
- No self-service unsubscribe link in Phase 1 (simplification)

**Phase 2 — Self-service:**
- Include a token-based unsubscribe link in the review request email
- Clicking the link flips `clients.review_opt_out = true`
- Show confirmation page: "You've been unsubscribed from review requests"

**Open Question #3 for Mike:** Is Phase 1 admin-only opt-out acceptable, or do customers need a self-service unsubscribe link?

---

### FR-008: Admin Controls

**As an admin,** I want full control over the review request system.

#### Settings Panel (`GET / PATCH /api/admin/reviews/settings`)

| Setting | Type | Default | Description |
|---|---|---|---|
| `reviews_enabled` | boolean | `true` | Global kill switch |
| `review_delay_hours` | integer | 24 | Hours after trigger before sending |
| `review_link_google` | string | `https://g.page/r/CXh2r5bK1ZCXEBM/review` | Configurable Google link |
| `review_link_facebook` | string | `""` | Facebook page review URL (Phase 2) |
| `cooldown_days` | integer | 30 | Days between review requests per client |
| `trigger_job_completion` | boolean | `true` | Fire on job log `completed` |
| `trigger_invoice_paid` | boolean | `false` | Fire on invoice `paid` (default off to avoid double-send) |
| `custom_message` | text | `""` | Optional custom text appended to review request email |

#### Admin Endpoints

```
GET  /api/admin/reviews/settings         — Get current settings
PATCH /api/admin/reviews/settings        — Update settings
GET  /api/admin/reviews/logs             — View review request history (paginated)
POST /api/admin/reviews/send-now/:jobLogId  — Manually trigger for a specific job (bypass delay/cooldown)
DELETE /api/admin/reviews/logs/:id       — Delete log entry (allow re-send)
PATCH /api/admin/clients/:id/review-opt-out  — Toggle opt-out for a client
```

---

### FR-009: Review Request Email Content

| Field | Source | Notes |
|---|---|---|
| Customer name | `clients.name` or `jobLogs.customerName` | Fallback order |
| Service performed | `jobLogs.workPerformed` (first 100 chars) or "pest control service" | Truncate if long |
| Job date | `jobLogs.jobDate` formatted as "Monday, March 9, 2026" | — |
| Site location | `jobLogs.siteLocation` | — |
| Google Review link | Admin-configured `review_link_google` | Direct link to review form |
| Business phone | Hard-coded `(484) 643-2225` | For questions |
| Opt-out mention (Phase 2) | Unsubscribe token link | Not in Phase 1 |
| Custom message | `settings.custom_message` if set | Appended below main body |

**Tone:** Warm, brief, appreciative. No pressure. One clear CTA button.

**Subject line options (pick one or A/B test later):**
- `"How did we do? Leave us a quick review 🐜"`
- `"Thanks for choosing Absolute Pest Services — share your experience!"`
- `"Your feedback means everything to us, [FirstName]"`

**Recommended subject (opinion):** `"How did we do? Leave us a quick Google review"` — direct, no emoji (business context).

---

### FR-010: Track Who Has Been Asked

All review request attempts SHALL be logged for auditing and anti-spam.

Every send attempt (success or failure) is logged in `review_request_logs` with:
- Which job/invoice triggered it
- Client ID and email
- Scheduled send time
- Actual send time
- Success/failure status
- Error message if failed

---

## Non-Functional Requirements

### NFR-001: Reliability
- Review request failures SHALL be logged but SHALL NOT crash the cron
- Failed sends SHALL be retried on next cron run (up to 3 attempts max, then marked `failed`)
- Retry attempts tracked in `review_request_logs.attempt_count`

### NFR-002: Performance  
- Cron query for pending review requests: `WHERE scheduled_send_at <= now() AND status = 'pending'`
- Index on `(status, scheduled_send_at)` for efficient polling

### NFR-003: Observability
- Each sent review request logged with `sentAt` timestamp
- Cron output: `"Sent 2 review request emails"`
- Failed sends: `"[ReviewRequest] Failed to send to customer@email.com: ..."`
- Admin dashboard stat: count of review requests sent this month

### NFR-004: No PII Leakage
- Review request logs store email addresses only for debugging
- Do not log full message content in server logs

---

## Schema Changes Required

### New Table: `review_request_logs`

```typescript
export const reviewRequestLogs = pgTable("review_request_logs", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id, { onDelete: "set null" }),
  jobLogId: integer("job_log_id").references(() => jobLogs.id, { onDelete: "set null" }),
  invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
  recipientEmail: text("recipient_email").notNull(),
  triggerType: text("trigger_type").notNull(), // 'job_completion', 'invoice_paid', 'manual'
  status: text("status").notNull().default("pending"), // 'pending', 'sent', 'failed', 'skipped', 'cancelled'
  scheduledSendAt: timestamp("scheduled_send_at").notNull(), // trigger time + delay
  sentAt: timestamp("sent_at"),
  attemptCount: integer("attempt_count").default(0).notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

**Unique constraint:** `UNIQUE(job_log_id)` and `UNIQUE(invoice_id)` — one review request per job/invoice.

**Index:** `CREATE INDEX ON review_request_logs (status, scheduled_send_at)` for cron query performance.

### Modify: `clients` table

Add opt-out flag:
```typescript
reviewOptOut: boolean("review_opt_out").default(false).notNull(),
```

### New Table: `review_settings` (or use `system_settings`)

If a `system_settings` pattern is adopted across the project (see SC-REMINDERS-001 open question), review settings belong there. Otherwise a dedicated table:

```typescript
export const reviewSettings = pgTable("review_settings", {
  id: serial("id").primaryKey(),  // single row, id = 1
  enabled: boolean("enabled").default(true).notNull(),
  delayHours: integer("delay_hours").default(24).notNull(),
  googleReviewLink: text("google_review_link").notNull().default("https://g.page/r/CXh2r5bK1ZCXEBM/review"),
  facebookReviewLink: text("facebook_review_link"),
  cooldownDays: integer("cooldown_days").default(30).notNull(),
  triggerJobCompletion: boolean("trigger_job_completion").default(true).notNull(),
  triggerInvoicePaid: boolean("trigger_invoice_paid").default(false).notNull(),
  customMessage: text("custom_message"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

---

## API Requirements

### New Endpoints

#### `GET /api/admin/reviews/settings`
Returns current review automation settings.  
**Auth:** `requireAdmin`  
**Response:**
```json
{
  "success": true,
  "settings": {
    "enabled": true,
    "delayHours": 24,
    "googleReviewLink": "https://g.page/r/CXh2r5bK1ZCXEBM/review",
    "cooldownDays": 30,
    "triggerJobCompletion": true,
    "triggerInvoicePaid": false,
    "customMessage": ""
  }
}
```

#### `PATCH /api/admin/reviews/settings`
Update review automation settings.  
**Auth:** `requireAdmin`  
**Body:** Partial settings object

#### `GET /api/admin/reviews/logs`
Returns paginated review request log.  
**Auth:** `requireAdmin`  
**Query params:** `?limit=50&offset=0&status=sent&clientId=`  
**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": 1,
      "clientId": 42,
      "jobLogId": 101,
      "recipientEmail": "customer@email.com",
      "triggerType": "job_completion",
      "status": "sent",
      "scheduledSendAt": "2026-03-10T12:00:00Z",
      "sentAt": "2026-03-10T12:00:05Z",
      "attemptCount": 1
    }
  ],
  "total": 47
}
```

#### `POST /api/admin/reviews/send-now/:jobLogId`
Manually trigger a review request for a specific job log.  
**Auth:** `requireAdmin`  
**Notes:** Creates a `review_request_logs` entry with `scheduledSendAt = now()` and `triggerType = 'manual'`. Bypasses cooldown check. Does NOT bypass opt-out.  
**Response:** `{ "success": true, "message": "Review request queued" }`

#### `DELETE /api/admin/reviews/logs/:id`
Delete a log entry to allow re-send.  
**Auth:** `requireAdmin`

#### `PATCH /api/admin/clients/:id/review-opt-out`
Toggle review opt-out for a client.  
**Auth:** `requireAdmin`  
**Body:** `{ "reviewOptOut": true }`

---

## Implementation Architecture

### Cron Job (add to `server/index.ts`)

```typescript
// Review request dispatcher — runs every hour
cron.schedule("0 * * * *", async () => {
  try {
    const count = await dispatchPendingReviewRequests();
    if (count > 0) console.log(`[ReviewRequests] Sent ${count} review request emails`);
  } catch (err) {
    console.error("[ReviewRequests] Cron error:", err);
  }
});
```

### New Module: `server/reviews.ts`

Primary orchestration module:

```typescript
// Called when job log status changes to 'completed'
export async function scheduleReviewRequest(jobLogId: number): Promise<void>

// Called when invoice status changes to 'paid'
export async function scheduleReviewRequestForInvoice(invoiceId: number): Promise<void>

// Called by cron — sends all pending review requests past their scheduledSendAt
export async function dispatchPendingReviewRequests(): Promise<number>

// Internal: check if client is eligible (not opted out, not within cooldown)
async function isClientEligible(clientId: number): Promise<boolean>
```

### Integration Points

1. **`PATCH /api/admin/job-logs/:id`** — when `status` changes to `'completed'`, call `scheduleReviewRequest(jobLogId)`
2. **Invoice payment route** — when `invoices.status` transitions to `'paid'` (in `PATCH /api/admin/invoices/:id/status`), optionally call `scheduleReviewRequestForInvoice(invoiceId)` if `settings.triggerInvoicePaid = true`

### New Email Function: `sendReviewRequestEmail()`

Add to `server/email.ts`:

```typescript
export async function sendReviewRequestEmail(data: {
  recipientEmail: string;
  customerName: string;
  serviceDescription: string;
  jobDate: Date;
  siteLocation: string;
  googleReviewLink: string;
  customMessage?: string;
}): Promise<boolean>
```

---

## Assumptions

1. **Google Review link is current.** The link `https://g.page/r/CXh2r5bK1ZCXEBM/review` is already in the codebase — assume it's valid for Absolute Pest Services' Google Business Profile. Should be verified before launch.
2. **Email deliverability.** Customers have valid, active email addresses. The system skips review requests when `clients.email` is null.
3. **Single-row settings table.** `review_settings` has exactly one row (id = 1). Seeded on first run if missing.
4. **`node-cron` already installed.** Confirmed in `package.json` at `^4.2.1`.
5. **No SMS in Phase 1.** Twilio is not installed; SMS is a Phase 2 concern.
6. **`jobLogs.status = 'completed'`** means the job is done from the technician's perspective, even if not yet invoiced. This is the right trigger point (invoice payment is an optional secondary trigger).
7. **Cron fires in UTC.** Server timezone considerations apply (see SC-REMINDERS-001 open question #1). For an hourly review dispatcher, this is less critical than appointment reminders.
8. **`clients.name`** is the canonical customer name for job log emails. `jobLogs.customerName` is the fallback.
9. **Phase 1 opt-out is admin-only.** No self-service unsubscribe link in Phase 1.

---

## Open Questions

1. **Double-trigger risk (FR-001 vs FR-002):** Should review requests fire on BOTH job completion AND invoice payment, or just one? If both are enabled and a job is completed then invoiced (common flow), the client could receive two review requests for the same visit. **Recommendation:** Default `triggerInvoicePaid = false` and let Mike decide. The 30-day cooldown provides a safety net, but it's better to choose one trigger.

2. **Self-service unsubscribe (Phase 1):** Customer opt-out via admin is acceptable for Phase 1? Or is a footer unsubscribe link required? If the link is needed, it requires a token endpoint (`GET /api/reviews/unsubscribe/:token`).

3. **Review link validity:** Is `https://g.page/r/CXh2r5bK1ZCXEBM/review` still the correct and current Google Review link for Absolute Pest Services? This should be confirmed before going live.

4. **Facebook as alternative destination:** Does the business have a Facebook page with reviews enabled? If so, what's the review URL? This would go in Phase 2 settings.

5. **Subject line:** Which subject line style does Rob prefer? Friendly/casual vs. professional? Options in FR-009.

6. **System settings consolidation:** SC-REMINDERS-001 also needs a settings store. Should both features share a `system_settings` table (key-value), or have dedicated tables (`reminder_settings`, `review_settings`)? Recommendation: dedicated tables for type safety.

7. **Technician-triggered send:** Should field employees be able to trigger a review request directly from the field tablet/app after logging a job? Or is this admin-only? Quick win for same-day sends.

8. **Analytics / reporting:** Should the admin see a "reviews sent" count on the dashboard, alongside a rough estimate of review conversion (hard without Google API)? At minimum, a count of requests sent per month would be useful.

---

## Research Sources

- Codebase: `shared/schema.ts` — job log status values (`completed`, `invoiced`, `paid`), client schema
- Codebase: `server/email.ts` — existing Google Review CTA in `sendServiceRequestStatusUpdate()`, email patterns, SendGrid setup
- Codebase: `server/routes.ts` — `PATCH /api/admin/job-logs/:id` route, invoice state machine integration points
- Codebase: `server/invoiceStateMachine.ts` — invoice status transitions (to identify `paid` trigger point)
- Codebase: `server/index.ts` — existing cron pattern (overdue invoices)
- Codebase: `package.json` — `@sendgrid/mail ^8.1.5`, `node-cron ^4.2.1` confirmed
- Prior art: `SC-REMINDERS-001-requirements.md` — idempotency pattern via `reminder_logs`, same cron+email architecture
- Prior art: `SC-INV-001-requirements.md` — invoice email pattern, settings approach
- Industry best practice: Review request timing 24h post-service is standard in service industries (not same-day, not 72h+)

---

## Recommended Next Steps

1. **Mike:** Answer open questions #1 (double-trigger), #2 (opt-out scope), #3 (confirm Google link), and #7 (field-triggered sends)
2. **Akbar:** Review schema additions (`review_request_logs`, `review_settings`, `clients.review_opt_out`) and architecture for `server/reviews.ts`; decide on system_settings consolidation with SC-REMINDERS-001
3. **Luke:** Implementation after Akbar sign-off
   - Phase 1 estimated complexity: **Medium (3–4 days)**
   - New files: `server/reviews.ts`
   - Modified files: `server/email.ts` (add `sendReviewRequestEmail`), `server/routes.ts` (trigger in job-log patch + new admin endpoints), `server/index.ts` (add cron), `shared/schema.ts` (new tables + `clients.reviewOptOut`)
   - Migration: `npm run db:push` after schema change
4. **Phase 2 scope (after Phase 1 ships):** SMS via Twilio, self-service unsubscribe link, Facebook destination, A/B subject line testing
