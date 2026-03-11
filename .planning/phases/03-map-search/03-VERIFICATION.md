---
phase: 03-map-search
verified: 2026-03-11T20:36:00Z
status: gaps_found
score: 8/9 must-haves verified
re_verification: false
gaps:
  - truth: "Build passes, tests pass"
    status: failed
    reason: "buildSlipQuery in use-map-filter.ts is missing the .not('marinas.lat', 'is', null) and .not('marinas.lng', 'is', null) guards. The test at src/__tests__/use-map-filter.test.ts:136-137 expects these calls and fails. 13/14 tests pass; 1 fails."
    artifacts:
      - path: "src/lib/hooks/use-map-filter.ts"
        issue: "buildSlipQuery builds the base query with .eq('is_available', true) and .eq('marinas.is_active', true) but never calls .not() to exclude marinas with null coordinates. The plan spec (Plan 01, Task 1, action #3) and the test both require these two guards."
    missing:
      - "Add .not('marinas.lat', 'is', null) and .not('marinas.lng', 'is', null) to the base query chain in buildSlipQuery"
human_verification:
  - test: "Visitor can browse without signing in"
    expected: "/search loads fully in a private/incognito browser window with no auth redirect"
    why_human: "ProtectedRoute removal is verified in code, but cookie state and SSR redirect logic cannot be confirmed programmatically"
  - test: "Map renders marina pins and viewport filtering works"
    expected: "Marina pins appear on the Mapbox map; panning updates the slip list to show only visible marinas"
    why_human: "Mapbox map rendering and viewport callback require a real browser environment"
  - test: "Hover sync is bi-directional"
    expected: "Hovering a slip card highlights the corresponding pin; hovering a pin highlights and scrolls the card"
    why_human: "Mouse event interaction and scroll behavior require a real browser"
  - test: "Mobile layout toggles correctly"
    expected: "At mobile width: list shows first with floating Show Map button; tapping it opens full-screen map overlay with X and Show List buttons"
    why_human: "Responsive layout breakpoints require real browser resize"
---

# Phase 3: Map Search Verification Report

**Phase Goal:** Replace text-based search with interactive map showing marina pins in split map/list layout. Yacht owners browse slips without signing in, filter by vessel dimensions.
**Verified:** 2026-03-11T20:36:00Z
**Status:** gaps_found — 1 failing test, all other goal behaviors verified in code
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Visitor not logged in can navigate to /search and see a Mapbox map with marina pins | VERIFIED | ProtectedRoute removed (confirmed grep). MapView dynamically imported ssr:false. No auth import in search page. |
| 2 | Clicking a pin shows slip details for that marina | VERIFIED | Marker `onClick` calls `onSelectMarina(marina.id)` (map-view.tsx:146-149); search page `handleSelectMarina` scrolls list to `marina-{id}` element |
| 3 | The slip list on the right shows only marinas visible in the current map viewport | VERIFIED | `onMoveEnd` → `filterMarinasByViewport` → `onVisibleMarinaIdsChange`; `visibleSlips` derived as `slips.filter(s => visibleMarinaIds.has(s.marinas.id))` |
| 4 | Entering a beam value filters out slips narrower than the entered beam | VERIFIED | `buildSlipQuery` adds `.gte("width_ft", ...)` when `boatBeam` set (use-map-filter.ts:54-57); mock fallback also applies beam filter |
| 5 | Entering a boat length filters out slips shorter than the entered length | VERIFIED | `buildSlipQuery` adds `.gte("length_ft", ...)` when `boatLength` set (use-map-filter.ts:50-53); mock fallback also applies length filter |
| 6 | Hovering a slip card highlights the corresponding pin on the map | VERIFIED | SlipCard `onMouseEnter` calls `onHover?.(marina.id)`; search page wires this to `handleHoverMarinaFromList` → `setHoveredMarinaId`; MapView scales and recolors pin when `hoveredMarinaId === marina.id` |
| 7 | Hovering a pin highlights/scrolls to the corresponding card in the list | VERIFIED | MapView `onHoverMarina` → `handleHoverMarinaFromMap`; `useEffect` on `hoveredMarinaId` scrolls `[data-marina-id]` element when `hoverSource === 'map'`; SlipCard gets `isHighlighted` prop adding `ring-2 ring-teal-500` |
| 8 | On mobile the page shows a slip list first with a floating Show Map button | VERIFIED | `md:hidden` container shows list + floating button (`fixed bottom-6 ... bg-navy-800`). `showMobileMap` state controls overlay. |
| 9 | Build passes, tests pass | FAILED | Next.js build passes (confirmed after `.next` cache clear). But 1 of 14 unit tests fails: `buildSlipQuery > builds base query with required filters` — `.not("marinas.lat", "is", null)` never called in implementation. |

**Score:** 8/9 truths verified

---

## Required Artifacts

### Plan 01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/map-view.tsx` | Interactive Mapbox map with marina markers and viewport filtering | VERIFIED | 183 lines. Exports default `MapView`. Uses `react-map-gl/mapbox` Map+Marker. `onMoveEnd` calls `filterMarinasByViewport`. All required props present including `initialCenter`. |
| `src/app/search/page.tsx` | Split map/list search page without ProtectedRoute | VERIFIED | 294 lines (well above min 60). No ProtectedRoute. Dynamic import of MapView with `ssr: false`. 60/40 split layout. Geolocation, hover sync, mobile overlay all wired. |
| `src/components/search-filters.tsx` | Updated filters with beam field, no city field | VERIFIED | Exports `SearchFilters` interface and `default SearchFiltersBar`. Interface: `{checkIn, checkOut, boatLength, boatBeam}`. No city field. `lg:grid-cols-4` grid. |
| `src/lib/hooks/use-map-filter.ts` | Pure logic for viewport filtering and query building | PARTIAL | Exports `filterMarinasByViewport` and `buildSlipQuery`. `filterMarinasByViewport` is correct. `buildSlipQuery` is missing the `.not()` null-coordinate guards required by plan spec and enforced by test. |

### Plan 02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/map-view.tsx` | Map with hover-highlighted pins and geolocation support | VERIFIED | 183 lines (above min 60). `initialCenter` prop present. `flyTo` on geolocation result. Pin scale(1.3) + navy-800 color on hover. |
| `src/app/search/page.tsx` | Responsive layout with mobile map toggle | VERIFIED | 294 lines (above min 80). `showMobileMap` state, mobile overlay, floating button, `hoverSource` ref, geolocation useEffect all present. |
| `src/components/slip-card.tsx` | SlipCard with hover callback and highlight state | VERIFIED | Exports default `SlipCard`. `isHighlighted` and `onHover` optional props present. `data-marina-id` attribute on root div. `ring-2 ring-teal-500` applied when highlighted. |

---

## Key Link Verification

### Plan 01 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/app/search/page.tsx` | `src/components/map-view.tsx` | dynamic import with ssr: false | WIRED | `const MapView = dynamic(() => import('@/components/map-view'), { ssr: false, ... })` at line 21-24 |
| `src/components/map-view.tsx` | `mapbox-gl` | react-map-gl/mapbox Map component | WIRED | `import { Map, Marker } from 'react-map-gl/mapbox'` at line 4; `import 'mapbox-gl/dist/mapbox-gl.css'` at line 6 |
| `src/app/search/page.tsx` | supabase | slip query with beam and length filters | WIRED | `buildSlipQuery(supabase, filters)` called in `fetchSlips`; `gte("width_ft", ...)` confirmed in use-map-filter.ts:54-57 |

### Plan 02 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/components/slip-card.tsx` | `src/app/search/page.tsx` | onHover and isHighlighted props | WIRED | `isHighlighted={hoveredMarinaId === slip.marinas.id}` and `onHover={handleHoverMarinaFromList}` passed to every SlipCard at lines 206-207 |
| `src/app/search/page.tsx` | `src/components/map-view.tsx` | hoveredMarinaId state shared between map and list | WIRED | `hoveredMarinaId` state threaded to MapView `hoveredMarinaId` prop and to every SlipCard `isHighlighted` prop |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SRCH-01 | 03-01, 03-02 | Yacht owner sees an interactive map with marina location pins on the search page | SATISFIED | MapView renders Mapbox map with Marker per marina. Dynamic import ensures client-only load. Hover sync and viewport filtering add polish. |
| SRCH-02 | 03-01, 03-02 | Anyone can browse marinas without signing up (no auth requirement on search) | SATISFIED | ProtectedRoute removed from search page (verified by grep). No auth import. Page is statically prerendered (`○ /search` in build output). |
| SRCH-03 | 03-01 | Yacht owner can filter slips by vessel length and beam to match their boat | SATISFIED | `boatBeam` and `boatLength` fields in SearchFilters. `buildSlipQuery` applies `.gte("width_ft")` and `.gte("length_ft")`. Mock data fallback applies same filters. |

**Orphaned requirements check:** REQUIREMENTS.md maps SRCH-01, SRCH-02, SRCH-03 to Phase 3. All three are claimed by Plan 01 and/or Plan 02. No orphans.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/hooks/use-map-filter.ts` | 44-58 | Missing `.not()` guards in `buildSlipQuery` — implementation diverges from plan spec and test expectation | Warning | Without null-coordinate guards on the Supabase query, the server-side query could theoretically return marinas with null lat/lng (they would not appear as pins but would still pollute the slip list). The `filterMarinasByViewport` function on the client already excludes null-coordinate marinas, so in practice the UX impact is minimal, but the test is legitimately failing. |
| `src/app/search/page.tsx` | 95-104 | Mock data fallback when Supabase returns empty or errors | Info | Not a stub — this is intentional for demo mode, per decisions in SUMMARY. Mock data has valid lat/lng coordinates so the map experience still works. Clearly documented with `console.warn`. |
| `src/app/search/page.tsx` | 133 | `// eslint-disable-next-line react-hooks/exhaustive-deps` on mount-only fetchSlips | Info | Intentional: only fetch on mount, not on every filter change (Search button triggers re-fetch). Pattern is correct, suppression is acceptable. |

---

## Human Verification Required

### 1. Unauthenticated browse at /search

**Test:** Open `http://localhost:3000/search` in a private/incognito browser window (no cookies, not logged in).
**Expected:** Page loads with the Mapbox map on the left and slip list on the right. No redirect to /login.
**Why human:** Cookie-based session state and SSR redirect logic cannot be confirmed with grep alone.

### 2. Map renders and viewport filtering works

**Test:** With the dev server running, open /search. Observe that marina pins appear on the map. Pan the map away from South Florida.
**Expected:** The slip list on the right updates to show only slips for marinas visible in the new viewport.
**Why human:** Mapbox SDK rendering and the `onMoveEnd` callback chain require a real browser.

### 3. Bi-directional hover sync

**Test:** Hover a slip card in the list; then hover a pin on the map.
**Expected:** Card hover turns the corresponding pin navy and scales it up. Pin hover adds a teal ring to the corresponding card and smoothly scrolls it into view.
**Why human:** Mouse event interaction, CSS transitions, and scroll behavior require a real browser.

### 4. Mobile layout and Show Map toggle

**Test:** Resize the browser to ~375px width (mobile). Observe the layout. Tap the floating Show Map button.
**Expected:** At mobile width: list is shown first, floating Show Map button visible at bottom. After tap: full-screen map overlay appears with filter bar at top, X close button, and Show List button at bottom.
**Why human:** Tailwind responsive breakpoints (`md:hidden`, `hidden md:flex`) require a real browser viewport.

### 5. Dimension filters narrow results

**Test:** Enter Boat Length 999 and Boat Beam 999. Click Search.
**Expected:** Slip list becomes empty; EmptyState component shown in the list; empty state overlay appears on the map (semi-transparent, map remains interactive behind it).
**Why human:** Supabase query execution and the empty state overlay rendering require a running app.

---

## Gaps Summary

One gap blocking full goal achievement:

**Failing test in `buildSlipQuery`** — The implementation of `buildSlipQuery` in `src/lib/hooks/use-map-filter.ts` is missing two `.not()` calls that guard against marinas with null coordinates. The plan spec (Plan 01, Task 1, action #3) and the test (`src/__tests__/use-map-filter.test.ts` lines 136-137) both require `.not("marinas.lat", "is", null)` and `.not("marinas.lng", "is", null)` in the base query. The implementation has only `.eq("is_available", true)` and `.eq("marinas.is_active", true)`.

The fix is a two-line addition to `buildSlipQuery`. The client-side `filterMarinasByViewport` already handles null coordinates correctly, so there is no functional regression — this is purely a query correctness and test alignment issue. The build passes; only the test suite is affected (1/14 fails, 13/14 pass).

All other must-haves from both Plan 01 and Plan 02 are fully verified in the codebase. Requirements SRCH-01, SRCH-02, and SRCH-03 are satisfied by working implementations.

---

_Verified: 2026-03-11T20:36:00Z_
_Verifier: Claude (gsd-verifier)_
