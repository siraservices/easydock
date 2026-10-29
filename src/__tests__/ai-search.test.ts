import { describe, it, expect, vi, beforeEach } from "vitest";
import { sanitizeToolInput, todayInNewYork, buildSystemPrompt } from "@/lib/ai-search";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { POST } from "@/app/api/ai-search/route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/ai-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function claudeResponse(input: unknown) {
  return {
    ok: true,
    json: () =>
      Promise.resolve({
        content: [
          { type: "thinking", thinking: "" },
          { type: "tool_use", name: "set_search_filters", input },
        ],
      }),
  };
}

describe("sanitizeToolInput", () => {
  const today = "2026-10-29";

  it("maps a full tool input onto the search form fields", () => {
    const result = sanitizeToolInput(
      {
        check_in: "2026-10-30",
        check_out: "2026-11-01",
        boat_length_ft: 28,
        boat_beam_ft: 9.6,
        boat_draft_ft: 4,
        max_price_per_night: 100,
        shore_power: "single_30",
        area: "fort_lauderdale",
        summary: "28 ft, Oct 30–Nov 1, under $100, 30 amp, Fort Lauderdale",
      },
      today
    );
    expect(result.filters).toEqual({
      checkIn: "2026-10-30",
      checkOut: "2026-11-01",
      boatLength: "28",
      boatBeam: "10",
      boatDraft: "4",
      maxPrice: "100",
      shorePower: "single_30",
    });
    expect(result.area).toBe("fort_lauderdale");
    expect(result.summary).toContain("28 ft");
  });

  it("drops past dates and a check-out before check-in", () => {
    expect(sanitizeToolInput({ check_in: "2026-10-01", summary: "x" }, today).filters.checkIn).toBeUndefined();
    const r = sanitizeToolInput({ check_in: "2026-11-05", check_out: "2026-11-04", summary: "x" }, today);
    expect(r.filters.checkIn).toBe("2026-11-05");
    expect(r.filters.checkOut).toBeUndefined();
  });

  it("rejects values outside the allowed sets", () => {
    const r = sanitizeToolInput(
      {
        shore_power: "single_480",
        area: "tampa",
        boat_length_ft: -5,
        max_price_per_night: "cheap",
        check_in: "next friday",
        summary: "x",
      },
      today
    );
    expect(r.filters).toEqual({});
    expect(r.area).toBeNull();
  });

  it("tolerates a missing or non-object input", () => {
    expect(sanitizeToolInput(null, today)).toEqual({ filters: {}, area: null, summary: "Filters updated" });
  });
});

describe("todayInNewYork / buildSystemPrompt", () => {
  it("uses the New York calendar date", () => {
    // 02:00 UTC on Oct 30 is still Oct 29 in New York
    expect(todayInNewYork(new Date("2026-10-30T02:00:00Z"))).toBe("2026-10-29");
  });
  it("puts today's date in the prompt", () => {
    expect(buildSystemPrompt("2026-10-29")).toContain("Today is 2026-10-29");
  });
});

describe("POST /api/ai-search", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    process.env.ANTHROPIC_API_KEY = "sk-ant-test";
  });

  it("returns 400 for an empty or oversized query", async () => {
    expect((await POST(makeRequest({ query: "  " }))).status).toBe(400);
    expect((await POST(makeRequest({ query: "a".repeat(301) }))).status).toBe(400);
    expect((await POST(makeRequest("not json"))).status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns 503 when the API key is missing", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const res = await POST(makeRequest({ query: "30 ft boat" }));
    expect(res.status).toBe(503);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("calls Claude with a forced tool and returns validated filters", async () => {
    mockFetch.mockResolvedValueOnce(
      claudeResponse({ boat_length_ft: 45, shore_power: "single_50", area: "miami", summary: "45 ft, 50 amp, Miami" })
    );
    const res = await POST(makeRequest({ query: "45' yacht needs 50 amp in Miami" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.filters).toEqual({ boatLength: "45", shorePower: "single_50" });
    expect(data.area).toBe("miami");

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect(init.headers["x-api-key"]).toBe("sk-ant-test");
    const sent = JSON.parse(init.body);
    expect(sent.model).toBe("claude-haiku-5-5");
    expect(sent.tool_choice).toEqual({ type: "tool", name: "set_search_filters" });
    expect(sent).not.toHaveProperty("temperature");
    expect(sent.messages.at(-1).role).toBe("user");
  });

  it("returns 502 when Claude errors and 422 when no tool call comes back", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 529, text: () => Promise.resolve("overloaded") });
    expect((await POST(makeRequest({ query: "boat" }))).status).toBe(502);

    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ content: [{ type: "text", text: "hi" }] }) });
    expect((await POST(makeRequest({ query: "boat" }))).status).toBe(422);

    mockFetch.mockRejectedValueOnce(new Error("timeout"));
    expect((await POST(makeRequest({ query: "boat" }))).status).toBe(502);
  });
});
