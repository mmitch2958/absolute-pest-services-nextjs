-- Migration: 0001_link_users_clients
-- Purpose: Link users ↔ clients tables and add customer_messages for portal messaging
-- Date: 2026-03-09
-- Author: Akbar (System Architect)
-- Related: SC-PORT-001 (Customer Self-Service Portal), ADR-003

-- ─── 1. Add userId FK to clients ─────────────────────────────────────────────
-- Nullable: not all clients have portal accounts (cash/walk-in customers).
-- ON DELETE SET NULL: if a user is deleted, the client record stays but loses the link.
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Index for fast lookup: "find the client record for this logged-in user"
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- ─── 2. Add customer_messages table ──────────────────────────────────────────
-- Supports Module 5 of the Customer Portal (SC-PORT-001).
CREATE TABLE IF NOT EXISTS customer_messages (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  direction           TEXT    NOT NULL CHECK (direction IN ('customer_to_admin', 'admin_to_customer')),
  message             TEXT    NOT NULL,
  is_read             BOOLEAN NOT NULL DEFAULT FALSE,
  read_at             TIMESTAMP,
  sent_by_admin_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for fast thread retrieval per customer
CREATE INDEX IF NOT EXISTS idx_customer_messages_user_id     ON customer_messages(user_id);
-- Index for finding unread messages (admin dashboard badge count)
CREATE INDEX IF NOT EXISTS idx_customer_messages_is_read     ON customer_messages(is_read) WHERE is_read = FALSE;
