import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Controllable mock state ---

const mockState = {
  authenticated: true,
  bookingFound: true,
  isBoatOwner: true,
  isMarinaOwner: false,
  alreadyCancelled: false,
  checkInIsPast: false,
  dbUpdateAffectedRows: 1,
  hasPaymentIntent: true,
};

const mockStripeRefundsCreate = vi.fn().mockResolvedValue({ id: 'refund-uuid-1' });

// --- Mock: stripe ---

vi.mock('stripe', () => {
  const MockStripe = vi.fn().mockImplementation(function (this: unknown) {
    return {
      refunds: {
        create: mockStripeRefundsCreate,
      },
    };
  });
  return { default: MockStripe };
});

// --- Mock: @/lib/supabase/server ---

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockImplementation(() =>
        Promise.resolve(
          mockState.authenticated
            ? { data: { user: { id: 'user-boat-owner' } }, error: null }
            : { data: { user: null }, error: { message: 'Not authenticated' } }
        )
      ),
    },
  })),
}));

// --- Mock: @/lib/supabase/admin ---

const buildBookingRow = () => ({
  id: 'booking-uuid-1',
  status: mockState.alreadyCancelled ? 'cancelled' : 'confirmed',
  check_in: mockState.checkInIsPast ? '2020-01-01' : '2099-12-31',
  check_out: '2099-12-31',
  total_price: 300,
  stripe_payment_intent_id: mockState.hasPaymentIntent ? 'pi_test_123' : null,
  boat_owner_id: mockState.isBoatOwner ? 'user-boat-owner' : 'other-user',
  marinas: {
    owner_id: mockState.isMarinaOwner ? 'user-boat-owner' : 'marina-owner-other',
  },
});

const mockUpdateEq = vi.fn();
const mockUpdateEq2 = vi.fn();
const mockAdminUpdate = vi.fn();
const mockAdminFrom = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
  })),
}));

// --- Import after mocks ---

import { POST } from '@/app/api/bookings/[id]/cancel/route';

function makeRequest(id = 'booking-uuid-1') {
  return {
    request: new Request(`http://localhost/api/bookings/${id}/cancel`, {
      method: 'POST',
    }),
    context: { params: Promise.resolve({ id }) },
  };
}

// --- Tests ---

describe('POST /api/bookings/[id]/cancel', () => {
  beforeEach(() => {
    mockState.authenticated = true;
    mockState.bookingFound = true;
    mockState.isBoatOwner = true;
    mockState.isMarinaOwner = false;
    mockState.alreadyCancelled = false;
    mockState.checkInIsPast = false;
    mockState.dbUpdateAffectedRows = 1;
    mockState.hasPaymentIntent = true;

    vi.clearAllMocks();
    mockStripeRefundsCreate.mockResolvedValue({ id: 'refund-uuid-1' });

    // Default admin mock: select returns booking, update returns success
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'bookings') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue(
                mockState.bookingFound
                  ? { data: buildBookingRow(), error: null }
                  : { data: null, error: { message: 'Not found' } }
              ),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue(
                mockState.dbUpdateAffectedRows > 0
                  ? { error: null, count: mockState.dbUpdateAffectedRows }
                  : { error: { message: 'No rows updated' }, count: 0 }
              ),
            })),
          })),
        };
      }
      return {};
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

  it('returns 404 when booking is not found', async () => {
    mockState.bookingFound = false;
    const { request, context } = makeRequest();
    const response = await POST(request, context);
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json.error).toBeDefined();
  });

  it('returns 403 when user is neither boat owner nor marina owner', async () => {
    mockState.isBoatOwner = false;
    mockState.isMarinaOwner = false;
    const { request, context } = makeRequest();
    const response = await POST(request, context);
    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.error).toBeDefined();
  });

  it('returns 422 when check-in date is in the past (already passed)', async () => {
    mockState.checkInIsPast = true;
    const { request, context } = makeRequest();
    const response = await POST(request, context);
    expect(response.status).toBe(422);
    const json = await response.json();
    expect(json.error).toMatch(/Cannot cancel after check-in/i);
  });

  it('returns 409 when booking is already cancelled', async () => {
    mockState.alreadyCancelled = true;
    const { request, context } = makeRequest();
    const response = await POST(request, context);
    expect(response.status).toBe(409);
    const json = await response.json();
    expect(json.error).toMatch(/already cancelled/i);
  });

  it('calls stripe.refunds.create with reverse_transfer and refund_application_fee when payment intent exists', async () => {
    mockState.hasPaymentIntent = true;
    const { request, context } = makeRequest();
    const response = await POST(request, context);
    expect(response.status).toBe(200);
    expect(mockStripeRefundsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_intent: 'pi_test_123',
        reverse_transfer: true,
        refund_application_fee: true,
      })
    );
  });

  it('succeeds with refunded=false when no stripe_payment_intent_id', async () => {
    mockState.hasPaymentIntent = false;
    const { request, context } = makeRequest();
    const response = await POST(request, context);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.refunded).toBe(false);
    expect(mockStripeRefundsCreate).not.toHaveBeenCalled();
  });

  it('returns 200 with success=true and refunded=true when payment intent exists', async () => {
    mockState.hasPaymentIntent = true;
    const { request, context } = makeRequest();
    const response = await POST(request, context);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.refunded).toBe(true);
  });

  it('marina owner can also cancel (403 only when neither party)', async () => {
    mockState.isBoatOwner = false;
    mockState.isMarinaOwner = true;
    const { request, context } = makeRequest();
    const response = await POST(request, context);
    expect(response.status).toBe(200);
  });
});
