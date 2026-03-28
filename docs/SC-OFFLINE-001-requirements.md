# SC-OFFLINE-001 — Offline Mode Requirements
**Project:** AbsolutePestServices.com  
**Feature:** Feature #12 — Offline Mode for Field Technicians  
**Prepared by:** 3CP0 (Research/Product Agent)  
**Date:** 2026-03-09  
**Status:** Draft — Pending Mike Review  

---

## Overview

Field technicians at Absolute Pest Services often work in locations with poor or no cellular/Wi-Fi connectivity — crawl spaces, basements, rural properties, and industrial sites. Currently, all field portal actions (`/field/log`, `/field/history`) require an active server connection. A dropped connection mid-form means lost work.

This document specifies offline capability for the field portal: what data is cached, how forms are queued, how the sync operates on reconnect, how conflicts are resolved, and what UI feedback technicians receive.

---

## Context & Constraints

- **Existing stack:** React + Vite, TanStack Query v5, Express/PostgreSQL backend (see `ARCHITECTURE.md`). No existing service worker or offline infrastructure.
- **Storage choice:** IndexedDB (via `idb` library) for structured offline data; `localStorage` already used for `fieldEmployee` / `fieldPin` auth.
- **Photos:** Stored as Blob/ArrayBuffer in IndexedDB offline. Uploaded to Cloudinary on reconnect. This is the largest bandwidth concern.
- **Auth model:** PIN-based field sessions (`session.fieldEmployeeId`). Session may expire while offline. Re-auth must be graceful.
- **No native app:** This is a PWA (browser-based). Service Worker + Cache API is the implementation path.
- **Sync server target:** New Express endpoints for batch sync (see §FR-020–022).
- **Conflict surface:** Job logs are technician-owned (one employee per log). True multi-user conflicts are rare but must be handled for reference data (customers, site locations).

---

## Functional Requirements

### 1. DATA TO CACHE LOCALLY

#### FR-001 — Reference Data Cache (Read-Only)
- On login and on each online session start, the app fetches and caches reference data into IndexedDB:
  - **Field customers** (`/api/field/clients`) — name, id, address
  - **Site locations** — name, id, customer association
  - **Serviced areas** — name, id, site location association
  - **Custom field definitions** (`/api/field/custom-fields`) — all active field defs including labels, types, options
  - **Employee suggestions** (`/api/field/suggestions`) — autocomplete values for customer name, site, serviced area, work performed
- Cache TTL: **24 hours** per dataset. Stale-while-revalidate: serve cached data instantly, refresh in background when online.
- Cache is keyed by employee ID to avoid cross-employee contamination on shared devices.

#### FR-002 — Job Log Queue (Write Offline)
- Job logs submitted while offline are stored in an IndexedDB `offline_queue` store with:
  - `localId` — client-generated UUID (stable identifier until server assigns real ID)
  - `employeeId` — from cached auth
  - Form data: `customerName`, `clientId`, `siteLocation`, `siteAddress`, `servicedArea`, `workPerformed`, `jobDate`, `status`, `customFields`
  - `photos[]` — array of `{ localId, blob, caption, status: "pending" }`
  - `createdAt` — client timestamp (UTC)
  - `syncStatus`: `"pending"` | `"syncing"` | `"synced"` | `"error"`
  - `syncError`: string (last error message, if any)
- Maximum queue depth: **50 pending logs**. Warn at 40, block at 50 with a clear message to reconnect.

#### FR-003 — Job History Cache (Read Offline)
- The employee's recent job history (`/api/field/job-logs`) is cached on each successful fetch.
- Cache stores the last **30 days** of the employee's own logs, including photo URLs (not photo blobs — thumbnails only).
- History is viewable offline in read-only mode.
- Newly queued offline logs appear in history immediately (from local queue) with a "Pending sync" badge.

#### FR-004 — Auth Cache
- Encrypted PIN and `fieldEmployee` object are already stored in `localStorage`. This is sufficient for offline re-validation.
- If the server session has expired, the app re-authenticates automatically when reconnected using the stored credentials.
- **No PIN is stored in plaintext.** Existing behavior already hashes via server; offline re-auth submits stored PIN hash against a cached employee record (PIN hash stored in IndexedDB, never exposed to UI).

---

### 2. SYNC WHEN BACK ONLINE

#### FR-010 — Connection Detection
- App monitors online/offline status via:
  1. Browser `navigator.onLine` + `window` `online`/`offline` events (fast, unreliable alone)
  2. Periodic lightweight heartbeat `GET /api/ping` every **30 seconds** when `navigator.onLine` is true (verifies actual server reachability, not just network interface)
- Transition from offline → online triggers sync immediately (not on next 30s tick).
- The app considers itself "online" only when the heartbeat succeeds. `navigator.onLine = true` but failed heartbeat = treat as offline.

#### FR-011 — Auto-Sync on Reconnect
- When connection is confirmed restored, the sync process starts automatically — no user action required.
- Sync order:
  1. **Reference data refresh** (pull latest customers, locations, areas, custom fields)
  2. **Job log queue flush** (push pending logs, sequential, one at a time)
  3. **Photo upload** (per log, sequential within each log)
  4. **History refresh** (pull updated log list)
- Each step is independent: a failure in step 3 (photo upload) does not block step 4.
- Sync runs in a background service worker context so it survives tab backgrounding on mobile.

#### FR-012 — Batch Sync Endpoint
- New server endpoint: `POST /api/field/sync`
- Accepts a batch payload: `{ jobLogs: JobLogDraft[], clientTimestamp: string }`
- Returns: `{ results: { localId, serverId, status, error }[] }`
- Server processes logs sequentially; partial success is valid (some logs accepted, some rejected).
- `requireFieldAuth` middleware applies; re-authentication is attempted if session is stale.

#### FR-013 — Photo Upload on Sync
- Photos stored as blobs in IndexedDB are uploaded to Cloudinary using the existing photo upload flow after the parent job log receives a server ID.
- Photo blobs are deleted from IndexedDB after confirmed upload.
- If photo upload fails, the job log is still marked `synced`; photos remain queued with status `"photo_error"` and retry on next sync.

#### FR-014 — Retry Logic
- Failed sync items are retried with **exponential backoff**: 30s → 2m → 5m → 15m → 1h
- After 5 failures, item is marked `"error"` and the technician is notified with a manual retry option.
- Retries persist across app restarts (stored in IndexedDB).

---

### 3. CONFLICT RESOLUTION

#### FR-020 — Job Log Conflicts (Low Risk)
- Job logs are **append-only** from the field. Each log is authored by exactly one technician.
- Server-side conflict: if a `localId` has already been submitted (duplicate sync attempt), the server returns the existing `serverId` and marks it as `"already_synced"` rather than creating a duplicate.
- **Last-write-wins** is acceptable for job log fields — if the technician edits and re-syncs, the latest version overwrites.

#### FR-021 — Reference Data Conflicts (Read-Only Cache)
- Technicians cannot modify reference data (customers, locations, areas) from the field portal.
- **No write conflict possible** on reference data. Cache is always replaced wholesale on sync.
- Edge case: if a customer or location was deleted on the server while the technician was offline, the submitted job log uses the name text value (not just the FK). The server accepts the name-based fallback and logs a warning for admin review.

#### FR-022 — Conflict Resolution Rules Summary

| Data Type | Write Source | Conflict Risk | Resolution Strategy |
|-----------|-------------|--------------|---------------------|
| Job logs | Technician only | None (single author) | Last-write-wins; duplicate suppression by `localId` |
| Custom field values | Technician only | None | Last-write-wins |
| Reference data (customers, locations) | Admin only | None (read-only on field) | Full cache replacement on sync |
| Photos | Technician only | None | Upload after log sync; retry on failure |
| Field employee auth | Admin only | None (read-only on field) | Refresh on reconnect |

#### FR-023 — Clock Skew Handling
- Client timestamps may drift. The server records both `client_created_at` (from payload) and `server_received_at` (server clock).
- `jobDate` as entered by the technician is preserved exactly (it's a human-entered date field, not auto-generated).
- If `client_created_at` is more than **48 hours** in the past or future, the server flags the log for admin review but still accepts it.

---

### 4. UI INDICATORS

#### FR-030 — Connection Status Banner
- A status bar appears at the top of all `/field/*` pages (above main content, below any header):
  - 🟢 **Online** — hidden/minimal; no banner shown when connected and synced
  - 🟡 **Syncing** — amber banner: "Syncing X job log(s)…" with a spinner
  - 🔴 **Offline** — red banner: "You're offline. Job logs will be saved and synced when you reconnect."
  - 🔴 **Sync Error** — red banner: "X log(s) failed to sync. [Retry Now]"
- Banner integrates into `field-nav.tsx` or as a sibling above `<FieldNav>`.

#### FR-031 — Log Form Offline State
- The `/field/log` form works identically offline. No fields are disabled.
- Submit button text changes:
  - Online: "Submit Job Log"
  - Offline: "Save for Later" (same action, queued locally)
- On offline submit: toast notification — "Job log saved. It will sync automatically when you're back online."
- The form resets normally after offline submit (same UX as online success).

#### FR-032 — History Page Offline Badges
- Pending (unsynced) logs in `/field/history` show a **"Pending"** amber badge.
- Sync-errored logs show a **"Sync Failed"** red badge with a tap-to-retry action.
- Synced logs show no extra badge (existing behavior).
- A count indicator: "X job log(s) pending sync" at top of history list when queue is non-empty.

#### FR-033 — Photo Offline Indicators
- Photos attached to offline logs show a local preview (blob URL) with a **"Upload pending"** overlay.
- After sync: overlay clears when Cloudinary URL is confirmed.
- Photo upload failure: overlay changes to **"Upload failed — tap to retry"**.

#### FR-034 — Sync Progress Detail (Optional / P2)
- A "Sync Status" drawer accessible from the offline banner showing:
  - List of pending logs with timestamps
  - Per-log sync status
  - Manual "Sync Now" button
  - "Clear failed logs" action (with confirmation) for unrecoverable items

---

## Non-Functional Requirements

### NFR-001 — Storage Budget
- IndexedDB usage target: **< 50 MB** total per device
  - Reference data: ~1 MB
  - Job log queue: ~2 MB (50 logs × ~40 KB with metadata)
  - Photo blobs: up to 45 MB (50 photos × 900 KB average compressed)
- Warn technician if IndexedDB storage exceeds 80% of quota (browser-reported).

### NFR-002 — Sync Performance
- Reference data sync: < 2 seconds on LTE
- Per-log sync (text only, no photos): < 500ms per log
- Photo uploads use existing Cloudinary flow; no new latency requirements imposed

### NFR-003 — Service Worker Scope
- Service Worker scoped to `/field/*` only. Do not intercept admin or public site routes.
- Cache strategy for app shell (JS/CSS/HTML): **Cache First** with versioned cache bust on deploy
- Cache strategy for API calls: **Network First** with IndexedDB fallback for reference data reads

### NFR-004 — Security
- No sensitive data beyond what is already in `localStorage` is stored in plain text.
- IndexedDB stores job log content in plaintext (acceptable — device-local, same as localStorage).
- Photo blobs are deleted from IndexedDB immediately after confirmed upload.
- On logout (`POST /api/field/logout`), clear the employee's offline queue and reference cache from IndexedDB.

### NFR-005 — Graceful Degradation
- If Service Worker is unavailable (e.g., non-HTTPS in dev), the app operates in online-only mode. No hard failure.
- If IndexedDB is unavailable (rare: private browsing mode, storage full), show a persistent warning: "Offline mode unavailable. Please ensure a stable connection before submitting."

### NFR-006 — Browser Support
- Target: Chrome/Safari iOS 16+, Chrome Android 100+ (covers technician device profiles)
- Service Workers and IndexedDB are both supported in these targets.

---

## New Schema Requirements

No existing tables are modified. One new server-side concern:

### `offline_sync_log` (server audit table — optional, P2)
| Column | Type | Notes |
|--------|------|-------|
| `id` | serial PK | |
| `employee_id` | integer FK → `field_employees.id` | |
| `local_id` | text | Client UUID sent with payload |
| `job_log_id` | integer FK → `job_logs.id` | Set after successful insert |
| `client_created_at` | timestamp | Timestamp from device |
| `server_received_at` | timestamp | Server clock |
| `sync_status` | text | `accepted`, `duplicate`, `error` |
| `error_detail` | text | Server error if rejected |

---

## API Changes Required

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/ping` | Heartbeat endpoint — returns `{ ok: true }`. No auth required. |
| `POST` | `/api/field/sync` | Batch job log submission (see §FR-012) |
| `GET` | `/api/field/clients` | Already exists — no change needed |
| `GET` | `/api/field/suggestions` | Already exists — no change needed |
| `GET` | `/api/field/custom-fields` | Already exists — no change needed |

---

## Implementation Notes for Akbar/Luke

> **Opinion (labeled):** IndexedDB via the `idb` wrapper library is strongly recommended over raw IndexedDB API. It's Promise-based and dramatically reduces boilerplate. Check `package.json` for existing dependencies before adding.

> **Opinion:** Consider `workbox-webpack-plugin` or Vite's `vite-plugin-pwa` for Service Worker generation. Manual SW authoring for this scope is feasible but `vite-plugin-pwa` handles cache versioning cleanly with Vite.

> **Fact:** TanStack Query v5's `persistQueryClient` plugin can sync its in-memory cache to/from IndexedDB. This may reduce custom caching code for reference data reads. Worth evaluating before building a custom cache layer.

> **Risk:** Photos are the primary storage concern. On iOS, Safari IndexedDB storage is limited and can be cleared by the OS under storage pressure. Consider compressing photos to JPEG at 80% quality client-side before storing in IndexedDB.

---

## Assumptions

1. Field technicians use modern Android/iOS devices — service worker support is safe to assume.
2. The app is or will be served over HTTPS in production (required for service workers).
3. Offline capability is scoped to the **field portal only** (`/field/*`). Admin portal remains online-only.
4. Photo uploads continue to use Cloudinary. No alternative storage is needed offline.
5. Reference data (customers, locations, custom fields) changes infrequently — 24-hour cache TTL is acceptable.

---

## Open Questions

- **OQ-001:** What is the maximum number of photos a technician attaches per job log in practice? This determines worst-case offline storage pressure. (Ask Mike / field team.)
- **OQ-002:** Should offline logs be editable after being queued but before sync? Or are they read-only once submitted offline? (Recommend: allow edit with warning; needs Mike input.)
- **OQ-003:** Should admins be notified when a large batch of offline logs syncs in at once (e.g., technician syncs 20 logs after a full day offline)? (Suggest: yes, with a digest notification.)
- **OQ-004:** Is there a requirement for geo-tagging job logs? If yes, GPS capture should be included in the offline payload (easy to add while building this feature).
- **OQ-005:** Does the offline queue need to survive a full browser data clear (e.g., "Clear site data")? If so, consider offering an export/backup mechanism. (Currently: no — same risk as existing `localStorage` auth.)

---

## Research Sources

- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Workbox (Google)](https://developer.chrome.com/docs/workbox) — Service Worker tooling
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) — PWA / Service Worker for Vite
- [idb library](https://github.com/jakearchibald/idb) — IndexedDB Promise wrapper
- [TanStack Query: persistQueryClient](https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient) — Cache persistence plugin
- Existing project: `ARCHITECTURE.md`, `FIELD-SERVICE-GUIDE.md`, `shared/schema.ts`, `client/src/pages/field-log.tsx`, `client/src/pages/field-history.tsx`, `client/src/components/field-nav.tsx`

---

## Priority & Scope

| Story | Priority | Complexity |
|-------|----------|------------|
| Connection detection + banner (FR-010, FR-030) | **P0** | Low |
| Job log offline queue + submit (FR-002, FR-031) | **P0** | Medium |
| Reference data cache (FR-001) | **P0** | Medium |
| Auto-sync on reconnect (FR-011, FR-012) | **P0** | Medium |
| History cache + pending badges (FR-003, FR-032) | **P1** | Low |
| Photo offline + sync (FR-013, FR-033) | **P1** | High |
| Retry logic with backoff (FR-014) | **P1** | Medium |
| Conflict/duplicate detection (FR-020–023) | **P1** | Low |
| Auth re-validation on reconnect (FR-004) | **P1** | Low |
| Sync status drawer (FR-034) | **P2** | Low |
| Server audit log table | **P2** | Low |

---

*Document owner: 3CP0 (Research/Product). For architecture decisions, route to Akbar. For implementation, route to Luke.*
