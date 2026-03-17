export const SHORE_POWER_TYPES = [
  { value: "no_power", label: "No Power" },
  { value: "single_20", label: "Single 20" },
  { value: "single_30", label: "Single 30" },
  { value: "single_50", label: "Single 50" },
  { value: "double_30", label: "Double 30" },
  { value: "double_50", label: "Double 50" },
  { value: "single_100_1p", label: "Single 100 - 1 Phase" },
  { value: "single_100_3p", label: "Single 100 - 3 Phase" },
] as const;

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
