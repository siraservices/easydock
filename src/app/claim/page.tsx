"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/protected-route";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface UnclaimedMarina {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string | null;
  phone: string | null;
  website: string | null;
}

export default function ClaimPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ClaimContent />
    </Suspense>
  );
}

function ClaimContent() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [nameQuery, setNameQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [results, setResults] = useState<UnclaimedMarina[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameQuery.trim() && !cityQuery.trim()) return;

    setSearching(true);
    setHasSearched(true);

    try {
      let query = supabase
        .from("marinas")
        .select("id, name, address, city, state, zip, phone, website")
        .is("owner_id", null)
        .order("name")
        .limit(30);

      if (nameQuery.trim()) {
        query = query.ilike("name", `%${nameQuery.trim()}%`);
      }
      if (cityQuery.trim()) {
        query = query.ilike("city", `%${cityQuery.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setResults((data as UnclaimedMarina[]) ?? []);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleClaim = async (marina: UnclaimedMarina) => {
    if (!user) return;
    setClaimingId(marina.id);

    try {
      const res = await fetch("/api/marinas/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marinaId: marina.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ message: data.error ?? "Failed to claim marina", type: "error" });
        return;
      }

      setToast({ message: `${marina.name} claimed! Complete your setup in the dashboard.`, type: "success" });
      setTimeout(() => {
        router.push(`/dashboard/marinas/${marina.id}`);
      }, 1500);
    } catch {
      setToast({ message: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["marina_owner"]}>
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-teal-700 hover:underline mb-4 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-navy-800 mt-2">Claim Your Marina</h1>
          <p className="text-gray-600 mt-2 text-sm">
            Search for your marina below. Once claimed, you can add slips, set pricing, and start receiving bookings.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Marina name
              </label>
              <input
                id="name"
                type="text"
                value={nameQuery}
                onChange={(e) => setNameQuery(e.target.value)}
                placeholder="e.g. Bradford Marine"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                id="city"
                type="text"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder="e.g. Fort Lauderdale"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={searching || (!nameQuery.trim() && !cityQuery.trim())}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors text-sm disabled:opacity-60"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Results */}
        {searching && <LoadingSpinner message="Searching marinas..." />}

        {!searching && hasSearched && results.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border shadow-sm">
            <p className="text-gray-700 font-medium mb-1">No unclaimed marinas found</p>
            <p className="text-sm text-gray-500 mb-4">
              Try a different name or city, or add your marina manually.
            </p>
            <Link
              href="/dashboard/marinas/new"
              className="inline-block bg-teal-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition-colors text-sm"
            >
              Add Marina Manually
            </Link>
          </div>
        )}

        {!searching && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">{results.length} marina{results.length !== 1 ? "s" : ""} found</p>
            {results.map((marina) => (
              <div
                key={marina.id}
                className="bg-white rounded-xl border shadow-sm p-5 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold text-navy-800 text-base truncate">{marina.name}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {marina.address}, {marina.city}, {marina.state}
                    {marina.zip ? ` ${marina.zip}` : ""}
                  </p>
                  {marina.phone && (
                    <p className="text-sm text-gray-500 mt-0.5">{marina.phone}</p>
                  )}
                  {marina.website && (
                    <p className="text-sm text-gray-400 mt-0.5 truncate">{marina.website}</p>
                  )}
                </div>
                <button
                  onClick={() => handleClaim(marina)}
                  disabled={claimingId === marina.id}
                  className="shrink-0 bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors text-sm disabled:opacity-60 whitespace-nowrap"
                >
                  {claimingId === marina.id ? "Claiming..." : "Claim"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Not in list fallback */}
        {!searching && hasSearched && results.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t see your marina?{" "}
            <Link href="/dashboard/marinas/new" className="text-teal-700 hover:underline font-medium">
              Add it manually
            </Link>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold ${
            toast.type === "success" ? "bg-teal-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </ProtectedRoute>
  );
}
