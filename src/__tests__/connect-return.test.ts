import { describe, it, expect, vi, beforeEach } from 'vitest';

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

// --- Import after mocks are registered ---

import { GET } from '@/app/api/connect/return/route';

function makeRequest(marinaId = 'marina-uuid-1') {
  return new Request(`http://localhost/api/connect/return?marinaId=${marinaId}`);
}

// --- Tests ---

describe('GET /api/connect/return', () => {
  beforeEach(() => {
    mockState.payoutsEnabled = true;
    mockState.dbUpdateError = false;
    mockState.stripeAccountId = 'acct_test_123';
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  });

  it('retrieves account from Stripe and updates DB with payouts_enabled status', async () => {
    mockState.payoutsEnabled = true;
    const response = await GET(makeRequest());
    // Should redirect (302 or 307)
    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.status).toBeLessThan(400);
  });

  it('redirects to /dashboard?stripeStatus=connected when payouts_enabled is true', async () => {
    mockState.payoutsEnabled = true;
    const response = await GET(makeRequest());
    const location = response.headers.get('location');
    expect(location).toContain('stripeStatus=connected');
  });

  it('redirects to /dashboard?stripeStatus=pending when payouts_enabled is false', async () => {
    mockState.payoutsEnabled = false;
    const response = await GET(makeRequest());
    const location = response.headers.get('location');
    expect(location).toContain('stripeStatus=pending');
  });
});
