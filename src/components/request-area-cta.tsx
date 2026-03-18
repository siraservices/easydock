'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function RequestAreaCTA() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'duplicate' | 'error'>('idle');
  const [shake, setShake] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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
        .insert({ email, region: 'other', source: 'request_area' });

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
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  }

  return (
    <div
      className="rounded-xl border bg-white p-8 text-center"
      style={{ borderColor: '#E5E7EB' }}
    >
      <h3 className="text-xl font-bold mb-2" style={{ color: '#1B3A6B' }}>
        Don&apos;t see your area?
      </h3>
      <p className="text-sm mb-6" style={{ color: '#6B7280', lineHeight: 1.6 }}>
        We&apos;re expanding fast. Tell us where you need a slip and we&apos;ll
        prioritize that region.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2.5 max-w-sm mx-auto">
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
          {state === 'submitting' ? 'Sending...' : state === 'success' ? 'Added ✓' : 'Request my area'}
        </button>
      </form>

      {state === 'duplicate' && (
        <p className="text-xs mt-2" style={{ color: '#DC2626' }}>
          You&apos;re already on the list!
        </p>
      )}
      {state === 'error' && (
        <p className="text-xs mt-2" style={{ color: '#DC2626' }}>
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
