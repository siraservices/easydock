import { describe, it, expect, vi, beforeEach } from 'vitest';

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
      select: vi.fn(() => {
        const singleMock = vi.fn().mockImplementation(() =>
          Promise.resolve({
            data: {
              id: 'marina-uuid-1',
              stripe_account_id: mockState.existingStripeAccountId,
              stripe_onboarding_complete: mockState.marinaConnected,
              payouts_enabled: mockState.marinaConnected,
            },
            error: null,
          })
        );
        const eqInner = { single: singleMock };
        const eqOuter = { eq: vi.fn(() => eqInner) };
        return { eq: vi.fn(() => eqOuter) };
      }),
      update: vi.fn(() => {
        const eqInner = vi.fn().mockResolvedValue({
          data: null,
          error: mockState.dbUpdateError ? { message: 'DB write failed' } : null,
        });
        return { eq: vi.fn(() => ({ eq: eqInner })) };
      }),
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

// --- Import after mocks are registered ---

import { POST } from '@/app/api/connect/onboard/route';

function makeRequest(body: Record<string, unknown> = { marinaId: 'marina-uuid-1' }) {
  return new Request('http://localhost/api/connect/onboard', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// --- Tests ---

describe('POST /api/connect/onboard', () => {
  beforeEach(() => {
    mockState.authenticated = true;
    mockState.existingStripeAccountId = null;
    mockState.marinaConnected = false;
    mockState.createAccountError = false;
    mockState.createLinkError = false;
    mockState.dbUpdateError = false;
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  });

  it('returns 401 when user is not authenticated', async () => {
    mockState.authenticated = false;
    const response = await POST(makeRequest());
    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json.error).toBe('Unauthorized');
  });

  it('creates Express account and returns account link URL', async () => {
    const response = await POST(makeRequest());
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.url).toBe('https://connect.stripe.com/setup/e/test');
  });

  it('reuses existing stripe_account_id when onboarding is incomplete', async () => {
    mockState.existingStripeAccountId = 'acct_existing_456';
    mockState.marinaConnected = false;

    const response = await POST(makeRequest());
    expect(response.status).toBe(200);
    const json = await response.json();
    // Should still return a link URL (generated for the existing account)
    expect(json.url).toBe('https://connect.stripe.com/setup/e/test');
  });

  it('returns error when marina is already fully connected', async () => {
    mockState.existingStripeAccountId = 'acct_existing_456';
    mockState.marinaConnected = true;

    const response = await POST(makeRequest());
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Already connected');
  });
});
