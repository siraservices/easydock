import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Controllable mock state ---

const mockState = {
  payoutsEnabled: true,
  detailsSubmitted: true,
  stripeAccountId: 'acct_test_123',
  dbUpdateError: false,
  existingEvent: false,
};

// --- Mock insert/update fns for assertions ---

const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
const mockUpdate = vi.fn();

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
          insert: mockInsert,
        };
      }
      if (table === 'marinas') {
        return {
          update: vi.fn(() => ({
            eq: mockUpdate.mockResolvedValue({
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
          account: mockState.stripeAccountId,
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

// --- Import after mocks ---

import { POST } from '@/app/api/webhooks/stripe/route';

function makeRequest(body = '{}') {
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body,
    headers: { 'stripe-signature': 'sig_test' },
  });
}

// --- Tests ---

describe('POST /api/webhooks/stripe — account.updated', () => {
  beforeEach(() => {
    mockState.payoutsEnabled = true;
    mockState.detailsSubmitted = true;
    mockState.stripeAccountId = 'acct_test_123';
    mockState.dbUpdateError = false;
    mockState.existingEvent = false;
    mockInsert.mockClear();
    mockUpdate.mockClear();
    mockInsert.mockResolvedValue({ data: null, error: null });
  });

  it('updates marinas stripe_onboarding_complete and payouts_enabled on account.updated event', async () => {
    const response = await POST(makeRequest());
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.received).toBe(true);

    // marinas table must have been updated
    expect(mockUpdate).toHaveBeenCalled();

    // Event must be recorded in stripe_processed_events with null booking_id
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'evt_test_123',
        event_type: 'account.updated',
        booking_id: null,
      })
    );
  });

  it('returns 500 when DB update fails (triggers Stripe retry)', async () => {
    mockState.dbUpdateError = true;

    const response = await POST(makeRequest());
    expect(response.status).toBe(500);

    // Event must NOT be recorded — DB failed, Stripe must retry
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('records event in stripe_processed_events with null booking_id', async () => {
    const response = await POST(makeRequest());
    expect(response.status).toBe(200);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        booking_id: null,
        event_type: 'account.updated',
      })
    );
  });
});
