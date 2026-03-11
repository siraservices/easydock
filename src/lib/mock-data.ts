import type { Database } from "@/types/database";

type Marina = Database["public"]["Tables"]["marinas"]["Row"];
type Slip = Database["public"]["Tables"]["slips"]["Row"] & {
  marinas: Marina;
};

const now = new Date().toISOString();

const marinas: Marina[] = [
  {
    id: "mock-marina-001",
    owner_id: "mock-owner-001",
    name: "Sunrise Harbor Marina",
    description:
      "Premier marina in the heart of Fort Lauderdale with easy ocean access. Full-service facility featuring modern amenities, fuel dock, and on-site restaurant.",
    address: "500 Seabreeze Blvd",
    city: "Fort Lauderdale",
    state: "FL",
    zip: "33316",
    lat: 26.1003654,
    lng: -80.1127548,
    amenities: [
      "WiFi",
      "Shore Power",
      "Water Hookup",
      "Fuel Dock",
      "Pump-Out",
      "Restrooms",
      "Showers",
      "Laundry",
      "Restaurant",
      "Ship Store",
    ],
    photos: [],
    phone: null,
    email: null,
    website: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "mock-marina-002",
    owner_id: "mock-owner-002",
    name: "Bahia Mar Yachting Center",
    description:
      "Iconic Fort Lauderdale marina and host of the International Boat Show. Deep-water slips with full amenities.",
    address: "801 Seabreeze Blvd",
    city: "Fort Lauderdale",
    state: "FL",
    zip: "33316",
    lat: 26.1052,
    lng: -80.1065,
    amenities: [
      "WiFi",
      "Shore Power",
      "Water Hookup",
      "Fuel Dock",
      "Restrooms",
      "Showers",
      "Pool",
      "Restaurant",
    ],
    photos: [],
    phone: null,
    email: null,
    website: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "mock-marina-003",
    owner_id: "mock-owner-003",
    name: "Lauderdale Marina",
    description:
      "Located on the Intracoastal Waterway with quick access to Port Everglades inlet. Family-owned and operated since 1948.",
    address: "1900 SE 15th St",
    city: "Fort Lauderdale",
    state: "FL",
    zip: "33316",
    lat: 26.0985,
    lng: -80.1148,
    amenities: [
      "Shore Power",
      "Water Hookup",
      "Fuel Dock",
      "Pump-Out",
      "Restrooms",
      "Ship Store",
    ],
    photos: [],
    phone: null,
    email: null,
    website: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "mock-marina-004",
    owner_id: "mock-owner-004",
    name: "Pier Sixty-Six Marina",
    description:
      "World-class superyacht marina with 32 slips accommodating vessels up to 300 feet. Concierge services and fine dining on-site.",
    address: "2301 SE 17th St",
    city: "Fort Lauderdale",
    state: "FL",
    zip: "33316",
    lat: 26.0965,
    lng: -80.118,
    amenities: [
      "WiFi",
      "Shore Power",
      "Water Hookup",
      "Fuel Dock",
      "Restrooms",
      "Showers",
      "Pool",
      "Restaurant",
      "Concierge",
      "Valet",
    ],
    photos: [],
    phone: null,
    email: null,
    website: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "mock-marina-005",
    owner_id: "mock-owner-005",
    name: "Las Olas Marina",
    description:
      "Boutique marina steps from Las Olas Boulevard shopping and dining. Protected basin with calm waters year-round.",
    address: "240 Las Olas Circle",
    city: "Fort Lauderdale",
    state: "FL",
    zip: "33301",
    lat: 26.1175,
    lng: -80.1305,
    amenities: [
      "WiFi",
      "Shore Power",
      "Water Hookup",
      "Restrooms",
      "Showers",
    ],
    photos: [],
    phone: null,
    email: null,
    website: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
];

function makeSlip(
  id: string,
  marina: Marina,
  name: string,
  length: number,
  width: number,
  depth: number,
  priceNight: number,
  priceWeek: number,
  priceMonth: number,
  notes: string
): Slip {
  return {
    id,
    marina_id: marina.id,
    name,
    length_ft: length,
    width_ft: width,
    depth_ft: depth,
    has_power: true,
    has_water: true,
    price_per_night: priceNight,
    price_per_week: priceWeek,
    price_per_month: priceMonth,
    is_available: true,
    notes,
    created_at: now,
    updated_at: now,
    marinas: marina,
  };
}

export const MOCK_SLIPS: Slip[] = [
  // Sunrise Harbor Marina — 3 slips
  makeSlip("mock-slip-001", marinas[0], "Slip A-12", 30, 10, 6, 75, 450, 1500, "Great for small to mid-size vessels. Located near the fuel dock."),
  makeSlip("mock-slip-002", marinas[0], "Slip B-05", 50, 16, 8, 150, 900, 3200, "Mid-dock location with 50-amp shore power. Easy in/out access."),
  makeSlip("mock-slip-003", marinas[0], "Slip C-01", 80, 22, 10, 350, 2100, 7500, "End-tie premium slip with 100-amp power. Accommodates large yachts."),

  // Bahia Mar — 3 slips
  makeSlip("mock-slip-004", marinas[1], "Dock A-01", 40, 14, 7, 120, 720, 2400, "Protected slip with easy access to the inlet."),
  makeSlip("mock-slip-005", marinas[1], "Dock A-08", 60, 18, 9, 225, 1350, 4800, "Deep-water slip ideal for sportfish vessels."),
  makeSlip("mock-slip-006", marinas[1], "Dock B-03", 100, 26, 12, 500, 3000, 10000, "Megayacht slip with 200-amp power and fresh water."),

  // Lauderdale Marina — 2 slips
  makeSlip("mock-slip-007", marinas[2], "Slip 14", 35, 12, 6, 85, 510, 1700, "Quiet location on the Intracoastal. Great for sailboats."),
  makeSlip("mock-slip-008", marinas[2], "Slip 22", 45, 15, 7, 130, 780, 2600, "Close to the fuel dock and ship store."),

  // Pier Sixty-Six — 2 slips
  makeSlip("mock-slip-009", marinas[3], "Berth 1", 120, 30, 14, 750, 4500, 15000, "Premium superyacht berth with concierge service."),
  makeSlip("mock-slip-010", marinas[3], "Berth 8", 70, 20, 10, 300, 1800, 6000, "Mid-size yacht berth with full amenities."),

  // Las Olas Marina — 2 slips
  makeSlip("mock-slip-011", marinas[4], "Slip L-03", 32, 11, 5, 90, 540, 1800, "Walk to Las Olas shops and restaurants."),
  makeSlip("mock-slip-012", marinas[4], "Slip L-10", 55, 17, 8, 200, 1200, 4000, "Corner slip with extra maneuvering room."),
];
