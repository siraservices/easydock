import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock global fetch before importing the route
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Set MAPBOX_ACCESS_TOKEN before importing
process.env.MAPBOX_ACCESS_TOKEN = 'pk.test_token_123';

// Import the route handler after mocks are set up
import { POST } from '@/app/api/marinas/geocode/route';

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/marinas/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeMapboxResponse(features: unknown[]) {
  return {
    ok: true,
    json: () =>
      Promise.resolve({
        features,
      }),
  };
}

describe('Geocode API: input validation', () => {
  it('returns 400 when address is missing', async () => {
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBeDefined();
  });

  it('returns 400 when address is empty string', async () => {
    const response = await POST(makeRequest({ address: '' }));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBeDefined();
  });
});

describe('Geocode API: successful geocoding', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns lat and lng when Mapbox returns a result', async () => {
    mockFetch.mockResolvedValue(
      makeMapboxResponse([
        {
          geometry: {
            coordinates: [-80.1918, 25.7617], // [lng, lat] per v6 format
          },
        },
      ])
    );

    const response = await POST(makeRequest({ address: '123 Main St, Miami, FL' }));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.lat).toBeCloseTo(25.7617);
    expect(json.lng).toBeCloseTo(-80.1918);
  });

  it('returns null lat/lng when Mapbox returns no features', async () => {
    mockFetch.mockResolvedValue(makeMapboxResponse([]));

    const response = await POST(makeRequest({ address: 'Nowhere, ZZ 99999' }));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.lat).toBeNull();
    expect(json.lng).toBeNull();
  });
});

describe('Geocode API: Mapbox error handling', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns null lat/lng when Mapbox returns non-200 response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ message: 'Rate limited' }),
    });

    const response = await POST(makeRequest({ address: '123 Main St, Miami, FL' }));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.lat).toBeNull();
    expect(json.lng).toBeNull();
  });

  it('returns null lat/lng when fetch throws (network error)', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'));

    const response = await POST(makeRequest({ address: '123 Main St, Miami, FL' }));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.lat).toBeNull();
    expect(json.lng).toBeNull();
  });
});
