import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="text-8xl font-bold text-teal-600 mb-4">404</div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">
        Page not found
      </h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
        >
          Go home
        </Link>
        <Link
          href="/search"
          className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-semibold hover:border-gray-400 transition-colors"
        >
          Find slips
        </Link>
      </div>
    </div>
  );
}
