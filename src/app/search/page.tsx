"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import SearchFiltersBar, {
  type SearchFilters,
} from "@/components/search-filters";
import SlipCard from "@/components/slip-card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import EmptyState from "@/components/ui/empty-state";
import { buildSlipQuery } from "@/lib/hooks/use-map-filter";
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
  });
  const [slips, setSlips] = useState<Slip[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibleMarinaIds, setVisibleMarinaIds] = useState<Set<string>>(
    new Set()
  );
  const [hoveredMarinaId, setHoveredMarinaId] = useState<string | null>(null);
  const [initialCenter, setInitialCenter] = useState<
    { longitude: number; latitude: number } | undefined
  >(undefined);
  const hoverSourceRef = useRef<"map" | "list" | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

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

    const query = buildSlipQuery(supabase, filters);
    const { data: rawSlips } = (await query) as unknown as {
      data: Slip[] | null;
    };

    if (!rawSlips || rawSlips.length === 0) {
      setSlips([]);
      setLoading(false);
      return;
    }

    // If dates selected, filter out slips with conflicting bookings
    if (filters.checkIn && filters.checkOut) {
      const slipIds = rawSlips.map((s) => s.id);
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
      setSlips(rawSlips.filter((s) => !conflictIds.has(s.id)));
    } else {
      setSlips(rawSlips);
    }

    setLoading(false);
  }, [supabase, filters]);

  // Fetch slips on mount
  useEffect(() => {
    fetchSlips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derive unique marinas from all fetched slips
  const marinas = useMemo(
    () => [...new Map(slips.map((s) => [s.marinas.id, s.marinas])).values()],
    [slips]
  );

  // Derive visible slips based on viewport
  const visibleSlips = useMemo(
    () => slips.filter((s) => visibleMarinaIds.has(s.marinas.id)),
    [slips, visibleMarinaIds]
  );

  const handleSelectMarina = useCallback((id: string) => {
    // Scroll the first slip for this marina into view
    const el = document.getElementById(`marina-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Map — left side, sticky */}
      <div className="w-[60%] h-full sticky top-16 flex-shrink-0">
        {loading ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <LoadingSpinner size="lg" message="Loading map..." />
          </div>
        ) : (
          <MapView
            marinas={marinas}
            onVisibleMarinaIdsChange={setVisibleMarinaIds}
            hoveredMarinaId={hoveredMarinaId}
            onHoverMarina={handleHoverMarinaFromMap}
            onSelectMarina={handleSelectMarina}
            initialCenter={initialCenter}
          />
        )}
      </div>

      {/* List — right side, scrollable */}
      <div ref={listRef} className="w-[40%] h-full overflow-y-auto flex-shrink-0">
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
          ) : visibleSlips.length > 0 ? (
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
            </div>
          ) : (
            <EmptyState
              icon={
                <span className="text-5xl">&#9875;</span>
              }
              title="No slips found"
              message="Try adjusting your filters or zooming out on the map."
            />
          )}
        </div>
      </div>
    </div>
  );
}
