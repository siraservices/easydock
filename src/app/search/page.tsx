"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/protected-route";
import SearchFiltersBar, {
  type SearchFilters,
} from "@/components/search-filters";
import SlipCard from "@/components/slip-card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { DEFAULT_CITY } from "@/lib/constants";
import type { Database } from "@/types/database";

type Marina = Database["public"]["Tables"]["marinas"]["Row"];
type Slip = Database["public"]["Tables"]["slips"]["Row"] & {
  marinas: Marina;
};
type Booking = Database["public"]["Tables"]["bookings"]["Row"];

export default function SearchPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [filters, setFilters] = useState<SearchFilters>({
    city: "",
    checkIn: "",
    checkOut: "",
    boatLength: "",
  });
  const [slips, setSlips] = useState<Slip[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    setSearched(true);

    let query = supabase
      .from("slips")
      .select("*, marinas!inner(*)")
      .eq("is_available", true)
      .eq("marinas.is_active", true);

    const city = filters.city.trim() || DEFAULT_CITY;
    query = query.ilike("marinas.city", `%${city}%`);

    if (filters.boatLength) {
      query = query.gte("length_ft", parseInt(filters.boatLength, 10));
    }

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

      const conflictIds = new Set(
        conflicts?.map((b) => b.slip_id) ?? []
      );

      setSlips(rawSlips.filter((s) => !conflictIds.has(s.id)));
    } else {
      setSlips(rawSlips);
    }

    setLoading(false);
  }, [supabase, filters]);

  // Run initial search on mount
  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProtectedRoute allowedRoles={["boat_owner"]}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-navy-800 mb-6">
          Find a Slip
        </h1>

        <SearchFiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={search}
        />

        {loading ? (
          <LoadingSpinner size="lg" message="Searching slips..." />
        ) : slips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {slips.map((slip) => (
              <SlipCard
                key={slip.id}
                slip={slip}
                checkIn={filters.checkIn}
                checkOut={filters.checkOut}
              />
            ))}
          </div>
        ) : searched ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">&#9875;</p>
            <h3 className="text-lg font-semibold text-navy-800 mb-1">
              No slips found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters or searching a different city.
            </p>
          </div>
        ) : null}
      </div>
    </ProtectedRoute>
  );
}
