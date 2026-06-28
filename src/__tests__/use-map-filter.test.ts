import { describe, it, expect, vi } from 'vitest';
import {
  filterMarinasByViewport,
  buildSlipQuery,
} from '@/lib/hooks/use-map-filter';
import type { Database } from '@/types/database';

type Marina = Database['public']['Tables']['marinas']['Row'];

// Helper to create a mock Marina
function makeMarina(overrides: Partial<Marina> = {}): Marina {
  return {
    id: 'marina-1',
    owner_id: 'owner-1',
    name: 'Test Marina',
    description: null,
    address: '123 Dock St',
    city: 'Miami',
    state: 'FL',
    zip: '33101',
    lat: 25.77,
    lng: -80.19,
    amenities: [],
    photos: [],
    phone: null,
    email: null,
    website: null,
    is_active: true,
    stripe_account_id: null,
    stripe_onboarding_complete: false,
    payouts_enabled: false,
    source: 'manual',
    claimed_at: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

// Helper to create mock LngLatBounds
function makeBounds(containsFn: (lngLat: [number, number]) => boolean) {
  return {
    contains: (lngLat: [number, number]) => containsFn(lngLat),
  };
}

describe('filterMarinasByViewport', () => {
  it('returns marinas within bounds', () => {
    const marina = makeMarina({ lat: 25.77, lng: -80.19 });
    const bounds = makeBounds(() => true);
    const result = filterMarinasByViewport([marina], bounds as never);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('marina-1');
  });

  it('excludes marinas outside bounds', () => {
    const marina = makeMarina({ lat: 25.77, lng: -80.19 });
    const bounds = makeBounds(() => false);
    const result = filterMarinasByViewport([marina], bounds as never);
    expect(result).toHaveLength(0);
  });

  it('excludes marinas with null lat', () => {
    const marina = makeMarina({ lat: null, lng: -80.19 });
    const bounds = makeBounds(() => true);
    const result = filterMarinasByViewport([marina], bounds as never);
    expect(result).toHaveLength(0);
  });

  it('excludes marinas with null lng', () => {
    const marina = makeMarina({ lat: 25.77, lng: null });
    const bounds = makeBounds(() => true);
    const result = filterMarinasByViewport([marina], bounds as never);
    expect(result).toHaveLength(0);
  });

  it('excludes marinas with both null lat and lng', () => {
    const marina = makeMarina({ lat: null, lng: null });
    const bounds = makeBounds(() => true);
    const result = filterMarinasByViewport([marina], bounds as never);
    expect(result).toHaveLength(0);
  });

  it('handles empty marina list', () => {
    const bounds = makeBounds(() => true);
    const result = filterMarinasByViewport([], bounds as never);
    expect(result).toHaveLength(0);
  });

  it('filters mixed list correctly', () => {
    const inside = makeMarina({ id: 'inside', lat: 25.77, lng: -80.19 });
    const outside = makeMarina({ id: 'outside', lat: 35.0, lng: -90.0 });
    const nullLat = makeMarina({ id: 'null-lat', lat: null, lng: -80.19 });

    // Only "inside" passes the bounds check
    const bounds = makeBounds(([lng]) => lng === -80.19 && inside.lat !== null);
    // More straightforward: inside has id 'inside', outside does not
    const boundsStrict = {
      contains: (lngLat: [number, number]) => lngLat[0] === -80.19 && lngLat[1] === 25.77,
    };

    const result = filterMarinasByViewport(
      [inside, outside, nullLat],
      boundsStrict as never
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('inside');
  });
});

describe('buildSlipQuery', () => {
  function makeSupabaseMock() {
    const query = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
    };
    // Make supabase.from return the query object
    const supabase = {
      from: vi.fn().mockReturnValue(query),
    };
    return { supabase, query };
  }

  it('builds base query with required filters', () => {
    const { supabase, query } = makeSupabaseMock();
    buildSlipQuery(supabase as never, {
      checkIn: '',
      checkOut: '',
      boatLength: '',
      boatBeam: '',
    });

    expect(supabase.from).toHaveBeenCalledWith('slips');
    expect(query.select).toHaveBeenCalledWith('*, marinas!inner(*)');
    expect(query.eq).toHaveBeenCalledWith('is_available', true);
    expect(query.eq).toHaveBeenCalledWith('marinas.is_active', true);
    expect(query.not).toHaveBeenCalledWith('marinas.lat', 'is', null);
    expect(query.not).toHaveBeenCalledWith('marinas.lng', 'is', null);
  });

  it('does NOT add city filter', () => {
    const { supabase, query } = makeSupabaseMock();
    buildSlipQuery(supabase as never, {
      checkIn: '',
      checkOut: '',
      boatLength: '',
      boatBeam: '',
    });

    // ilike should never be called (no city filter)
    expect(query.ilike).not.toHaveBeenCalled();
  });

  it('adds length_ft filter when boatLength is set', () => {
    const { supabase, query } = makeSupabaseMock();
    buildSlipQuery(supabase as never, {
      checkIn: '',
      checkOut: '',
      boatLength: '45',
      boatBeam: '',
    });

    expect(query.gte).toHaveBeenCalledWith('length_ft', 45);
  });

  it('does NOT add length_ft filter when boatLength is empty', () => {
    const { supabase, query } = makeSupabaseMock();
    buildSlipQuery(supabase as never, {
      checkIn: '',
      checkOut: '',
      boatLength: '',
      boatBeam: '',
    });

    // gte should not be called since both filters are empty
    expect(query.gte).not.toHaveBeenCalled();
  });

  it('adds width_ft filter when boatBeam is set', () => {
    const { supabase, query } = makeSupabaseMock();
    buildSlipQuery(supabase as never, {
      checkIn: '',
      checkOut: '',
      boatLength: '',
      boatBeam: '16',
    });

    expect(query.gte).toHaveBeenCalledWith('width_ft', 16);
  });

  it('does NOT add width_ft filter when boatBeam is empty', () => {
    const { supabase, query } = makeSupabaseMock();
    buildSlipQuery(supabase as never, {
      checkIn: '',
      checkOut: '',
      boatLength: '',
      boatBeam: '',
    });

    expect(query.gte).not.toHaveBeenCalled();
  });

  it('adds both length and beam filters when both are set', () => {
    const { supabase, query } = makeSupabaseMock();
    buildSlipQuery(supabase as never, {
      checkIn: '',
      checkOut: '',
      boatLength: '50',
      boatBeam: '18',
    });

    expect(query.gte).toHaveBeenCalledWith('length_ft', 50);
    expect(query.gte).toHaveBeenCalledWith('width_ft', 18);
  });
});
