-- Add shore_power_type column to slips table
-- Replaces the boolean has_power with a specific power type
ALTER TABLE slips
  ADD COLUMN IF NOT EXISTS shore_power_type TEXT DEFAULT NULL;

-- Backfill: set existing has_power=true slips to 'single_30' as a sensible default
UPDATE slips SET shore_power_type = 'single_30' WHERE has_power = TRUE AND shore_power_type IS NULL;
