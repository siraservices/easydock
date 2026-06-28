import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/email/send", () => ({
  sendMarinaLeadEmails: vi.fn().mockResolvedValue(undefined),
}));

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMarinaLeadEmails } from "@/lib/email/send";
import { POST } from "../route";

const mockedCreateClient = vi.mocked(createClient);
const mockedCreateAdminClient = vi.mocked(createAdminClient);
const mockedSendLeadEmails = vi.mocked(sendMarinaLeadEmails);

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/marina-leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeAuthClient(userId = "user-1") {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } } }),
    },
  };
}

function makeAdminClient(marina: unknown = null, insertData: unknown = { id: "lead-uuid" }) {
  const singleFn = vi.fn();
  const selectFn = vi.fn().mockReturnValue({ single: singleFn });
  const eqFn = vi.fn().mockReturnValue({ select: selectFn, single: singleFn });
  const fromFn = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({ eq: eqFn, single: singleFn }),
    insert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: insertData, error: null }) }) }),
  });

  // Marina lookup
  singleFn.mockResolvedValueOnce({ data: marina, error: marina ? null : { message: "not found" } });
  // Insert
  singleFn.mockResolvedValueOnce({ data: insertData, error: null });

  return { from: fromFn };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/marina-leads", () => {
  it("returns 400 when marinaId is missing", async () => {
    mockedCreateClient.mockResolvedValue(makeAuthClient() as never);
    const res = await POST(makeRequest({ name: "Alice", email: "a@b.com" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/marinaId/);
  });

  it("returns 400 when name is missing", async () => {
    mockedCreateClient.mockResolvedValue(makeAuthClient() as never);
    const res = await POST(makeRequest({ marinaId: "m1", email: "a@b.com" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is invalid", async () => {
    mockedCreateClient.mockResolvedValue(makeAuthClient() as never);
    const res = await POST(makeRequest({ marinaId: "m1", name: "Alice", email: "notanemail" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/email/);
  });

  it("returns 401 when not authenticated", async () => {
    mockedCreateClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as never);
    const res = await POST(makeRequest({ marinaId: "m1", name: "Alice", email: "a@b.com" }));
    expect(res.status).toBe(401);
  });

  it("returns 404 when marina is not found", async () => {
    mockedCreateClient.mockResolvedValue(makeAuthClient() as never);
    const adminMock = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: "not found" } }),
          }),
        }),
        insert: vi.fn(),
      }),
    };
    mockedCreateAdminClient.mockReturnValue(adminMock as never);

    const res = await POST(makeRequest({ marinaId: "bad-id", name: "Alice", email: "a@b.com" }));
    expect(res.status).toBe(404);
  });

  it("returns 409 when marina is already claimed", async () => {
    mockedCreateClient.mockResolvedValue(makeAuthClient() as never);
    const adminMock = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "m1", name: "Marina", city: "Miami", state: "FL", phone: null, website: null, owner_id: "existing-owner" },
              error: null,
            }),
          }),
        }),
        insert: vi.fn(),
      }),
    };
    mockedCreateAdminClient.mockReturnValue(adminMock as never);

    const res = await POST(makeRequest({ marinaId: "m1", name: "Alice", email: "a@b.com" }));
    expect(res.status).toBe(409);
  });

  it("returns 201 and fires emails on valid unclaimed marina lead", async () => {
    mockedCreateClient.mockResolvedValue(makeAuthClient() as never);

    const insertSingle = vi.fn().mockResolvedValue({ data: { id: "lead-1" }, error: null });
    const adminMock = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "marinas") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: "m1", name: "Palm Marina", city: "Miami", state: "FL", phone: "555-1234", website: null, owner_id: null },
                  error: null,
                }),
              }),
            }),
          };
        }
        // marina_spot_requests
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({ single: insertSingle }),
          }),
        };
      }),
    };
    mockedCreateAdminClient.mockReturnValue(adminMock as never);

    const res = await POST(makeRequest({
      marinaId: "m1",
      name: "Alice",
      email: "alice@example.com",
      checkIn: "2026-07-10",
      checkOut: "2026-07-14",
      vesselLengthFt: 38,
    }));

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe("lead-1");
    expect(mockedSendLeadEmails).toHaveBeenCalledWith(
      expect.objectContaining({
        requesterName: "Alice",
        requesterEmail: "alice@example.com",
        marinaName: "Palm Marina",
        checkIn: "2026-07-10",
        checkOut: "2026-07-14",
        vesselLengthFt: 38,
      })
    );
  });

  it("returns 201 even when email send throws", async () => {
    mockedSendLeadEmails.mockRejectedValue(new Error("SMTP failure"));
    mockedCreateClient.mockResolvedValue(makeAuthClient() as never);

    const adminMock = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "marinas") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: "m1", name: "Palm Marina", city: "Miami", state: "FL", phone: null, website: null, owner_id: null },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: { id: "lead-2" }, error: null }) }),
          }),
        };
      }),
    };
    mockedCreateAdminClient.mockReturnValue(adminMock as never);

    const res = await POST(makeRequest({ marinaId: "m1", name: "Bob", email: "bob@example.com" }));
    expect(res.status).toBe(201);
  });
});
