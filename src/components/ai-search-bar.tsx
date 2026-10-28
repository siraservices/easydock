"use client";

import { useState } from "react";
import type { AiSearchResult } from "@/lib/ai-search";
import { MAX_QUERY_LENGTH } from "@/lib/ai-search";

const EXAMPLES = [
  "28 ft sailboat in Fort Lauderdale this weekend under $100",
  "45' motor yacht, 15 ft beam, 5 ft draft, needs 50 amp, Miami",
  "Center console for one night next Friday, cheapest option",
];

interface AiSearchBarProps {
  onResult: (result: AiSearchResult) => void;
}

export default function AiSearchBar({ onResult }: AiSearchBarProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  async function run(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "AI search is unavailable right now");
        return;
      }
      setSummary(data.summary);
      onResult(data as AiSearchResult);
    } catch {
      setError("AI search is unavailable right now");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-navy-800 rounded-xl p-4 mb-4 text-white">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(query);
        }}
        className="flex gap-2"
      >
        <label htmlFor="ai-search" className="sr-only">
          Describe the slip you need
        </label>
        <input
          id="ai-search"
          type="text"
          value={query}
          maxLength={MAX_QUERY_LENGTH}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your boat and trip — e.g. 28 ft sailboat in Fort Lauderdale this weekend under $100"
          className="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-teal-500 hover:bg-teal-400 disabled:opacity-60 text-white px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors"
        >
          {loading ? "Thinking…" : "Ask AI"}
        </button>
      </form>

      {error ? (
        <p className="mt-2 text-xs text-red-200" role="alert">
          {error}. You can still use the filters below.
        </p>
      ) : summary ? (
        <p className="mt-2 text-xs text-teal-100" aria-live="polite">
          <span className="font-semibold">Understood:</span> {summary}
        </p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setQuery(example);
                run(example);
              }}
              className="text-xs bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
