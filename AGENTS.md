<!-- BEGIN:nextjs-agent-rules -->
# APS Next.js Test Site — Agent Rules

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:critical-repo-rules -->
## 🔴 CRITICAL — Repo Protection Rules

**This workspace is the Next.js test migration. You are FORBIDDEN from pushing to `SteelCity-ai/AbsolutePestServices.com.git`.**

### Allowed remotes (SAFE to push to):
- `personal` → `mmitch2958/absolute-pest-services-nextjs.git`

### Forbidden remotes (NEVER push to):
- `origin` → `SteelCity-ai/AbsolutePestServices.com.git` ❌ DO NOT TOUCH ❌

Before every `git push`, verify which remote you are pushing to. If in doubt, ask.

This rule exists because `SteelCity-ai/AbsolutePestServices.com.git` is the **production Express app** — it is managed in the `workspace-aps-express` workspace. The Next.js migration must not touch it until the migration is complete and Mike approves the cutover.
<!-- END:critical-repo-rules -->
