**Bug fix review: PATCH endpoints failing with Neon driver tagged-template error**

**What happened:** Editing a scheduled job from the field portal (`/field/schedule`) — and editing jobs, contracts, inspections, invoices, and service requests from the admin panel — failed with the error:

```
Error: This function can now be called only as a tagged-template function:
sql`SELECT ${value}`, not sql("SELECT $1", [value], options).
For a conventional function call with value placeholders ($1, $2, etc.),
use sql.query("SELECT $1", [value], options).
```

The UI showed "Failed to update job" and the update never reached the database.

**Root cause — Neon driver behavior:** We use `@neondatabase/serverless` as our database driver (wrapped in `src/lib/db.ts` as `sql`). Starting with current driver versions, Neon (which is built on the `postgres.js` API) enforces that the `sql` proxy can **only** be invoked as a tagged-template function:

```ts
sql`UPDATE job_logs SET col = ${value} WHERE id = ${id}`
```

It **no longer allows** calling `sql()` as a plain function with an object argument to auto-generate the `SET` clause:

```ts
// ❌ BROKEN — driver throws "can only be called as a tagged-template function"
const result = await sql`UPDATE job_logs SET ${sql(updates)} WHERE id = ${jobId} RETURNING *`;
```

The nested `sql(updates)` call is a function-style invocation with a plain object, which the current Neon driver rejects. This breaks in production at runtime even though TypeScript compiles fine, so it's easy to miss in testing unless you exercise the actual PATCH request.

**How it was fixed:** Dynamic `UPDATE ... SET` clauses are now built manually with positional placeholders (`$1`, `$2`, …) and executed with `sql.query(queryString, params)`, which is the supported function-call form:

```ts
// ✅ FIXED — manual SET clause + sql.query()
const cols = Object.keys(updates);
const vals = Object.values(updates);
const setClause = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
const query = `UPDATE job_logs SET ${setClause} WHERE id = $${cols.length + 1} RETURNING *`;

const result = await sql.query(query, [...vals, jobId]);
```

This mirrors the pattern already proven working in `app/api/admin/clients/[id]/route.ts`.

**Files fixed (all had the same one-line bug):**
- `app/api/field/scheduled-jobs/[id]/route.ts`
- `app/api/admin/scheduled-jobs/[id]/route.ts`
- `app/api/admin/contracts/[id]/route.ts`
- `app/api/admin/inspections/[id]/route.ts`
- `app/api/admin/invoices/[id]/route.ts`
- `app/api/admin/service-requests/[id]/route.ts`

**Rule going forward:**
1. Never write `` sql`... ${sql(obj)} ...` `` for dynamic SET clauses. Build the query string with `$N` placeholders and call `sql.query(query, params)` instead.
2. Before shipping any PATCH/update route, actually exercise the endpoint (or a unit test that runs the query) against the real DB — a successful `next build` does NOT verify runtime DB behavior.
3. When in doubt, search the codebase for the old pattern (`SET \${sql(`) before writing new update routes.
4. Prefer the table-specific drizzle ORM (`db` from `src/lib/db.ts`) for new typed writes where practical — it handles dynamic updates safely.

**How to test the fix (do this before marking done):**
1. **Field portal (the original bug):** Log in as a tech at `/field`, go to **Schedule**, open a job in the edit modal, change its status (e.g. pick a job and switch it between two statuses, including at least one "backwards" transition like completed → scheduled, since that's the exact case that failed), change the assigned tech or date too, hit **Save**. Confirm it saves with no error.
2. **Admin portal:** Log in at `/admin`, and verify edits save on each of the previously-broken pages — **Scheduling** (edit a job), **Contracts** (edit a contract), **Inspections** (edit a status/date), **Invoices** (edit status/notes), and **Service Requests** (add a message/note).
3. **Verify the DB row actually changed:** After saving, re-open the same record and confirm your changes persisted (or query the table directly with `SELECT ... WHERE id = <id>`).
4. **Check server logs:** Confirm there are no new occurrences of `This function can now be called only as a tagged-template function` in the logs during the steps above. The old pattern appears as `[field/scheduled-jobs/:id] PATCH error` / `[admin/...] PATCH error` log lines.
5. **Production readiness:** Run `npm run build` — but remember, a green build alone is **not** proof the DB calls work. The PATCH requests in steps 1–3 are the real test.
