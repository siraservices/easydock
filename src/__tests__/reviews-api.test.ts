import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

const mockGetUser = vi.fn();
const mockAdminFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
  })),
}));

// --- Import after mocks ---

import { POST, GET } from '@/app/api/reviews/route';

function makePostRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(marinaId?: string) {
  const url = marinaId
    ? `http://localhost/api/reviews?marina_id=${marinaId}`
    : 'http://localhost/api/reviews';
  return new Request(url);
}

// --- GET tests ---

describe('GET /api/reviews', () => {
  beforeEach(() => {
    mockAdminFrom.mockReset();
  });

  it('returns 400 if marina_id is missing', async () => {
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('marina_id is required');
  });

  it('returns reviews for a marina', async () => {
    const fakeReviews = [
      { id: 'r1', rating: 5, comment: 'Great!', created_at: '2026-07-01T00:00:00Z', reviewer_id: 'u1', profiles: { full_name: 'Jane' } },
    ];
    mockAdminFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: fakeReviews, error: null }),
        }),
      }),
    });

    const res = await GET(makeGetRequest('marina-123'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.reviews).toEqual(fakeReviews);
  });

  it('returns 500 on DB error', async () => {
    mockAdminFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
        }),
      }),
    });

    const res = await GET(makeGetRequest('marina-123'));
    expect(res.status).toBe(500);
  });
});

// --- POST tests ---

describe('POST /api/reviews', () => {
  beforeEach(() => {
    mockGetUser.mockReset();
    mockAdminFrom.mockReset();
  });

  it('returns 401 if not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(makePostRequest({ booking_id: 'b1', rating: 5 }));
    expect(res.status).toBe(401);
  });

  it('returns 400 if booking_id is missing', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const res = await POST(makePostRequest({ rating: 4 }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('booking_id is required');
  });

  it('returns 400 if rating is out of range', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const res = await POST(makePostRequest({ booking_id: 'b1', rating: 6 }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('rating must be 1–5');
  });

  it('returns 404 if booking not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } });
    mockAdminFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
    });

    const res = await POST(makePostRequest({ booking_id: 'b1', rating: 4 }));
    expect(res.status).toBe(404);
  });

  it('returns 403 if user does not own the booking', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const mockSingle = vi.fn().mockResolvedValue({
      data: { id: 'b1', marina_id: 'm1', boat_owner_id: 'u2', status: 'completed' },
      error: null,
    });
    mockAdminFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
    });

    const res = await POST(makePostRequest({ booking_id: 'b1', rating: 4 }));
    expect(res.status).toBe(403);
  });

  it('returns 422 if booking is not completed', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const mockSingle = vi.fn().mockResolvedValue({
      data: { id: 'b1', marina_id: 'm1', boat_owner_id: 'u1', status: 'confirmed' },
      error: null,
    });
    mockAdminFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
    });

    const res = await POST(makePostRequest({ booking_id: 'b1', rating: 4 }));
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error).toContain('completed');
  });

  it('returns 409 on duplicate review', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    let callCount = 0;
    mockAdminFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'b1', marina_id: 'm1', boat_owner_id: 'u1', status: 'completed' },
                error: null,
              }),
            }),
          }),
        };
      }
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: '23505', message: 'duplicate' } }),
          }),
        }),
      };
    });

    const res = await POST(makePostRequest({ booking_id: 'b1', rating: 5 }));
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toContain('already reviewed');
  });

  it('returns 201 with review on success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } });
    const fakeReview = { id: 'r1', booking_id: 'b1', marina_id: 'm1', reviewer_id: 'u1', rating: 5, comment: 'Great!', created_at: '2026-07-08T00:00:00Z' };
    let callCount = 0;
    mockAdminFrom.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'b1', marina_id: 'm1', boat_owner_id: 'u1', status: 'completed' },
                error: null,
              }),
            }),
          }),
        };
      }
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: fakeReview, error: null }),
          }),
        }),
      };
    });

    const res = await POST(makePostRequest({ booking_id: 'b1', rating: 5, comment: 'Great!' }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.review.id).toBe('r1');
    expect(json.review.rating).toBe(5);
  });
});
