import { create } from 'zustand';
import { Marina, Slip } from '../types';

interface SearchFilters {
  location?: string;
  city?: string;
  state?: string;
  startDate?: string;
  endDate?: string;
  minLength?: number;
  maxLength?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  powerAvailable?: boolean;
  waterAvailable?: boolean;
}

interface SearchState {
  filters: SearchFilters;
  results: Array<{ marina: Marina; slip: Slip }>;
  loading: boolean;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setResults: (results: Array<{ marina: Marina; slip: Slip }>) => void;
  setLoading: (loading: boolean) => void;
  resetFilters: () => void;
}

const initialFilters: SearchFilters = {};

export const useSearchStore = create<SearchState>((set) => ({
  filters: initialFilters,
  results: [],
  loading: false,

  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),

  setResults: (results) => set({ results }),
  setLoading: (loading) => set({ loading }),

  resetFilters: () => set({ filters: initialFilters, results: [] }),
}));
