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

const CANCELLABLE_STATUSES = ["pending", "approved", "confirmed"];

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

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [pollTimedOut, setPollTimedOut] = useState(false);

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

  async function handleCancelBooking() {
    if (!booking) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = await res.json();
        setCancelError(body.error ?? "Failed to cancel booking");
        return;
      }
      setShowCancelDialog(false);
      await fetchBooking();
    } catch {
      setCancelError("Network error — please try again");
    } finally {
      setCancelling(false);
    }
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
      const elapsed = Date.now() - startTime;
      const timedOut = elapsed > 60000;
      if (!updated || updated.status !== "pending" || timedOut) {
        if (pollRef.current) clearInterval(pollRef.current);
        if (timedOut && updated?.status === "pending") {
          setPollTimedOut(true);
        }
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

  // Colored status banner config
  const statusBannerConfig: Record<
    string,
    { bg: string; border: string; text: string; label: string; subtitle: string }
  > = {
    pending: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      label: "Pending",
      subtitle: "Awaiting marina approval",
    },
    approved: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      label: "Approved",
      subtitle: "Approved — awaiting payment confirmation",
    },
    confirmed: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      label: "Confirmed",
      subtitle: "Confirmed and paid",
    },
    cancelled: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      label: "Cancelled",
      subtitle: "This booking has been cancelled",
    },
    declined: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      label: "Declined",
      subtitle: "This booking was declined by the marina",
    },
    completed: {
      bg: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-800",
      label: "Completed",
      subtitle: "Completed",
    },
  };

  const bannerConfig = statusBannerConfig[booking.status];

  return (
    <ProtectedRoute allowedRoles={["boat_owner"]}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Colored status banner */}
        {bannerConfig && !isSuccess && (
          <div
            className={`${bannerConfig.bg} border ${bannerConfig.border} rounded-xl p-4 mb-6`}
          >
            <p className={`font-bold ${bannerConfig.text}`}>
              {bannerConfig.label}
            </p>
            <p className={`text-sm ${bannerConfig.text} mt-0.5`}>
              {bannerConfig.subtitle}
            </p>
          </div>
        )}

        {/* Success banner — only shown when ?success=true */}
        {isSuccess && booking.status === "confirmed" && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-green-800 font-semibold">
              Payment confirmed! Your booking is all set.
            </p>
          </div>
        )}

        {isSuccess && booking.status === "pending" && !pollTimedOut && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-yellow-800 font-semibold">
              Processing payment... This may take a moment.
            </p>
          </div>
        )}

        {isSuccess && booking.status === "pending" && pollTimedOut && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-blue-800 font-semibold">Payment submitted.</p>
            <p className="text-blue-700 text-sm mt-1">
              Your booking will confirm automatically. Check your email or refresh this page in a few minutes.
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

            {/* Cancel button — only for active bookings before check-in */}
            {CANCELLABLE_STATUSES.includes(booking.status) &&
              booking.check_in > new Date().toISOString().split("T")[0] && (
                <button
                  onClick={() => {
                    setCancelError(null);
                    setShowCancelDialog(true);
                  }}
                  className="border border-red-500 text-red-600 hover:bg-red-50 rounded-lg px-4 py-2 font-semibold text-sm w-full mt-4"
                >
                  Cancel Booking
                </button>
              )}
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

      {/* Cancel confirmation dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 w-full">
            <h2 className="text-lg font-bold text-navy-800 mb-2">
              Cancel this booking?
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              You will receive a full refund of{" "}
              <span className="font-semibold">
                {formatPrice(booking.total_price)}
              </span>
              .
            </p>

            {cancelError && (
              <p className="text-sm text-red-600 mb-3">{cancelError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelDialog(false)}
                disabled={cancelling}
                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-2 font-semibold text-sm"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 font-semibold text-sm disabled:opacity-60"
              >
                {cancelling ? "Cancelling..." : "Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
