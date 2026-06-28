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
import { formatPrice, formatDate } from "@/lib/utils/format";

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

interface BookingWithDetails {
  id: string;
  status: string;
  check_in: string;
  check_out: string;
  total_price: number;
  vessel_name: string | null;
  created_at: string;
  slips: { name: string } | null;
  marinas: { name: string; city: string; state: string } | null;
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
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"marinas" | "bookings">("marinas");
  const [bookingSubTab, setBookingSubTab] = useState<"pending" | "active" | "past">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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
    try {
      const query = supabase
        .from("marinas")
        .select(
          "id, name, city, state, is_active, photos, slips(count), stripe_account_id, stripe_onboarding_complete, payouts_enabled"
        )
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      const { data } = await Promise.race([
        query as unknown as Promise<{ data: MarinaWithSlipCount[] | null }>,
        new Promise<{ data: null }>((resolve) =>
          setTimeout(() => resolve({ data: null }), 5000)
        ),
      ]);

      setMarinas((data as unknown as MarinaWithSlipCount[]) || []);
    } catch {
      setMarinas([]);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  const fetchBookings = useCallback(async () => {
    if (!user || marinas.length === 0) return;
    setBookingsLoading(true);
    try {
      const marinaIds = marinas.map((m) => m.id);
      const { data } = await supabase
        .from("bookings")
        .select("*, slips(name), marinas(name, city, state)")
        .in("marina_id", marinaIds)
        .order("created_at", { ascending: false });

      setBookings((data as unknown as BookingWithDetails[]) || []);
    } catch {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, [user, supabase, marinas]);

  useEffect(() => {
    fetchMarinas();
  }, [fetchMarinas]);

  useEffect(() => {
    if (activeTab === "bookings" && marinas.length > 0) {
      fetchBookings();
    }
  }, [activeTab, marinas, fetchBookings]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const activeBookings = bookings.filter((b) => ["approved", "confirmed"].includes(b.status));
  const pastBookings = bookings.filter((b) => ["completed", "cancelled", "declined"].includes(b.status));

  const handleApprove = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/approve`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to approve");
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "approved" } : b))
      );
      setToast({ message: "Booking approved", type: "success" });
    } catch {
      setToast({ message: "Failed to approve booking", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeny = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/deny`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to deny");
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "declined" } : b))
      );
      setToast({ message: "Booking declined", type: "success" });
    } catch {
      setToast({ message: "Failed to decline booking", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const currentSubTabBookings =
    bookingSubTab === "pending"
      ? pendingBookings
      : bookingSubTab === "active"
      ? activeBookings
      : pastBookings;

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
          {marinas.length > 0 && activeTab === "marinas" && (
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

        {/* Top-level tabs: Marinas | Bookings */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("marinas")}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "marinas"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Marinas
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "bookings"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Bookings
            {pendingBookings.length > 0 && (
              <span className="ml-2 bg-teal-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                {pendingBookings.length}
              </span>
            )}
          </button>
        </div>

        {/* Marinas tab */}
        {activeTab === "marinas" && (
          <>
            {loading ? (
              <LoadingSpinner size="lg" message="Loading your marinas..." />
            ) : marinas.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-lg font-semibold text-navy-800 mb-2">
                  You haven&apos;t listed a marina yet
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Already in our database? Claim your existing listing. Otherwise, add your marina from scratch.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/claim"
                    className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors text-sm"
                  >
                    Claim Existing Marina
                  </Link>
                  <Link
                    href="/dashboard/marinas/new"
                    className="inline-block border border-teal-600 text-teal-700 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors text-sm"
                  >
                    Add Marina Manually
                  </Link>
                </div>
              </div>
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
          </>
        )}

        {/* Bookings tab */}
        {activeTab === "bookings" && (
          <>
            {/* Sub-tabs */}
            <div className="flex gap-1 mb-5">
              {(["pending", "active", "past"] as const).map((tab) => {
                const count =
                  tab === "pending"
                    ? pendingBookings.length
                    : tab === "active"
                    ? activeBookings.length
                    : pastBookings.length;
                return (
                  <button
                    key={tab}
                    onClick={() => setBookingSubTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      bookingSubTab === tab
                        ? "bg-navy-800 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === "pending" && count > 0 && (
                      <span className="ml-1.5 bg-teal-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {bookingsLoading ? (
              <LoadingSpinner size="lg" message="Loading bookings..." />
            ) : currentSubTabBookings.length === 0 ? (
              <EmptyState
                title={
                  bookingSubTab === "pending"
                    ? "No pending bookings"
                    : bookingSubTab === "active"
                    ? "No active bookings"
                    : "No past bookings"
                }
                message={
                  bookingSubTab === "pending"
                    ? "No bookings yet — bookings will appear here when yacht owners reserve your slips"
                    : bookingSubTab === "active"
                    ? "Approved and confirmed bookings will appear here"
                    : "Completed, cancelled, and declined bookings will appear here"
                }
              />
            ) : (
              <div className="space-y-3">
                {currentSubTabBookings.map((booking) => {
                  const isActionLoading = actionLoading === booking.id;
                  return (
                    <div
                      key={booking.id}
                      className="bg-white rounded-xl shadow-sm border p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-navy-800">
                            {booking.slips?.name ?? "Slip"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.marinas?.name ?? ""} &middot;{" "}
                            {booking.marinas?.city ?? ""},{" "}
                            {booking.marinas?.state ?? ""}
                          </p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <span>
                          {formatDate(booking.check_in)} &rarr;{" "}
                          {formatDate(booking.check_out)}
                        </span>
                        <span className="font-semibold text-navy-800">
                          {formatPrice(booking.total_price)}
                        </span>
                        {booking.vessel_name && (
                          <span className="text-gray-500">
                            Vessel: {booking.vessel_name}
                          </span>
                        )}
                      </div>
                      {booking.status === "pending" && (
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => handleApprove(booking.id)}
                            disabled={isActionLoading}
                            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors disabled:opacity-60"
                          >
                            {isActionLoading ? "Processing..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleDeny(booking.id)}
                            disabled={isActionLoading}
                            className="border border-red-400 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-60"
                          >
                            {isActionLoading ? "Processing..." : "Deny"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
            toast.type === "success"
              ? "bg-teal-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </ProtectedRoute>
  );
}
