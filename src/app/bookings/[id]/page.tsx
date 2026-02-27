"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
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

export default function BookingDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isSuccess = searchParams.get("success") === "true";

  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchBooking() {
    const { data } = (await supabase
      .from("bookings")
      .select("*, slips(*), marinas(*)")
      .eq("id", id)
      .single()) as unknown as { data: BookingWithDetails | null };

    if (data) {
      setBooking(data);
    }
    setLoading(false);
    return data;
  }

  useEffect(() => {
    fetchBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto-refresh if coming from Stripe success and status is still pending
  useEffect(() => {
    if (!isSuccess || !booking) return;
    if (booking.status !== "pending") return;

    const startTime = Date.now();

    pollRef.current = setInterval(async () => {
      const updated = await fetchBooking();
      if (
        !updated ||
        updated.status !== "pending" ||
        Date.now() - startTime > 60000
      ) {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, booking?.status]);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["boat_owner"]}>
        <LoadingSpinner size="lg" message="Loading booking..." />
      </ProtectedRoute>
    );
  }

  if (!booking || booking.boat_owner_id !== user?.id) {
    return (
      <ProtectedRoute allowedRoles={["boat_owner"]}>
        <div className="max-w-3xl mx-auto px-6 py-10 text-center">
          <p className="text-gray-600">Booking not found.</p>
          <Link
            href="/bookings"
            className="text-teal-600 hover:underline text-sm mt-2 inline-block"
          >
            View all bookings
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  const nights = calculateNights(booking.check_in, booking.check_out);

  return (
    <ProtectedRoute allowedRoles={["boat_owner"]}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Success banner */}
        {isSuccess && booking.status === "confirmed" && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-green-800 font-semibold">
              Payment confirmed! Your booking is all set.
            </p>
          </div>
        )}

        {isSuccess && booking.status === "pending" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-yellow-800 font-semibold">
              Processing payment... This may take a moment.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-navy-800">
            Booking Confirmation
          </h1>
          <StatusBadge status={booking.status} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
          {/* Marina & Slip */}
          <div>
            <h3 className="font-semibold text-navy-800 mb-2">
              {booking.slips.name}
            </h3>
            <p className="text-sm text-gray-600">
              {booking.marinas.name} &middot; {booking.marinas.city},{" "}
              {booking.marinas.state}
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Check-in</p>
              <p className="font-semibold text-navy-800">
                {formatDate(booking.check_in)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Check-out</p>
              <p className="font-semibold text-navy-800">
                {formatDate(booking.check_out)}
              </p>
            </div>
          </div>

          {/* Vessel info */}
          {(booking.vessel_name || booking.vessel_length || booking.vessel_type) && (
            <div>
              <h4 className="text-xs text-gray-500 mb-1">Vessel</h4>
              <p className="text-sm text-gray-800">
                {[
                  booking.vessel_name,
                  booking.vessel_length && `${booking.vessel_length}ft`,
                  booking.vessel_type,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          )}

          {/* Special requests */}
          {booking.special_requests && (
            <div>
              <h4 className="text-xs text-gray-500 mb-1">Special Requests</h4>
              <p className="text-sm text-gray-800">
                {booking.special_requests}
              </p>
            </div>
          )}

          {/* Price */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">
                {nights} night{nights > 1 ? "s" : ""}
              </span>
              <span className="text-gray-800">
                {formatPrice(booking.total_price)}
              </span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total Paid</span>
              <span className="text-navy-800">
                {formatPrice(booking.total_price)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/bookings"
            className="text-teal-600 hover:underline text-sm"
          >
            View all bookings
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
