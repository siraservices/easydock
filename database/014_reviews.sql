-- Migration 014: Reviews table
-- Boat owners can leave a rating + comment after a completed booking.

CREATE TABLE reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  marina_id uuid REFERENCES marinas(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- One review per booking
ALTER TABLE reviews ADD CONSTRAINT one_review_per_booking UNIQUE (booking_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "public_read_reviews" ON reviews FOR SELECT USING (true);

-- Authenticated boat owners can insert their own review
CREATE POLICY "boat_owners_can_review" ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (reviewer_id = auth.uid());
