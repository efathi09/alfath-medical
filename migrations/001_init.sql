-- 001_init.sql  ·  Al Fath medical store · core schema
-- Matches the shape consumed by the frontend (src/data/*.js)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

/* ------------------------------------------------------------------ */
/* categories                                                          */
/* ------------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS categories (
  id            TEXT PRIMARY KEY,            -- slug, e.g. 'clinical'
  slug          TEXT UNIQUE NOT NULL,
  name_ar       TEXT NOT NULL,
  name_en       TEXT,
  desc_ar       TEXT,
  desc_en       TEXT,
  icon          TEXT,                        -- lucide icon token
  art           TEXT,                        -- illustration token
  tint          TEXT,                        -- tailwind gradient classes
  featured_ar   TEXT,
  featured_en   TEXT,
  groups        JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order    INT  NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

/* ------------------------------------------------------------------ */
/* products                                                            */
/* ------------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS products (
  id                    TEXT PRIMARY KEY,    -- e.g. 'p-101'
  sku                   TEXT UNIQUE,
  slug                  TEXT,
  name_ar               TEXT NOT NULL,
  name_en               TEXT,
  category_slug         TEXT REFERENCES categories(id) ON DELETE SET NULL,
  brand                 TEXT,
  price_egp             NUMERIC(12,2) NOT NULL DEFAULT 0,
  compare_at_price_egp  NUMERIC(12,2),       -- = oldPrice
  rating                NUMERIC(3,1) NOT NULL DEFAULT 0,
  reviews               INT NOT NULL DEFAULT 0,
  art                   TEXT,
  palette               TEXT,
  unit_ar               TEXT,
  unit_en               TEXT,
  min_order             INT NOT NULL DEFAULT 1,
  stock                 INT NOT NULL DEFAULT 0,
  badges                JSONB NOT NULL DEFAULT '[]'::jsonb,  -- ['bestSeller','offer','new']
  keywords              JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active             BOOLEAN NOT NULL DEFAULT true,
  sort_order            INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_price    ON products(price_egp);

/* ------------------------------------------------------------------ */
/* quotes  (طلب عرض السعر)                                             */
/* ------------------------------------------------------------------ */
CREATE TABLE IF NOT EXISTS quotes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  company     TEXT,
  items       JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes       TEXT,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','contacted','quoted','won','lost')),
  source      TEXT NOT NULL DEFAULT 'website',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotes_created ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_status  ON quotes(status);

/* ------------------------------------------------------------------ */
/* updated_at trigger                                                  */
/* ------------------------------------------------------------------ */
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_categories_touch ON categories;
CREATE TRIGGER trg_categories_touch BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_products_touch ON products;
CREATE TRIGGER trg_products_touch BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_quotes_touch ON quotes;
CREATE TRIGGER trg_quotes_touch BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();