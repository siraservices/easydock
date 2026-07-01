"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { formatPrice } from "@/lib/utils/format";
import type { Database } from "@/types/database";

type Marina = Database["public"]["Tables"]["marinas"]["Row"];
type Slip = Database["public"]["Tables"]["slips"]["Row"];

export default function MarinaProfileClient() {
  const params = useParams();
  const id = params.id as string;
  const { profile } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [marina, setMarina] = useState<Marina | null>(null);
  const [slips, setSlips] = useState<Slip[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoIdx, setPhotoIdx] = useState(0);

  const isOwner = profile?.id === marina?.owner_id;

  useEffect(() => {
    async function fetchData() {
      const { data: marinaData } = await supabase
        .from("marinas")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (!marinaData) {
        setLoading(false);
        return;
      }

      setMarina(marinaData);

      const { data: slipData } = await supabase
        .from("slips")
        .select("*")
        .eq("marina_id", id)
        .eq("is_available", true)
        .order("price_per_night", { ascending: true });

      setSlips(slipData ?? []);
      setLoading(false);
    }

    fetchData();
  }, [id, supabase]);

  if (loading) return <LoadingSpinner size="lg" message="Loading marina…" />;

  if (!marina) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 text-center">
        <p className="text-gray-500 text-lg mb-4">Marina not found.</p>
        <Link href="/search" className="text-teal-600 hover:underline text-sm">
          &larr; Back to search
        </Link>
      </div>
    );
  }

  const photos = marina.photos ?? [];
  const unclaimed = !marina.owner_id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link href="/search" className="text-teal-600 hover:underline text-sm mb-6 inline-block">
        &larr; Back to search
      </Link>

      {/* Photo gallery */}
      {photos.length > 0 ? (
        <div className="relative rounded-xl overflow-hidden mb-6 bg-navy-100">
          <img
            src={photos[photoIdx]}
            alt={marina.name}
            className="w-full h-72 sm:h-96 object-cover"
          />
          {photos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPhotoIdx(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === photoIdx ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setPhotoIdx((p) => (p - 1 + photos.length) % photos.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-black/60"
              >
                &#8249;
              </button>
              <button
                onClick={() => setPhotoIdx((p) => (p + 1) % photos.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-black/60"
              >
                &#8250;
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="w-full h-56 rounded-xl bg-gradient-to-br from-navy-100 to-teal-50 flex items-center justify-center text-6xl mb-6">
          &#9875;
        </div>
      )}

      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-navy-800 mb-1">
            {marina.name}
          </h1>
          <p className="text-gray-500">
            {marina.address}, {marina.city}, {marina.state}
            {marina.zip ? ` ${marina.zip}` : ""}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {isOwner && (
            <Link
              href={`/dashboard/marinas/${marina.id}/edit`}
              className="px-4 py-2 rounded-lg border border-navy-200 text-navy-700 text-sm font-medium hover:bg-navy-50"
            >
              Edit marina
            </Link>
          )}
          {unclaimed && (
            <Link
              href={`/claim?name=${encodeURIComponent(marina.name)}`}
              className="px-4 py-2 rounded-lg bg-teal-500 text-white text-sm font-semibold hover:bg-teal-400"
            >
              Claim this marina
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Description + Amenities */}
        <div className="lg:col-span-2 space-y-6">
          {marina.description && (
            <div>
              <h2 className="text-lg font-semibold text-navy-800 mb-2">About</h2>
              <p className="text-gray-600 leading-relaxed">{marina.description}</p>
            </div>
          )}

          {marina.amenities && marina.amenities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-navy-800 mb-2">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {marina.amenities.map((a) => (
                  <span
                    key={a}
                    className="bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1 rounded-full text-sm"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Available slips */}
          <div>
            <h2 className="text-lg font-semibold text-navy-800 mb-3">
              Available Slips
              {slips.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({slips.length} {slips.length === 1 ? "slip" : "slips"})
                </span>
              )}
            </h2>

            {slips.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-gray-500 mb-2">No slips listed yet.</p>
                {unclaimed ? (
                  <p className="text-sm text-gray-400">
                    Own this marina?{" "}
                    <Link
                      href={`/claim?name=${encodeURIComponent(marina.name)}`}
                      className="text-teal-600 hover:underline"
                    >
                      Claim it
                    </Link>{" "}
                    to add slips.
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Check back soon.</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {slips.map((slip) => (
                  <SlipRow key={slip.id} slip={slip} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Contact card */}
        <div className="space-y-4">
          <div className="border rounded-xl p-5 bg-white shadow-sm">
            <h2 className="text-base font-semibold text-navy-800 mb-3">Contact</h2>
            <dl className="space-y-2 text-sm">
              {marina.phone && (
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-16 shrink-0">Phone</dt>
                  <dd>
                    <a href={`tel:${marina.phone}`} className="text-teal-600 hover:underline">
                      {marina.phone}
                    </a>
                  </dd>
                </div>
              )}
              {marina.email && (
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-16 shrink-0">Email</dt>
                  <dd>
                    <a href={`mailto:${marina.email}`} className="text-teal-600 hover:underline break-all">
                      {marina.email}
                    </a>
                  </dd>
                </div>
              )}
              {marina.website && (
                <div className="flex gap-2">
                  <dt className="text-gray-400 w-16 shrink-0">Website</dt>
                  <dd>
                    <a
                      href={marina.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:underline break-all"
                    >
                      {marina.website.replace(/^https?:\/\//, "")}
                    </a>
                  </dd>
                </div>
              )}
              {!marina.phone && !marina.email && !marina.website && (
                <p className="text-gray-400">No contact info available.</p>
              )}
            </dl>
          </div>

          {slips.length > 0 && (
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-sm text-teal-700">
              <p className="font-semibold mb-1">Ready to book?</p>
              <p>Select a slip below and reserve instantly — no waitlists.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SlipRowProps {
  slip: Slip;
}

function SlipRow({ slip }: SlipRowProps) {
  return (
    <div className="border rounded-xl p-4 bg-white hover:shadow-sm transition-shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <p className="font-semibold text-navy-800">{slip.name}</p>
        <p className="text-sm text-gray-500">
          {slip.length_ft}ft
          {slip.width_ft ? ` × ${slip.width_ft}ft` : ""}
          {slip.depth_ft ? ` · ${slip.depth_ft}ft depth` : ""}
        </p>
        <div className="flex gap-2 mt-1">
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
        {slip.notes && (
          <p className="text-xs text-gray-400 mt-1">{slip.notes}</p>
        )}
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="text-right">
          <span className="text-lg font-bold text-navy-800">
            {formatPrice(slip.price_per_night)}
          </span>
          <span className="text-xs text-gray-500">/night</span>
          {slip.price_per_week && (
            <p className="text-xs text-gray-500">{formatPrice(slip.price_per_week)}/wk</p>
          )}
        </div>
        <Link
          href={`/slips/${slip.id}`}
          className="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-400 transition-colors whitespace-nowrap"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
