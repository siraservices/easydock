-- Region-based waitlist signups for demand capture
CREATE TABLE IF NOT EXISTS waitlist_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  region TEXT NOT NULL,
  boat_length TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'region_card',
  UNIQUE(email, region)
);

-- Enable Row Level Security
ALTER TABLE waitlist_signups ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for unauthenticated visitors)
CREATE POLICY "Allow anonymous inserts" ON waitlist_signups
  FOR INSERT TO anon WITH CHECK (true);

-- Allow counting rows publicly (for the live counter)
CREATE POLICY "Allow public read for counts" ON waitlist_signups
  FOR SELECT TO anon USING (true);

-- Index for fast region counts
CREATE INDEX idx_waitlist_region ON waitlist_signups(region);
