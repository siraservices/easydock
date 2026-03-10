# Technology Stack — Additions for Milestone

**Project:** EasyDock
**Researched:** 2026-03-09
**Scope:** New libraries needed for map-centric search, Stripe Connect payouts, and photo uploads. Does NOT re-document existing stack (Next.js 15, Supabase, Stripe SDK, Tailwind).

---

## What Already Exists (do not re-add)

The codebase already has:

- `@supabase/supabase-js` 2.47.12 — Supabase client (db + auth + storage)
- `@supabase/ssr` 0.5.2 — Server-side Supabase client
- `stripe` 20.4.0 — Stripe SDK (checkout sessions + webhook handler in place)
- Supabase Storage with `marina-photos` bucket, upload/delete helpers in `src/lib/supabase/storage.ts`
- `lat`/`lng` columns on the `marinas` table (DECIMAL) — schema is ready, values are unpopulated

What is NOT yet present:

- Any map rendering library
- Geocoding for address → lat/lng conversion
- Stripe Connect account linking, onboarding, and split payments
- Email transactional delivery

---

## Additions Needed

### 1. Map Rendering

**Recommendation: `react-map-gl` (Mapbox GL JS wrapper)**

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `react-map-gl` | ^7.1.7 | Interactive map component for React | Official Mapbox wrapper, maintained by Uber/Visgl, supports React 18+/19, works with Next.js App Router via `"use client"` |
| `mapbox-gl` | ^3.x | Underlying GL renderer | Peer dep of react-map-gl; required separately |

**Confidence: MEDIUM** — react-map-gl v7 was the stable release series as of mid-2025; verify current patch version before installing.

Why Mapbox over alternatives:

- **Not Leaflet**: Leaflet uses raster tiles and has no native React 19 support. Its ecosystem wrapper (`react-leaflet`) requires SSR workarounds in Next.js App Router and cannot do WebGL clustering — a problem as marina count grows.
- **Not Google Maps React**: Google Maps JavaScript API charges per map load, has a more complex billing model, and the React wrapper (`@react-google-maps/api`) has historically lagged in support.
- **Not OpenLayers**: Too low-level for an MVP; significant configuration overhead with no benefit over Mapbox at this scale.

Mapbox has a generous free tier (50,000 map loads/month), WebGL rendering for smooth interaction, built-in clustering support, and the best DX for pin/popup patterns that EasyDock needs.

**Environment variable required:**
```
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
```

**SSR note:** `react-map-gl` must be rendered in a `"use client"` component. Do not attempt to render it server-side. Use `dynamic(() => import(...), { ssr: false })` if the map component is inside a server layout.

---

### 2. Geocoding (Address → Lat/Lng)

**Recommendation: Mapbox Geocoding API (server-side only)**

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Mapbox Geocoding API | REST (no npm pkg needed) | Convert marina address to lat/lng on save | Same API key as map tiles; no additional vendor; covered under Mapbox free tier |

**Confidence: HIGH** — this is the standard pattern when Mapbox is already in use.

Call the geocoding endpoint from a Next.js API Route (not client-side) when a marina is created or its address updated. Store the resulting `lat`/`lng` in the `marinas` table. The `marinas` table already has `lat DECIMAL(10,8)` and `lng DECIMAL(11,8)` columns.

**What NOT to use:**
- Google Geocoding API — requires a separate billing-enabled project, adds vendor complexity
- `opencage` or `nominatim` — lower accuracy for US addresses, rate limits in free tier

---

### 3. Stripe Connect (Marketplace Payouts)

**Recommendation: Stripe Connect Express accounts**

No new npm package needed — the existing `stripe` SDK (v20.4.0) supports Connect fully.

| Feature | Stripe API | Notes |
|---------|-----------|-------|
| Marina onboarding | `stripe.accountLinks.create()` | Hosted onboarding via Stripe Express; marina owner leaves site, returns with connected account |
| Payment with fee | `stripe.checkout.sessions.create()` with `payment_intent_data.application_fee_amount` and `transfer_data.destination` | Collect full amount, Stripe routes marina share minus EasyDock fee |
| Payout visibility | `stripe.transfers.list()` or Connect dashboard | Marina owners see payouts in their Stripe Express dashboard; EasyDock does not need to build payout UI |

**Confidence: HIGH** — Stripe Connect Express is the documented approach for marketplaces where the platform controls the UX and connected parties just receive money. Standard and Custom accounts require more compliance work that is inappropriate for an MVP.

**Schema changes required:**

Add `stripe_account_id TEXT` to the `profiles` table (or `marinas` table). The legacy schema at `database/schema_legacy.sql` already documented this intent. A migration SQL file is needed.

**New environment variables required:**
```
STRIPE_CLIENT_ID=ca_xxx          # Connect application client_id from Stripe Dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx  # Already needed but may not be in env
```

**Key implementation pattern:**

```
Marina onboarding:
POST /api/stripe/connect/onboard  →  creates Stripe Express account, returns account link URL
GET  /api/stripe/connect/callback →  user returns here after Stripe onboarding; save account_id

Checkout (modified from existing):
stripe.checkout.sessions.create({
  payment_intent_data: {
    application_fee_amount: Math.round(totalPrice * FEE_PERCENT * 100),
    transfer_data: { destination: marinaStripeAccountId },
  },
  ...existing fields
})
```

**What NOT to do:**
- Do not use Stripe Standard accounts — they require the marina to set up their own Stripe account independently and grant EasyDock access; poor UX for marina owners.
- Do not use manual transfers (`stripe.transfers.create()`) after charge — this is a two-step pattern that creates reconciliation risk; use `transfer_data.destination` on checkout session instead.
- Do not charge and then transfer in a webhook — this is the old pattern; the `transfer_data` on session creation is atomic.

---

### 4. Email Transactional Delivery

**Recommendation: Resend**

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `resend` | ^3.x | Send booking confirmation, approval, and denial emails | Developer-first API, generous free tier (3,000 emails/month), React Email component support, simplest integration for Next.js |

**Confidence: MEDIUM** — Resend was the dominant choice in the Next.js community as of mid-2025; verify current package version.

**What NOT to use:**
- The existing Python/SMTP email automation in `cold-email-automation/` — that is for outreach, not transactional. It uses Gmail App Passwords and is rate-limited and fragile.
- SendGrid — more complex setup, older API design, pricing now less competitive on free tier.
- AWS SES — requires domain verification steps and IAM complexity inappropriate for MVP.
- Nodemailer — works but requires managing SMTP infrastructure; Resend abstracts this.

**Trigger points for emails:**
1. Booking created → yacht owner (confirmation) + marina owner (new booking request)
2. Booking approved → yacht owner
3. Booking declined → yacht owner
4. Booking cancelled → other party

**Environment variable required:**
```
RESEND_API_KEY=re_xxx
FROM_EMAIL=bookings@easydock.com
```

---

### 5. Photo Uploads — No New Libraries Needed

The `src/lib/supabase/storage.ts` module already implements `uploadMarinaPhoto` and `deleteMarinaPhoto` using the Supabase Storage bucket `marina-photos`. The `MarinaForm` component already calls these. This is fully functional.

What is needed is operational, not code:
- The `marina-photos` bucket must exist in the Supabase project with public read access
- A parallel bucket `slip-photos` should be created for slip-level photos if that feature is added
- File size limits and MIME type restrictions should be set in bucket policy (Supabase dashboard)

**No npm additions required for photo uploads.**

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Map rendering | react-map-gl + Mapbox | react-leaflet | Leaflet: raster tiles, no React 19 native support, no WebGL clustering |
| Map rendering | react-map-gl + Mapbox | @react-google-maps/api | Google: per-load billing, stale wrapper library |
| Geocoding | Mapbox Geocoding API | Google Geocoding API | Separate billing project required, more vendors |
| Geocoding | Mapbox Geocoding API | Nominatim (OSM) | Lower accuracy, strict rate limits |
| Connect account type | Stripe Express | Stripe Standard | Standard requires marina to independently create Stripe account |
| Connect account type | Stripe Express | Stripe Custom | Custom requires full KYC UI build — wrong for MVP |
| Email | Resend | SendGrid | SendGrid: heavier API, less Next.js-native, free tier less generous |
| Email | Resend | Nodemailer | Nodemailer: SMTP management overhead |
| Email | Resend | Supabase Edge Functions + SMTP | Adds Deno runtime complexity for simple transactional emails |

---

## Installation

```bash
# Map rendering
npm install react-map-gl mapbox-gl

# Email delivery
npm install resend

# No additional installs for Stripe Connect, geocoding, or photo uploads
```

---

## New Environment Variables Required

```bash
# Mapbox (map tiles + geocoding)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx

# Stripe Connect
STRIPE_CLIENT_ID=ca_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx   # may already exist as NEXT_PUBLIC_

# Resend (transactional email)
RESEND_API_KEY=re_xxx
FROM_EMAIL=bookings@easydock.com
```

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| react-map-gl for Mapbox | MEDIUM | v7 stable as of Aug 2025; verify latest patch before installing |
| Mapbox Geocoding API | HIGH | Stable REST API, no breaking changes in years |
| Stripe Connect Express | HIGH | Official Stripe marketplace pattern, well-documented |
| Stripe SDK Connect support | HIGH | Existing stripe v20 SDK fully supports Connect |
| Resend for email | MEDIUM | Dominant choice mid-2025; verify v3 is still current |
| Supabase Storage (photos) | HIGH | Already implemented in codebase, confirmed working |

---

## Sources

- Codebase analysis: `src/lib/supabase/storage.ts`, `src/app/api/checkout/route.ts`, `src/components/marina-form.tsx`, `database/001_initial_schema.sql`
- react-map-gl: https://visgl.github.io/react-map-gl/
- Stripe Connect Express: https://stripe.com/docs/connect/express-accounts
- Stripe marketplace payments: https://stripe.com/docs/connect/collect-then-transfer-guide
- Resend: https://resend.com/docs/introduction
- Confidence levels based on training data through August 2025; external tool access was unavailable during this research session
