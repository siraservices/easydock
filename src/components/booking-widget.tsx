"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  formatPrice,
  calculateNights,
} from "@/lib/utils/format";
import { VESSEL_TYPES } from "@/lib/constants";
import type { Database } from "@/types/database";

type Slip = Database["public"]["Tables"]["slips"]["Row"];

interface BookingWidgetProps {
  slip: Slip;
  marinaId: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  isDemo?: boolean;
}

export default function BookingWidget({
  slip,
  marinaId,
  initialCheckIn,
  initialCheckOut,
  isDemo = false,
}: BookingWidgetProps) {
  const { user } = useAuth();
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(initialCheckIn || "");
  const [checkOut, setCheckOut] = useState(initialCheckOut || "");
  const [vesselName, setVesselName] = useState("");
  const [vesselLength, setVesselLength] = useState("");
  const [vesselType, setVesselType] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const nights =
    checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0;

  function calculateTotal(): number {
    if (!nights) return 0;
    // Use weekly rate if >= 7 nights and weekly rate exists
    if (nights >= 7 && slip.price_per_week) {
      const weeks = Math.floor(nights / 7);
      const remainingNights = nights % 7;
      return weeks * slip.price_per_week + remainingNights * slip.price_per_night;
    }
    return nights * slip.price_per_night;
  }

  const total = calculateTotal();

  async function handleBooking() {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!checkIn || !checkOut) {
      setError("Please select check-in and check-out dates.");
      return;
    }

    if (vesselLength && parseInt(vesselLength, 10) > slip.length_ft) {
      setError(`This slip accommodates boats up to ${slip.length_ft}ft.`);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slipId: slip.id,
          marinaId,
          checkIn,
          checkOut,
          totalPrice: total,
          vesselName: vesselName || null,
          vesselLength: vesselLength ? parseInt(vesselLength, 10) : null,
          vesselType: vesselType || null,
          specialRequests: specialRequests || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422) {
          // Marina is not set up for online payments
          setError(data.error || "This marina is not currently accepting online payments. Please try another marina.");
        } else {
          setError(data.error || "Something went wrong.");
        }
        setSubmitting(false);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else if (data.bookingId) {
        router.push(`/bookings/${data.bookingId}?success=true`);
      }
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (isDemo) {
    const marina = (slip as unknown as { marinas: { phone?: string | null; email?: string | null; website?: string | null } }).marinas;
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-navy-800 mb-4">Book This Slip</h3>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
          <p className="font-semibold text-amber-800 mb-1">Demo listing</p>
          <p className="text-amber-700">
            This marina hasn&rsquo;t set up online booking yet. Contact them directly to reserve this slip.
          </p>
          {(marina?.phone || marina?.email || marina?.website) && (
            <div className="mt-3 space-y-1 text-amber-700">
              {marina.phone && <p>Phone: {marina.phone}</p>}
              {marina.email && <p>Email: {marina.email}</p>}
              {marina.website && (
                <p>
                  Web:{" "}
                  <a href={marina.website} target="_blank" rel="noopener noreferrer" className="underline">
                    {marina.website}
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-navy-800 mb-4">
        Book This Slip
      </h3>

      <div className="space-y-4">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Check-in
            </label>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Check-out
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Vessel info */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Vessel Name
          </label>
          <input
            type="text"
            value={vesselName}
            onChange={(e) => setVesselName(e.target.value)}
            placeholder="e.g. Sea Breeze"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Vessel Length (ft)
            </label>
            <input
              type="number"
              value={vesselLength}
              onChange={(e) => setVesselLength(e.target.value)}
              placeholder="e.g. 35"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Vessel Type
            </label>
            <select
              value={vesselType}
              onChange={(e) => setVesselType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select type</option>
              {VESSEL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Special Requests
          </label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows={2}
            placeholder="Any special requirements..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Price breakdown */}
        {nights > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                {formatPrice(slip.price_per_night)} x {nights} night
                {nights > 1 ? "s" : ""}
              </span>
              <span className="text-gray-800">
                {formatPrice(nights * slip.price_per_night)}
              </span>
            </div>
            {nights >= 7 && slip.price_per_week && (
              <div className="flex justify-between text-teal-700">
                <span>Weekly rate applied</span>
                <span>-{formatPrice(nights * slip.price_per_night - total)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total</span>
              <span className="text-navy-800">{formatPrice(total)}</span>
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <button
          onClick={handleBooking}
          disabled={submitting || !checkIn || !checkOut}
          className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Processing..." : `Book & Pay ${nights > 0 ? formatPrice(total) : ""}`}
        </button>
      </div>
    </div>
  );
}
