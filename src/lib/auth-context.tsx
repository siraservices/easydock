"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

interface SignUpResult {
  error: string | null;
  needsConfirmation?: boolean;
}

interface SignInResult {
  error: string | null;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: "boat_owner" | "marina_owner",
    options?: { companyName?: string; phone?: string; redirectTo?: string }
  ) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  async function fetchProfile(userId: string, retries = 3): Promise<Profile | null> {
    for (let i = 0; i < retries; i++) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) return data;

      if (error) {
        console.error(`Error fetching profile (attempt ${i + 1}/${retries}):`, error.message);
      }

      // Wait before retrying (200ms, 400ms, 800ms)
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, 200 * Math.pow(2, i)));
      }
    }
    return null;
  }

  useEffect(() => {
    // Safety timeout — if auth hangs (e.g. lock contention), show UI anyway
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        clearTimeout(timeout);
        if (session?.user) {
          setUser(session.user);
          const p = await fetchProfile(session.user.id);
          setProfile(p);
          // If profile is still null, the onAuthStateChange listener will retry
        }
        setLoading(false);
      })
      .catch(() => {
        clearTimeout(timeout);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const p = await fetchProfile(session.user.id);
        setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  async function signUp(
    email: string,
    password: string,
    fullName: string,
    role: "boat_owner" | "marina_owner",
    options?: { companyName?: string; phone?: string; redirectTo?: string }
  ): Promise<SignUpResult> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          ...(options?.companyName ? { company_name: options.companyName } : {}),
          ...(options?.phone ? { phone: options.phone } : {}),
        },
        ...(options?.redirectTo ? { emailRedirectTo: options.redirectTo } : {}),
      },
    });

    if (error) return { error: error.message };

    // Email confirmation required
    if (data.session === null && data.user) {
      return { error: null, needsConfirmation: true };
    }

    // Update optional profile fields not handled by the trigger
    if (data.user && (options?.companyName || options?.phone)) {
      const profileUpdate: ProfileUpdate = {};
      if (options.companyName) profileUpdate.company_name = options.companyName;
      if (options.phone) profileUpdate.phone = options.phone;

      await supabase
        .from("profiles")
        .update(profileUpdate as never)
        .eq("id", data.user.id);
    }

    return { error: null };
  }

  async function signIn(
    email: string,
    password: string
  ): Promise<SignInResult> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: error.message };

    if (data.user) {
      const p = await fetchProfile(data.user.id);
      return { error: null, role: p?.role };
    }

    return { error: null };
  }

  async function signOut(): Promise<void> {
    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("signOut timeout")), 3000)
        ),
      ]);
    } catch {
      // Force clear local state even if Supabase call hangs
    }
    setUser(null);
    setProfile(null);
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
