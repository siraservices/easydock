import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-navy-800 mb-4">
          Find Your Perfect Slip
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          EasyDock connects boat owners with marina owners for hassle-free dock
          reservations. Browse marinas, compare slips, and book online.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/search"
            className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
          >
            Browse Marinas
          </Link>
          <Link
            href="/signup"
            className="border-2 border-navy-700 text-navy-700 px-8 py-3 rounded-lg font-semibold hover:bg-navy-50 transition-colors"
          >
            List Your Marina
          </Link>
        </div>
      </div>

      {/* Progress status card */}
      <div className="mt-16 bg-white rounded-xl shadow-sm border p-8 max-w-xl mx-auto">
        <h2 className="text-lg font-semibold text-navy-800 mb-3">
          Build Progress
        </h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="text-teal-600">&#10003;</span> Database schema with
            profiles, marinas, slips, bookings
          </li>
          <li className="flex items-center gap-2">
            <span className="text-teal-600">&#10003;</span> Next.js + TypeScript
            + Tailwind CSS scaffold
          </li>
          <li className="flex items-center gap-2">
            <span className="text-teal-600">&#10003;</span> Authentication with
            role selection
          </li>
          <li className="flex items-center gap-2">
            <span className="text-teal-600">&#10003;</span> Marina owner
            dashboard &amp; slip management
          </li>
          <li className="flex items-center gap-2">
            <span className="text-teal-600">&#10003;</span> Search, booking
            &amp; Stripe Checkout integration
          </li>
        </ul>
      </div>
    </div>
  );
}
