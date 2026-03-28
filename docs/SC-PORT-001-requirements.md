# SC-PORT-001: Customer Self-Service Portal Requirements

**Feature:** #9 — Customer Self-Service Portal  
**Project:** AbsolutePestServices.com  
**Prepared by:** 3CP0 (Research/Product Agent)  
**Date:** 2026-03-09  
**Status:** Draft — Pending Mike Review

---

## Overview

The Customer Self-Service Portal gives registered customers a dedicated authenticated web interface to manage their relationship with Absolute Pest Services — without needing to call or email. It extends the existing `/dashboard` route (which currently shows service requests, inspections, and payments) into a full-featured portal.

**Business value:** Reduces inbound admin calls, improves customer retention through transparency, and creates a professional touchpoint that differentiates Absolute Pest Services from competitors.

**Scope note:** This portal is for *logged-in customers* (the `users` table with `role = 'user'`). It is distinct from the Admin portal (`/admin/*`) and the Field Service portal (`/field/*`).

---

## User Roles in Scope

| Role | Description | Access |
|------|-------------|--------|
| **Customer** | Registered user (`role = 'user'`) | Portal UI — full self-service |
| **Admin** | Admin user (`role = 'admin'`) | Sees/responds to customer activity in admin portal |
| **System** | Automated processes | Sends notifications, updates statuses |

---

## Portal Modules

The portal consists of five functional modules:

1. **Appointment History** — View past and upcoming service visits
2. **Schedule New Appointment** — Request a new inspection or service
3. **Pay Invoices** — View and pay outstanding invoices
4. **Request Service** — Submit a general service request with details
5. **Communication with Admin** — Message thread between customer and admin

---

## Functional Requirements

### MODULE 1: Appointment History

#### FR-001 — View Appointment List
- Customer can view a chronological list of all appointments associated with their account
- Appointments include: inspection schedules (`inspectionSchedules` table) and service requests (`serviceRequests` table)
- Each appointment displays: service type, date, address, status, and technician notes (if available)
- List is paginated (default 10/page) and sorted most-recent first

#### FR-002 — Appointment Detail View
- Customer can click any appointment to view full details
- Detail view shows: all form fields from the original request + status timeline + any technician notes
- For completed visits: shows completion date, final cost (if recorded), and any service notes

#### FR-003 — Appointment Status Indicators
- Clear visual status labels: Pending, Scheduled, In Progress, Completed, Cancelled
- Status must reflect the current admin-assigned value from the database
- Customer cannot change status — read-only

#### FR-004 — Filter and Search
- Customer can filter appointments by: status, date range, service type
- Customer can search by address or service description
- Filters are applied client-side (no new API endpoints required for filtering if data is pre-loaded)

#### FR-005 — Appointment Count / Summary
- Dashboard home shows summary cards: "Upcoming Appointments," "Completed This Year," "Open Requests"

---

### MODULE 2: Schedule New Appointment

#### FR-006 — Inspection Request Form
- Customer can submit a new inspection request via a guided form
- Fields required: service type (dropdown), preferred date (date picker), preferred time (select: morning/afternoon/evening), urgency (low/medium/urgent), address (pre-filled from profile, editable), optional message
- On submit: creates a record in `inspectionSchedules` linked to the customer's `userId`
- Confirmation displayed on screen + confirmation email sent to customer

#### FR-007 — Service Type Selection
- Service types match the existing options on the public-facing form: Pest Control, Wildlife Removal, Termite Treatment, Bed Bug Treatment, Bat Removal, General Inspection, Other
- Service type list should be consistent with `serviceRequests.serviceType` values

#### FR-008 — Address Pre-fill
- Address field pre-fills from the user's profile address (`users.address`)
- Customer can override for a different service location

#### FR-009 — Scheduling Constraints
- Customer cannot book dates in the past
- Minimum lead time: 1 business day (flag for Mike — see Open Questions Q1)
- Customer receives in-portal confirmation and email confirmation upon submission

#### FR-010 — Admin Notification
- When a new appointment request is submitted via the portal, an email notification is sent to `rob@absolutepestservices.com` (consistent with existing contact form pattern)
- Email includes: customer name, phone, service type, preferred date/time, address

---

### MODULE 3: Pay Invoices

#### FR-011 — Invoice List View
- Customer can view all invoices associated with their account
- Displayed columns: Invoice #, Issue Date, Due Date, Amount, Status
- Status values visible to customer: Pending (sent/viewed), Paid, Overdue
  - Note: `draft` and `void` invoices are **not shown** to customers
- List sorted: Overdue first, then Pending by due date, then Paid (most recent first)

#### FR-012 — Invoice Detail View
- Customer can click any invoice to view full detail
- Detail shows: line items with descriptions, subtotal, tax, grand total, due date, notes
- "Download PDF" button available for sent/viewed/paid invoices

#### FR-013 — Invoice View Tracking
- When a customer views an invoice detail for the first time (while status is `sent`), the system transitions invoice status to `viewed` automatically
- Uses the `viewToken` from the invoice record (token-based public URL pattern from Feature #5)
- No additional authentication required once the customer is logged into the portal

#### FR-014 — Online Payment
- Customer can pay outstanding invoices (status: `sent`, `viewed`, `overdue`) via Stripe
- Payment flow uses the existing `payments` table + Stripe payment intent pattern
- On successful payment: invoice status transitions to `paid`, payment recorded in both `payments` and `invoices.paymentMethod`/`paymentAmount`
- **DECISION REQUIRED:** See Open Questions Q2 — online payment may be a v2 feature
- **Fallback (if Stripe deferred):** Show payment instructions (check/cash) and business phone number with "Contact us to arrange payment" CTA

#### FR-015 — Payment Confirmation
- After successful payment (if Stripe enabled): show confirmation screen + send receipt email
- Email receipt goes to customer email address on file

#### FR-016 — Outstanding Balance Summary
- Dashboard home shows: total amount currently outstanding across all unpaid invoices
- Highlighted in amber/red if any invoices are overdue

---

### MODULE 4: Request Service

#### FR-017 — Service Request Form
- Customer can submit a detailed service request (different from "schedule appointment" — this is for non-emergency follow-up, recurring issues, or specific concerns)
- Fields: service type, description (textarea, 2000 char max), address, priority (low/medium/urgent), optional attachments (photo of pest, damage)
- On submit: creates a record in `serviceRequests` linked to `userId`

#### FR-018 — Request Tracking
- Submitted requests appear in the customer's appointment history (merged view with inspection schedules)
- Status updates are visible as admin updates them in the admin portal
- Customer receives email notification when status changes (e.g., when admin schedules the visit)

#### FR-019 — Duplicate Prevention
- System warns customer if they already have an open/pending service request of the same type at the same address
- Warning is advisory only — customer can still submit

#### FR-020 — Photo Attachments (Optional)
- Customer can attach up to 3 photos with a service request (max 5MB each, JPEG/PNG/HEIC)
- Uploaded to Cloudinary (existing `server/cloudinary.ts` integration)
- Photos visible to admin in service request detail view
- **DECISION REQUIRED:** See Open Questions Q3 — photo upload scope

---

### MODULE 5: Communication with Admin

#### FR-021 — Message Thread per Customer
- Each customer has a single message thread with the admin team
- Messages are ordered chronologically (newest at bottom)
- Unread messages are indicated with a badge count on the portal nav

#### FR-022 — Customer Can Send Messages
- Customer can compose and send a text message to admin (2000 char max)
- Message visible to admin in admin portal (new admin portal section required)
- Customer receives confirmation that message was sent

#### FR-023 — Admin Can Reply
- Admin can read all customer messages in the admin portal
- Admin can send replies to specific customers
- Reply appears in the customer's portal message thread

#### FR-024 — Email Notifications for Messages
- When admin sends a reply: customer receives email notification with message preview and CTA to view in portal
- When customer sends a message: admin receives email notification at `rob@absolutepestservices.com`

#### FR-025 — Message Read Status
- Messages are marked as read when the recipient views them
- Admin portal shows unread message count per customer

#### FR-026 — No File Attachments in v1
- Messages are text-only in v1
- File/image attachments are deferred to v2 (see Open Questions Q4)

---

## Non-Functional Requirements

- **NFR-001:** All portal routes (`/portal/*`) must require authentication — redirect to `/auth` if not logged in
- **NFR-002:** Portal must be mobile-responsive — customers frequently access on mobile devices in the field
- **NFR-003:** Page load time < 2 seconds on a standard 4G connection for dashboard home
- **NFR-004:** Customer data isolation — each user can only see their own data; server-side enforcement via `userId` filtering on all queries
- **NFR-005:** All monetary values displayed with proper formatting ($X,XXX.XX)
- **NFR-006:** Email notifications must not block UI — fire-and-forget with error logging
- **NFR-007:** Portal navigation must be clearly separate from the public marketing site — distinct visual treatment (no confusion between `/dashboard` (marketing site) and `/portal` (customer portal))
- **NFR-008:** Session timeout: 30-day persistent login (consistent with existing auth pattern)
- **NFR-009:** CSRF protection on all form submissions (consistent with existing pattern)
- **NFR-010:** No personally identifiable data leaked in client-side error messages

---

## Data Model Changes Required

### New Table: `customer_messages`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `serial` PK | |
| `userId` | `integer` FK → `users.id` NOT NULL | The customer (sender or recipient) |
| `direction` | `text` NOT NULL | `customer_to_admin` or `admin_to_customer` |
| `message` | `text` NOT NULL | Max 2000 chars |
| `isRead` | `boolean` DEFAULT false NOT NULL | Read by recipient |
| `readAt` | `timestamp` | When marked read |
| `sentByAdminId` | `integer` FK → `users.id` | nullable — set when admin sends |
| `createdAt` | `timestamp` DEFAULT now() NOT NULL | |

### Changes to Existing Tables

#### `invoices` (Feature #5 — already designed)
No new fields needed for the customer portal. The portal reads from the existing invoice schema using the customer's `userId` → linked via `clients.id` (see FR-013).

#### `users` table
Consider adding: `lastPortalLoginAt: timestamp` — optional, for admin reporting. (Opinion: useful, low-cost addition.)

### Linking: `users` ↔ `clients`

**Critical architectural question:** The existing schema has both a `users` table (registered customers, `role = 'user'`) and a `clients` table (admin-managed client records). These are not currently linked.

To show invoices to a customer in the portal, we need to know which `clients` record maps to which `users` record.

**Option A:** Add `clientId: integer FK → clients.id` to the `users` table (nullable)
**Option B:** Match by email: `users.email === clients.email` (fragile, but zero schema change)
**Option C:** Add `userId: integer FK → users.id` to the `clients` table (nullable)

> **Opinion:** Option A is cleanest — admin links a user to their client record during onboarding. This should be a Mike decision. See Open Questions Q5.

---

## API Endpoints Required

### Customer Portal Endpoints (all require `requireAuth`, scoped to `req.user.id`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/portal/summary` | Dashboard summary: upcoming appts, outstanding balance, unread messages |
| `GET` | `/api/portal/appointments` | All appointments (service requests + inspections) for the current user |
| `GET` | `/api/portal/appointments/:id` | Single appointment detail |
| `POST` | `/api/portal/appointments` | Submit new inspection/appointment request |
| `GET` | `/api/portal/service-requests` | All service requests for the current user |
| `POST` | `/api/portal/service-requests` | Submit a new service request |
| `GET` | `/api/portal/invoices` | All invoices visible to the current user (not draft/void) |
| `GET` | `/api/portal/invoices/:id` | Invoice detail (triggers `viewed` transition if applicable) |
| `GET` | `/api/portal/invoices/:id/pdf` | Download invoice PDF |
| `POST` | `/api/portal/invoices/:id/pay` | Initiate Stripe payment for invoice |
| `GET` | `/api/portal/messages` | Message thread for the current user |
| `POST` | `/api/portal/messages` | Send a message to admin |
| `PATCH` | `/api/portal/messages/:id/read` | Mark a message as read |
| `GET` | `/api/portal/profile` | Get current user profile |
| `PUT` | `/api/portal/profile` | Update profile (name, phone, address — not email/password here) |

### Admin Portal Extensions (require `requireAdmin`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/messages` | List all customer message threads (ordered by unread/recent) |
| `GET` | `/api/admin/messages/:userId` | Message thread for a specific customer |
| `POST` | `/api/admin/messages/:userId/reply` | Admin sends reply to customer |
| `GET` | `/api/admin/messages/unread-count` | Total unread message count (for admin nav badge) |
| `PATCH` | `/api/admin/users/:id/client-link` | Link a user account to a client record (Option A) |

---

## User Stories

### Appointment History

**As a** registered customer,  
**I want** to see all my past and upcoming pest control appointments,  
**So that** I know what services have been performed at my property and what's scheduled next.

**Acceptance Criteria:**
- [ ] Given I am logged in, when I navigate to the portal, I see my appointment history
- [ ] Given I have past appointments, when I click one, I see full details including technician notes
- [ ] Given no appointments exist, I see an empty state with a CTA to schedule one
- [ ] Given appointments exist, I can filter by status and date range

**Priority:** P0  
**Dependencies:** `inspectionSchedules` and `serviceRequests` already linked to `userId`

---

**As a** registered customer,  
**I want** to schedule a new pest control appointment online,  
**So that** I don't have to call during business hours to book a visit.

**Acceptance Criteria:**
- [ ] Given I am logged in, when I submit the appointment form with valid data, I receive a confirmation
- [ ] Given I submit the form, the admin receives an email notification
- [ ] Given I have a saved address, the form pre-fills my address
- [ ] Given I try to select a past date, the form prevents it

**Priority:** P0  
**Dependencies:** Existing `inspectionSchedules` table + email infrastructure

---

### Invoice Payment

**As a** registered customer,  
**I want** to view and pay my outstanding invoices online,  
**So that** I can settle my account without mailing a check or calling the office.

**Acceptance Criteria:**
- [ ] Given I have outstanding invoices, when I view the Invoices tab, I see them listed
- [ ] Given I click an invoice, I see the line items and total
- [ ] Given an invoice is outstanding, I see a "Pay Now" button (if Stripe enabled)
- [ ] Given I pay an invoice, the status updates to "Paid" and I receive a receipt email
- [ ] Given an invoice is overdue, it is visually highlighted

**Priority:** P1 (P0 if Stripe is included in v1)  
**Dependencies:** Feature #5 (Invoice Management), `users`↔`clients` linkage resolved, Stripe integration

---

### Service Request

**As a** registered customer,  
**I want** to submit a service request with details and photos,  
**So that** I can communicate pest problems to the admin team without a phone call.

**Acceptance Criteria:**
- [ ] Given I submit a service request, it appears in my appointment history with status "Pending"
- [ ] Given I attach photos, they are visible to the admin
- [ ] Given the admin updates the status, I receive an email notification
- [ ] Given I have an open request of the same type, I receive a duplicate warning

**Priority:** P0  
**Dependencies:** `serviceRequests` table (already exists), Cloudinary (for photo attachments)

---

### Messaging

**As a** registered customer,  
**I want** to send messages to the Absolute Pest Services team,  
**So that** I can ask questions and get responses without playing phone tag.

**Acceptance Criteria:**
- [ ] Given I send a message, the admin receives an email notification
- [ ] Given the admin replies, I see the reply in my portal and receive an email notification
- [ ] Given I have unread messages, I see a badge count in the portal nav
- [ ] Given no messages exist, I see an empty state with a prompt to start a conversation

**Priority:** P1  
**Dependencies:** New `customer_messages` table

---

## Storage Layer Additions

New methods required in `IStorage` interface and `DatabaseStorage`:

```typescript
// Portal — Appointments (reads from existing tables)
getAppointmentsByUser(userId: number): Promise<(InspectionSchedule | ServiceRequest)[]>
getAppointmentDetail(id: number, type: 'inspection' | 'service', userId: number): Promise<...>

// Portal — Invoices (reads from invoices table — Feature #5)
getInvoicesByUser(userId: number): Promise<Invoice[]>   // excludes draft/void
markInvoiceViewed(invoiceId: number): Promise<void>

// Portal — Messages
createMessage(data: InsertCustomerMessage): Promise<CustomerMessage>
getMessagesByUser(userId: number): Promise<CustomerMessage[]>
markMessageRead(messageId: number): Promise<void>
getUnreadMessageCountForUser(userId: number): Promise<number>

// Admin — Messages
getAllMessageThreads(): Promise<MessageThreadSummary[]>
getMessageThread(userId: number): Promise<CustomerMessage[]>
createAdminReply(userId: number, adminId: number, message: string): Promise<CustomerMessage>
getTotalUnreadAdminMessageCount(): Promise<number>

// Admin — User/Client Link
linkUserToClient(userId: number, clientId: number): Promise<User>
```

---

## Frontend Architecture

### New Routes (to be added to `App.tsx`)

```tsx
// Customer Portal Routes
<Route path="/portal" component={PortalDashboard} />
<Route path="/portal/appointments" component={PortalAppointments} />
<Route path="/portal/appointments/new" component={PortalNewAppointment} />
<Route path="/portal/appointments/:id" component={PortalAppointmentDetail} />
<Route path="/portal/invoices" component={PortalInvoices} />
<Route path="/portal/invoices/:id" component={PortalInvoiceDetail} />
<Route path="/portal/service-requests/new" component={PortalNewServiceRequest} />
<Route path="/portal/messages" component={PortalMessages} />
<Route path="/portal/profile" component={PortalProfile} />
```

> **Opinion:** Rename the current `/dashboard` route to `/portal` for clarity, or keep `/dashboard` as a redirect to `/portal`. Mike should decide what the customer-facing URL should be.

### Key Component Architecture (for Leia/Luke)

```
/client/src/pages/portal/
  PortalLayout.tsx          — Portal shell (nav, auth guard, header)
  PortalDashboard.tsx       — Summary cards + quick actions
  PortalAppointments.tsx    — Appointment list + filters
  PortalAppointmentDetail.tsx
  PortalNewAppointment.tsx  — Schedule new appointment form
  PortalInvoices.tsx        — Invoice list
  PortalInvoiceDetail.tsx   — Invoice detail + PDF download + pay button
  PortalNewServiceRequest.tsx
  PortalMessages.tsx        — Chat-style message thread UI
  PortalProfile.tsx         — Edit contact info

/client/src/components/portal/
  AppointmentCard.tsx       — Reusable appointment summary card
  InvoiceStatusBadge.tsx    — Status pill component
  MessageBubble.tsx         — Chat message component
  PortalNav.tsx             — Sidebar/tab navigation with unread badge
```

---

## Integration with Existing Systems

### Auth System
- Uses existing session-based auth (`req.session.userId`)
- `requireAuth` middleware already exists — reuse for all `/api/portal/*` routes
- No new auth mechanism needed

### Email System (`server/email.ts`)
New email functions needed:
```typescript
sendAppointmentConfirmationEmail(data: {...}): Promise<boolean>
sendServiceRequestStatusUpdateEmail(data: {...}): Promise<boolean>
sendMessageNotificationEmail(data: {...}): Promise<boolean>
sendAdminNewMessageNotificationEmail(data: {...}): Promise<boolean>
```

### Invoice System (Feature #5)
- Portal reads invoices; does not create or modify them (admin-only)
- `viewToken` pattern from Feature #5 is the mechanism for view tracking
- Customer portal authenticated view uses session auth (not token) — simpler

### Cloudinary (`server/cloudinary.ts`)
- Photo attachments on service requests use existing Cloudinary upload infrastructure
- No new integration needed — same upload pattern as job log photos (Feature #8)

---

## Assumptions

1. The existing `users` table registration/login flow is the customer's portal login — no new auth system
2. Customers are registered users (`role = 'user'`); the existing `/auth` register/login page is their entry point
3. The portal is web-only in v1 — no mobile app
4. Messaging is asynchronous (not real-time chat) — no WebSocket required in v1; polling acceptable
5. Invoice feature (#5) must be complete before invoice module of this portal can be built
6. Admin portal receives new "Messages" section to handle customer messages
7. The existing `/dashboard` page either becomes the portal or redirects to it — no two separate logged-in UIs

---

## Open Questions

> **Items requiring Mike's input before Akbar/Luke proceed**

1. **Scheduling lead time:** Should there be a minimum booking lead time (e.g., 24 hours, 1 business day)? Or can customers request same-day?

2. **Online payment in v1?** Should the invoice Pay Now button (Stripe) be included in v1 of the portal, or should v1 show "contact us to pay" with instructions? *(Stripe in v1 is higher complexity but higher value.)*

3. **Photo attachments on service requests?** Should customers be able to upload photos of pest issues when submitting a service request? (Cloudinary infrastructure exists; it's an implementation decision.)

4. **Message file attachments?** Should customers be able to attach photos/files in the messaging system, or text-only in v1?

5. **User ↔ Client record linkage:** How should the system connect a registered `users` record to an `clients` (admin) record for invoice visibility? Options:
   - A) Admin manually links user to client in admin portal (recommended)
   - B) System auto-matches by email address
   - C) Customer provides a "account number" during registration

6. **Dashboard URL:** Should the portal live at `/portal` (new) or replace `/dashboard` (current)? The current `/dashboard` has existing functionality — migration risk is low but non-zero.

7. **Notification preferences:** Should customers be able to opt out of email notifications (e.g., uncheck "notify me when status changes")? Required for CAN-SPAM compliance if we send automated status emails.

8. **Message retention:** How long should customer messages be retained? Indefinitely? 2 years? This affects DB growth planning.

9. **Admin assignment:** When a customer submits a portal request, should it be auto-assigned to a specific admin, or goes into a shared queue?

10. **Portal onboarding:** How do customers know the portal exists? Is there a registration invite flow, or do they self-register at `/auth`?

---

## Competitive Context

*(Opinion — labeled as such)*

Self-service portals are standard in the pest control industry (Terminix, Orkin, local operators using ServiceTitan/FieldEdge). Key differentiators this portal should hit:

| Feature | Industry Standard | This Portal |
|---------|------------------|-------------|
| View appointment history | ✅ | ✅ |
| Book appointments online | ✅ | ✅ |
| View/pay invoices | ✅ | ✅ (v1 view; payment TBD) |
| Message admin team | ⚠️ (some) | ✅ |
| Service request tracking | ⚠️ (some) | ✅ |
| Photo submission | ❌ (rare) | ✅ (proposed) |

The messaging module is a meaningful differentiator for a small operator — it creates a more personal relationship than a ticket system.

---

## Dependency Map

```
Feature #5 (Invoice Management)
  └── Required by: Module 3 (Pay Invoices)
  └── Status: Must be complete first

Feature #8 (Photo Attachments — Job Logs)
  └── Related to: Module 4 (Service Request photos)
  └── Can reuse Cloudinary pattern

users ↔ clients linkage (Open Question Q5)
  └── Required by: Module 3 (Invoice visibility)
  └── Blocks: Invoice list view

customer_messages table (new)
  └── Required by: Module 5 (Communication)
  └── Admin portal extension also needed
```

---

## Phasing Recommendation

*(Opinion — for Mike's consideration)*

### Phase 1 (MVP — Highest Value, Lowest Risk)
- Module 1: Appointment History (read-only, no new API needed)
- Module 2: Schedule New Appointment (re-packages existing inspection form)
- Module 4: Service Request (re-packages existing service request form)
- Portal shell, navigation, auth guard

### Phase 2 (After Feature #5 Invoice is Live)
- Module 3: Pay Invoices (view-only, with PDF download)
- Requires: Feature #5 done + users↔clients linkage resolved

### Phase 3 (Full Portal)
- Module 3: Invoice payment via Stripe
- Module 5: Communication/Messaging
- Photo attachments on service requests

---

## Research Sources
- Existing codebase: `shared/schema.ts`, `server/routes.ts`, `client/src/pages/dashboard.tsx`
- Existing dashboard page shows the foundation (service requests, inspections, payments tabs already present)
- Feature #5 invoice requirements: `docs/Feature-5-Invoice-Management-Requirements.md`
- Industry portal patterns: Terminix, Orkin, ServiceTitan customer-facing flows
- Existing email infrastructure: `server/email.ts`

---

## Recommended Next Steps

1. **Mike:** Answer Open Questions #2 (online payment) and #5 (user↔client linkage) — these are the two biggest blockers for Akbar and Luke
2. **Mike:** Confirm phasing approach — Phase 1 can begin immediately (no blockers)
3. **Akbar:** Design the `customer_messages` schema addition and `users.clientId` FK strategy; confirm portal route architecture
4. **Leia:** Design portal UI — priority on mobile-first layout, distinct from admin portal visual treatment
5. **Luke:** Phase 1 implementation can start with portal shell + appointment history (no new backend needed)

**Priority order for Luke:** Portal layout → Auth guard → Appointment history (read) → New appointment form → Service request form → Profile page → [Phase 2] Invoice view → [Phase 3] Messaging
