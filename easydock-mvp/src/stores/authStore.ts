import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, UserRole } from '../types';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, role: UserRole, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        set({ session, user: session.user, loading: false });
        await get().loadProfile();
      } else {
        set({ session: null, user: null, profile: null, loading: false, initialized: true });
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ session, user: session?.user ?? null });
        if (session) {
          await get().loadProfile();
        } else {
          set({ profile: null });
        }
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ loading: false, initialized: true });
    }
  },

  loadProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      set({ profile: data, initialized: true });
    } catch (error) {
      console.error('Error loading profile:', error);
      set({ initialized: true });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      set({ loading: false });
      return { error };
    }

    await get().loadProfile();
    set({ loading: false });
    return { error: null };
  },

  signUp: async (email: string, password: string, role: UserRole, fullName?: string) => {
    set({ loading: true });
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      set({ loading: false });
      return { error: signUpError };
    }

    const { user } = get();
    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          role,
          full_name: fullName || null,
        });

      if (profileError) {
        set({ loading: false });
        return { error: profileError };
      }
    }

    await get().loadProfile();
    set({ loading: false });
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const { user } = get();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      return;
    }

    await get().loadProfile();
  },
}));
