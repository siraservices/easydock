import { describe, it, vi } from 'vitest';

// --- Controllable mock state ---

const mockState = {
  payoutsEnabled: true,
  detailsSubmitted: true,
  stripeAccountId: 'acct_test_123',
  dbUpdateError: false,
  existingEvent: false,
};

// --- Mock: @/lib/supabase/admin ---

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'stripe_processed_events') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: mockState.existingEvent ? { id: 'evt_test_123' } : null,
                error: null,
              }),
            })),
          })),
          insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      if (table === 'marinas') {
        return {
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: mockState.dbUpdateError ? { message: 'DB write failed' } : null,
            }),
          })),
        };
      }
      return {};
    }),
  })),
}));

// --- Mock: stripe ---

vi.mock('stripe', () => {
  const MockStripe = function (this: unknown) {
    return {
      webhooks: {
        constructEvent: vi.fn(() => ({
          id: 'evt_test_123',
          type: 'account.updated',
          data: {
            object: {
              id: mockState.stripeAccountId,
              payouts_enabled: mockState.payoutsEnabled,
              details_submitted: mockState.detailsSubmitted,
            },
          },
        })),
      },
    };
  };
  return { default: MockStripe };
});

// --- Tests ---

describe('POST /api/webhooks/stripe — account.updated', () => {
  it.todo('updates marinas stripe_onboarding_complete and payouts_enabled on account.updated event');

  it.todo('returns 500 when DB update fails (triggers Stripe retry)');

  it.todo('records event in stripe_processed_events with null booking_id');
});
