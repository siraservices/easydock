import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About - EasyDock',
  description: "Learn about EasyDock — who we are, why we built it, and what we're creating for South Florida boaters.",
  openGraph: {
    title: 'About EasyDock',
    description: "Learn about EasyDock — who we are, why we built it, and what we're creating for South Florida boaters.",
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About EasyDock',
    description: "Learn about EasyDock — who we are, why we built it, and what we're creating for South Florida boaters.",
  },
};

const TEAM = [
  {
    name: 'Julio',
    role: 'Co-Founder & CEO',
    bio: 'Boat owner turned entrepreneur. Spent years on marina waitlists and decided someone had to fix it.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div
        className="py-24 px-6 text-center"
        style={{
          background: 'linear-gradient(135deg, #0F2445 0%, #1B3A6B 60%, #2A4F8A 100%)',
        }}
      >
        <p className="text-teal-400 text-sm font-semibold tracking-widest uppercase mb-4">Our Story</p>
        <h1 className="text-4xl font-bold text-white mb-4">About EasyDock</h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto">
          We&apos;re fixing one of boating&apos;s most frustrating problems: finding a marina slip that&apos;s actually available.
        </p>
      </div>

      {/* Why we exist */}
      <div className="bg-white">
        <div className="max-w-[720px] mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold text-navy-800 mb-6">Why EasyDock exists</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              South Florida has one of the most active boating communities in the world — and one of the most broken marina systems. Waitlists stretch 3 to 6 years at the most popular marinas. Pricing is opaque. Booking requires phone tag with a harbormaster who may or may not call you back.
            </p>
            <p>
              We built EasyDock because we got tired of waiting. The marketplace model that works for hotels, vacation rentals, and parking should work for marina slips too. Transparent availability. Upfront pricing. Book in minutes, not years.
            </p>
            <p>
              We&apos;re starting in South Florida — Miami, Fort Lauderdale, the Keys — and expanding to wherever boat owners are getting shut out of the marinas they deserve access to.
            </p>
          </div>
        </div>
      </div>

      {/* What we're building */}
      <div className="bg-[#F7F9FB]">
        <div className="max-w-[720px] mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold text-navy-800 mb-6">What we&apos;re building</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: 'Real-time availability',
                body: 'Browse open slips at marinas across South Florida, with live availability and honest pricing.',
              },
              {
                title: 'Instant booking',
                body: 'Reserve your slip online — no phone calls, no waitlists, no surprises.',
              },
              {
                title: 'Marina dashboard',
                body: 'Marina operators get a simple tool to manage their slips, occupancy, and bookings.',
              },
              {
                title: 'Fair marketplace',
                body: "We take a small fee only when a booking happens. Marina owners keep most of what they earn.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="font-semibold text-navy-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="bg-white">
        <div className="max-w-[720px] mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold text-navy-800 mb-8">The team</h2>
          <div className="space-y-6">
            {TEAM.map((member) => (
              <div key={member.name} className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-navy-700 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {member.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{member.name}</p>
                  <p className="text-sm text-teal-600 mb-1">{member.role}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        className="py-16 px-6 text-center"
        style={{ background: 'linear-gradient(135deg, #0F2445 0%, #1B3A6B 100%)' }}
      >
        <h2 className="text-2xl font-bold text-white mb-3">Want to be first in line?</h2>
        <p className="text-white/70 text-sm mb-6 max-w-sm mx-auto">
          We&apos;re onboarding marinas and boat owners now. Get early access before we launch publicly.
        </p>
        <Link
          href="/signup"
          className="inline-block rounded-xl bg-teal-500 px-8 py-3 text-sm font-semibold text-white hover:bg-teal-400 transition-colors"
        >
          Get early access
        </Link>
      </div>
    </div>
  );
}
