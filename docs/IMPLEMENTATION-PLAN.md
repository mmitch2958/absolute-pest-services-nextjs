# Implementation Plan: Features #11-14

**Project:** AbsolutePestServices.com  
**Generated:** 2026-03-09  
**Foreman:** R2

---

## Overview

| Feature | ADR | Complexity | Primary Dept | Status |
|---------|-----|------------|--------------|--------|
| #11 Reviews | SC-REVIEWS-001 | Simple | Build | In Progress |
| #12 Offline Mode | SC-OFFLINE-001 | Complex | Build | Pending |
| #13 Route Optimization | SC-ROUTE-001 | Moderate | Build | **ON HOLD** (waiting for Google API key) |
| #14 Time Tracking | SC-TIME-001 | Moderate | Build | Pending |

**Note:** Feature #11 is already in progress by Luke. Feature #13 is on hold until Mike provides the Google Maps API key.

---

## Parallel Execution Analysis

### Can Run In Parallel
- **#12 Offline** and **#13 Route** — both add new client-side modules and new endpoints; minimal overlap
- **#14 Time** — backend-heavy; can start while #12/#13 frontend is being designed

### Must Be Sequential
- **#13 Route** needs **#12 Offline** for field endpoint delivery (route viewed offline) — but route itself can be built first; integration happens at end
- All features need schema changes — coordinate DB migrations

### Recommended Execution Order
1. **Phase 1:** Feature #11 (Reviews) — already in progress
2. **Phase 2:** Feature #14 (Time Tracking) — backend-heavy, independent
3. **Phase 3:** Feature #12 (Offline) — complex, standalone
4. **Phase 4:** Feature #13 (Route) — **ON HOLD** — will be added after API key provided

---

## Task Breakdown

### Feature #11: Review Request Automation
**Status:** In Progress (Luke)

#### Task: SC-REV-001 - Backend Implementation
- **Assigned to:** Luke (`build`)
- **Department:** Build
- **Priority:** P0
- **Dependencies:** None
- **Acceptance Criteria:**
  - [ ] `review_request_logs` table created with UNIQUE constraints
  - [ ] `review_settings` table created and seeded
  - [ ] `clients` table modified with `review_opt_out` column
  - [ ] `server/reviews.ts` module implemented with all functions
  - [ ] Hourly cron dispatch integrated
  - [ ] Job completion trigger wired
- **Context:** Core review automation. Uses same pattern as Reminders. Luke already knows this.

#### Task: SC-REV-002 - Admin API & Testing
- **Assigned to:** Luke (`build`)
- **Department:** Build
- **Priority:** P1
- **Dependencies:** SC-REV-001
- **Acceptance Criteria:**
  - [ ] All 6 admin endpoints implemented and tested
  - [ ] Integration test: job completion → review request sent
- **Context:** Complete the feature for admin visibility and control.

---

### Feature #12: Offline Mode for Field Technicians
**Status:** Not Started

#### Task: SC-OFF-001 - Service Worker Setup
- **Assigned to:** Luke (`build`)
- **Department:** Build
- **Priority:** P0
- **Dependencies:** None
- **Acceptance Criteria:**
  - [ ] `vite-plugin-pwa` configured in vite.config.ts
  - [ ] Service worker scope limited to `/field/*`
  - [ ] Cache strategies defined (CacheFirst app shell, NetworkFirst API)
  - [ ] Builds and loads without errors
- **Context:** Foundation for all offline functionality. Must be tested on iOS Safari.

#### Task: SC-OFF-002 - IndexedDB Storage Layer
- **Assigned to:** Luke (`build`)
- **Department:** Build
- **Priority:** P0
- **Dependencies:** SC-OFF-001
- **Acceptance Criteria:**
  - [ ] `client/src/lib/offline-db.ts` created with idb
  - [ ] `reference_data`, `offline_queue`, `job_history_cache` stores defined
  - [ ] Data scoped by employeeId
  - [ ] Photo compression (JPEG 80%) implemented
- **Context:** Client-side storage. Critical for offline data retention.

#### Task: SC-OFF-003 - Connection Monitor
- **Assigned to:** Luke (`build`)
- **Department:** Build
- **Priority:** P0
- **Dependencies:** None
- **Acceptance Criteria:**
  - [ ] `GET /api/ping` endpoint added (no auth, minimal)
  - [ ] `client/src/lib/connection-monitor.ts` uses navigator.onLine + heartbeat
  - [ ] Exports `useConnectionStatus()` hook
  - [ ] Online transition triggers immediate sync
- **Context:** Determines when to queue vs sync.

#### Task: SC-OFF-004 - Sync Engine
- **Assigned to:** Luke (`build`)
- **Department:** Build
- **Priority:** P0
- **Dependencies:** SC-OFF-002, SC-OFF-003, SC-OFF-005
- **Acceptance Criteria:**
  - [ ] `POST /api/field/sync` endpoint handles batch job logs
  - [ ] `client/src/lib/sync-engine.ts` orchestrates: reference → queue → photos → history
  - [ ] Sequential processing with partial success handling
  - [ ] Exponential backoff retry (30s → 2m → 5m → 15m → 1h)
  - [ ] Background Sync API with foreground fallback
- **Context:** Core sync logic. Complex — allow extra time.

#### Task: SC-OFF-005 - Field Portal Integration
- **Assigned to:** Luke (`build`)
- **Department:** Build
- **Priority:** P1
- **Dependencies:** SC-OFF-002, SC-OFF-003
- **Acceptance Criteria:**
  - [ ] `field-log.tsx` queues submissions when offline
  - [ ] `field-history.tsx` shows pending/error badges
  - [ ] Offline banner component added
  - [ ] PIN auth revalidates silently on reconnect
- **Context:** Frontend UI changes for offline UX.

#### Task: SC-OFF-006 - QA Offline Testing
- **Assigned to:** Han (`qa`)
- **Department:** QA
- **Priority:** P1
- **Dependencies:** SC-OFF-005
- **Acceptance Criteria:**
  - [ ] Test: submit job log offline, reconnect, verify sync
  - [ ] Test: photo compression and upload
  - [ ] Test: iOS Safari offline behavior
  - [ ] Test: IndexedDB storage limits
- **Context:** Validate offline works in real conditions.

---

### Feature #13: Route Optimization
**Status:** **ON HOLD** — waiting for Google Maps API key from Mike

> Tasks will be added once API key is provided. For reference, see ADR `SC-ROUTE-001-architecture.md`

---

### Feature #14: Time Tracking
**Status:** Not Started

#### Task: SC-TIME-001 - Database Schema
- **Assigned to:** Luke (`build`)
- **Department:** Build
- **Priority:** P0
- **Dependencies:** None
- **Acceptance Criteria:**
  - [ ] `shifts` table created
  - [ ] `shift_time_blocks` table created
  - [ ] `shift_breaks` table created
  - [ ] `time_entry_audit_log` table created
  - [ ] Indexes created per ADR
  - [ ] `field_employees` modified with `hourly_rate`, `external_payroll_id`
- **Context:** Core time tracking data model.

#### Task: SC-TIME-002 - Core Time Tracking Module
- **Assigned to:** Luke (`build`)
- **Department:** Build
- **Priority:** P0
- **Dependencies:** SC-TIME-001
- **Acceptance Criteria:**
  - [ ] `server/timeTracking.ts` module with all 7 functions
  - [ ] All business logic constraints enforced (open shift, active break, etc.)
  - [ ] GPS best-effort capture implemented
- **Context:** All backend time tracking logic in one place.

#### Task: SC-TIME-003 - Field Time Tracking UI
- **Assigned to:** Leia (`design`)
- **Department:** Design
- **Priority:** P1
- **Dependencies:** SC-TIME-001
- **Acceptance Criteria:**
  - [ ] Clock in/out UI designed
  - [ ] Time block (job/travel) UI designed
  - [ ] Break start/end UI designed
  - [ ] Mobile-first, thumb-friendly design
- **Context:** Field tech interface for time tracking.

#### Task: SC-TIME-004 - Field Time Tracking Implementation
- **Assigned to:** Luke (`build`)
- **Department:** Build
- **Priority:** P1
- **Dependencies:** SC-TIME-002, SC-TIME-003
- **Acceptance Criteria:**
  - [ ] Field shift endpoints implemented
  - [ ] Field time block endpoints implemented
  - [ ] Field break endpoints implemented
  - [ ] Frontend time tracking page built
- **Context:** Complete field-facing time tracking.

#### Task: SC-TIME-005 - Admin Time Reports
- **Assigned to:** Luke (`build`)
- **Department:** Build
- **Priority:** P1
- **Dependencies:** SC-TIME-002
- **Acceptance Criteria:**
  - [ ] Admin shift list/correct endpoints
  - [ ] Weekly overtime summary calculation
  - [ ] CSV export (QuickBooks-compatible)
  - [ ] Open shift flagging cron job
- **Context:** Admin visibility and payroll export.

#### Task: SC-TIME-006 - QA Time Tracking Tests
- **Assigned to:** Han (`qa`)
- **Department:** QA
- **Priority:** P1
- **Dependencies:** SC-TIME-005
- **Acceptance Criteria:**
  - [ ] Test: clock in → job block → break → clock out
  - [ ] Test: admin correction creates audit log
  - [ ] Test: overtime calculation accuracy
  - [ ] Test: CSV export format
- **Context:** Validate time tracking correctness.

---

## Department Execution Order

### Build (Luke)
1. **Continue:** Feature #11 Reviews (in progress)
2. **Start:** Feature #14 Time Tracking - Schema + Core module
3. **Then:** Feature #13 Route - Backend
4. **Then:** Feature #12 Offline - Service worker + IndexedDB
5. **Parallel:** Feature #13 Route - Admin UI implementation
6. **Parallel:** Feature #14 Time - Admin reports + Field UI

### Design (Leia)
1. **Wait:** Feature #13 Route - Admin route planner design (after backend ready)
2. **Wait:** Feature #14 Time - Field time tracking UI design (after schema ready)
3. **Wait:** Feature #12 Offline - Offline banner + UI updates

### QA (Han)
1. **Wait:** Feature #12 Offline - Full testing after sync complete
2. **Wait:** Feature #14 Time - Full testing after reports complete
3. **Coordinate:** Test data setup for all features

---

## Blocker Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| iOS Safari PWA quirks | Offline feature degraded | Test early, have fallback plan |
| DB migration conflicts | Features delayed | Coordinate migrations in one window |

**Feature #13 (Route) deferred** — will proceed once Google Maps API key is provided by Mike.

---

## Confirmed Answers from Mike

| Feature | Answer |
|---------|--------|
| #11 Reviews | ✅ Google Review link: `https://share.google/XItMnkLq28EfiM2KH` |
| #12 Offline | Max 5 photos per job log |
| #13 Route | - Depot = employee's home address (add "depot" field to employee setup)<br>- API key: placeholder in `.env`, Mike to fill in |
| #14 Time | - Pay period: bi-weekly<br>- Breaks: paid, ≤15min, once per day<br>- Payroll: QuickBooks<br>- Hourly rate: in QuickBooks only |

---

## Implementation Notes

### Employee Setup
When creating/editing employees via `/admin/employees`, add a "depot address" field for route optimization.

### Environment Variables
```env
GOOGLE_MAPS_API_KEY=  # Mike to fill in
```

---

## Summary

- **Active Features:** #11, #12, #14 (Feature #13 deferred)
- **Total Tasks:** 15 (excluding deferred Route tasks)
- **Build (Luke):** 11 tasks
- **Design (Leia):** 2 tasks  
- **QA (Han):** 2 tasks
- **Features in Parallel:** #12 + #14 (backend runs independently)
- **Critical Path:** #11 (in progress) → #14 backend → #12

Ready for dispatch. Mike can proceed with Luke starting on #14 schema while #11 completes.