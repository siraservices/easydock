-- EasyDock v1.2 - Marina Claim Flow Schema Migration
-- Run in Supabase SQL Editor after 001_initial_schema.sql

-- ============================================================
-- 1. Schema changes — support unclaimed (CSV-imported) marinas
-- ============================================================

-- Allow owner_id to be NULL for CSV-imported marinas without a registered owner
ALTER TABLE marinas ALTER COLUMN owner_id DROP NOT NULL;

-- Track marina origin and claim state
ALTER TABLE marinas ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';
ALTER TABLE marinas ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

-- Indexes for claim search
CREATE INDEX IF NOT EXISTS idx_marinas_unclaimed ON marinas(city, state) WHERE owner_id IS NULL;

-- ============================================================
-- 2. RLS additions — claim flow access
-- ============================================================

-- Allow any authenticated user to read unclaimed marinas (for /claim search)
CREATE POLICY "Authenticated users can search unclaimed marinas"
    ON marinas FOR SELECT
    USING (owner_id IS NULL AND auth.uid() IS NOT NULL);

-- Allow marina_owner role to claim an unclaimed marina (set owner_id to themselves)
CREATE POLICY "Marina owners can claim unclaimed marinas"
    ON marinas FOR UPDATE
    USING (
        owner_id IS NULL
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'marina_owner'
        )
    )
    WITH CHECK (owner_id = auth.uid());
