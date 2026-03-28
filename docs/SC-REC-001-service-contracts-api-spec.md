# SC-REC-001: Service Contracts API Design Brief

**Author:** Akbar (System Architect)  
**Date:** 2026-03-08  
**Status:** Ready for Implementation  
**For:** Luke (Build)

---

## 1. Current State Assessment

### What Already Exists ✅

The following are **already implemented** and functional — Luke does NOT need to rebuild them:

| Layer | Status |
|-------|--------|
| `serviceContracts` table in `shared/schema.ts` | ✅ Done |
| `insertServiceContractSchema` Zod schema | ✅ Done |
| `IStorage` interface methods (CRUD) | ✅ Done |
| `DatabaseStorage` implementations (CRUD) | ✅ Done |
| `GET /api/admin/service-contracts` | ✅ Done |
| `GET /api/admin/service-contracts/:id` | ✅ Done |
| `POST /api/admin/service-contracts` | ✅ Done |
| `PATCH /api/admin/service-contracts/:id` | ✅ Done |
| `DELETE /api/admin/service-contracts/:id` | ✅ Done |
| `GET /api/admin/scheduled-jobs` (stub calendar) | ✅ Done (minimal) |

---

## 2. Schema Gap Analysis

### Current `serviceContracts` table fields:
```
id, customerId, frequency, nextScheduledDate, siteLocation,
servicedArea, defaultWorkTemplate, isActive, createdAt, updatedAt
```

### Missing Fields (Required for Recurring Jobs Feature)

The following fields must be **added to `shared/schema.ts`**:

| Field | Type | Default | Reason |
|-------|------|---------|--------|
| `lastGeneratedJobDate` | `timestamp` | `null` | Track when a job was last auto-created from this contract — prevents double-generation |
| `notes` | `text` | `null` | Admin notes on the contract (internal) |
| `assignedEmployeeId` | `integer → fieldEmployees.id` | `null` | Pre-assign a technician to generated jobs |
| `startDate` | `timestamp` | `null` | Contract effective start date |
| `endDate` | `timestamp` | `null` | Contract expiry (null = indefinite) |

### Schema Change (add to `serviceContracts` table in `shared/schema.ts`)

```ts
// Add these columns to the serviceContracts pgTable definition:
lastGeneratedJobDate: timestamp("last_generated_job_date"),
notes: text("notes"),
assignedEmployeeId: integer("assigned_employee_id").references(() => fieldEmployees.id),
startDate: timestamp("start_date"),
endDate: timestamp("end_date"),
```

### Update `insertServiceContractSchema`:
```ts
// The schema already omits id/createdAt/updatedAt/isActive.
// Add date coercion for the new timestamp fields, same pattern as existing fields:
.extend({
  lastGeneratedJobDate: z.union([z.date(), z.string()])
    .transform(val => typeof val === 'string' ? new Date(val) : val).optional().nullable(),
  startDate: z.union([z.date(), z.string()])
    .transform(val => typeof val === 'string' ? new Date(val) : val).optional().nullable(),
  endDate: z.union([z.date(), z.string()])
    .transform(val => typeof val === 'string' ? new Date(val) : val).optional().nullable(),
})
```

**After schema changes:** Run `npm run db:push`

---

## 3. API Endpoints to Implement

### 3.1 CRUD Endpoints — ALREADY EXIST, minor improvements needed

The existing CRUD routes use `/api/admin/service-contracts` (plural). This is consistent with the codebase. **No rename needed.**

#### Existing route improvements to make:

**`GET /api/admin/service-contracts`** — add `assignedEmployeeId` filter support:
```
Query params:
  customerId?    integer   — filter by customer
  isActive?      boolean   — filter by active status (default: all)
  assignedEmployeeId? integer — filter by assigned technician (NEW)
```

**Response (no change needed):**
```json
{
  "success": true,
  "contracts": [ServiceContract]
}
```

---

### 3.2 Calendar Endpoint (NEW)

**`GET /api/admin/contracts/calendar`**

> Note: For consistency with existing routes, mount at `/api/admin/service-contracts/calendar`

**Query Parameters:**
```
from    string (ISO 8601 date)  required   Start of date range
to      string (ISO 8601 date)  required   End of date range
```

**Purpose:** Returns all active contracts with `nextScheduledDate` falling within `[from, to]`, enriched with customer name for display on a calendar UI.

**Request Example:**
```
GET /api/admin/service-contracts/calendar?from=2026-03-01&to=2026-03-31
```

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "contractId": 12,
      "customerId": 5,
      "customerName": "Allegheny County Schools",
      "siteLocation": "Main Building",
      "servicedArea": "Cafeteria",
      "frequency": "monthly",
      "scheduledDate": "2026-03-15T08:00:00.000Z",
      "assignedEmployeeId": 3,
      "lastGeneratedJobDate": "2026-02-15T08:00:00.000Z",
      "isActive": true
    }
  ]
}
```

**Storage method to add (`IStorage` + `DatabaseStorage`):**
```ts
getContractCalendar(from: Date, to: Date): Promise<ContractCalendarEvent[]>
```

**Implementation note:** This requires a JOIN between `serviceContracts` and `clients` to get `customerName`. Use Drizzle's `.leftJoin()`.

**ContractCalendarEvent type** (add to `shared/schema.ts`):
```ts
export type ContractCalendarEvent = {
  contractId: number;
  customerId: number;
  customerName: string;
  siteLocation: string;
  servicedArea: string;
  frequency: string;
  scheduledDate: Date;
  assignedEmployeeId: number | null;
  lastGeneratedJobDate: Date | null;
  isActive: boolean;
};
```

---

### 3.3 Generate Job Endpoint (NEW)

**`POST /api/admin/service-contracts/:id/generate-job`**

**Purpose:** Manually (or eventually automatically) creates a `jobLog` record from a service contract template.

**Auth:** `requireAdmin`

**Request:** No body required. All data comes from the contract.

**Response (success):**
```json
{
  "success": true,
  "message": "Job generated successfully",
  "jobLog": {
    "id": 88,
    "employeeId": 3,
    "customerName": "Allegheny County Schools",
    "clientId": 5,
    "siteLocation": "Main Building",
    "siteAddress": null,
    "servicedArea": "Cafeteria",
    "workPerformed": "Routine quarterly pest treatment",
    "jobDate": "2026-03-15T08:00:00.000Z",
    "status": "scheduled",
    "customFields": null,
    "createdAt": "2026-03-08T17:00:00.000Z"
  }
}
```

**Response (409 — job already generated for this cycle):**
```json
{
  "success": false,
  "message": "A job has already been generated for this contract in the current cycle",
  "lastGeneratedJobDate": "2026-02-15T08:00:00.000Z"
}
```

**Response (404):**
```json
{ "success": false, "message": "Service contract not found" }
```

**Server Logic (in `routes.ts`):**
```
1. Fetch contract by id — 404 if not found
2. Check isActive — 400 if inactive
3. Idempotency check: if lastGeneratedJobDate is within the current frequency window, return 409
   - weekly:    lastGeneratedJobDate > (now - 7 days)
   - monthly:   lastGeneratedJobDate > (now - 28 days)
   - quarterly: lastGeneratedJobDate > (now - 84 days)
4. Resolve employeeId: use contract.assignedEmployeeId if set; else use a sentinel/default
   - If no assignedEmployeeId: return 400 with message "Contract has no assigned technician — assign one before generating"
5. Fetch client name from clients table for customerName field
6. Create jobLog via storage.createJobLog({
     employeeId: contract.assignedEmployeeId,
     customerName: client.name,
     clientId: contract.customerId,
     siteLocation: contract.siteLocation,
     servicedArea: contract.servicedArea,
     workPerformed: contract.defaultWorkTemplate ?? "Service visit",
     jobDate: contract.nextScheduledDate,
     status: "scheduled",
   })
7. Update contract: set lastGeneratedJobDate = now, advance nextScheduledDate by frequency
8. Return 200 with generated jobLog
```

**Frequency advance logic (helper function):**
```ts
function advanceNextScheduledDate(current: Date, frequency: string): Date {
  const next = new Date(current);
  switch (frequency) {
    case 'weekly':    next.setDate(next.getDate() + 7); break;
    case 'monthly':   next.setMonth(next.getMonth() + 1); break;
    case 'quarterly': next.setMonth(next.getMonth() + 3); break;
    default:          next.setMonth(next.getMonth() + 1);
  }
  return next;
}
```

**Storage methods needed (add to `IStorage` + `DatabaseStorage`):**
```ts
// Already exists — no new methods needed beyond what's in CRUD + getJobLog
// The generate-job route is thin logic in routes.ts calling existing storage methods
```

---

## 4. Implementation Checklist for Luke

### Step 1 — Schema
- [ ] Add `lastGeneratedJobDate`, `notes`, `assignedEmployeeId`, `startDate`, `endDate` to `serviceContracts` table
- [ ] Update `insertServiceContractSchema` with date coercions for new timestamp fields
- [ ] Add `ContractCalendarEvent` type export
- [ ] Run `npm run db:push`

### Step 2 — Storage
- [ ] Add `getContractCalendar(from: Date, to: Date): Promise<ContractCalendarEvent[]>` to `IStorage` interface
- [ ] Implement in `DatabaseStorage` using Drizzle LEFT JOIN on `clients`
- [ ] Add optional `assignedEmployeeId` filter to `getServiceContracts()`

### Step 3 — Routes
- [ ] Add `GET /api/admin/service-contracts/calendar` (date-range calendar with JOIN)
- [ ] Add `POST /api/admin/service-contracts/:id/generate-job` (full logic per section 3.3)
- [ ] Update `GET /api/admin/service-contracts` to support `assignedEmployeeId` query param

### Step 4 — Frontend (out of scope for this spec, but note for Luke)
- These endpoints feed the recurring jobs calendar UI
- TanStack Query keys: `['contracts']`, `['contracts', 'calendar', from, to]`
- Invalidate `['contracts']` after generate-job mutation

---

## 5. Security Notes

- All endpoints: `requireAdmin` session middleware — consistent with all `/api/admin/*` routes
- No public exposure
- `assignedEmployeeId` FK prevents orphaned references
- Idempotency guard on generate-job prevents accidental duplicate job creation

---

## 6. Open Questions / Decisions for Mike

1. **Unassigned contracts:** Should generate-job be blocked if no `assignedEmployeeId` (recommended, see spec), or should it create an "unassigned" job that gets assigned later?
2. **Auto-generation:** This spec covers manual trigger only. Do we want a cron job to auto-generate jobs at scheduled times? (Future ADR if yes.)
3. **`endDate` behavior:** Should contracts with a past `endDate` auto-deactivate (`isActive = false`) via a scheduled job, or just be filtered out by the calendar endpoint?
