import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Controllable mock state ---

const mockState = {
  authenticated: true,
  // Marina Connect fields (controlled per test)
  marinaStripeAccountId: 'acct_connected_123' as string | null,
  payoutsEnabled: true,
  // Slip data for pricing (price in dollars)
  pricePerNight: 100,
  // RPC outcome
  rpcConflict: false,
  bookingId: 'booking-uuid-1',
};

// Capture Stripe mock calls
let stripeCreateSpy: ReturnType<typeof vi.fn>;

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
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'slip-uuid-1',
                name: 'Slip A1',
                price_per_night: mockState.pricePerNight,
                price_per_week: null,
                length_ft: 40,
                is_available: true,
                marina_id: 'marina-uuid-1',
                marinas: {
                  id: 'marina-uuid-1',
                  name: 'Test Marina',
                },
              },
              error: null,
            }),
          })),
        })),
      })),
    })),
  })),
}));

// --- Mock: @/lib/supabase/admin ---

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'marina-uuid-1',
              stripe_account_id: mockState.marinaStripeAccountId,
              payouts_enabled: mockState.payoutsEnabled,
            },
            error: null,
          }),
        })),
      })),
    })),
    rpc: vi.fn().mockImplementation(() =>
      Promise.resolve({
        data: [{ booking_id: mockState.bookingId, conflict: mockState.rpcConflict }],
        error: null,
      })
    ),
  })),
}));

// --- Mock: stripe ---

vi.mock('stripe', () => {
  const MockStripe = vi.fn().mockImplementation(function (this: unknown) {
    stripeCreateSpy = vi.fn().mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    });
    return {
      checkout: {
        sessions: {
          create: stripeCreateSpy,
        },
      },
    };
  });
  return { default: MockStripe };
});

// --- Helper: build a minimal fake Request ---

function makeRequest(body: Record<string, unknown>) {
  return {
    json: () => Promise.resolve(body),
    headers: {
      get: (key: string) => (key === 'origin' ? 'http://localhost:3000' : null),
    },
  } as unknown as Request;
}

const defaultBody = {
  slipId: 'slip-uuid-1',
  marinaId: 'marina-uuid-1',
  checkIn: '2025-08-01',
  checkOut: '2025-08-04', // 3 nights
  vesselName: 'Sea Breeze',
  vesselLength: 30,
  vesselType: 'Sailboat',
  specialRequests: '',
};

// --- Tests ---

describe('POST /api/checkout — Connect integration', () => {
  beforeEach(() => {
    // Reset to "happy path" defaults before each test
    mockState.authenticated = true;
    mockState.marinaStripeAccountId = 'acct_connected_123';
    mockState.payoutsEnabled = true;
    mockState.pricePerNight = 100;
    mockState.rpcConflict = false;
    mockState.bookingId = 'booking-uuid-1';
  });

  it('returns 422 when marina has no stripe_account_id', async () => {
    mockState.marinaStripeAccountId = null;
    mockState.payoutsEnabled = true;

    const { POST } = await import('@/app/api/checkout/route');
    const res = await POST(makeRequest(defaultBody));
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error).toContain('not currently accepting online payments');
  });

  it('returns 422 when marina has payouts_enabled=false', async () => {
    mockState.marinaStripeAccountId = 'acct_connected_123';
    mockState.payoutsEnabled = false;

    const { POST } = await import('@/app/api/checkout/route');
    const res = await POST(makeRequest(defaultBody));
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error).toContain('not currently accepting online payments');
  });

  it('includes payment_intent_data.application_fee_amount in cents', async () => {
    const { POST } = await import('@/app/api/checkout/route');
    await POST(makeRequest(defaultBody));

    // 3 nights × $100/night = $300 base. Platform fee = 15% of $300 = $45.00 → 4500 cents
    expect(stripeCreateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_intent_data: expect.objectContaining({
          application_fee_amount: 4500,
        }),
      })
    );
  });

  it('includes payment_intent_data.transfer_data.destination with marina stripe_account_id', async () => {
    const { POST } = await import('@/app/api/checkout/route');
    await POST(makeRequest(defaultBody));

    expect(stripeCreateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_intent_data: expect.objectContaining({
          transfer_data: {
            destination: 'acct_connected_123',
          },
        }),
      })
    );
  });

  it('application_fee_amount does not exceed total charge amount', async () => {
    // Use $1/night × 1 night to create a very small charge
    // base = $1, platformFee = $0.15, total = $1.10
    // applicationFeeCents = 15, totalChargeCents = 110 → safeFee = min(15, 109) = 15
    mockState.pricePerNight = 1;

    const { POST } = await import('@/app/api/checkout/route');
    await POST(makeRequest({ ...defaultBody, checkOut: '2025-08-02' })); // 1 night

    expect(stripeCreateSpy).toHaveBeenCalled();
    const callArgs = stripeCreateSpy.mock.calls[0][0];
    const { application_fee_amount } = callArgs.payment_intent_data;

    // Reconstruct what the total charge in cents is
    const basePrice = 1 * 1; // $1
    const yachtOwnerFee = Math.round(basePrice * 0.10 * 100) / 100; // $0.10
    const totalChargeCents = Math.round((basePrice + yachtOwnerFee) * 100); // 110 cents

    expect(application_fee_amount).toBeLessThan(totalChargeCents);
  });
});
