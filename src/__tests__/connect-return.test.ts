import { describe, it, vi } from 'vitest';

// --- Controllable mock state ---

const mockState = {
  payoutsEnabled: true,
  dbUpdateError: false,
  stripeAccountId: 'acct_test_123',
};

// --- Mock: @/lib/supabase/admin ---

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'marina-uuid-1',
              stripe_account_id: mockState.stripeAccountId,
            },
            error: null,
          }),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: mockState.dbUpdateError ? { message: 'DB write failed' } : null,
        }),
      })),
    })),
  })),
}));

// --- Mock: stripe ---

vi.mock('stripe', () => {
  const MockStripe = function (this: unknown) {
    return {
      accounts: {
        retrieve: vi.fn().mockImplementation(() =>
          Promise.resolve({
            id: mockState.stripeAccountId,
            payouts_enabled: mockState.payoutsEnabled,
            details_submitted: mockState.payoutsEnabled,
          })
        ),
      },
    };
  };
  return { default: MockStripe };
});

// --- Tests ---

describe('GET /api/connect/return', () => {
  it.todo('retrieves account from Stripe and updates DB with payouts_enabled status');

  it.todo('redirects to /dashboard?stripeStatus=connected when payouts_enabled is true');

  it.todo('redirects to /dashboard?stripeStatus=pending when payouts_enabled is false');
});
