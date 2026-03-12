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
    options?: { companyName?: string; phone?: string }
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

  async function fetchProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error.message);
      return null;
    }
    return data;
  }

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          const p = await fetchProfile(session.user.id);
          setProfile(p);
        }
        setLoading(false);
      })
      .catch(() => {
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

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  async function signUp(
    email: string,
    password: string,
    fullName: string,
    role: "boat_owner" | "marina_owner",
    options?: { companyName?: string; phone?: string }
  ): Promise<SignUpResult> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
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
    await supabase.auth.signOut();
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
