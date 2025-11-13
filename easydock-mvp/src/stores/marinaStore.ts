import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Marina, Slip, Availability, Booking } from '../types';

interface MarinaState {
  marinas: Marina[];
  currentMarina: Marina | null;
  slips: Slip[];
  availability: Availability[];
  bookings: Booking[];
  loading: boolean;
  fetchMarinas: (ownerId?: string) => Promise<void>;
  fetchMarina: (id: string) => Promise<void>;
  createMarina: (marina: Omit<Marina, 'id' | 'created_at' | 'updated_at'>) => Promise<{ data: Marina | null; error: any }>;
  updateMarina: (id: string, updates: Partial<Marina>) => Promise<{ error: any }>;
  fetchSlips: (marinaId: string) => Promise<void>;
  createSlip: (slip: Omit<Slip, 'id' | 'created_at' | 'updated_at'>) => Promise<{ data: Slip | null; error: any }>;
  updateSlip: (id: string, updates: Partial<Slip>) => Promise<{ error: any }>;
  deleteSlip: (id: string) => Promise<{ error: any }>;
  fetchAvailability: (slipId: string, startDate?: string, endDate?: string) => Promise<void>;
  setAvailability: (slipId: string, date: string, isAvailable: boolean, reason?: string) => Promise<{ error: any }>;
  fetchBookings: (marinaId?: string) => Promise<void>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<{ error: any }>;
}

export const useMarinaStore = create<MarinaState>((set) => ({
  marinas: [],
  currentMarina: null,
  slips: [],
  availability: [],
  bookings: [],
  loading: false,

  fetchMarinas: async (ownerId?: string) => {
    set({ loading: true });
    try {
      let query = supabase.from('marinas').select('*').order('created_at', { ascending: false });
      
      if (ownerId) {
        query = query.eq('owner_id', ownerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      set({ marinas: (data as Marina[]) || [], loading: false });
    } catch (error) {
      console.error('Error fetching marinas:', error);
      set({ loading: false });
    }
  },

  fetchMarina: async (id: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('marinas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      set({ currentMarina: data, loading: false });
    } catch (error) {
      console.error('Error fetching marina:', error);
      set({ loading: false });
    }
  },

  createMarina: async (marina) => {
    try {
      const { data, error } = await supabase
        .from('marinas')
        .insert(marina)
        .select()
        .single();

      if (error) return { data: null, error };
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  updateMarina: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('marinas')
        .update(updates)
        .eq('id', id);

      return { error };
    } catch (error) {
      return { error };
    }
  },

  fetchSlips: async (marinaId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('slips')
        .select('*')
        .eq('marina_id', marinaId)
        .order('slip_number', { ascending: true });

      if (error) throw error;
      set({ slips: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching slips:', error);
      set({ loading: false });
    }
  },

  createSlip: async (slip) => {
    try {
      const { data, error } = await supabase
        .from('slips')
        .insert(slip)
        .select()
        .single();

      if (error) return { data: null, error };
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  updateSlip: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('slips')
        .update(updates)
        .eq('id', id);

      return { error };
    } catch (error) {
      return { error };
    }
  },

  deleteSlip: async (id) => {
    try {
      const { error } = await supabase
        .from('slips')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      return { error };
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

  setAvailability: async (slipId, date, isAvailable, reason) => {
    try {
      const { error } = await supabase
        .from('availability')
        .upsert({
          slip_id: slipId,
          date,
          is_available: isAvailable,
          reason: reason || null,
        }, {
          onConflict: 'slip_id,date',
        });

      return { error };
    } catch (error) {
      return { error };
    }
  },

  fetchBookings: async (marinaId?: string) => {
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
      set({ bookings: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      set({ loading: false });
    }
  },

  updateBookingStatus: async (id, status) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id);

      return { error };
    } catch (error) {
      return { error };
    }
  },
}));
