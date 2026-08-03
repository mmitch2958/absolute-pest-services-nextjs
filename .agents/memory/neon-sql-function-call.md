---
name: Neon sql() function-call form
description: The Neon driver rejects calling sql() in function-call form; dynamic UPDATE SET clauses must use sql.query()
---

`@neondatabase/serverless` (via the wrapped `sql` in `src/lib/db.ts`) throws
`This function can now be called only as a tagged-template function` if you
invoke `sql()` as a plain function with an object, e.g.
`sql`UPDATE t SET ${sql(updates)} ...``.

**Why:** Added around 2026 — the Neon/postgres.js-style driver only accepts
tagged-template calls (`` sql`...` ``) or `.query(queryString, params)`. Any
code written before this that used the object-interpolation form breaks at
runtime, not compile time.

**How to apply:** For dynamic UPDATE SET clauses, build the query string with
`$N` placeholders and call `sql.query(query, [...vals, id])` — mirror the
working pattern in `app/api/admin/clients/[id]/route.ts`. If a PATCH-like route
was written with `SET ${sql(someObject)}`, convert it the same way. Also worth
grepping for `SET \${sql(` before adding new update routes.
