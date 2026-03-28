-- Migration: SC-INV-001 Invoice Lifecycle Management
-- Created: 2026-03-09

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "invoices" (
  "id" serial PRIMARY KEY,
  "invoice_number" varchar(20) NOT NULL UNIQUE,
  "client_id" integer NOT NULL REFERENCES "clients"("id"),
  "job_log_id" integer REFERENCES "job_logs"("id"),
  "status" text NOT NULL DEFAULT 'draft',
  "issue_date" timestamp NOT NULL DEFAULT NOW(),
  "due_date" timestamp NOT NULL,
  "subtotal" decimal(10,2) NOT NULL,
  "tax_total" decimal(10,2) NOT NULL DEFAULT '0',
  "total" decimal(10,2) NOT NULL,
  "notes" text,
  "pdf_url" text,
  "view_token" varchar(36) UNIQUE,
  "sent_at" timestamp,
  "viewed_at" timestamp,
  "paid_at" timestamp,
  "payment_method" text,
  "payment_amount" decimal(10,2),
  "payment_note" text,
  "void_reason" text,
  "created_by" integer REFERENCES "users"("id"),
  "created_at" timestamp NOT NULL DEFAULT NOW(),
  "updated_at" timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "invoices_client_id_idx" ON "invoices"("client_id");
CREATE INDEX IF NOT EXISTS "invoices_status_idx" ON "invoices"("status");
CREATE INDEX IF NOT EXISTS "invoices_due_date_idx" ON "invoices"("due_date");

-- ============================================
-- INVOICE LINE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "invoice_line_items" (
  "id" serial PRIMARY KEY,
  "invoice_id" integer NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
  "description" text NOT NULL,
  "quantity" decimal(10,3) NOT NULL DEFAULT '1',
  "unit_rate" decimal(10,2) NOT NULL,
  "tax_rate" decimal(5,2) NOT NULL DEFAULT '0',
  "line_total" decimal(10,2) NOT NULL,
  "line_tax" decimal(10,2) NOT NULL DEFAULT '0',
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "invoice_line_items_invoice_id_idx" ON "invoice_line_items"("invoice_id");

-- ============================================
-- INVOICE STATUS LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "invoice_status_logs" (
  "id" serial PRIMARY KEY,
  "invoice_id" integer NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
  "from_status" text,
  "to_status" text NOT NULL,
  "actor" text NOT NULL,
  "note" text,
  "created_at" timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "invoice_status_logs_invoice_id_idx" ON "invoice_status_logs"("invoice_id");
CREATE INDEX IF NOT EXISTS "invoice_status_logs_created_at_idx" ON "invoice_status_logs"("created_at");