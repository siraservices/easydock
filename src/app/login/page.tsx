"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function LoginPage() {
  const { user, profile, loading, signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      const dest = profile?.role === "marina_owner" ? "/dashboard" : "/search";
      router.push(dest);
      router.refresh();
    }
  }, [loading, user, profile, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await Promise.race([
        signIn(email, password),
        new Promise<{ error: string | null; role?: string }>((resolve) =>
          setTimeout(() => resolve({ error: null }), 5000)
        ),
      ]);

      if (result.error) {
        if (result.error === "Invalid login credentials") {
          setError("Invalid email or password. Please try again.");
        } else {
          setError(result.error);
        }
        setIsSubmitting(false);
        return;
      }

      // If signIn returned a role, use it; otherwise the useEffect redirect will handle it
      if (result.role) {
        const dest = result.role === "marina_owner" ? "/dashboard" : "/search";
        router.push(dest);
        router.refresh();
      }
    } catch {
      // If signIn throws or times out, the useEffect redirect handles navigation
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading..." />;
  }

  if (user) {
    return <LoadingSpinner size="lg" message="Redirecting..." />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-navy-900 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-teal-400 text-sm font-semibold tracking-widest uppercase mb-2">EasyDock</p>
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-navy-300 mt-2 text-sm">Log in to your EasyDock account.</p>
        </div>
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="sr-only">Login</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Your password"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-teal-500 hover:text-teal-600 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
