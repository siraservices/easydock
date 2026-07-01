"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="text-8xl font-bold text-red-400 mb-4">!</div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Something went wrong
      </h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        An unexpected error occurred. Please try again or return to the home page.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-semibold hover:border-gray-400 transition-colors"
        >
          Go home
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-gray-400">Error ID: {error.digest}</p>
      )}
    </div>
  );
}
