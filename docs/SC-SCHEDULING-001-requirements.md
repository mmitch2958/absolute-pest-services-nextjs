# Feature — Admin Job Scheduling Requirements
**Project:** AbsolutePestServices.com  
**Document ID:** SC-SCHEDULING-001  
**Prepared by:** 3CP0 (Research/Product Agent)  
**Date:** 2026-03-09  
**Status:** Draft — Pending Mike Review

---

## Overview

Admin needs the ability to create, assign, and reschedule jobs for field technicians from the admin portal. Currently, job logs are created by technicians **after** work is done. This feature adds a **pre-work scheduling layer**: admin creates a job (scheduled state), assigns it to a technician, and the tech sees it on their field app before the visit.

**Goal:** Give admin full control over the job scheduling lifecycle — create, assign, reschedule, and cancel — while giving technicians a clear view of what they're expected to do and when.

**Scope (Phase 1):**
- Admin creates/assigns/reschedules jobs
- Technician sees assigned jobs in the field app
- Tech marks job started and completed (converts the scheduled job to a full job log)
- Admin calendar/list view of all scheduled jobs

---

## Context: Existing Data Model

The `job_logs` table already has a `status` field and a nullable `siteAddress`. Crucially, it **lacks an `assignedTo` / `employeeId` field that is admin-set before the job occurs** — currently `employeeId` is set by the tech at the time of log submission. The scheduling feature needs admin-initiated job creation with a pre-assigned technician.

**Key existing tables:**

| Table | Relevant Fields |
|-------|-----------------|
| `job_logs` | `id`, `employeeId`, `customerName`, `clientId`, `siteLocation`, `siteAddress`, `workPerformed`, `jobDate`, `status`, `customFields` |
| `field_employees` | `id`, `name`, `isActive` |
| `clients` | `id`, `name`, `address`, `phone`, `email` |
| `service_contracts` | `assignedEmployeeId`, `nextScheduledDate`, `siteLocation`, `servicedArea`, `frequency` |

**Current `job_logs.status` values:** `scheduled`, `in_progress`, `completed`, `invoiced`, `paid`

The `scheduled` status already exists in the schema but is never set by admin today — it's only used conceptually. This feature activates it.

---

## Job Scheduling Workflow

### Three Core Flows

```
1. Admin Creates & Assigns Job
   Admin → Create Job (form) → Assign Technician → Status: scheduled
   Tech sees it on field app → Starts job → Status: in_progress
   Tech completes job log → Status: completed

2. Admin Reschedules Job
   Job exists (scheduled or in_progress) → Admin changes jobDate or employeeId
   Tech is notified (optional, Phase 2)

3. Admin Cancels Job
   Admin cancels → Status: cancelled
   Reason recorded in notes
```

### Status State Machine

```
[Admin Creates] → scheduled
     ↓
[Tech Starts]   → in_progress
     ↓
[Tech Completes] → completed
     ↓
[Invoice Created] → invoiced
     ↓
[Invoice Paid]   → paid

[Admin Cancels from any state] → cancelled
[Admin Reschedules from scheduled] → scheduled (same record, new date/tech)
```

**Allowed transitions:**
| From | To | Actor |
|------|----|-------|
| `scheduled` | `in_progress` | Technician (field app) |
| `scheduled` | `cancelled` | Admin |
| `scheduled` | `scheduled` | Admin (reschedule — same status, updated fields) |
| `in_progress` | `completed` | Technician (field app) |
| `in_progress` | `scheduled` | Admin (un-start, if tech started by mistake) |
| `in_progress` | `cancelled` | Admin |
| `completed` | `invoiced` | Admin (via invoice creation — exists in SC-INV-001) |
| `invoiced` | `paid` | Admin (via invoice payment) |

---

## Functional Requirements

### FR-001 — Admin Creates a Scheduled Job

Admin can create a new job from the admin portal with full control over all fields before the technician arrives.

**Acceptance Criteria:**
- [ ] Admin navigates to a "Scheduling" section (new tab in admin portal)
- [ ] Admin fills out a job creation form
- [ ] Technician assignment is required — admin must select from active `field_employees`
- [ ] Scheduled date and time window are required
- [ ] Client/customer selection (from `clients` table) links the job to a client record
- [ ] On save, a `job_logs` record is created with `status = 'scheduled'` and `employeeId` set by admin
- [ ] Admin sees the new job immediately in the scheduling list/calendar

**Required Fields (create form):**
| Field | Source | Required | Notes |
|-------|--------|----------|-------|
| `employeeId` | `field_employees` dropdown | ❌ | Default "none" - can be assigned later |
| `clientId` | `clients` dropdown + search | ✅ | Select or search existing client |
| `customerName` | Auto-filled from client | ✅ | Editable override |
| `jobDate` | Date + time picker | ✅ | Stored as `timestamp` |
| `scheduledEndTime` | Time picker | ❌ | Optional estimated end time (see schema gap) |
| `siteLocation` | Text / `site_locations` lookup | ✅ | Which building/property |
| `siteAddress` | Text input | ✅ for route | Required for route optimization (SC-ROUTE-001) |
| `servicedArea` | Text / `serviced_areas` lookup | ❌ | Which area within site |
| `workPerformed` | Textarea | ✅ | What the tech should do — "instructions" when pre-scheduled |
| `priority` | `low` / `medium` / `high` / `urgent` | ✅ | Default `medium` |
| `notes` | Textarea | ❌ | Internal admin notes |
| `status` | Auto-set | — | Always `scheduled` on create |

---

### FR-002 — Admin Assigns / Reassigns a Technician

Admin can change which technician a job is assigned to at any time before the job is completed.

**Acceptance Criteria:**
- [ ] From the job detail view or scheduling calendar, admin can change `employeeId`
- [ ] Reassignment allowed on `scheduled` and `in_progress` jobs
- [ ] Reassigning a job in `in_progress` is allowed but triggers a confirmation dialog
- [ ] The reassigned tech sees the job on their field app immediately
- [ ] Reassignment is recorded (audit trail — see FR-007)

---

### FR-003 — Admin Reschedules a Job

Admin can change the scheduled date/time for a job.

**Acceptance Criteria:**
- [ ] Admin can update `jobDate` on any `scheduled` job
- [ ] Admin can optionally change `employeeId` at the same time
- [ ] `in_progress` jobs cannot be rescheduled (only reassigned or cancelled)
- [ ] Rescheduled jobs remain in `scheduled` status
- [ ] Reschedule is recorded (audit trail)

---

### FR-004 — Admin Cancels a Job

Admin can cancel a job that has not yet been completed.

**Acceptance Criteria:**
- [ ] Admin can cancel any job in `scheduled` or `in_progress` status
- [ ] Cancellation requires a reason (required text field) — stored in `notes`
- [ ] Cancelled jobs are visible in admin view with `status = 'cancelled'` (not deleted)
- [ ] Cancelled jobs do NOT appear in the field tech's app view
- [ ] Completed/invoiced/paid jobs cannot be cancelled

---

### FR-005 — Admin Scheduling Calendar / List View

**Clarification from Mike (Mar 9, 2026):**
- Jobs can be created with `employeeId = none` (unassigned)
- Tech assigned later via admin or picked up by tech on-the-fly
- Calendar must clearly show: all scheduled jobs + highlight unassigned ones
- Unassigned jobs visible to technicians - they can claim/start them from field app

### FR-005 — Admin Scheduling Calendar / List View

Admin needs a central view to see all scheduled work across all technicians.

**Acceptance Criteria:**
- [ ] New page at `/admin/scheduling` (or tab within admin portal)
- [ ] **List view (default):** Table of all jobs sorted by `jobDate`, showing:
  - Date & time | Technician | Customer | Site | Service type | Status | Actions
- [ ] **Calendar view (optional, P2):** Weekly calendar with jobs as cards on their scheduled date
- [ ] Filter by: technician, date range, status
- [ ] Status badges with color coding:
  - `scheduled` → blue
  - `in_progress` → amber
  - `completed` → green
  - `cancelled` → gray
  - `invoiced` / `paid` → teal
- [ ] Click a job row to open a detail/edit panel (inline drawer or modal)
- [ ] "Create Job" button opens the job creation form (FR-001)
- [ ] Jobs originating from `service_contracts` are visually distinguished (e.g., contract icon)

---

### FR-006 — Technician Sees Assigned Jobs in Field App

Field technicians need to see upcoming assigned jobs before they start their day.

**Acceptance Criteria:**
- [ ] After PIN login, the field app home screen shows a "My Jobs" section listing jobs assigned to the tech
- [ ] Shows: today's jobs prominently, upcoming jobs in a collapsible section
- [ ] Each job card shows: customer name, site address, scheduled time, job description
- [ ] Tech can tap a job to see full details
- [ ] Tech sees a "Start Job" button on the job detail (transitions `status → in_progress`)
- [ ] On "Start Job": the job log pre-fills with the admin-set data; tech adds real-time notes/photos
- [ ] Tech sees a "Complete Job" button (transitions `status → completed`; triggers full job log completion flow including photos and custom fields)
- [ ] Cancelled jobs are NOT visible to techs
- [ ] If tech has no assigned jobs today, they see a "No jobs scheduled for today" message (and can still submit manual job logs as before)

**Backward compatibility:** Manual job log submission (existing field log flow) remains available. Scheduling is additive, not a replacement.

---

### FR-007 — Job Scheduling Audit Trail

All admin actions on a job should be recorded for accountability.

**Acceptance Criteria:**
- [ ] A `job_schedule_logs` table records: who changed what, when, old value → new value
- [ ] Tracked events: `created`, `assigned`, `reassigned`, `rescheduled`, `cancelled`, `started`, `completed`
- [ ] Admin can view audit log for a specific job in the detail panel
- [ ] Log entries are read-only (no delete)

---

### FR-008 — Service Contract Auto-Scheduling (Phase 2 — Out of Scope for P1)

The `service_contracts` table already has `frequency`, `nextScheduledDate`, and `assignedEmployeeId`. A future feature will auto-generate `job_logs` records from active contracts on their scheduled dates. **Phase 1 does not implement this** — it is manual scheduling only.

The schema already supports this via `service_contracts.lastGeneratedJobDate`. Phase 2 will use that field to prevent duplicate job generation.

---

## Schema Changes Required

### Extend `job_logs` Table

The existing `job_logs` table needs additional fields to support admin-initiated scheduling:

```typescript
// Add to job_logs in shared/schema.ts
scheduledBy: integer("scheduled_by").references(() => users.id),        // Admin who created the schedule
scheduledEndTime: timestamp("scheduled_end_time"),                       // Optional end of time window
adminNotes: text("admin_notes"),                                         // Admin-only internal notes
priority: text("priority").notNull().default("medium"),                  // low, medium, high, urgent
cancelledAt: timestamp("cancelled_at"),
cancelledBy: integer("cancelled_by").references(() => users.id),
```

> **Note:** `employeeId` on `job_logs` currently maps to the tech who submitted the log. With scheduling, it also becomes the pre-assigned tech. This dual role is fine — the field remains `employeeId`. The distinction is that admin sets it at creation time instead of the tech setting it at submission time.

### New Table: `job_schedule_logs` (Audit Trail)

```typescript
export const jobScheduleLogs = pgTable("job_schedule_logs", {
  id: serial("id").primaryKey(),
  jobLogId: integer("job_log_id").notNull().references(() => jobLogs.id, { onDelete: "cascade" }),
  actorId: integer("actor_id"),              // users.id (admin) or fieldEmployees.id (tech)
  actorType: text("actor_type").notNull(),   // 'admin' | 'technician' | 'system'
  event: text("event").notNull(),            // 'created' | 'assigned' | 'reassigned' | 'rescheduled' | 'cancelled' | 'started' | 'completed'
  fieldChanged: text("field_changed"),       // e.g. 'employeeId', 'jobDate'
  oldValue: text("old_value"),
  newValue: text("new_value"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

## API Requirements

### New Admin Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/admin/schedule` | Admin | List all scheduled jobs. Query params: `employeeId`, `status`, `dateFrom`, `dateTo` |
| `POST` | `/api/admin/schedule` | Admin | Create a new scheduled job. Returns the created `JobLog` with `status = 'scheduled'` |
| `GET` | `/api/admin/schedule/:id` | Admin | Get job detail including audit log |
| `PATCH` | `/api/admin/schedule/:id` | Admin | Update: assign/reassign tech, reschedule date, update fields |
| `PATCH` | `/api/admin/schedule/:id/cancel` | Admin | Cancel a job. Body: `{ reason: string }` |
| `GET` | `/api/admin/schedule/stats` | Admin | Counts by status for dashboard widget |

### Extend Existing Field Endpoints

| Method | Path | Change |
|--------|------|--------|
| `GET` | `/api/field/job-logs` | Add: return `scheduled` and `in_progress` jobs for the authenticated tech, sorted by `jobDate` |
| `PATCH` | `/api/field/job-logs/:id/start` | New: Tech starts a job → `status = in_progress`, records `startedAt` timestamp |
| `PATCH` | `/api/field/job-logs/:id/complete` | New: Tech completes a job → `status = completed`, accepts full job log payload (notes, photos, custom fields) |

### Request/Response Shapes

#### `POST /api/admin/schedule` Request Body
```typescript
{
  employeeId: number;          // required — active field employee
  clientId: number;            // required — links to clients table
  customerName?: string;       // optional override; defaults to client name
  jobDate: string;             // ISO 8601 datetime — required
  scheduledEndTime?: string;   // ISO 8601 datetime — optional
  siteLocation: string;        // required
  siteAddress?: string;        // recommended for route optimization
  servicedArea?: string;
  workPerformed: string;       // required — job instructions
  priority?: 'low' | 'medium' | 'high' | 'urgent';  // default: 'medium'
  adminNotes?: string;
}
```

#### `POST /api/admin/schedule` Response
```typescript
{
  id: number;
  status: 'scheduled';
  employeeId: number;
  employeeName: string;        // joined from field_employees
  clientId: number;
  clientName: string;          // joined from clients
  customerName: string;
  jobDate: string;
  siteLocation: string;
  siteAddress: string | null;
  workPerformed: string;
  priority: string;
  adminNotes: string | null;
  createdAt: string;
  scheduledBy: number;
}
```

#### `PATCH /api/admin/schedule/:id` Request Body (Reschedule / Reassign)
```typescript
{
  employeeId?: number;         // reassign to different tech
  jobDate?: string;            // reschedule to new date/time
  scheduledEndTime?: string;
  siteLocation?: string;
  siteAddress?: string;
  workPerformed?: string;
  adminNotes?: string;
  priority?: string;
}
```

#### `GET /api/admin/schedule` Response
```typescript
{
  jobs: Array<{
    id: number;
    status: string;
    jobDate: string;
    employeeId: number;
    employeeName: string;
    clientId: number | null;
    customerName: string;
    siteLocation: string;
    siteAddress: string | null;
    workPerformed: string;
    priority: string;
    createdAt: string;
  }>;
  total: number;
}
```

#### `GET /api/field/job-logs` (Extended for Scheduling)
The existing endpoint returns completed logs for the tech. Extend to include upcoming/active jobs:
```typescript
{
  scheduledJobs: JobLog[];     // status = 'scheduled', sorted by jobDate asc
  activeJobs: JobLog[];        // status = 'in_progress'  
  completedJobs: JobLog[];     // status = 'completed' (existing behavior)
}
```

---

## Non-Functional Requirements

- **NFR-001 — Performance:** Schedule list for a single day must load in < 2s even with 50 jobs
- **NFR-002 — Auth:** Admin scheduling endpoints require `requireAdmin` middleware. Field start/complete endpoints require `requireFieldAuth` and validate that the job belongs to the authenticated tech (`job.employeeId === session.fieldEmployeeId`)
- **NFR-003 — Backward compatibility:** Existing field log submission flow (`POST /api/field/job-logs`) remains unchanged. Techs can still manually submit job logs not tied to an admin-created schedule
- **NFR-004 — Data integrity:** A tech cannot start or complete a job not assigned to them. Server enforces ownership check
- **NFR-005 — No orphan jobs:** If a client is deleted (soft or hard), scheduled jobs retain their `clientId` but display a fallback customer name
- **NFR-006 — Audit log:** Every state transition is written to `job_schedule_logs`. Never modify or delete audit log entries

---

## User Stories

| # | Story | Priority |
|---|-------|----------|
| US-1 | As an admin, I want to create a scheduled job and assign it to a technician, so work is pre-planned before the tech's day begins | P0 |
| US-2 | As an admin, I want to see all scheduled jobs in a list view filtered by tech and date, so I can manage the day's workload | P0 |
| US-3 | As an admin, I want to reassign a job to a different technician, so I can handle last-minute changes | P0 |
| US-4 | As an admin, I want to reschedule a job to a different date, so I can handle cancellations and rescheduling | P0 |
| US-5 | As an admin, I want to cancel a job with a reason, so cancelled work is tracked and not lost | P0 |
| US-6 | As a technician, I want to see my assigned jobs for today from the field app, so I know what to do without calling the office | P0 |
| US-7 | As a technician, I want to start a job from the field app, so admin can track real-time progress | P1 |
| US-8 | As a technician, I want to complete a job and add my notes/photos, so the job log is filled from the scheduled job | P0 |
| US-9 | As an admin, I want to see an audit trail for each job showing who changed what and when | P1 |
| US-10 | As an admin, I want a dashboard count of today's scheduled, in-progress, and completed jobs | P1 |

---

## Assumptions

1. The existing `job_logs.status` field is extended (not replaced) — existing data is unaffected
2. `field_employees` table is the source of technicians for scheduling (not `users`)
3. Jobs are always associated with exactly one technician (no multi-tech jobs in Phase 1)
4. Admin creates jobs from a desktop browser; techs consume scheduled jobs from mobile
5. Scheduled jobs that are never started by end of day are NOT automatically cancelled — they remain `scheduled` for admin to resolve the next day
6. Service contract auto-scheduling (generating jobs from `service_contracts`) is Phase 2; Phase 1 is admin-manual only
7. SMS/push notification to technician when a new job is assigned is Phase 2 — not in scope for Phase 1

---

## Open Questions

| # | Question | Needed For | Owner |
|---|----------|------------|-------|
| OQ-1 | **Time windows:** Does the admin schedule jobs at a specific time (e.g., 9:00 AM) or just a date? Do customers have requested time windows that should be visible to the tech? | FR-001 | Mike |
| OQ-2 | **Recurring jobs:** Should admin be able to schedule a recurring job (weekly, monthly) directly from the scheduling UI, or is that only via `service_contracts`? | FR-001, FR-008 | Mike |
| OQ-3 | **Tech notification:** When admin assigns a job, should the tech be notified? If so, via SMS (Twilio) or in-app only? | FR-006 | Mike |
| OQ-4 | **Calendar view priority:** Is a calendar/week view needed at launch (P1) or can Phase 1 ship with list view only? | FR-005 | Mike |
| OQ-5 | **Multi-job clients:** Can one client have multiple jobs on the same day assigned to different techs? (Affects display grouping logic) | FR-005 | Mike |
| OQ-6 | **Partial completion:** Can a tech mark a job as partially done and come back to it? Or is it always fully completed in one visit? | FR-006 | Mike |
| OQ-7 | **Priority field:** Does `job_logs` already handle a `priority` field? (Not present in current schema — needs to be added) | Schema | Dev |
| OQ-8 | **Field app home screen:** Does the field app home screen currently exist, or is `/field` just a login redirect to `/field/log`? The "My Jobs" section (FR-006) needs a home screen to land on | FR-006 | Dev |
| OQ-9 | **Conflict detection:** Should admin be warned when scheduling two jobs for the same tech at overlapping times? | FR-001 | Mike |

---

## Schema Change Workflow (for Akbar/Luke)

Per `ARCHITECTURE.md`:
1. Edit `shared/schema.ts`:
   - Add `scheduledBy`, `scheduledEndTime`, `adminNotes`, `priority`, `cancelledAt`, `cancelledBy` columns to `job_logs`
   - Add `job_schedule_logs` table + insert schema + types
2. Run `npm run db:push`
3. Update `IStorage` interface in `server/storage.ts`:
   - `createScheduledJob(data)` → `JobLog`
   - `getScheduledJobs(filters)` → `JobLog[]`
   - `updateScheduledJob(id, data)` → `JobLog`
   - `cancelScheduledJob(id, reason, adminId)` → `JobLog`
   - `getJobScheduleLogs(jobLogId)` → `JobScheduleLog[]`
   - `createJobScheduleLog(data)` → `JobScheduleLog`
4. Add routes in `server/routes.ts`
5. Build frontend pages: `/admin/scheduling` (list + create + edit), field app "My Jobs" home screen

---

## Integration Points

| System | Integration |
|--------|------------|
| **SC-ROUTE-001 (Route Optimization)** | Scheduled jobs (status = `scheduled`) are the primary input to the route optimizer. `siteAddress` on the scheduled job is required for geocoding |
| **SC-INV-001 (Invoice Management)** | Completed jobs (`status = 'completed'`) can be converted to invoices. Invoice creation already expects a `jobLogId` |
| **SC-REMINDERS-001 (Reminders)** | Scheduled jobs should trigger the 24h and same-day reminder system if the customer has contact info |
| **SC-TIME-001 (Time Tracking)** | "Start Job" by tech could trigger a `shiftTimeBlock` with `blockType = 'job'` and `jobLogId` set automatically |

---

## Out of Scope (Phase 1)

- Auto-generation of jobs from `service_contracts` (Phase 2)
- Customer-facing scheduling / appointment booking (separate feature)
- SMS/push notifications to technician on job assignment
- Calendar week/month view (list view only in Phase 1)
- Multi-technician jobs
- Conflict detection / double-booking prevention
- Mobile offline scheduling (admin always on desktop)
- Bulk scheduling (import from CSV or calendar)

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-09 | 3CP0 | Initial draft |
