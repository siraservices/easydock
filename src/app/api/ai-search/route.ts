import { NextResponse } from "next/server";
import {
  AI_SEARCH_MODEL,
  EXTRACT_TOOL,
  MAX_QUERY_LENGTH,
  buildSystemPrompt,
  sanitizeToolInput,
  todayInNewYork,
} from "@/lib/ai-search";

/**
 * POST /api/ai-search  { query: string }
 * Returns { filters, area, summary } for the search page to apply.
 * The API key stays server-side; the browser only ever sees validated filters.
 */
export async function POST(request: Request) {
  let body: { query?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { error: `query must be ${MAX_QUERY_LENGTH} characters or fewer` },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI search is not configured" },
      { status: 503 }
    );
  }

  const today = todayInNewYork();

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: AI_SEARCH_MODEL,
        max_tokens: 1024,
        system: buildSystemPrompt(today),
        tools: [EXTRACT_TOOL],
        tool_choice: { type: "tool", name: EXTRACT_TOOL.name },
        messages: [{ role: "user", content: query }],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.error("AI search upstream error:", res.status, await res.text());
      return NextResponse.json(
        { error: "AI search is unavailable right now" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      content?: Array<{ type: string; name?: string; input?: unknown }>;
    };
    // Select the tool call by type, not position.
    const toolUse = data.content?.find(
      (block) => block.type === "tool_use" && block.name === EXTRACT_TOOL.name
    );
    if (!toolUse) {
      return NextResponse.json(
        { error: "Could not understand that search" },
        { status: 422 }
      );
    }

    return NextResponse.json(sanitizeToolInput(toolUse.input, today));
  } catch (err) {
    console.error("AI search failed:", err);
    return NextResponse.json(
      { error: "AI search is unavailable right now" },
      { status: 502 }
    );
  }
}
