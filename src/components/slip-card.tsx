"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils/format";
import type { Database } from "@/types/database";

type Marina = Database["public"]["Tables"]["marinas"]["Row"];
type Slip = Database["public"]["Tables"]["slips"]["Row"] & {
  marinas: Marina;
};

interface SlipCardProps {
  slip: Slip;
  checkIn?: string;
  checkOut?: string;
}

export default function SlipCard({ slip, checkIn, checkOut }: SlipCardProps) {
  const marina = slip.marinas;
  const photo = marina.photos?.[0];
  const params = new URLSearchParams();
  if (checkIn) params.set("checkIn", checkIn);
  if (checkOut) params.set("checkOut", checkOut);
  const query = params.toString() ? `?${params.toString()}` : "";

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="h-40 bg-gradient-to-br from-navy-100 to-teal-50 relative">
        {photo ? (
          <img
            src={photo}
            alt={marina.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-navy-300 text-4xl">
            &#9875;
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">
          {marina.name} &middot; {marina.city}, {marina.state}
        </p>
        <h3 className="font-semibold text-navy-800 mb-2">
          {slip.name} &middot; {slip.length_ft}ft
        </h3>

        <div className="flex gap-2 mb-3">
          {slip.has_power && (
            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">
              Power
            </span>
          )}
          {slip.has_water && (
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
              Water
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-navy-800">
              {formatPrice(slip.price_per_night)}
            </span>
            <span className="text-xs text-gray-500">/night</span>
            {slip.price_per_week && (
              <p className="text-xs text-gray-500">
                {formatPrice(slip.price_per_week)}/week
              </p>
            )}
          </div>
          <Link
            href={`/slips/${slip.id}${query}`}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
}
