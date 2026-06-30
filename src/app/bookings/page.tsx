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

function BookingCard({ booking }: { booking: BookingWithDetails }) {
  const nights = calculateNights(booking.check_in, booking.check_out);
  return (
    <Link
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
}

export default function BookingsPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      if (!user) return;
      try {
        const query = supabase
          .from("bookings")
          .select("*, slips(*), marinas(*)")
          .eq("boat_owner_id", user.id)
          .order("check_in", { ascending: true });

        const { data } = await Promise.race([
          query as unknown as Promise<{ data: BookingWithDetails[] | null }>,
          new Promise<{ data: null }>((resolve) =>
            setTimeout(() => resolve({ data: null }), 5000)
          ),
        ]);

        if (data) {
          setBookings(data);
        }
      } catch {
        // Query failed — show empty state
      } finally {
        setLoading(false);
      }
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

  const today = new Date().toISOString().split("T")[0];
  const upcoming = bookings.filter(
    (b) =>
      b.check_in >= today &&
      !["cancelled", "declined"].includes(b.status)
  );
  const past = bookings.filter(
    (b) =>
      b.check_in < today ||
      ["cancelled", "declined"].includes(b.status)
  );
  // Past: newest first
  past.sort(
    (a, b) =>
      new Date(b.check_in).getTime() - new Date(a.check_in).getTime()
  );

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
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Upcoming
                </h2>
                <div className="space-y-4">
                  {upcoming.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Past
                </h2>
                <div className="space-y-4">
                  {past.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
