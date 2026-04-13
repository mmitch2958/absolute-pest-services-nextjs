# Steel City AI Dev Team — Deployment & Development Guide

**Project:** Absolute Pest Services (absolutepestservices.com)
**Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Neon PostgreSQL, Drizzle ORM
**Hosting:** Replit Autoscale

---

## Why This Document Exists

On April 13, 2026, deployment was blocked by two critical issues:

1. A leftover `express/` directory (from the pre–Next.js migration) contained its own `package.json` and `package-lock.json` with vulnerable dependencies. Replit's security scanner flagged the entire workspace and refused to deploy.
2. Three new carpenter bee pages were built but never linked from navigation — invisible to users and search engines.

This guide ensures those mistakes don't happen again.

---

## How Deployment Works on Replit

Replit does **not** run `npm run dev` in production. Here is what happens when you hit Publish:

| Step | What runs | Notes |
|------|-----------|-------|
| **Build** | `npx next build --webpack` | Compiles the app. Turbopack is **not available** — native SWC binaries don't exist in this environment. The `--webpack` flag is required. |
| **Start** | `npx next start -p 5000` | Serves the production build on port 5000. |
| **Security scan** | Automatic | Scans **every** `package.json` and `package-lock.json` in the entire repo, not just the root. Any critical vulnerability = deployment blocked. |

**Your job:** Make sure `npx next build --webpack` passes cleanly. If it doesn't, it won't deploy.

---

## Rules for Building New Features

### Adding a New Page

1. Create a folder under `app/` with a `page.tsx` file inside it:
   ```
   app/your-new-page/page.tsx
   ```

2. Every page **must** export metadata for SEO:
   ```tsx
   import type { Metadata } from 'next'

   export const metadata: Metadata = {
     title: 'Page Title | Absolute Pest Services',
     description: 'A clear description of what this page is about.',
     alternates: { canonical: 'https://absolutepestservices.com/your-new-page' },
     openGraph: {
       title: 'Page Title | Absolute Pest Services',
       description: 'Same or similar description for social sharing.',
       url: 'https://absolutepestservices.com/your-new-page',
       type: 'website',
     },
   }
   ```

3. The page component is a **Server Component** by default. Only add `'use client'` at the top if you need browser interactivity (click handlers, useState, useEffect, etc.).

4. If you use React hooks (`useState`, `useEffect`, etc.), they **must** be called at the very top of the component, before any `if` statements or early `return`s. Violating this causes production-only crashes that won't show up in dev mode.

### Linking the Page (Required — Not Optional)

Every new page must be reachable. A page that exists but isn't linked is invisible. Update **all three** of these:

| Location | File | What to add |
|----------|------|-------------|
| Desktop nav | `src/components/layout/Header.tsx` | Add a `<Link>` in the appropriate dropdown or nav section |
| Mobile nav | `src/components/layout/MobileMenu.tsx` | Add the same `<Link>` in the mobile menu |
| Homepage (if it's a service page) | `app/page.tsx` | Add a card, link, or section so visitors can discover it |

If the page is a sub-page (like `/carpenter-bee-treatment` under `/carpenter-bee-control`), also add navigation on the parent page linking to it.

### Images

- Place images in `public/images/` (organized into subfolders like `public/images/carpenter-bee/`).
- Reference them with absolute paths: `src="/images/carpenter-bee/my-photo.jpg"`.
- Use the Next.js `<Image>` component (imported from `next/image`) for all images — it handles optimization automatically.
- Always include a descriptive `alt` attribute.

### Imports and Path Aliases

Use these path aliases (already configured in `tsconfig.json`):

| Alias | Maps to | Example |
|-------|---------|---------|
| `@/*` | `./src/*` | `import Header from '@/components/layout/Header'` |
| `@/server/*` | `./server/*` | `import { db } from '@/server/db'` |
| `@/shared/*` | `./shared/*` | `import { users } from '@/shared/schema'` |

### Icons

Use `lucide-react` for all icons:
```tsx
import { Phone, Calendar, CheckCircle } from 'lucide-react'
```

### Styling

- Use Tailwind CSS classes. Don't write custom CSS unless absolutely necessary.
- The site uses a green/white/gray color scheme. Stick to `green-700`, `green-800`, `gray-50`, `gray-600`, `gray-800`, `amber-*` for accents.

---

## Things That Will Break Deployment

### 1. Leftover Directories with Their Own package.json

If you scaffold something temporarily, prototype in a subfolder, or migrate away from an old framework — **delete the directory completely** before merging. Replit scans the entire workspace. A stale `package-lock.json` with old dependencies will block deployment even if nothing references that folder.

**Check:** Before submitting a PR, run this from the project root:
```bash
find . -name "package.json" -not -path "./node_modules/*" | head -20
```
There should be exactly **one** result: `./package.json`. If you see any others, delete those directories.

### 2. Adding or Changing Dependencies

Do **not** manually edit `package.json`. On Replit, packages are installed through the platform's package manager. If you need a new dependency:

- Note it in your PR description (e.g., "This feature requires `date-fns`").
- The Replit environment will handle installation.

If you're working locally and need to test with a new package, use `npm install <package>` but make sure the dependency is a sensible, maintained package — no random unmaintained libraries.

### 3. Modifying Build or Config Files

Do **not** modify these files:

| File | Why |
|------|-----|
| `next.config.ts` | The webpack config, image optimization, and security headers are specifically tuned for this environment. |
| `.replit` | Controls how Replit builds and deploys the app. |
| `start.sh` | Handles SWC binary workarounds needed for Replit's NixOS. |
| `drizzle.config.ts` | Database migration config. |
| `tsconfig.json` | Path aliases and compiler settings. |

If you believe a config change is needed, flag it in your PR description and let the deployment team handle it.

### 4. Using `'use client'` Carelessly

Server Components (the default) are faster, better for SEO, and reduce bundle size. Only add `'use client'` to a file when the component genuinely needs browser APIs. If only a small part of a page needs interactivity, extract that part into its own client component and keep the page itself as a server component.

---

## Database Changes

If your feature needs new data:

1. Define the schema in `shared/schema.ts` using Drizzle ORM.
2. Create a migration with `npx drizzle-kit generate`.
3. Apply it with `npx drizzle-kit push`.
4. Never write raw SQL for schema changes.

---

## Pre-Merge Checklist

Before submitting your PR, verify:

- [ ] `npx next build --webpack` completes with no errors
- [ ] No extra `package.json` files exist outside the root
- [ ] Every new page is linked in both desktop nav (`Header.tsx`) and mobile nav (`MobileMenu.tsx`)
- [ ] New service pages are discoverable from the homepage
- [ ] All images have `alt` text
- [ ] Page has `metadata` export with title, description, canonical URL, and OpenGraph tags
- [ ] No `console.log` statements left in production code
- [ ] React hooks are called at the top of components, before any conditionals

---

## Project File Structure Reference

```
app/                          # All pages and API routes (Next.js App Router)
  page.tsx                    # Homepage
  layout.tsx                  # Root layout (Header, Footer, global wrappers)
  carpenter-bee-control/      # Example service page
    page.tsx
  admin/                      # Admin dashboard (protected routes)
  api/                        # Backend API endpoints
  blog/                       # Blog pages
  city-services/[slug]/       # Dynamic city SEO pages
  service-areas/[slug]/       # Dynamic service area pages

src/
  components/
    layout/
      Header.tsx              # Desktop navigation (UPDATE WHEN ADDING PAGES)
      MobileMenu.tsx          # Mobile navigation (UPDATE WHEN ADDING PAGES)
      Footer.tsx
    ui/                       # Reusable UI components (buttons, forms, cards)
    spring-carpenter-bee-banner.tsx
  lib/                        # Utility functions, data files

server/
  cron.ts                     # Scheduled jobs (review emails, etc.)
  db.ts                       # Database connection

shared/
  schema.ts                   # Database schema (Drizzle ORM)

public/
  images/                     # Static images (organized by topic)

migrations/                   # SQL migration files (auto-generated by Drizzle)
```

---

## Quick Reference: Adding a Service Page End-to-End

Here's the complete workflow for adding a new service page (e.g., `/mosquito-control`):

1. **Create the page:** `app/mosquito-control/page.tsx`
2. **Add metadata** at the top of the file (title, description, canonical, OpenGraph)
3. **Build the page content** using existing patterns — look at `app/carpenter-bee-treatment/page.tsx` as a reference
4. **Add images** to `public/images/mosquito/` and use `<Image>` from `next/image`
5. **Update Header.tsx** — add a link in the Services dropdown
6. **Update MobileMenu.tsx** — add the same link in the mobile menu
7. **Update homepage** (`app/page.tsx`) — add a card or mention in the services section if appropriate
8. **Test the build:** run `npx next build --webpack` and confirm it passes
9. **Submit your PR**

---

## Questions?

If you're unsure whether a change will affect deployment, flag it in the PR description. The deployment environment has specific constraints (no native SWC, no Turbopack, single package.json only) that don't exist in standard local development. When in doubt, ask before merging.
