"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import type { Database } from "@/types/database";

type Marina = Database["public"]["Tables"]["marinas"]["Row"];

interface UnclaimedMarinaCardProps {
  marina: Marina;
  checkIn?: string;
  checkOut?: string;
  isHighlighted?: boolean;
  onHover?: (marinaId: string | null) => void;
}

interface FormState {
  name: string;
  email: string;
  checkIn: string;
  checkOut: string;
  vesselLengthFt: string;
  message: string;
}

export default function UnclaimedMarinaCard({
  marina,
  checkIn: defaultCheckIn = "",
  checkOut: defaultCheckOut = "",
  isHighlighted,
  onHover,
}: UnclaimedMarinaCardProps) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    checkIn: defaultCheckIn,
    checkOut: defaultCheckOut,
    vesselLengthFt: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Get fresh auth token
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError("Please sign in to request a spot.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/marina-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marinaId: marina.id,
          name: form.name,
          email: form.email,
          checkIn: form.checkIn || undefined,
          checkOut: form.checkOut || undefined,
          vesselLengthFt: form.vesselLengthFt ? parseInt(form.vesselLengthFt, 10) : undefined,
          message: form.message || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        data-marina-id={marina.id}
        onMouseEnter={() => onHover?.(marina.id)}
        onMouseLeave={() => onHover?.(null)}
        className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
          isHighlighted ? "ring-2 ring-teal-500 shadow-lg" : "border-dashed border-gray-300"
        }`}
      >
        {/* Placeholder header */}
        <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-50 relative flex items-center justify-center">
          <span className="text-gray-300 text-5xl">⚓</span>
          <span className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
            Coming soon
          </span>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-navy-800 text-sm leading-tight">{marina.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {marina.city}, {marina.state}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Not yet available on EasyDock
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 w-full bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Request a spot
          </button>
        </div>
      </div>

      {/* Request modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => { setShowModal(false); setSubmitted(false); setError(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
              aria-label="Close"
            >
              ×
            </button>

            {submitted ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">✅</div>
                <h2 className="text-lg font-semibold text-navy-800 mb-2">Request sent!</h2>
                <p className="text-gray-500 text-sm">
                  We&apos;ll reach out to <strong>{marina.name}</strong> and let you know
                  when they&apos;re ready to take bookings.
                </p>
                <button
                  onClick={() => { setShowModal(false); setSubmitted(false); }}
                  className="mt-4 text-sm text-teal-600 hover:underline"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-navy-800 mb-1">
                  Request a spot at {marina.name}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  This marina isn&apos;t on EasyDock yet. We&apos;ll notify them that
                  someone wants to book.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Your name *</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email || (user?.email ?? "")}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Check-in</label>
                      <input
                        type="date"
                        value={form.checkIn}
                        onChange={e => setForm(f => ({ ...f, checkIn: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Check-out</label>
                      <input
                        type="date"
                        value={form.checkOut}
                        onChange={e => setForm(f => ({ ...f, checkOut: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Vessel length (ft)</label>
                    <input
                      type="number"
                      min={10}
                      max={300}
                      value={form.vesselLengthFt}
                      onChange={e => setForm(f => ({ ...f, vesselLengthFt: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                      placeholder="e.g. 42"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Message (optional)</label>
                    <textarea
                      rows={2}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                      placeholder="Any special requirements?"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    {submitting ? "Sending…" : "Send request"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
