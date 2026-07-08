"use client";

import { SHORE_POWER_TYPES } from "@/lib/constants";

export interface SearchFilters {
  checkIn: string;
  checkOut: string;
  boatLength: string;
  boatBeam: string;
  boatDraft: string;
  shorePower: string;
  maxPrice: string;
}

interface SearchFiltersBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
}

export default function SearchFiltersBar({
  filters,
  onFiltersChange,
  onSearch,
}: SearchFiltersBarProps) {
  const today = new Date().toISOString().split("T")[0];

  function update(key: keyof SearchFilters, value: string) {
    onFiltersChange({ ...filters, [key]: value });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 mb-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Check-in
          </label>
          <input
            type="date"
            value={filters.checkIn}
            min={today}
            onChange={(e) => update("checkIn", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Check-out
          </label>
          <input
            type="date"
            value={filters.checkOut}
            min={filters.checkIn || today}
            onChange={(e) => update("checkOut", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Boat Length (ft)
          </label>
          <input
            type="number"
            value={filters.boatLength}
            onChange={(e) => update("boatLength", e.target.value)}
            placeholder="Any"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Boat Beam (ft)
          </label>
          <input
            type="number"
            value={filters.boatBeam}
            onChange={(e) => update("boatBeam", e.target.value)}
            placeholder="Any"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Draft (ft)
          </label>
          <input
            type="number"
            value={filters.boatDraft}
            onChange={(e) => update("boatDraft", e.target.value)}
            placeholder="Any"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Max Price/Night ($)
          </label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => update("maxPrice", e.target.value)}
            placeholder="Any"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Shore Power
          </label>
          <select
            value={filters.shorePower}
            onChange={(e) => update("shorePower", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
          >
            <option value="">Any</option>
            {SHORE_POWER_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3">
        <button
          onClick={onSearch}
          className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors text-sm"
        >
          Search
        </button>
      </div>
    </div>
  );
}
