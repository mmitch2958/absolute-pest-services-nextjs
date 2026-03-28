# Feature #5 — Invoice Management Requirements
**Project:** AbsolutePestServices.com  
**Prepared by:** 3CP0 (Research/Product Agent)  
**Date:** 2026-03-09  
**Status:** Draft — Pending Mike Review

---

## Overview

Admin users need a full invoice lifecycle system: create invoices from completed job logs (or manually), track them through a defined state machine, generate branded PDFs, deliver them to customers via email, and record payment.

This document defines the data model, state machine, API endpoints, PDF requirements, email triggers, and open questions for Akbar and Luke.

---

## Functional Requirements

### FR-001 — Invoice Creation
- Admin can generate an invoice automatically from one or more completed `jobLogs` records
- Admin can create an invoice manually (not tied to a job log)
- Invoice must be associated with a `clients` record
- Invoice must support one or more line items (service, quantity, rate, tax)
- Invoice must auto-calculate subtotal, tax total, and grand total
- Invoice number must be auto-generated (sequential, human-readable, e.g. `INV-2026-0001`)

### FR-002 — Invoice State Machine
Invoices follow a strict state machine (see §State Machine below). Only allowed transitions are permitted.

### FR-003 — Line Items
- Each line item has: description, quantity, unit rate, tax rate (%), line total
- Multiple line items per invoice
- Line items stored in a separate `invoice_line_items` table (not JSONB) for queryability
- Admin can add, edit, remove line items while invoice is in `draft` state only

### FR-004 — PDF Generation
- Server-side PDF generation (not client-side jspdf) — see §PDF Requirements
- PDF must be branded with Absolute Pest Services logo, colors, and contact info
- PDF stored and served via URL (Cloudinary or local `/uploads`)
- PDF regenerated on-demand or when invoice data changes (while still in `draft`)

### FR-005 — Email Delivery
- Admin clicks "Send Invoice" → transitions invoice to `sent` state → email sent to customer
- Email contains: invoice summary, due date, PDF attachment or download link
- Customer email address sourced from linked `clients.email`
- Business notification sent to `rob@absolutepestservices.com` (existing pattern)
- All email via SendGrid (existing `server/email.ts` infrastructure)

### FR-006 — Viewed Tracking
- When customer opens the invoice email link/PDF URL, status transitions to `viewed`
- Implemented via a tracking pixel or unique token URL (e.g. `/api/invoices/:token/view`)
- No login required for customer to view invoice

### FR-007 — Payment Tracking
- Admin can mark invoice as `paid` from admin portal
- Record: payment method (cash, check, credit card, Stripe, other), amount paid, payment date
- Partial payments are **out of scope** for v1 (see Open Questions)
- Overpayment should be flagged but allowed (with warning)

### FR-008 — Overdue Handling
- A scheduled job (cron) checks invoices daily: if `due_date` has passed and status is `sent` or `viewed`, transition to `overdue`
- Admin should see overdue invoices highlighted in the UI

### FR-009 — Void
- Admin can void any invoice in `draft`, `sent`, `viewed`, or `overdue` state
- Void is permanent and irreversible
- Void reason (optional text) should be recorded in the audit log

### FR-010 — Audit Log / History
- Every status change is recorded with: previous state, new state, actor (admin user ID or "system"), timestamp, and optional note
- Stored in `invoice_status_logs` table
- Accessible in admin UI as a collapsible timeline on the invoice detail view

### FR-011 — Invoice Listing & Filtering
- Admin can list all invoices with filters: client, status, date range
- Sorting by: invoice number, date, amount, due date, status
- Summary stats: total outstanding, total overdue, total paid (this month / all time)

---

## Non-Functional Requirements

- **NFR-001:** Invoice number must be unique and collision-safe across concurrent creates
- **NFR-002:** PDF generation must complete within 5 seconds for a typical invoice (≤20 line items)
- **NFR-003:** Email delivery failure must not block the status transition — log failure and allow retry
- **NFR-004:** All monetary values stored as `decimal(10,2)` — no floating point
- **NFR-005:** All invoice data must be soft-deletable (void), never hard-deleted
- **NFR-006:** Invoice view tracking token must be unguessable (UUID v4 minimum)
- **NFR-007:** API routes follow existing `/api/admin/*` pattern and are protected by `requireAdmin` middleware

---

## Data Model

### Table: `invoices`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `serial` PK | |
| `invoiceNumber` | `varchar(20)` NOT NULL UNIQUE | e.g. `INV-2026-0001` |
| `clientId` | `integer` FK → `clients.id` | NOT NULL |
| `jobLogId` | `integer` FK → `job_logs.id` | nullable — null for manual invoices |
| `status` | `text` NOT NULL | enum: `draft`, `sent`, `viewed`, `paid`, `overdue`, `void` |
| `issueDate` | `timestamp` NOT NULL | defaults to now |
| `dueDate` | `timestamp` NOT NULL | required — admin sets |
| `subtotal` | `decimal(10,2)` NOT NULL | sum of line item totals before tax |
| `taxTotal` | `decimal(10,2)` NOT NULL DEFAULT 0 | sum of all line item taxes |
| `total` | `decimal(10,2)` NOT NULL | subtotal + taxTotal |
| `notes` | `text` | optional — printed on invoice |
| `pdfUrl` | `text` | URL to generated PDF (Cloudinary or local) |
| `viewToken` | `varchar(36)` UNIQUE | UUID v4 for customer view tracking |
| `sentAt` | `timestamp` | when invoice was first emailed |
| `viewedAt` | `timestamp` | when customer first viewed |
| `paidAt` | `timestamp` | when marked as paid |
| `paymentMethod` | `text` | cash, check, card, stripe, other |
| `paymentAmount` | `decimal(10,2)` | amount recorded as paid |
| `paymentNote` | `text` | optional payment reference/note |
| `voidReason` | `text` | required if status = void (nullable otherwise) |
| `createdBy` | `integer` FK → `users.id` | admin who created |
| `createdAt` | `timestamp` NOT NULL DEFAULT now() | |
| `updatedAt` | `timestamp` NOT NULL DEFAULT now() | |

### Table: `invoice_line_items`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `serial` PK | |
| `invoiceId` | `integer` FK → `invoices.id` ON DELETE CASCADE | NOT NULL |
| `description` | `text` NOT NULL | service description |
| `quantity` | `decimal(10,3)` NOT NULL DEFAULT 1 | supports fractional qty |
| `unitRate` | `decimal(10,2)` NOT NULL | price per unit |
| `taxRate` | `decimal(5,2)` NOT NULL DEFAULT 0 | percentage, e.g. 6.00 = 6% |
| `lineTotal` | `decimal(10,2)` NOT NULL | computed: quantity × unitRate |
| `lineTax` | `decimal(10,2)` NOT NULL DEFAULT 0 | computed: lineTotal × (taxRate/100) |
| `sortOrder` | `integer` NOT NULL DEFAULT 0 | display order |
| `createdAt` | `timestamp` NOT NULL DEFAULT now() | |

### Table: `invoice_status_logs`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `serial` PK | |
| `invoiceId` | `integer` FK → `invoices.id` ON DELETE CASCADE | NOT NULL |
| `fromStatus` | `text` | nullable for initial creation |
| `toStatus` | `text` NOT NULL | |
| `actor` | `text` NOT NULL | `admin:{userId}` or `system` or `customer` |
| `note` | `text` | optional admin/system note |
| `createdAt` | `timestamp` NOT NULL DEFAULT now() | |

---

## State Machine

```
                    ┌──────────┐
              ┌────►│  DRAFT   │◄────────────────────────┐
              │     └────┬─────┘                          │
              │          │ Admin: Send Invoice             │ Admin: Edit (stays draft)
              │          ▼                                 │
              │     ┌──────────┐                          │
              │     │   SENT   │                          │
              │     └────┬─────┘                          │
              │          │ Customer: Opens link            │
              │          ▼                                 │
              │     ┌──────────┐                          │
              │     │  VIEWED  │                          │
              │     └────┬─────┘                          │
              │          │ Admin: Mark Paid                │
              │          ▼                                 │
              │     ┌──────────┐                          │
              │     │   PAID   │ ◄── (terminal — no exit) │
              │     └──────────┘                          │
              │                                            │
              │  Cron: due_date passed + status ∈          │
              │  {sent, viewed}                            │
              │          ▼                                 │
              │     ┌──────────┐                          │
              │     │ OVERDUE  │                          │
              │     └────┬─────┘                          │
              │          │ Admin: Mark Paid                │
              │          ▼                                 │
              │     ┌──────────┐                          │
              │     │   PAID   │                          │
              │     └──────────┘                          │
              │                                            │
              │  Admin: Void (from any non-paid state)     │
              │          ▼                                 │
              │     ┌──────────┐                          │
              └─────│   VOID   │ (terminal — no exit)     │
                    └──────────┘                          │
```

### Allowed Transitions

| From | To | Trigger | Actor |
|------|----|---------|-------|
| — | `draft` | Invoice created | admin |
| `draft` | `sent` | Admin sends invoice | admin |
| `sent` | `viewed` | Customer opens view link | system/customer |
| `sent` | `overdue` | Due date passed (cron) | system |
| `viewed` | `overdue` | Due date passed (cron) | system |
| `sent` | `paid` | Admin marks paid | admin |
| `viewed` | `paid` | Admin marks paid | admin |
| `overdue` | `paid` | Admin marks paid | admin |
| `draft` | `void` | Admin voids | admin |
| `sent` | `void` | Admin voids | admin |
| `viewed` | `void` | Admin voids | admin |
| `overdue` | `void` | Admin voids | admin |

> `paid` and `void` are terminal states. No transitions out.

---

## API Endpoints

All routes under `/api/admin/invoices` — protected by `requireAdmin` middleware.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/invoices` | List all invoices (supports query params: `status`, `clientId`, `from`, `to`, `page`, `limit`) |
| `GET` | `/api/admin/invoices/stats` | Summary stats: outstanding, overdue, paid-this-month totals |
| `GET` | `/api/admin/invoices/:id` | Get single invoice with line items + status log |
| `POST` | `/api/admin/invoices` | Create new invoice (draft) |
| `PUT` | `/api/admin/invoices/:id` | Update invoice (draft only — header fields + line items) |
| `POST` | `/api/admin/invoices/:id/send` | Send invoice to customer (draft → sent) |
| `POST` | `/api/admin/invoices/:id/mark-paid` | Mark as paid (sent/viewed/overdue → paid) |
| `POST` | `/api/admin/invoices/:id/void` | Void invoice (any non-terminal state → void) |
| `GET` | `/api/admin/invoices/:id/pdf` | Download generated PDF |
| `POST` | `/api/admin/invoices/:id/pdf/regenerate` | Force regenerate PDF |
| `GET` | `/api/admin/invoices/:id/log` | Get status log entries for an invoice |
| `POST` | `/api/admin/invoices/from-job/:jobLogId` | Create invoice pre-populated from a job log |

**Public (no auth — customer view tracking):**

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/invoices/view/:token` | Customer views invoice — triggers `sent → viewed` if applicable; returns invoice details + PDF URL |

---

## PDF Requirements

### Technology
- **Server-side generation** using [`pdf-lib`](https://pdf-lib.js.org/) or [`puppeteer`](https://pptr.dev/) rendering an HTML template to PDF
- Rationale: client-side `jspdf` (existing) lacks fidelity for complex layouts; invoices must be printable server-side for email attachment
- **Recommendation (opinion):** `puppeteer` + HTML template is faster to develop and easier to brand correctly. `pdf-lib` gives more programmatic control but requires more layout code. Present this choice to Akbar.
- PDF stored to Cloudinary (existing `server/cloudinary.ts` integration)

### PDF Content Requirements

**Header Section:**
- Absolute Pest Services logo (top-left)
- Company name, address, phone, email (top-right or beside logo)
- "INVOICE" title prominently displayed
- Invoice number, issue date, due date

**Bill To Section:**
- Client name, address, email, phone
- Linked job log reference (if applicable)

**Line Items Table:**
| # | Description | Qty | Unit Rate | Tax % | Line Total |
| Each column right-aligned for numbers |
- Subtotal row
- Tax total row
- **Grand Total** (bold, larger font)

**Footer Section:**
- Payment instructions / notes
- Company tagline (optional)
- Page number if multi-page

**Branding:**
- Primary color: yellow/gold (`#eab308`) — matches existing site theme
- Dark accent: `#1f2937`
- Font: clean sans-serif (Arial or Helvetica for PDF compatibility)
- "PAID" watermark (diagonal, green, semi-transparent) when status = `paid`
- "VOID" watermark (diagonal, red, semi-transparent) when status = `void`
- "OVERDUE" stamp (red box, top-right) when status = `overdue`

---

## Email Triggers

All emails via `server/email.ts` + SendGrid (existing infrastructure).

### Trigger 1: Invoice Sent
- **When:** Admin sends invoice (`draft → sent`)
- **To:** `client.email` (customer)
- **CC/BCC:** `rob@absolutepestservices.com` (business notification)
- **Subject:** `Invoice #INV-YYYY-NNNN from Absolute Pest Services`
- **Body:**
  - Invoice summary (number, date, due date, total)
  - CTA button: "View Invoice" → `/api/invoices/view/:token`
  - PDF attached (or linked if attachment causes deliverability issues)
  - Payment instructions

### Trigger 2: Invoice Overdue (automated)
- **When:** Cron job transitions invoice to `overdue`
- **To:** `client.email`
- **Subject:** `OVERDUE: Invoice #INV-YYYY-NNNN — Action Required`
- **Body:**
  - Overdue notice
  - Original due date
  - Outstanding amount
  - CTA: "View & Pay Invoice"

### Trigger 3: Payment Recorded (optional — see Open Questions)
- **When:** Admin marks invoice as `paid`
- **To:** `client.email`
- **Subject:** `Payment Received — Invoice #INV-YYYY-NNNN`
- **Body:** Confirmation of payment receipt, amount, date

### New Function to Add to `server/email.ts`
```typescript
sendInvoiceEmail(data: {
  clientEmail: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  total: string;
  viewToken: string;
  pdfUrl?: string;
}): Promise<boolean>

sendInvoiceOverdueEmail(data: {
  clientEmail: string;
  clientName: string;
  invoiceNumber: string;
  dueDate: Date;
  total: string;
  viewToken: string;
}): Promise<boolean>

sendPaymentConfirmationEmail(data: {
  clientEmail: string;
  clientName: string;
  invoiceNumber: string;
  amountPaid: string;
  paidAt: Date;
}): Promise<boolean>
```

---

## Integration with Existing System

### Job Log Integration
- `jobLogs.status` currently includes `invoiced` and `paid` values — these must be kept in sync
- When an invoice is created from a job log: set `jobLogs.status = 'invoiced'`
- When an invoice is marked paid: set `jobLogs.status = 'paid'`
- When an invoice is voided: revert `jobLogs.status = 'completed'`

### Existing Payments Table
- The existing `payments` table (`server/schema.ts`) tracks Stripe payment intents for the **customer portal**
- The new invoice `paymentMethod`/`paymentAmount` fields handle **admin-recorded payments** (cash, check, manual)
- These are **separate concerns** — do not merge
- Flag for Akbar: If Stripe online payment via invoice link is desired in the future, the `payments` table would be the right extension point

### Storage Layer (IStorage)
New methods needed in `IStorage` interface and `DatabaseStorage` class:

```typescript
// Invoices
createInvoice(data: InsertInvoice): Promise<Invoice>
getInvoice(id: number): Promise<Invoice | undefined>
getInvoiceByToken(token: string): Promise<Invoice | undefined>
listInvoices(filters: InvoiceFilters): Promise<Invoice[]>
updateInvoice(id: number, data: Partial<Invoice>): Promise<Invoice>
getInvoiceStats(): Promise<InvoiceStats>

// Line Items
createLineItem(data: InsertInvoiceLineItem): Promise<InvoiceLineItem>
updateLineItem(id: number, data: Partial<InvoiceLineItem>): Promise<InvoiceLineItem>
deleteLineItem(id: number): Promise<void>
getLineItemsByInvoice(invoiceId: number): Promise<InvoiceLineItem[]>

// Status Log
logInvoiceStatusChange(data: InsertInvoiceStatusLog): Promise<InvoiceStatusLog>
getInvoiceStatusLog(invoiceId: number): Promise<InvoiceStatusLog[]>
```

---

## Assumptions

1. Tax is applied per line item, not at invoice level — allows mixed taxable/non-taxable services
2. Pennsylvania sales tax rate (6%) is a default, but admin can set per-line item
3. Invoice numbers reset at the start of each year (e.g., `INV-2026-0001`)
4. There is no customer-facing payment portal in v1 — payments are recorded manually by admin
5. PDF generation is triggered on first `send` action; stored in Cloudinary thereafter
6. Overdue cron runs once per day (midnight or early AM) — not real-time
7. Customers do not need a login to view their invoice (token-based public URL)

---

## Open Questions

> Items requiring Mike's input before Akbar/Luke proceed

1. **Online payment via invoice?** Should the customer-facing invoice view include a "Pay Now" Stripe button, or is payment always recorded manually by admin in v1?
2. **Partial payments?** Should the system support partial payments (e.g., $50 deposit recorded, $150 balance remaining)?
3. **Payment confirmation email?** Should a payment receipt email go to the customer when admin records payment, or only track internally?
4. **PDF library choice:** `puppeteer` (HTML → PDF, easier branding) vs `pdf-lib` (programmatic, no headless browser). Puppeteer adds ~100MB to deployment; is that acceptable on the current hosting setup?
5. **Multi-job invoices?** Can one invoice reference multiple job logs for the same client (e.g., end-of-month billing), or is it always 1 invoice per job?
6. **Invoice editing after sending?** If admin needs to correct a sent invoice (e.g., wrong amount), should the flow be: void + recreate, or allow edit + re-send with version note?
7. **Recurring invoices?** Is automated recurring invoice generation (tied to `serviceContracts`) in scope for v1, or a later feature?
8. **Tax ID / EIN on PDF?** Should the invoice PDF include the company's EIN or PA contractor license number?

---

## Research Sources
- Existing codebase: `shared/schema.ts`, `server/email.ts`, `server/cloudinary.ts`, `ARCHITECTURE.md`
- Existing field service patterns in `jobLogs.status` (invoiced/paid values already present)
- Industry standard invoice state machines (FreshBooks, QuickBooks, Wave patterns)
- SendGrid best practices for transactional invoice delivery

---

## Recommended Next Steps

1. **Mike:** Review Open Questions (#1–#8) — answers unblock Akbar and Luke
2. **Akbar:** Review PDF library recommendation (Q4) and integration with existing Cloudinary setup; confirm overdue cron approach (standalone vs. using existing gateway cron)
3. **Luke:** This document is the implementation spec — begin with schema additions to `shared/schema.ts`, then storage layer, then API routes, then PDF generation, then email integration
4. **Priority order for Luke:** Schema → Storage → API → PDF → Email → Frontend UI
