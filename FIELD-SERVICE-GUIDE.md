# Field Service Portal & Job Log System — Developer Guide

> This document is for the external development team working on the portal and job logging features. Read `ARCHITECTURE.md` first for immutable stack rules.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Frontend Routes & Components](#frontend-routes--components)
3. [Backend API Endpoints](#backend-api-endpoints)
4. [Authentication & Middleware](#authentication--middleware)
5. [Database Schema](#database-schema)
6. [SmartField Component](#smartfield-component)
7. [Custom Fields System](#custom-fields-system)
8. [Email Notifications](#email-notifications)
9. [PDF Report Generation](#pdf-report-generation)
10. [Admin Field Data Management](#admin-field-data-management)
11. [Known Patterns & Gotchas](#known-patterns--gotchas)
12. [Current Seed Data](#current-seed-data)

---

## System Overview

The Field Service Portal is a mobile-first interface at `/field/*` where technicians log daily work from their phones. It operates with its own PIN-based authentication, completely separate from the admin/customer portal sessions.

**Key flows:**
1. Technician enters 4-digit PIN → gets session → submits job logs
2. Admin defines custom fields, customers, locations, areas → technicians see them in log form
3. Admin runs reports with filters → downloads PDF for clients

**Separation of concerns:**
- Field customers (`field_customers` table) are entirely separate from website clients (`clients` table)
- Field employee sessions use different session properties (`session.fieldEmployeeId`) than admin sessions (`session.userId`)
- Both session types can coexist — a user can be logged into admin and field portals simultaneously

---

## Frontend Routes & Components

All field routes are registered in `client/src/App.tsx`:

| Route | Component | File | Purpose |
|-------|-----------|------|---------|
| `/field` | `FieldLogin` | `client/src/pages/field-login.tsx` | PIN login with numeric keypad |
| `/field/log` | `FieldLog` | `client/src/pages/field-log.tsx` | Job log submission form |
| `/field/history` | `FieldHistory` | `client/src/pages/field-history.tsx` | Employee's past job logs |
| `/field/employees` | `FieldEmployees` | `client/src/pages/field-employees.tsx` | Add/edit/remove employees (managers only) |
| `/field/reports` | `FieldReports` | `client/src/pages/field-reports.tsx` | Field-side report viewing |

Admin routes for field data:

| Route | Component | File | Purpose |
|-------|-----------|------|---------|
| `/admin/field-data` | `AdminFieldData` | `client/src/pages/admin/admin-field-data.tsx` | Manage custom fields, customers, locations, areas, employees |
| `/admin/reports` | `AdminReports` | `client/src/pages/admin/admin-reports.tsx` | Filter job logs + download PDF reports |

**Shared component:**
- `client/src/components/field-nav.tsx` — Bottom navigation bar for mobile. Shows on all `/field/*` pages. Conditionally shows "Team" tab based on `canManageEmployees` flag.

---

## Backend API Endpoints

### Field Employee Endpoints (technician-facing)

| Method | Path | Middleware | Purpose |
|--------|------|-----------|---------|
| `POST` | `/api/field/auth` | None | PIN login — sets session |
| `POST` | `/api/field/logout` | None | Clears field session |
| `POST` | `/api/field/seed` | None | Creates default employee "Frank" if DB is empty |
| `GET` | `/api/field/clients` | `requireFieldAuth` | List field customers for dropdown |
| `GET` | `/api/field/suggestions` | `requireFieldAuth` | Autocomplete data from past logs, locations, customers |
| `GET` | `/api/field/custom-fields` | `requireFieldAuth` | Active custom field definitions |
| `POST` | `/api/field/job-logs` | `requireFieldAuth` | Submit a new job log |
| `GET` | `/api/field/job-logs` | `requireFieldAuth` | Get this employee's logs (filtered by session) |
| `DELETE` | `/api/field/job-logs/:id` | `requireFieldAuth` | Delete own log entry |
| `GET` | `/api/field/employees` | `requireFieldManager` | List all employees |
| `POST` | `/api/field/employees` | `requireFieldManager` | Create employee |
| `PATCH` | `/api/field/employees/:id` | `requireFieldManager` | Update employee |
| `DELETE` | `/api/field/employees/:id` | `requireFieldManager` | Delete employee |

### Admin Endpoints (admin-facing)

| Method | Path | Middleware | Purpose |
|--------|------|-----------|---------|
| `GET` | `/api/admin/job-logs` | `requireAdmin` | All job logs with filters (employeeId, customerName, dateFrom, dateTo) |
| `PATCH` | `/api/admin/job-logs/:id` | `requireAdmin` | Edit any job log |
| `DELETE` | `/api/admin/job-logs/:id` | `requireAdmin` | Delete any job log |
| `GET` | `/api/admin/field-employees` | `requireAdmin` | List all field employees |
| `POST` | `/api/admin/field-employees` | `requireAdmin` | Create field employee |
| `PATCH` | `/api/admin/field-employees/:id` | `requireAdmin` | Update field employee |
| `DELETE` | `/api/admin/field-employees/:id` | `requireAdmin` | Delete field employee |
| `GET` | `/api/admin/custom-fields` | `requireAdmin` | List custom field definitions |
| `POST` | `/api/admin/custom-fields` | `requireAdmin` | Create custom field (validates select type needs options) |
| `PATCH` | `/api/admin/custom-fields/:id` | `requireAdmin` | Update custom field |
| `DELETE` | `/api/admin/custom-fields/:id` | `requireAdmin` | Delete custom field |
| `GET` | `/api/admin/field-customers` | `requireAdmin` | List field customers |
| `POST` | `/api/admin/field-customers` | `requireAdmin` | Create field customer |
| `PATCH` | `/api/admin/field-customers/:id` | `requireAdmin` | Update field customer |
| `DELETE` | `/api/admin/field-customers/:id` | `requireAdmin` | Delete field customer |
| `GET` | `/api/admin/site-locations` | `requireAdmin` | List site locations |
| `POST` | `/api/admin/site-locations` | `requireAdmin` | Create site location |
| `PATCH` | `/api/admin/site-locations/:id` | `requireAdmin` | Update site location |
| `DELETE` | `/api/admin/site-locations/:id` | `requireAdmin` | Delete site location |
| `GET` | `/api/admin/serviced-areas` | `requireAdmin` | List serviced areas |
| `POST` | `/api/admin/serviced-areas` | `requireAdmin` | Create serviced area |
| `PATCH` | `/api/admin/serviced-areas/:id` | `requireAdmin` | Update serviced area |
| `DELETE` | `/api/admin/serviced-areas/:id` | `requireAdmin` | Delete serviced area |

---

## Authentication & Middleware

### PIN Login Flow

1. Technician enters 4-digit PIN on the `/field` numeric keypad
2. `POST /api/field/auth` looks up `field_employees` by PIN
3. On success, server sets:
   - `req.session.fieldEmployeeId` = employee ID
   - `req.session.fieldCanManage` = boolean (canManageEmployees flag)
4. Client stores in `localStorage`:
   - `fieldEmployee` = JSON string of employee object
   - `fieldPin` = PIN string (for auto-re-auth if session expires)
5. On logout, `POST /api/field/logout` clears both session properties

### Session Types (declared in routes.ts)

```typescript
declare module 'express-session' {
  interface SessionData {
    userId: number;              // Admin/customer portal
    fieldEmployeeId: number;     // Field portal
    fieldCanManage: boolean;     // Field manager flag
  }
}
```

### Middleware Functions

**`requireFieldAuth`** — Checks `req.session.fieldEmployeeId` exists. Returns 401 if not.

**`requireFieldManager`** — First checks `requireFieldAuth`, then checks `req.session.fieldCanManage === true`. Returns 403 if not a manager.

**`requireAdmin`** — Checks `req.session.userId` exists and the user has admin role. Separate from field auth entirely.

---

## Database Schema

### `field_employees`

| Column | Type | Default | Nullable | Notes |
|--------|------|---------|----------|-------|
| `id` | serial | auto | No | Primary key |
| `name` | text | — | No | Display name |
| `pin` | text | — | No | 4-digit PIN for login |
| `isActive` | boolean | `true` | No | Soft disable without deleting |
| `canManageEmployees` | boolean | `false` | No | Grants access to employee management |
| `createdAt` | timestamp | `now()` | No | Auto-set |

### `job_logs`

| Column | Type | Default | Nullable | Notes |
|--------|------|---------|----------|-------|
| `id` | serial | auto | No | Primary key |
| `employeeId` | integer | — | No | FK → `field_employees.id` |
| `customerName` | text | — | No | Free text or from field_customers |
| `clientId` | integer | — | Yes | Optional FK → `clients.id` (legacy, rarely used) |
| `siteLocation` | text | — | No | Free text or from site_locations |
| `servicedArea` | text | — | No | Free text or from serviced_areas |
| `workPerformed` | text | — | No | Description of work done |
| `jobDate` | timestamp | — | No | Date the work was performed |
| `customFields` | jsonb | — | Yes | Key-value pairs from custom field definitions |
| `createdAt` | timestamp | `now()` | No | Auto-set |

**customFields JSONB structure example:**
```json
{
  "chemical_used": "Termidor SC",
  "bait_stations_checked": 12,
  "follow_up_needed": true,
  "next_visit_date": "2026-04-15"
}
```

### `job_log_custom_fields`

Defines what custom fields appear on the job log form. Admin-managed.

| Column | Type | Default | Nullable | Notes |
|--------|------|---------|----------|-------|
| `id` | serial | auto | No | Primary key |
| `name` | text | — | No | Internal key (used as JSON key in customFields) |
| `label` | text | — | No | Display label shown to technicians |
| `fieldType` | text | `'text'` | No | One of: `text`, `textarea`, `number`, `date`, `checkbox`, `select` |
| `required` | boolean | `false` | No | Whether field must be filled |
| `options` | text | — | Yes | Comma-separated values for `select` type |
| `displayOrder` | integer | `0` | No | Sort order on the form |
| `isActive` | boolean | `true` | No | Only active fields render on the form |
| `createdAt` | timestamp | `now()` | No | Auto-set |

### `field_customers`

| Column | Type | Default | Nullable | Notes |
|--------|------|---------|----------|-------|
| `id` | serial | auto | No | Primary key |
| `name` | text | — | No | Customer/business name |
| `address` | text | — | Yes | Physical address |
| `phone` | text | — | Yes | Contact phone |
| `email` | text | — | Yes | Contact email |
| `createdAt` | timestamp | `now()` | No | Auto-set |

### `site_locations`

| Column | Type | Default | Nullable | Notes |
|--------|------|---------|----------|-------|
| `id` | serial | auto | No | Primary key |
| `name` | text | — | No | Location name (e.g., "Main Office", "Building A") |
| `customerId` | integer | — | Yes | Optional FK → `clients.id` |
| `customerName` | text | — | Yes | Denormalized customer name for display |
| `createdAt` | timestamp | `now()` | No | Auto-set |

### `serviced_areas`

| Column | Type | Default | Nullable | Notes |
|--------|------|---------|----------|-------|
| `id` | serial | auto | No | Primary key |
| `name` | text | — | No | Area name (e.g., "Kitchen", "Basement", "Exterior") |
| `siteLocationId` | integer | — | Yes | Optional FK → `site_locations.id` |
| `siteLocationName` | text | — | Yes | Denormalized location name for display |
| `createdAt` | timestamp | `now()` | No | Auto-set |

### Insert Schemas (from `shared/schema.ts`)

Each table has a corresponding insert schema created via `createInsertSchema` from `drizzle-zod`, with `id` and `createdAt` omitted:

- `insertFieldEmployeeSchema` → `InsertFieldEmployee`
- `insertJobLogSchema` → `InsertJobLog`
- `insertJobLogCustomFieldSchema` → `InsertJobLogCustomField`
- `insertFieldCustomerSchema` → `InsertFieldCustomer`
- `insertSiteLocationSchema` → `InsertSiteLocation`
- `insertServicedAreaSchema` → `InsertServicedArea`

---

## SmartField Component

The `SmartField` component in `client/src/pages/field-log.tsx` is a hybrid dropdown/text-input that drives the Customer, Site Location, and Serviced Area fields on the job log form.

**How it works:**
1. Renders a `<Select>` dropdown populated with existing options from `GET /api/field/suggestions`
2. Includes a special "Add New..." option at the bottom of the dropdown
3. When "Add New..." is selected, the dropdown hides and a text input appears
4. The `isAddingNew` state is **lifted to the parent** `FieldLog` component (not local to SmartField) to prevent re-render issues that cause the text input to disappear on keystroke

**State management in FieldLog:**
```
customerAddingNew / setCustomerAddingNew
locationAddingNew / setLocationAddingNew
areaAddingNew / setAreaAddingNew
```

Each SmartField receives its `isAddingNew` and `onSetAddingNew` as props.

**Cascading behavior:**
- When a customer is selected, site locations filter to that customer
- When a site location is selected, serviced areas filter to that location
- "Add New" on any field allows free text entry

---

## Custom Fields System

### Admin creates field definitions:
- Admin goes to `/admin/field-data` → Custom Fields section
- Defines name (JSON key), label (display text), type, required, options (for select), display order
- Server validates: select-type fields must have non-empty options

### Technician sees dynamic fields:
- `GET /api/field/custom-fields` returns only active fields, sorted by `displayOrder`
- `FieldLog` component renders each field dynamically based on `fieldType`:
  - `text` → `<Input>`
  - `textarea` → `<Textarea>`
  - `number` → `<Input type="number">`
  - `date` → `<Input type="date">`
  - `checkbox` → `<Checkbox>`
  - `select` → `<Select>` with options split from comma-separated string

### Storage:
- On submit, custom field values are collected into a `Record<string, any>` object
- Stored in `job_logs.customFields` JSONB column
- Keys match the `name` field from `job_log_custom_fields`

### Display:
- **Field History** (`field-history.tsx`): Custom fields render below work performed with labels
- **Admin Reports** (`admin-reports.tsx`): Custom fields appear inline in the Work Performed column
- **PDF Reports** (`pdf-report.ts`): Custom fields are appended to Work Performed text with capitalized labels

---

## Email Notifications

When a job log is submitted, `sendJobLogNotification` in `server/email.ts` sends an email via SendGrid.

**Recipients:** Configured in the function (currently Rob + additional stakeholders)

**Email content:**
- Subject: `Field Job Log - {customerName} - {date}`
- Body: HTML with technician name, customer, location, area, date, work performed

**Trigger:** Called in `POST /api/field/job-logs` route after successful log creation. Runs asynchronously (does not block the response).

---

## PDF Report Generation

**File:** `client/src/lib/pdf-report.ts`

**Libraries:** `jspdf` + `jspdf-autotable` (client-side generation)

**Function:** `generateJobReport(options)`

**Parameters:**
```typescript
interface ReportOptions {
  customerName: string;
  dateFrom: string;
  dateTo: string;
  logs: JobLogEntry[];         // includes customFields
  employees: { id: number; name: string }[];
}
```

**PDF structure:**
1. Header: "Absolute Pest Services" + tagline
2. Green divider line
3. "Service Report" title
4. Info block: customer name, date range, total visits, areas serviced
5. Table: Date | Technician | Location | Area | Work Performed (+ custom fields)
6. Footer: Company contact info (phone, email, website)

**Custom fields in PDF:** Appended to the Work Performed column as `Label: Value` pairs, one per line.

**File naming:** `APS_Report_{CustomerName}_{dateFrom}_to_{dateTo}.pdf`

---

## Admin Field Data Management

The `/admin/field-data` page (`admin-field-data.tsx`) is a single page with tabbed or sectioned views for managing all field service reference data:

| Section | API Prefix | Description |
|---------|-----------|-------------|
| Field Employees | `/api/admin/field-employees` | Name, PIN, active status, manager flag |
| Field Customers | `/api/admin/field-customers` | Name, address, phone, email |
| Site Locations | `/api/admin/site-locations` | Name, linked customer |
| Serviced Areas | `/api/admin/serviced-areas` | Name, linked site location |
| Custom Fields | `/api/admin/custom-fields` | Name, label, type, required, options, order, active |

Each section follows the same UI pattern: a list/table of existing items + an add form. Each row has edit and delete actions.

---

## Known Patterns & Gotchas

### SmartField state must be lifted
The `isAddingNew` boolean for each SmartField lives in the parent `FieldLog` component. If you move it into SmartField as local state, the text input will unmount on every keystroke due to re-renders. This was a specific bug that was fixed.

### Field customers are NOT website clients
`field_customers` and `clients` are completely separate tables. The admin "Clients" section uses `/api/clients`, while the field data "Customers" section uses `/api/admin/field-customers`. Do not mix them.

### Session coexistence
A browser can hold both `session.userId` (admin) and `session.fieldEmployeeId` (field) simultaneously. The middleware checks are independent.

### localStorage auto-re-auth
The field login page stores the PIN in `localStorage`. If the server session expires (e.g., server restart), the login page will attempt auto-login using the stored PIN on page load.

### Custom field keys
The `name` field on `job_log_custom_fields` is used as the JSON key in `job_logs.customFields`. Changing a custom field's name after logs have been submitted will orphan old data under the previous key.

### Select-type validation
The server enforces that custom fields with `fieldType: "select"` must have non-empty `options`. This validation runs on both POST and PATCH routes.

### Job log date
`jobDate` is stored as a timestamp but used as a date-only value. The frontend sends it as a date string and the backend stores it. When filtering by date range, the admin endpoint compares against `dateFrom` and `dateTo` query parameters.

### Email notifications are fire-and-forget
`sendJobLogNotification` is called without `await` in the route handler. Email failures do not block or fail the job log submission.

---

## Current Seed Data

- **Default employee:** Frank, PIN: `2121`, `canManageEmployees: true`
  - Auto-created by `POST /api/field/seed` if no employees exist
  - Also seeded on server startup in production via `server/index.ts`
- **Admin login:** `rob@absolutepestservices.com` / `Sheffield2121`
  - Case-insensitive email lookup (uses `ilike`)

---

## Storage Interface Methods

All database operations go through `IStorage` in `server/storage.ts`. Relevant methods for field service:

```
// Field Employees
createFieldEmployee(data) → FieldEmployee
getFieldEmployees() → FieldEmployee[]
getFieldEmployee(id) → FieldEmployee | undefined
getFieldEmployeeByPin(pin) → FieldEmployee | undefined
updateFieldEmployee(id, data) → FieldEmployee
deleteFieldEmployee(id) → void

// Job Logs
createJobLog(data) → JobLog
getJobLogs(filters?) → JobLog[]
getJobLog(id) → JobLog | undefined
updateJobLog(id, data) → JobLog
deleteJobLog(id) → void

// Custom Fields
createJobLogCustomField(data) → JobLogCustomField
getJobLogCustomFields() → JobLogCustomField[]
updateJobLogCustomField(id, data) → JobLogCustomField
deleteJobLogCustomField(id) → void

// Field Customers
createFieldCustomer(data) → FieldCustomer
getFieldCustomers() → FieldCustomer[]
updateFieldCustomer(id, data) → FieldCustomer
deleteFieldCustomer(id) → void

// Site Locations
createSiteLocation(data) → SiteLocation
getSiteLocations() → SiteLocation[]
updateSiteLocation(id, data) → SiteLocation
deleteSiteLocation(id) → void

// Serviced Areas
createServicedArea(data) → ServicedArea
getServicedAreas() → ServicedArea[]
updateServicedArea(id, data) → ServicedArea
deleteServicedArea(id) → void
```

All implementations are in the `DatabaseStorage` class using Drizzle ORM queries against the PostgreSQL database.
