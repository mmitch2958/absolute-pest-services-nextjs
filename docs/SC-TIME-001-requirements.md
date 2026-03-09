# SC-TIME-001 — Time Tracking Requirements
**Project:** AbsolutePestServices.com  
**Feature:** Feature #14 — Field Technician Time Tracking  
**Prepared by:** 3CP0 (Research/Product Agent)  
**Date:** 2026-03-09  
**Status:** Draft — Pending Mike Review  

---

## Overview

Field technicians at Absolute Pest Services need a way to track time spent on the job — from shift start to finish, including per-job time on site and breaks. This data enables accurate payroll processing, overtime compliance, admin oversight, and eventually integration with external payroll providers.

This document covers the complete time tracking lifecycle: clock in/out workflow, per-job vs. shift time, break tracking, overtime rules, admin reporting, GPS verification options, payroll integration pathway, and API requirements.

---

## Context & Constraints

- **Existing system:** Field technicians log in via PIN (`fieldEmployees.pin`). They already submit `jobLogs` per service visit.
- **No existing shift/time tracking tables.** This feature adds new schema.
- **Stack:** TypeScript, Express, Drizzle ORM, PostgreSQL (Neon), React + Vite, TanStack Query (see `ARCHITECTURE.md`).
- **Field portal:** Mobile-first UI accessed by technicians. Existing bottom nav (`field-nav.tsx`) must accommodate time tracking entry points.
- **Labor law scope:** Pennsylvania jurisdiction; FLSA overtime applies (non-exempt field workers). See §FR-030 and §NFR-004.

---

## Functional Requirements

### FR-001 — Shift Clock In
- A field technician can clock in to start their workday shift from the field portal
- Clock-in captures: `employee_id`, `clock_in_at` (UTC timestamp), and optionally GPS coordinates at time of punch
- Only one active shift allowed per employee at a time (enforce server-side)
- If a shift is already open, the UI should show "You're already clocked in" and offer the option to clock out

### FR-002 — Shift Clock Out
- A field technician can clock out to end their shift
- Clock-out captures: `clock_out_at` (UTC timestamp), optional GPS coordinates, optional end-of-day notes
- Cannot clock out if no active shift exists
- System calculates `total_shift_minutes` = clock-out minus clock-in minus all break durations
- After clock-out, shift is immutable by the technician (admin can correct)

### FR-003 — Per-Job Time Tracking (Time on Site)
- When a technician starts a job, they can record "arrived on site" → links to an existing `jobLogs` record
- When leaving a job site, technician records "departed site"
- Time on site = departed_at minus arrived_at
- A shift can contain zero or more per-job time blocks
- Per-job entries must be associated to a `jobLogs.id`; unassociated "travel" time blocks are allowed (type = `travel`)
- Per-job time blocks must fall within the parent shift window

### FR-004 — Break Tracking
- Technician can start and end break periods during an active shift
- Break types supported: `meal` (30+ min, typically unpaid), `rest` (short, 5–15 min, typically paid)
- Only one break at a time per employee
- Break records include: `break_start_at`, `break_end_at`, `break_type`, `break_minutes` (auto-calculated on end)
- Technician cannot clock out while a break is in progress (must end break first)
- Admin can manually add/edit/delete break records (with audit log)

### FR-005 — Paid vs. Unpaid Break Configuration
- Admin can configure per-break-type pay status: `rest` breaks default to **paid**, `meal` breaks default to **unpaid**
- Unpaid break duration is subtracted from `total_shift_minutes` for payroll calculations
- Paid break duration is included in total shift time

### FR-006 — Overtime Calculation
- System calculates overtime using FLSA standard: **>40 hours in a workweek = 1.5× regular rate**
- **Workweek definition:** Admin-configurable start day (default: Monday 00:00 local time)
- Overtime displayed in admin reports as: `regular_hours`, `overtime_hours`, and `overtime_multiplier` (1.5)
- Pennsylvania does not require daily overtime (only weekly), so daily OT is **not** calculated in v1
- Double-time is **out of scope** for v1
- Overtime amounts are informational in v1 — payroll dollar calculations deferred to payroll integration (see §FR-040)

### FR-007 — Technician Self-View
- Technician can view their own time history from the field portal
- Displays: date, clock-in, clock-out, total hours, breaks, per-job time blocks
- No editing by technician — read-only
- Current active shift status ("You've been clocked in for 3h 42m") shown on field portal home/dashboard

### FR-008 — Admin Corrections
- Admin can edit any time entry: clock-in/out times, break records, per-job blocks
- All edits must produce an audit log entry: `actor_id`, `field_changed`, `old_value`, `new_value`, `reason` (optional text), `corrected_at`
- Admin can add missed punch-ins or punch-outs (open shifts flagged in UI)

### FR-009 — Open Shift Detection
- If a shift has been open > `N` hours (configurable, default: 14 hours), flag it as an **open/unclosed shift**
- Admin sees flagged open shifts in a dedicated view
- System does **not** auto-close open shifts; admin must manually resolve
- Optional: send email notification to `rob@absolutepestservices.com` when an open shift is detected (same email pattern as existing notifications)

### FR-010 — Timesheet Period Summary
- Admin can view a timesheet summary by pay period
- Pay period type: configurable (weekly, bi-weekly — default bi-weekly)
- Summary per employee per period: total regular hours, total overtime hours, total break time, days worked
- Exportable as CSV (v1); PDF export deferred to v2

### FR-011 — Admin Time Report: Who Worked, When, How Long
- Admin reports page: list all employees with time entries filterable by:
  - Employee name
  - Date range
  - Pay period
- Per-employee detail drill-down: shift-by-shift breakdown with per-job time blocks
- Total hours per employee per date range
- Visual indicator for days with overtime

### FR-012 — Per-Job Time Summary
- Admin and reports can show time per `jobLog`:
  - Employee, job date, site location, time on site (minutes/hours)
- Useful for job costing and billing analysis
- Linkable from the existing job log detail view

---

## GPS / Location Verification (Optional — v1.5)

### FR-020 — GPS Capture on Clock Events
- At clock-in, clock-out, job arrival, and job departure, the mobile browser's Geolocation API is called
- Coordinates stored: `latitude`, `longitude`, `accuracy_meters`, `captured_at`
- GPS is **best-effort**: if permission denied or unavailable, punch still succeeds (logged with `gps_status: denied | timeout | captured`)
- No hard block on punch due to GPS failure

### FR-021 — Geofencing (Future / v2)
- Admin can define a geofence radius per `siteLocation`
- If technician clocks a job arrival outside the geofence, a warning flag is added to the record (soft enforcement only in v2)
- Hard enforcement (blocking punch outside geofence) is **out of scope** until confirmed with Mike

### FR-022 — GPS Audit View
- Admin can see GPS coordinates on a map for a selected shift (using a lightweight map embed or Google Maps link)
- Flagged punches (outside expected area) are highlighted

---

## Payroll Integration (Future — v2+)

### FR-040 — Payroll Export (v2)
- Export approved timesheets in standard formats:
  - **QuickBooks Time** compatible CSV
  - **ADP** export format (flat CSV with employee ID, hours, OT hours, period)
  - Generic CSV fallback
- Export is manual trigger by admin in v1; webhook/API push in v2+

### FR-041 — Employee ID Mapping
- `fieldEmployees` table to gain an optional `external_payroll_id` field for mapping to QuickBooks/ADP employee records
- Admin can set this ID per employee from the admin portal

### FR-042 — Timesheet Approval Workflow (v2)
- Admin reviews and "approves" a pay period timesheet per employee before export
- Approved timesheets are locked (no further edits without override + audit log)
- Status: `pending_review` → `approved` → `exported`

---

## Data Model

### New Tables

#### `shifts`
| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `employee_id` | integer FK → `field_employees.id` | |
| `clock_in_at` | timestamp (UTC) | |
| `clock_out_at` | timestamp (UTC) | null = shift still open |
| `clock_in_gps` | jsonb | `{ lat, lng, accuracy, status }` |
| `clock_out_gps` | jsonb | optional |
| `clock_in_notes` | text | optional |
| `clock_out_notes` | text | optional |
| `total_shift_minutes` | integer | computed on clock-out; null while open |
| `status` | text | `open`, `closed`, `flagged` |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

#### `shift_time_blocks`
| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `shift_id` | integer FK → `shifts.id` | |
| `employee_id` | integer FK → `field_employees.id` | denormalized for query ease |
| `block_type` | text | `job`, `travel`, `admin` |
| `job_log_id` | integer FK → `job_logs.id` | nullable; required when `block_type = job` |
| `started_at` | timestamp (UTC) | |
| `ended_at` | timestamp (UTC) | null = currently on site |
| `duration_minutes` | integer | computed on end |
| `arrival_gps` | jsonb | optional |
| `departure_gps` | jsonb | optional |
| `notes` | text | optional |
| `created_at` | timestamp | |

#### `shift_breaks`
| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `shift_id` | integer FK → `shifts.id` | |
| `employee_id` | integer FK → `field_employees.id` | denormalized |
| `break_type` | text | `rest`, `meal` |
| `is_paid` | boolean | derived from break type config; stored for immutability |
| `break_start_at` | timestamp (UTC) | |
| `break_end_at` | timestamp (UTC) | null = break in progress |
| `break_minutes` | integer | computed on end |
| `notes` | text | optional |
| `created_at` | timestamp | |

#### `time_entry_audit_log`
| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `entity_type` | text | `shift`, `shift_time_block`, `shift_break` |
| `entity_id` | integer | FK to respective table |
| `actor_id` | integer | FK to `users.id` (admin) or `field_employees.id` |
| `actor_type` | text | `admin`, `employee`, `system` |
| `field_changed` | text | column name |
| `old_value` | text | |
| `new_value` | text | |
| `reason` | text | optional |
| `corrected_at` | timestamp | |

### Modified Tables

#### `field_employees` — add columns
| Column | Type | Notes |
|--------|------|-------|
| `hourly_rate` | decimal(10,2) | optional; for overtime calculations |
| `external_payroll_id` | text | optional; for payroll system mapping |

---

## API Requirements

> All endpoints follow existing project conventions: Express.js, authenticated via session, REST-style, JSON request/response, standard HTTP status codes.

### Technician Endpoints (Field Portal — PIN authenticated)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/field/shifts/clock-in` | Start a new shift |
| `POST` | `/api/field/shifts/clock-out` | End active shift |
| `GET` | `/api/field/shifts/active` | Get current open shift (if any) |
| `GET` | `/api/field/shifts` | List own shifts (paginated) |
| `POST` | `/api/field/shifts/:shiftId/time-blocks` | Record job arrival |
| `PATCH` | `/api/field/shifts/:shiftId/time-blocks/:blockId/end` | Record job departure |
| `POST` | `/api/field/shifts/:shiftId/breaks` | Start a break |
| `PATCH` | `/api/field/shifts/:shiftId/breaks/:breakId/end` | End a break |
| `GET` | `/api/field/shifts/:shiftId` | Get shift detail (read-only) |

### Admin Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/shifts` | List shifts (filter: employee, date range, status) |
| `GET` | `/api/admin/shifts/:id` | Get shift detail with blocks and breaks |
| `PATCH` | `/api/admin/shifts/:id` | Edit shift (clock times, status, notes) |
| `POST` | `/api/admin/shifts/:id/time-blocks` | Add missed time block |
| `PATCH` | `/api/admin/shifts/:id/time-blocks/:blockId` | Edit time block |
| `DELETE` | `/api/admin/shifts/:id/time-blocks/:blockId` | Remove time block |
| `POST` | `/api/admin/shifts/:id/breaks` | Add missed break |
| `PATCH` | `/api/admin/shifts/:id/breaks/:breakId` | Edit break |
| `DELETE` | `/api/admin/shifts/:id/breaks/:breakId` | Remove break |
| `GET` | `/api/admin/time-reports/summary` | Pay period summary by employee |
| `GET` | `/api/admin/time-reports/employee/:id` | Shift-by-shift detail for employee |
| `GET` | `/api/admin/time-reports/job/:jobLogId` | Time on site for a specific job log |
| `GET` | `/api/admin/time-reports/open-shifts` | List open/flagged shifts |
| `GET` | `/api/admin/time-reports/export` | CSV export (query: period, employeeIds) |
| `PATCH` | `/api/admin/employees/:id/payroll-id` | Set external payroll ID |

### Request/Response Notes
- All timestamps: ISO 8601 UTC strings (`2026-03-09T18:00:00Z`)
- GPS payload shape: `{ lat: number, lng: number, accuracy: number, status: "captured" | "denied" | "timeout" }`
- Pagination: `?page=1&limit=50` on list endpoints
- Errors: `{ error: string, code: string }` with appropriate HTTP status

---

## Non-Functional Requirements

### NFR-001 — Mobile Performance
- Clock-in/out must complete in <2 seconds on a 3G connection
- Field portal time tracking pages must be mobile-first, thumb-friendly (large tap targets)
- Offline tolerance: if GPS times out (>5s), punch still proceeds without GPS

### NFR-002 — Data Integrity
- Server enforces: only one open shift per employee, only one active break per shift, time blocks must be within shift window
- All computed fields (`total_shift_minutes`, `duration_minutes`, `break_minutes`) recomputed server-side, never trusted from client input
- Shift and break records are append-only from the technician's perspective; edits only via admin with audit log

### NFR-003 — Audit Completeness
- Every admin edit to a time record must produce an `time_entry_audit_log` row
- Audit log is immutable (no DELETEs on audit table)

### NFR-004 — FLSA Compliance
- System must correctly identify workweek boundaries for overtime calculation
- Workweek is configurable (default Monday–Sunday)
- `overtime_hours` = max(0, total_hours_in_week - 40)
- Pennsylvania law reference: no state daily OT requirement; FLSA federal standard applies
- *Disclaimer: This system provides time data to support payroll compliance; final legal compliance responsibility rests with Absolute Pest Services and their payroll provider.*

### NFR-005 — Security
- Technicians can only see their own time records
- Admin-only endpoints require admin session
- No time record modification allowed by technician after shift is closed

### NFR-006 — Scalability
- Design for up to 25 field employees in v1; schema should not block growth to 200
- Indexes required: `shifts(employee_id)`, `shifts(clock_in_at)`, `shift_time_blocks(shift_id)`, `shift_breaks(shift_id)`

---

## User Stories

### Technician Stories

**As a** field technician,  
**I want** to clock in from my phone at the start of my day,  
**So that** my shift start time is accurately recorded without paperwork.

**Acceptance Criteria:**
- [ ] Given I am logged into the field portal, when I tap "Clock In," my shift begins and I see a running timer
- [ ] Given I am already clocked in, when I visit the clock-in page, I see my current shift duration and a clock-out button
- [ ] Given I tap "Clock In," then the system records my GPS coordinates (if permitted)

---

**As a** field technician,  
**I want** to record when I arrive at and leave a job site,  
**So that** my time on each job is tracked separately from drive time.

**Acceptance Criteria:**
- [ ] Given I have an active shift, when I tap "Arrive at Job," I can select a job log from my day and start a time block
- [ ] Given I have an active job time block, when I tap "Depart Job," the block closes and shows me how long I was on site
- [ ] Given I complete all jobs, I can still clock out my shift normally

---

**As a** field technician,  
**I want** to log a break during my shift,  
**So that** my unpaid meal time is not counted toward my work hours.

**Acceptance Criteria:**
- [ ] Given I have an active shift, when I start a meal break, the running shift timer shows break is in progress
- [ ] Given I am on a break, when I tap "End Break," my break time is recorded and shift timer resumes
- [ ] Given I try to clock out while on a break, then the system blocks it and prompts me to end my break first

---

### Admin Stories

**As an** admin,  
**I want** to see who is currently clocked in and how long they've been on shift,  
**So that** I have real-time visibility into my field team's status.

**Acceptance Criteria:**
- [ ] Given I visit the admin dashboard, I see a "Live Shifts" panel showing all currently clocked-in employees and their elapsed time
- [ ] Given an employee has been clocked in for more than 14 hours, I see a flag/alert on their shift

---

**As an** admin,  
**I want** to view a weekly timesheet summary per employee,  
**So that** I can prepare for payroll processing.

**Acceptance Criteria:**
- [ ] Given I select a pay period and employee, I see total regular hours, overtime hours, and break time
- [ ] Given total hours exceed 40 for the week, overtime hours are clearly highlighted
- [ ] Given I click "Export CSV," I receive a file with all employees' hours for the selected period

---

**As an** admin,  
**I want** to correct a technician's time entry if they forgot to clock out,  
**So that** the payroll data remains accurate.

**Acceptance Criteria:**
- [ ] Given I select an open shift, I can set a clock-out time and save it
- [ ] Given I make an edit, the system records my user ID, the changed field, old and new values, and a timestamp in the audit log
- [ ] Given a technician views their history, they see the corrected time (no indication it was edited, unless admin chooses to add a note)

---

**Priority:** P1 (post-invoice, pre-payroll integration)  
**Dependencies:** 
- `SC-INV-001` (Invoice Management) — job time data feeds invoicing  
- `SC-REC-001` (Service Contracts) — job logs must exist before time blocks can be attached

---

## Assumptions

1. Field technicians primarily use personal smartphones (iOS/Android mobile browsers); a native app is not in scope.
2. All technicians are hourly, non-exempt employees under FLSA — no exempt-employee carve-outs needed in v1.
3. The workweek is Mon–Sun unless Mike configures otherwise.
4. Meal breaks (≥30 min) are unpaid; short rest breaks are paid. This mirrors standard PA employer practice.
5. GPS location capture is via the browser Geolocation API — no native app permissions required.
6. Payroll processing currently happens outside this system (manually or in QuickBooks); integration is v2.
7. There is no existing timesheet or punch data to migrate.
8. Admin is `rob@absolutepestservices.com` plus any other admin-role users.

---

## Open Questions

> These need Mike's input before implementation begins.

| # | Question | Impact |
|---|----------|--------|
| OQ-1 | What is the current pay period cadence — weekly or bi-weekly? | Pay period report grouping |
| OQ-2 | Should rest/short breaks be paid? (Common practice, but confirm.) | Break pay config defaults |
| OQ-3 | Do you want email alerts when a shift has been open >14 hours? | FR-009 email trigger |
| OQ-4 | Is hourly rate stored in the system, or is it handled entirely in QuickBooks/payroll? | Whether to add `hourly_rate` to `field_employees` |
| OQ-5 | Which payroll system do you use — QuickBooks, ADP, Gusto, other? | FR-040 export format priority |
| OQ-6 | Do you want GPS location capture as a hard requirement, or optional/best-effort? | NFR-001 GPS timeout handling |
| OQ-7 | Should per-job time blocks be required when doing a job, or optional (tech may just use shift total)? | FR-003 enforcement level |
| OQ-8 | Do you need a "timesheet approval" step where admin approves before export, or is review + CSV export sufficient for v1? | FR-042 scope |
| OQ-9 | How many active field technicians currently? (Scaling and UI considerations.) | NFR-006 |

---

## Research Sources

- FLSA overtime rules for field service technicians (non-exempt): [FLSA overview](https://www.overtime-flsa.com/job-types-industries/services-techs-and-installers/)
- 2024 FLSA salary threshold updates: DOL final rule (July 2024, Jan 2025)
- Field service time tracking best practices: BuildOps, FieldServicely, ClockShark, Jobber product documentation
- Pennsylvania labor law: PA Dept. of Labor — no state daily OT requirement; FLSA weekly standard applies
- GPS Geolocation API: MDN Web Docs (browser-native, no native app required)
- API design conventions: TrackingTime API guidelines, Productive.io API docs

---

## Handoff Notes for Akbar (Architecture)

1. **New tables needed:** `shifts`, `shift_time_blocks`, `shift_breaks`, `time_entry_audit_log`
2. **Schema additions to `field_employees`:** `hourly_rate`, `external_payroll_id`
3. **Consider:** Computed columns (`total_shift_minutes`) — calculate in app layer on clock-out vs. DB trigger. Recommend app layer for Neon serverless compat.
4. **Index strategy:** See NFR-006 — index on `employee_id` and `clock_in_at` columns.
5. **Overlap constraint:** Enforce no overlapping time blocks within a shift at the DB or app layer.
6. **Timezone:** Store all timestamps in UTC; display in America/New_York in UI.

## Handoff Notes for Luke (Build)

1. **Field portal UI additions:**
   - Clock In/Out button on field portal home (persistent, prominent)
   - Job arrival/departure flow integrated into existing job log selection
   - Break start/end accessible from the active shift screen
2. **Admin portal additions:**
   - "Live Shifts" widget on admin dashboard
   - Time Reports page (new admin route)
   - Edit/correction modal on individual shift records
   - CSV export button in Time Reports
3. **Existing field portal auth:** Use existing PIN session (`fieldEmployees`) for all technician time tracking calls
4. **Follow existing patterns:** `server/storage.ts` IStorage interface, `shared/schema.ts` Drizzle tables, `server/routes.ts` endpoints
