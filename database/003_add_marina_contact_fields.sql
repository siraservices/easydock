-- Add contact fields to marinas table
ALTER TABLE marinas ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE marinas ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE marinas ADD COLUMN IF NOT EXISTS website TEXT;
