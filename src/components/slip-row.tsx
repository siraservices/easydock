"use client";

import { formatPrice } from "@/lib/utils/format";
import type { Database } from "@/types/database";

type Slip = Database["public"]["Tables"]["slips"]["Row"];

interface SlipRowProps {
  slip: Slip;
  onEdit: (slip: Slip) => void;
  onDelete: (slipId: string) => void;
  onToggleAvailable: (slipId: string, available: boolean) => void;
}

export default function SlipRow({
  slip,
  onEdit,
  onDelete,
  onToggleAvailable,
}: SlipRowProps) {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-gray-100 last:border-0 hover:bg-gray-50">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="min-w-0">
          <p className="font-medium text-navy-800 truncate">{slip.name}</p>
          <p className="text-sm text-gray-500">
            {slip.length_ft}ft
            {slip.width_ft && ` × ${slip.width_ft}ft`}
            {slip.depth_ft && ` · ${slip.depth_ft}ft depth`}
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          {slip.has_power && (
            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
              Power
            </span>
          )}
          {slip.has_water && (
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              Water
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <div className="text-right">
          <p className="font-semibold text-navy-800">
            {formatPrice(slip.price_per_night)}
            <span className="text-xs text-gray-500 font-normal">/night</span>
          </p>
          {slip.price_per_week && (
            <p className="text-xs text-gray-500">
              {formatPrice(slip.price_per_week)}/wk
            </p>
          )}
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={slip.is_available}
            onChange={() => onToggleAvailable(slip.id, !slip.is_available)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
        </label>

        <button
          onClick={() => onEdit(slip)}
          className="text-gray-400 hover:text-teal-600 transition-colors text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(slip.id)}
          className="text-gray-400 hover:text-red-600 transition-colors text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
