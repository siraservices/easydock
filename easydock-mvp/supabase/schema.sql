-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('marina_owner', 'yacht_owner', 'admin')),
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marinas table
CREATE TABLE IF NOT EXISTS marinas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'USA',
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  amenities TEXT[],
  photos TEXT[],
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slips table
CREATE TABLE IF NOT EXISTS slips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  marina_id UUID NOT NULL REFERENCES marinas(id) ON DELETE CASCADE,
  slip_number TEXT NOT NULL,
  length DECIMAL(10, 2) NOT NULL,
  width DECIMAL(10, 2) NOT NULL,
  draft DECIMAL(10, 2),
  power_available BOOLEAN DEFAULT false,
  power_voltage INTEGER,
  water_available BOOLEAN DEFAULT false,
  daily_rate DECIMAL(10, 2) NOT NULL,
  weekly_rate DECIMAL(10, 2),
  monthly_rate DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(marina_id, slip_number)
);

-- Availability table
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slip_id UUID NOT NULL REFERENCES slips(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(slip_id, date)
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slip_id UUID NOT NULL REFERENCES slips(id) ON DELETE CASCADE,
  yacht_owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  marina_id UUID NOT NULL REFERENCES marinas(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  vessel_name TEXT,
  vessel_length DECIMAL(10, 2),
  vessel_width DECIMAL(10, 2),
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (end_date >= start_date)
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  user_type TEXT CHECK (user_type IN ('yacht_owner', 'marina_owner')),
  message TEXT,
  launch_notify BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_marinas_owner_id ON marinas(owner_id);
CREATE INDEX IF NOT EXISTS idx_marinas_location ON marinas(city, state);
CREATE INDEX IF NOT EXISTS idx_slips_marina_id ON slips(marina_id);
CREATE INDEX IF NOT EXISTS idx_slips_active ON slips(is_active);
CREATE INDEX IF NOT EXISTS idx_availability_slip_date ON availability(slip_id, date);
CREATE INDEX IF NOT EXISTS idx_availability_date ON availability(date);
CREATE INDEX IF NOT EXISTS idx_bookings_slip_id ON bookings(slip_id);
CREATE INDEX IF NOT EXISTS idx_bookings_yacht_owner_id ON bookings(yacht_owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_marina_id ON bookings(marina_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE marinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Marinas policies
CREATE POLICY "Anyone can view active marinas"
  ON marinas FOR SELECT
  USING (true);

CREATE POLICY "Marina owners can manage their marinas"
  ON marinas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = marinas.owner_id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'marina_owner'
    )
  );

-- Slips policies
CREATE POLICY "Anyone can view active slips"
  ON slips FOR SELECT
  USING (is_active = true);

CREATE POLICY "Marina owners can manage slips for their marinas"
  ON slips FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM marinas
      JOIN profiles ON profiles.id = marinas.owner_id
      WHERE marinas.id = slips.marina_id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'marina_owner'
    )
  );

-- Availability policies
CREATE POLICY "Anyone can view availability"
  ON availability FOR SELECT
  USING (true);

CREATE POLICY "Marina owners can manage availability for their slips"
  ON availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM slips
      JOIN marinas ON marinas.id = slips.marina_id
      JOIN profiles ON profiles.id = marinas.owner_id
      WHERE slips.id = availability.slip_id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'marina_owner'
    )
  );

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = bookings.yacht_owner_id
      AND profiles.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM marinas
      JOIN profiles ON profiles.id = marinas.owner_id
      WHERE marinas.id = bookings.marina_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Yacht owners can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = bookings.yacht_owner_id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'yacht_owner'
    )
  );

CREATE POLICY "Marina owners can update bookings for their marinas"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM marinas
      JOIN profiles ON profiles.id = marinas.owner_id
      WHERE marinas.id = bookings.marina_id
      AND profiles.user_id = auth.uid()
      AND profiles.role = 'marina_owner'
    )
  );

-- Leads policies (public insert, admin view)
CREATE POLICY "Anyone can create leads"
  ON leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all leads"
  ON leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marinas_updated_at BEFORE UPDATE ON marinas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slips_updated_at BEFORE UPDATE ON slips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
