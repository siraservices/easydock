-- Boat owner leads table for the expanded intake form on the homepage
-- Run this in Supabase SQL Editor after previous migrations

CREATE TABLE IF NOT EXISTS boat_owner_leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  boat_length     TEXT NOT NULL,
  boat_beam       TEXT,
  preferred_area  TEXT NOT NULL,
  timeline        TEXT,
  status          TEXT NOT NULL DEFAULT 'new',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (admin client bypasses RLS via service role key; no policies needed)
ALTER TABLE boat_owner_leads ENABLE ROW LEVEL SECURITY;

-- Index for quick lookup by email
CREATE INDEX IF NOT EXISTS boat_owner_leads_email_idx ON boat_owner_leads (email);
