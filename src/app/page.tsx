'use client';

import { useState } from 'react';
import LeadModal from '@/components/lead-modal';
import RegionCoverageSection from '@/components/region-coverage-section';
import RequestAreaCTA from '@/components/request-area-cta';

type Tab = 'yacht_owners' | 'marina_owners';

const TESTIMONIALS = [
  {
    quote:
      'I was on a 6-year waitlist at my local marina. EasyDock connected me with an open slip in two weeks.',
    name: 'Carlos M.',
    boat: '42ft Sportfish',
  },
  {
    quote:
      'Finally, transparent pricing and no more endless phone calls. Booked my slip online in minutes.',
    name: 'Jennifer R.',
    boat: '35ft Sailboat',
  },
  {
    quote:
      'As a marina operator, EasyDock fills our empty slips without the back-and-forth. Great platform.',
    name: 'David L.',
    boat: 'Marina Owner, Palm Beach',
  },
];

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('yacht_owners');

  return (
    <>
      <LeadModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[85vh] flex items-center text-white overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #0B2545 0%, #1B3A6B 50%, #13395e 100%)',
        }}
      >
        {/* Left-to-right overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(11,37,69,0.92) 0%, rgba(11,37,69,0.5) 55%, rgba(11,37,69,0.2) 100%)',
          }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center">
          {/* Left column — text & CTAs */}
          <div className="w-full lg:w-[45%] py-16 lg:py-24">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full bg-teal-500/20 border border-teal-400/40 px-4 py-1.5 mb-6">
              <span className="text-sm font-medium text-teal-300">
                South Florida&apos;s #1 marina marketplace
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
              Stop waiting 5 years for a boat slip.
            </h1>

            <p className="mt-5 text-base md:text-lg text-white/75 leading-relaxed max-w-md">
              We connect boat owners with available marina slips across South
              Florida. Browse, compare, and book&nbsp;&mdash; no waitlist, no
              phone&nbsp;tag.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => setModalOpen(true)}
                className="rounded-xl bg-teal-500 px-7 py-3 text-base font-semibold text-white shadow-lg hover:bg-teal-400 transition-colors"
              >
                Find an open slip
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="rounded-xl border border-white/30 px-7 py-3 text-base font-medium text-white hover:bg-white/10 transition-colors"
              >
                I own a marina
              </button>
            </div>

            {/* Value-prop checkmarks */}
            <div className="mt-8 flex flex-wrap gap-5">
              {['No waitlist', 'Transparent pricing', 'Book in minutes'].map(
                (label) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="shrink-0"
                    >
                      <path
                        d="M13.3 4L6 11.3 2.7 8"
                        stroke="#5DCAA5"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-sm text-white/70">{label}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Right column — image placeholder */}
          <div className="hidden lg:flex w-[55%] h-[500px] rounded-2xl overflow-hidden ml-auto items-center justify-center bg-[#1a4a7a]">
            <div className="text-center opacity-40">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <p className="text-white text-sm mt-2">
                Aerial marina photo goes here
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Region Coverage ────────────────────────────────────────────── */}
      <RegionCoverageSection />

      {/* ─── How It Works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: '#1B3A6B' }}>
              How EasyDock Works
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Our booking platform streamlines the marina reservation process for both
              yacht owners and marina operators.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button
                onClick={() => setActiveTab('yacht_owners')}
                className={`rounded-lg px-6 py-2 text-sm font-semibold transition-colors ${
                  activeTab === 'yacht_owners'
                    ? 'bg-navy-800 text-white shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === 'yacht_owners' ? { backgroundColor: '#0d2444' } : {}}
              >
                For Yacht Owners
              </button>
              <button
                onClick={() => setActiveTab('marina_owners')}
                className={`rounded-lg px-6 py-2 text-sm font-semibold transition-colors ${
                  activeTab === 'marina_owners'
                    ? 'bg-navy-800 text-white shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === 'marina_owners' ? { backgroundColor: '#0d2444' } : {}}
              >
                For Marina Owners
              </button>
            </div>
          </div>

          {/* Yacht Owners steps */}
          {activeTab === 'yacht_owners' && (
            <div className="grid md:grid-cols-3 gap-6">
              <StepCard
                icon="fa-search"
                title="Search & Compare"
                description="Browse available marina spaces with real-time pricing and availability. Filter by location, slip size, and amenities."
              />
              <StepCard
                icon="fa-calendar-check"
                title="Book Instantly"
                description="Secure your preferred marina space with instant confirmation. No waiting, no uncertainty — just straightforward booking."
              />
              <StepCard
                icon="fa-ship"
                title="Dock with Confidence"
                description="Arrive at your reserved slip with all details confirmed. Enjoy premium marina services at competitive rates."
              />
            </div>
          )}

          {/* Marina Owners steps */}
          {activeTab === 'marina_owners' && (
            <div className="grid md:grid-cols-3 gap-6">
              <StepCard
                icon="fa-plus-circle"
                title="List Your Marina"
                description="Add your marina to our network. Set availability, pricing, and showcase your amenities to qualified yacht owners."
              />
              <StepCard
                icon="fa-users"
                title="Connect with Customers"
                description="Reach a broader audience of yacht owners through our booking platform. Maximize occupancy and revenue potential."
              />
              <StepCard
                icon="fa-chart-line"
                title="Grow Your Business"
                description="Increase bookings and revenue with streamlined online reservations and a dashboard built for marina operators."
              />
            </div>
          )}
        </div>
      </section>

      {/* ─── Why EasyDock? ────────────────────────────────────────────────── */}
      <section id="why-easydock" className="py-20" style={{ backgroundColor: '#EFF4F9' }}>
        <div className="max-w-5xl mx-auto px-6">
          <h2
            className="text-3xl font-bold text-center mb-12"
            style={{ color: '#1B3A6B' }}
          >
            Why EasyDock?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <WhyCard
              icon="fa-forward"
              title="Skip the Waitlist"
              description="Access marina slips that aren't publicly listed. No more 5-year queues."
            />
            <WhyCard
              icon="fa-dollar-sign"
              title="Transparent Pricing"
              description="See real rates upfront. Compare marinas side by side."
            />
            <WhyCard
              icon="fa-bolt"
              title="Book in Minutes"
              description="Reserve your slip online in minutes, not weeks of phone tag."
            />
          </div>
        </div>
      </section>

      {/* ─── Social Proof ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: '#1B3A6B' }}>
              Trusted by South Florida Boat Owners
            </h2>
            <p className="mt-3 text-gray-500">
              127 boat owners already signed up
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-3 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star text-sm" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="text-sm">
                  <span className="font-semibold text-gray-900">{t.name}</span>
                  <span className="text-gray-400"> — {t.boat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Don't See Your Area CTA ──────────────────────────────────────── */}
      <section id="get-matched" className="py-20" style={{ backgroundColor: '#EFF4F9' }}>
        <div className="max-w-xl mx-auto px-6">
          <RequestAreaCTA />
        </div>
      </section>

    </>
  );
}

/* ─── Sub-components ──────────────────────────────────────────────────────── */

function StepCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div
        className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-white text-xl"
        style={{ backgroundColor: '#0d6e8a' }}
      >
        <i className={`fas ${icon}`} />
      </div>
      <h3 className="mb-2 text-base font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function WhyCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div
        className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white text-xl"
        style={{ backgroundColor: '#1A9E8F' }}
      >
        <i className={`fas ${icon}`} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

