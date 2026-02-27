-- Allow marina owners to read their own slips regardless of marina is_active status
CREATE POLICY "Owners can read slips for own marinas"
    ON slips FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM marinas
            WHERE marinas.id = slips.marina_id
            AND marinas.owner_id = auth.uid()
        )
    );
