import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Controllable mock state ---

const mockState = {
  existingEvent: false,
  updateError: false,
  refundMock: vi.fn().mockResolvedValue({ id: 'ref_test' }),
  eventType: 'checkout.session.completed',
  bookingId: 'booking-uuid-1' as string | null,
  paymentIntent: 'pi_test_abc',
};

// --- Mock: @/lib/supabase/admin ---

const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockSingle = vi.fn();

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
          insert: mockInsert.mockResolvedValue({ data: null, error: null }),
        };
      }
      if (table === 'bookings') {
        return {
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: mockState.updateError ? { message: 'DB write failed' } : null,
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
  // Return a constructor function (class-like)
  const MockStripe = function (this: unknown) {
    return {
      webhooks: {
        constructEvent: vi.fn(() => ({
          id: 'evt_test_123',
          type: mockState.eventType,
          data: {
            object: {
              metadata: { booking_id: mockState.bookingId },
              payment_intent: mockState.paymentIntent,
            },
          },
        })),
      },
      refunds: {
        create: mockState.refundMock,
      },
    };
  };
  return { default: MockStripe };
});

// --- Import after mocks are registered ---

import { POST } from '@/app/api/webhooks/stripe/route';

function makeRequest(hasSignature = true, body = '{}') {
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body,
    headers: hasSignature ? { 'stripe-signature': 'sig_test' } : {},
  });
}

// --- Tests ---

describe('Webhook handler: stripe signature validation', () => {
  it('returns 400 when stripe-signature header is missing', async () => {
    const response = await POST(makeRequest(false));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe('Missing signature');
  });
});

describe('Webhook handler: idempotency', () => {
  beforeEach(() => {
    // Reset to defaults before each test
    mockState.existingEvent = false;
    mockState.updateError = false;
    mockState.eventType = 'checkout.session.completed';
    mockState.bookingId = 'booking-uuid-1';
    mockState.paymentIntent = 'pi_test_abc';
    mockInsert.mockClear();
    mockUpdate.mockClear();
    mockSingle.mockClear();
    mockState.refundMock.mockClear();
  });

  it('returns 200 without processing when event already in stripe_processed_events', async () => {
    mockState.existingEvent = true;

    const response = await POST(makeRequest());
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.received).toBe(true);

    // insert should NOT have been called — event already processed
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('updates booking to confirmed and records event on checkout.session.completed', async () => {
    mockState.existingEvent = false;
    mockState.eventType = 'checkout.session.completed';

    const response = await POST(makeRequest());
    expect(response.status).toBe(200);

    // Event should have been recorded in stripe_processed_events
    expect(mockInsert).toHaveBeenCalled();
  });

  it('returns 500 and attempts refund when DB write fails on checkout.session.completed', async () => {
    mockState.existingEvent = false;
    mockState.updateError = true;
    mockState.eventType = 'checkout.session.completed';

    const response = await POST(makeRequest());
    expect(response.status).toBe(500);

    // Auto-refund must be attempted
    expect(mockState.refundMock).toHaveBeenCalledWith({
      payment_intent: 'pi_test_abc',
    });

    // Event must NOT be recorded — DB failed, Stripe must retry
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('cancels booking and returns 200 on checkout.session.expired', async () => {
    mockState.existingEvent = false;
    mockState.eventType = 'checkout.session.expired';

    const response = await POST(makeRequest());
    expect(response.status).toBe(200);

    // Event should be recorded after successful cancellation
    expect(mockInsert).toHaveBeenCalled();
  });

  it('records event with null booking_id when checkout.session.completed has no booking in metadata', async () => {
    mockState.existingEvent = false;
    mockState.eventType = 'checkout.session.completed';
    mockState.bookingId = null;

    const response = await POST(makeRequest());
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.received).toBe(true);

    // Event must still be recorded with null booking_id
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ booking_id: null, event_type: 'checkout.session.completed' })
    );
  });

  it('records event with null booking_id when checkout.session.expired has no booking in metadata', async () => {
    mockState.existingEvent = false;
    mockState.eventType = 'checkout.session.expired';
    mockState.bookingId = null;

    const response = await POST(makeRequest());
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.received).toBe(true);

    // Event must still be recorded with null booking_id
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ booking_id: null, event_type: 'checkout.session.expired' })
    );
  });
});
