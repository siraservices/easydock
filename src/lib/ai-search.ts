import { SHORE_POWER_TYPES } from "@/lib/constants";
import type { SearchFilters } from "@/components/search-filters";

/**
 * Natural-language slip search: turns a sentence like
 * "28 ft sailboat near Fort Lauderdale this weekend under $100, need 30 amp"
 * into the same filters the search form uses.
 *
 * Claude only extracts filters. It never queries the database, so results
 * still come from the existing Supabase query and its RLS policies.
 */

export const AI_SEARCH_MODEL = "claude-haiku-5-5";
export const MAX_QUERY_LENGTH = 300;

/** Map areas the search page can fly to. */
export const SEARCH_AREAS = {
  fort_lauderdale: { label: "Fort Lauderdale", longitude: -80.12, latitude: 26.1 },
  miami: { label: "Miami / Key Biscayne", longitude: -80.17, latitude: 25.74 },
  palm_beach: { label: "Palm Beach", longitude: -80.05, latitude: 26.71 },
  pompano: { label: "Pompano Beach", longitude: -80.09, latitude: 26.23 },
  boca_raton: { label: "Boca Raton", longitude: -80.08, latitude: 26.36 },
} as const;

export type SearchAreaKey = keyof typeof SEARCH_AREAS;

export interface AiSearchResult {
  filters: Partial<SearchFilters>;
  area: SearchAreaKey | null;
  summary: string;
}

const POWER_VALUES = SHORE_POWER_TYPES.map((t) => t.value) as string[];
const AREA_KEYS = Object.keys(SEARCH_AREAS) as SearchAreaKey[];

export const EXTRACT_TOOL = {
  name: "set_search_filters",
  description:
    "Set the marina slip search filters that match the boater's request. Only fill a field when the request states or clearly implies it.",
  input_schema: {
    type: "object",
    properties: {
      check_in: { type: "string", description: "Check-in date, YYYY-MM-DD" },
      check_out: { type: "string", description: "Check-out date, YYYY-MM-DD, after check_in" },
      boat_length_ft: { type: "number", description: "Boat length overall in feet" },
      boat_beam_ft: { type: "number", description: "Boat beam (width) in feet" },
      boat_draft_ft: { type: "number", description: "Boat draft in feet" },
      max_price_per_night: { type: "number", description: "Maximum price per night in USD" },
      shore_power: {
        type: "string",
        enum: POWER_VALUES,
        description:
          "Shore power service. 30 amp = single_30, 50 amp = single_50, two 50 amp = double_50, no power = no_power.",
      },
      area: {
        type: "string",
        enum: AREA_KEYS,
        description: "Area the boater wants to dock in, if named.",
      },
      summary: {
        type: "string",
        description: "One short line restating what you understood, e.g. '28 ft boat, Fri Oct 30–Sun Nov 1, under $100/night, 30 amp, Fort Lauderdale'",
      },
    },
    required: ["summary"],
  },
} as const;

export function buildSystemPrompt(today: string): string {
  return [
    "You turn a boater's request into search filters for EasyDock, a marina slip booking site in South Florida.",
    `Today is ${today} (America/New_York). Resolve relative dates such as "this weekend" or "next Friday" against today.`,
    '"This weekend" means Friday check-in and Sunday check-out. A single night means check_out is the next day.',
    "Convert meters to feet (1 m = 3.28 ft) and round to whole feet.",
    "Leave a field out when the request does not state or clearly imply it. Never invent dimensions or prices.",
    "Always call set_search_filters exactly once.",
  ].join("\n");
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function positiveWhole(value: unknown, max: number): string {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value > max) return "";
  return String(Math.round(value));
}

/**
 * Validates the model's tool input before it reaches the UI.
 * Anything malformed is dropped rather than trusted.
 */
export function sanitizeToolInput(input: unknown, today: string): AiSearchResult {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const filters: Partial<SearchFilters> = {};

  let checkIn = typeof raw.check_in === "string" && DATE_RE.test(raw.check_in) ? raw.check_in : "";
  let checkOut = typeof raw.check_out === "string" && DATE_RE.test(raw.check_out) ? raw.check_out : "";
  if (checkIn && checkIn < today) checkIn = "";
  if (checkOut && (!checkIn || checkOut <= checkIn)) checkOut = "";
  if (checkIn) filters.checkIn = checkIn;
  if (checkOut) filters.checkOut = checkOut;

  const length = positiveWhole(raw.boat_length_ft, 400);
  const beam = positiveWhole(raw.boat_beam_ft, 100);
  const draft = positiveWhole(raw.boat_draft_ft, 50);
  const price = positiveWhole(raw.max_price_per_night, 100000);
  if (length) filters.boatLength = length;
  if (beam) filters.boatBeam = beam;
  if (draft) filters.boatDraft = draft;
  if (price) filters.maxPrice = price;

  if (typeof raw.shore_power === "string" && POWER_VALUES.includes(raw.shore_power)) {
    filters.shorePower = raw.shore_power;
  }

  const area =
    typeof raw.area === "string" && (AREA_KEYS as string[]).includes(raw.area)
      ? (raw.area as SearchAreaKey)
      : null;

  const summary =
    typeof raw.summary === "string" && raw.summary.trim()
      ? raw.summary.trim().slice(0, 200)
      : "Filters updated";

  return { filters, area, summary };
}

/** Today's date in the marina's time zone, YYYY-MM-DD. */
export function todayInNewYork(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
