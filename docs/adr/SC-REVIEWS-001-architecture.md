# ADR SC-REVIEWS-001: Review Request Automation

**Status:** Proposed  
**Date:** 2026-03-09  
**Author:** Akbar (System Architect)  
**Context Doc:** `docs/SC-REVIEWS-001-requirements.md`

---

## Context

AbsolutePestServices.com needs an automated post-service review request flow to boost Google Reviews with minimal manual effort. The existing email infrastructure (SendGrid, `server/email.ts`) and cron pattern (`node-cron`) are already in place. A Google Review CTA exists buried inside `sendServiceRequestStatusUpdate()` but there is no dedicated review request workflow, idempotency tracking, or admin controls.

---

## Decision 1: Trigger Strategy — Job Completion Only (Default)

**Decision:** Default to `triggerJobCompletion = true` and `triggerInvoicePaid = false`. Both triggers are configurable but the invoice trigger ships disabled.

**Rationale:**
- Double-send risk: the `jobLog.completed → invoiced → paid` state machine commonly fires both triggers for the same visit. Sending two review requests to a customer is a worse outcome than sending none.
- Job completion is the most semantically meaningful moment — the service was delivered.
- The 30-day cooldown (FR-006) provides a safety net regardless of setting, but defaulting one trigger off is cleaner.
- Mike can enable the invoice trigger independently via admin settings.

**Alternatives Considered:**
- **Invoice paid only:** Aligns with payment confirmation UX, but delays the request and skips non-invoiced jobs.
- **Both always on:** Highest review volume potential, but double-send risk is unacceptable without deduplication by `(clientId, jobLogId)` — which the `review_request_logs` UNIQUE constraint on `job_log_id` handles, but only partially (invoice still fires if job log request was already sent).

---

## Decision 2: Dispatch Architecture — Cron + `review_request_logs` Queue

**Decision:** Use the existing `node-cron` pattern. Triggers write a `pending` row to `review_request_logs` with a `scheduled_send_at` (trigger time + configurable delay). An hourly cron flushes all due rows.

**Module:** New `server/reviews.ts` with:
- `scheduleReviewRequest(jobLogId)` — called from job-log PATCH route
- `scheduleReviewRequestForInvoice(invoiceId)` — called from invoice status machine
- `dispatchPendingReviewRequests()` — called by cron
- `isClientEligible(clientId)` — checks opt-out + 30-day cooldown + yearly cap

**Cron schedule:**
```typescript
cron.schedule("0 * * * *", async () => {
  const count = await dispatchPendingReviewRequests();
  if (count > 0) console.log(`[ReviewRequests] Sent ${count} review request emails`);
});
```

**Rationale:**
- Consistent with the established `SC-REMINDERS-001` pattern using `reminder_logs` — Luke already knows this model.
- Hourly cron is sufficient granularity for a 24h default delay.
- The queue approach supports delay, retry, cancellation (void invoice before delay fires), and audit without a job queue dependency.

**Alternatives Considered:**
- **Immediate send on trigger:** No delay support, no retry, no cancellation window.
- **BullMQ / Redis job queue:** Full-featured but introduces Redis dependency that does not exist in the current stack. Overkill for this volume.

---

## Decision 3: Anti-Spam Controls — Three-Layer Guard

**Decision:** Implement three independent spam guards, all enforced server-side in `isClientEligible()`:

1. **Per-entity idempotency:** `UNIQUE(job_log_id)` and `UNIQUE(invoice_id)` on `review_request_logs` — one request per job/invoice, enforced at DB level.
2. **30-day rolling cooldown per client:** Query `review_request_logs WHERE clientId = ? AND status = 'sent' AND sentAt > NOW() - INTERVAL '30 days'`.
3. **6 per year hard cap:** Query `review_request_logs WHERE clientId = ? AND status = 'sent' AND sentAt > NOW() - INTERVAL '1 year'`.

**Opt-out:** `clients.review_opt_out` boolean checked first; any `true` value short-circuits all guards.

**Rationale:** Defense in depth. Each layer catches a distinct case. The UNIQUE constraint is the last line of defense against race conditions in a horizontal deployment.

---

## Decision 4: Settings Storage — Dedicated `review_settings` Table

**Decision:** Use a dedicated single-row `review_settings` table, NOT a generic key-value `system_settings` table.

**Rationale:**
- Type safety: Drizzle ORM enforces types per column. A key-value store requires runtime casting.
- Discoverability: Schema in `shared/schema.ts` is self-documenting.
- `SC-REMINDERS-001` uses the same pattern (separate settings tables). Keep consistency.
- Joins are never needed between review settings and reminder settings.

**Schema:**
```typescript
export const reviewSettings = pgTable("review_settings", {
  id: serial("id").primaryKey(),
  enabled: boolean("enabled").default(true).notNull(),
  delayHours: integer("delay_hours").default(24).notNull(),
  googleReviewLink: text("google_review_link").notNull()
    .default("https://share.google/XItMnkLq28EfiM2KH"),
  facebookReviewLink: text("facebook_review_link"),
  cooldownDays: integer("cooldown_days").default(30).notNull(),
  triggerJobCompletion: boolean("trigger_job_completion").default(true).notNull(),
  triggerInvoicePaid: boolean("trigger_invoice_paid").default(false).notNull(),
  customMessage: text("custom_message"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

**Seed:** Single row (id = 1) created on first server start if absent.

---

## Decision 5: Phase 1 Opt-Out — Admin-Managed Only

**Decision:** Phase 1 ships with admin-only opt-out (`clients.review_opt_out`). No self-service unsubscribe link in Phase 1.

**Rationale:**
- Self-service unsubscribe requires a token endpoint, token generation/storage, a confirmation page, and unsubscribe email footer. Non-trivial scope.
- Volume of review requests at this scale (one pest control company) means admin-managed opt-out is operationally adequate.
- CAN-SPAM does not legally require an opt-out mechanism for transactional/relationship emails (review requests fall into a gray area for a service provider). However, Phase 2 should add self-service.

**Phase 2 Path:** Token-based unsubscribe link in email footer → `GET /api/reviews/unsubscribe/:token` → flips `clients.review_opt_out = true` → confirmation page.

---

## Schema Summary

| Change | Details |
|--------|---------|
| New table `review_request_logs` | Queue + audit; `UNIQUE(job_log_id)`, `UNIQUE(invoice_id)`; index on `(status, scheduled_send_at)` |
| New table `review_settings` | Single-row config; seeded on startup |
| Modify `clients` | Add `review_opt_out boolean DEFAULT false NOT NULL` |

---

## API Surface

```
GET  /api/admin/reviews/settings
PATCH /api/admin/reviews/settings
GET  /api/admin/reviews/logs?limit&offset&status&clientId
POST /api/admin/reviews/send-now/:jobLogId
DELETE /api/admin/reviews/logs/:id
PATCH /api/admin/clients/:id/review-opt-out
```

All endpoints require `requireAdmin` middleware.

---

## Integration Points

| Trigger Location | File | Action |
|-----------------|------|--------|
| Job log completion | `server/routes.ts` → `PATCH /api/admin/job-logs/:id` | Call `scheduleReviewRequest(jobLogId)` when `status → 'completed'` |
| Invoice paid | `server/invoiceStateMachine.ts` | Call `scheduleReviewRequestForInvoice(invoiceId)` when `status → 'paid'` AND `settings.triggerInvoicePaid = true` |
| Hourly dispatch | `server/index.ts` | `cron.schedule("0 * * * *", dispatchPendingReviewRequests)` |

---

## Consequences

**Positive:**
- Zero new infrastructure dependencies — purely additive to existing stack.
- Consistent with SC-REMINDERS-001 patterns Luke already implemented.
- Admin has full control and audit visibility.
- Retry logic (up to 3 attempts) makes it resilient to transient SendGrid failures.

**Tradeoffs/Risks:**
- Hourly cron granularity means ±1 hour accuracy on delivery time. Acceptable for review requests.
- Single-row settings table requires a DB seed on startup; must guard against race conditions on first deploy.
- Google Review link is hard-coded in codebase — must be verified before launch (FR-003 open question).

---

## Open Items for Mike

1. Confirm: fire on job completion only, or also invoice payment? (Recommendation: job completion only, default)
2. Is admin-only opt-out acceptable for Phase 1?
3. ✅ Verify Google Review link: `https://share.google/XItMnkLq28EfiM2KH` (confirmed by Mike)

---

## Related

- `docs/SC-REVIEWS-001-requirements.md`
- `docs/SC-REMINDERS-001-requirements.md` (same cron+queue pattern)
- `docs/adr/SC-REMINDERS-001-architecture.md`
