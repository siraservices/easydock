-- Add intake form fields to marina_leads for the boat owner lead capture form
-- Run this in Supabase SQL Editor after prior migrations

ALTER TABLE marina_leads
  ADD COLUMN IF NOT EXISTS phone          TEXT,
  ADD COLUMN IF NOT EXISTS boat_length    TEXT,
  ADD COLUMN IF NOT EXISTS preferred_area TEXT;
