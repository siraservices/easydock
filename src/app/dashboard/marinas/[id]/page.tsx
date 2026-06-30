"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/protected-route";
import LoadingSpinner from "@/components/ui/loading-spinner";
import StatusBadge from "@/components/ui/status-badge";
import SlipRow from "@/components/slip-row";
import SlipFormModal from "@/components/slip-form-modal";
import AvailabilityCalendar from "@/components/availability-calendar";
import type { Database } from "@/types/database";

type Marina = Database["public"]["Tables"]["marinas"]["Row"];
type Slip = Database["public"]["Tables"]["slips"]["Row"];

type BookingStatus =
  | "pending"
  | "approved"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "declined";

interface MarinaBooking {
  id: string;
  status: BookingStatus;
  check_in: string;
  check_out: string;
  total_price: number;
  vessel_name: string | null;
  vessel_length: number | null;
  vessel_type: string | null;
  special_requests: string | null;
  created_at: string;
  slips: { id: string; name: string } | null;
  profiles: { email: string; full_name: string | null } | null;
}

interface OnboardingChecklistProps {
  marina: Marina;
  slips: Slip[];
  onAddSlipClick: () => void;
}

function OnboardingChecklist({ marina, slips, onAddSlipClick }: OnboardingChecklistProps) {
  const [connectLoading, setConnectLoading] = useState(false);

  const handleConnectStripe = async () => {
    setConnectLoading(true);
    try {
      const res = await fetch("/api/connect/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marinaId: marina.id }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // silent — user can retry from the main dashboard
    } finally {
      setConnectLoading(false);
    }
  };

  const steps = [
    {
      done: slips.length > 0,
      label: "Add your first slip",
      detail: "Slips are what boat owners book — add at least one to start receiving reservations.",
      cta: (
        <button
          onClick={onAddSlipClick}
          className="text-xs font-semibold text-teal-700 hover:underline"
        >
          Add Slip →
        </button>
      ),
    },
    {
      done: marina.payouts_enabled,
      label: "Connect Stripe",
      detail: "Link your bank account to receive payouts when bookings are completed.",
      cta: (
        <button
          onClick={handleConnectStripe}
          disabled={connectLoading}
          className="text-xs font-semibold text-teal-700 hover:underline disabled:opacity-60"
        >
          {connectLoading ? "Redirecting…" : "Connect →"}
        </button>
      ),
    },
    {
      done: !!marina.description,
      label: "Add a description",
      detail: "Help boat owners understand what makes your marina special.",
      cta: (
        <Link href={`/dashboard/marinas/${marina.id}/edit`} className="text-xs font-semibold text-teal-700 hover:underline">
          Edit →
        </Link>
      ),
    },
    {
      done: marina.photos.length > 0,
      label: "Add photos",
      detail: "Listings with photos get significantly more bookings.",
      cta: (
        <Link href={`/dashboard/marinas/${marina.id}/edit`} className="text-xs font-semibold text-teal-700 hover:underline">
          Edit →
        </Link>
      ),
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  if (completedCount === steps.length) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-navy-800">Getting Started</h2>
        <span className="text-sm text-gray-500">{completedCount}/{steps.length} complete</span>
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 rounded-lg px-3 py-2.5 ${step.done ? "" : "bg-gray-50"}`}
          >
            <span
              className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
                step.done ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {step.done ? "✓" : i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${step.done ? "text-gray-400 line-through" : "text-gray-800"}`}>
                {step.label}
              </p>
              {!step.done && (
                <p className="text-xs text-gray-500 mt-0.5">{step.detail}</p>
              )}
            </div>
            {!step.done && <div className="flex-shrink-0 mt-0.5">{step.cta}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

const ACTIVE_STATUSES: BookingStatus[] = ["pending", "approved", "confirmed"];

function nightCount(checkIn: string, checkOut: string) {
  const diff =
    new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.round(diff / 86400000);
}

function BookingsInbox({
  marinaId,
  refreshToken,
}: {
  marinaId: string;
  refreshToken: number;
}) {
  const [bookings, setBookings] = useState<MarinaBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [loading, setLoading] = useState(true);
  const [actionInFlight, setActionInFlight] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const qs = filter !== "all" ? `?status=${filter}` : "";
    const res = await fetch(`/api/marinas/${marinaId}/bookings${qs}`);
    if (res.ok) {
      const data = await res.json();
      setBookings(data.bookings ?? []);
      setTotal(data.total ?? 0);
    }
    setLoading(false);
  }, [marinaId, filter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, refreshToken]);

  async function handleAction(
    bookingId: string,
    action: "approve" | "deny" | "cancel",
    confirmMsg: string,
    nextStatus: BookingStatus
  ) {
    if (!confirm(confirmMsg)) return;
    setActionInFlight(bookingId + ":" + action);
    const res = await fetch(`/api/bookings/${bookingId}/${action}`, {
      method: "POST",
    });
    if (res.ok) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: nextStatus } : b))
      );
    }
    setActionInFlight(null);
  }

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="bg-white rounded-xl shadow-sm border mt-6">
      <div className="flex items-center justify-between p-5 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-navy-800">Bookings</h2>
          {pendingCount > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          <option value="all">All ({total})</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="declined">Declined</option>
        </select>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-400 text-sm">
          Loading bookings…
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-sm">
          {filter === "all"
            ? "No bookings yet. Once boat owners book your slips, they'll appear here."
            : `No ${filter} bookings.`}
        </div>
      ) : (
        <div className="divide-y">
          {bookings.map((booking) => {
            const nights = nightCount(booking.check_in, booking.check_out);
            const isPending = booking.status === "pending";
            const canCancel = !isPending && ACTIVE_STATUSES.includes(booking.status);
            const inFlight = actionInFlight?.startsWith(booking.id);
            return (
              <div key={booking.id} className="px-5 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={booking.status} />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {booking.profiles?.full_name || booking.profiles?.email || "Guest"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {booking.profiles?.email}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{booking.slips?.name ?? "Slip"}</span>
                    {" · "}
                    {new Date(booking.check_in).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    →{" "}
                    {new Date(booking.check_out).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {" · "}
                    {nights} night{nights !== 1 ? "s" : ""}
                  </div>
                  {booking.vessel_name && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      {booking.vessel_name}
                      {booking.vessel_length ? ` · ${booking.vessel_length}ft` : ""}
                      {booking.vessel_type ? ` · ${booking.vessel_type}` : ""}
                    </div>
                  )}
                  {booking.special_requests && (
                    <div className="text-xs text-gray-500 mt-1 italic">
                      &ldquo;{booking.special_requests}&rdquo;
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-base font-semibold text-gray-900">
                    ${booking.total_price.toFixed(2)}
                  </div>
                  {isPending && (
                    <div className="flex gap-2 mt-1 justify-end">
                      <button
                        onClick={() =>
                          handleAction(
                            booking.id,
                            "approve",
                            "Approve this booking? The boat owner will be notified.",
                            "approved"
                          )
                        }
                        disabled={!!inFlight}
                        className="text-xs font-semibold text-teal-700 hover:underline disabled:opacity-50"
                      >
                        {actionInFlight === booking.id + ":approve" ? "Approving…" : "Approve"}
                      </button>
                      <button
                        onClick={() =>
                          handleAction(
                            booking.id,
                            "deny",
                            "Decline this booking? The boat owner will be notified.",
                            "declined"
                          )
                        }
                        disabled={!!inFlight}
                        className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                      >
                        {actionInFlight === booking.id + ":deny" ? "Declining…" : "Decline"}
                      </button>
                    </div>
                  )}
                  {canCancel && (
                    <button
                      onClick={() =>
                        handleAction(
                          booking.id,
                          "cancel",
                          "Cancel this booking? The boat owner will be notified.",
                          "cancelled"
                        )
                      }
                      disabled={!!inFlight}
                      className="mt-1 text-xs text-red-600 hover:underline disabled:opacity-50"
                    >
                      {actionInFlight === booking.id + ":cancel" ? "Cancelling…" : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MarinaDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [marina, setMarina] = useState<Marina | null>(null);
  const [slips, setSlips] = useState<Slip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSlipForm, setShowSlipForm] = useState(false);
  const [editingSlip, setEditingSlip] = useState<Slip | undefined>();
  const [showWelcome, setShowWelcome] = useState(false);
  const [bookingsRefreshToken, setBookingsRefreshToken] = useState(0);

  useEffect(() => {
    if (searchParams.get("welcome") === "1") {
      setShowWelcome(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("welcome");
      const newPath = params.toString() ? `/dashboard/marinas/${id}?${params.toString()}` : `/dashboard/marinas/${id}`;
      router.replace(newPath);
    }
  }, [searchParams, id, router]);

  const fetchData = useCallback(async () => {
    const { data: marinaData } = (await supabase
      .from("marinas")
      .select("*")
      .eq("id", id)
      .single()) as unknown as { data: Marina | null };
    const { data: slipsData } = (await supabase
      .from("slips")
      .select("*")
      .eq("marina_id", id)
      .order("name")) as unknown as { data: Slip[] | null };

    if (marinaData) setMarina(marinaData);
    if (slipsData) setSlips(slipsData);
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleToggleAvailable(slipId: string, available: boolean) {
    await supabase
      .from("slips")
      .update({ is_available: available } as never)
      .eq("id", slipId);
    setSlips((prev) =>
      prev.map((s) => (s.id === slipId ? { ...s, is_available: available } : s))
    );
  }

  async function handleDeleteSlip(slipId: string) {
    if (!confirm("Delete this slip? This cannot be undone.")) return;
    await supabase.from("slips").delete().eq("id", slipId);
    setSlips((prev) => prev.filter((s) => s.id !== slipId));
  }

  function handleEditSlip(slip: Slip) {
    setEditingSlip(slip);
    setShowSlipForm(true);
  }

  function handleSlipSaved() {
    fetchData();
    setEditingSlip(undefined);
    setBookingsRefreshToken((t) => t + 1);
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["marina_owner"]}>
        <LoadingSpinner size="lg" message="Loading marina..." />
      </ProtectedRoute>
    );
  }

  if (!marina || marina.owner_id !== user?.id) {
    return (
      <ProtectedRoute allowedRoles={["marina_owner"]}>
        <div className="max-w-5xl mx-auto px-6 py-10 text-center">
          <p className="text-gray-600">Marina not found.</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["marina_owner"]}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Welcome banner — shown once after claiming */}
        {showWelcome && (
          <div className="mb-6 bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-teal-800">
                🎉 Marina claimed successfully!
              </p>
              <p className="text-sm text-teal-700 mt-0.5">
                Complete the steps below to start receiving bookings.
              </p>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="text-teal-600 hover:text-teal-800 text-lg leading-none flex-shrink-0 mt-0.5"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* Onboarding checklist — visible until all steps complete */}
        <OnboardingChecklist
          marina={marina}
          slips={slips}
          onAddSlipClick={() => {
            setEditingSlip(undefined);
            setShowSlipForm(true);
          }}
        />

        {/* Marina header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-navy-800">
                  {marina.name}
                </h1>
                <StatusBadge
                  status={marina.is_active ? "active" : "inactive"}
                />
              </div>
              <p className="text-gray-600">
                {marina.address}, {marina.city}, {marina.state} {marina.zip}
              </p>
            </div>
            <Link
              href={`/dashboard/marinas/${id}/edit`}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Edit Marina
            </Link>
          </div>

          {marina.description && (
            <p className="text-gray-600 text-sm mb-3">{marina.description}</p>
          )}

          {marina.amenities.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {marina.amenities.map((a) => (
                <span
                  key={a}
                  className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs"
                >
                  {a}
                </span>
              ))}
            </div>
          )}

          {marina.photos.length > 0 && (
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {marina.photos.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt={marina.name}
                  className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
                />
              ))}
            </div>
          )}
        </div>

        {/* Slips section */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="text-lg font-semibold text-navy-800">
              Slips ({slips.length})
            </h2>
            <button
              onClick={() => {
                setEditingSlip(undefined);
                setShowSlipForm(true);
              }}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
            >
              + Add Slip
            </button>
          </div>

          {slips.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No slips yet. Add your first slip to start receiving bookings.</p>
            </div>
          ) : (
            <div>
              {slips.map((slip) => (
                <SlipRow
                  key={slip.id}
                  slip={slip}
                  onEdit={handleEditSlip}
                  onDelete={handleDeleteSlip}
                  onToggleAvailable={handleToggleAvailable}
                />
              ))}
            </div>
          )}
        </div>

        {/* Slip availability calendar */}
        {slips.length > 0 && (
          <details open className="bg-white rounded-xl shadow-sm border mt-6">
            <summary className="flex items-center justify-between p-5 border-b cursor-pointer list-none">
              <h2 className="text-lg font-semibold text-navy-800">
                Slip Availability
              </h2>
              <span className="text-gray-400 text-sm select-none">&#9660;</span>
            </summary>
            <AvailabilityCalendar
              slips={slips.map((s) => ({ id: s.id, name: s.name }))}
              marinaId={id}
            />
          </details>
        )}

        {/* Bookings inbox */}
        <BookingsInbox
          marinaId={id}
          refreshToken={bookingsRefreshToken}
        />

        {/* Slip form modal */}
        <SlipFormModal
          marinaId={id}
          slip={editingSlip}
          isOpen={showSlipForm}
          onClose={() => {
            setShowSlipForm(false);
            setEditingSlip(undefined);
          }}
          onSaved={handleSlipSaved}
        />
      </div>
    </ProtectedRoute>
  );
}
