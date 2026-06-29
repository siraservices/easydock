"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
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
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);

  const [nameQuery, setNameQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [results, setResults] = useState<UnclaimedMarina[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Pre-populate search from URL params (e.g. returning from signup flow)
  useEffect(() => {
    const prefillName = searchParams.get("name");
    if (prefillName) setNameQuery(prefillName);
  }, [searchParams]);

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
    if (!user) {
      // Redirect to signup with context — role pre-selected, return to /claim with marina name
      const returnTo = `/claim?name=${encodeURIComponent(marina.name)}`;
      router.push(`/signup?role=marina_owner&returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    if (profile && profile.role !== "marina_owner") {
      setToast({ message: "Only marina owner accounts can claim a marina.", type: "error" });
      return;
    }

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
        router.push(`/dashboard/marinas/${marina.id}?welcome=1`);
      }, 1500);
    } catch {
      setToast({ message: "Something went wrong. Please try again.", type: "error" });
    } finally {
      setClaimingId(null);
    }
  };

  const isAuthenticated = !authLoading && !!user;
  const isMarinaOwner = isAuthenticated && profile?.role === "marina_owner";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Value-prop header */}
      <div className="mb-8">
        {isMarinaOwner ? (
          <Link href="/dashboard" className="text-sm text-teal-700 hover:underline mb-4 inline-block">
            &larr; Back to Dashboard
          </Link>
        ) : (
          <Link href="/" className="text-sm text-teal-700 hover:underline mb-4 inline-block">
            &larr; Back to Home
          </Link>
        )}
        <h1 className="text-2xl font-bold text-navy-800 mt-2">Claim Your Marina</h1>
        <p className="text-gray-600 mt-2 text-sm leading-relaxed">
          241 South Florida marinas are already in our directory. Search below to find yours,
          then claim it for free — no monthly fees. Once claimed, you can add slip listings,
          set pricing, and start receiving bookings with online payment.
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
            href="/signup?role=marina_owner"
            className="inline-block bg-teal-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition-colors text-sm"
          >
            Sign up and add your marina
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
                {claimingId === marina.id
                  ? "Claiming..."
                  : user
                  ? "Claim"
                  : "Claim — Sign up free"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Not in list fallback */}
      {!searching && hasSearched && results.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t see your marina?{" "}
          <Link href="/signup?role=marina_owner" className="text-teal-700 hover:underline font-medium">
            Sign up and add it manually
          </Link>
        </div>
      )}

      {/* How it works — shown before first search */}
      {!hasSearched && (
        <div className="bg-gray-50 rounded-xl border p-6 mt-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">How it works</h2>
          <ol className="space-y-3">
            {[
              { step: "1", title: "Find your marina", desc: "Search our directory of 241 South Florida marinas by name or city." },
              { step: "2", title: "Claim it free", desc: "Create a marina owner account (takes 2 minutes) and link it to your listing." },
              { step: "3", title: "Start taking bookings", desc: "Add slip listings, set rates, and receive payments online via Stripe." },
            ].map(({ step, title, desc }) => (
              <li key={step} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {step}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{title}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

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
    </div>
  );
}
