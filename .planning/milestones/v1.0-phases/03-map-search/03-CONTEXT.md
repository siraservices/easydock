# Phase 3: Map Search - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the text-based search page with an interactive Mapbox map showing marina location pins. Yacht owners can browse and filter slips by vessel dimensions without signing in. No new booking features, no new listing features, no search-by-date-availability (v2).

</domain>

<decisions>
## Implementation Decisions

### Map + list layout
- Split view: map on the left (60%), scrollable slip list on the right (40%) on desktop
- Bi-directional hover sync: hovering a card highlights its pin on the map, hovering a pin highlights/scrolls to its card in the list
- Reuse existing SlipCard component in the list panel
- Mobile: list-first with a floating "Show Map" button that opens a full-screen map overlay

### Default map view
- Initial center: user's browser geolocation, falling back to South Florida (~26.1°N, -80.1°W) if permission denied
- Map stays at current pan/zoom when filters change — pins appear/disappear in place, no auto-refit
- List syncs to map viewport — only marinas visible on the current map view appear in the list (Airbnb "search as I move the map" pattern)

### Empty state
- When no marinas match filters: map remains visible with no pins, semi-transparent overlay message ("No marinas match your filters. Try adjusting vessel dimensions.")
- List panel shows empty state with anchor icon (consistent with current search page empty state)

### Unauthenticated access
- Remove ProtectedRoute wrapper from search page — anyone can browse
- "Book Now" button on slip cards requires authentication (redirect to login)
- Browsing map, viewing pins, and filtering are fully public

### Vessel dimension filters
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

</decisions>

<specifics>
## Specific Ideas

- Split view should feel like Airbnb/Zillow property search — map is the hero, list supports it
- Hover sync creates a connected, polished experience between map and list
- "Search as I move the map" is the key interaction pattern — no search button needed for geographic filtering

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/slip-card.tsx`: SlipCard component with photo, marina info, price, amenity badges — reuse in list panel
- `src/components/search-filters.tsx`: SearchFiltersBar with city/dates/length inputs — modify to replace city with beam, keep dates and length
- `src/components/ui/empty-state.tsx`: Empty state component — use for no-results state
- `src/components/ui/loading-spinner.tsx`: Loading indicator — use during initial data fetch

### Established Patterns
- Supabase client via `useMemo(() => createClient(), [])` in components
- Search queries use `.from("slips").select("*, marinas!inner(*)")` with filter chaining
- Availability conflict check queries bookings table with date range overlap logic
- `"use client"` directive on all interactive components

### Integration Points
- `src/app/search/page.tsx`: Replace entirely — remove ProtectedRoute, add MapView + split layout
- Marinas already have `lat`/`lng` columns populated by Phase 2 geocoding
- Mapbox access token already in `.env.local` (from Phase 2 geocoding)
- Navbar links to `/search` — no route change needed
- SlipCard links to `/slips/[id]` detail page — booking flow unchanged

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-map-search*
*Context gathered: 2026-03-11*
