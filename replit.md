# Absolute Pest Services Website — Next.js

## Overview

Full-stack pest control business website for Absolute Pest Services (absolutepestservices.com) serving PA & DE. Built on Next.js 16.2.1 (App Router) with Neon PostgreSQL, Tailwind CSS v4, and iron-session auth. Includes a public-facing marketing site, admin dashboard, service request forms, blog, local SEO city pages, and a cron job for review request emails.

## Workspace Structure

```
/                        ← Active Next.js app (mmitch2958/absolute-pest-services-nextjs)
  app/                   ← Next.js App Router pages
    admin/
      (protected)/       ← Auth-protected admin pages (layout checks session)
      login/             ← Login page (outside auth layout)
    api/                 ← API route handlers
  server/                ← Cron job (cron.ts)
  shared/                ← Drizzle schema (schema.ts)
  src/
    components/          ← React components (forms, UI)
    lib/                 ← db.ts, admin-session.ts, utils
  start.sh               ← Startup script (SWC workaround + webpack mode)
```

## Architecture Reference

See `ARCHITECTURE.md` for the full immutable architecture spec.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: Next.js 16.2.1 (App Router)
- **Styling**: Tailwind CSS v4 with @tailwindcss/postcss
- **Forms**: React Hook Form + Zod + Server Actions
- **Key Features**:
    - Service pages (bat removal, bed bugs, termites, rodents, wildlife)
    - City-service SEO landing pages
    - Admin dashboard (protected route group)
    - Blog, cost calculator, service request form
    - Customer Portal: Full portal at `/portal` — dashboard, service requests, appointments, invoices, profile management. Session-protected with `requirePortalUser`.
    - Admin Interface: Service management (requests, inspection schedules, client linking), blog management (RSS syndication, post creation/editing, bulk delete, newsletter), employee management, PDF report generation, invoice lifecycle, service contracts, calendar view, dashboard analytics.
    - Field Portal: PIN-based login, job logging with photos, history viewing, employee management, job status workflow, route optimization.

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas (shared with frontend)
- **Session Management**: Express sessions (in-memory MemoryStore)
- **Cron Jobs**: node-cron for daily overdue invoice checks (9 AM)
- **API Endpoints**:
    - Public: Contact form submission, service requests, inspection scheduling, blog.
    - Authenticated User: Manage service requests, view history, messaging.
    - Admin: Manage contacts, services, users, blog, job logs, invoices, contracts, analytics, generate reports.
    - Field Employee: PIN authentication, job log submission, photo uploads, employee management.
- **Security**: Cloudflare Turnstile CAPTCHA on all public forms, bcrypt for password hashing.

### Property Type (Residential / Commercial)
- Added `propertyType` column to `clients` table (default: "residential") and `fieldCustomers` table
- `email` on `clients` is now nullable (allows creating clients without an email address)
- **Admin Clients page**: Residential/Commercial toggle in the create/edit form, property type badge in the table, filter buttons to show All / Residential / Commercial clients
- **Admin Scheduling**: When selecting a known client, their property type auto-fills as a read-only badge; when entering a new customer, a Residential/Commercial toggle appears. On save, new customers are automatically created as client records with their type set
- **Field Log**: Property type badge shown for known clients; toggle shown for new customers. The type is saved to the `fieldCustomers` table on job submit
- **Calendar View**: Full filter bar — toggle Jobs/Contracts, Past/Upcoming/All dates, Residential/Commercial, and filter by technician. Active filter count displayed in header
- Backend: `/api/field/suggestions` now returns real clients with `propertyType`; `/api/admin/scheduled-jobs` includes `propertyType` (joined from clients table)

### Service Rates & Job-to-Invoice Flow
- `service_rates` table stores admin-configurable service types (name, description, defaultRate, isActive, sortOrder)
- `job_logs` table has `serviceRateId` (FK to service_rates, nullable), `amount` (decimal, default $200), and `materials` (jsonb)
- Admin manages rates from **Field Data → Service Rates & Fee Structure** section (CRUD with inline form)
- Field log form: technicians pick a service type from searchable dropdown which auto-fills the amount; amount is editable; supports custom entries
- **Materials Tracking**: Each job log can record materials used — either a product (name + volume in oz/gallons) or supplies (list of items with quantities). Materials are stored as jsonb on `job_logs.materials` and carried to `invoice_line_items.materials` when invoices are created, displayed on the public invoice view under each line item.
- **Field Invoice Creation** (`/field/invoice`): technicians select completed jobs grouped by customer, see running total with 6% PA tax, and create a draft invoice. Authorization enforced (only own jobs, completed status, same client)
- API: `GET/POST/PUT/DELETE /api/admin/service-rates`, `GET /api/field/service-rates`, `POST /api/field/create-invoice`
- 14 default service rates seeded (General Pest Control $200, Termite $500, Bed Bug $350, etc.)

### Invoice System (Redesigned)
- **Professional invoice layout** (`InvoiceView.tsx`): blue header with company branding, Bill To + Service Location side-by-side, service detail cards with date/tech/type/area, materials breakdown, job photos with lightbox, payment terms footer
- **Invoice line items enrichment**: `invoice_line_items` now stores `serviceDate`, `technicianName`, `serviceType`, `serviceAddress`, `servicedArea`, `jobLogId` — all populated automatically from job log data when invoices are created
- **Email fix**: `getAppBaseUrl()` now checks `REPLIT_DOMAINS` (production domain) before falling back to dev domain, fixing broken invoice links for customers
- **PDF attachment**: Server-side PDF generated via `jspdf` + `jspdf-autotable` (`server/invoice-pdf.ts`) and attached to invoice emails via SendGrid. Professional layout matching the web view
- **Reliable send flow**: Invoice status only transitions to 'sent' after email delivery is confirmed successful. Failed sends return error without changing status
- **Photos on invoice**: Job log photos are fetched and displayed on the public invoice view in a photo grid with lightbox

### Data Layer
- **ORM**: Drizzle ORM for type-safe operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migrations**: Drizzle Kit (`npm run db:push`)
- **Shared Schema**: TypeScript types for client/server consistency
- **Core Tables**: Users, Contact Submissions, Service Requests, Inspection Schedules, Payments, Clients, Projects, Milestones, Dashboards, Blog Posts, Field Employees, Job Logs, Job Log Custom Fields, Job Log Photos, Field Customers, Site Locations, Serviced Areas, Service Contracts, Customer Messages, Invoices, Invoice Line Items, Invoice Status Logs, Time Entries, Review Requests, Reminders, System Settings, Geocache, Daily Routes, Service Rates, Field Materials.

### Field Materials (Products & Supplies)
- `field_materials` table stores admin-managed product/chemical names and supply/equipment names
- Category: `"product"` (chemicals like Termidor SC, Alpine WSG) or `"supply"` (equipment like Glue Boards, Snap Traps)
- Admin manages from **Service Types & Materials** page (`/admin/service-types`) with tabs for Products and Supplies
- Supports bulk add (paste multiple items), individual CRUD, active/inactive toggle
- Field log form pulls lists from `/api/field/materials?category=product|supply` endpoint; falls back to hardcoded defaults if offline
- Auto-seeded with 68 products + 17 supplies on first startup (`seedFieldMaterials()` in routes.ts)

### UI/UX Design
- Modern, responsive, mobile-first design approach.
- Custom color scheme and CSS variables.
- Accessibility focus using Radix UI primitives.
- Company branding integrated into logo and PDF reports.

### GitHub Repository & Team Coordination
- **Repo**: `SteelCity-ai/AbsolutePestServices.com` (main branch)
- **Latest synced SHA**: `d7ee6f8` (March 22, 2026)
- **Team workflow**: Dev team pushes to GitHub → Replit pulls changes → validates → publishes
- **Important**: Always pull latest from GitHub before making changes. After local changes, push back to GitHub so all teams stay in sync.

### Recent Changes Log (March 2026)
1. **React hooks fix (AdminLayout)** — `useMutation` was called after conditional early returns, violating React's Rules of Hooks. Caused "Minified React error #310" crash on admin login. Fixed by moving all hooks above early return statements.
2. **PWA cache limit** — Increased `maximumFileSizeToCacheInBytes` to 5MB in `vite.config.ts` to prevent publish errors from large JS bundle (3.16MB).
3. **Admin auth guard** — `AdminLayout` checks `user.role === 'admin'` and redirects unauthenticated/non-admin users to `/auth`.
4. **Blog image storage** — AI-generated blog images stored as base64 data URIs in DB instead of filesystem paths (which are ephemeral on deploy).
5. **Session store** — Still using MemoryStore (sessions wiped on redeploy). Long-term fix needed: connect-pg-simple for persistent sessions.
6. **Google Ads tag** (AW-1038095551) and **GA4 tag** (G-0PXFRNKQW5) integrated.
7. **60 city×service SEO pages** (15 cities × 4 services) with server-side meta injection and expanded sitemap.
8. **Marketing Dashboard** with Facebook API integration (`FB_PAGE_ID=298835070139713`).
9. **Mobile hamburger menu** dropdown fixed (state toggled but no dropdown rendered).
10. **Homepage hero** updated: "Greater Philadelphia Area's Trusted Pest Experts." headline, "Call Now" button removed.
11. **GA4 live data** via Maton gateway (property `507471089`) — sessions, users, pageviews, top pages, traffic sources.
12. **Google Ads live data** via Maton gateway (customer `6800190976`, API `v23`) — 5 campaigns, 50 search terms, competitor detection.
13. **REPLIT-DEPLOYMENT-GUIDE.md** added to repo — documents all production issues and fixes for agent teams.

### Known Issues
- **JS bundle size**: 3.16MB — code splitting not yet implemented.
- **Phone number inconsistency**: wildlife-control and bat-removal pages use `610-869-3000`; most pages use `484-643-2225`.
- **Session persistence**: MemoryStore in production means sessions lost on redeploy.
- **Service worker caching**: After publish, users may need hard refresh (Ctrl+Shift+R) to get new bundle.

## Next.js Public Site Deployment (Active Workflow)

The primary web server now runs Next.js 16.2.1 from the `nextjs/` subdirectory. The Express/SPA codebase remains intact as a fallback.

### Workflow Command
`cd nextjs && bash start.sh`

`start.sh` handles:
1. `npm install --prefer-offline`
2. Disabling broken native SWC binaries (AMD EPYC 9B14 bus error with gnu/musl .node files)
3. Clearing `~/.cache/next-swc/`
4. Starting Next.js in webpack mode (`next dev --webpack`) + cron via tsx

### Key Environment Variables (Replit Secrets/Env)
- `DATABASE_URL` / `NEON_DATABASE_URL` — Neon PostgreSQL
- `SESSION_SECRET` — iron-session (32+ char secret)
- `NEXT_TELEMETRY_DISABLED=1` — telemetry suppressed
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-0PXFRNKQW5`
- `NEXT_PUBLIC_GOOGLE_ADS_ID=AW-1038095551`
- `CLOUDFLARE_TURNSTILE_SECRET_KEY` / `VITE_TURNSTILE_SITE_KEY`

### SWC Compatibility Issue
Next.js 16's native SWC binaries (`@next/swc-linux-x64-gnu` and `@next/swc-linux-x64-musl`) crash with SIGBUS on this Replit container (AMD EPYC 9B14). The `start.sh` script renames `.node` files to `.node.bak` on each startup to force webpack mode. The SWC download cache is also cleared to prevent re-downloaded binaries from being used.

### Next.js App Structure (`nextjs/`)
- `app/` — Next.js App Router pages (SSR, RSC)
- `src/components/` — Shared components (layout, forms, analytics)
- `src/lib/` — DB client (drizzle-orm + neon-http), session helpers
- `server/cron.ts` — Hourly cron (review dispatch, invoice overdue checks)
- `shared/schema.ts` — Drizzle schema (matches production DB)

### Admin Login
- URL: `/admin` → `/admin/dashboard`
- Credentials: rob@absolutepestservices.com / Sheffield2121

## External Dependencies

- **Database**: PostgreSQL, @neondatabase/serverless
- **ORM**: drizzle-orm, drizzle-kit
- **Frontend State/Forms**: @tanstack/react-query, react-hook-form, zod
- **UI Libraries**: @radix-ui/*, shadcn-ui, lucide-react, class-variance-authority, tailwind-merge, recharts
- **Styling**: Tailwind CSS
- **Email Service**: SendGrid (Twilio)
- **Bot Protection**: Cloudflare Turnstile
- **PDF Generation**: jspdf, jspdf-autotable
- **Photo Storage**: Cloudinary
- **RSS Parsing**: rss-parser
- **Authentication**: express-session, bcrypt
- **Scheduling**: node-cron
- **Utilities**: uuid, date-fns
- **Development/Build Tools**: Vite, TypeScript, ESBuild
