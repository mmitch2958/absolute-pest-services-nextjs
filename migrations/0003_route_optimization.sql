-- Migration: 0003_route_optimization
-- Purpose: Add tables for route optimization feature
-- Date: 2026-03-09
-- Author: Luke (Build Agent)
-- Related: SC-ROUTE-001 (Route Optimization), ADR SC-ROUTE-001

-- ─── 1. Geocache table ─────────────────────────────────────────────────────
-- Cache geocoded addresses to avoid re-geocoding the same address
CREATE TABLE IF NOT EXISTS geocache (
  id                  SERIAL PRIMARY KEY,
  address_text        TEXT NOT NULL UNIQUE,
  lat                 DECIMAL(10, 7),
  lng                 DECIMAL(10, 7),
  geocoded_at         TIMESTAMP NOT NULL DEFAULT NOW(),
  source              TEXT NOT NULL DEFAULT 'google' CHECK (source IN ('google', 'manual'))
);

-- Index for fast address lookup
CREATE INDEX IF NOT EXISTS idx_geocache_address_text ON geocache(address_text);

-- ─── 2. Daily routes table ──────────────────────────────────────────────────
-- Store optimized routes per tech per day
CREATE TABLE IF NOT EXISTS daily_routes (
  id                      SERIAL PRIMARY KEY,
  employee_id             INTEGER NOT NULL REFERENCES field_employees(id),
  route_date              DATE NOT NULL,
  start_address           TEXT,
  optimized_stop_order    JSONB NOT NULL,
  -- [{jobLogId, sequence, estimatedArrival, driveDurationSeconds, lat, lng, customerName, address}]
  google_maps_url         TEXT,
  total_distance_meters   INTEGER,
  total_duration_seconds  INTEGER,
  generated_at            TIMESTAMP NOT NULL DEFAULT NOW(),
  generated_by            INTEGER REFERENCES users(id),
  
  -- Unique constraint: one route per employee per day
  UNIQUE(employee_id, route_date)
);

-- Index for fast lookup by employee and date
CREATE INDEX IF NOT EXISTS idx_daily_routes_employee_date ON daily_routes(employee_id, route_date);