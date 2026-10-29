-- Phase 4: WhatsApp Cloud API config + inbound message log.
-- Safe to run multiple times (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS whatsapp_config (
  id          text PRIMARY KEY,
  value       jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id             text PRIMARY KEY DEFAULT ('msg-' || replace(gen_random_uuid()::text, '-', '')),
  wa_from        text,
  name           text,
  text           text,
  type           text NOT NULL DEFAULT 'text',
  direction      text NOT NULL DEFAULT 'in',
  wa_message_id  text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages (created_at DESC);
