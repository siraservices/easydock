"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/protected-route";
import LoadingSpinner from "@/components/ui/loading-spinner";
import StatusBadge from "@/components/ui/status-badge";
import { formatPrice, formatDate, calculateNights } from "@/lib/utils/format";
import type { Database } from "@/types/database";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type Slip = Database["public"]["Tables"]["slips"]["Row"];
type Marina = Database["public"]["Tables"]["marinas"]["Row"];

type BookingWithDetails = Booking & {
  slips: Slip;
  marinas: Marina;
};

export default function BookingsPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      if (!user) return;

      const { data } = (await supabase
        .from("bookings")
        .select("*, slips(*), marinas(*)")
        .eq("boat_owner_id", user.id)
        .order("created_at", { ascending: false })) as unknown as {
        data: BookingWithDetails[] | null;
      };

      if (data) {
        setBookings(data);
      }
      setLoading(false);
    }
    fetchBookings();
  }, [user, supabase]);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["boat_owner"]}>
        <LoadingSpinner size="lg" message="Loading bookings..." />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["boat_owner"]}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-navy-800 mb-6">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
            <p className="text-4xl mb-3">&#9875;</p>
            <h3 className="text-lg font-semibold text-navy-800 mb-1">
              No bookings yet
            </h3>
            <p className="text-gray-600 mb-4">
              Find a slip and make your first booking!
            </p>
            <Link
              href="/search"
              className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors inline-block"
            >
              Search Slips
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const nights = calculateNights(
                booking.check_in,
                booking.check_out
              );
              return (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  className="block bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-navy-800">
                        {booking.slips.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {booking.marinas.name} &middot;{" "}
                        {booking.marinas.city}, {booking.marinas.state}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>

                  <div className="mt-3 flex items-center gap-6 text-sm text-gray-600">
                    <span>
                      {formatDate(booking.check_in)} &rarr;{" "}
                      {formatDate(booking.check_out)}
                    </span>
                    <span>
                      {nights} night{nights > 1 ? "s" : ""}
                    </span>
                    <span className="font-semibold text-navy-800">
                      {formatPrice(booking.total_price)}
                    </span>
                  </div>

                  {booking.vessel_name && (
                    <p className="text-xs text-gray-500 mt-2">
                      Vessel: {booking.vessel_name}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
