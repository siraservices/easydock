"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [router]);

  async function handleSignOut() {
    setMobileOpen(false);
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out failed:", err);
    }
    router.push("/");
    router.refresh();
  }

  const navLinks = [
    { href: "/search", label: "Browse Marinas" },
    { href: "/pricing", label: "Pricing" },
    { href: "/calculator", label: "Calculator" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="bg-navy-800 text-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Image src="/logo.png" alt="EasyDock" width={140} height={25} priority />
        </Link>

        {/* Desktop center links */}
        <div className="hidden md:flex items-center space-x-6 text-sm absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-navy-200 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth links */}
        <div className="hidden md:flex items-center space-x-4 text-sm">
          {loading ? (
            <div className="h-5 w-24" />
          ) : !user ? (
            <>
              <Link
                href="/login"
                className="border border-navy-400 text-navy-200 hover:text-white hover:border-white px-4 py-2 rounded-lg transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="bg-teal-500 hover:bg-teal-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </>
          ) : profile?.role === "marina_owner" ? (
            <>
              <Link href="/dashboard" className="text-navy-200 hover:text-white transition-colors">
                Dashboard
              </Link>
              <button onClick={handleSignOut} className="text-navy-200 hover:text-white transition-colors cursor-pointer">
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/bookings" className="text-navy-200 hover:text-white transition-colors">
                My Bookings
              </Link>
              <Link href="/account" className="text-navy-200 hover:text-white transition-colors">
                Account
              </Link>
              <button onClick={handleSignOut} className="text-navy-200 hover:text-white transition-colors cursor-pointer">
                Log Out
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-navy-200 hover:text-white transition-colors"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="md:hidden mt-3 pb-3 border-t border-navy-700 pt-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm text-navy-200 hover:text-white hover:bg-navy-700 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-navy-700 mt-3 space-y-1">
            {loading ? null : !user ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm text-navy-200 hover:text-white hover:bg-navy-700 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors font-semibold"
                >
                  Sign Up
                </Link>
              </>
            ) : profile?.role === "marina_owner" ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm text-navy-200 hover:text-white hover:bg-navy-700 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2.5 text-sm text-navy-200 hover:text-white hover:bg-navy-700 rounded-lg transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/bookings"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm text-navy-200 hover:text-white hover:bg-navy-700 rounded-lg transition-colors"
                >
                  My Bookings
                </Link>
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm text-navy-200 hover:text-white hover:bg-navy-700 rounded-lg transition-colors"
                >
                  Account
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2.5 text-sm text-navy-200 hover:text-white hover:bg-navy-700 rounded-lg transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
