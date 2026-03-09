# ADR-003: Link `users` ↔ `clients` Tables via FK on `clients`

**Status:** Accepted  
**Date:** 2026-03-09  
**Author:** Akbar (System Architect)  
**Related:** SC-PORT-001 (Customer Portal) — Open Question Q5; Feature #5 (Invoice Management)

---

## Context

The system has two separate tables:

- **`users`** — Registered portal accounts (`role = 'user'` for customers, `role = 'admin'` for staff). Created via the `/auth/register` flow.
- **`clients`** — Admin-managed CRM records representing pest control customers. These are the authoritative business records that invoices, job logs, and service contracts are linked to.

These tables were not connected. This blocked:

1. **Customer Portal (SC-PORT-001)** — Portal users cannot see their invoices because invoices link to `clients.id`, not `users.id`
2. **User-to-customer relationship** — No way to answer "which client record belongs to this logged-in user?"

The requirements document (SC-PORT-001) identified three options for resolving this (Open Question Q5).

---

## Decision

Add a **nullable `user_id` foreign key on the `clients` table** pointing to `users.id`.

```sql
ALTER TABLE clients
  ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
```

**Relationship:** One-to-one (a client can have at most one portal account; a user maps to at most one client record).

**Enforcement:** Application-level uniqueness (not a DB UNIQUE constraint yet — see Consequences).

**Linkage mechanism:** Admin manually sets the link via `PATCH /api/admin/clients/:id` (or equivalent admin UI). This is intentional — admin verifies identity before granting portal access to invoices.

---

## Alternatives Considered

### Option A: Add `clientId` FK on `users` table
- **Pros:** Symmetrical; easy to look up from session (user already loaded)
- **Cons:** `users` is an auth table — polluting it with business domain FKs is poor separation of concerns. Users may exist without any client record (staff accounts, admin accounts). Every auth query would unnecessarily carry business data.
- **Rejected**

### Option B: Match by email (`users.email === clients.email`)
- **Pros:** Zero schema change; works immediately
- **Cons:** Fragile — emails can diverge (client changes email with admin, doesn't update portal account). Creates invisible dependency on email consistency. Silent failures (wrong match or no match) are hard to debug. A security risk if email collision occurs.
- **Rejected** as primary mechanism. May be used as a **fallback hint** in the admin UI to suggest which client to link during onboarding.

### Option C (Selected): Add `userId` FK on `clients` table
- **Pros:**
  - `clients` is the business domain table — the FK lives where the relationship semantically belongs
  - Nullable: most clients never register for the portal (cash customers, one-time services)
  - `ON DELETE SET NULL`: deleting a portal user doesn't destroy the client record or its history
  - Clean query: `SELECT * FROM clients WHERE user_id = $1 LIMIT 1` — simple and fast
  - Future: Could add a partial UNIQUE INDEX `ON clients(user_id) WHERE user_id IS NOT NULL` when ready
- **Cons:**
  - Admin must manually link records (intentional security control, but adds friction)
  - Portal onboarding requires an admin step before invoice visibility works

---

## Implementation

### Schema Change (`shared/schema.ts`)

```typescript
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  // ... existing fields
});
```

### Migration (`migrations/0001_link_users_clients.sql`)

```sql
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
```

### New Admin API Endpoint (for Luke to implement)

```
PATCH /api/admin/clients/:id/link-user
Body: { userId: number | null }
Auth: requireAdmin
```

This sets `clients.userId`. Passing `null` unlinks the user.

### Customer Portal Invoice Query Pattern

```typescript
// In storage layer: get invoices for a logged-in portal user
async getInvoicesByUser(userId: number): Promise<Invoice[]> {
  // Step 1: find the client record linked to this user
  const client = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.userId, userId))
    .limit(1);

  if (!client.length) return []; // no linked client — no invoices

  // Step 2: return non-draft, non-void invoices for that client
  return db
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.clientId, client[0].id),
        notInArray(invoices.status, ['draft', 'void'])
      )
    )
    .orderBy(desc(invoices.issueDate));
}
```

---

## Additional Change: `customer_messages` Table

As part of this migration, the `customer_messages` table is also added (SC-PORT-001, Module 5 — Communication). This table requires the `users` FK and belongs in the same migration.

```typescript
export const customerMessages = pgTable("customer_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  direction: text("direction").notNull(), // 'customer_to_admin' | 'admin_to_customer'
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  sentByAdminId: integer("sent_by_admin_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

## Consequences

### Positive
- Customer Portal invoice visibility is now achievable (the primary blocker is resolved)
- Clean data model: business domain FK lives on the business domain table
- Existing client records are unaffected (nullable — no backfill needed)
- `ON DELETE SET NULL` preserves invoice/contract history if a user account is removed

### Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Admin forgets to link user → customer sees no invoices | Admin UI shows "Portal: Not linked" badge on client records; email-match hint can suggest likely match |
| Two users accidentally linked to same client | Add partial UNIQUE INDEX `ON clients(user_id) WHERE user_id IS NOT NULL` in a follow-up migration when the admin UI link flow is stable |
| Email-based auto-link temptation | Explicitly avoid it — use as suggestion only, require admin confirmation |

### Follow-up Tasks

- [ ] Luke: Implement `PATCH /api/admin/clients/:id/link-user` endpoint
- [ ] Luke: Add "Portal Account" field to admin client detail UI (shows linked user or "Not linked")
- [ ] Luke: Implement `getInvoicesByUser(userId)` in storage layer
- [ ] Luke: Build portal invoice list view (SC-PORT-001 Module 3)
- [ ] Luke: Add email-match hint in admin UI to speed up linking during onboarding

---

## Related

- [SC-PORT-001](./SC-PORT-001-requirements.md) — Customer Self-Service Portal Requirements
- [Feature-5-Invoice-Management-Requirements.md](./Feature-5-Invoice-Management-Requirements.md)
- Migration: `migrations/0001_link_users_clients.sql`
