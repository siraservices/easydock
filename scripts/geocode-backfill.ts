/**
 * Geocode backfill script
 *
 * Finds all marinas with a non-null address but null lat/lng and geocodes them
 * using the Mapbox Geocoding v6 API.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-key \
 *   MAPBOX_ACCESS_TOKEN=pk.xxx \
 *   npx tsx scripts/geocode-backfill.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !MAPBOX_ACCESS_TOKEN) {
  console.error(
    "Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MAPBOX_ACCESS_TOKEN"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(address)}&access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const features = data.features as Array<{
      geometry: { coordinates: [number, number] };
    }>;

    if (!features || features.length === 0) return null;

    // Mapbox v6 geometry.coordinates is [lng, lat]
    const [lng, lat] = features[0].geometry.coordinates;
    return { lat, lng };
  } catch {
    return null;
  }
}

async function main() {
  // Fetch all marinas where lat IS NULL and address IS NOT NULL
  const { data: marinas, error } = await supabase
    .from("marinas")
    .select("id, name, address, city, state, zip")
    .is("lat", null)
    .not("address", "is", null);

  if (error) {
    console.error("Failed to fetch marinas:", error.message);
    process.exit(1);
  }

  if (!marinas || marinas.length === 0) {
    console.log("No marinas need geocoding. All done.");
    return;
  }

  console.log(`Found ${marinas.length} marina(s) to geocode.\n`);

  let geocoded = 0;
  let failed = 0;
  let skipped = 0;

  for (const marina of marinas) {
    const parts = [marina.address, marina.city, marina.state, marina.zip];
    const fullAddress = parts.filter(Boolean).join(", ");

    if (!fullAddress.trim()) {
      console.log(`Skipped: ${marina.name} (no usable address)`);
      skipped++;
      continue;
    }

    const result = await geocodeAddress(fullAddress);

    if (result) {
      const { error: updateError } = await supabase
        .from("marinas")
        .update({ lat: result.lat, lng: result.lng })
        .eq("id", marina.id);

      if (updateError) {
        console.log(
          `Failed to update DB: ${marina.name} — ${updateError.message}`
        );
        failed++;
      } else {
        console.log(
          `Geocoded: ${marina.name} -> ${result.lat}, ${result.lng}`
        );
        geocoded++;
      }
    } else {
      console.log(`Failed: ${marina.name} (no results from Mapbox)`);
      failed++;
    }

    // Respect Mapbox rate limits with a 200ms delay between requests
    await sleep(200);
  }

  console.log(
    `\nSummary: ${geocoded} geocoded, ${failed} failed, ${skipped} skipped`
  );
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
