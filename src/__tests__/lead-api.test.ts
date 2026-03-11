import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mock: @/lib/supabase/admin ---

const mockInsert = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: mockInsert,
    })),
  })),
}));

// --- Import after mocks are registered ---

import { POST } from '@/app/api/leads/route';

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// --- Tests ---

describe('POST /api/leads: validation', () => {
  beforeEach(() => {
    mockInsert.mockClear();
    mockInsert.mockResolvedValue({ data: null, error: null });
  });

  it('returns 201 with success:true for valid input', async () => {
    const response = await POST(makeRequest({
      name: 'Jane Smith',
      email: 'jane@example.com',
      user_type: 'yacht_owner',
    }));
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(mockInsert).toHaveBeenCalledWith({
      name: 'Jane Smith',
      email: 'jane@example.com',
      user_type: 'yacht_owner',
    });
  });

  it('returns 400 with name error when name is empty', async () => {
    const response = await POST(makeRequest({
      name: '',
      email: 'jane@example.com',
      user_type: 'yacht_owner',
    }));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.errors.name).toBe('Name is required');
  });

  it('returns 400 with name error when name is only whitespace', async () => {
    const response = await POST(makeRequest({
      name: '   ',
      email: 'jane@example.com',
      user_type: 'yacht_owner',
    }));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.errors.name).toBe('Name is required');
  });

  it('returns 400 with email error when email is invalid', async () => {
    const response = await POST(makeRequest({
      name: 'Jane Smith',
      email: 'not-an-email',
      user_type: 'yacht_owner',
    }));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.errors.email).toBe('Invalid email');
  });

  it('returns 400 with user_type error when user_type is missing', async () => {
    const response = await POST(makeRequest({
      name: 'Jane Smith',
      email: 'jane@example.com',
    }));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.errors.user_type).toBe('Please select a user type');
  });

  it('returns 400 with all errors when all fields are missing', async () => {
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.errors.name).toBe('Name is required');
    expect(json.errors.email).toBe('Invalid email');
    expect(json.errors.user_type).toBe('Please select a user type');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('returns 500 with error message on DB failure', async () => {
    mockInsert.mockResolvedValue({ data: null, error: { message: 'DB error' } });
    const response = await POST(makeRequest({
      name: 'Jane Smith',
      email: 'jane@example.com',
      user_type: 'marina_owner',
    }));
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json.error).toBe('Failed to save');
  });
});
