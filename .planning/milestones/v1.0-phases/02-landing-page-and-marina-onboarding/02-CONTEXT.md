# Phase 2: Landing Page and Marina Onboarding - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Integrate the marketing landing page into the Next.js app as the home page, add a lead capture form that writes to Supabase, upgrade marina photo uploads to drag-and-drop, auto-geocode marina addresses via Mapbox, and add a read-only availability calendar for marina owners. No new booking features, no auth changes, no search changes.

</domain>

<decisions>
## Implementation Decisions

### Landing page integration
- Essential sections only: Hero, How It Works, and lead capture form — drop affiliate program, testimonials, network stats, and features sections
- Preserve the existing visual look (navy/teal theme, layout proportions) but rewrite all styling in Tailwind CSS utility classes
- Keep Font Awesome for icons (matches existing landing page aesthetic)
- Lead capture form in a modal (same pattern as current static landing page)
- Simplified form fields: name, email, user type (yacht owner / marina owner) — no message field, no launch notify checkbox
- Form submits to a new Supabase `marina_leads` table (replaces Formspree)
- Validation errors shown inline for missing/invalid fields

### Photo upload
- Replace basic file input with a simple drag-and-drop zone (dashed border, visual feedback on drag-over, click to browse fallback)
- No drag-to-reorder — photos display in upload order
- Keep existing 5 photo maximum
- First uploaded photo is the hero/cover image
- Public listing display: hero image large at top, remaining photos as small thumbnails below (Airbnb-style)
- No external library required — HTML5 drag events are sufficient for simple drop zone

### Geocoding
- Mapbox Geocoding API (aligns with Phase 3 Mapbox map — one provider, one API key)
- Server-side geocoding on marina create/update (API route, not client-side)
- Mapbox access token stored in `.env.local`, never exposed to browser for geocoding
- If geocoding fails: save the marina anyway with null lat/lng and show a warning ("Address couldn't be geocoded — marina won't appear on map until address is corrected")
- Backfill script to geocode all existing marinas that have addresses but no coordinates

### Availability calendar
- Monthly grid calendar, one slip at a time (slip selector dropdown above calendar)
- Read-only — just displays booked vs open dates, no date blocking
- Color-coded: green/open, red or gray/booked — no booking details shown
- Calendar placement: Claude's discretion (tab on marina detail page or separate route)

### Claude's Discretion
- Calendar placement (tab vs separate page)
- Whether to use a calendar library or build a simple grid
- Exact drag-and-drop feedback styling
- Lead form success state (toast, in-modal confirmation, etc.)
- How to structure the Mapbox geocoding API call (direct fetch vs SDK)
- Backfill script format (Node script, SQL function, or API route)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/marina-form.tsx`: Existing form with photo upload logic — upgrade file input to drop zone in place
- `src/lib/supabase/storage.ts`: `uploadMarinaPhoto()` and `deleteMarinaPhoto()` — reuse for drag-and-drop uploads
- `src/components/ui/empty-state.tsx`: Empty state component — use for calendar with no bookings
- `src/components/ui/loading-spinner.tsx`: Loading indicator — use during geocoding/upload
- `landing-page/index.html`: Full marketing page HTML — reference for content and layout during porting
- `landing-page/styles.css`: Custom CSS — reference for visual matching in Tailwind

### Established Patterns
- Components use `"use client"` directive for client-side interactivity
- Supabase client via `useMemo(() => createClient(), [])` in components
- Error display as red banner above form content
- API routes use `NextResponse.json()` with status codes
- Admin client (`src/lib/supabase/admin.ts`) for server-side operations that bypass RLS

### Integration Points
- `src/app/page.tsx`: Replace with ported landing page (this IS the home page)
- `src/app/dashboard/marinas/[id]/page.tsx`: Add availability calendar here
- `src/components/marina-form.tsx`: Upgrade photo upload section in place
- New API route needed: `src/app/api/marinas/geocode/` or inline in marina create/update
- New API route needed: `src/app/api/leads/route.ts` for lead capture form submission
- Database: New `marina_leads` table, existing `marinas.lat`/`marinas.lng` columns already exist

</code_context>

<specifics>
## Specific Ideas

- Landing page should feel like the same site as the existing static page — not a generic redesign
- Photo display on listings should follow Airbnb's pattern: large hero image with smaller thumbnails below
- "South Florida only for MVP" — landing page copy should reflect regional focus, not nationwide claims from the static page

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-landing-page-and-marina-onboarding*
*Context gathered: 2026-03-10*
