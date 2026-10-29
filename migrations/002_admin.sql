-- Phase 3b: store settings, brands, promos (offers), admin users
-- Safe to run multiple times (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS settings (
  id          text PRIMARY KEY,
  value       jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS brands (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promos (
  id           text PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  deal_price   numeric(12,2) NOT NULL,
  stock_total  integer NOT NULL DEFAULT 0,
  sold         integer NOT NULL DEFAULT 0,
  is_active    boolean NOT NULL DEFAULT true,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id             text PRIMARY KEY,
  username       text NOT NULL UNIQUE,
  password_hash  text NOT NULL,
  role           text NOT NULL DEFAULT 'admin',
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);
