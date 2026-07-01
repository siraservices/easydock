import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Hoist the update spy so it's available inside vi.mock factories ---

const { mockUpdate } = vi.hoisted(() => ({ mockUpdate: vi.fn() }));

// --- Mock: @/lib/email/send (non-fatal email sends should not affect route behavior) ---

vi.mock('@/lib/email/send', () => ({
  sendBookingEmail: vi.fn().mockResolvedValue(undefined),
  fetchBookingEmailParams: vi.fn().mockResolvedValue({}),
}));

// --- Mock: @/lib/supabase/admin (needed by email integration) ---

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({})),
}));

// --- Controllable mock state ---

const mockState = {
  authenticated: true,
  bookingFound: true,
  bookingStatus: 'pending' as string,
};

// --- Mock: @/lib/supabase/server ---
// from() supports two call shapes used by the route:
//   1. select().eq().single()  — status pre-check
//   2. update().eq().select().single()  — status update

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockImplementation(() =>
        Promise.resolve(
          mockState.authenticated
            ? { data: { user: { id: 'user-uuid-1' } }, error: null }
            : { data: { user: null }, error: { message: 'Not authenticated' } }
        )
      ),
    },
    from: vi.fn(() => ({
      // Status pre-check path: from().select().eq().single()
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockImplementation(() =>
            Promise.resolve(
              mockState.bookingFound
                ? { data: { id: 'booking-uuid-1', status: mockState.bookingStatus }, error: null }
                : { data: null, error: { message: 'Not found' } }
            )
          ),
        })),
      })),
      // Update path: from().update().eq().select().single()
      update: mockUpdate,
    })),
  })),
}));

// --- Import after mocks are registered ---

import { POST } from '@/app/api/bookings/[id]/approve/route';

function makeRequest(id = 'booking-uuid-1') {
  return {
    request: new Request(`http://localhost/api/bookings/${id}/approve`, {
      method: 'POST',
    }),
    context: { params: Promise.resolve({ id }) },
  };
}

// --- Tests ---

describe('POST /api/bookings/[id]/approve', () => {
  beforeEach(() => {
    mockState.authenticated = true;
    mockState.bookingFound = true;
    mockState.bookingStatus = 'pending';
    mockUpdate.mockReset();
    mockUpdate.mockReturnValue({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { id: 'booking-uuid-1', status: 'approved' },
            error: null,
          }),
        })),
      })),
    });
  });

  it('returns 401 when user is not authenticated', async () => {
    mockState.authenticated = false;
    const { request, context } = makeRequest();
    const response = await POST(request, context);
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBeDefined();
  });

  it('returns 200 and approves a pending booking', async () => {
    mockState.bookingStatus = 'pending';
    const { request, context } = makeRequest();
    const response = await POST(request, context);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.booking.status).toBe('approved');
  });

  it('returns 404 when booking not found or not owned by marina owner', async () => {
    mockState.bookingFound = false;
    const { request, context } = makeRequest();
    const response = await POST(request, context);
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBeDefined();
  });

  it('returns 422 for a non-pending booking and does not call update', async () => {
    mockState.bookingStatus = 'confirmed';
    const { request, context } = makeRequest();
    const response = await POST(request, context);
    expect(response.status).toBe(422);
    const json = await response.json();
    expect(json.error).toMatch(/pending/i);
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
