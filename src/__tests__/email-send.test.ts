import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Hoisted mock functions (must be declared before vi.mock calls) ---

const mockSend = vi.hoisted(() => vi.fn());

// --- Mock: resend ---

vi.mock('resend', () => ({
  Resend: vi.fn(function () {
    return {
      emails: {
        send: mockSend,
      },
    };
  }),
}));

// --- Controllable mock state ---

const mockAdminClientState = {
  bookingData: {
    id: 'booking-uuid-1',
    check_in: '2026-06-01',
    check_out: '2026-06-05',
    total_price: 400,
    boat_owner_id: 'boat-owner-uuid-1',
    slips: { name: 'Slip A', marinas: { id: 'marina-uuid-1', name: 'Sunny Marina', owner_id: 'marina-owner-uuid-1' } },
  },
  boatOwnerEmail: 'boat@example.com',
  marinaOwnerEmail: 'marina@example.com',
};

const makeMockAdminClient = () => ({
  from: vi.fn((table: string) => {
    if (table === 'bookings') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: mockAdminClientState.bookingData,
              error: null,
            }),
          })),
        })),
      };
    }
    if (table === 'profiles') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn().mockImplementation((_col: string, val: string) => ({
            single: vi.fn().mockResolvedValue({
              data: {
                email:
                  val === 'boat-owner-uuid-1'
                    ? mockAdminClientState.boatOwnerEmail
                    : mockAdminClientState.marinaOwnerEmail,
              },
              error: null,
            }),
          })),
        })),
      };
    }
    return { select: vi.fn() };
  }),
});

// --- Import after mocks ---

import { sendBookingEmail, fetchBookingEmailParams } from '@/lib/email/send';

// --- Tests ---

describe('sendBookingEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({ data: { id: 'email-id-123' }, error: null });
  });

  const baseParams = {
    bookingId: 'booking-uuid-1',
    marinaName: 'Sunny Marina',
    slipName: 'Slip A',
    checkIn: '2026-06-01',
    checkOut: '2026-06-05',
    totalPrice: 400,
    boatOwnerEmail: 'boat@example.com',
    marinaOwnerEmail: 'marina@example.com',
  };

  it('sends from EasyDock bookings address', async () => {
    await sendBookingEmail('created', baseParams);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'EasyDock <bookings@easydock.com>',
      })
    );
  });

  it('sends to BOTH parties when trigger is created', async () => {
    await sendBookingEmail('created', baseParams);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.arrayContaining(['boat@example.com', 'marina@example.com']),
      })
    );
    const call = mockSend.mock.calls[0][0];
    expect(call.to).toHaveLength(2);
  });

  it('sends to yacht owner only when trigger is approved', async () => {
    await sendBookingEmail('approved', baseParams);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['boat@example.com'],
      })
    );
  });

  it('sends to yacht owner only when trigger is denied', async () => {
    await sendBookingEmail('denied', baseParams);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['boat@example.com'],
      })
    );
  });

  it('sends to BOTH parties when trigger is cancelled', async () => {
    await sendBookingEmail('cancelled', baseParams);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.arrayContaining(['boat@example.com', 'marina@example.com']),
      })
    );
    const call = mockSend.mock.calls[0][0];
    expect(call.to).toHaveLength(2);
  });

  it('logs error but does not throw when Resend returns an error', async () => {
    mockSend.mockResolvedValue({ data: null, error: { message: 'Resend API error' } });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(sendBookingEmail('created', baseParams)).resolves.toBeUndefined();
    consoleSpy.mockRestore();
  });

  it('does not throw when Resend SDK throws an exception', async () => {
    mockSend.mockRejectedValue(new Error('Network failure'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(sendBookingEmail('created', baseParams)).resolves.toBeUndefined();
    consoleSpy.mockRestore();
  });
});

describe('fetchBookingEmailParams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches booking details and returns BookingEmailParams with both emails', async () => {
    const adminClient = makeMockAdminClient() as never;
    const params = await fetchBookingEmailParams(adminClient, 'booking-uuid-1');

    expect(params.bookingId).toBe('booking-uuid-1');
    expect(params.marinaName).toBe('Sunny Marina');
    expect(params.slipName).toBe('Slip A');
    expect(params.checkIn).toBe('2026-06-01');
    expect(params.checkOut).toBe('2026-06-05');
    expect(params.totalPrice).toBe(400);
    expect(params.boatOwnerEmail).toBe('boat@example.com');
    expect(params.marinaOwnerEmail).toBe('marina@example.com');
  });
});
