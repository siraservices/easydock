import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Controllable mock state ---

const mockState = {
  authenticated: true,
  marinaStripeAccountId: null as string | null,
  payoutsEnabled: false,
  marinaError: false,
};

// --- Mock: @/lib/supabase/server ---

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: vi.fn().mockImplementation(() =>
          Promise.resolve(
            mockState.authenticated
              ? { data: { user: { id: 'user-uuid-1' } }, error: null }
              : { data: { user: null }, error: { message: 'Not authenticated' } }
          )
        ),
      },
    })
  ),
}));

// --- Mock: @/lib/supabase/admin ---

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: mockState.marinaError
                ? null
                : {
                    id: 'marina-uuid-1',
                    stripe_account_id: mockState.marinaStripeAccountId,
                    payouts_enabled: mockState.payoutsEnabled,
                  },
              error: mockState.marinaError ? { message: 'Not found' } : null,
            }),
          })),
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

// --- Import after mocks ---

import { POST } from '@/app/api/connect/login-link/route';

function makeRequest(body: Record<string, unknown> = { marinaId: 'marina-uuid-1' }) {
  return new Request('http://localhost/api/connect/login-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// --- Tests ---

describe('POST /api/connect/login-link', () => {
  beforeEach(() => {
    mockState.authenticated = true;
    mockState.marinaStripeAccountId = 'acct_test_123';
    mockState.payoutsEnabled = true;
    mockState.marinaError = false;
  });

  it('returns 401 when user is not authenticated', async () => {
    mockState.authenticated = false;

    const response = await POST(makeRequest());
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 when marina has no stripe_account_id', async () => {
    mockState.marinaStripeAccountId = null;
    mockState.payoutsEnabled = false;

    const response = await POST(makeRequest());
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Stripe account not fully connected');
  });

  it('returns 400 when marina has payouts_enabled=false', async () => {
    mockState.marinaStripeAccountId = 'acct_test_123';
    mockState.payoutsEnabled = false;

    const response = await POST(makeRequest());
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Stripe account not fully connected');
  });

  it('returns login link URL for connected marina', async () => {
    mockState.marinaStripeAccountId = 'acct_test_123';
    mockState.payoutsEnabled = true;

    const response = await POST(makeRequest());
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.url).toBe('https://connect.stripe.com/express/login/acct_test_123');
  });
});
