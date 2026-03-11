---
phase: 03-map-search
plan: 01
subsystem: search
tags: [mapbox, react-map-gl, viewport-filtering, search, unauthenticated]
dependency_graph:
  requires: []
  provides: [map-search-page, viewport-filter-hook, mapview-component]
  affects: [src/app/search/page.tsx, src/components/search-filters.tsx]
tech_stack:
  added: [react-map-gl, mapbox-gl, "@types/mapbox-gl"]
  patterns: [dynamic-import-ssr-false, tdd-red-green, viewport-reactive-list]
key_files:
  created:
    - src/components/map-view.tsx
    - src/lib/hooks/use-map-filter.ts
    - src/__tests__/use-map-filter.test.ts
  modified:
    - src/app/search/page.tsx
    - src/components/search-filters.tsx
    - .env.local
decisions:
  - "AnySupabaseClient any-type used in buildSlipQuery to avoid Supabase v2 generic arity mismatch between SupabaseClient<Database> and the 4-parameter internal signature"
  - "MapView initializes visibleMarinaIds to all marinas on first render so the list is not empty before the first map move event fires"
  - "Search button triggers Supabase re-fetch; viewport pan/zoom updates visible list client-side without re-fetching"
metrics:
  duration: 5 min
  completed_date: "2026-03-11"
  tasks: 2
  files_created: 3
  files_modified: 3
requirements_satisfied: [SRCH-01, SRCH-02, SRCH-03]
---

# Phase 3 Plan 1: Map Search — Interactive Mapbox Split View Summary

**One-liner:** Replaced text-only search with a Mapbox split-view page — marina pins on the left, a viewport-synced slip list on the right, with beam and length dimension filters, accessible without login.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (TDD) | Install deps, env var, MapView + use-map-filter | 64704ac | src/components/map-view.tsx, src/lib/hooks/use-map-filter.ts, package.json |
| 2 | Rewrite search page + updated filters | 2d87275 | src/app/search/page.tsx, src/components/search-filters.tsx |

## What Was Built

### `src/lib/hooks/use-map-filter.ts`
Two pure exported functions:
- `filterMarinasByViewport(marinas, bounds)` — filters by `bounds.contains([lng, lat])`, excludes null lat/lng
- `buildSlipQuery(supabase, filters)` — builds Supabase query with `is_available`, `is_active`, null-lat/lng guards, optional `length_ft` and `width_ft` filters. No city filter.

### `src/components/map-view.tsx`
Client component using `react-map-gl/mapbox`. Features:
- Marina markers with teal-600 circle + anchor SVG icon
- Hovered marker: scale(1.3) + navy-800 color
- `onMoveEnd` updates visible marina IDs via callback
- Initializes visible IDs to all valid marinas on mount (prevents empty list before first pan)
- Dynamic `mapboxAccessToken` from `process.env.NEXT_PUBLIC_MAPBOX_TOKEN`

### `src/app/search/page.tsx`
- Removed `ProtectedRoute` — page accessible without authentication (SRCH-02)
- Dynamic import of MapView with `ssr: false`
- Split layout: `w-[60%]` sticky map | `w-[40%]` scrollable list
- `buildSlipQuery` from hook for data fetching
- Date conflict-check logic preserved
- `EmptyState` shown when no visible slips in viewport

### `src/components/search-filters.tsx`
- Removed `city` field and `DEFAULT_CITY` import
- Added `boatBeam` (Boat Beam ft) number input
- `SearchFilters` interface: `{ checkIn, checkOut, boatLength, boatBeam }`
- Grid changed from `lg:grid-cols-5` to `lg:grid-cols-4`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Supabase client generic arity mismatch**
- **Found during:** Task 2 build verification
- **Issue:** `SupabaseClient<Database>` from `@supabase/supabase-js` expects 4 type parameters in this version; passing the browser client to `buildSlipQuery(supabase, filters)` caused a TypeScript error
- **Fix:** Replaced `SupabaseClient<Database>` parameter type with `any` (aliased as `AnySupabaseClient`) in `use-map-filter.ts`. The runtime behavior is identical; only the compile-time type is relaxed.
- **Files modified:** `src/lib/hooks/use-map-filter.ts`
- **Commit:** 2d87275 (included in Task 2 commit)

## Verification Results

- `npx vitest run`: 62 tests passing across 8 test files (including 14 new tests for use-map-filter)
- `npx next build`: compiled successfully, no TypeScript errors
- `/search` page is 4 kB client bundle, statically prerendered shell

## Self-Check

- [x] `src/components/map-view.tsx` — created
- [x] `src/lib/hooks/use-map-filter.ts` — created
- [x] `src/__tests__/use-map-filter.test.ts` — created
- [x] `src/app/search/page.tsx` — modified
- [x] `src/components/search-filters.tsx` — modified
- [x] Commits 5b09a5d, 64704ac, 2d87275 — all exist
- [x] Build passes, 62/62 tests green
