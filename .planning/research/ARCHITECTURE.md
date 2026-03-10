# Architecture Patterns

**Domain:** Two-sided marina booking marketplace (Next.js 15 + Supabase)
**Researched:** 2026-03-09
**Confidence:** HIGH (based on existing codebase analysis + established patterns for each subsystem)

---

## Recommended Architecture

The system follows a layered full-stack Next.js pattern with Supabase as the backend. Four new subsystems must integrate into the existing structure: map-centric search, Stripe Connect payouts, booking lifecycle management, and photo uploads. Each has a clear home in the existing layer model — none require architectural re-invention.

```
Browser
  └── React Components (Client Components, "use client")
        ├── MapView (Mapbox GL JS, client-only)
        ├── SearchFiltersBar (existing, gains map sync)
        ├── BookingWidget (existing, gains fee breakdown)
        ├── PhotoUploader (new, calls storage utility)
        └── DashboardCalendar (new, occupancy view)

Next.js App Router (Server)
  └── API Routes (src/app/api/)
        ├── POST /api/checkout          ← existing, needs Connect transfer
        ├── POST /api/webhooks/stripe   ← existing, needs payout events
        ├── POST /api/connect/onboard   ← new: create Connect account + link
        ├── GET  /api/connect/status    ← new: check onboarding complete
        └── POST /api/bookings/[id]/approve ← new: marina owner approves

Supabase
  ├── PostgreSQL (RLS-enforced)
  │     ├── profiles (+ stripe_account_id column)
  │     ├── marinas  (lat/lng already exist)
  │     ├── slips
  │     └── bookings (+ platform_fee_amount, stripe_transfer_id)
  └── Storage
        └── marina-photos bucket (uploadMarinaPhoto() utility exists)

External Services
  ├── Stripe (Connect + Checkout Sessions)
  └── Mapbox (GL JS tiles + Geocoding API)
```

---

## Component Boundaries

| Component | Responsibility | Communicates With | Location |
|-----------|---------------|-------------------|----------|
| **MapView** | Render Mapbox GL JS map, place marina pins, handle pin click | SearchFiltersBar (receives filters), SlipCard (selected pin triggers), Mapbox tiles (CDN) | `src/components/map-view.tsx` (new) |
| **SearchFiltersBar** | Collect city/dates/boat length filters, trigger search | MapView (syncs viewport), search page state | `src/components/search-filters.tsx` (exists) |
| **SearchPage** | Orchestrate map + list view, query slips with availability | Supabase (slips + marinas), MapView, SlipCard | `src/app/search/page.tsx` (exists, extend) |
| **SlipCard** | Display slip summary with price | SearchPage (receives slip data), navigates to `/slips/[id]` | `src/components/slip-card.tsx` (exists) |
| **BookingWidget** | Date selection, fee breakdown, initiate checkout | `POST /api/checkout` (server), displays EasyDock fee + marina payout | `src/components/booking-widget.tsx` (exists, extend) |
| **PhotoUploader** | Multi-file upload, progress, preview, delete | `uploadMarinaPhoto()` utility, Supabase Storage (marina-photos bucket) | `src/components/photo-uploader.tsx` (new) |
| **MarinaForm** | Create/edit marina with photos | PhotoUploader, Supabase (marinas table) | `src/components/marina-form.tsx` (exists, extend) |
| **BookingInbox** | Marina owner sees pending/approved bookings, approves/declines | `POST /api/bookings/[id]/approve`, Supabase (bookings table) | `src/app/dashboard/bookings/page.tsx` (new) |
| **DashboardCalendar** | Occupancy view per slip, date-based | Supabase (bookings for marina's slips) | `src/app/dashboard/calendar/page.tsx` (new) |
| **ConnectOnboarding** | Stripe Connect setup flow for marina owner | `GET /api/connect/status`, `POST /api/connect/onboard` | `src/app/dashboard/payouts/page.tsx` (new) |
| **PayoutHistory** | Show transfers to marina owner from Stripe | Stripe API via `/api/connect/payouts` | `src/app/dashboard/payouts/page.tsx` (new) |
| **Checkout API** | Validate, create booking, charge with platform fee | Supabase (bookings), Stripe (Checkout Session + `application_fee_amount`) | `src/app/api/checkout/route.ts` (exists, extend) |
| **Stripe Webhook** | Handle payment events, update booking status, record transfer | Supabase admin client (bookings), Stripe events | `src/app/api/webhooks/stripe/route.ts` (exists, extend) |
| **Connect Onboard API** | Create Stripe Connect Express account, generate onboarding URL | Stripe (accounts API), Supabase (profiles.stripe_account_id) | `src/app/api/connect/onboard/route.ts` (new) |

---

## Data Flow

### Map-Centric Search Flow

```
1. User loads /search
2. SearchPage fetches marinas with lat/lng from Supabase
   → SELECT id, name, lat, lng, city FROM marinas WHERE is_active = true
3. MapView renders Mapbox GL JS map centered on South Florida
4. Marina lat/lng pairs become GeoJSON markers on map
5. User clicks pin → map popup shows marina name + slip count + "View Slips"
6. User applies date/length filters → SearchPage re-queries Supabase
   → existing availability conflict query runs against filtered slips
7. Map pins update to reflect available-only marinas
8. User clicks "View Slips" on popup → navigates to /slips/[id] or filters list
```

Key data requirements:
- `marinas.lat` and `marinas.lng` columns already exist in schema (DECIMAL type)
- Marinas without coordinates will not appear on map — geocoding needed at marina creation
- Mapbox GL JS is browser-only ("use client" required on MapView)

### Stripe Connect Payment Flow

```
Current state: Single Stripe Checkout Session, full amount goes to EasyDock Stripe account.

Target state:
1. Marina owner completes Stripe Connect Express onboarding
   → POST /api/connect/onboard creates Stripe Express account
   → Stripe returns account_link URL → browser redirects to Stripe hosted flow
   → On completion, Stripe redirects to /dashboard/payouts?connected=true
   → /api/connect/onboard callback stores stripe_account_id in profiles table

2. Boat owner initiates booking checkout
   → POST /api/checkout validates slip + dates (existing)
   → Calculates platform_fee = totalPrice * FEE_RATE (e.g., 0.10)
   → Creates Stripe Checkout Session with:
       application_fee_amount: platform_fee * 100 (cents)
       transfer_data: { destination: marina.owner.stripe_account_id }
   → Creates booking row with platform_fee_amount stored
   → Returns Stripe session URL

3. Stripe processes payment
   → checkout.session.completed webhook fires (existing handler)
   → Handler updates booking status → "confirmed"
   → Stripe automatically transfers (totalPrice - platform_fee) to marina's Connect account
   → Webhook receives transfer.created event, stores stripe_transfer_id in booking

4. Marina owner views payout
   → GET /api/connect/payouts proxies to Stripe transfers API
   → Filtered to marina's stripe_account_id
   → Displayed in /dashboard/payouts
```

Database changes required:
- `profiles.stripe_account_id TEXT` (marina owner's Connect account ID)
- `profiles.stripe_onboarding_complete BOOLEAN DEFAULT FALSE`
- `bookings.platform_fee_amount NUMERIC(10,2)` (EasyDock's cut, for records)
- `bookings.stripe_transfer_id TEXT` (populated by transfer.created webhook)

### Booking Lifecycle Management Flow

```
Current: pending → confirmed (auto on payment), cancelled (on Stripe expiry)
Missing: marina owner approval step, email notifications, completed status

Target booking state machine:
  pending (created, Stripe session open)
    → confirmed (checkout.session.completed webhook)
      → completed (check_out date passes — cron job or manual)
      → cancelled (marina owner or boat owner cancels post-payment)
    → cancelled (checkout.session.expired webhook)

  Note: "approved" and "declined" statuses exist in DB schema
  but current flow skips them. Two options:

  Option A (simpler): Keep instant confirmation on payment, skip approved state.
  Marina owner can cancel after-the-fact if needed. Lower friction.

  Option B (explicit): Marina owner approves before payment is captured.
  Requires pre-authorization flow (Stripe PaymentIntents with manual capture).
  Significantly more complex.

  Recommendation: Option A — instant confirmation on payment.
  Add manual cancellation capability for marina owners post-payment.
  The "approved" status can be repurposed later for a separate approval
  flow if needed.

Email notification trigger points:
  booking created (pending) → email to marina owner: "New booking request"
  booking confirmed → email to boat owner: "Booking confirmed, payment received"
  booking cancelled → email to both parties
```

### Photo Upload Flow

```
Current: uploadMarinaPhoto() utility exists in src/lib/supabase/storage.ts
Bucket: "marina-photos", path pattern: {userId}/{uuid}.{ext}
Already uses Supabase Storage public URL pattern.

Target integration:
1. Marina owner opens marina create/edit form
2. PhotoUploader component renders file input (multiple)
3. User selects files → client validates type (image/*) and size (<5MB each)
4. On each file: calls uploadMarinaPhoto(supabase, userId, file)
   → uploads to marina-photos bucket via Supabase JS client
   → returns public CDN URL
5. URL array accumulates in component state
6. On form submit: array of URLs written to marinas.photos[] column
   → already TEXT[] type in schema

Delete flow:
1. User clicks X on photo preview
2. Component calls deleteMarinaPhoto(supabase, photoUrl)
   → removes from bucket
3. URL removed from state array
4. On save: updated URL array written to DB

Constraints:
- Supabase Storage bucket must have "marina-photos" bucket created with public access
- RLS on storage bucket: INSERT restricted to authenticated users (userId path prefix)
- Upload is client-side (browser client) — no server proxy needed for MVP
```

---

## Patterns to Follow

### Pattern 1: Server-Side Stripe Operations

**What:** All Stripe API calls (creating sessions, accounts, checking status) happen in `/api/` route handlers, never in client components.

**When:** Any time the app talks to Stripe.

**Why:** Stripe secret key must not reach the browser. Existing `checkout/route.ts` already follows this.

**Example:**
```typescript
// src/app/api/connect/onboard/route.ts
export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = await createClient(); // server client
  const { data: { user } } = await supabase.auth.getUser();
  // create account, store account ID, return onboarding URL
}
```

### Pattern 2: Client-Side Map Rendering

**What:** Mapbox GL JS is a browser-only library. The MapView component must be a Client Component with `"use client"` directive.

**When:** Any component importing `mapbox-gl` or `react-map-gl`.

**Why:** Mapbox accesses `window` and WebGL at import time — will crash in SSR.

**Example:**
```typescript
// src/components/map-view.tsx
"use client";
import Map, { Marker, Popup } from "react-map-gl/mapbox";

export default function MapView({ marinas, onMarinaClick }) {
  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      initialViewState={{ longitude: -80.1, latitude: 26.1, zoom: 10 }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="mapbox://styles/mapbox/outdoors-v12"
    >
      {marinas.map(m => (
        <Marker key={m.id} longitude={m.lng} latitude={m.lat}
          onClick={() => onMarinaClick(m)} />
      ))}
    </Map>
  );
}
```

### Pattern 3: Admin Client for Webhooks

**What:** Stripe webhook handler uses `createAdminClient()` (service role key) to bypass RLS when updating booking status from a server-side process that has no user session.

**When:** Any server-side process that needs to write to DB without an authenticated user context.

**Why:** Webhooks arrive from Stripe's servers, not from a logged-in user. RLS would block all writes with the anon key and no session.

This pattern already exists in `src/app/api/webhooks/stripe/route.ts` and should be extended, not changed.

### Pattern 4: Geocoding at Marina Creation

**What:** When a marina owner submits the marina form with an address, the server resolves lat/lng via Mapbox Geocoding API before inserting to DB.

**When:** Marina create or update, if lat/lng not already set.

**Why:** The marinas table already has lat/lng columns. Map pins require valid coordinates. Deferring geocoding means marinas silently disappear from map.

**Example flow:**
```
MarinaForm → POST /api/marinas → geocode address → insert with lat/lng
```
Or: geocode client-side during form submission using Mapbox Geocoding API with the public token.

### Pattern 5: Split Search Layout (Map + List)

**What:** The search page renders a two-panel layout: map fills one side, scrollable slip card list fills the other. Filters above span both panels.

**When:** Map search page only.

**Why:** Standard pattern for location-based marketplaces (Airbnb, Hipcamp, MarineMax). Users use the map to understand location context while reading slip details in the list.

```
[ SearchFiltersBar (full width) ]
[ MapView (left 60%) | SlipCard List (right 40%, scrollable) ]
```

On mobile: MapView collapses below a toggle button; list is default view.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Trusting Client-Calculated Totals

**What:** The current checkout route accepts `totalPrice` from the request body without server-side recalculation.

**Why bad:** A malicious user could send `totalPrice: 1` and pay $0.01 for a booking.

**Instead:** Server-side checkout route should recalculate total from `slip.price_per_night * nights` and calculate `platform_fee` itself. Never trust price from client.

### Anti-Pattern 2: Charging Without Checking Stripe Connect Status

**What:** Initiating a Stripe Checkout Session with `transfer_data.destination` pointing to a marina's Connect account that hasn't completed onboarding.

**Why bad:** Stripe throws an error if the destination account is not active. The booking gets created but payment fails.

**Instead:** Checkout API checks `profiles.stripe_onboarding_complete = true` for the marina owner before creating the session. If not complete, return 400 with message prompting marina owner to finish onboarding.

### Anti-Pattern 3: Supabase Storage Uploads Through Server

**What:** Routing photo uploads through a Next.js API route as a multipart proxy.

**Why bad:** Netlify serverless functions have a 4MB request body limit by default. Large photos will fail silently or with confusing errors.

**Instead:** Upload directly from browser client using the Supabase JS SDK (existing `uploadMarinaPhoto()` utility already does this correctly). No server proxy needed.

### Anti-Pattern 4: Map Data in Global State

**What:** Storing marina GeoJSON or slip availability data in a global state manager (Context/Zustand) and syncing with the map.

**Why bad:** Map state and filter state go out of sync, causing stale pins. Complex to debug.

**Instead:** MapView receives marina data as props from the parent SearchPage component. SearchPage is the single source of truth; it re-fetches and passes updated data down on filter change.

### Anti-Pattern 5: Polling for Webhook Events

**What:** The booking detail page currently polls every 3 seconds waiting for Stripe webhook to update status from "pending" to "confirmed" after returning from Stripe Checkout.

**Why bad:** Polling has a 60-second timeout and creates unnecessary DB load. This works but is fragile — if Netlify cold-starts delay the webhook, user sees "Processing" for too long.

**Instead (future):** Supabase Realtime subscription on the booking row. The booking detail page subscribes to changes; webhook update triggers immediate UI refresh without polling. For MVP the existing polling is acceptable.

---

## Build Order (Dependency Chain)

The following order respects what each feature depends on being in place first.

```
Phase 1 — Foundation (no new dependencies)
  └── Landing page → Next.js home page
        Dependency: none — just moves static HTML into Next.js page

Phase 2 — Marina Onboarding (unblocks listing creation)
  ├── Photo upload integration (PhotoUploader component + storage bucket config)
  │     Dependency: Supabase Storage bucket exists (uploadMarinaPhoto utility exists)
  └── Marina create/edit form with photos and geocoding
        Dependency: Photo upload + Mapbox token for geocoding
        Output: marinas.lat/lng populated → map search possible

Phase 3 — Map Search (depends on marinas having coordinates)
  ├── Mapbox GL JS map component (MapView)
  │     Dependency: marinas.lat/lng data from Phase 2
  ├── Split layout search page (map + list)
  │     Dependency: MapView component
  └── Geocoding at marina creation
        Dependency: Mapbox public token in env

Phase 4 — Stripe Connect (depends on existing checkout, unblocks payouts)
  ├── Database migration (stripe_account_id, stripe_onboarding_complete, platform_fee_amount)
  │     Dependency: none — schema change only
  ├── Connect onboarding API routes
  │     Dependency: schema migration
  ├── Marina owner Connect setup UI in dashboard
  │     Dependency: Connect API routes
  └── Checkout API updated with application_fee_amount + transfer_data
        Dependency: marina stripe_account_id exists (onboarding complete)

Phase 5 — Booking Lifecycle + Notifications (depends on Connect)
  ├── Booking inbox for marina owner (approve/cancel UI)
  │     Dependency: bookings table RLS already supports marina owner reads
  ├── Booking cancellation API
  │     Dependency: Stripe API for refunds (if post-payment), Connect routing
  ├── Email notifications on booking events
  │     Dependency: booking status transitions confirmed working
  └── Dashboard: occupancy calendar + revenue summary
        Dependency: bookings confirmed flowing (Phase 4 complete)
```

---

## Scalability Considerations

| Concern | At 50 marinas (MVP) | At 500 marinas | At 5,000 marinas |
|---------|---------------------|----------------|------------------|
| Map performance | GeoJSON with all marinas in memory — fine | GeoJSON clustering via Mapbox built-in — needed | Viewport-based tile queries (PostGIS or Mapbox tilesets) |
| Search query | Full table scan with city ILIKE — fine | Add PostGIS spatial index on lat/lng | Vector tile server or dedicated search index |
| Availability query | Two-query pattern (slips then bookings) — fine | Materialized view for availability | Dedicated availability service |
| Photo storage | Supabase Storage, public CDN URLs — fine | CDN is Supabase's CloudFlare layer — scales | Same, no change needed |
| Stripe webhooks | Single webhook endpoint — fine | Same — Stripe handles volume | Same |

For MVP (South Florida, 50-200 marinas), the existing architecture requires no scaling changes. The existing city-based ILIKE index (`idx_marinas_city_active`) and the slip/booking index support the current query patterns.

---

## New Environment Variables Required

| Variable | Purpose | Side |
|----------|---------|------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox GL JS map tiles + Geocoding | Public (browser) |
| `STRIPE_PLATFORM_FEE_RATE` | e.g. `0.10` for 10% — or hardcode in constants | Server |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe.js on client (if needed) | Public (browser) |

---

## Sources

- Existing codebase analysis: `src/app/api/checkout/route.ts`, `src/app/api/webhooks/stripe/route.ts`, `src/lib/supabase/storage.ts`, `src/types/database.ts`, `database/001_initial_schema.sql`
- Stripe Connect Express onboarding pattern: established pattern, HIGH confidence from training (August 2025 cutoff)
- Mapbox GL JS + react-map-gl SSR constraint: established, HIGH confidence
- Supabase Storage client-side upload pattern: confirmed from existing `uploadMarinaPhoto()` utility
- Netlify 4MB body limit: MEDIUM confidence — verify in Netlify docs before routing uploads through server
- PostGIS spatial indexing at scale: established PostgreSQL pattern, HIGH confidence
