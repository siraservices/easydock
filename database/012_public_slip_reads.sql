-- Allow unauthenticated (anon) users to read active marinas and their slips.
-- Slip detail pages must be publicly accessible for SEO and marketplace conversion.

-- Drop the existing auth-only read policies
DROP POLICY IF EXISTS "Authenticated users can read active marinas" ON marinas;
DROP POLICY IF EXISTS "Authenticated users can read slips of active marinas" ON slips;

-- Replace with public (anon + authenticated) read policies
CREATE POLICY "Anyone can read active marinas"
    ON marinas FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Anyone can read slips of active marinas"
    ON slips FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM marinas
            WHERE marinas.id = slips.marina_id
              AND marinas.is_active = TRUE
        )
    );
