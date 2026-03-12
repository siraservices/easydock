# Phase 2: Landing Page and Marina Onboarding - Research

**Researched:** 2026-03-10
**Domain:** Next.js landing page integration, Mapbox Geocoding API v6, HTML5 drag-and-drop, Supabase RLS for unauthenticated inserts, availability calendar
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Landing page: Hero, How It Works, lead capture form only — drop affiliate, testimonials, network stats, features sections
- Preserve existing visual look (navy/teal theme, layout proportions), rewrite all styling in Tailwind CSS utility classes
- Keep Font Awesome for icons
- Lead capture form in a modal (same pattern as current static landing page)
- Simplified form fields: name, email, user type (yacht owner / marina owner) — no message field, no launch notify checkbox
- Form submits to a new Supabase `marina_leads` table (replaces Formspree)
- Validation errors shown inline for missing/invalid fields
- Replace basic file input with a simple drag-and-drop zone (dashed border, visual feedback on drag-over, click to browse fallback)
- No drag-to-reorder — photos display in upload order
- Keep existing 5 photo maximum
- First uploaded photo is the hero/cover image
- Public listing display: hero image large at top, remaining photos as small thumbnails below (Airbnb-style)
- No external library required for drag-and-drop — HTML5 drag events are sufficient
- Mapbox Geocoding API (aligns with Phase 3 Mapbox map)
- Server-side geocoding on marina create/update (API route, not client-side)
- Mapbox access token stored in `.env.local`, never exposed to browser for geocoding
- If geocoding fails: save the marina anyway with null lat/lng and show a warning
- Backfill script to geocode all existing marinas that have addresses but no coordinates
- Monthly grid calendar, one slip at a time (slip selector dropdown above calendar)
- Read-only — just displays booked vs open dates, no date blocking
- Color-coded: green/open, red or gray/booked — no booking details shown

### Claude's Discretion
- Calendar placement (tab on marina detail page or separate route)
- Whether to use a calendar library or build a simple grid
- Exact drag-and-drop feedback styling
- Lead form success state (toast, in-modal confirmation, etc.)
- How to structure the Mapbox geocoding API call (direct fetch vs SDK)
- Backfill script format (Node script, SQL function, or API route)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LAND-01 | Existing landing page HTML integrated as Next.js home page with consistent branding | Porting strategy, Tailwind conversion, Font Awesome CDN in layout |
| LAND-02 | Lead capture form submits to Supabase marina_leads table with validation | New table DDL, anon RLS insert policy, API route pattern, inline validation |
| MARI-01 | Marina owner can upload photos via drag-and-drop UI | HTML5 DnD events in React, existing uploadMarinaPhoto() reuse, drop zone component |
| MARI-02 | Marina address is auto-geocoded to lat/lng when marina is created or edited | Mapbox v6 forward geocoding endpoint, server-side API route, graceful failure |
| MARI-03 | Marina owner can view visual availability calendar showing booked vs open dates per slip | Bookings table query by slip_id and date range, hand-rolled monthly grid recommended |
</phase_requirements>

---

## Summary

Phase 2 has five distinct workstreams that are largely independent of each other. The landing page port replaces `src/app/page.tsx` entirely — it is a content/styling task with one new server concern (Font Awesome CDN link in `layout.tsx`). The lead capture form requires a new `marina_leads` table, an unauthenticated anon INSERT policy, and a new API route (`POST /api/leads`). The drag-and-drop photo upgrade is an in-place replacement of the `<input type="file">` inside `src/components/marina-form.tsx` using only native HTML5 events — the existing `uploadMarinaPhoto()` / `deleteMarinaPhoto()` storage helpers are reused unchanged. Auto-geocoding adds one server-side API route that calls Mapbox Geocoding v6, invoked transparently after marina save in `marina-form.tsx`. The availability calendar is a read-only monthly grid added as a tab or section on the marina detail page, querying the bookings table already accessible to marina owners via existing RLS.

No new npm packages are required for drag-and-drop or the calendar. The only new runtime dependency is the Mapbox Geocoding API (accessed via plain `fetch`). Font Awesome is already used in the static landing page via CDN `<link>` and must be added to the Next.js root layout.

**Primary recommendation:** Work in this order — (1) marina_leads table + lead API route, (2) landing page port, (3) drag-and-drop upgrade, (4) geocoding API route + marina-form integration, (5) availability calendar. Each can be planned as a separate wave.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | ^15.1.6 (already installed) | Page routing, API routes | Project standard |
| Supabase JS | ^2.47.12 (already installed) | DB reads/writes, storage | Project standard |
| Tailwind CSS | ^4.0.0 (already installed) | All styling | Project standard |
| Mapbox Geocoding API v6 | REST (no SDK) | Address → lat/lng | Locked decision; direct fetch avoids SDK overhead |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Font Awesome | 6.4.0 via CDN | Icons on landing page | Already used in static landing page — add CDN link to root layout |
| Vitest | ^4.0.18 (already installed) | Unit tests for API route logic | Test geocoding error path and lead validation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native HTML5 DnD | react-dropzone | react-dropzone adds ~50KB for behaviour the user locked out of scope (no reorder, no complex MIME filtering) |
| Hand-rolled calendar grid | react-big-calendar / react-day-picker | A read-only monthly grid with booked/open colour coding is ~60 lines of TSX; external library adds complexity and potentially breaks Tailwind 4 |
| Direct Mapbox fetch | @mapbox/mapbox-sdk | SDK wraps the same REST call; adds a dependency for no benefit when only one endpoint is used |

**Installation:** No new packages required.

---

## Architecture Patterns

### Recommended Project Structure for New Files
```
src/
├── app/
│   ├── page.tsx                          # REPLACE: ported landing page (Hero + How It Works + modal)
│   ├── api/
│   │   ├── leads/route.ts                # NEW: POST handler for marina_leads insert
│   │   └── marinas/geocode/route.ts      # NEW: POST handler wrapping Mapbox v6
│   └── dashboard/marinas/[id]/page.tsx   # MODIFY: add availability calendar tab/section
├── components/
│   ├── marina-form.tsx                   # MODIFY: replace file input with drop zone, call geocode
│   ├── photo-drop-zone.tsx               # NEW: self-contained drag-and-drop component
│   ├── availability-calendar.tsx         # NEW: read-only monthly grid component
│   └── lead-modal.tsx                    # NEW: modal wrapper + form (or inline in page.tsx)
database/
└── 003_marina_leads.sql                  # NEW: marina_leads table + RLS
scripts/
└── geocode-backfill.ts                   # NEW: Node script to geocode existing marinas
```

### Pattern 1: Lead Capture API Route (POST /api/leads)
**What:** Unauthenticated POST handler that validates fields and inserts into marina_leads using the Supabase admin client (bypasses RLS) or anon client (requires anon INSERT policy).
**When to use:** Lead form submission from the landing page modal.
**Recommendation:** Use the **admin client** for the API route so the RLS policy on marina_leads can be restrictive (no public read). This matches the established `src/lib/supabase/admin.ts` pattern already in the codebase.

```typescript
// src/app/api/leads/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, user_type } = body;

  // Inline validation — return 400 with field errors
  const errors: Record<string, string> = {};
  if (!name?.trim()) errors.name = "Name is required";
  if (!email?.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Invalid email";
  if (!user_type) errors.user_type = "Please select a user type";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("marina_leads").insert({ name, email, user_type });
  if (error) return NextResponse.json({ error: "Failed to save" }, { status: 500 });

  return NextResponse.json({ success: true }, { status: 201 });
}
```

### Pattern 2: Mapbox Geocoding (POST /api/marinas/geocode)
**What:** Server-side route that accepts an address string, calls Mapbox Geocoding v6, returns lat/lng.
**When to use:** Called from `marina-form.tsx` after form validation passes, before or alongside the marina DB write.

```typescript
// src/app/api/marinas/geocode/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { address } = await req.json();
  const token = process.env.MAPBOX_ACCESS_TOKEN;

  if (!address || !token) {
    return NextResponse.json({ error: "Missing address or token" }, { status: 400 });
  }

  const encoded = encodeURIComponent(address);
  const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encoded}&access_token=${token}&limit=1`;

  const res = await fetch(url);
  if (!res.ok) return NextResponse.json({ lat: null, lng: null });

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return NextResponse.json({ lat: null, lng: null });

  // v6 response: geometry.coordinates = [longitude, latitude]
  const [lng, lat] = feature.geometry.coordinates;
  return NextResponse.json({ lat, lng });
}
```

**Integration in marina-form.tsx:** After the Supabase insert/update of the marina, fire-and-forget a call to `/api/marinas/geocode` with the full address string, then update `marinas.lat` and `marinas.lng` with a second Supabase update. If geocoding fails, display the warning message from CONTEXT.md.

### Pattern 3: HTML5 Drag-and-Drop Drop Zone Component
**What:** React component wrapping a `<div>` with `onDragOver`, `onDragLeave`, `onDrop` handlers and a hidden `<input type="file">` as click fallback.
**When to use:** Replace the existing `<input type="file">` in `marina-form.tsx`.

```typescript
// src/components/photo-drop-zone.tsx — key event pattern
"use client";

export default function PhotoDropZone({ onFiles, disabled }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();          // required — enables drop
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f =>
      f.type.startsWith("image/")
    );
    if (files.length) onFiles(files);
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragOver ? "border-teal-500 bg-teal-50" : "border-gray-300 hover:border-gray-400"}`}
      onClick={() => inputRef.current?.click()}
    >
      {/* visual indicator text */}
    </div>
  );
}
```

### Pattern 4: Read-Only Availability Calendar
**What:** A hand-rolled monthly grid component that colours cells based on bookings for a selected slip.
**Recommendation:** Place as a section/tab on the existing marina detail page (`src/app/dashboard/marinas/[id]/page.tsx`). Separate route is unnecessary overhead for MVP.

**Data query:**
```typescript
// Fetch bookings for a slip within displayed month range
const { data } = await supabase
  .from("bookings")
  .select("check_in, check_out, status")
  .eq("slip_id", selectedSlipId)
  .neq("status", "cancelled")
  .neq("status", "declined")
  .gte("check_out", startOfMonth.toISOString())
  .lte("check_in", endOfMonth.toISOString());
```

The marina owner can already read bookings for their marinas per existing RLS (`Marina owners can read bookings for their marinas`). No new RLS policy required for MARI-03.

**Calendar grid logic:** For each day cell in the month grid, check if any booking's `check_in <= day < check_out`. If true, render with a booked class (red/gray). Otherwise render open (green). The slip selector dropdown above the calendar triggers a re-fetch.

### Anti-Patterns to Avoid
- **Exposing MAPBOX_ACCESS_TOKEN to the browser:** The token must only appear in server-side routes. The client fires a POST to `/api/marinas/geocode` — never calls Mapbox directly.
- **Calling geocode before save:** Geocoding should happen after the marina is saved to DB. If geocoding fails, the marina record already exists and can be updated later via backfill. Tying geocoding to save success creates rollback complexity.
- **Using `auth.uid()` in marina_leads RLS:** marina_leads accepts unauthenticated submissions. Use `WITH CHECK (true)` for INSERT, and restrict SELECT to no one (or service role only).
- **Showing booking details on the calendar:** CONTEXT.md explicitly says no booking details — cells are colour-coded only.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Address to coordinates | Custom geocoder | Mapbox Geocoding API v6 | Handles fuzzy matching, partial addresses, international variants — not worth reinventing |
| File validation (MIME type) | Custom MIME checker | `file.type.startsWith("image/")` | Browser provides MIME from file metadata — one line check is sufficient |
| Form validation in lead route | Validation library (zod, yup) | Inline field checks | 3 fields — adding a schema library is overkill; inline is readable and fast |

**Key insight:** The calendar, drop zone, and lead form are all small enough that custom solutions are appropriate here. The only non-trivial external concern is address geocoding, where the Mapbox API handles all the hard problems (ambiguity resolution, lat/lng precision, partial addresses).

---

## Common Pitfalls

### Pitfall 1: Font Awesome Not Loading in Next.js
**What goes wrong:** The static landing page loads Font Awesome via `<link>` in `<head>`. Next.js App Router uses `<head>` metadata rather than raw HTML. Adding a CDN stylesheet incorrectly causes hydration errors or FOUC.
**Why it happens:** Next.js 15 requires CDN stylesheets to go into the root `layout.tsx` via the metadata API or a `<link>` tag inside the returned JSX `<head>` element — not a bare HTML string.
**How to avoid:** Add Font Awesome to the `<head>` in `src/app/layout.tsx`:
```tsx
// In RootLayout, inside <html><head>:
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
/>
```
Or use Next.js metadata `icons` — but `<link>` in layout JSX is simpler for CDN stylesheets.
**Warning signs:** Icons render as boxes or placeholder glyphs on first load.

### Pitfall 2: `e.preventDefault()` Missing in `onDragOver`
**What goes wrong:** Files cannot be dropped — the browser reverts to its default "open file" behaviour.
**Why it happens:** The `dragover` event default is to reject drops. You MUST call `e.preventDefault()` in `onDragOver` to enable dropping on the target.
**How to avoid:** Always pair `onDragOver={e => { e.preventDefault(); ... }}` with `onDrop`.
**Warning signs:** `handleDrop` never fires even though `handleDragOver` does.

### Pitfall 3: Mapbox v6 vs v5 Coordinate Field Names
**What goes wrong:** Code references `feature.center` (v5 format: `[lng, lat]`) which does not exist in v6 responses.
**Why it happens:** Most online examples use the deprecated v5 API. v6 uses `feature.geometry.coordinates = [longitude, latitude]`.
**How to avoid:** Use `feature.geometry.coordinates` and destructure as `const [lng, lat] = feature.geometry.coordinates`. The v6 API also adds `properties.coordinates.longitude/latitude` but `geometry.coordinates` is the GeoJSON standard.
**Warning signs:** lat/lng come back as `undefined` even when geocoding succeeds.

### Pitfall 4: marina_leads RLS Blocking Anon INSERT
**What goes wrong:** The lead capture form returns a 500 or silent failure because the anon role cannot insert into marina_leads.
**Why it happens:** Supabase enables RLS on all tables by default with no policies, which means no role can access the table. Using the admin client in the API route bypasses this, but forgetting to use the admin client means the server-side Supabase call uses the anon key.
**How to avoid:** In `POST /api/leads`, always use `createAdminClient()` — not `createClient()` from `@/lib/supabase/server`. The admin client uses the `service_role` key and bypasses RLS.
**Warning signs:** Supabase returns `{ error: { code: "42501", message: "new row violates..." } }`.

### Pitfall 5: Calendar DragOver vs DragLeave False Triggers
**What goes wrong:** The drag-over highlight flickers or disappears when the user drags over child elements inside the drop zone.
**Why it happens:** `dragleave` fires when the pointer moves from the parent div to a child element — even though it is still within the drop zone.
**How to avoid:** Use a `dragEnterCount` ref to track nested enter/leave events, or check `e.relatedTarget` to confirm the pointer has actually left the zone. Alternatively, use `pointer-events-none` on all child elements inside the drop zone.
**Warning signs:** The dashed border highlight turns off mid-drag even when the file is still over the zone.

---

## Code Examples

Verified patterns from official sources and existing codebase:

### Mapbox v6 Forward Geocoding Response
```typescript
// Source: https://docs.mapbox.com/api/search/geocoding/
// GET https://api.mapbox.com/search/geocode/v6/forward?q=...&access_token=...&limit=1
// Response structure (GeoJSON FeatureCollection):
{
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-80.1897, 25.7617]  // [longitude, latitude]
      },
      properties: {
        mapbox_id: "...",
        feature_type: "address",
        place_formatted: "Miami, FL 33101",
        coordinates: {
          longitude: -80.1897,
          latitude: 25.7617,
          accuracy: "rooftop"
        }
      }
    }
  ]
}

// Extraction:
const [lng, lat] = feature.geometry.coordinates;
```

### marina_leads Table DDL
```sql
-- database/003_marina_leads.sql
CREATE TABLE marina_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('yacht_owner', 'marina_owner')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE marina_leads ENABLE ROW LEVEL SECURITY;

-- No SELECT policy — only service_role can read leads (via admin client in API route)
-- No INSERT policy needed when using admin client in API route
-- If using anon client instead, add:
-- CREATE POLICY "Allow anon insert" ON marina_leads FOR INSERT TO anon WITH CHECK (true);
```

### Geocoding Integrated into marina-form.tsx (conceptual flow)
```typescript
// After Supabase insert/update succeeds:
async function geocodeAndUpdate(marinaId: string, fullAddress: string) {
  try {
    const res = await fetch("/api/marinas/geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: fullAddress }),
    });
    const { lat, lng } = await res.json();

    if (lat !== null && lng !== null) {
      await supabase.from("marinas").update({ lat, lng }).eq("id", marinaId);
    } else {
      // Show warning banner — marina saved, won't appear on map
      setGeocodingWarning(true);
    }
  } catch {
    setGeocodingWarning(true);
  }
}
```

### Existing uploadMarinaPhoto() — Reuse Unchanged
```typescript
// src/lib/supabase/storage.ts — already handles path generation, upload, and public URL
// The drop zone component calls this with the File objects from e.dataTransfer.files
// No changes needed to the storage module
await uploadMarinaPhoto(supabase, user.id, file); // → returns public URL string
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Mapbox Geocoding v5 (`/geocoding/v5/mapbox.places/`) | Mapbox Geocoding v6 (`/search/geocode/v6/forward`) | 2024 | v5 is deprecated; v6 is current. Response structure differs — `geometry.coordinates` replaces `.center` |
| Formspree for lead capture | Supabase marina_leads table | This phase | Eliminates external dependency, data stays in project DB |
| `<input type="file">` for photos | HTML5 DnD drop zone | This phase | Better UX, no library needed |

**Deprecated/outdated:**
- Mapbox v5 endpoint: Do not use `/geocoding/v5/`. Use `/search/geocode/v6/forward`.
- The static `landing-page/index.html`: Reference-only after this phase; root URL will serve the Next.js page.

---

## Open Questions

1. **Font Awesome loading strategy**
   - What we know: Static page uses CDN `<link>` in HTML `<head>`
   - What's unclear: Whether to use CDN link in layout.tsx or install `@fortawesome/react-fontawesome` npm package
   - Recommendation: CDN `<link>` in layout.tsx `<head>` is simpler, matches the locked decision to "keep Font Awesome," and avoids a new npm dependency. The `<link>` tag can be placed directly in the JSX returned by `RootLayout`.

2. **Geocoding timing: before or after marina save**
   - What we know: Server-side geocoding, graceful failure saves marina anyway
   - What's unclear: Should geocoding block the form redirect, or run asynchronously after redirect?
   - Recommendation: Run geocoding synchronously before redirect (await the geocode API call, then update lat/lng, then redirect). The latency is acceptable for a rare admin operation. This avoids the complexity of background jobs. If it times out (> 5s), save without coords and show warning.

3. **Availability calendar: tab vs section placement**
   - What we know: Marina detail page already has marina info + slips list; this is Claude's discretion
   - Recommendation: Add as a collapsible section below the slips list on the same page. No new route needed for MVP. A `<details>` / expand toggle keeps the page clean without requiring tab routing infrastructure.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LAND-01 | Landing page renders Hero and How It Works sections | manual-only (visual render) | n/a | n/a |
| LAND-02 | Lead API route returns 400 for missing fields; 201 on valid input | unit | `npx vitest run src/__tests__/lead-api.test.ts` | ❌ Wave 0 |
| MARI-01 | Drop zone calls onFiles with File[] from dataTransfer on drop | unit | `npx vitest run src/__tests__/photo-drop-zone.test.ts` | ❌ Wave 0 |
| MARI-02 | Geocode route returns lat/lng from Mapbox response; returns null/null on failure | unit | `npx vitest run src/__tests__/geocode-api.test.ts` | ❌ Wave 0 |
| MARI-03 | Calendar marks a day as booked when check_in <= day < check_out | unit | `npx vitest run src/__tests__/availability-calendar.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/lead-api.test.ts` — covers LAND-02 (validation logic)
- [ ] `src/__tests__/geocode-api.test.ts` — covers MARI-02 (Mapbox response parsing + failure path)
- [ ] `src/__tests__/photo-drop-zone.test.ts` — covers MARI-01 (drag events, file extraction)
- [ ] `src/__tests__/availability-calendar.test.ts` — covers MARI-03 (date overlap logic)

Note: LAND-01 (visual landing page integration) is manual-only. The DB schema migration (`003_marina_leads.sql`) is a manual step in Supabase SQL editor — no automated test, but verification is part of the lead API test (mocked).

---

## Sources

### Primary (HIGH confidence)
- Mapbox Geocoding API v6 official docs — `https://docs.mapbox.com/api/search/geocoding/` — endpoint URL, required params, v6 response structure
- Supabase RLS docs — `https://supabase.com/docs/guides/database/postgres/row-level-security` — anon role INSERT policy pattern
- Existing codebase (`src/components/marina-form.tsx`, `src/lib/supabase/storage.ts`, `src/app/dashboard/marinas/[id]/page.tsx`, `src/types/database.ts`, `vitest.config.ts`) — established patterns

### Secondary (MEDIUM confidence)
- WebSearch: HTML5 DnD without library — pattern confirmed by multiple sources including dev.to and claritydev.net articles; core API (`onDragOver` + `preventDefault`) is stable W3C spec
- WebSearch: Mapbox v6 vs v5 — blog post `mapbox.com/blog/geocoding-v6` confirms v6 is current; v5 deprecation status

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed; only external call is Mapbox REST API verified via official docs
- Architecture: HIGH — existing patterns in codebase are clear; new patterns follow established conventions
- Pitfalls: HIGH — `e.preventDefault()` for DnD and v6 coordinate format are well-documented; RLS pitfall is verified against official Supabase docs
- Geocoding API: HIGH — endpoint URL and response structure verified against official Mapbox docs

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (Mapbox API stable; Supabase RLS stable; Next.js 15 stable)
