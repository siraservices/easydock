"use client";

import { Suspense, useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/protected-route";
import LoadingSpinner from "@/components/ui/loading-spinner";
import EmptyState from "@/components/ui/empty-state";
import StatusBadge from "@/components/ui/status-badge";

interface MarinaWithSlipCount {
  id: string;
  name: string;
  city: string;
  state: string;
  is_active: boolean;
  photos: string[];
  slips: { count: number }[];
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  payouts_enabled: boolean;
}

interface ConnectBannerProps {
  marina: MarinaWithSlipCount;
}

function ConnectBanner({ marina }: ConnectBannerProps) {
  const [loading, setLoading] = useState(false);

  const hasAccount = !!marina.stripe_account_id;
  const isConnected = marina.payouts_enabled;

  if (isConnected) return null;

  const handleConnectClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/connect/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marinaId: marina.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Connect onboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
      <p className="text-sm text-amber-800 mb-2">
        Complete Stripe setup to start receiving bookings
      </p>
      <button
        onClick={handleConnectClick}
        disabled={loading}
        className="bg-teal-600 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-teal-700 transition-colors text-sm disabled:opacity-60"
      >
        {loading ? "Redirecting..." : hasAccount ? "Continue Setup" : "Connect Stripe"}
      </button>
    </div>
  );
}

interface PayoutsButtonProps {
  marina: MarinaWithSlipCount;
}

function PayoutsButton({ marina }: PayoutsButtonProps) {
  const [loading, setLoading] = useState(false);

  if (!marina.payouts_enabled) return null;

  const handleViewPayouts = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/connect/login-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marinaId: marina.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Login link error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 flex items-center gap-3">
      <span className="inline-flex items-center gap-1.5 text-sm text-green-700">
        <span className="w-2 h-2 bg-green-500 rounded-full" />
        Stripe Connected
      </span>
      <button
        onClick={handleViewPayouts}
        disabled={loading}
        className="border border-teal-600 text-teal-700 px-4 py-1.5 rounded-lg font-semibold hover:bg-teal-50 transition-colors text-sm disabled:opacity-60"
      >
        {loading ? "Opening..." : "View Payouts"}
      </button>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [marinas, setMarinas] = useState<MarinaWithSlipCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [stripeStatus, setStripeStatus] = useState<string | null>(null);

  // Handle stripeStatus query param from Connect return URL
  useEffect(() => {
    const status = searchParams.get("stripeStatus");
    if (status) {
      setStripeStatus(status);
      // Remove query param from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("stripeStatus");
      const newPath = params.toString() ? `/dashboard?${params.toString()}` : "/dashboard";
      router.replace(newPath);
    }
  }, [searchParams, router]);

  const fetchMarinas = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("marinas")
      .select(
        "id, name, city, state, is_active, photos, slips(count), stripe_account_id, stripe_onboarding_complete, payouts_enabled"
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    setMarinas((data as unknown as MarinaWithSlipCount[]) || []);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchMarinas();
  }, [fetchMarinas]);

  return (
    <ProtectedRoute allowedRoles={["marina_owner"]}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-navy-800">Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">
              Manage your marinas and slips
            </p>
          </div>
          {marinas.length > 0 && (
            <Link
              href="/dashboard/marinas/new"
              className="bg-teal-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition-colors text-sm"
            >
              + Add Marina
            </Link>
          )}
        </div>

        {/* Stripe Connect return status banner */}
        {stripeStatus === "connected" && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
            Stripe account connected successfully!
          </div>
        )}
        {stripeStatus === "pending" && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
            Stripe setup is pending. We&apos;ll update your status automatically.
          </div>
        )}

        {loading ? (
          <LoadingSpinner size="lg" message="Loading your marinas..." />
        ) : marinas.length === 0 ? (
          <EmptyState
            title="You haven't listed a marina yet"
            message="Get started by adding your first marina. You can then add individual slips and start receiving bookings."
            action={{ label: "Add Your Marina", href: "/dashboard/marinas/new" }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {marinas.map((marina) => (
              <div key={marina.id} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
                <Link
                  href={`/dashboard/marinas/${marina.id}`}
                  className="block"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-navy-800 text-lg">
                      {marina.name}
                    </h3>
                    <StatusBadge
                      status={marina.is_active ? "active" : "inactive"}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {marina.city}, {marina.state}
                  </p>
                  <p className="text-sm text-gray-500">
                    {marina.slips?.[0]?.count || 0} slip
                    {(marina.slips?.[0]?.count || 0) !== 1 && "s"}
                  </p>
                </Link>
                <ConnectBanner marina={marina} />
                <PayoutsButton marina={marina} />
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
