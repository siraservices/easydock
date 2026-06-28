-- EasyDock v1.2 - Marina Lead Capture
-- Run in Supabase SQL Editor after 004_import_csv_marinas.sql

-- ============================================================
-- 1. marina_spot_requests table — captures boat owner interest in unclaimed marinas
-- ============================================================
CREATE TABLE IF NOT EXISTS marina_spot_requests (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marina_id   UUID NOT NULL REFERENCES marinas(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    check_in    DATE,
    check_out   DATE,
    vessel_length_ft INTEGER,
    message     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for admin queries: leads per marina
CREATE INDEX IF NOT EXISTS idx_marina_spot_requests_marina_id ON marina_spot_requests(marina_id);
-- Index for dedup / analytics: leads per email
CREATE INDEX IF NOT EXISTS idx_marina_spot_requests_email ON marina_spot_requests(email);

-- ============================================================
-- 2. RLS — leads are write-only for end users (no read-back)
-- ============================================================
ALTER TABLE marina_spot_requests ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own leads (no read allowed via RLS)
CREATE POLICY "Authenticated users can submit marina leads"
    ON marina_spot_requests FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Only service role (admin) can read leads
CREATE POLICY "Service role can read leads"
    ON marina_spot_requests FOR SELECT
    USING (auth.role() = 'service_role');
