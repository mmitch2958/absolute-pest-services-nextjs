# Pest Control Service Website

## Overview

This is a full-stack web application for a pest control service company, designed to showcase services, manage customer interactions, and streamline internal operations. It features a responsive design, a contact system, a customer portal with authentication, service request management, and a dedicated admin interface for managing services, users, and blog content. The platform also includes a mobile-friendly field service job logging system for employees, invoice lifecycle management, service contracts, and robust local SEO capabilities. The business vision is to provide a comprehensive digital solution for pest control companies, enhancing customer engagement and operational efficiency.

## Architecture Reference

See `ARCHITECTURE.md` in the project root for the full immutable architecture spec, binding rules for external agents, database tables, and API route patterns.

See `FIELD-SERVICE-GUIDE.md` for the complete developer handoff doc for the field service portal and job log system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: ShadCN UI (built on Radix UI)
- **Styling**: Tailwind CSS with custom themes
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form with Zod validation
- **Key Features**:
    - HeroSlider, ContactForm, Service Cards
    - Comprehensive local SEO (structured data, meta tags, business schema)
    - ServiceAreas and GoogleBusinessIntegration components
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
- Field log form: technicians pick a service type from dropdown which auto-fills the amount; amount is editable
- **Materials Tracking**: Each job log can record materials used — either a product (name + volume in oz/gallons) or supplies (list of items with quantities). Materials are stored as jsonb on `job_logs.materials` and carried to `invoice_line_items.materials` when invoices are created, displayed on the public invoice view under each line item.
- **Field Invoice Creation** (`/field/invoice`): technicians select completed jobs grouped by customer, see running total with 6% PA tax, and create a draft invoice. Authorization enforced (only own jobs, completed status, same client)
- API: `GET/POST/PUT/DELETE /api/admin/service-rates`, `GET /api/field/service-rates`, `POST /api/field/create-invoice`
- 8 default service rates seeded (General Pest Control $200, Termite $500, Bed Bug $350, etc.)

### Data Layer
- **ORM**: Drizzle ORM for type-safe operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migrations**: Drizzle Kit (`npm run db:push`)
- **Shared Schema**: TypeScript types for client/server consistency
- **Core Tables**: Users, Contact Submissions, Service Requests, Inspection Schedules, Payments, Clients, Projects, Milestones, Dashboards, Blog Posts, Field Employees, Job Logs, Job Log Custom Fields, Job Log Photos, Field Customers, Site Locations, Serviced Areas, Service Contracts, Customer Messages, Invoices, Invoice Line Items, Invoice Status Logs, Time Entries, Review Requests, Reminders, System Settings, Geocache, Daily Routes, Service Rates.

### UI/UX Design
- Modern, responsive, mobile-first design approach.
- Custom color scheme and CSS variables.
- Accessibility focus using Radix UI primitives.
- Company branding integrated into logo and PDF reports.

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
