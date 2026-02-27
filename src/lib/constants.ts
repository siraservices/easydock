export const AMENITIES = [
  { key: "power", label: "Shore Power" },
  { key: "water", label: "Water Hookup" },
  { key: "wifi", label: "WiFi" },
  { key: "fuel", label: "Fuel Dock" },
  { key: "pump_out", label: "Pump-Out" },
  { key: "showers", label: "Showers" },
  { key: "laundry", label: "Laundry" },
  { key: "security", label: "24/7 Security" },
] as const;

export const VESSEL_TYPES = [
  "Sailboat",
  "Motor Yacht",
  "Center Console",
  "Catamaran",
  "Trawler",
  "Sport Fishing",
  "Other",
] as const;

export const DEFAULT_CITY = "Fort Lauderdale";
