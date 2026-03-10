-- 007: Booking Hardening (Phase 1) — atomic booking, idempotent webhooks, platform fee column

-- 1. Add platform_fee_amount column to bookings table
-- Nullable — Phase 4 (Stripe Connect) will use this for transfer calculations
ALTER TABLE bookings ADD COLUMN platform_fee_amount NUMERIC DEFAULT NULL;

-- 2. Create stripe_processed_events table for idempotent webhook handling
CREATE TABLE stripe_processed_events (
  id TEXT PRIMARY KEY,            -- Stripe event ID (e.g., evt_xxx)
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  booking_id UUID REFERENCES bookings(id)
);

-- Enable RLS on stripe_processed_events
ALTER TABLE stripe_processed_events ENABLE ROW LEVEL SECURITY;

-- Service role has full access (admin client only)
CREATE POLICY "Service role full access on stripe_processed_events"
  ON stripe_processed_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Create atomic booking RPC function
-- Acquires row lock on slip, checks for date conflicts, and inserts booking in one transaction
-- SECURITY DEFINER ensures it runs with the permissions of the function owner (postgres)
CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_slip_id UUID,
  p_marina_id UUID,
  p_boat_owner_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_total_price NUMERIC,
  p_vessel_name TEXT,
  p_vessel_length NUMERIC,
  p_vessel_type TEXT,
  p_special_requests TEXT,
  p_platform_fee_amount NUMERIC DEFAULT NULL
)
RETURNS TABLE(booking_id UUID, conflict BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conflict_count INTEGER;
  v_booking_id UUID;
BEGIN
  -- Acquire row-level lock on the slip to prevent concurrent bookings
  PERFORM id FROM slips WHERE id = p_slip_id FOR UPDATE;

  -- Check for overlapping bookings
  -- Same-day turnover is allowed: check_in < p_check_out AND check_out > p_check_in
  -- (strict operators, not <= / >=)
  SELECT COUNT(*) INTO v_conflict_count
  FROM bookings
  WHERE slip_id = p_slip_id
    AND status IN ('pending', 'approved', 'confirmed')
    AND check_in < p_check_out
    AND check_out > p_check_in;

  -- Return conflict if any overlapping bookings found
  IF v_conflict_count > 0 THEN
    RETURN QUERY SELECT NULL::UUID, TRUE;
    RETURN;
  END IF;

  -- No conflict — insert the booking
  INSERT INTO bookings (
    slip_id,
    marina_id,
    boat_owner_id,
    check_in,
    check_out,
    total_price,
    vessel_name,
    vessel_length,
    vessel_type,
    special_requests,
    platform_fee_amount,
    status
  ) VALUES (
    p_slip_id,
    p_marina_id,
    p_boat_owner_id,
    p_check_in,
    p_check_out,
    p_total_price,
    p_vessel_name,
    p_vessel_length,
    p_vessel_type,
    p_special_requests,
    p_platform_fee_amount,
    'pending'
  )
  RETURNING id INTO v_booking_id;

  RETURN QUERY SELECT v_booking_id, FALSE;
END;
$$;
