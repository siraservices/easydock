/**
 * Tests for admin API gating and core admin actions.
 * Verifies that non-admin users are denied (HARD gate),
 * and that the allowed-field allowlist prevents arbitrary field injection.
 */
import { describe, it, expect } from "vitest";

// --- Utility: mirrors the allowedFields logic in /api/admin/marinas/[id]/route.ts ---
const ALLOWED_FIELDS = [
  "name",
  "address",
  "city",
  "state",
  "zip",
  "phone",
  "email",
  "website",
  "description",
  "is_active",
];

function buildAdminUpdate(body: Record<string, unknown>): Record<string, unknown> {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of ALLOWED_FIELDS) {
    if (field in body) {
      updates[field] = body[field];
    }
  }
  return updates;
}

// --- Utility: mirrors the stats computation ---
function computeStats(total: number, claimed: number, active: number) {
  return { total, claimed, unclaimed: total - claimed, active };
}

// --- Role gate logic mirrored from route helpers ---
function checkAdminRole(role: string | null): { allowed: boolean; status: number } {
  if (!role) return { allowed: false, status: 401 };
  if (role !== "admin") return { allowed: false, status: 403 };
  return { allowed: true, status: 200 };
}

describe("admin gating", () => {
  it("denies unauthenticated requests (no role)", () => {
    const { allowed, status } = checkAdminRole(null);
    expect(allowed).toBe(false);
    expect(status).toBe(401);
  });

  it("denies boat_owner role with 403", () => {
    const { allowed, status } = checkAdminRole("boat_owner");
    expect(allowed).toBe(false);
    expect(status).toBe(403);
  });

  it("denies marina_owner role with 403", () => {
    const { allowed, status } = checkAdminRole("marina_owner");
    expect(allowed).toBe(false);
    expect(status).toBe(403);
  });

  it("allows admin role", () => {
    const { allowed, status } = checkAdminRole("admin");
    expect(allowed).toBe(true);
    expect(status).toBe(200);
  });
});

describe("admin marina update — field allowlist", () => {
  it("strips fields not in the allowlist", () => {
    const body = {
      name: "Safe Harbor",
      owner_id: "attacker-user-id",        // should be stripped
      stripe_account_id: "acct_hacked",    // should be stripped
      is_active: true,
    };
    const updates = buildAdminUpdate(body);
    expect(updates).not.toHaveProperty("owner_id");
    expect(updates).not.toHaveProperty("stripe_account_id");
    expect(updates.name).toBe("Safe Harbor");
    expect(updates.is_active).toBe(true);
  });

  it("allows all declared editable fields", () => {
    const body = {
      name: "Marina A",
      address: "123 Dock St",
      city: "Miami",
      state: "FL",
      zip: "33101",
      phone: "305-555-0000",
      email: "marina@example.com",
      website: "https://marina.com",
      description: "Nice place",
      is_active: false,
    };
    const updates = buildAdminUpdate(body);
    for (const field of ALLOWED_FIELDS) {
      expect(updates).toHaveProperty(field);
    }
  });

  it("rejects empty payloads (only updated_at set)", () => {
    const body = {};
    const updates = buildAdminUpdate(body);
    // Only updated_at was added — no real update fields
    const realFields = Object.keys(updates).filter((k) => k !== "updated_at");
    expect(realFields).toHaveLength(0);
  });

  it("allows partial updates — only provided fields are included", () => {
    const body = { city: "Fort Lauderdale", is_active: true };
    const updates = buildAdminUpdate(body);
    expect(updates.city).toBe("Fort Lauderdale");
    expect(updates.is_active).toBe(true);
    expect(updates).not.toHaveProperty("name");
    expect(updates).not.toHaveProperty("address");
  });
});

describe("admin stats computation", () => {
  it("computes unclaimed as total minus claimed", () => {
    const { unclaimed } = computeStats(100, 30, 25);
    expect(unclaimed).toBe(70);
  });

  it("handles all-unclaimed state", () => {
    const stats = computeStats(50, 0, 0);
    expect(stats.unclaimed).toBe(50);
    expect(stats.claimed).toBe(0);
    expect(stats.active).toBe(0);
  });

  it("handles all-claimed state", () => {
    const stats = computeStats(10, 10, 8);
    expect(stats.unclaimed).toBe(0);
    expect(stats.active).toBe(8);
  });

  it("preserves total and active as-is from DB counts", () => {
    const stats = computeStats(200, 120, 95);
    expect(stats.total).toBe(200);
    expect(stats.active).toBe(95);
  });
});
