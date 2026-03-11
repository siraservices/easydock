// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = any;
import type { Database } from "@/types/database";

type Marina = Database["public"]["Tables"]["marinas"]["Row"];

export interface SearchFilters {
  checkIn: string;
  checkOut: string;
  boatLength: string;
  boatBeam: string;
}

/**
 * A minimal LngLatBounds-like interface that supports the `contains` method.
 * Compatible with mapbox-gl's LngLatBounds.
 */
interface LngLatBoundsLike {
  contains(lngLat: [number, number]): boolean;
}

/**
 * Filters marinas to only those whose [lng, lat] falls within the given map bounds.
 * Excludes marinas with null lat or lng.
 */
export function filterMarinasByViewport(
  marinas: Marina[],
  bounds: LngLatBoundsLike
): Marina[] {
  return marinas.filter((marina) => {
    if (marina.lat === null || marina.lng === null) return false;
    return bounds.contains([marina.lng, marina.lat]);
  });
}

/**
 * Builds a Supabase query for available slips with optional dimension filters.
 * Does NOT filter by city — viewport filtering handles geographic scoping.
 */
export function buildSlipQuery(
  supabase: AnySupabaseClient,
  filters: SearchFilters
) {
  let query = supabase
    .from("slips")
    .select("*, marinas!inner(*)")
    .eq("is_available", true)
    .eq("marinas.is_active", true)
    .not("marinas.lat", "is", null)
    .not("marinas.lng", "is", null);

  if (filters.boatLength) {
    query = query.gte("length_ft", parseInt(filters.boatLength, 10));
  }

  if (filters.boatBeam) {
    query = query.gte("width_ft", parseInt(filters.boatBeam, 10));
  }

  return query;
}
