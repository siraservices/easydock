import { describe, it, vi } from 'vitest';

// --- Controllable mock state ---

const mockState = {
  authenticated: true,
  marinaStripeAccountId: null as string | null,
  payoutsEnabled: false,
  basePrice: 10000, // in cents
  platformFeeAmount: 1500, // in cents (15% of base)
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
  })),
}));

// --- Mock: stripe ---

vi.mock('stripe', () => {
  const MockStripe = function (this: unknown) {
    return {
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({
            id: 'cs_test_123',
            url: 'https://checkout.stripe.com/pay/cs_test_123',
          }),
        },
      },
    };
  };
  return { default: MockStripe };
});

// --- Tests ---

describe('POST /api/checkout — Connect integration', () => {
  it.todo('returns 422 when marina has no stripe_account_id');

  it.todo('returns 422 when marina has payouts_enabled=false');

  it.todo('includes payment_intent_data.application_fee_amount in cents');

  it.todo('includes payment_intent_data.transfer_data.destination with marina stripe_account_id');

  it.todo('application_fee_amount does not exceed total charge amount');
});
