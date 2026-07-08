-- Migration 013: Add vessel profile columns to profiles
-- Boat owners can save their vessel info to pre-fill the booking widget.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS vessel_name TEXT,
  ADD COLUMN IF NOT EXISTS vessel_length_ft NUMERIC,
  ADD COLUMN IF NOT EXISTS vessel_type TEXT;

-- No new RLS policy needed -- existing UPDATE policy covers new columns.
