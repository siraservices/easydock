"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out failed:", err);
    }
    // Always navigate even if signOut hangs or fails
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="bg-navy-800 text-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          EasyDock
        </Link>

        <div className="flex items-center space-x-4 text-sm">
          {loading ? (
            <div className="h-5 w-24" />
          ) : !user ? (
            <>
              <Link
                href="/search"
                className="text-navy-200 hover:text-white transition-colors"
              >
                Browse Marinas
              </Link>
              <Link
                href="/login"
                className="border border-navy-400 text-navy-200 hover:text-white hover:border-white px-4 py-2 rounded-lg transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </>
          ) : profile?.role === "marina_owner" ? (
            <>
              <Link
                href="/dashboard"
                className="text-navy-200 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="text-navy-200 hover:text-white transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/search"
                className="text-navy-200 hover:text-white transition-colors"
              >
                Search
              </Link>
              <Link
                href="/bookings"
                className="text-navy-200 hover:text-white transition-colors"
              >
                My Bookings
              </Link>
              <button
                onClick={handleSignOut}
                className="text-navy-200 hover:text-white transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
