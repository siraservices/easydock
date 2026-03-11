'use client';

import { useState } from 'react';
import LeadModal from '@/components/lead-modal';

type Tab = 'yacht_owners' | 'marina_owners';

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('yacht_owners');

  return (
    <>
      <LeadModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[85vh] flex items-center justify-center text-white"
        style={{
          background:
            'linear-gradient(135deg, #0a1628 0%, #0d2444 40%, #0e3d5c 70%, #0a5472 100%)',
        }}
      >
        {/* Subtle overlay image */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1920&q=60)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-sm">
            <i className="fas fa-anchor text-teal-400" />
            South Florida&apos;s Marina Booking Marketplace
          </div>

          <h1 className="mt-4 text-5xl font-bold leading-tight tracking-tight md:text-6xl">
            Find the Perfect Marina
            <span className="block text-teal-400">in South Florida</span>
          </h1>

          <p className="mt-6 text-lg text-white/75 max-w-xl mx-auto leading-relaxed">
            Connect with marinas across South Florida. Browse available dock slips,
            compare rates, and book online — no phone calls required.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-teal-400 transition-colors"
            >
              <i className="fas fa-search" />
              Find Marina Space
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/40 px-8 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <i className="fas fa-plus-circle" />
              List Your Marina
            </button>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-800">How EasyDock Works</h2>
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

          {/* CTA below tabs */}
          <div className="mt-12 text-center">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-8 py-3 text-base font-semibold text-white hover:bg-teal-700 transition-colors shadow"
            >
              <i className="fas fa-anchor" />
              Join the Waitlist
            </button>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer
        className="text-white"
        style={{ backgroundColor: '#0a1628' }}
      >
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 text-xl font-bold mb-3">
                <i className="fas fa-anchor text-teal-400" />
                EasyDock
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                South Florida&apos;s marina booking marketplace connecting yacht owners
                with available dock slips.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-3">
                Get Started
              </h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="hover:text-white transition-colors"
                  >
                    Find Marina Space
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="hover:text-white transition-colors"
                  >
                    List Your Marina
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <p className="text-white/30 text-xs leading-relaxed mb-3">
              The information on easydock.com is for research and educational purposes only.
              All listings, rates, and availability are illustrative and not guaranteed. Users
              must verify all details directly with the marina before making any commitments.
              EasyDock is not a party to any transaction and assumes no liability for
              inaccuracies, errors, or omissions.
            </p>
            <p className="text-white/30 text-xs">
              &copy; {new Date().getFullYear()} EasyDock. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

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
