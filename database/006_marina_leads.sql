-- Marina Prospects - CRM table for tracking prospective marina partners
-- Renamed from marina_leads to avoid conflict with the website lead capture table (003)

CREATE TABLE marina_prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT,
    region TEXT,
    phone TEXT,
    website TEXT,
    email TEXT,
    google_place_id TEXT,
    google_rating NUMERIC(2, 1),
    google_review_count INTEGER,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    hours TEXT,
    contact_name TEXT,
    amenities TEXT[] DEFAULT '{}',
    notes TEXT,
    outreach_status TEXT NOT NULL DEFAULT 'not_contacted'
        CHECK (outreach_status IN ('not_contacted', 'contacted', 'responded', 'meeting_scheduled', 'partner', 'declined', 'not_interested')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_marina_prospects_region ON marina_prospects(region);
CREATE INDEX idx_marina_prospects_outreach_status ON marina_prospects(outreach_status);
CREATE INDEX idx_marina_prospects_city_state ON marina_prospects(city, state);

-- Auto-update updated_at
CREATE TRIGGER marina_prospects_updated_at BEFORE UPDATE ON marina_prospects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
