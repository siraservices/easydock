import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mock: @/lib/supabase/admin ---

const mockAdminBookings: unknown[] = [
  {
    id: 'booking-1',
    status: 'confirmed',
    check_in: '2026-07-10',
    check_out: '2026-07-14',
    total_price: 400,
    vessel_name: 'Sea Breeze',
    vessel_length: 30,
    vessel_type: 'Sailboat',
    special_requests: null,
    created_at: '2026-07-01T00:00:00Z',
    slips: { id: 'slip-1', name: 'A1' },
    profiles: { email: 'owner@example.com', full_name: 'Jane Doe' },
  },
];

let adminQueryError: string | null = null;

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockImplementation(() =>
          Promise.resolve(
            adminQueryError
              ? { data: null, count: null, error: { message: adminQueryError } }
              : { data: mockAdminBookings, count: mockAdminBookings.length, error: null }
          )
        ),
      })),
    })),
  })),
}));

// --- Controllable mock state ---

const mockState = {
  authenticated: true,
  marinaOwned: true,
};

// --- Mock: @/lib/supabase/server ---

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockImplementation(() =>
        Promise.resolve(
          mockState.authenticated
            ? { data: { user: { id: 'user-uuid-1' } }, error: null }
            : { data: { user: null }, error: null }
        )
      ),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockImplementation(() =>
            Promise.resolve(
              mockState.marinaOwned
                ? { data: { id: 'marina-uuid-1', owner_id: 'user-uuid-1' }, error: null }
                : { data: null, error: { message: 'Not found' } }
            )
          ),
        })),
      })),
    })),
  })),
}));

// --- Import after mocks ---

import { GET } from '@/app/api/marinas/[id]/bookings/route';

function makeRequest(marinaId = 'marina-uuid-1', queryString = '') {
  return {
    request: new NextRequest(`http://localhost/api/marinas/${marinaId}/bookings${queryString}`),
    context: { params: Promise.resolve({ id: marinaId }) },
  };
}

class NextRequest extends Request {
  constructor(url: string) {
    super(url);
  }
}

// --- Tests ---

describe('GET /api/marinas/[id]/bookings', () => {
  beforeEach(() => {
    mockState.authenticated = true;
    mockState.marinaOwned = true;
    adminQueryError = null;
  });

  it('returns 401 when unauthenticated', async () => {
    mockState.authenticated = false;
    const { request, context } = makeRequest();
    const res = await GET(request as NextRequest, context);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it('returns 403 when marina not owned by user', async () => {
    mockState.marinaOwned = false;
    const { request, context } = makeRequest();
    const res = await GET(request as NextRequest, context);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it('returns 200 with bookings array for owned marina', async () => {
    const { request, context } = makeRequest();
    const res = await GET(request as NextRequest, context);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.bookings)).toBe(true);
    expect(json.bookings).toHaveLength(1);
    expect(json.total).toBe(1);
  });

  it('returns 500 on database error', async () => {
    adminQueryError = 'DB error';
    const { request, context } = makeRequest();
    const res = await GET(request as NextRequest, context);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });
});
