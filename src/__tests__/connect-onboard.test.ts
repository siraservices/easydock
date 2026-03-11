import { describe, it, vi } from 'vitest';

// --- Controllable mock state ---

const mockState = {
  authenticated: true,
  existingStripeAccountId: null as string | null,
  marinaConnected: false,
  createAccountError: false,
  createLinkError: false,
  dbUpdateError: false,
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
              stripe_account_id: mockState.existingStripeAccountId,
              stripe_onboarding_complete: mockState.marinaConnected,
              payouts_enabled: mockState.marinaConnected,
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
        create: vi.fn().mockImplementation(() =>
          mockState.createAccountError
            ? Promise.reject(new Error('Stripe account create failed'))
            : Promise.resolve({ id: 'acct_test_123' })
        ),
      },
      accountLinks: {
        create: vi.fn().mockImplementation(() =>
          mockState.createLinkError
            ? Promise.reject(new Error('Stripe link create failed'))
            : Promise.resolve({ url: 'https://connect.stripe.com/setup/e/test' })
        ),
      },
    };
  };
  return { default: MockStripe };
});

// --- Tests ---

describe('POST /api/connect/onboard', () => {
  it.todo('returns 401 when user is not authenticated');

  it.todo('creates Express account and returns account link URL');

  it.todo('reuses existing stripe_account_id when onboarding is incomplete');

  it.todo('returns error when marina is already fully connected');

  it.todo('stores stripe_account_id in DB before generating link');
});
