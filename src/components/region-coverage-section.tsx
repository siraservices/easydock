'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { REGIONS } from '@/config/regions';
import RegionCard from './region-card';

export default function RegionCoverageSection() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('waitlist_signups') as any)
          .select('region');

        if (error) {
          setLoading(false);
          return;
        }

        const grouped: Record<string, number> = {};
        for (const row of data || []) {
          grouped[row.region] = (grouped[row.region] || 0) + 1;
        }
        setCounts(grouped);
      } catch {
        // Silently fail — counters will show 0
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, []);

  return (
    <section className="py-20" style={{ backgroundColor: '#EFF4F9' }}>
      <div className="max-w-5xl mx-auto px-6">
        {/* Section header */}
        <div className="mb-10">
          <p
            className="text-sm font-medium uppercase mb-2"
            style={{ color: '#2BA89D', letterSpacing: '1px' }}
          >
            Expanding across South Florida
          </p>
          <h2
            className="text-3xl font-bold mb-3"
            style={{ color: '#1B3A6B' }}
          >
            Marina slips opening in your area
          </h2>
          <p
            className="text-base leading-relaxed max-w-xl"
            style={{ color: '#6B7280', lineHeight: 1.6 }}
          >
            We&apos;re connecting boat owners with available slips at marinas across
            South Florida. Drop your email to get notified when slips open in your
            preferred area.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {REGIONS.map((region) => (
            <RegionCard
              key={region.slug}
              region={region}
              initialCount={counts[region.slug] || 0}
              countLoading={loading}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
