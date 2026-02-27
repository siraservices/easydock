"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Slip = Database["public"]["Tables"]["slips"]["Row"];

interface SlipFormModalProps {
  marinaId: string;
  slip?: Slip;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function SlipFormModal({
  marinaId,
  slip,
  isOpen,
  onClose,
  onSaved,
}: SlipFormModalProps) {
  const supabase = useMemo(() => createClient(), []);

  const [name, setName] = useState(slip?.name || "");
  const [lengthFt, setLengthFt] = useState(slip?.length_ft?.toString() || "");
  const [widthFt, setWidthFt] = useState(slip?.width_ft?.toString() || "");
  const [depthFt, setDepthFt] = useState(slip?.depth_ft?.toString() || "");
  const [hasPower, setHasPower] = useState(slip?.has_power || false);
  const [hasWater, setHasWater] = useState(slip?.has_water || false);
  const [pricePerNight, setPricePerNight] = useState(
    slip?.price_per_night?.toString() || ""
  );
  const [pricePerWeek, setPricePerWeek] = useState(
    slip?.price_per_week?.toString() || ""
  );
  const [pricePerMonth, setPricePerMonth] = useState(
    slip?.price_per_month?.toString() || ""
  );
  const [notes, setNotes] = useState(slip?.notes || "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const slipData = {
      marina_id: marinaId,
      name,
      length_ft: parseFloat(lengthFt),
      width_ft: widthFt ? parseFloat(widthFt) : null,
      depth_ft: depthFt ? parseFloat(depthFt) : null,
      has_power: hasPower,
      has_water: hasWater,
      price_per_night: parseFloat(pricePerNight),
      price_per_week: pricePerWeek ? parseFloat(pricePerWeek) : null,
      price_per_month: pricePerMonth ? parseFloat(pricePerMonth) : null,
      notes: notes || null,
    };

    try {
      if (slip) {
        const { error: updateError } = await supabase
          .from("slips")
          .update(slipData as never)
          .eq("id", slip.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("slips")
          .insert(slipData as never);
        if (insertError) throw insertError;
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save slip.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-navy-800">
            {slip ? "Edit Slip" : "Add Slip"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slip Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. "Slip A-12"'
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length (ft) *
              </label>
              <input
                type="number"
                required
                step="0.1"
                value={lengthFt}
                onChange={(e) => setLengthFt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (ft)
              </label>
              <input
                type="number"
                step="0.1"
                value={widthFt}
                onChange={(e) => setWidthFt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Depth (ft)
              </label>
              <input
                type="number"
                step="0.1"
                value={depthFt}
                onChange={(e) => setDepthFt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPower}
                onChange={(e) => setHasPower(e.target.checked)}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">Shore Power</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasWater}
                onChange={(e) => setHasWater(e.target.checked)}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">Water Hookup</span>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                $/Night *
              </label>
              <input
                type="number"
                required
                step="0.01"
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                $/Week
              </label>
              <input
                type="number"
                step="0.01"
                value={pricePerWeek}
                onChange={(e) => setPricePerWeek(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                $/Month
              </label>
              <input
                type="number"
                step="0.01"
                value={pricePerMonth}
                onChange={(e) => setPricePerMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : slip ? "Update" : "Add Slip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
