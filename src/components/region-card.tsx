'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Region } from '@/config/regions';

interface RegionCardProps {
  region: Region;
  initialCount: number;
  countLoading: boolean;
}

export default function RegionCard({ region, initialCount, countLoading }: RegionCardProps) {
  const [email, setEmail] = useState('');
  const [count, setCount] = useState(initialCount);
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error' | 'duplicate'>('idle');
  const [shake, setShake] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Client-side email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setShake(true);
      setTimeout(() => setShake(false), 300);
      return;
    }

    setState('submitting');

    try {
      const supabase = createClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('waitlist_signups') as any)
        .insert({ email, region: region.slug, source: 'region_card' });

      if (error) {
        if (error.code === '23505') {
          setState('duplicate');
          setTimeout(() => setState('idle'), 3000);
        } else {
          setState('error');
          setTimeout(() => setState('idle'), 3000);
        }
        return;
      }

      setState('success');
      setCount((c) => c + 1);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  }

  return (
    <div
      className="flex flex-col gap-3.5 rounded-xl border bg-white p-6 transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: '#E5E7EB' }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#1B3A6B')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
    >
      {/* Row 1 — Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: '#1B3A6B' }}>
          {region.name}
        </h3>
        {region.badge && (
          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={
              region.badge.variant === 'active'
                ? { backgroundColor: '#E1F5EE', color: '#0F6E56' }
                : { backgroundColor: '#FAEEDA', color: '#854F0B' }
            }
          >
            {region.badge.text}
          </span>
        )}
      </div>

      {/* Row 2 — Stats */}
      <div className="flex gap-5 text-sm">
        <span>
          <span className="font-semibold" style={{ color: '#1B3A6B' }}>{region.marinaCount}</span>{' '}
          <span style={{ color: '#6B7280' }}>marinas</span>
        </span>
        <span>
          <span className="font-semibold" style={{ color: '#1B3A6B' }}>{region.priceRange}</span>{' '}
          <span style={{ color: '#6B7280' }}>/ft/mo avg</span>
        </span>
      </div>

      {/* Row 3 — Slip size pills */}
      <div className="flex flex-wrap gap-2">
        {region.slipSizes.map((size) => (
          <span
            key={size}
            className="rounded-lg px-3 py-1 text-xs"
            style={{ backgroundColor: '#F0F4F8', color: '#6B7280' }}
          >
            {size}
          </span>
        ))}
      </div>

      {/* Row 4 — Email capture */}
      <form onSubmit={handleSubmit} className="flex gap-2.5">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === 'success'}
          className={`h-10 flex-1 rounded-lg border px-3.5 text-sm transition-colors focus:outline-none ${
            shake ? 'animate-shake' : ''
          }`}
          style={{
            borderColor: '#E5E7EB',
            fontFamily: "'DM Sans', sans-serif",
            opacity: state === 'success' ? 0.5 : 1,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#2BA89D';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(43,168,157,0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#E5E7EB';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        <button
          type="submit"
          disabled={state === 'submitting' || state === 'success'}
          className="h-10 whitespace-nowrap rounded-lg px-5 text-sm font-semibold text-white transition-colors disabled:opacity-80"
          style={{
            backgroundColor: state === 'success' ? '#0F6E56' : '#1B3A6B',
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={(e) => {
            if (state !== 'success') e.currentTarget.style.backgroundColor = '#24497e';
          }}
          onMouseLeave={(e) => {
            if (state !== 'success') e.currentTarget.style.backgroundColor = '#1B3A6B';
          }}
        >
          {state === 'submitting' ? 'Sending...' : state === 'success' ? 'Added ✓' : 'Notify me'}
        </button>
      </form>

      {/* Error messages */}
      {state === 'duplicate' && (
        <p className="text-xs" style={{ color: '#DC2626' }}>
          You&apos;re already on the list for this region!
        </p>
      )}
      {state === 'error' && (
        <p className="text-xs" style={{ color: '#DC2626' }}>
          Something went wrong. Please try again.
        </p>
      )}

      {/* Row 5 — Social proof counter */}
      <div className="flex items-center gap-1.5">
        {countLoading ? (
          <div
            className="h-3.5 w-20 animate-pulse rounded"
            style={{ backgroundColor: '#E5E7EB' }}
          />
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="7" r="6" />
              <path d="M7 3.5V7L9.5 8.5" />
            </svg>
            <span className="text-xs" style={{ color: '#0F6E56', fontSize: '13px' }}>
              {count} boat owner{count !== 1 ? 's' : ''} waiting
            </span>
          </>
        )}
      </div>
    </div>
  );
}
