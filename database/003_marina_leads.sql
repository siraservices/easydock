-- Marina leads table for capturing early interest from the marketing landing page
-- Run this in Supabase SQL Editor after 002_seed.sql

CREATE TABLE IF NOT EXISTS marina_leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  user_type   TEXT NOT NULL CHECK (user_type IN ('yacht_owner', 'marina_owner')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (admin client bypasses RLS via service role key; no policies needed)
ALTER TABLE marina_leads ENABLE ROW LEVEL SECURITY;

-- Index for quick lookup by email (de-duplication queries)
CREATE INDEX IF NOT EXISTS marina_leads_email_idx ON marina_leads (email);
