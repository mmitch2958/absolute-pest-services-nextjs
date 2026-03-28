# ADR: SC-INV-001 — Invoice Lifecycle Management
**Status:** Proposed  
**Date:** 2026-03-09  
**Author:** Akbar (Principal System Architect, Steel City AI)  
**Related:** `docs/SC-INV-001-requirements.md`, Feature #5

---

## Context

AbsolutePestServices.com needs a full invoice lifecycle system for admin-managed field service billing. The system must support invoice creation (from job logs or manual), a strict state machine (Draft → Sent → Viewed → Paid / Overdue / Void), branded PDF generation, email delivery via SendGrid, customer view tracking, and admin payment recording.

Key constraints:
- Stack is locked: TypeScript, PostgreSQL (Neon), Drizzle ORM, Express, React + Vite
- Existing infrastructure: SendGrid (`server/email.ts`), Cloudinary (`server/cloudinary.ts`), `requireAdmin` middleware, `IStorage` interface pattern
- No customer-facing payment portal in v1 — admin records all payments manually
- Hosting environment unknown (Puppeteer adds ~100MB; pending Mike's answer on Q4)

---

## Decision 1: PDF Generation — Puppeteer vs pdf-lib

### Decision
**Use `@react-pdf/renderer` as the primary recommendation, with `Puppeteer` as fallback if React-PDF proves insufficient for the layout.**

### Rationale
The three candidates:

| Library | Pros | Cons |
|---------|------|------|
| **`@react-pdf/renderer`** | TypeScript-native, JSX-based layout (familiar to Luke), no headless browser, ~2MB, runs in Node | Subset of CSS supported, no HTML import |
| **`Puppeteer`** | Full HTML/CSS fidelity, easy to brand, fastest to develop | ~100MB binary, potential hosting issues (pending Mike Q4), overkill for an invoice |
| **`pdf-lib`** | No dependencies, precise control, tiny | Manual coordinate-based layout — slow to develop, brittle for dynamic content |

`@react-pdf/renderer` hits the sweet spot: branding-capable, no headless browser requirement, familiar JSX syntax, and fast to implement. Luke builds a `<InvoiceDocument />` React component that compiles to PDF server-side.

**If Mike confirms Puppeteer is acceptable on the hosting environment (Q4), switch to Puppeteer — faster to implement complex branding.** The architecture is decoupled enough to swap the generation layer without touching the rest.

### Implementation Pattern
```
server/pdf/
  invoice-template.tsx       # @react-pdf/renderer JSX component
  generate-invoice-pdf.ts    # Generates buffer, uploads to Cloudinary, returns URL
```

PDF is generated on first `send` action (draft → sent transition), stored to Cloudinary, and the `pdfUrl` is persisted on the invoice. Re-generation is available via `POST /api/admin/invoices/:id/pdf/regenerate` (draft state only).

---

## Decision 2: Invoice Number Generation — Collision-Safe Sequential IDs

### Decision
**Use a PostgreSQL sequence per year: `INV-YYYY-NNNN` generated atomically in the database.**

### Rationale
Application-level sequential ID generation is vulnerable to race conditions under concurrent creates. Options:

| Approach | Collision-Safe | Human-Readable | Complexity |
|----------|---------------|----------------|------------|
| App-level `SELECT MAX + 1` | ❌ Race condition | ✅ | Low |
| UUID | ✅ | ❌ | Low |
| **DB sequence (per-year)** | ✅ | ✅ | Medium |
| Advisory lock + MAX+1 | ✅ | ✅ | High |

A named PostgreSQL sequence (`invoice_seq_2026`, `invoice_seq_2027`, etc.) is created per year and incremented atomically via `NEXTVAL`. The sequence is created lazily on first invoice of the year.

```sql
-- Created once per year
CREATE SEQUENCE IF NOT EXISTS invoice_seq_2026 START 1;

-- Used at insert time (in a transaction)
SELECT LPAD(NEXTVAL('invoice_seq_2026')::text, 4, '0')
-- Result: INV-2026-0001
```

Drizzle does not manage sequences natively — this requires a raw SQL helper in `server/storage.ts`:

```typescript
async generateInvoiceNumber(year: number): Promise<string> {
  const seqName = `invoice_seq_${year}`;
  await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS ${sql.identifier(seqName)} START 1`);
  const result = await db.execute(sql`SELECT nextval(${seqName}) as n`);
  const n = String(result.rows[0].n).padStart(4, '0');
  return `INV-${year}-${n}`;
}
```

---

## Decision 3: State Machine — Enforcement Location

### Decision
**Enforce state transitions in the service/storage layer (server-side), not just in API route handlers.**

### Rationale
State transitions must be validated before any side effects (PDF generation, email sending, cron updates). Putting validation in route handlers only risks bypassing on internal calls.

The state machine is encoded as a constant transition map:

```typescript
// server/invoiceStateMachine.ts
export const ALLOWED_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft:   ['sent', 'void'],
  sent:    ['viewed', 'overdue', 'paid', 'void'],
  viewed:  ['overdue', 'paid', 'void'],
  overdue: ['paid', 'void'],
  paid:    [],   // terminal
  void:    [],   // terminal
};

export function assertTransition(from: InvoiceStatus, to: InvoiceStatus): void {
  if (!ALLOWED_TRANSITIONS[from].includes(to)) {
    throw new Error(`Invalid transition: ${from} → ${to}`);
  }
}
```

Every `updateInvoiceStatus()` call invokes `assertTransition()` before writing. The audit log entry is written in the same transaction as the status update.

---

## Decision 4: Overdue Detection — Cron Approach

### Decision
**Use the existing OpenClaw gateway cron (or a simple `node-cron` job in `server/index.ts`) running daily at 06:00 ET to flip `sent`/`viewed` invoices past their due date to `overdue`.**

### Rationale
Real-time overdue detection (DB trigger or websocket) is over-engineered for a daily cron task. Options:

| Approach | Complexity | Reliability | Fits Stack? |
|----------|------------|-------------|-------------|
| **Daily cron in server** | Low | Good (restarts covered by process manager) | ✅ |
| OpenClaw gateway cron | Low | Good (external process) | ✅ |
| DB trigger (pg) | Medium | Excellent | Overkill for v1 |
| Real-time polling | High | Poor | ❌ |

**Recommendation:** `node-cron` in `server/index.ts` (already the Express entry point). If the server restarts, the cron re-registers. The query is idempotent — duplicate runs are safe.

```typescript
// Runs daily at 06:00 ET
cron.schedule('0 6 * * *', async () => {
  await storage.markOverdueInvoices(); // UPDATE invoices SET status='overdue' WHERE ...
}, { timezone: 'America/New_York' });
```

If Mike prefers an external scheduler (Q4 open question overlap), the same `markOverdueInvoices()` storage method is callable via an internal API endpoint.

---

## Decision 5: Customer View Tracking — Token-Based URL

### Decision
**Use UUID v4 `viewToken` stored on the invoice; customer accesses `/api/invoices/view/:token` (no auth required).**

### Rationale
- Token is UUID v4 — 2^122 entropy, effectively unguessable (satisfies NFR-006)
- No login required for customer (satisfies FR-007 / assumption #7)
- Single public endpoint: `GET /api/invoices/view/:token`
  - Returns invoice summary + PDF URL
  - If invoice is `sent`, atomically transitions to `viewed` and sets `viewedAt`
  - Transition is idempotent (second visit does nothing if already `viewed`/`paid`/etc.)
- Token is generated at invoice creation time, never changes, never expires

**Security note:** The view token provides access to invoice data (amounts, services, client name). This is appropriate for a single-party B2C invoice scenario. If PII sensitivity increases, add an expiry or require email confirmation.

---

## Decision 6: PDF Storage — Cloudinary

### Decision
**Store generated PDFs in Cloudinary using the existing `server/cloudinary.ts` integration.**

### Rationale
Cloudinary is already integrated for photo attachments and reports. Reusing it avoids:
- Local disk storage (doesn't scale, lost on dyno restart)
- S3 setup (new credentials, new integration)
- Serving large binaries through Express

PDFs are uploaded with a structured public ID: `invoices/INV-2026-0001.pdf`. The returned secure URL is stored in `invoices.pdfUrl`.

**Fallback:** If Cloudinary is unavailable at generation time, log the error, store PDF locally under `/uploads/invoices/`, and set `pdfUrl` to a relative path. The `GET /api/admin/invoices/:id/pdf` route handles both cases.

---

## Decision 7: Payment Recording — Admin-Only, No Stripe in v1

### Decision
**Payment is recorded manually by admin via `POST /api/admin/invoices/:id/mark-paid` with method, amount, and optional note. No Stripe integration in v1.**

### Rationale
- Absolute Pest Services receives payment by cash, check, and existing Stripe portal — invoice payment is admin-recorded, not customer-initiated
- The existing `payments` table tracks Stripe payment intents for the **customer portal** — separate concern, do not merge (per 3CP0's analysis)
- Future path: if online payment via invoice link is desired (Mike Q1), extend with a new `invoice_payments` table linked to Stripe Payment Intents, using `invoices.viewToken` as the session anchor

---

## Architecture Diagram

```mermaid
graph TB
    subgraph Admin UI
        A[Admin Portal] -->|Create/Edit| B[Invoice API]
        A -->|Send / Mark Paid / Void| B
    end

    subgraph Server
        B[Express: /api/admin/invoices] --> SM[State Machine\nvalidation]
        SM --> ST[Storage Layer\nIStorage]
        ST --> DB[(PostgreSQL\nNeon)]
        ST --> LOG[invoice_status_logs]

        B -->|On Send| PDF[PDF Generator\n@react-pdf/renderer]
        PDF -->|Upload| CDN[Cloudinary]
        PDF -->|pdfUrl| DB

        B -->|On Send| EMAIL[SendGrid\nserver/email.ts]
        EMAIL -->|Invoice email| CUST[Customer]
        EMAIL -->|CC| ROB[rob@absolutepestservices.com]

        CRON[Daily Cron\nnode-cron 06:00 ET] -->|markOverdueInvoices| ST
        CRON -->|On overdue| EMAIL2[SendGrid\nOverdue Email]
    end

    subgraph Public
        CUST -->|Opens view link| VIEW[GET /api/invoices/view/:token]
        VIEW -->|Transition: sent→viewed| ST
        VIEW -->|Returns| INV_DATA[Invoice Summary\n+ PDF URL]
    end
```

---

## Data Model Summary

Three new tables (full schema in `docs/SC-INV-001-requirements.md`):

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `invoices` | Invoice header + state + payment | `invoiceNumber`, `status`, `viewToken`, `pdfUrl`, `total`, `dueDate` |
| `invoice_line_items` | Line items (normalized, not JSONB) | `invoiceId`, `description`, `quantity`, `unitRate`, `taxRate`, `lineTotal` |
| `invoice_status_logs` | Immutable audit trail | `invoiceId`, `fromStatus`, `toStatus`, `actor`, `createdAt` |

**Key constraints:**
- All monetary values: `decimal(10,2)` — no floating point
- `invoiceNumber`: UNIQUE, generated via DB sequence
- `viewToken`: UUID v4, generated at create time, UNIQUE
- `status`: enforced by application state machine (not a DB enum — allows Drizzle migrations without type changes)
- `paid` and `void` are terminal — no DB constraint needed, enforced in `assertTransition()`

---

## Job Log Sync

When invoice status changes, `jobLogs.status` must be kept in sync:

| Invoice Event | jobLog Status |
|--------------|--------------|
| Invoice created from job | `invoiced` |
| Invoice marked `paid` | `paid` |
| Invoice `void` (had job) | `completed` (revert) |

This sync happens inside the same database transaction as the invoice status update to avoid inconsistency.

---

## New Server Files

```
server/
  invoiceStateMachine.ts     # ALLOWED_TRANSITIONS map + assertTransition()
  invoiceService.ts          # Business logic: create, send, markPaid, void, markOverdue
  pdf/
    invoice-template.tsx     # @react-pdf/renderer JSX component
    generate-invoice-pdf.ts  # Generate buffer → upload to Cloudinary → return URL
  routes/
    invoices.ts              # All /api/admin/invoices/* and /api/invoices/view/:token routes
```

Additions to existing files:
- `server/storage.ts` — new IStorage methods (per SC-INV-001-requirements.md §Storage Layer)
- `server/email.ts` — `sendInvoiceEmail()`, `sendInvoiceOverdueEmail()`, `sendPaymentConfirmationEmail()`
- `server/index.ts` — cron job registration
- `shared/schema.ts` — three new Drizzle table definitions + Zod schemas + TypeScript types

---

## Open Questions Requiring Mike's Input

These block implementation decisions:

| # | Question | Architecture Impact |
|---|----------|-------------------|
| Q1 | Online payment via invoice? | If yes: add Stripe Payment Intent flow to view endpoint; new `invoice_payments` table |
| Q2 | Partial payments? | If yes: significant data model change — `invoice_payments` ledger, balance calculation |
| Q3 | Payment confirmation email? | Low impact — just add `sendPaymentConfirmationEmail()` call in `markPaid` |
| Q4 | Puppeteer acceptable? | Changes PDF library selection (Decision 1) |
| Q5 | Multi-job invoices? | If yes: `invoices` needs M:M to `job_logs` (new join table) |
| Q6 | Edit after sending? | If yes: add re-send flow; version tracking on PDF |
| Q7 | Recurring invoices? | Separate feature — out of scope for this ADR |
| Q8 | EIN on PDF? | Minor PDF template addition — no architecture impact |

**Recommendation:** Proceed with implementation using current assumptions (Q1=No, Q2=No, Q4=React-PDF). Q5 and Q6 are the highest-risk answers — if yes, revisit data model before Luke starts schema work.

---

## Consequences

**Positive:**
- Strict state machine prevents illegal transitions at the service layer
- Audit log provides complete invoice history for disputes and reporting
- PDF generation decoupled from delivery — can be regenerated independently
- Token-based view tracking requires no customer account
- Existing SendGrid and Cloudinary integrations reused — no new infrastructure

**Tradeoffs / Risks:**
- `@react-pdf/renderer` has a CSS subset — complex layouts may require workarounds. Mitigation: spike the PDF template early (Day 1 of implementation)
- Neon serverless driver cold starts could affect daily cron latency — not a user-facing concern
- Job log status sync is in-transaction — if job log update fails, invoice update rolls back. This is correct behavior but Luke must handle the transaction boundary explicitly
- No partial payment support in v1 — if Rob records a partial payment today, there's no system for it. Risk: low for v1, but document clearly

---

## Related Documents

- `docs/SC-INV-001-requirements.md` — full requirements, data model, API contracts, email specs
- `ARCHITECTURE.md` — stack constraints and project structure
- `docs/ADR-003-users-clients-link.md` — client data model (FK dependency)
- Feature #5 (original product brief)
