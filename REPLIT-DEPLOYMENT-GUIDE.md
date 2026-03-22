# Replit Deployment Guide for Agent Teams

This document covers the key differences between the dev team's local environment and the Replit production server. Read this before starting any development work to avoid the issues we've already solved.

---

## 1. React Rules of Hooks — No Hooks After Early Returns

**Problem:** React error #310 ("Rendered more hooks than during the previous render") crashes the entire page.

**Cause:** Calling `useState`, `useMutation`, `useQuery`, or any hook AFTER a conditional `return` statement in a component. React requires hooks to be called in the exact same order on every render.

**Bad (crashes in production):**
```tsx
function MyComponent() {
  const { isLoading } = useAuth();
  
  if (isLoading) return <Loader />; // early return
  
  const mutation = useMutation({ ... }); // ❌ this hook runs AFTER the early return
}
```

**Good:**
```tsx
function MyComponent() {
  const { isLoading } = useAuth();
  const mutation = useMutation({ ... }); // ✅ all hooks BEFORE any returns
  
  if (isLoading) return <Loader />;
}
```

**Rule:** ALL hooks must be at the top of the component, before any conditional returns. No exceptions.

---

## 2. Session Cookie — `credentials: "include"` on Every Fetch

**Problem:** API calls return 401 (Unauthorized) even though the user is logged in.

**Cause:** Browser `fetch()` does not send cookies by default. Without `credentials: "include"`, the session cookie is not sent, and the server sees the request as unauthenticated.

**Rule:** Every `fetch()` call to the backend MUST include `{ credentials: "include" }`:
```ts
fetch('/api/admin/some-endpoint', { credentials: "include" })
```

If using TanStack Query's `useQuery`, the default fetcher in `client/src/lib/queryClient.ts` already includes `credentials: "include"` — so `useQuery({ queryKey: ['/api/...'] })` is safe. But any raw `fetch()` inside `useEffect`, event handlers, or `Promise.all` blocks must explicitly include it.

---

## 3. File-Based Data Storage — Use Relative Paths

**Problem:** Marketing dashboard shows "No data yet" because data files can't be found.

**Cause:** The dev team's scripts write data files to `/data/.openclaw/workspace/projects/absolute-pest-services/data` — a path that only exists on the dev team's machine. Replit's production server has a completely different filesystem.

**Rule:** Always use relative paths for data storage:
```ts
// ❌ Don't hardcode absolute paths from your dev environment
const DATA_DIR = '/data/.openclaw/workspace/projects/...';

// ✅ Use relative paths that work everywhere
const DATA_DIR = path.join(process.cwd(), 'data', 'marketing');
```

---

## 4. MemoryStore Sessions — Sessions Reset on Every Deploy

**Problem:** Users get logged out every time the app is published/redeployed.

**Cause:** Express sessions use `MemoryStore` by default, which lives in RAM. When the server restarts (every deploy), all sessions are lost.

**Impact:** After every publish, all users (including admins) must log in again. This is a known limitation — a persistent session store (e.g., `connect-pg-simple` for PostgreSQL) would fix it but is not yet implemented.

**Rule:** Don't assume sessions persist across deploys. Design login flows and test accordingly.

---

## 5. Service Worker / PWA Caching — Users May See Stale Code

**Problem:** After publishing, users still see the old version of the app with old bugs.

**Cause:** The PWA service worker caches the JavaScript bundle. Even after a new deploy, the browser may serve the cached old bundle until the service worker updates.

**Rule:** After any publish that fixes bugs, tell users to do a **hard refresh** (Ctrl+Shift+R / Cmd+Shift+R). The `maximumFileSizeToCacheInBytes` is set to 5MB in `vite.config.ts` to accommodate the current bundle size (~3.16MB).

---

## 6. External API Integrations — Use Maton Gateway

**Problem:** Google Ads, GA4, and social media data needs to flow into the Marketing Dashboard.

**Solution:** We use **Maton** (gateway.maton.ai) as an API gateway with managed authentication.

**How it works:**
- Single API key (`MATON_API_KEY` env var) handles auth for all connected services
- Requests go to `https://gateway.maton.ai/{app-name}/{native-api-path}`
- Example: `POST https://gateway.maton.ai/google-analytics-data/v1beta/properties/{id}:runReport`

**Currently connected via Maton:**
- `google-analytics-data` — GA4 reporting (property ID: `507471089`)
- `google-analytics-admin` — GA4 account management
- `google-ads` — Pending connection in Maton dashboard

**Facebook/Instagram** use direct Graph API calls with `FB_PAGE_ID` and `FB_PAGE_ACCESS_TOKEN` env vars (not through Maton).

**Required Replit Secrets:**
| Secret | Purpose |
|--------|---------|
| `MATON_API_KEY` | Maton gateway auth for Google APIs |
| `FB_PAGE_ID` | Facebook Page ID |
| `FB_PAGE_ACCESS_TOKEN` | Facebook Graph API token |
| `SESSION_SECRET` | Express session encryption |
| `OPENAI_API_KEY` | AI blog generation |
| `DATABASE_URL` | PostgreSQL connection |
| `SENDGRID_API_KEY` | Transactional emails |
| `CLOUDINARY_CLOUD_NAME` | Photo storage |
| `CLOUDINARY_API_KEY` | Photo storage |
| `CLOUDINARY_API_SECRET` | Photo storage |

---

## 7. Bundle Size — Keep It Under 5MB

The current JS bundle is ~3.16MB. The PWA service worker's `maximumFileSizeToCacheInBytes` is set to 5MB. If the bundle exceeds 5MB, the publish will fail.

**If you add large dependencies:** Check the bundle size doesn't exceed the limit. Consider code splitting for admin-only routes.

---

## 8. Production Session Config

The session cookie config in `server/routes.ts` uses:
```ts
cookie: {
  secure: isProduction,    // true in production (HTTPS only)
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000  // 24 hours
}
```

With `trust proxy` set to `1` in production (required because Replit's load balancer terminates SSL).

**Don't change `secure` to `false` in production** — it will break cookie security on HTTPS.

---

## 9. GitHub Repo Sync Workflow

- **Repo:** `SteelCity-ai/AbsolutePestServices.com` (main branch)
- Dev team pushes to GitHub → Replit pulls changes → validates → publishes
- After pulling changes, always restart the server to pick up new code
- After publishing, do a hard refresh to clear service worker cache

---

## Quick Checklist Before Submitting Code

- [ ] All hooks are before any early returns in every component
- [ ] All `fetch()` calls include `{ credentials: "include" }`
- [ ] No hardcoded absolute file paths — use `process.cwd()` relative paths
- [ ] No new dependencies that push bundle over 5MB
- [ ] Tested with a fresh login (don't rely on existing sessions)
- [ ] Environment variables referenced in code are documented above
