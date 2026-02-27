"use client";

import { DEFAULT_CITY } from "@/lib/constants";

export interface SearchFilters {
  city: string;
  checkIn: string;
  checkOut: string;
  boatLength: string;
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
    <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            City
          </label>
          <input
            type="text"
            value={filters.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder={DEFAULT_CITY}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={onSearch}
            className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors text-sm"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
