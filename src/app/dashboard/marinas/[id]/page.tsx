"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import ProtectedRoute from "@/components/protected-route";
import LoadingSpinner from "@/components/ui/loading-spinner";
import StatusBadge from "@/components/ui/status-badge";
import SlipRow from "@/components/slip-row";
import SlipFormModal from "@/components/slip-form-modal";
import type { Database } from "@/types/database";

type Marina = Database["public"]["Tables"]["marinas"]["Row"];
type Slip = Database["public"]["Tables"]["slips"]["Row"];

export default function MarinaDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [marina, setMarina] = useState<Marina | null>(null);
  const [slips, setSlips] = useState<Slip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSlipForm, setShowSlipForm] = useState(false);
  const [editingSlip, setEditingSlip] = useState<Slip | undefined>();

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
