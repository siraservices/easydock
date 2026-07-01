"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import LoadingSpinner from "@/components/ui/loading-spinner";
import BookingWidget from "@/components/booking-widget";
import { formatPrice } from "@/lib/utils/format";
import { MOCK_SLIPS } from "@/lib/mock-data";
import type { Database } from "@/types/database";

type Marina = Database["public"]["Tables"]["marinas"]["Row"];
type Slip = Database["public"]["Tables"]["slips"]["Row"] & {
  marinas: Marina;
};

export default function SlipDetailClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const checkIn = searchParams.get("checkIn") || undefined;
  const checkOut = searchParams.get("checkOut") || undefined;

  const { profile } = useAuth();
  const isMarinaOwner = profile?.role === "marina_owner";
  const supabase = useMemo(() => createClient(), []);
  const [slip, setSlip] = useState<Slip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSlip() {
      let result: Slip | null = null;

      try {
        const query = supabase
          .from("slips")
          .select("*, marinas!inner(*)")
          .eq("id", id)
          .single();

        const { data } = await Promise.race([
          query as unknown as Promise<{ data: Slip | null }>,
          new Promise<{ data: null }>((resolve) =>
            setTimeout(() => resolve({ data: null }), 5000)
          ),
        ]);

        result = data;
      } catch {
        // Query failed
      }

      // Fall back to mock data if Supabase returned nothing
      if (!result) {
        result = MOCK_SLIPS.find((s) => s.id === id) ?? null;
      }

      setSlip(result);
      setLoading(false);
    }
    fetchSlip();
  }, [id, supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading slip details..." />;
  }

  if (!slip) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 text-center">
        <p className="text-gray-600">Slip not found.</p>
        <Link
          href="/search"
          className="text-teal-600 hover:underline text-sm mt-2 inline-block"
        >
          Back to search
        </Link>
      </div>
    );
  }

  const marina = slip.marinas;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Back link */}
        <Link
          href="/search"
          className="text-teal-600 hover:underline text-sm mb-4 inline-block"
        >
          &larr; Back to search
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo gallery */}
            {marina.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
                <img
                  src={marina.photos[0]}
                  alt={marina.name}
                  className="w-full h-64 object-cover col-span-2"
                />
                {marina.photos.slice(1, 5).map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt={marina.name}
                    className="w-full h-32 object-cover"
                  />
                ))}
              </div>
            ) : (
              <div className="h-64 bg-gradient-to-br from-navy-100 to-teal-50 rounded-xl flex items-center justify-center text-navy-300 text-6xl">
                &#9875;
              </div>
            )}

            {/* Marina & Slip info */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <p className="text-sm text-gray-500 mb-1">
                <Link
                  href={`/marinas/${marina.id}`}
                  className="hover:text-teal-600 hover:underline"
                >
                  {marina.name}
                </Link>{" "}
                &middot; {marina.city}, {marina.state}
              </p>
              <h1 className="text-2xl font-bold text-navy-800 mb-4">
                {slip.name} &middot; {slip.length_ft}ft Slip
              </h1>

              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Length</p>
                  <p className="font-semibold text-navy-800">
                    {slip.length_ft} ft
                  </p>
                </div>
                {slip.width_ft && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Width</p>
                    <p className="font-semibold text-navy-800">
                      {slip.width_ft} ft
                    </p>
                  </div>
                )}
                {slip.depth_ft && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Depth</p>
                    <p className="font-semibold text-navy-800">
                      {slip.depth_ft} ft
                    </p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Per Night</p>
                  <p className="font-semibold text-navy-800">
                    {formatPrice(slip.price_per_night)}
                  </p>
                </div>
              </div>

              {/* Utilities */}
              <div className="flex gap-2 mb-6">
                {slip.has_power && (
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                    Shore Power
                  </span>
                )}
                {slip.has_water && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    Water Hookup
                  </span>
                )}
              </div>

              {/* Pricing tiers */}
              <div className="space-y-1 mb-6">
                <h3 className="font-semibold text-navy-800">Pricing</h3>
                <p className="text-sm text-gray-600">
                  Nightly: {formatPrice(slip.price_per_night)}
                </p>
                {slip.price_per_week && (
                  <p className="text-sm text-gray-600">
                    Weekly: {formatPrice(slip.price_per_week)}
                  </p>
                )}
                {slip.price_per_month && (
                  <p className="text-sm text-gray-600">
                    Monthly: {formatPrice(slip.price_per_month)}
                  </p>
                )}
              </div>

              {/* Notes */}
              {slip.notes && (
                <div>
                  <h3 className="font-semibold text-navy-800 mb-1">Notes</h3>
                  <p className="text-sm text-gray-600">{slip.notes}</p>
                </div>
              )}
            </div>

            {/* Marina amenities */}
            {marina.amenities.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-navy-800 mb-3">
                  Marina Amenities
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {marina.amenities.map((a) => (
                    <span
                      key={a}
                      className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-sm"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Marina contact */}
            {(marina.phone || marina.email || marina.website) && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="font-semibold text-navy-800 mb-3">
                  Contact Marina
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  {marina.phone && <p>Phone: {marina.phone}</p>}
                  {marina.email && <p>Email: {marina.email}</p>}
                  {marina.website && (
                    <p>
                      Website:{" "}
                      <a
                        href={marina.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:underline"
                      >
                        {marina.website}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking widget or marina preview notice */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              {isMarinaOwner ? (
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 text-center">
                  <p className="text-sm font-semibold text-teal-800 mb-1">
                    Marina owner preview
                  </p>
                  <p className="text-sm text-teal-700 mb-4">
                    This is how boat owners see your slip listing.
                  </p>
                  <Link
                    href="/dashboard"
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors inline-block"
                  >
                    Back to dashboard
                  </Link>
                </div>
              ) : (
                <BookingWidget
                  slip={slip}
                  marinaId={marina.id}
                  initialCheckIn={checkIn}
                  initialCheckOut={checkOut}
                  isDemo={marina.id.startsWith("csv-marina-")}
                />
              )}
            </div>
          </div>
        </div>
    </div>
  );
}
