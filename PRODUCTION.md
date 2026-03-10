# Absolute Pest Services — Developer Standards & Production Fix Log

This document covers all corrective changes applied during the March 10, 2026 integration session, plus the coding standards every developer must follow when contributing to this repository. Read this before submitting any pull request.

---

## Table of Contents

1. [Repository Overview](#1-repository-overview)
2. [Today's Fixes — What Broke & Why](#2-todays-fixes--what-broke--why)
3. [Recurring Fix Patterns](#3-recurring-fix-patterns)
4. [API Route Standards](#4-api-route-standards)
5. [Database Schema Standards](#5-database-schema-standards)
6. [Frontend Component Standards](#6-frontend-component-standards)
7. [Client Lifecycle — Status & Type Rules](#7-client-lifecycle--status--type-rules)
8. [Field Service Module Standards](#8-field-service-module-standards)
9. [Session & Auth Standards](#9-session--auth-standards)
10. [Pre-PR Checklist](#10-pre-pr-checklist)

---

## 1. Repository Overview

| Item | Detail |
|------|--------|
| Stack | React 18 + TypeScript, Express.js, PostgreSQL (Drizzle ORM) |
| Frontend build | Vite (do **not** modify `vite.config.ts`) |
| Package management | npm only — do **not** touch `package.json` scripts |
| Schema migrations | `npm run db:push` (never write raw SQL) |
| Shared types | `shared/schema.ts` — source of truth for all DB types |
| Admin route | `/admin` (requires session `userId`) |
| Field portal route | `/field` (requires PIN auth — session `fieldEmployeeId`) |
| Customer portal | `/portal` (requires session `userId`) |

---

## 2. Today's Fixes — What Broke & Why

### Fix 1 — Named vs Default Export Mismatch (App.tsx)

**Commit:** `73b04fd`

The external team's new page used `export default` but `App.tsx` imported it as a named export.

```typescript
// WRONG — causes crash on load
import { AdminScheduling } from "@/pages/admin/admin-scheduling";

// CORRECT — matches the export default in the file
import AdminScheduling from "@/pages/admin/admin-scheduling";
```

**Rule:** Always check whether the page component uses `export default` or `export function/const`. Match the import style in `App.tsx` exactly.

---

### Fix 2 — Radix UI SelectItem Empty String Crash

**Commit:** `17a024d`

A `<SelectItem value="">` caused a runtime crash. Radix UI's Select component does not accept an empty string as a value.

```tsx
// WRONG — crashes at runtime
<SelectItem value="">Unassigned</SelectItem>

// CORRECT — use a non-empty sentinel string
<SelectItem value="none">Unassigned</SelectItem>
```

Then map it back to `null` when sending to the API:

```typescript
employeeId: formData.technicianId === "none" ? null : Number(formData.technicianId)
```

**Rule:** Every `<SelectItem>` must have a non-empty `value` prop. Use `"none"`, `"unassigned"`, or `"all"` as sentinels.

---

### Fix 3 — Calendar View Not Showing Completed Field Jobs

**Commit:** `a59adfe`

`getScheduledJobs` in `storage.ts` defaulted to filtering for `status IN ('scheduled', 'in_progress')` only. Field employees submit jobs as `completed`, so the calendar was empty for all past work.

**Backend fix in `storage.ts`:**

```typescript
async getScheduledJobs(filters?: { status?: string }): Promise<ScheduledJob[]> {
  // When status === 'all', skip the status filter entirely
  const statusFilter = (!filters?.status || filters.status === 'all')
    ? undefined
    : sql`${scheduledJobs.status} = ${filters.status}`;
  // ...
}
```

**Frontend fix in `CalendarView.tsx`:**

```typescript
// Always pass status=all to the calendar endpoint
const { data: jobsData } = useQuery({
  queryKey: ["/api/admin/scheduled-jobs", { status: "all" }],
  // ...
});
```

**Rule:** The scheduling list view uses default status filtering (scheduled/in_progress). The calendar always passes `status=all` to show every job regardless of status.

---

### Fix 4 — `/api/field/suggestions` Returning Empty Array

The field log's customer autocomplete was returning an empty hardcoded array instead of real clients from the database.

**Backend fix (`routes.ts`):**

```typescript
app.get("/api/field/suggestions", requireFieldAuth, async (req, res) => {
  const clientList = await storage.getClients();
  const customers = clientList.map(c => ({
    id: c.id,
    name: c.name,
    propertyType: c.propertyType ?? "residential",
  }));
  res.json({ customers });
});
```

**Rule:** Never return hardcoded empty arrays from endpoints that are meant to serve live data. Always wire to the storage interface.

---

### Fix 5 — New Field Log Customers Not Creating Client Records

**Commit:** `b550832`

When a field employee added a new customer name, only a `fieldCustomers` record was created (a separate, isolated table). The customer never appeared in the admin **Client Management** page.

**Backend fix — create the `clients` record first, before the job log:**

```typescript
app.post("/api/field/job-logs", requireFieldAuth, async (req, res) => {
  let resolvedClientId = req.body.clientId || null;

  // New customer — create a proper client record before the job log
  if (req.body.isNewCustomer && req.body.customerName && !req.body.clientId) {
    const newClient = await storage.createClient({
      name: req.body.customerName,
      address: req.body.newCustomerAddress || null,
      propertyType: req.body.propertyType || "residential",
      clientType: "prospect",
      status: "pending",   // <-- pending, not active (see Section 7)
    });
    resolvedClientId = newClient.id;
  }

  const data = {
    ...req.body,
    employeeId: req.session.fieldEmployeeId,
    jobDate: new Date(req.body.jobDate),
    clientId: resolvedClientId,
  };
  // ...
});
```

**Frontend requirements added:**

- A `isNewCustomer: true` flag is sent in the POST body.
- `newCustomerAddress` (required) is sent as a separate field.
- The address auto-fills the job log's `siteAddress`.
- The property type toggle is required and visually prominent.
- Form submission is blocked if address is missing for a new customer.

---

## 3. Recurring Fix Patterns

These patterns have come up repeatedly when integrating external team commits. Check for all of them before considering any PR ready.

### 3.1 TypeScript Non-Null Assertion on Session Fields

Express sessions are typed with optional properties. Always use the non-null assertion operator when reading session fields inside authenticated routes.

```typescript
// WRONG — TypeScript error, session field may be undefined
const userId = req.session.userId;

// CORRECT
const userId = req.session.userId!;
const fieldEmployeeId = req.session.fieldEmployeeId!;
```

This applies to: `req.session.userId`, `req.session.fieldEmployeeId`, and any other field added to the session type in `server/session.d.ts`.

---

### 3.2 Date Handling — Always Slice to Date String

When working with `routeDate` or any date that travels through the ORM, it may come back as a full `Date` object or an ISO string. Always normalize before use.

```typescript
// WRONG — may produce "2026-03-10T00:00:00.000Z"
const dateStr = route.routeDate.toISOString();

// CORRECT — produces "2026-03-10"
const dateStr = new Date(route.routeDate).toISOString().split('T')[0];
```

When displaying job dates to avoid timezone shifts:

```typescript
// CORRECT pattern for rendering job/log dates safely
new Date(String(log.jobDate).slice(0, 10) + "T12:00:00").toLocaleDateString()
```

---

### 3.3 ReminderSettings Dynamic Key Access

The `reminderSettings` object in `server/routes.ts` is strongly typed. Accessing it with a dynamic key requires a type cast.

```typescript
// WRONG — TypeScript error on index access
const value = settings[key];

// CORRECT
const value = (settings as any)[key];
```

---

### 3.4 Null Guard for scheduledDate

`scheduledDate` on jobs is nullable. Always guard before using it.

```typescript
// WRONG — runtime error if null
const formatted = new Date(job.scheduledDate).toLocaleDateString();

// CORRECT
const formatted = job.scheduledDate
  ? new Date(job.scheduledDate).toLocaleDateString()
  : "Not scheduled";
```

---

## 4. API Route Standards

### 4.1 Route Organization

| Prefix | Purpose | Auth Required |
|--------|---------|--------------|
| `/api/public/*` | Public-facing forms (contact, inspection, quote) | None (Turnstile CAPTCHA) |
| `/api/portal/*` | Customer portal | `requirePortalUser` |
| `/api/admin/*` | Admin operations | `requireAdmin` |
| `/api/field/*` | Field employee actions | `requireFieldAuth` |
| `/api/clients` | Client CRUD | `requireAdmin` |
| `/api/blog` | Blog posts | Mixed |

### 4.2 Auth Middleware

Three middleware functions exist in `server/routes.ts`. Use the correct one for every route:

```typescript
// Admin portal (login via email/password)
function requireAdmin(req, res, next) { /* checks req.session.userId */ }

// Customer portal
function requirePortalUser(req, res, next) { /* checks req.session.userId */ }

// Field employee (PIN login)
function requireFieldAuth(req, res, next) { /* checks req.session.fieldEmployeeId */ }
```

**Never use a raw route without one of these middleware functions** for any non-public endpoint.

### 4.3 Request Validation

All POST/PUT/PATCH routes must validate the body using a Zod schema before passing data to storage:

```typescript
app.post("/api/some-route", requireAdmin, async (req, res) => {
  try {
    const validated = insertMySchema.parse(req.body); // <-- always validate
    const result = await storage.createMyThing(validated);
    res.json({ success: true, result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
```

### 4.4 New Endpoints Added This Session

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| `GET` | `/api/field/suggestions` | `requireFieldAuth` | Returns all clients (name, id, propertyType) for field log autocomplete |
| `GET` | `/api/admin/scheduled-jobs?status=all` | `requireAdmin` | Returns jobs of ALL statuses (used by calendar view) |
| `PUT` | `/api/clients/:id` | `requireAdmin` | Accepts `{ status: "active" }` to activate a pending prospect |

---

## 5. Database Schema Standards

### 5.1 File Location

All schema changes go in `shared/schema.ts`. This is the single source of truth shared between frontend and backend.

### 5.2 Migration Command

```bash
npm run db:push
# If schema change causes a data-loss warning:
npm run db:push --force
```

**Never write raw SQL.** Never edit `drizzle.config.ts`.

### 5.3 Adding a New Column

```typescript
// shared/schema.ts
export const myTable = pgTable("my_table", {
  id: serial("id").primaryKey(),
  newColumn: text("new_column").default("default_value"), // nullable by default
  requiredColumn: text("required_column").notNull(),
});
```

After adding, regenerate insert/select types:

```typescript
export const insertMyTableSchema = createInsertSchema(myTable).omit({ id: true, createdAt: true });
export type InsertMyTable = z.infer<typeof insertMyTableSchema>;
export type MyTable = typeof myTable.$inferSelect;
```

### 5.4 Tables Added This Session

| Table | New Column | Type | Notes |
|-------|-----------|------|-------|
| `clients` | `property_type` | `text` | Default `"residential"`. Values: `"residential"`, `"commercial"` |
| `clients` | `email` | `text` | Made **nullable** (was `.notNull()`) |
| `field_customers` | `property_type` | `text` | Default `"residential"` |

---

## 6. Frontend Component Standards

### 6.1 Routing

Pages go in `client/src/pages/`. Register them in `client/src/App.tsx` using `wouter`:

```tsx
import MyNewPage from "@/pages/my-new-page"; // match export style

<Route path="/my-route" component={MyNewPage} />
```

Check the page file's export: use `import X from` for `export default`, use `import { X } from` for named exports.

### 6.2 Data Fetching

```tsx
// Queries — always strongly typed
const { data, isLoading } = useQuery({
  queryKey: ["/api/some-endpoint"],
  select: (data: any) => data.items as MyType[],
});

// Mutations
const mutation = useMutation({
  mutationFn: async (payload: MyType) => {
    const res = await apiRequest("POST", "/api/some-endpoint", payload);
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/some-endpoint"] });
  },
});
```

### 6.3 Radix UI / ShadCN Rules

- **`<SelectItem value="">` is not allowed.** Use a non-empty sentinel like `"none"`, `"all"`, or `"unassigned"`.
- Map sentinel back to `null` or the appropriate API value before sending to the backend.
- All form components use `react-hook-form` + `zodResolver`. Always pass `defaultValues` to `useForm`.

### 6.4 Environment Variables

```typescript
// Frontend — must be prefixed with VITE_
const key = import.meta.env.VITE_MY_KEY;

// Backend — standard process.env
const key = process.env.MY_KEY;
```

---

## 7. Client Lifecycle — Status & Type Rules

This is critical. Every client record goes through defined lifecycle stages. **Do not skip stages.**

### 7.1 Lifecycle Flow

```
Public Form / Field Log (new customer)
        │
        ▼
  clientType: "prospect"
  status: "pending"          ← Sits here until admin reviews
        │
        │  Admin clicks "Activate" in Client Management
        ▼
  clientType: "prospect"
  status: "active"           ← Active prospect, admin is working with them
        │
        │  Admin clicks "Convert to Live Client"
        ▼
  clientType: "client"
  status: "active"           ← Live paying client
```

### 7.2 Rules

| Origin | `clientType` | `status` |
|--------|-------------|---------|
| Public contact form | `"prospect"` | `"pending"` |
| Public inspection form | `"prospect"` | `"pending"` |
| Public quote/service request | `"prospect"` | `"pending"` |
| Field log — new customer typed by tech | `"prospect"` | `"pending"` |
| Admin manually creates from Client Management | `"prospect"` | `"active"` |
| Admin creates from Scheduling page (new customer) | `"prospect"` | `"active"` |
| Admin converts prospect to client | `"client"` | `"active"` |

**The key rule: anything originating from the public-facing website or the field tech form gets `status: "pending"`. Only admin-initiated creation gets `status: "active"` directly.**

### 7.3 Where This Is Enforced

- `server/storage.ts` → `createOrUpdateProspect()` — always sets `status: "pending"`
- `server/routes.ts` → `POST /api/field/job-logs` new customer branch — sets `status: "pending"`
- `client/src/components/admin/ClientManagement.tsx` — "Pending Review" tab with Activate button

---

## 8. Field Service Module Standards

The field portal (`/field`) uses a separate PIN-based authentication system.

### 8.1 Authentication Flow

1. Employee enters PIN at `/field`
2. `POST /api/field/auth` verifies PIN, stores `req.session.fieldEmployeeId`
3. All subsequent field requests use `requireFieldAuth` middleware
4. Session expiry triggers re-auth (the field log catches 401 and re-authenticates using PIN stored in `localStorage`)

### 8.2 New Customer Creation from Field Log

When a field tech types a name not in the dropdown:

1. Frontend sends `isNewCustomer: true`, `newCustomerAddress`, and `propertyType` in the POST body
2. Backend creates a `clients` record **before** creating the job log
3. The new client's ID becomes the `clientId` on the job log
4. New client gets `status: "pending"` — admin reviews it in Client Management

### 8.3 Property Type

Every customer interaction in the field log requires property type selection:
- **Known client** — property type is auto-filled from their client record (read-only badge)
- **New customer** — Residential/Commercial toggle is shown and required; form blocks submission without it

---

## 9. Session & Auth Standards

### 9.1 Session Type Declaration

Session fields are declared in `server/session.d.ts` (or inline in `server/routes.ts`). When adding a new session field:

```typescript
declare module "express-session" {
  interface SessionData {
    userId?: number;
    fieldEmployeeId?: number;
    myNewField?: string; // add here
  }
}
```

Always use `!` when reading inside a guarded middleware block:

```typescript
const id = req.session.fieldEmployeeId!; // safe inside requireFieldAuth
```

### 9.2 Admin Login

Admin login is case-insensitive on email (`ilike` query). Credentials for this deployment:
- Email: `rob@absolutepestservices.com`
- Password managed in the admin account record

### 9.3 Field Employee Auth

Field employees authenticate via 4-digit PIN. The first employee (Frank, PIN 2121) has `canManageEmployees: true`, which controls access to the employee management section at `/field/employees`.

---

## 10. Pre-PR Checklist

Before opening a pull request or pushing to `main`, verify every item:

- [ ] All new routes use the correct auth middleware (`requireAdmin`, `requirePortalUser`, `requireFieldAuth`, or intentionally public)
- [ ] All `<SelectItem>` components have a non-empty `value` prop
- [ ] New page components are imported in `App.tsx` using the correct named vs default import style
- [ ] `req.session.userId!` and `req.session.fieldEmployeeId!` use `!` inside guarded routes
- [ ] Date fields read from the DB are wrapped: `new Date(String(date).slice(0,10) + "T12:00:00")`
- [ ] `scheduledDate` (and any other nullable date) has a null guard before use
- [ ] Any new `clients` record created from a public form or field log uses `status: "pending"`
- [ ] Schema changes are in `shared/schema.ts` and `npm run db:push` was run
- [ ] Storage interface (`IStorage`) in `server/storage.ts` is updated with any new methods
- [ ] New API endpoints are documented in this file under Section 4.4
- [ ] No hardcoded empty arrays are returned from data endpoints — always wire to storage

---

*Last updated: March 10, 2026 — Replit Agent session*
