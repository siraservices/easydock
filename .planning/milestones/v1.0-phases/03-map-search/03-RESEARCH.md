# Phase 3: Map Search - Research

**Researched:** 2026-03-11
**Domain:** Interactive map (Mapbox GL JS / react-map-gl), viewport-based filtering, unauthenticated access
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Map + list layout**
- Split view: map on the left (60%), scrollable slip list on the right (40%) on desktop
- Bi-directional hover sync: hovering a card highlights its pin on the map, hovering a pin highlights/scrolls to its card in the list
- Reuse existing SlipCard component in the list panel
- Mobile: list-first with a floating "Show Map" button that opens a full-screen map overlay

**Default map view**
- Initial center: user's browser geolocation, falling back to South Florida (~26.1°N, -80.1°W) if permission denied
- Map stays at current pan/zoom when filters change — pins appear/disappear in place, no auto-refit
- List syncs to map viewport — only marinas visible on the current map view appear in the list (Airbnb "search as I move the map" pattern)

**Empty state**
- When no marinas match filters: map remains visible with no pins, semi-transparent overlay message ("No marinas match your filters. Try adjusting vessel dimensions.")
- List panel shows empty state with anchor icon (consistent with current search page empty state)

**Unauthenticated access**
- Remove ProtectedRoute wrapper from search page — anyone can browse
- "Book Now" button on slip cards requires authentication (redirect to login)
- Browsing map, viewing pins, and filtering are fully public

**Vessel dimension filters**
- Add beam filter alongside existing boat length filter (SRCH-03 requires both)
- Drop city text filter — map viewport replaces geographic text search
- Keep date filters for availability checking (existing behavior)

### Claude's Discretion
- Pin clustering at zoom-out levels (if needed for performance with many marinas)
- Exact pin styling and highlight effect
- Popup content on pin click (mini-card vs navigate directly)
- Map style (streets, satellite, light/dark)
- react-map-gl vs mapbox-gl-js directly (confirm current stable version before install)
- Geolocation permission prompt UX

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SRCH-01 | Yacht owner sees an interactive map with marina location pins on the search page | react-map-gl v8 `Map` + `Marker` components render pins from marina lat/lng; marinas table already has lat/lng columns from Phase 2 geocoding |
| SRCH-02 | Anyone can browse marinas without signing up (no auth requirement on search) | RLS policies with no `TO` clause apply to all roles including `anon`; only code change needed is removing `ProtectedRoute` wrapper |
| SRCH-03 | Yacht owner can filter slips by vessel length and beam to match their boat | `slips.length_ft` already supports length filter; `slips.width_ft` column is the beam column — add beam input to `SearchFiltersBar`, add `.gte("width_ft", beam)` filter to Supabase query |
</phase_requirements>

---

## Summary

Phase 3 replaces the text-search-based slip search page with a split map/list layout powered by Mapbox GL JS via the `react-map-gl` v8 library. The core interaction pattern is "search as I move the map" — the slip list on the right updates to show only marinas visible in the current map viewport, while vessel dimension filters (length + beam) narrow results further. No new routes are needed; `src/app/search/page.tsx` is replaced entirely.

The two main technical concerns are: (1) correctly integrating react-map-gl v8 with Next.js 15 App Router (requires `"use client"` + `dynamic` import with `ssr: false` to avoid server-side `window` errors), and (2) the "search as map moves" pattern — using `mapRef.current.getBounds().contains([lng, lat])` inside `onMoveEnd` to filter the marina list to visible pins.

Database access for unauthenticated users is already unblocked at the RLS level — Supabase policies without a `TO` clause apply to all roles including `anon`. The only auth barrier is the `ProtectedRoute` component wrapper in the current page, which is removed in this phase.

**Primary recommendation:** Use `react-map-gl` v8 with `mapbox-gl` v3 via `import Map from 'react-map-gl/mapbox'`. Wrap the map component in a `dynamic` import with `ssr: false`. Use `mapRef.current.getBounds().contains()` in `onMoveEnd` to drive the viewport-synced list.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-map-gl | ^8.0.0 | React wrapper for Mapbox GL JS | Official vis.gl wrapper; provides Map, Marker, Popup as React components; v8 is the current stable (released Feb 2024) |
| mapbox-gl | ^3.19.x | Mapbox rendering engine (peer dep) | Required peer dependency for `react-map-gl/mapbox` endpoint; v3+ requires WebGL 2 (all modern browsers) |
| @types/mapbox-gl | ^3.x | TypeScript types for mapbox-gl | Needed for MapRef and event types |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (built-in) `next/dynamic` | N/A (Next.js built-in) | SSR guard for map component | Required — mapbox-gl uses `window` which crashes SSR |
| (built-in) `navigator.geolocation` | N/A (browser API) | User position for initial map center | Phase decision: fall back to South Florida if denied |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-map-gl | mapbox-gl-js directly | react-map-gl gives React component API (Marker, Popup), avoids manual DOM manipulation |
| react-map-gl | react-leaflet + Leaflet | Leaflet tiles are free but Mapbox token is already in .env.local; react-map-gl matches Mapbox branding |
| react-map-gl | maplibre-gl | MapLibre is open-source alternative; but Mapbox token already exists from Phase 2 geocoding |

**Installation:**
```bash
npm install react-map-gl mapbox-gl @types/mapbox-gl
```

**CSS import** (required — without it, map rendering is broken and popups are mispositioned):
```typescript
import 'mapbox-gl/dist/mapbox-gl.css';
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── search/
│       └── page.tsx          # Replace entirely — no ProtectedRoute, renders MapSearchPage
├── components/
│   ├── map-view.tsx          # "use client" Map + Marker logic, exported as dynamic
│   ├── search-filters.tsx    # MODIFY: remove city field, add beam field
│   └── slip-card.tsx         # REUSE as-is — no changes needed
```

### Pattern 1: SSR Guard via Dynamic Import

**What:** Mapbox GL JS accesses `window` on import, which crashes Next.js server rendering. Wrap the map component in `next/dynamic` with `ssr: false`.

**When to use:** Any component that imports `react-map-gl` or `mapbox-gl`.

**Example:**
```typescript
// src/app/search/page.tsx  (or in the component that hosts MapView)
// Source: standard Next.js pattern, confirmed by multiple community sources
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <LoadingSpinner size="lg" message="Loading map..." />,
});
```

### Pattern 2: Map Component with MapRef for Bounds

**What:** Hold a ref to the Map instance to call `getBounds()` in `onMoveEnd`.

**Example:**
```typescript
// Source: react-map-gl tips-and-tricks docs + visgl GitHub
"use client";
import { useRef, useState, useCallback } from 'react';
import Map, { Marker, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapView({ marinas }: { marinas: Marina[] }) {
  const mapRef = useRef<MapRef>(null);
  const [visibleMarinaIds, setVisibleMarinaIds] = useState<Set<string>>(
    new Set(marinas.map((m) => m.id))
  );

  const updateVisibleMarinas = useCallback(() => {
    if (!mapRef.current) return;
    const bounds = mapRef.current.getBounds();
    const visible = new Set(
      marinas
        .filter((m) => m.lat && m.lng && bounds.contains([m.lng, m.lat]))
        .map((m) => m.id)
    );
    setVisibleMarinaIds(visible);
  }, [marinas]);

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{ longitude: -80.1, latitude: 26.1, zoom: 10 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      onMoveEnd={updateVisibleMarinas}
    >
      {marinas.map((m) => (
        <Marker key={m.id} longitude={m.lng} latitude={m.lat} />
      ))}
    </Map>
  );
}
```

### Pattern 3: Viewport-Synced List (Search as Map Moves)

**What:** Derive visible slips from `visibleMarinaIds` state; update on `onMoveEnd`. This is client-side filtering of already-fetched data — no new Supabase query on map move.

**When to use:** When the full dataset fits in memory (South Florida MVP has few marinas).

**Logic:**
```typescript
// Slips whose marina is visible in the current map viewport
const visibleSlips = slips.filter((s) => visibleMarinaIds.has(s.marina_id));
```

**Note:** `mapRef.current.getBounds()` is only available after the map has mounted and received an initial move event. Initialize `visibleMarinaIds` to all marinas so the list isn't empty on first load; then `onMoveEnd` narrows it.

### Pattern 4: Bi-Directional Hover Sync

**What:** Track `hoveredMarinaId` state; pass it down to both Marker and SlipCard; apply visual highlight based on match.

**Example:**
```typescript
const [hoveredMarinaId, setHoveredMarinaId] = useState<string | null>(null);

// On Marker: pass color/style based on hoveredMarinaId
<Marker
  longitude={m.lng}
  latitude={m.lat}
  onClick={() => setSelectedMarinaId(m.id)}
>
  <div
    onMouseEnter={() => setHoveredMarinaId(m.id)}
    onMouseLeave={() => setHoveredMarinaId(null)}
    className={hoveredMarinaId === m.id ? 'pin-highlighted' : 'pin-default'}
  />
</Marker>

// On SlipCard: pass isHighlighted prop or use className
<SlipCard
  slip={slip}
  isHighlighted={hoveredMarinaId === slip.marinas.id}
  onHover={(id) => setHoveredMarinaId(id)}
/>
```

### Pattern 5: Geolocation with Fallback

**What:** Request browser geolocation; use South Florida if denied or unavailable.

```typescript
useEffect(() => {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setInitialView({
        longitude: pos.coords.longitude,
        latitude: pos.coords.latitude,
        zoom: 12,
      });
    },
    () => {
      // Permission denied or unavailable — keep South Florida default
    }
  );
}, []);
```

### Pattern 6: Unauthenticated "Book Now" Guard

**What:** SlipCard's "Book Now" link currently navigates to `/slips/[id]`. That page requires auth. No change to SlipCard is needed — the booking page's own `ProtectedRoute` handles the redirect. The map page itself simply removes `ProtectedRoute`.

**Alternatively** (if cleaner UX is desired): wrap the Book Now button with an `onClick` that checks `user` and pushes to `/login` if null, before navigating to the slip page.

### Anti-Patterns to Avoid

- **Fetching slips on every `onMove` event:** `onMove` fires continuously during pan/zoom. Use `onMoveEnd` (fires once after movement stops) for filtering.
- **Re-fetching from Supabase on every viewport change:** Fetch all filtered slips once on dimension filter change; use client-side viewport filtering for map moves.
- **Importing `react-map-gl` at the top of a Server Component:** Will crash. Always in a `"use client"` component wrapped in `dynamic`.
- **Forgetting `mapbox-gl/dist/mapbox-gl.css`:** Map renders incorrectly; popups appear in wrong positions.
- **Using `[lat, lng]` order:** Mapbox GL JS v3 uses `[lng, lat]` consistently. The Phase 2 geocoding already established this convention — the `STATE.md` notes "Mapbox v6 geometry.coordinates is [lng, lat] order."
- **Calling `mapRef.current.getBounds()` before mount:** Returns null. Guard with `if (!mapRef.current) return`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Map rendering with pins | Custom Canvas/SVG map | `react-map-gl` + `mapbox-gl` | Tile loading, projection math, WebGL rendering, touch events — weeks of complexity |
| Viewport bounds check | Manual lat/lng boundary arithmetic | `mapRef.current.getBounds().contains([lng, lat])` | Already provided by Mapbox GL JS; handles edge cases like anti-meridian |
| Pin clustering | Custom clustering algorithm | react-map-gl "Clusters" example using `supercluster` | `supercluster` handles all grid-cell aggregation; already shown in library examples |
| CSS for map controls | Custom nav/zoom UI | `mapbox-gl/dist/mapbox-gl.css` + NavigationControl | Navigation, attribution, and compass controls are built in |

**Key insight:** Mapbox GL JS wraps years of geospatial engineering. The viewport bounds API alone (`getBounds().contains()`) eliminates a class of projection-math bugs.

---

## Common Pitfalls

### Pitfall 1: SSR Crash on Import

**What goes wrong:** Next.js tries to server-render the map component; mapbox-gl accesses `window` and throws `ReferenceError: window is not defined`.

**Why it happens:** mapbox-gl initializes a WebGL context on import using browser-only globals.

**How to avoid:** Always wrap the map component in `dynamic(() => import('...'), { ssr: false })`. Never import `react-map-gl` directly in a file that can run on the server.

**Warning signs:** Build or server startup error mentioning `window is not defined` or `navigator is not defined`.

### Pitfall 2: Missing CSS Import

**What goes wrong:** Map renders with missing controls, popups appear in top-left corner instead of on the map, tiles load but overlays are mispositioned.

**Why it happens:** `mapbox-gl` expects its stylesheet to be loaded globally.

**How to avoid:** Import `'mapbox-gl/dist/mapbox-gl.css'` at the top of the `"use client"` map component file.

**Warning signs:** Map works but popups/tooltips are in wrong positions; navigation control missing.

### Pitfall 3: [lng, lat] vs [lat, lng] Coordinate Order

**What goes wrong:** Pins appear in ocean or in wrong hemisphere. `getBounds().contains()` returns false for all marinas.

**Why it happens:** Mapbox uses `[longitude, latitude]` everywhere; GeoJSON and database columns are stored as separate `lat` and `lng` fields.

**How to avoid:** Always pass `longitude={m.lng}` and `latitude={m.lat}` to `Marker`. Always call `bounds.contains([m.lng, m.lat])` (not `[m.lat, m.lng]`).

**Warning signs:** Established in STATE.md — "Mapbox v6 geometry.coordinates is [lng, lat] order."

### Pitfall 4: onMove vs onMoveEnd Performance

**What goes wrong:** App becomes sluggish; list re-renders hundreds of times during a single pan gesture.

**Why it happens:** `onMove` fires on every animation frame during pan/pinch.

**How to avoid:** Use `onMoveEnd` for viewport-filtered list updates. Use `onMove` only for visual feedback (e.g., showing a "Search this area" button).

**Warning signs:** Profiler shows many re-renders per second while dragging the map.

### Pitfall 5: RLS Blocks Unauthenticated Queries

**What goes wrong:** The search page loads but the Supabase query returns empty results or 401 for unauthenticated users.

**Why it happens:** Supabase RLS policies without a `TO anon` clause were assumed to require authentication.

**How to avoid:** The current schema policies for `marinas` and `slips` have no `TO` clause — this means they apply to ALL roles including `anon`. Confirmed: no RLS schema changes are needed for SRCH-02. The only code change is removing `ProtectedRoute` from `src/app/search/page.tsx`.

**Warning signs:** Empty results only when not logged in; queries work when logged in.

### Pitfall 6: Width_ft is the Beam Column

**What goes wrong:** Implementing beam filter but the DB column name is unclear.

**How to avoid:** The `slips` table uses `width_ft NUMERIC(6, 1)` as the beam (vessel width) column. The Supabase filter is `.gte("width_ft", parseInt(beam, 10))`. This is consistent with the length filter pattern already in the codebase (`.gte("length_ft", parseInt(boatLength, 10))`).

---

## Code Examples

Verified patterns from official sources and existing codebase:

### MapView Component (Core Structure)
```typescript
// Source: react-map-gl v8 docs (visgl.github.io/react-map-gl/docs/get-started)
"use client";
import { useRef, useCallback } from 'react';
import Map, { Marker, type MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapView({ marinas, hoveredMarinaId, onHoverMarina, onSelectMarina }) {
  const mapRef = useRef<MapRef>(null);
  // ...
  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{ longitude: -80.1, latitude: 26.1, zoom: 10 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      onMoveEnd={handleMoveEnd}
    >
      {marinas.map((m) => (
        <Marker key={m.id} longitude={m.lng} latitude={m.lat}>
          <button
            onMouseEnter={() => onHoverMarina(m.id)}
            onMouseLeave={() => onHoverMarina(null)}
            onClick={() => onSelectMarina(m.id)}
          >
            {/* custom pin SVG or emoji */}
          </button>
        </Marker>
      ))}
    </Map>
  );
}
```

### Dynamic Import Wrapper (SSR Guard)
```typescript
// Source: Next.js dynamic import docs + established community pattern
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/ui/loading-spinner';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <LoadingSpinner size="lg" message="Loading map..." />,
});
```

### Updated SearchFilters Type (Adding Beam)
```typescript
// Source: existing src/components/search-filters.tsx — add boatBeam field
export interface SearchFilters {
  // city: string;  <-- REMOVE
  checkIn: string;
  checkOut: string;
  boatLength: string;
  boatBeam: string;    // <-- ADD (maps to slips.width_ft)
}
```

### Supabase Beam Filter (Extending Existing Pattern)
```typescript
// Source: existing search query pattern in src/app/search/page.tsx
if (filters.boatBeam) {
  query = query.gte("width_ft", parseInt(filters.boatBeam, 10));
}
```

### Viewport Bounds Check
```typescript
// Source: react-map-gl tips-and-tricks (visgl.github.io/react-map-gl/docs/get-started/tips-and-tricks)
const handleMoveEnd = useCallback(() => {
  if (!mapRef.current) return;
  const bounds = mapRef.current.getBounds();
  const visible = new Set(
    allMarinas
      .filter((m) => m.lat && m.lng && bounds.contains([m.lng, m.lat]))
      .map((m) => m.id)
  );
  setVisibleMarinaIds(visible);
}, [allMarinas]);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `import Map from 'react-map-gl'` (v7) | `import Map from 'react-map-gl/mapbox'` (v8) | Feb 2024 (v8.0.0) | v8 splits endpoints by map library; `react-map-gl/mapbox` is the correct import for mapbox-gl ≥3.5 |
| mapbox-gl v2 (proprietary license change) | mapbox-gl v3 (current, WebGL 2) | Late 2023 | v3 drops WebGL 1 support but all modern browsers support WebGL 2; no practical impact |
| `ssr: false` via `require()` hack | `dynamic(() => import(...), { ssr: false })` | Next.js 13+ | App Router pattern is cleaner with the dynamic import |

**Deprecated/outdated:**
- `react-map-gl/mapbox-legacy`: For mapbox-gl v1/v2. Do not use — the project should use v3.
- `import Map from 'react-map-gl'` without sub-path: In v8, this import no longer bundles mapbox-gl by default.

---

## Open Questions

1. **Mapbox token env var name**
   - What we know: Mapbox token is in `.env.local` (from Phase 2 geocoding, used for geocoding API calls)
   - What's unclear: The env var may be `MAPBOX_TOKEN` (server-side) rather than `NEXT_PUBLIC_MAPBOX_TOKEN` (client-side). react-map-gl runs client-side and needs `NEXT_PUBLIC_` prefix.
   - Recommendation: Wave 0 task should check `.env.local` key name and add `NEXT_PUBLIC_MAPBOX_TOKEN` if only the server-side key exists. The Mapbox public token (pk.*) is safe to expose client-side.

2. **SlipCard "Book Now" behavior for unauthenticated users**
   - What we know: CONTEXT.md says "Book Now requires authentication (redirect to login)." SlipCard currently links directly to `/slips/[id]` which has its own ProtectedRoute.
   - What's unclear: Whether the slip detail page's ProtectedRoute is sufficient UX, or whether SlipCard needs an inline auth check.
   - Recommendation: The planner should decide whether to add an `onClick` auth-check to the SlipCard "Book Now" link, or rely on the slip detail page redirect. The latter requires no SlipCard changes.

3. **Marinas with null lat/lng**
   - What we know: Phase 2 geocoding runs after marina save and can fail silently. Some marinas in the DB may have null lat/lng.
   - What's unclear: How many seed marinas have null coordinates.
   - Recommendation: Filter in the Supabase query: `.not("lat", "is", null).not("lng", "is", null)` or guard in the marker render with `if (!m.lat || !m.lng) return null`.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 |
| Config file | `vitest.config.ts` (exists — `environment: 'node'`, no jsdom) |
| Quick run command | `npx vitest run src/__tests__/` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SRCH-01 | Marina pins rendered for each marina with valid lat/lng | unit (logic) | `npx vitest run src/__tests__/map-view.test.ts -t "marina pins"` | Wave 0 |
| SRCH-02 | Search page renders without ProtectedRoute (public access) | unit (logic) | `npx vitest run src/__tests__/search-public-access.test.ts` | Wave 0 |
| SRCH-03 | Beam filter applied to Supabase query when boatBeam is set | unit (logic) | `npx vitest run src/__tests__/search-filters.test.ts -t "beam"` | Wave 0 |
| SRCH-03 | Viewport bounds filtering returns only visible marina IDs | unit (logic) | `npx vitest run src/__tests__/map-view.test.ts -t "viewport"` | Wave 0 |

**Note on test approach:** The project's established vitest pattern tests pure logic extracted from components (no jsdom). Map tests should follow the same pattern: test the filter/bounds logic functions in isolation (e.g., `filterByViewport(marinas, bounds)`, `buildSearchQuery(filters)`) rather than rendering the Map component.

### Sampling Rate
- **Per task commit:** `npx vitest run src/__tests__/`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/map-view.test.ts` — covers SRCH-01 (pin rendering logic) and SRCH-03 (viewport filter)
- [ ] `src/__tests__/search-filters.test.ts` — covers SRCH-03 (beam filter query building)
- [ ] `src/__tests__/search-public-access.test.ts` — covers SRCH-02 (no ProtectedRoute logic)

---

## Sources

### Primary (HIGH confidence)
- `visgl.github.io/react-map-gl/docs/get-started` — install command, CSS import, mapbox sub-path import
- `visgl.github.io/react-map-gl/docs/get-started/tips-and-tricks` — `reuseMaps`, Marker performance, `getBounds().contains()`
- `visgl.github.io/react-map-gl/` — v8.0.0 released Feb 2024, confirmed stable
- `github.com/visgl/react-map-gl/releases` — v8.0.0 breaking changes (sub-path imports)
- `supabase.com/docs/guides/database/postgres/row-level-security` — policies without `TO` apply to all roles including anon
- `C:/01_repos/easydock/database/001_initial_schema.sql` — confirmed `slips.width_ft` as beam column, `marinas.lat/lng` exists
- `C:/01_repos/easydock/src/app/search/page.tsx` — existing query patterns, filter shapes
- `C:/01_repos/easydock/src/components/search-filters.tsx` — SearchFilters interface, city/length/date fields
- `C:/01_repos/easydock/vitest.config.ts` — node environment, no jsdom, existing test infrastructure

### Secondary (MEDIUM confidence)
- npm search result: `mapbox-gl` current version is 3.19.1 (verified against github.com/mapbox/mapbox-gl-js releases)
- Community consensus: `dynamic(() => import(...), { ssr: false })` is the standard Next.js + Mapbox SSR fix

### Tertiary (LOW confidence)
- Marker and Popup component prop shapes inferred from react-map-gl v7 docs and community examples — v8 API surface appears unchanged for these components but was not directly verified via Context7

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — install command, CSS import, and sub-path import verified from official docs
- Architecture patterns: HIGH — viewport bounds API and SSR dynamic import pattern verified from official sources
- Pitfalls: HIGH — lng/lat order established in project STATE.md; RLS anon access verified from Supabase docs; SSR crash is well-documented
- Beam column name: HIGH — directly read from `database/001_initial_schema.sql`

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (react-map-gl moves slowly; mapbox-gl patch releases don't affect the API)
