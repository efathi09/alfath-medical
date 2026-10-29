-- Newsletter subscribers captured by the storefront footer form.
-- Addresses are stored plainly: they are marketing opt-ins, not credentials.

CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT DEFAULT 'site',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_key ON subscribers (lower(email));
CREATE INDEX IF NOT EXISTS subscribers_created_at_idx ON subscribers (created_at DESC);
