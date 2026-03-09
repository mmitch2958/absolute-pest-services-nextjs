# Feature #13 — Route Optimization Requirements
**Project:** AbsolutePestServices.com  
**Document ID:** SC-ROUTE-001  
**Prepared by:** 3CP0 (Research/Product Agent)  
**Date:** 2026-03-09  
**Status:** Draft — Pending Mike Review

---

## Overview

Field technicians at Absolute Pest Services drive to multiple job sites each day. Currently, route planning is informal — techs figure it out themselves or admin calls them with instructions. This feature gives both admin and field techs a simple, optimized route for the day's jobs, reducing drive time, fuel cost, and late arrivals.

**Goal:** Given a list of jobs for a technician on a given date, calculate and display the most efficient stop sequence with a map view and enough detail for the tech to navigate without extra effort.

**Scope (Phase 1):** Optimize scheduled `jobLogs` for a single tech per day. Admin-initiated. Read-only route view for field techs.

---

## Context: Existing Data Model

Relevant tables from `shared/schema.ts`:

| Table | Key Fields Used |
|-------|-----------------|
| `job_logs` | `employeeId`, `jobDate`, `siteAddress`, `siteLocation`, `customerName`, `status` |
| `field_employees` | `id`, `name`, `isActive` |
| `clients` | `id`, `name`, `address` |
| `service_contracts` | `assignedEmployeeId`, `nextScheduledDate`, `siteLocation` |

**Key gap:** `job_logs.siteAddress` is nullable. Many legacy jobs may only have `siteLocation` (a text description, not a geocodable address). This is the #1 data quality risk for this feature (see Open Questions).

---

## Functional Requirements

### FR-001 — What Jobs to Include in a Route

**Rule:** A route for a given day includes all `jobLogs` where:
- `employeeId` matches the selected technician
- `jobDate` falls on the selected calendar date
- `status` is one of: `scheduled`, `in_progress`
- `siteAddress` is NOT NULL (geocodable address required)

**Admin override:** Admin can manually include or exclude specific jobs from a route before generating it.

**Unscheduled jobs:** Jobs without an assigned tech (`employeeId = null`) are NOT included automatically, but admin can add them to any tech's route via drag-and-drop or toggle.

**Start/End location:** The system uses a configurable "depot address" (e.g., company office/warehouse) as the route origin and final return point. Defaults to a value set in admin settings. If not configured, admin can enter a starting address on the route planner screen.

---

### FR-002 — Optimization Criteria

**Primary criterion:** Minimize total travel time (not distance). Rationale: Pittsburgh-area roads have significant variation in speed limits and traffic patterns. Time-based optimization reflects real-world cost better than distance alone.

**Secondary constraints (Phase 1):**
- Time windows: If a job has a specific appointment time, treat it as a soft time window (warn if ordering would likely cause a late arrival, but allow override)
- Jobs with `priority = 'urgent'` should be weighted earlier in the sequence (admin can override)
- No vehicle capacity or technician shift constraints in Phase 1

**Not in Phase 1:** Multi-vehicle routing (assigning jobs across multiple techs simultaneously), traffic-aware re-routing mid-day, hard time-window enforcement.

---

### FR-003 — Map Integration Recommendation

Three options were evaluated:

| Option | Pros | Cons | Cost Estimate |
|--------|------|------|---------------|
| **Google Maps Routes API** (recommended) | Industry standard; real-time traffic; `optimizeWaypointOrder` flag; familiar to techs; deep ecosystem | Billing complexity; Legacy Directions API deprecated Mar 2025; Advanced SKU for optimization | ~$0.014/request; ~$0–20/mo for typical small fleet usage |
| **Mapbox Optimization API** | 100k free requests/month; good customization; clean UI | Less familiar to end users; no native turn-by-turn in browser | Free at low volume; $0.50/1000 beyond free tier |
| **Simple address sorting (no map API)** | Zero cost; no external dependency | No real optimization; just sorts by city/zip; poor for actual routing | $0 |

**Recommendation: Google Maps Routes API (ComputeRoutes with `optimizeWaypointOrder: true`)**

Rationale (opinion):
- Absolute Pest Services techs already use Google Maps personally — zero learning curve to open a route link
- Google's real-time traffic data is superior for a service area around Pittsburgh/North Hills/Chester County
- At ~5–20 optimized routes per week, the cost stays comfortably within the $200/mo GCP credit
- The Routes API replaces the deprecated Directions API and supports up to 25 intermediate waypoints (sufficient for a full day's pest control route — typical days have 6–12 stops)
- Launching a pre-built Google Maps URL (`maps.google.com/maps/dir/...`) requires zero API key on the tech's phone — works immediately

**Implementation approach:**
- **Admin side:** Call Google Routes API (server-side) → `POST /v2/directions:computeRoutes` with `optimizeWaypointOrder: true` → store the optimized sequence
- **Field side:** Generate a Google Maps deep-link URL with stops in optimized order → tech taps to open in native Google Maps app (no in-app navigation required)

---

### FR-004 — Admin View: Route Planner

**Location:** New admin page at `/admin/route-planner` (or tab within field data section)

**User story:**  
**As an** admin,  
**I want** to generate an optimized route for any tech on any given date,  
**So that** I can send them the most efficient stop order before their day starts.

**Acceptance Criteria:**
- [ ] Admin selects a technician from a dropdown (populated from active `fieldEmployees`)
- [ ] Admin selects a date (defaults to today)
- [ ] System shows a list of all qualifying `jobLogs` for that tech on that date
- [ ] Jobs missing a `siteAddress` are flagged with a warning icon — admin can manually enter an address or skip them
- [ ] "Generate Route" button calls the backend optimization endpoint
- [ ] Result shows an ordered stop list: stop # | customer name | address | job type | estimated arrival time
- [ ] A map panel renders the route (embedded Google Maps iframe or Mapbox GL map)
- [ ] Admin can drag-and-drop stops to manually reorder if desired
- [ ] "Share Route" button generates a shareable link or copies a Google Maps URL with all stops in order
- [ ] Admin can regenerate the route if jobs are added/removed

**Job count handling:**
- 1 stop: No optimization needed — display the single stop with direct maps link
- 2–25 stops: Call Routes API with `optimizeWaypointOrder: true`
- 26+ stops: Split into multiple route segments (flag to admin, v1 may simply warn and cap at 25)

---

### FR-005 — Field View: My Route for Today

**Location:** Field app (accessible after PIN login at `/field/*`)

**User story:**  
**As a** field technician,  
**I want** to see my jobs for today in the order I should drive them,  
**So that** I can navigate efficiently without calling the office.

**Acceptance Criteria:**
- [ ] After field login, tech sees a "Today's Route" button/card on their home screen (visible only when a route has been generated by admin for today)
- [ ] Route view shows an ordered list of stops: stop number, customer name, address, job description
- [ ] Each stop has an "Open in Maps" button that deep-links to Google Maps with that single address (for turn-by-turn on the current stop)
- [ ] A "Full Route in Maps" button opens Google Maps with all stops in order (one tap → navigation for the whole day)
- [ ] Tech can mark a stop as "Done" (updates `jobLog.status` to `completed` or triggers the existing job log flow)
- [ ] Route is read-only — tech cannot reorder stops in Phase 1

**Mobile-first:** This view is optimized for a phone screen. Large tap targets, minimal scrolling required.

---

### FR-006 — Real-Time vs. Static Routing

**Decision for Phase 1: Static routing** — route is generated once (typically morning of, or day before) and delivered as a fixed sequence.

Rationale:
- Real-time re-routing requires the tech's device to continuously report GPS location (requires a native app or background service — significant scope increase)
- Pest control routes are relatively stable — jobs don't get added/cancelled frequently mid-day
- The Google Maps deep-link approach naturally handles real-time traffic on the *tech's device* — Google Maps itself will reroute them if traffic changes

**Phase 2 consideration:** Admin can trigger a "re-optimize" during the day if a job is cancelled or added. This would regenerate the route and notify the tech (push notification or SMS — out of scope for Phase 1).

---

### FR-007 — Geocoding Requirement

Before route optimization can run, all stop addresses must be geocodable (lat/lng).

**Process:**
1. When a route is requested, the backend geocodes any `siteAddress` values that haven't been cached yet
2. Use **Google Geocoding API** (server-side) — same GCP project as Routes API
3. Cache geocoded coordinates in the database (add `lat` and `lng` columns to `job_logs` or a new `address_geocache` table) — avoids re-geocoding the same address on every route request
4. If geocoding fails for an address (unrecognized, PO box, etc.), flag the stop for admin to manually fix

**Geocoding cost:** ~$5 per 1,000 addresses. With caching, most addresses are geocoded only once. Negligible cost at this scale.

---

## Non-Functional Requirements

- **NFR-001 — Response time:** Route optimization API call must complete in < 5 seconds for routes up to 25 stops. Loading state with spinner is acceptable.
- **NFR-002 — Offline fallback:** If the Maps API is unavailable, show the un-optimized list with address plaintext so techs can still navigate manually.
- **NFR-003 — Mobile responsiveness:** Field view must be fully functional on a 375px-wide phone screen (iPhone SE baseline).
- **NFR-004 — No new auth required:** Route feature uses existing admin session (for admin view) and existing field PIN session (for field view). No new login flows.
- **NFR-005 — API key security:** Google Maps API key must be restricted by HTTP referrer (frontend key) and/or server IP (backend key). Never exposed in client-side code for server-side calls.
- **NFR-006 — Cost guard:** Implement a per-day cap (configurable, default: 50 route optimization requests/day) to prevent runaway API costs. Log all API calls.

---

## API Requirements

### New Backend Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/admin/routes/jobs?employeeId=&date=` | Admin | Returns list of qualifying jobLogs for a tech+date with geocoded addresses |
| `POST` | `/api/admin/routes/optimize` | Admin | Takes `{employeeId, date, startAddress?, jobIds[]}`, calls Google Routes API, returns optimized sequence with estimated times |
| `GET` | `/api/admin/routes/saved?employeeId=&date=` | Admin | Retrieves a previously saved optimized route for a tech+date |
| `PUT` | `/api/admin/routes/saved/:id` | Admin | Updates saved route (manual reorder, add/remove stops) |
| `GET` | `/api/field/route/today` | Field (PIN) | Returns today's optimized route for the authenticated field employee |

### External APIs Required

| API | Purpose | Auth Method | Billing |
|-----|---------|-------------|---------|
| Google Routes API (`routes.googleapis.com`) | Route optimization with waypoint ordering | API Key (server-side only) | Per request — Advanced SKU ~$0.014/request |
| Google Geocoding API (`maps.googleapis.com/maps/api/geocode`) | Address → lat/lng | API Key (server-side only) | ~$5/1,000 requests |
| Google Maps Embed or Static Maps | Map display in admin UI | API Key (HTTP referrer restricted) | Map Embed: free; Static Maps: $2/1,000 |
| Google Maps Deep Link | Tech navigation (no API key needed) | None | Free |

### New DB Schema Changes

```sql
-- Store optimized routes per tech per day
CREATE TABLE daily_routes (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES field_employees(id),
  route_date DATE NOT NULL,
  start_address TEXT,
  optimized_stop_order JSONB NOT NULL, -- [{jobLogId, sequence, estimatedArrival, lat, lng}]
  google_maps_url TEXT, -- pre-built deep link
  generated_at TIMESTAMP DEFAULT NOW(),
  generated_by INTEGER REFERENCES users(id),
  UNIQUE(employee_id, route_date)
);

-- Geocache to avoid re-geocoding same address
CREATE TABLE geocache (
  id SERIAL PRIMARY KEY,
  address_text TEXT NOT NULL UNIQUE,
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  geocoded_at TIMESTAMP DEFAULT NOW(),
  source TEXT DEFAULT 'google' -- 'google', 'manual'
);
```

---

## User Stories Summary

| # | Story | Priority |
|---|-------|----------|
| US-1 | Admin generates an optimized route for a tech on a given day | P0 |
| US-2 | Admin sees a map with all stops in order, estimated drive times | P0 |
| US-3 | Admin can manually reorder stops before sharing | P1 |
| US-4 | Admin copies a Google Maps URL to share with tech via text/WhatsApp | P0 |
| US-5 | Field tech sees today's route from the field app home screen | P1 |
| US-6 | Field tech taps "Open in Maps" for turn-by-turn on current stop | P0 |
| US-7 | Admin is warned when jobs are missing a geocodable address | P0 |
| US-8 | Admin can set the default depot/starting address in settings | P1 |
| US-9 | System caches geocoded addresses to avoid re-geocoding | P1 |

---

## Assumptions

1. Field technicians have smartphones with Google Maps installed (standard)
2. The service area is primarily suburban/rural PA — GPS addresses are generally geocodable
3. A typical day has 6–15 stops per tech (well within the 25-stop Routes API limit)
4. There is only 1 tech fleet in Phase 1 — no multi-team coordination needed yet
5. Admin generates routes from a desktop browser; techs consume routes from mobile
6. The existing field PIN auth session is sufficient to identify which tech is logged in for the `/api/field/route/today` endpoint

---

## Open Questions

| # | Question | Needed For | Owner |
|---|----------|------------|-------|
| OQ-1 | **Address data quality:** What % of existing `job_logs` have a `siteAddress`? If many don't, do we backfill from `clients.address`? | FR-001, FR-007 | Mike/Dev |
| OQ-2 | **Depot address:** What is the company's starting address? Is it always the same, or do techs start from home? | FR-001 | Mike |
| OQ-3 | **Route sharing method:** Should routes be shared via a copyable URL, or should the system send an SMS/push notification to the tech? (SMS = Twilio integration, additional scope) | FR-005 | Mike |
| OQ-4 | **Appointment time windows:** Do any jobs have specific customer-requested time windows (e.g., "must arrive between 9–11 AM")? If so, where is that data stored? | FR-002 | Mike |
| OQ-5 | **Multi-tech support:** Is there ever a day where multiple techs need simultaneous route generation? (Affects whether we need fleet-routing API vs. simple per-tech optimization) | FR-001 | Mike |
| OQ-6 | **Google Maps API key:** Does Rob/Absolute already have a Google Cloud account or Maps API key? Or is this a new setup? | FR-003 | Mike/Dev |
| OQ-7 | **Job log status flow:** When a tech marks a stop "Done" from the route view, should it trigger the full job log completion flow (photos, notes) or just flip the status? | FR-005 | Mike |
| OQ-8 | **Service contract jobs:** Auto-generated jobs from `service_contracts` — are they always pre-populated into `job_logs`, or do they need to be pulled separately for route planning? | FR-001 | Dev |

---

## Out of Scope (Phase 1)

- Live GPS tracking of techs
- Automatic re-optimization when jobs are added/cancelled mid-day
- Multi-vehicle fleet routing (assigning jobs across multiple techs simultaneously)
- Customer ETA notifications ("your tech is 2 stops away")
- Integration with any third-party FSM (field service management) software
- Offline-first route access (no connectivity zones)
- Historical route efficiency analytics

---

## Research Sources

- Google Maps Routes API Docs: https://developers.google.com/maps/documentation/routes
- Google Route Optimization API (fleet-scale): https://developers.google.com/maps/documentation/route-optimization
- Mapbox Optimization API: https://docs.mapbox.com/api/navigation/optimization/
- Google Maps Routes vs Legacy Directions API migration (effective Mar 1, 2025): https://developers.google.com/maps/documentation/routes/migrate-from-directions
- Pricing comparison research: Gemini web search, March 2026

---

## Revision History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 0.1 | 2026-03-09 | 3CP0 | Initial draft |
