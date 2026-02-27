-- EasyDock v2 - Initial Schema Migration
-- Run this SQL in your Supabase SQL Editor
-- This drops the old schema and creates the new slip-based booking system

-- ============================================================
-- 1. Drop old triggers, tables, and functions
-- ============================================================

-- Drop trigger on auth.users first (not removed by table cascade)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop old tables (CASCADE removes their triggers and dependent objects)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS availability CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS marinas CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop old functions (after tables so trigger dependencies are gone)
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ============================================================
-- 2. Create new tables
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'boat_owner' CHECK (role IN ('boat_owner', 'marina_owner', 'admin')),
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marinas
CREATE TABLE marinas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    amenities TEXT[] DEFAULT '{}',
    photos TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Slips (individual dock slips)
CREATE TABLE slips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marina_id UUID NOT NULL REFERENCES marinas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    length_ft NUMERIC(6, 1) NOT NULL,
    width_ft NUMERIC(6, 1),
    depth_ft NUMERIC(6, 1),
    has_power BOOLEAN DEFAULT FALSE,
    has_water BOOLEAN DEFAULT FALSE,
    price_per_night NUMERIC(10, 2) NOT NULL,
    price_per_week NUMERIC(10, 2),
    price_per_month NUMERIC(10, 2),
    is_available BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slip_id UUID NOT NULL REFERENCES slips(id) ON DELETE CASCADE,
    marina_id UUID NOT NULL REFERENCES marinas(id) ON DELETE CASCADE,
    boat_owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    vessel_name TEXT,
    vessel_length NUMERIC(6, 1),
    vessel_type TEXT,
    total_price NUMERIC(10, 2) NOT NULL,
    stripe_payment_intent_id TEXT,
    stripe_charge_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'confirmed', 'completed', 'cancelled', 'declined')),
    special_requests TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. Indexes
-- ============================================================
CREATE INDEX idx_slips_marina_available ON slips(marina_id, is_available);
CREATE INDEX idx_bookings_boat_owner ON bookings(boat_owner_id);
CREATE INDEX idx_bookings_marina ON bookings(marina_id);
CREATE INDEX idx_marinas_city_active ON marinas(city, is_active);
CREATE INDEX idx_marinas_owner ON marinas(owner_id);

-- ============================================================
-- 5. Enable Row Level Security
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE marinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. RLS Policies
-- ============================================================

-- Profiles: users can read and update their own profile
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Marinas: authenticated users can read active marinas; owners can CRUD their own
CREATE POLICY "Authenticated users can read active marinas"
    ON marinas FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Owners can read own marinas"
    ON marinas FOR SELECT
    USING (owner_id = auth.uid());

CREATE POLICY "Owners can insert own marinas"
    ON marinas FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update own marinas"
    ON marinas FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete own marinas"
    ON marinas FOR DELETE
    USING (owner_id = auth.uid());

-- Slips: authenticated users can read slips of active marinas; owners can CRUD their marina's slips
CREATE POLICY "Authenticated users can read slips of active marinas"
    ON slips FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM marinas
            WHERE marinas.id = slips.marina_id
            AND marinas.is_active = TRUE
        )
    );

CREATE POLICY "Owners can insert slips for own marinas"
    ON slips FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM marinas
            WHERE marinas.id = slips.marina_id
            AND marinas.owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update slips for own marinas"
    ON slips FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM marinas
            WHERE marinas.id = slips.marina_id
            AND marinas.owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can delete slips for own marinas"
    ON slips FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM marinas
            WHERE marinas.id = slips.marina_id
            AND marinas.owner_id = auth.uid()
        )
    );

-- Bookings: boat owners read their own + insert; marina owners read bookings for their marinas
CREATE POLICY "Boat owners can read own bookings"
    ON bookings FOR SELECT
    USING (boat_owner_id = auth.uid());

CREATE POLICY "Marina owners can read bookings for their marinas"
    ON bookings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM marinas
            WHERE marinas.id = bookings.marina_id
            AND marinas.owner_id = auth.uid()
        )
    );

CREATE POLICY "Boat owners can insert bookings"
    ON bookings FOR INSERT
    WITH CHECK (boat_owner_id = auth.uid());

CREATE POLICY "Marina owners can update bookings for their marinas"
    ON bookings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM marinas
            WHERE marinas.id = bookings.marina_id
            AND marinas.owner_id = auth.uid()
        )
    );

-- ============================================================
-- 7. Functions & Triggers
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER marinas_updated_at BEFORE UPDATE ON marinas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER slips_updated_at BEFORE UPDATE ON slips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'boat_owner')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
