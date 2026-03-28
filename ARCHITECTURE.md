# ARCHITECTURE.md — Absolute Pest Services

> **Constraint: External agents must read this file before modifying code.**

---

## Immutable Rules

| Rule | Value |
|------|-------|
| **Language** | TypeScript (strict, shared across frontend and backend) |
| **Database** | PostgreSQL (Neon serverless driver: `@neondatabase/serverless`) |
| **ORM** | Drizzle ORM (`drizzle-orm` + `drizzle-kit`) |
| **Package Manager** | npm |

These four choices are locked. Do not introduce alternative languages, databases, ORMs, or package managers.

---

## Project Structure

```
/
├── client/                    # Frontend (React + Vite)
│   └── src/
│       ├── App.tsx            # Route definitions (wouter)
│       ├── main.tsx           # Entry point
│       ├── index.css          # Global styles + Tailwind + CSS variables
│       ├── components/
│       │   ├── ui/            # ShadCN primitives (do not hand-edit)
│       │   ├── admin/         # Admin layout and admin-specific components
│       │   ├── field-nav.tsx  # Mobile bottom nav for field portal
│       │   ├── Header.tsx     # Public site header
│       │   ├── contact-form.tsx
│       │   ├── hero-slider.tsx
│       │   ├── seasonal-alerts.tsx
│       │   └── ...
│       ├── pages/
│       │   ├── home.tsx                  # Public landing page
│       │   ├── field-login.tsx           # PIN login for field employees
│       │   ├── field-log.tsx             # Job log submission form
│       │   ├── field-history.tsx         # Employee job history
│       │   ├── field-employees.tsx       # Employee management (field portal)
│       │   ├── field-reports.tsx         # Field-side report view
│       │   ├── pitch-deck.tsx            # /jlpd pitch deck
│       │   ├── admin/
│       │   │   ├── admin-login.tsx       # Admin login
│       │   │   ├── AdminDashboards.tsx   # Admin home
│       │   │   ├── admin-reports.tsx     # PDF report generation
│       │   │   ├── admin-field-data.tsx  # Custom fields, site locations, serviced areas, field customers
│       │   │   ├── AdminBlog.tsx         # Blog + RSS + newsletter
│       │   │   ├── AdminClients.tsx      # Client management
│       │   │   ├── AdminService.tsx      # Service requests + inspections
│       │   │   └── ...
│       │   └── ...
│       ├── hooks/
│       │   └── use-toast.ts
│       └── lib/
│           ├── queryClient.ts            # TanStack Query config + apiRequest helper
│           └── pdf-report.ts             # jspdf PDF generation logic
├── server/
│   ├── index.ts              # Server entry point
│   ├── routes.ts             # All Express API routes
│   ├── storage.ts            # IStorage interface + DatabaseStorage implementation
│   ├── db.ts                 # Drizzle + Neon connection pool
│   ├── email.ts              # SendGrid email helpers
│   ├── turnstile.ts          # Cloudflare Turnstile verification
│   └── vite.ts               # Vite dev server middleware (DO NOT MODIFY)
├── shared/
│   └── schema.ts             # Drizzle table definitions, Zod insert schemas, TypeScript types
├── drizzle.config.ts         # Drizzle Kit config (DO NOT MODIFY)
├── vite.config.ts            # Vite config (DO NOT MODIFY)
├── tailwind.config.ts        # Tailwind config
├── tsconfig.json
├── package.json
└── ARCHITECTURE.md           # This file
```

---

## Tech Stack (Full Detail)

### Frontend
| Concern | Library | Notes |
|---------|---------|-------|
| Framework | React 18 | No Next.js, no Remix |
| Build tool | Vite | Config is locked — do not add proxies or modify `vite.config.ts` |
| Routing | wouter | Not react-router |
| State / data fetching | TanStack Query v5 | Object-form API only: `useQuery({ queryKey })` |
| Forms | React Hook Form + Zod | Use `zodResolver` with insert schemas from `shared/schema.ts` |
| UI components | ShadCN UI (Radix primitives) | Import via `@/components/ui/*` |
| Icons | lucide-react | Brand logos via `react-icons/si` |
| Styling | Tailwind CSS | Custom theme in `index.css` via CSS variables |
| PDF generation | jspdf + jspdf-autotable | Client-side only |

### Backend
| Concern | Library | Notes |
|---------|---------|-------|
| Framework | Express.js | Single file routes in `server/routes.ts` |
| Auth (admin/customer) | express-session + bcrypt | In-memory session store (default MemoryStore) |
| Auth (field employees) | PIN-based (session) | `requireFieldAuth` middleware checks `session.fieldEmployeeId` |
| Validation | Zod | Schemas generated from Drizzle via `drizzle-zod` |
| Email | SendGrid (`@sendgrid/mail`) | Via `server/email.ts` |
| Bot protection | Cloudflare Turnstile | Via `server/turnstile.ts` |

### Data Layer
| Concern | Detail |
|---------|--------|
| Database | PostgreSQL (Neon serverless) |
| ORM | Drizzle ORM |
| Schema location | `shared/schema.ts` (single source of truth) |
| Migrations | `npm run db:push` via Drizzle Kit — never write raw SQL migrations |
| Connection | `server/db.ts` using `@neondatabase/serverless` Pool |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Admin and customer portal accounts (email + hashed password) |
| `contact_submissions` | Public contact form entries |
| `inspection_schedules` | Scheduled inspections |
| `service_requests` | Customer service requests (linked to user + optional client) |
| `payments` | Payment records linked to users |
| `clients` | Business clients managed by admin |
| `projects` | Projects linked to clients |
| `milestones` | Project milestones |
| `dashboards` | Dashboard configurations per project |
| `blog_posts` | Blog content + RSS syndication |
| `field_employees` | Field technicians (PIN auth, `canManageEmployees` flag) |
| `job_logs` | Job log entries with `customFields` JSONB column |
| `job_log_custom_fields` | Admin-defined custom field definitions (type, options, required, active) |
| `field_customers` | Field-specific customer list (separate from portal `clients`) |
| `site_locations` | Reusable site location entries |
| `serviced_areas` | Reusable serviced area entries |

---

## Binding Rules for External Agents

### Do NOT
- Add new languages, runtimes, or transpilers (no Python, no Go, no Bun)
- Replace npm with yarn, pnpm, or any other package manager
- Swap PostgreSQL for SQLite, MongoDB, or any other database
- Replace Drizzle ORM with Prisma, TypeORM, Sequelize, or Knex
- Replace wouter with react-router or any other router
- Replace TanStack Query with SWR, Apollo, or Redux
- Replace ShadCN/Radix with MUI, Chakra, Ant Design, or Bootstrap
- Modify `vite.config.ts`, `drizzle.config.ts`, or `server/vite.ts`
- Write raw SQL migration files — use `npm run db:push` only
- Create separate frontend and backend servers — they run on one port via Vite middleware
- Add Docker, containerization, or virtual environments

### Do
- Define all table schemas in `shared/schema.ts`
- Use `createInsertSchema` from `drizzle-zod` for every table
- Update `IStorage` interface and `DatabaseStorage` class in `server/storage.ts` for any new data operations
- Keep API routes thin — business logic belongs in storage methods
- Use `apiRequest` from `@/lib/queryClient` for mutations
- Invalidate TanStack Query cache by `queryKey` after every mutation
- Use Cloudflare Turnstile on all public-facing forms
- Validate request bodies with Zod on the server before passing to storage
- Read this file before making any changes

### Schema Change Workflow
1. Edit `shared/schema.ts` — add/modify table, insert schema, and types
2. Run `npm run db:push` (use `--force` if data-loss warning appears)
3. Update `IStorage` interface in `server/storage.ts`
4. Implement methods in `DatabaseStorage` class
5. Add routes in `server/routes.ts`
6. Build frontend against new types

---

## Environment Variables

| Variable | Purpose | Scope |
|----------|---------|-------|
| `DATABASE_URL` | PostgreSQL connection string | Server |
| `SENDGRID_API_KEY` | SendGrid email API key | Server |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | Turnstile server-side secret | Server |
| `VITE_TURNSTILE_SITE_KEY` | Turnstile client-side site key | Client (prefixed `VITE_`) |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics measurement ID | Client (prefixed `VITE_`) |

Client-side env vars must be prefixed with `VITE_` and accessed via `import.meta.env.VITE_*`.

---

## API Route Patterns

| Prefix | Auth | Purpose |
|--------|------|---------|
| `/api/contact`, `/api/inspection` | None + Turnstile | Public contact form, inspection scheduling |
| `/api/blog/posts` | None | Public blog read access |
| `/api/auth/*` | Session | Customer register/login/logout/me |
| `/api/service-requests` | Session (`requireAuth`) | Customer service request submission and history |
| `/api/inspections/my`, `/api/payments/my` | Session (`requireAuth`) | Customer inspection and payment history |
| `/api/admin/*` | Session (`requireAdmin`) | Admin CRUD: clients, projects, milestones, dashboards, blog, service requests, field data, reports |
| `/api/clients/*`, `/api/projects/*`, `/api/milestones/*`, `/api/dashboards/*` | Session (`requireAdmin`) | Admin entity management |
| `/api/field/auth` | None | Field employee PIN login |
| `/api/field/*` | Session (`requireFieldAuth`) | Field job logs, client list, suggestions, custom fields |
| `/api/field/employees` | Session (`requireFieldManager`) | Field employee management (requires `canManageEmployees`) |

---

## Key Conventions

- **TypeScript everywhere** — no `.js` files, no `any` types unless unavoidable
- **Single schema file** — `shared/schema.ts` is the single source of truth for all types
- **Storage abstraction** — all database access goes through `IStorage` interface, never raw queries in routes
- **Mobile-first field portal** — `/field/*` routes are designed for phone screens with large touch targets
- **Admin portal** — `/admin/*` routes use `AdminLayout` wrapper with sidebar navigation
- **PDF reports** — generated client-side via `jspdf` in `client/src/lib/pdf-report.ts`
