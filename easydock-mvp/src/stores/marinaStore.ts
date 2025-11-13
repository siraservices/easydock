import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Marina, Slip, Availability, Booking } from '../types';

interface MarinaState {
  marinas: Marina[];
  currentMarina: Marina | null;
  slips: Slip[];
  availability: Availability[];
  bookings: Booking[];
  loading: boolean;
  setMarinas: (marinas: Marina[]) => void;
  setCurrentMarina: (marina: Marina | null) => void;
  setSlips: (slips: Slip[]) => void;
  setAvailability: (availability: Availability[]) => void;
  setBookings: (bookings: Booking[]) => void;
  setLoading: (loading: boolean) => void;
  fetchMarinas: (ownerId?: string) => Promise<void>;
  fetchSlips: (marinaId: string) => Promise<void>;
  fetchAvailability: (slipId: string, startDate?: string, endDate?: string) => Promise<void>;
  fetchBookings: (marinaId?: string) => Promise<void>;
}

export const useMarinaStore = create<MarinaState>((set) => ({
  marinas: [],
  currentMarina: null,
  slips: [],
  availability: [],
  bookings: [],
  loading: false,

  setMarinas: (marinas) => set({ marinas }),
  setCurrentMarina: (marina) => set({ currentMarina: marina }),
  setSlips: (slips) => set({ slips }),
  setAvailability: (availability) => set({ availability }),
  setBookings: (bookings) => set({ bookings }),
  setLoading: (loading) => set({ loading }),

  fetchMarinas: async (ownerId) => {
    set({ loading: true });
    try {
      let query = supabase.from('marinas').select('*');
      if (ownerId) {
        query = query.eq('owner_id', ownerId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      set({ marinas: data || [] });
    } catch (error) {
      console.error('Error fetching marinas:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchSlips: async (marinaId) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('slips')
        .select('*')
        .eq('marina_id', marinaId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      set({ slips: data || [] });
    } catch (error) {
      console.error('Error fetching slips:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchAvailability: async (slipId, startDate, endDate) => {
    try {
      let query = supabase
        .from('availability')
        .select('*')
        .eq('slip_id', slipId);
      
      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }
      
      const { data, error } = await query.order('date', { ascending: true });
      if (error) throw error;
      set({ availability: data || [] });
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  },

  fetchBookings: async (marinaId) => {
    set({ loading: true });
    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (marinaId) {
        query = query.eq('marina_id', marinaId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      set({ bookings: data || [] });
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
