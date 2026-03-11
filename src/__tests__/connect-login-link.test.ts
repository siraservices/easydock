import { describe, it, vi } from 'vitest';

// --- Controllable mock state ---

const mockState = {
  authenticated: true,
  marinaStripeAccountId: null as string | null,
  payoutsEnabled: false,
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
      accounts: {
        createLoginLink: vi.fn().mockResolvedValue({
          url: 'https://connect.stripe.com/express/login/acct_test_123',
        }),
      },
    };
  };
  return { default: MockStripe };
});

// --- Tests ---

describe('POST /api/connect/login-link', () => {
  it.todo('returns 401 when user is not authenticated');

  it.todo('returns 400 when marina has no stripe_account_id');

  it.todo('returns 400 when marina has payouts_enabled=false');

  it.todo('returns login link URL for connected marina');
});
