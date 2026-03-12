import { describe, it, expect, vi, beforeEach } from 'vitest';

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
  updateError: false,
};

// --- Mock: @/lib/supabase/server ---

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
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockImplementation(() =>
              Promise.resolve(
                mockState.bookingFound
                  ? { data: { id: 'booking-uuid-1', status: 'declined' }, error: null }
                  : { data: null, error: { message: 'Not found' } }
              )
            ),
          })),
        })),
      })),
    })),
  })),
}));

// --- Import after mocks are registered ---

import { POST } from '@/app/api/bookings/[id]/deny/route';

function makeRequest(id = 'booking-uuid-1') {
  return {
    request: new Request(`http://localhost/api/bookings/${id}/deny`, {
      method: 'POST',
    }),
    context: { params: Promise.resolve({ id }) },
  };
}

// --- Tests ---

describe('POST /api/bookings/[id]/deny', () => {
  beforeEach(() => {
    mockState.authenticated = true;
    mockState.bookingFound = true;
    mockState.updateError = false;
  });

  it('returns 401 when user is not authenticated', async () => {
    mockState.authenticated = false;
    const { request, context } = makeRequest();
    const response = await POST(request, context);
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBeDefined();
  });

  it('returns 200 and updates booking status to declined', async () => {
    mockState.authenticated = true;
    mockState.bookingFound = true;
    const { request, context } = makeRequest();
    const response = await POST(request, context);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.booking.status).toBe('declined');
  });

  it('returns 404 when booking not found or not owned by marina owner', async () => {
    mockState.authenticated = true;
    mockState.bookingFound = false;
    const { request, context } = makeRequest();
    const response = await POST(request, context);
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBeDefined();
  });
});
