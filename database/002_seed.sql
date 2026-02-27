-- EasyDock v2 - Seed Data
-- Run this after 001_initial_schema.sql
-- Note: Marina owner must be created via Supabase Auth first.
-- Replace the owner_id below with the actual user UUID after signup.

-- ============================================================
-- Test Marina in Fort Lauderdale
-- ============================================================
-- IMPORTANT: Replace '00000000-0000-0000-0000-000000000001' with
-- the actual UUID of a marina_owner user created through signup.

INSERT INTO marinas (id, owner_id, name, description, address, city, state, zip, lat, lng, amenities, photos, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001', -- Replace with real owner UUID
    'Sunrise Harbor Marina',
    'Premier marina in the heart of Fort Lauderdale with easy ocean access. Full-service facility featuring modern amenities, fuel dock, and on-site restaurant.',
    '500 Seabreeze Blvd',
    'Fort Lauderdale',
    'FL',
    '33316',
    26.1003654,
    -80.1127548,
    ARRAY['WiFi', 'Shore Power', 'Water Hookup', 'Fuel Dock', 'Pump-Out', 'Restrooms', 'Showers', 'Laundry', 'Restaurant', 'Ship Store'],
    ARRAY[]::TEXT[],
    TRUE
);

-- ============================================================
-- 3 Test Slips with varying sizes and rates
-- ============================================================

-- Small slip (30 ft)
INSERT INTO slips (marina_id, name, length_ft, width_ft, depth_ft, has_power, has_water, price_per_night, price_per_week, price_per_month, is_available, notes)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Slip A-12',
    30.0, 10.0, 6.0,
    TRUE, TRUE,
    75.00, 450.00, 1500.00,
    TRUE,
    'Great for small to mid-size vessels. Located near the fuel dock.'
);

-- Medium slip (50 ft)
INSERT INTO slips (marina_id, name, length_ft, width_ft, depth_ft, has_power, has_water, price_per_night, price_per_week, price_per_month, is_available, notes)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Slip B-05',
    50.0, 16.0, 8.0,
    TRUE, TRUE,
    150.00, 900.00, 3200.00,
    TRUE,
    'Mid-dock location with 50-amp shore power. Easy in/out access.'
);

-- Large slip (80 ft)
INSERT INTO slips (marina_id, name, length_ft, width_ft, depth_ft, has_power, has_water, price_per_night, price_per_week, price_per_month, is_available, notes)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Slip C-01',
    80.0, 22.0, 10.0,
    TRUE, TRUE,
    350.00, 2100.00, 7500.00,
    TRUE,
    'End-tie premium slip with 100-amp power. Accommodates large yachts.'
);
