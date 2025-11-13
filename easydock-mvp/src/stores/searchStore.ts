import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { SearchFilters, Marina, Slip } from '../types';

interface SearchResult {
  marina: Marina;
  slip: Slip;
  available: boolean;
}

interface SearchState {
  filters: SearchFilters;
  results: SearchResult[];
  loading: boolean;
  setFilters: (filters: Partial<SearchFilters>) => void;
  search: () => Promise<void>;
  clearFilters: () => void;
}

const defaultFilters: SearchFilters = {};

export const useSearchStore = create<SearchState>((set, get) => ({
  filters: defaultFilters,
  results: [],
  loading: false,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearFilters: () => {
    set({ filters: defaultFilters, results: [] });
  },

  search: async () => {
    set({ loading: true });
    const { filters } = get();

    try {
      // Build query for marinas
      let marinaQuery = supabase
        .from('marinas')
        .select('*');

      if (filters.location) {
        marinaQuery = marinaQuery.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%,address.ilike.%${filters.location}%`);
      }

      const { data: marinas, error: marinaError } = await marinaQuery;
      if (marinaError) throw marinaError;

      if (!marinas || marinas.length === 0) {
        set({ results: [], loading: false });
        return;
      }

      const marinaIds = marinas.map((m) => m.id);

      // Build query for slips
      let slipQuery = supabase
        .from('slips')
        .select('*')
        .in('marina_id', marinaIds)
        .eq('is_active', true);

      if (filters.min_length) {
        slipQuery = slipQuery.gte('length', filters.min_length);
      }
      if (filters.max_length) {
        slipQuery = slipQuery.lte('length', filters.max_length);
      }
      if (filters.min_width) {
        slipQuery = slipQuery.gte('width', filters.min_width);
      }
      if (filters.max_width) {
        slipQuery = slipQuery.lte('width', filters.max_width);
      }
      if (filters.min_draft) {
        slipQuery = slipQuery.gte('draft', filters.min_draft);
      }
      if (filters.max_draft) {
        slipQuery = slipQuery.lte('draft', filters.max_draft);
      }
      if (filters.power_required) {
        slipQuery = slipQuery.eq('power_available', true);
      }
      if (filters.water_required) {
        slipQuery = slipQuery.eq('water_available', true);
      }

      const { data: slips, error: slipError } = await slipQuery;
      if (slipError) throw slipError;

      if (!slips || slips.length === 0) {
        set({ results: [], loading: false });
        return;
      }

      // Check availability for date range
      const results: SearchResult[] = [];
      const marinaMap = new Map(marinas.map((m) => [m.id, m]));

      for (const slip of slips) {
        const marina = marinaMap.get(slip.marina_id);
        if (!marina) continue;

        // Check price filters
        if (filters.min_price && slip.daily_rate < filters.min_price) continue;
        if (filters.max_price && slip.daily_rate > filters.max_price) continue;

        // Check availability if dates are provided
        let available = true;
        if (filters.start_date && filters.end_date) {
          const { data: availability } = await supabase
            .from('availability')
            .select('*')
            .eq('slip_id', slip.id)
            .gte('date', filters.start_date)
            .lte('date', filters.end_date)
            .eq('is_available', false);

          if (availability && availability.length > 0) {
            available = false;
          }

          // Also check for existing bookings
          const { data: bookings } = await supabase
            .from('bookings')
            .select('*')
            .eq('slip_id', slip.id)
            .in('status', ['pending', 'approved'])
            .or(`and(start_date.lte.${filters.end_date},end_date.gte.${filters.start_date})`);

          if (bookings && bookings.length > 0) {
            available = false;
          }
        }

        results.push({
          marina,
          slip,
          available,
        });
      }

      set({ results, loading: false });
    } catch (error) {
      console.error('Error searching:', error);
      set({ loading: false });
    }
  },
}));
