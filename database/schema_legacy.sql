-- EasyDock Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('boat_owner', 'marina_owner', 'admin')),
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stripe_account_id TEXT, -- For marina owners using Stripe Connect
    is_verified BOOLEAN DEFAULT FALSE
);

-- Marinas Table
CREATE TABLE IF NOT EXISTS marinas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT,
    country TEXT DEFAULT 'USA',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone TEXT,
    email TEXT,
    website TEXT,
    base_price_per_day DECIMAL(10, 2) NOT NULL,
    base_price_per_week DECIMAL(10, 2),
    base_price_per_month DECIMAL(10, 2),
    max_boat_length INTEGER, -- in feet
    max_boat_width INTEGER, -- in feet
    amenities JSONB DEFAULT '[]'::jsonb, -- Array of amenities like ["wifi", "electricity", "water", "fuel", "restaurant"]
    photos TEXT[], -- Array of photo URLs
    is_active BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT FALSE, -- Admin approval required
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Availability Calendar Table
CREATE TABLE IF NOT EXISTS availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    marina_id UUID NOT NULL REFERENCES marinas(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    price_override DECIMAL(10, 2), -- Optional price override for specific dates
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(marina_id, date)
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    marina_id UUID NOT NULL REFERENCES marinas(id) ON DELETE CASCADE,
    boat_owner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    boat_length INTEGER,
    boat_width INTEGER,
    total_price DECIMAL(10, 2) NOT NULL,
    commission_amount DECIMAL(10, 2) NOT NULL, -- Platform commission
    marina_payout DECIMAL(10, 2) NOT NULL, -- Amount to pay marina owner
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'confirmed', 'completed', 'cancelled', 'declined')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    stripe_payment_intent_id TEXT,
    stripe_charge_id TEXT,
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages Table (for communication between users)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    subject TEXT,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews Table (for post-booking reviews)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    marina_id UUID NOT NULL REFERENCES marinas(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(booking_id, reviewer_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_marinas_owner_id ON marinas(owner_id);
CREATE INDEX IF NOT EXISTS idx_marinas_location ON marinas(state, city);
CREATE INDEX IF NOT EXISTS idx_marinas_active ON marinas(is_active, is_approved);
CREATE INDEX IF NOT EXISTS idx_availability_marina_date ON availability(marina_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_marina_id ON bookings(marina_id);
CREATE INDEX IF NOT EXISTS idx_bookings_boat_owner_id ON bookings(boat_owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_messages_booking_id ON messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_reviews_marina_id ON reviews(marina_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE marinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON user_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Marinas Policies
CREATE POLICY "Anyone can view active and approved marinas"
    ON marinas FOR SELECT
    USING (is_active = TRUE AND is_approved = TRUE);

CREATE POLICY "Marina owners can view their own marinas"
    ON marinas FOR SELECT
    USING (owner_id = auth.uid());

CREATE POLICY "Marina owners can insert their own marinas"
    ON marinas FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Marina owners can update their own marinas"
    ON marinas FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Admins can view all marinas"
    ON marinas FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update any marina"
    ON marinas FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Availability Policies
CREATE POLICY "Anyone can view availability for active marinas"
    ON availability FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM marinas
            WHERE marinas.id = availability.marina_id
            AND marinas.is_active = TRUE
            AND marinas.is_approved = TRUE
        )
    );

CREATE POLICY "Marina owners can manage their marina availability"
    ON availability FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM marinas
            WHERE marinas.id = availability.marina_id
            AND marinas.owner_id = auth.uid()
        )
    );

-- Bookings Policies
CREATE POLICY "Users can view their own bookings"
    ON bookings FOR SELECT
    USING (
        boat_owner_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM marinas
            WHERE marinas.id = bookings.marina_id
            AND marinas.owner_id = auth.uid()
        )
    );

CREATE POLICY "Boat owners can create bookings"
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

CREATE POLICY "Admins can view all bookings"
    ON bookings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Boat owners can cancel their own bookings"
    ON bookings FOR UPDATE
    USING (boat_owner_id = auth.uid())
    WITH CHECK (boat_owner_id = auth.uid());

-- Messages Policies
CREATE POLICY "Users can view messages they sent or received"
    ON messages FOR SELECT
    USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update messages they received"
    ON messages FOR UPDATE
    USING (receiver_id = auth.uid());

-- Reviews Policies
CREATE POLICY "Anyone can view reviews for approved marinas"
    ON reviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM marinas
            WHERE marinas.id = reviews.marina_id
            AND marinas.is_active = TRUE
            AND marinas.is_approved = TRUE
        )
    );

CREATE POLICY "Users can create reviews for their completed bookings"
    ON reviews FOR INSERT
    WITH CHECK (
        reviewer_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM bookings
            WHERE bookings.id = reviews.booking_id
            AND bookings.boat_owner_id = auth.uid()
            AND bookings.status = 'completed'
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to update updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marinas_updated_at BEFORE UPDATE ON marinas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, user_type, role)
    VALUES (
        NEW.id,
        NEW.email,
        'boat_owner', -- Default user type
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

