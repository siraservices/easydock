"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import SearchFiltersBar, {
  type SearchFilters,
} from "@/components/search-filters";
import SlipCard from "@/components/slip-card";
import UnclaimedMarinaCard from "@/components/unclaimed-marina-card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import EmptyState from "@/components/ui/empty-state";
import { buildSlipQuery } from "@/lib/hooks/use-map-filter";
import { MOCK_SLIPS } from "@/lib/mock-data";
import type { Database } from "@/types/database";

type Marina = Database["public"]["Tables"]["marinas"]["Row"];
type Slip = Database["public"]["Tables"]["slips"]["Row"] & {
  marinas: Marina;
};

const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => <LoadingSpinner size="lg" message="Loading map..." />,
});

export default function SearchPage() {
  const supabase = useMemo(() => createClient(), []);

  const [filters, setFilters] = useState<SearchFilters>({
    checkIn: "",
    checkOut: "",
    boatLength: "",
    boatBeam: "",
    boatDraft: "",
    shorePower: "",
  });
  const [slips, setSlips] = useState<Slip[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleMarinaIds, setVisibleMarinaIds] = useState<Set<string>>(
    new Set()
  );
  const [hoveredMarinaId, setHoveredMarinaId] = useState<string | null>(null);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [allMarinas, setAllMarinas] = useState<Marina[]>([]);
  const [initialCenter, setInitialCenter] = useState<
    { longitude: number; latitude: number } | undefined
  >(undefined);
  const hoverSourceRef = useRef<"map" | "list" | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Fetch ALL active marinas with coordinates (independent of slip query)
  useEffect(() => {
    async function fetchAllMarinas() {
      const { data, error } = await supabase
        .from("marinas")
        .select("*")
        .eq("is_active", true)
        .not("lat", "is", null)
        .not("lng", "is", null);
      if (error) {
        console.warn("Error fetching all marinas:", error.message);
        return;
      }
      if (data) {
        setAllMarinas(data);
      }
    }
    fetchAllMarinas();
  }, [supabase]);

  // Request geolocation on mount; on success fly map to user location
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setInitialCenter({
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
        });
      },
      () => {
        // Permission denied or unavailable — map defaults to South Florida
      }
    );
  }, []);

  // Scroll the list to the highlighted card when hover originates from the map
  useEffect(() => {
    if (!hoveredMarinaId || hoverSourceRef.current !== "map") return;
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-marina-id="${hoveredMarinaId}"]`
    );
    if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [hoveredMarinaId]);

  const handleHoverMarinaFromMap = useCallback((id: string | null) => {
    hoverSourceRef.current = id ? "map" : null;
    setHoveredMarinaId(id);
  }, []);

  const handleHoverMarinaFromList = useCallback((id: string | null) => {
    hoverSourceRef.current = id ? "list" : null;
    setHoveredMarinaId(id);
  }, []);

  const fetchSlips = useCallback(async () => {
    setLoading(true);

    try {
      // Try Supabase first, fall back to mock data
      // Race against timeout — Supabase can hang if auth session is locked
      const query = buildSlipQuery(supabase, filters);
      const result = await Promise.race([
        query as Promise<{ data: Slip[] | null; error: { message: string } | null }>,
        new Promise<{ data: null; error: { message: string } }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: { message: "Query timed out" } }), 5000)
        ),
      ]);
      const { data: rawSlips, error } = result;

      let resultSlips: Slip[];

      if (error || !rawSlips || rawSlips.length === 0) {
        if (error) {
          console.warn("Supabase unavailable, using demo data:", error.message);
        }
        // Fall back to mock data with client-side filtering
        resultSlips = MOCK_SLIPS.filter((slip) => {
          if (filters.boatLength && slip.length_ft < parseInt(filters.boatLength, 10)) return false;
          if (filters.boatBeam && slip.width_ft !== null && slip.width_ft < parseInt(filters.boatBeam, 10)) return false;
          if (filters.boatDraft && slip.depth_ft !== null && slip.depth_ft < parseInt(filters.boatDraft, 10)) return false;
          if (filters.shorePower) {
            if (filters.shorePower === "no_power") {
              if (slip.shore_power_type) return false;
            } else if (slip.shore_power_type !== filters.shorePower) {
              return false;
            }
          }
          return true;
        });
      } else {
        resultSlips = rawSlips;

        // If dates selected, filter out slips with conflicting bookings
        if (filters.checkIn && filters.checkOut) {
          const slipIds = resultSlips.map((s) => s.id);
          const { data: conflicts } = (await supabase
            .from("bookings")
            .select("slip_id")
            .in("slip_id", slipIds)
            .in("status", ["pending", "approved", "confirmed"])
            .lt("check_in", filters.checkOut)
            .gt("check_out", filters.checkIn)) as unknown as {
            data: { slip_id: string }[] | null;
          };

          const conflictIds = new Set(conflicts?.map((b) => b.slip_id) ?? []);
          resultSlips = resultSlips.filter((s) => !conflictIds.has(s.id));
        }
      }

      setSlips(resultSlips);
    } catch (err) {
      console.warn("Search failed, using demo data:", err);
      setSlips(MOCK_SLIPS);
    } finally {
      setLoading(false);
    }
  }, [supabase, filters]);

  // Fetch slips on mount
  useEffect(() => {
    fetchSlips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Merge all marinas with slip-derived marinas (slip data overlays fresher info)
  const marinas = useMemo(() => {
    const marinaMap = new Map<string, Marina>();
    for (const m of allMarinas) {
      marinaMap.set(m.id, m);
    }
    for (const s of slips) {
      marinaMap.set(s.marinas.id, s.marinas);
    }
    return [...marinaMap.values()];
  }, [allMarinas, slips]);

  // Derive visible slips based on viewport
  const visibleSlips = useMemo(
    () => slips.filter((s) => visibleMarinaIds.has(s.marinas.id)),
    [slips, visibleMarinaIds]
  );

  // Marinas visible on map that have no slips
  const marinasWithoutSlips = useMemo(() => {
    const marinaIdsWithSlips = new Set(slips.map((s) => s.marinas.id));
    return marinas.filter(
      (m) => visibleMarinaIds.has(m.id) && !marinaIdsWithSlips.has(m.id)
    );
  }, [marinas, slips, visibleMarinaIds]);

  const handleSelectMarina = useCallback((id: string) => {
    // Scroll the first slip for this marina into view
    const el = document.getElementById(`marina-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const mapPanel = (
    <div className="relative w-full h-full">
      {loading ? (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <LoadingSpinner size="lg" message="Loading map..." />
        </div>
      ) : (
        <>
          <MapView
            marinas={marinas}
            onVisibleMarinaIdsChange={setVisibleMarinaIds}
            hoveredMarinaId={hoveredMarinaId}
            onHoverMarina={handleHoverMarinaFromMap}
            onSelectMarina={handleSelectMarina}
            initialCenter={initialCenter}
          />
          {/* Empty state overlay — shown when no marinas match filters */}
          {marinas.length === 0 && !loading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg pointer-events-auto">
                <span className="text-4xl block mb-2">&#9875;</span>
                <p className="font-semibold text-navy-800">No marinas match your filters.</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting vessel dimensions.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const listPanel = (
    <div ref={listRef} className="h-full overflow-y-auto">
      <div className="p-4">
        <SearchFiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={fetchSlips}
        />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" message="Searching slips..." />
          </div>
        ) : visibleSlips.length > 0 || marinasWithoutSlips.length > 0 ? (
          <div className="flex flex-col gap-4">
            {visibleSlips.map((slip) => (
              <div key={slip.id} id={`marina-${slip.marinas.id}`}>
                <SlipCard
                  slip={slip}
                  checkIn={filters.checkIn}
                  checkOut={filters.checkOut}
                  isHighlighted={hoveredMarinaId === slip.marinas.id}
                  onHover={handleHoverMarinaFromList}
                />
              </div>
            ))}
            {marinasWithoutSlips.map((marina) => (
              <div key={marina.id} id={`marina-${marina.id}`}>
                <UnclaimedMarinaCard
                  marina={marina}
                  checkIn={filters.checkIn}
                  checkOut={filters.checkOut}
                  isHighlighted={hoveredMarinaId === marina.id}
                  onHover={handleHoverMarinaFromList}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<span className="text-5xl">&#9875;</span>}
            title="No slips found"
            message="Try adjusting your filters or zooming out on the map."
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-4rem)] relative">
      {/* Desktop layout: side-by-side (map 60%, list 40%) */}
      <div className="hidden md:flex h-full">
        {/* Map — left side, sticky */}
        <div className="w-[60%] h-full sticky top-16 flex-shrink-0">
          {mapPanel}
        </div>
        {/* List — right side, scrollable */}
        <div className="w-[40%] h-full flex-shrink-0">
          {listPanel}
        </div>
      </div>

      {/* Mobile layout: list first by default */}
      <div className="md:hidden h-full">
        {listPanel}

        {/* Floating "Show Map" button */}
        {!showMobileMap && (
          <button
            onClick={() => setShowMobileMap(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-navy-800 text-white px-6 py-3 rounded-full shadow-lg font-semibold flex items-center gap-2"
            aria-label="Show map"
          >
            {/* Map icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M8.161 2.58a1.875 1.875 0 0 1 1.678 0l4.993 2.498c.106.052.23.052.336 0l3.869-1.935A1.875 1.875 0 0 1 21.75 4.82v12.485c0 .71-.401 1.36-1.037 1.677l-4.875 2.437a1.875 1.875 0 0 1-1.676 0l-4.994-2.497a.375.375 0 0 0-.336 0l-3.868 1.935A1.875 1.875 0 0 1 2.25 19.18V6.695c0-.71.401-1.36 1.036-1.677l4.875-2.437ZM9 6a.75.75 0 0 1 .75.75V15a.75.75 0 0 1-1.5 0V6.75A.75.75 0 0 1 9 6Zm6.75 3a.75.75 0 0 0-1.5 0v8.25a.75.75 0 0 0 1.5 0V9Z" clipRule="evenodd" />
            </svg>
            Show Map
          </button>
        )}

        {/* Mobile full-screen map overlay */}
        {showMobileMap && (
          <div className="fixed inset-0 z-40 bg-white flex flex-col">
            {/* Filter bar at top */}
            <div className="p-3 bg-white shadow-sm z-50">
              <SearchFiltersBar
                filters={filters}
                onFiltersChange={setFilters}
                onSearch={fetchSlips}
              />
            </div>

            {/* Map fills remaining space */}
            <div className="flex-1 relative">
              {mapPanel}
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowMobileMap(false)}
              className="absolute top-4 right-4 z-50 bg-white rounded-full w-9 h-9 flex items-center justify-center shadow-md text-navy-800 font-bold text-lg"
              aria-label="Close map"
            >
              &times;
            </button>

            {/* Show List button */}
            <button
              onClick={() => setShowMobileMap(false)}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-navy-800 text-white px-6 py-3 rounded-full shadow-lg font-semibold"
            >
              Show List
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
