# Feature #6 — Dashboard Analytics Requirements
**Project:** AbsolutePestServices.com  
**Document ID:** SC-DA-001  
**Prepared by:** 3CP0 (Research/Product Agent)  
**Date:** 2026-03-09  
**Status:** Draft — Pending Mike Review

---

## Overview

The admin portal currently has a `/admin/dashboards` page that allows creating and labeling dashboard configurations (project, client, overview types), but it has no actual analytics, KPIs, or charts. This feature delivers a real, data-driven analytics dashboard for the admin — sourcing data from the live operational tables already in the system.

The goal is to give the admin (Rob at Absolute Pest Services) an at-a-glance command center: job activity, revenue, field team productivity, client health, and upcoming workload — all without leaving the admin portal.

---

## Functional Requirements

### FR-001 — Overview KPI Cards (Top of Dashboard)
Admin sees a row of at-a-glance KPI stat cards showing:

| KPI | Description | Data Source |
|-----|-------------|-------------|
| Jobs This Month | Count of `jobLogs` where `jobDate` is in the current calendar month | `job_logs` |
| Jobs This Week | Count of `jobLogs` where `jobDate` is in the current ISO week | `job_logs` |
| Active Clients | Count of `clients` where `status = 'active'` | `clients` |
| Active Contracts | Count of `serviceContracts` where `isActive = true` | `service_contracts` |
| Open Service Requests | Count of `serviceRequests` where `status` ∈ {pending, scheduled} | `service_requests` |
| Overdue Invoices | Count of invoices (Feature #5) where `status = 'overdue'` — placeholder/0 until Feature #5 ships | `invoices` (future) |
| Outstanding Revenue | Sum of unpaid invoice totals — placeholder until Feature #5 ships | `invoices` (future) |

Each card shows: current value, label, optional trend indicator (up/down/flat vs. previous period). Cards are non-interactive stat displays only in v1.

---

### FR-002 — Jobs Over Time Chart (Line or Bar)
A time-series chart showing job volume over the past 12 months (one bar/point per month).

- **Chart type:** Bar chart (monthly buckets) with optional line overlay for trend
- **X-axis:** Month labels (e.g., "Mar '25" … "Feb '26")
- **Y-axis:** Job count
- **Data source:** `job_logs.jobDate` — COUNT grouped by `DATE_TRUNC('month', job_date)`
- **Interaction:** Hover tooltip shows exact count and month
- **Date range control:** Default 12 months; dropdown to change to 6 months or current year

---

### FR-003 — Jobs by Service Type / Area (Pie or Donut)
A breakdown of jobs by service type or serviced area.

- **Chart type:** Donut chart
- **Segments:** Top 6 values + "Other" bucket
- **Toggle:** Admin can switch between "by Serviced Area" and "by Service Type" (using `jobLogs.servicedArea` and `jobLogs.workPerformed` category — see Open Questions)
- **Data source:** `job_logs` — COUNT grouped by `serviced_area` or derived service category
- **Interaction:** Hover tooltip shows segment label, count, and % of total

---

### FR-004 — Jobs by Status Breakdown (Stacked Bar or Donut)
Visual breakdown of all job log statuses.

- **Statuses tracked:** `scheduled`, `in_progress`, `completed`, `invoiced`, `paid`
- **Chart type:** Horizontal bar chart showing absolute counts per status, color-coded
- **Scope:** All-time total (not time-bounded)
- **Data source:** `job_logs.status` — COUNT grouped by status
- **Interaction:** Clicking a status row filters the job log table below (see FR-009)

---

### FR-005 — Field Employee Productivity Table
A tabular breakdown of each field employee's job count and activity.

| Column | Description |
|--------|-------------|
| Employee Name | `fieldEmployees.name` |
| Jobs (This Month) | COUNT of `jobLogs` for this employee in current month |
| Jobs (All Time) | COUNT of `jobLogs` for this employee ever |
| Last Job Date | Most recent `jobLogs.jobDate` for this employee |
| Status | Active / Inactive from `fieldEmployees.isActive` |

- **Sort:** Default by "Jobs This Month" descending
- **Data source:** `job_logs JOIN field_employees ON employee_id`
- **Interaction:** Clicking a row filters the dashboard to that employee's jobs (see FR-009)

---

### FR-006 — Service Contracts Summary
A panel showing recurring contract health.

| Metric | Description |
|--------|-------------|
| Total Active Contracts | Count where `isActive = true` |
| Due This Week | Contracts where `nextScheduledDate` is within 7 days |
| Overdue (past next date) | Contracts where `nextScheduledDate` < today and `isActive = true` |
| By Frequency | Count grouped by `frequency` (weekly, monthly, quarterly) |

- **Chart type:** Small donut for frequency breakdown + stat cards for due/overdue counts
- **Data source:** `service_contracts`
- **Interaction:** "Due This Week" and "Overdue" counts are clickable links to a filtered view in AdminContracts

---

### FR-007 — Client Activity Panel
A ranked list of most-active clients by job count.

- **Display:** Top 10 clients, sorted by total job count (all time)
- **Columns:** Client name, total jobs, last job date, active contract (Y/N)
- **Data source:** `job_logs LEFT JOIN clients ON client_id` + `service_contracts`
- **Interaction:** Clicking a client name navigates to their detail in AdminClients

---

### FR-008 — Upcoming Scheduled Jobs / Inspections
A chronological list of near-future items requiring attention.

- **Sections:**
  1. **Scheduled Jobs** — `jobLogs` where `status = 'scheduled'` and `jobDate` is within 14 days, sorted ascending
  2. **Pending Inspections** — `inspectionSchedules` where `status = 'pending'`, sorted by `preferredDate` ascending
  3. **Pending Service Requests** — `serviceRequests` where `status ∈ {pending, scheduled}`, sorted by `scheduledDate` ascending
- **Display:** Compact list showing: date, customer name, service type, assigned employee (if any)
- **Data source:** `job_logs`, `inspection_schedules`, `service_requests`
- **Interaction:** Each item links to the relevant admin section

---

### FR-009 — Filterable Date Range
A global date range control at the top of the dashboard that scopes charts and KPIs:

- **Presets:** Today, This Week, This Month, Last Month, Last 3 Months, Last 12 Months, Year to Date
- **Custom range:** Date picker (start date + end date)
- **Scope:** Applies to FR-001 (jobs KPIs), FR-002 (jobs over time), FR-003 (jobs by type), FR-004 (status breakdown), FR-005 (employee productivity counts for the period)
- Does NOT scope FR-006 (contracts) — always shows current contract state

---

### FR-010 — Dashboard Page Replaces Current Placeholder
The existing `/admin/dashboards` route currently renders a `DashboardCreator` component that lets admins create dashboard config records (title, type, linked project). This is a stub with no real analytics.

**v1 approach:** Replace `AdminDashboards` page with the new analytics dashboard defined in this document. The `dashboards` table and `DashboardCreator` component can be retained but de-emphasized (or moved to a sub-tab) — they support future per-client shareable dashboards.

**Decision needed (Open Question #1):** Does Mike want to keep the project-linked dashboard concept, or replace it entirely?

---

### FR-011 — Contact Form Submissions Widget
A small counter/recent-submissions panel:

- **Metric:** Count of new `contactSubmissions` in current date range
- **Display:** KPI card + last 5 submissions (name, service type, city, date)
- **Data source:** `contact_submissions`
- **Interaction:** Link to full list (future admin contact submissions management)

---

## Non-Functional Requirements

- **NFR-001:** All analytics data fetched via a dedicated `/api/admin/analytics/*` endpoint group — no client-side aggregation of large datasets
- **NFR-002:** Analytics API endpoints must return data within 2 seconds for datasets of typical scale (< 10,000 job logs)
- **NFR-003:** Charts must use the existing `recharts`-based `chart.tsx` ShadCN component already in the codebase (`client/src/components/ui/chart.tsx`) — do not add Chart.js, D3, or other chart libraries
- **NFR-004:** All routes under `/api/admin/analytics/*` protected by `requireAdmin` middleware
- **NFR-005:** Date range filtering must be applied server-side (parameterized SQL via Drizzle) — not client-side array filtering
- **NFR-006:** Dashboard must be responsive — stat cards stack vertically on mobile, charts scroll horizontally on small viewports
- **NFR-007:** No new database tables required for v1 — all data aggregated on-demand from existing tables

---

## Data Sources Summary

| Data Entity | Table | Key Fields Used |
|-------------|-------|-----------------|
| Job logs | `job_logs` | `jobDate`, `status`, `employeeId`, `servicedArea`, `workPerformed`, `clientId` |
| Field employees | `field_employees` | `id`, `name`, `isActive` |
| Clients | `clients` | `id`, `name`, `status` |
| Service contracts | `service_contracts` | `isActive`, `nextScheduledDate`, `frequency`, `customerId` |
| Inspection schedules | `inspection_schedules` | `status`, `preferredDate`, `serviceType`, `firstName`, `lastName` |
| Service requests | `service_requests` | `status`, `scheduledDate`, `serviceType`, `userId`, `clientId` |
| Contact submissions | `contact_submissions` | `createdAt`, `serviceType`, `city`, `firstName`, `lastName` |
| Invoices *(Feature #5)* | `invoices` (future) | `status`, `total`, `dueDate` — show placeholders until Feature #5 ships |

---

## API Endpoints

All routes under `/api/admin/analytics` — protected by `requireAdmin`.

| Method | Path | Returns | Notes |
|--------|------|---------|-------|
| `GET` | `/api/admin/analytics/overview` | KPI card values (jobs, clients, contracts, requests) | Accepts `?from=&to=` date range params |
| `GET` | `/api/admin/analytics/jobs-over-time` | Array of `{ month, count }` | Accepts `?from=&to=&groupBy=month\|week` |
| `GET` | `/api/admin/analytics/jobs-by-area` | Array of `{ area, count }` | Top 6 + other bucket |
| `GET` | `/api/admin/analytics/jobs-by-status` | Array of `{ status, count }` | All statuses |
| `GET` | `/api/admin/analytics/employee-productivity` | Array of `{ employeeId, name, jobsThisPeriod, jobsAllTime, lastJobDate, isActive }` | Accepts `?from=&to=` |
| `GET` | `/api/admin/analytics/contracts-summary` | Contract health stats + frequency breakdown | No date filter — current state |
| `GET` | `/api/admin/analytics/upcoming` | Scheduled jobs, pending inspections, pending service requests | Next 14 days |
| `GET` | `/api/admin/analytics/top-clients` | Top 10 clients by job count | Accepts `?from=&to=` |
| `GET` | `/api/admin/analytics/contact-submissions` | Count + last 5 submissions | Accepts `?from=&to=` |

---

## Charts & Visualizations Specification

| Chart | Type | Library | Component |
|-------|------|---------|-----------|
| Jobs Over Time | BarChart + ReferenceLine | recharts (via ShadCN `chart.tsx`) | `JobsOverTimeChart` |
| Jobs by Area/Type | PieChart / DonutChart | recharts | `JobsByAreaChart` |
| Job Status Breakdown | BarChart (horizontal) | recharts | `JobStatusChart` |
| Contract Frequency | PieChart (mini donut) | recharts | `ContractFrequencyDonut` |

All charts use the existing `ChartContainer`, `ChartTooltip`, and `ChartLegend` from `@/components/ui/chart`.

---

## Page Layout (Wireframe Description)

```
┌────────────────────────────────────────────────────────────────────┐
│  [Date Range Filter]                          [Refresh button]     │
├────────────────────────────────────────────────────────────────────┤
│  [Jobs/Mo] [Jobs/Wk] [Active Clients] [Contracts] [Requests] [More]│
│   KPI cards (responsive flex-wrap row)                             │
├─────────────────────────────┬──────────────────────────────────────┤
│  Jobs Over Time (bar chart) │  Jobs by Area (donut chart)          │
│  12-month default           │  toggle: area / service type         │
├─────────────────────────────┴──────────────────────────────────────┤
│  Job Status Breakdown (horizontal bar)                             │
├─────────────────────────────┬──────────────────────────────────────┤
│  Field Employee Productivity│  Contract Health                     │
│  (table, top 10)            │  (stat cards + mini donut)           │
├─────────────────────────────┴──────────────────────────────────────┤
│  Upcoming This Week (3-section list: jobs / inspections / requests)│
├─────────────────────────────┬──────────────────────────────────────┤
│  Top Clients (table, top 10)│  Contact Submissions (card + list)   │
└─────────────────────────────┴──────────────────────────────────────┘
```

---

## User Interactions

| Interaction | Trigger | Response |
|-------------|---------|----------|
| Date range change | Dropdown or custom picker | Re-fetches all scoped API endpoints; updates KPIs and charts |
| Hover on chart | Mouse over data point/segment | Tooltip with exact value and label |
| Click job status row | In Job Status Breakdown chart | Navigates to `/admin/reports` with status pre-filtered |
| Click employee row | In Employee Productivity table | Navigates to `/admin/reports` with employee pre-filtered |
| Click client row | In Top Clients table | Navigates to `/admin/clients` scoped to that client |
| Click "Due This Week" | In Contract Health panel | Navigates to `/admin/contracts` with date filter applied |
| Click upcoming item | In Upcoming This Week list | Navigates to relevant admin section (job → reports, inspection → service, request → service) |
| Click "Refresh" button | Button in header | Invalidates all analytics query keys, triggers refetch |

---

## Integration with Existing System

### Existing Chart Component
`client/src/components/ui/chart.tsx` already exists — it wraps recharts with ShadCN theming. Luke must use this existing component; do not introduce a new chart library.

### Existing Dashboard Page (Stub)
`AdminDashboards.tsx` currently renders `DashboardCreator` (a CRUD table for dashboard configs). This needs to be replaced or augmented. See FR-010 and Open Question #1.

### Storage Layer — New Methods Needed

```typescript
// In IStorage interface and DatabaseStorage class:

getAnalyticsOverview(from: Date, to: Date): Promise<AnalyticsOverview>
getJobsOverTime(from: Date, to: Date, groupBy: 'month' | 'week'): Promise<JobsOverTimeData[]>
getJobsByArea(from: Date, to: Date): Promise<JobsByAreaData[]>
getJobsByStatus(from: Date, to: Date): Promise<JobsByStatusData[]>
getEmployeeProductivity(from: Date, to: Date): Promise<EmployeeProductivityData[]>
getContractsSummary(): Promise<ContractsSummaryData>
getUpcomingItems(): Promise<UpcomingItemsData>
getTopClients(from: Date, to: Date, limit?: number): Promise<TopClientData[]>
getContactSubmissionsSummary(from: Date, to: Date): Promise<ContactSubmissionsSummaryData>
```

All aggregation must be done in SQL via Drizzle ORM (`.groupBy()`, `.count()`, `.sum()`) — not in application code.

---

## Assumptions

1. **Fact:** The `chart.tsx` ShadCN component using recharts already exists in the project — confirmed in codebase
2. **Fact:** No analytics API endpoints exist yet; all data is in operational tables
3. **Opinion:** Date range defaulting to "This Month" is most useful for a service business checking daily operations — present this to Mike if different preference exists
4. **Assumption:** Rob (admin) checks the dashboard at least daily — design for quick scanning, not deep analysis
5. **Assumption:** "Service type" for job categorization will use `jobLogs.workPerformed` text — this is free-form. A structured service type field may be needed for accurate donut chart (see Open Questions #3)
6. **Assumption:** No real-time updates needed in v1 — manual refresh or page reload is acceptable
7. **Assumption:** Revenue/invoice KPIs will be placeholder ("—" or "0") until Feature #5 (Invoice Lifecycle) ships

---

## Open Questions

> Items requiring Mike's input before Akbar/Luke proceed

1. **Replace or augment existing dashboard page?** The current `/admin/dashboards` allows creating named dashboard configs linked to projects. Should this be: (a) fully replaced by the analytics view, (b) moved to a sub-tab alongside analytics, or (c) retained separately and analytics added as a new nav item?

2. **Revenue metrics priority?** Feature #5 (Invoices) isn't started yet. Should the analytics dashboard ship with revenue placeholders now, or wait until Feature #5 is complete so KPIs are meaningful from launch?

3. **Service type categorization?** `job_logs.workPerformed` is free-form text. For "Jobs by Service Type" donut chart to be useful, we'd need either: (a) a structured `serviceType` field on job logs, or (b) use `servicedArea` as the grouping proxy. Which is preferred?

4. **Export capability?** Should the admin be able to export analytics data (CSV download of job counts, employee productivity, etc.)? If yes, include in v1 scope; if no, defer.

5. **Email digest?** Would a weekly analytics summary email to Rob be useful (e.g., "this week: 12 jobs completed, 3 contracts due next week")? Scope for v1 or defer?

6. **Invoice feature dependency?** Should FR-001 revenue KPIs be blocked on Feature #5, or ship Feature #6 with graceful "N/A" placeholders and enhance later?

7. **"All admins" vs. "Rob only"?** The system has multiple admin user accounts possible. Should all admin users see the same shared analytics, or should there be per-user views?

---

## Research Sources

- Existing codebase: `shared/schema.ts`, `client/src/components/ui/chart.tsx`, `client/src/components/admin/DashboardCreator.tsx`, `AdminLayout.tsx`, `server/routes.ts`
- Feature #5 requirements (`docs/Feature-5-Invoice-Management-Requirements.md`) — for invoice KPI dependency context
- Industry patterns: FreshBooks, Jobber, ServiceTitan admin dashboards for field service businesses
- ShadCN charts documentation (recharts wrapper patterns)

---

## Recommended Next Steps

1. **Mike:** Answer Open Questions #1, #2, #3 — these unblock scope definition for Luke
2. **Akbar:** Review the analytics API endpoint list and confirm Drizzle ORM aggregation approach is optimal vs. raw SQL for complex GROUP BY queries
3. **Luke (after Mike/Akbar input):**
   - Add analytics storage methods to `IStorage` + `DatabaseStorage`
   - Add `/api/admin/analytics/*` routes to `server/routes.ts`
   - Replace/update `AdminDashboards.tsx` with analytics UI
   - Use existing `chart.tsx` ShadCN component for all charts
4. **Priority order for Luke:** API endpoints → Storage aggregations → KPI cards → Charts → Upcoming panel → Employee table → Filter controls
