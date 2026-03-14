'use client';

import { useState } from 'react';
import LeadModal from '@/components/lead-modal';

type Tab = 'yacht_owners' | 'marina_owners';

const FEATURED_MARINAS = [
  {
    name: 'Harbour Towne Marina',
    location: 'Fort Lauderdale, FL',
    price: 'From $35/ft/mo',
    slips: 'Slips: 30ft – 80ft',
    amenities: ['Power', 'Water', 'Fuel'],
  },
  {
    name: 'Sunset Harbour Marina',
    location: 'Miami Beach, FL',
    price: 'From $48/ft/mo',
    slips: 'Slips: 35ft – 70ft',
    amenities: ['Power', 'Water', 'Concierge'],
  },
  {
    name: 'Rickenbacker Marina',
    location: 'Key Biscayne, FL',
    price: 'From $28/ft/mo',
    slips: 'Slips: 25ft – 60ft',
    amenities: ['Power', 'Water', 'Pump-out'],
  },
  {
    name: 'Palm Harbour Marina',
    location: 'West Palm Beach, FL',
    price: 'From $32/ft/mo',
    slips: 'Slips: 30ft – 80ft',
    amenities: ['Power', 'Water', 'Wi-Fi'],
  },
  {
    name: 'Dania Pointe Marina',
    location: 'Dania Beach, FL',
    price: 'From $55/ft/mo',
    slips: 'Slips: 40ft – 100ft',
    amenities: ['Power', 'Water', 'Security'],
  },
];

const TESTIMONIALS = [
  {
    quote:
      'I spent 4 months calling marinas with no luck. Submitted my info on EasyDock and got connected to a slip in Fort Lauderdale within 2 weeks.',
    name: 'Carlos M.',
    detail: '42ft Sportfish, Coral Gables',
  },
  {
    quote:
      'The waitlist at my local marina was 6 years. EasyDock found me a transient slip while I wait — total game changer.',
    name: 'Jennifer R.',
    detail: '35ft Sailboat, Miami Beach',
  },
  {
    quote:
      'Finally someone built this. Comparing marina rates used to mean 20 phone calls. Now I can see everything in one place.',
    name: 'David K.',
    detail: '55ft Motor Yacht, Palm Beach',
  },
];

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('yacht_owners');

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

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
              South Florida marina waitlists average 5+ years. Skip the line.
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
              onClick={() => scrollTo('featured-marinas')}
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
      <section id="featured-marinas" className="py-20" style={{ backgroundColor: '#EFF4F9' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: '#1B3A6B' }}>
              Browse Available Marinas
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Featured marina slips across South Florida with transparent pricing.
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
                  Sample Listing
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
                    onClick={() => scrollTo('get-matched')}
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

          <p className="mt-8 text-center text-sm text-gray-500">
            More marinas joining every week. Submit your boat details below to get matched.
          </p>
        </div>
      </section>

      {/* ─── Map / Coverage Area ──────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold" style={{ color: '#1B3A6B' }}>
              Our Coverage Area
            </h2>
            <p className="mt-2 text-gray-500 text-sm">
              Currently serving marinas from Palm Beach to Key Biscayne
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-md border border-gray-200">
            <iframe
              title="EasyDock Coverage Area — South Florida"
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d460000!2d-80.15!3d26.1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f4.1!5e0!3m2!1sen!2sus!4v1700000000000"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24" style={{ backgroundColor: '#EFF4F9' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: '#1B3A6B' }}>
              How EasyDock Works
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto">
              Simple steps to find and book your ideal marina slip.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
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

          {/* Yacht Owners steps — rewritten to match current reality */}
          {activeTab === 'yacht_owners' && (
            <div className="grid md:grid-cols-3 gap-6">
              <StepCard
                icon="fa-edit"
                title="Tell Us Your Needs"
                description="Share your boat details and preferred location. It takes 30 seconds."
              />
              <StepCard
                icon="fa-handshake"
                title="We Match You"
                description="Our team connects you with marinas that fit your boat and budget — no waitlists, no phone tag."
              />
              <StepCard
                icon="fa-ship"
                title="Book Your Slip"
                description="Review your options, confirm your reservation, and dock with confidence."
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
      <section className="py-20 bg-white">
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
      <section className="py-20" style={{ backgroundColor: '#EFF4F9' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: '#1B3A6B' }}>
              Boat Owners Like You Are Already Signed Up
            </h2>
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
                  <span className="text-gray-400"> — {t.detail}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm font-semibold" style={{ color: '#1B3A6B' }}>
            130+ boat owners matched so far
          </p>
        </div>
      </section>

      {/* ─── Inline Intake Form CTA ───────────────────────────────────────── */}
      <section
        id="get-matched"
        className="py-20 text-white"
        style={{
          background:
            'linear-gradient(135deg, #0a1628 0%, #0d2444 50%, #0e3d5c 100%)',
        }}
      >
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">
              Tell Us About Your Boat — We&apos;ll Find Your Slip
            </h2>
            <p className="mt-3 text-white/70">
              Share your details and we&apos;ll match you with available marinas. Expect an update within 48 hours.
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
                    onClick={() => scrollTo('featured-marinas')}
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
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-3">
                Contact
              </h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <a
                    href="mailto:hello@easydock.co"
                    className="hover:text-white transition-colors"
                  >
                    <i className="fas fa-envelope mr-1.5" />
                    hello@easydock.co
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-5xl mx-auto px-6 py-4">
            <p className="text-white/30 text-xs leading-relaxed mb-3">
              Listings and pricing shown are estimates and may vary by season and
              availability. We recommend confirming final details directly with the
              marina. EasyDock connects boat owners with marina operators to simplify
              the booking process.
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
    boat_beam: '',
    preferred_area: '',
    timeline: '',
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
    if (!formData.preferred_area) newErrors.preferred_area = 'Preferred area is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/boat-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          boat_length: formData.boat_length,
          boat_beam: formData.boat_beam || null,
          preferred_area: formData.preferred_area,
          timeline: formData.timeline || null,
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
          Thanks{formData.name ? ` ${formData.name.split(' ')[0]}` : ''}! We&apos;re matching you with available marinas
          {formData.preferred_area ? ` in ${formData.preferred_area}` : ''}.
        </p>
        <p className="text-white/60">Expect an update within 48 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Full Name <span className="text-red-400">*</span>
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

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Phone Number
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
            <option value="Under 25ft" className="text-gray-900">Under 25ft</option>
            <option value="25-30ft" className="text-gray-900">25–30ft</option>
            <option value="31-40ft" className="text-gray-900">31–40ft</option>
            <option value="41-50ft" className="text-gray-900">41–50ft</option>
            <option value="51-65ft" className="text-gray-900">51–65ft</option>
            <option value="66-80ft" className="text-gray-900">66–80ft</option>
            <option value="80ft+" className="text-gray-900">80ft+</option>
          </select>
          {errors.boat_length && (
            <p className="text-red-400 text-xs mt-1">{errors.boat_length}</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {/* Boat Beam */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Boat Beam Width
          </label>
          <input
            type="text"
            value={formData.boat_beam}
            onChange={(e) => update('boat_beam', e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder="e.g. 12ft"
          />
        </div>

        {/* Preferred Area */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Preferred Area <span className="text-red-400">*</span>
          </label>
          <select
            value={formData.preferred_area}
            onChange={(e) => update('preferred_area', e.target.value)}
            className={`w-full rounded-lg border bg-white/10 backdrop-blur-sm px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400 ${
              errors.preferred_area ? 'border-red-400' : 'border-white/20'
            }`}
          >
            <option value="" className="text-gray-900">Select area</option>
            <option value="Fort Lauderdale" className="text-gray-900">Fort Lauderdale</option>
            <option value="Miami / Miami Beach" className="text-gray-900">Miami / Miami Beach</option>
            <option value="Key Biscayne" className="text-gray-900">Key Biscayne</option>
            <option value="Hollywood / Dania Beach" className="text-gray-900">Hollywood / Dania Beach</option>
            <option value="West Palm Beach" className="text-gray-900">West Palm Beach</option>
            <option value="Other" className="text-gray-900">Other</option>
          </select>
          {errors.preferred_area && (
            <p className="text-red-400 text-xs mt-1">{errors.preferred_area}</p>
          )}
        </div>

        {/* Timeline */}
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Timeline
          </label>
          <select
            value={formData.timeline}
            onChange={(e) => update('timeline', e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            <option value="" className="text-gray-900">Select timeline</option>
            <option value="ASAP" className="text-gray-900">ASAP</option>
            <option value="Within 1 month" className="text-gray-900">Within 1 month</option>
            <option value="Within 3 months" className="text-gray-900">Within 3 months</option>
            <option value="Just exploring" className="text-gray-900">Just exploring</option>
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
        {submitting ? 'Submitting...' : 'Find My Slip'}
      </button>
    </form>
  );
}
