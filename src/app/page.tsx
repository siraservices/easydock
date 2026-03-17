'use client';

import { useState } from 'react';
import LeadModal from '@/components/lead-modal';

type Tab = 'yacht_owners' | 'marina_owners';

const FEATURED_MARINAS = [
  {
    name: 'Bahia Mar Yachting Center',
    location: 'Fort Lauderdale, FL',
    price: 'From $32/ft/mo',
    slips: '30ft – 80ft slips available',
    amenities: ['Power', 'Water', 'Fuel'],
  },
  {
    name: 'Pier Sixty-Six Marina',
    location: 'Fort Lauderdale, FL',
    price: 'From $45/ft/mo',
    slips: '40ft – 120ft slips available',
    amenities: ['Power', 'Water', 'Concierge'],
  },
  {
    name: 'Miami Beach Marina',
    location: 'Miami Beach, FL',
    price: 'From $42/ft/mo',
    slips: '25ft – 80ft slips available',
    amenities: ['Power', 'Water', 'Security'],
  },
  {
    name: 'Rickenbacker Marina',
    location: 'Key Biscayne, FL',
    price: 'From $29/ft/mo',
    slips: '20ft – 60ft slips available',
    amenities: ['Power', 'Water', 'Pump-out'],
  },
  {
    name: 'Sailfish Marina Resort',
    location: 'Palm Beach Shores, FL',
    price: 'From $35/ft/mo',
    slips: '30ft – 80ft slips available',
    amenities: ['Power', 'Water', 'Fuel'],
  },
  {
    name: 'Safe Harbor Old Port Cove',
    location: 'North Palm Beach, FL',
    price: 'From $38/ft/mo',
    slips: '35ft – 100ft slips available',
    amenities: ['Power', 'Water', 'Wi-Fi'],
  },
];

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

          {/* Urgency stat banner */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-xl bg-amber-500/20 border border-amber-400/40 px-5 py-2.5 backdrop-blur-sm">
            <i className="fas fa-clock text-amber-400 text-lg" />
            <span className="text-base font-semibold text-amber-100">
              The average South Florida marina waitlist is 5+ years. Skip the line.
            </span>
          </div>

          <p className="mt-6 text-lg text-white/75 max-w-xl mx-auto leading-relaxed">
            Connect with marinas across South Florida. Browse available dock slips,
            compare rates, and book online.
          </p>

          {/* "No phone calls" badge */}
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-teal-500/20 border border-teal-400/30 px-4 py-1.5 text-sm font-medium text-teal-300">
            <i className="fas fa-phone-slash" />
            No phone calls required
          </div>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
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

      {/* ─── Featured Marinas ─────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: '#EFF4F9' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: '#1B3A6B' }}>
              Available Now
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Browse marina slips across South Florida with transparent pricing.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_MARINAS.map((marina) => (
              <div
                key={marina.name}
                className="relative rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Placeholder image area */}
                <div
                  className="h-40 flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(135deg, #0d2444 0%, #0e3d5c 50%, #1A9E8F 100%)',
                  }}
                >
                  <i className="fas fa-anchor text-white/30 text-5xl" />
                </div>

                {/* Sample listing tag */}
                <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-medium text-gray-500 backdrop-blur-sm">
                  Sample listing
                </span>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {marina.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                    <i className="fas fa-map-marker-alt text-teal-500 text-xs" />
                    {marina.location}
                  </p>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span
                      className="text-xl font-bold"
                      style={{ color: '#1A9E8F' }}
                    >
                      {marina.price}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{marina.slips}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {marina.amenities.map((a) => (
                      <span
                        key={a}
                        className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                      >
                        {a}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setModalOpen(true)}
                    className="mt-4 w-full rounded-lg py-2 text-sm font-semibold text-white transition-colors"
                    style={{ backgroundColor: '#1A9E8F' }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = '#168a7d')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = '#1A9E8F')
                    }
                  >
                    Check Availability
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
      <section className="py-20" style={{ backgroundColor: '#EFF4F9' }}>
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

      {/* ─── Inline Intake Form CTA ───────────────────────────────────────── */}
      <section
        className="py-20 text-white"
        style={{
          background:
            'linear-gradient(135deg, #0a1628 0%, #0d2444 50%, #0e3d5c 100%)',
        }}
      >
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Find Your Slip</h2>
            <p className="mt-3 text-white/70">
              Tell us about your boat and we&apos;ll match you with available marinas.
            </p>
          </div>
          <IntakeForm />
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer
        className="text-white"
        style={{ backgroundColor: '#0a1628' }}
      >
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <h3 className="text-lg font-bold mb-3">EasyDock</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-5">
                Professional marina booking platform connecting yacht owners
                with premium docking spaces nationwide.
              </p>
              <div className="flex gap-3">
                {["facebook-f", "twitter", "linkedin-in", "instagram"].map((icon) => (
                  <span
                    key={icon}
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors cursor-pointer text-sm"
                  >
                    <i className={`fab fa-${icon}`} />
                  </span>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-bold mb-3">Services</h3>
              <ul className="space-y-2 text-sm text-white/50">
                <li><a href="/search" className="hover:text-white transition-colors">Marina Booking</a></li>
                <li><a href="/search" className="hover:text-white transition-colors">Booking Platform</a></li>
                <li><button onClick={() => setModalOpen(true)} className="hover:text-white transition-colors">Affiliate Program</button></li>
                <li><button onClick={() => setModalOpen(true)} className="hover:text-white transition-colors">Marina Partnerships</button></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-bold mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-white/50">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-bold mb-3">Newsletter</h3>
              <p className="text-white/50 text-sm leading-relaxed mb-4">
                Stay updated with the latest marina availability and booking opportunities.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 hover:bg-teal-700 px-5 py-2 text-sm font-semibold text-white transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-5">
            <p className="text-white/30 text-xs leading-relaxed text-center">
              The information on easydock.com is for research and educational purposes only.
              All listings, rates, and availability are illustrative and not guaranteed.
              Users must verify all details directly with the marina before making any commitments.
              Easydock.com is not a party to any transaction and assumes no liability for inaccuracies,
              errors, or omissions. Information provided should not be taken literally.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <p className="text-white/30 text-xs text-center">
              &copy; {new Date().getFullYear()} EasyDock. All rights reserved.
              {" | "}
              <a href="#" className="text-teal-400 hover:text-teal-300 transition-colors">Privacy Policy</a>
              {" | "}
              <a href="#" className="text-teal-400 hover:text-teal-300 transition-colors">Terms of Service</a>
            </p>
          </div>
        </div>
      </footer>
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

function IntakeForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    boat_length: '',
    preferred_area: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Valid email is required';
    if (!formData.boat_length) newErrors.boat_length = 'Boat length is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          boat_length: formData.boat_length,
          preferred_area: formData.preferred_area || null,
          user_type: 'yacht_owner',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ name: 'Something went wrong. Please try again.' });
        }
        return;
      }

      setSubmitted(true);
    } catch {
      setErrors({ name: 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="mb-4 text-5xl text-teal-400">
          <i className="fas fa-check-circle" />
        </div>
        <p className="text-xl font-semibold mb-2">
          We&apos;re matching you with available marinas.
        </p>
        <p className="text-white/60">Check your email soon!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => update('name', e.target.value)}
            className={`w-full rounded-lg border bg-white/10 backdrop-blur-sm px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-400 ${
              errors.name ? 'border-red-400' : 'border-white/20'
            }`}
            placeholder="Your full name"
          />
          {errors.name && (
            <p className="text-red-400 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => update('email', e.target.value)}
            className={`w-full rounded-lg border bg-white/10 backdrop-blur-sm px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-400 ${
              errors.email ? 'border-red-400' : 'border-white/20'
            }`}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder="(optional)"
          />
        </div>

        {/* Boat Length */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Boat Length <span className="text-red-400">*</span>
          </label>
          <select
            value={formData.boat_length}
            onChange={(e) => update('boat_length', e.target.value)}
            className={`w-full rounded-lg border bg-white/10 backdrop-blur-sm px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 ${
              errors.boat_length ? 'border-red-400' : 'border-white/20'
            }`}
          >
            <option value="" className="text-gray-900">Select length</option>
            <option value="20" className="text-gray-900">20 ft</option>
            <option value="25" className="text-gray-900">25 ft</option>
            <option value="30" className="text-gray-900">30 ft</option>
            <option value="40" className="text-gray-900">40 ft</option>
            <option value="50" className="text-gray-900">50 ft</option>
            <option value="60" className="text-gray-900">60 ft</option>
            <option value="80" className="text-gray-900">80 ft</option>
            <option value="100+" className="text-gray-900">100+ ft</option>
          </select>
          {errors.boat_length && (
            <p className="text-red-400 text-xs mt-1">{errors.boat_length}</p>
          )}
        </div>

        {/* Preferred Area */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Preferred Area
          </label>
          <select
            value={formData.preferred_area}
            onChange={(e) => update('preferred_area', e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            <option value="" className="text-gray-900">Any area</option>
            <option value="Fort Lauderdale" className="text-gray-900">Fort Lauderdale</option>
            <option value="Miami" className="text-gray-900">Miami</option>
            <option value="Key Biscayne" className="text-gray-900">Key Biscayne</option>
            <option value="Palm Beach" className="text-gray-900">Palm Beach</option>
            <option value="Other" className="text-gray-900">Other</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl py-3 text-base font-semibold text-white shadow-lg transition-colors disabled:opacity-60"
        style={{ backgroundColor: '#1A9E8F' }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = '#168a7d')
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = '#1A9E8F')
        }
      >
        {submitting ? 'Submitting...' : 'Get Matched'}
      </button>
    </form>
  );
}
