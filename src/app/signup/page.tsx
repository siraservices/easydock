"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function SignUpPage() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"boat_owner" | "marina_owner" | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!role) {
      setError("Please select whether you are a boat owner or marina owner.");
      return;
    }

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setIsSubmitting(true);

    const result = await signUp(email, password, fullName, role, {
      companyName: role === "marina_owner" ? companyName : undefined,
      phone: phone || undefined,
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    if (result.needsConfirmation) {
      setNeedsConfirmation(true);
      setIsSubmitting(false);
      return;
    }

    router.push(role === "marina_owner" ? "/dashboard" : "/search");
  }

  if (needsConfirmation) {
    return (
      <div className="max-w-lg mx-auto px-6 py-16">
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="text-teal-600 text-5xl mb-4">&#9993;</div>
          <h1 className="text-2xl font-bold text-navy-800 mb-3">
            Check your email
          </h1>
          <p className="text-gray-600 mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click the
            link in the email to activate your account.
          </p>
          <Link
            href="/login"
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <div className="bg-white rounded-xl shadow-sm border p-8">
        <h1 className="text-2xl font-bold text-navy-800 mb-2">
          Create your account
        </h1>
        <p className="text-gray-600 mb-6">
          Join EasyDock to book slips or list your marina.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role selector cards */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("boat_owner")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  role === "boat_owner"
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                {/* Boat icon */}
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2m0 0l4 7H8l4-7zm-8 9h16l-2 5H6l-2-5zm3 5v2m10-2v2"
                  />
                </svg>
                <span className="font-semibold text-sm">Boat Owner</span>
                <span className="text-xs text-gray-500">
                  Find &amp; book slips
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole("marina_owner")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  role === "marina_owner"
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                {/* Anchor icon */}
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8a2 2 0 100-4 2 2 0 000 4zm0 0v12m0 0c-4 0-7-2.5-7-6h3m4 6c4 0 7-2.5 7-6h-3"
                  />
                </svg>
                <span className="font-semibold text-sm">Marina Owner</span>
                <span className="text-xs text-gray-500">
                  List your docks
                </span>
              </button>
            </div>
          </div>

          {/* Full name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="John Smith"
            />
          </div>

          {/* Company name (marina owners only) */}
          {role === "marina_owner" && (
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Company / Marina Name
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Sunrise Harbor Marina"
              />
            </div>
          )}

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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="At least 6 characters"
            />
          </div>

          {/* Phone (optional) */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
