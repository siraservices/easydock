# Project Research Summary

**Project:** EasyDock
**Domain:** Two-sided marina booking marketplace (boat owners + marina owners)
**Researched:** 2026-03-09
**Confidence:** HIGH (pitfalls and architecture based on direct codebase analysis; stack and features MEDIUM where external tool access was unavailable)

## Executive Summary

EasyDock is a two-sided marketplace in the mold of Airbnb/Dockwa — marina owners list slips, boat owners discover and book them. The codebase is further along than most MVPs at this stage: authentication, role separation, Supabase schema, a checkout flow, and a basic dashboard all exist. However, four critical gaps block a real-money launch: (1) Stripe Connect is not wired — all payments go to EasyDock's account instead of marina owners; (2) there is no map-based search, which is the primary discovery UX users expect for location-based inventory; (3) the marina owner has no booking inbox to see or act on incoming requests; and (4) email notifications do not exist, so neither party receives confirmation of booking events. Everything else is secondary to closing these four gaps.

The recommended approach is additive — no architectural rework is needed. The existing layered Next.js + Supabase architecture is sound. New capabilities (Mapbox GL JS for the map, Stripe Connect Express for marketplace payouts, Resend for transactional email) slot cleanly into the existing API route and component patterns. The database schema already has the right shape: `lat`/`lng` columns on marinas exist, the booking status machine is defined, and Supabase Storage helpers are already implemented. The primary work is wiring what is present into a working end-to-end transaction loop.

The key risks are financial and operational: the price tampering vulnerability (client-supplied `totalPrice` trusted by the server) can be exploited immediately; the double-booking race condition creates real customer harm at any volume; and an incomplete Stripe Connect onboarding state can leave marina owners unable to receive payouts after their first confirmed booking. These three must be fixed before any real traffic. The map API key must have referrer restrictions applied before public deployment to prevent billing fraud.

---

## Key Findings

### Recommended Stack

The existing stack (Next.js 15 App Router, Supabase, Stripe SDK v20, Tailwind CSS, Netlify) requires only three additions for the target milestone. No architectural additions are needed — all new libraries slot into existing patterns.

**Core technologies to add:**
- `react-map-gl` + `mapbox-gl`: Interactive map rendering — Mapbox chosen over Leaflet (no React 19 native support, no WebGL clustering) and Google Maps (per-load billing model). Free tier covers 50,000 loads/month. Must be rendered as a `"use client"` component.
- Mapbox Geocoding API (REST, no npm package): Address-to-lat/lng conversion at marina creation — same API key as map tiles, no additional vendor. Called server-side only.
- `resend` (^3.x): Transactional email — dominant Next.js community choice, 3,000 emails/month free tier, simplest integration. Not Nodemailer (SMTP overhead) or SendGrid (heavier API).
- Stripe Connect Express (existing `stripe` SDK, no new package): Marketplace payouts — Express is correct for this context; Standard requires marina to independently set up Stripe; Custom requires building full KYC UI.

**New environment variables required:** `NEXT_PUBLIC_MAPBOX_TOKEN`, `STRIPE_CLIENT_ID`, `RESEND_API_KEY`, `FROM_EMAIL`, `STRIPE_PLATFORM_FEE_RATE`

See `.planning/research/STACK.md` for full rationale and alternatives considered.

### Expected Features

The transaction loop is not complete until marina owners can receive real money. Features are ordered by whether they block this loop.

**Must have (blocks the transaction loop):**
- Stripe Connect onboarding for marina owners — no payout routing without it
- EasyDock platform fee via `application_fee_amount` — the revenue model
- Booking inbox for marina owner (approve/cancel incoming requests) — marina owner cannot act without this
- Email confirmations on booking events — both parties need a paper trail
- Map-based slip discovery — users approach location-based inventory spatially; list-only search feels broken

**Must have (launch quality, ships alongside):**
- Photo upload integration — listings without photos get skipped by boat owners
- Cancel booking with Stripe refund — users will request this day one
- Price transparency (fee itemization in booking widget before checkout)

**Defer to post-launch:**
- Occupancy calendar — useful but booking inbox covers the immediate need
- Stored vessel profile — per-booking form fill works at launch
- Slip-level photos — marina-level photos are sufficient for launch
- Availability blackout dates — `is_available` boolean covers launch
- Review/rating system — needs transaction volume before it is meaningful
- Payout history page — Stripe Express dashboard link covers this initially

**Explicitly do not build:**
- Real-time chat, guest checkout, review system, recurring subscriptions, multi-currency, native app, waitlist, dynamic pricing, admin CMS — all add complexity without enabling the core transaction loop.

See `.planning/research/FEATURES.md` for dependency chain and behavioral specifications.

### Architecture Approach

The system follows a layered full-stack Next.js pattern with four new subsystems (map search, Stripe Connect payouts, booking lifecycle management, photo uploads) that each have a clear home in the existing structure. No re-architecture is needed — new components extend existing ones and new API routes follow the established server-side Stripe pattern.

**Major components:**
1. **MapView** (`src/components/map-view.tsx`, new) — Mapbox GL JS map with marina pins, cluster support, popup on click. Client component only. Receives marina data as props from SearchPage.
2. **BookingInbox** (`src/app/dashboard/bookings/page.tsx`, new) — Marina owner sees pending bookings with vessel info, dates, slip name. Approve/decline triggers status update and email.
3. **ConnectOnboarding** (`src/app/dashboard/payouts/page.tsx`, new) — Stripe Express account creation, onboarding link redirect, completion status check. Backed by `POST /api/connect/onboard` and `GET /api/connect/status`.
4. **Checkout API** (`src/app/api/checkout/route.ts`, extend existing) — Must be rewritten to recalculate price server-side, apply platform fee, and route `transfer_data.destination` to marina's `stripe_account_id`.
5. **Stripe Webhook** (`src/app/api/webhooks/stripe/route.ts`, extend existing) — Add idempotency check, store `stripe_charge_id` at confirmation, handle `account.updated` for Connect onboarding status.

**Key patterns to follow:**
- All Stripe API calls server-side only (existing pattern in `checkout/route.ts`)
- MapView must be `"use client"` — Mapbox accesses `window` at import time
- Admin client (`createAdminClient()`) for webhook DB writes — no user session in webhook context
- Photo uploads direct from browser client via Supabase JS SDK — Netlify has 4MB body limit on serverless functions

**Schema migrations required:**
- `profiles.stripe_account_id TEXT`
- `profiles.stripe_onboarding_complete BOOLEAN DEFAULT FALSE`
- `bookings.platform_fee_amount NUMERIC(10,2)`
- `bookings.stripe_transfer_id TEXT`
- `bookings.stripe_charge_id TEXT`

See `.planning/research/ARCHITECTURE.md` for full data flow diagrams and anti-patterns.

### Critical Pitfalls

Research identified 6 critical pitfalls (money loss or trust-breaking) and 8 moderate/minor pitfalls. Top 5 by severity:

1. **Price tampering via client-supplied `totalPrice`** — The checkout API accepts `totalPrice` from the request body and charges it directly. Remove this parameter; recalculate server-side from `slip.price_per_night * nights`. Fix before any real payment.

2. **Stripe Connect not wired — full amount goes to EasyDock** — Current checkout has no `transfer_data.destination`. Marina owners cannot be paid. Violates Stripe ToS for marketplace charges. Rewrite checkout as the first Stripe-related work.

3. **Double-booking race condition** — Availability check and booking INSERT are separate `await` calls with no transaction lock. Two simultaneous requests pass the check and both create confirmed bookings. Fix with Supabase RPC using `SELECT ... FOR UPDATE` plus a partial unique index on `(slip_id, check_in, check_out)` where status is not cancelled/declined.

4. **Stripe Connect incomplete onboarding stored as complete** — An account can be created without `payouts_enabled: true`. Never gate marina "live" status on `stripe_account_id` being non-null alone. Always check `charges_enabled` AND `payouts_enabled` after the redirect. Store `stripe_onboarding_complete = TRUE` only when both are confirmed.

5. **Webhook delivery gap — "paid but pending" bookings** — Existing 60-second polling stops before webhooks from slow Netlify cold starts. Replace with Supabase Realtime subscription on the booking row. Add idempotency check and explicit error logging in the webhook handler; return HTTP 200 only after successful DB write.

See `.planning/research/PITFALLS.md` for complete list with code-level warning signs and phase assignments.

---

## Implications for Roadmap

Based on the dependency chain in FEATURES.md and the build order in ARCHITECTURE.md, five phases are clearly indicated. The ordering is driven by hard dependencies, not preference.

### Phase 1: Booking Flow Hardening

**Rationale:** Three critical bugs exist in the current checkout flow that cause money loss or double bookings. These must be fixed before Stripe Connect is layered on top — adding Connect to a broken checkout creates a compounded mess that is hard to debug.

**Delivers:** A trustworthy booking transaction — correct pricing, no race conditions, correct webhook handling.

**Addresses:** Pitfalls 2 (race condition), 3 (webhook gap), 4 (price tampering), 7 (date boundaries), 13 (orphaned pending bookings).

**Key tasks:**
- Remove client-supplied `totalPrice`; recalculate server-side
- Wrap availability check + INSERT in Supabase RPC with `SELECT ... FOR UPDATE`
- Add partial unique index on `(slip_id, check_in, check_out)`
- Fix webhook: idempotency check, error logging, store `stripe_charge_id`
- Replace booking-status polling with Supabase Realtime subscription
- Run `supabase gen types typescript` and set up `types:gen` npm script

**Research flag:** Standard patterns. No additional research phase needed.

### Phase 2: Marina Onboarding — Photos and Geocoding

**Rationale:** Stripe Connect requires a marina's `stripe_account_id` to exist before checkout can route payments. That field requires the marina record to exist. Marina records need lat/lng for the map. Geocoding happens at marina creation. This phase creates the data prerequisites for both Phase 3 (map) and Phase 4 (payments).

**Delivers:** Complete marina listing with photos and geocoded coordinates ready to appear on a map.

**Addresses:** Photo upload (Supabase Storage bucket already has helpers), geocoding (Mapbox Geocoding API at marina create/update), file validation pitfall (Pitfall 8).

**Key tasks:**
- Confirm `marina-photos` Supabase Storage bucket exists with public read
- Build `PhotoUploader` component with MIME type and 5MB size validation
- Wire photo upload into `MarinaForm` (existing, extend)
- Add Mapbox Geocoding call in marina create/update API route to populate `lat`/`lng`
- Add `NEXT_PUBLIC_MAPBOX_TOKEN` to environment

**Research flag:** Standard patterns. Mapbox Geocoding REST API is well-documented. No research phase needed.

### Phase 3: Map-Centric Search

**Rationale:** Depends on marinas having `lat`/`lng` values (Phase 2). Map discovery is a table-stakes feature — without it, the search experience is visually inadequate for a location-based inventory product. This phase also unblocks removing the `ProtectedRoute` gate from the search page (currently blocks unauthenticated browsing).

**Delivers:** Mapbox GL JS map on the search page with marina pins, split map/list layout, and filters that update both views.

**Addresses:** Map-based discovery (table stakes), unauthenticated browsing (Pitfall 14), map clustering from the start (Pitfall 9), API key referrer restriction (Pitfall 5).

**Key tasks:**
- Install `react-map-gl` and `mapbox-gl`
- Build `MapView` client component with marina markers and popup
- Add marker clustering (Mapbox `supercluster`)
- Refactor search page to split map + list layout
- Remove `ProtectedRoute` from search; gate only the "Book Now" action
- Restrict Mapbox token to production domain in Mapbox dashboard before deploy

**Research flag:** `react-map-gl` + Mapbox pattern is well-documented. Verify current version (MEDIUM confidence on v7 being current). Viewport-bounds Supabase query is straightforward.

### Phase 4: Stripe Connect Payouts

**Rationale:** This is the most critical phase for real-money operation. Depends on marina records existing (Phase 2) so `stripe_account_id` has somewhere to live. Must be complete before real bookings can be accepted, as the current checkout violates Stripe ToS for marketplace charges.

**Delivers:** Marina owners can onboard with Stripe Express, the checkout routes funds correctly, EasyDock receives a platform fee, and marina owners see payouts via Stripe Express dashboard.

**Addresses:** Pitfall 1 (Connect not wired), Pitfall 6 (incomplete onboarding state), Pitfall 10 (refund handling for split payments).

**Key tasks:**
- Database migration: `stripe_account_id`, `stripe_onboarding_complete` on profiles; `platform_fee_amount`, `stripe_transfer_id`, `stripe_charge_id` on bookings
- `POST /api/connect/onboard` and `GET /api/connect/status` API routes
- `ConnectOnboarding` UI in marina owner dashboard
- Rewrite checkout to use `transfer_data.destination` and `application_fee_amount`
- Verify `charges_enabled` and `payouts_enabled` before marking onboarding complete
- Add `account.updated` webhook handler
- Block checkout for marinas where `stripe_onboarding_complete = FALSE`
- Add `STRIPE_CLIENT_ID` and `STRIPE_PLATFORM_FEE_RATE` to environment

**Research flag:** Stripe Connect Express is HIGH confidence (well-documented official pattern). Test with Stripe test mode connected accounts before any real marina onboards. No additional research phase needed, but validate the `transfer_data` vs `on_behalf_of` distinction in current Stripe docs.

### Phase 5: Booking Lifecycle and Notifications

**Rationale:** Depends on Connect being live (Phase 4) because cancellation refunds are more complex for split payments. Booking inbox depends on bookings flowing correctly through the confirmed state. Emails depend on status transitions being reliable.

**Delivers:** Marina owner can manage bookings, both parties receive email notifications, cancellations are handled with correct Stripe refunds, and the product is ready for public launch.

**Addresses:** Booking inbox (critical gap), email notifications (table stakes), cancellation with refund (Pitfall 10), RLS admin bypass for booking management (Pitfall 11).

**Key tasks:**
- Build `BookingInbox` dashboard page for marina owners
- Booking cancellation API with `stripe.refunds.create({ reverse_transfer: true, refund_application_fee: true })`
- Install `resend`, add `RESEND_API_KEY` and `FROM_EMAIL` to environment
- Email triggers: booking created, booking confirmed, booking cancelled
- Price transparency in `BookingWidget` (itemize EasyDock fee before checkout)
- Admin RLS bypass for profile lookups (Pitfall 11)

**Research flag:** Resend integration is MEDIUM confidence (dominant Next.js community choice as of mid-2025; verify current package version). Booking inbox UI is straightforward. Cancellation refund flow needs Stripe docs verification for current parameter names.

### Phase Ordering Rationale

- Phase 1 before everything: existing bugs corrupt any work layered on top of them.
- Phase 2 before Phase 3: map pins require geocoded coordinates; marina records must exist before Stripe Connect account IDs can be stored.
- Phase 3 before Phase 4: not a hard dependency, but map discovery is user-facing and can be tested with real marina owners during Connect onboarding.
- Phase 4 before Phase 5: cancellation refunds and booking inbox behavior depend on Connect routing being correct first.

### Research Flags

Phases needing deeper research during planning:
- **Phase 4 (Stripe Connect):** Verify `transfer_data` vs `on_behalf_of` distinction in current Stripe Connect docs before implementation begins. Stripe docs evolve. Validate test mode connected account setup procedure.
- **Phase 5 (Resend):** Confirm `resend` npm package is still v3.x and verify current API surface before installation.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Booking hardening):** All fixes address documented bugs in existing code. Patterns (Supabase RPC, Realtime subscriptions) are well-established.
- **Phase 2 (Marina onboarding):** Supabase Storage and Mapbox Geocoding REST are stable APIs.
- **Phase 3 (Map search):** Mapbox GL JS / react-map-gl patterns are thoroughly documented.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Core additions (react-map-gl, Resend) verified against training knowledge through August 2025; no live version check was possible. Stripe Connect Express is HIGH. |
| Features | MEDIUM | Competitor feature analysis (Dockwa, Snag-A-Slip) from training knowledge, not live site inspection. Existing codebase feature gaps are HIGH confidence (direct code analysis). |
| Architecture | HIGH | Based on direct analysis of existing codebase — `checkout/route.ts`, `webhooks/stripe/route.ts`, `storage.ts`, `001_initial_schema.sql`. Patterns are well-established. |
| Pitfalls | HIGH | Six critical pitfalls sourced directly from codebase code paths and documented bugs in CONCERNS.md. Not inferred — verified in actual files. |

**Overall confidence:** HIGH for implementation guidance; MEDIUM for library version specifics.

### Gaps to Address

- **react-map-gl version:** Confirm v7 is the current stable release before `npm install`. The research notes v7 as of mid-2025; verify patch version.
- **Resend package version:** Confirm `resend` is still ^3.x and API has not changed before installation.
- **Stripe `transfer_data` vs `on_behalf_of`:** These have different tax and compliance implications for marketplaces. Validate which applies to EasyDock's model in current Stripe Connect docs before Phase 4 begins.
- **Payment capture timing decision:** FEATURES.md identifies an unresolved design question — does payment capture happen at booking creation (current: Stripe Checkout immediate capture) or at approval (requires PaymentIntents with manual capture)? Architecture recommends Option A (instant confirmation on payment) but this must be explicitly decided before Phase 4 implementation.
- **Netlify 4MB body limit:** Confirm this limit applies to Netlify serverless functions before finalizing the photo upload architecture. Direct browser-to-Supabase upload (current plan) avoids this, but should be confirmed.
- **Mapbox token restriction process:** The process for restricting a Mapbox token to specific referrer URLs must be verified in Mapbox dashboard documentation before production deployment of the map.

---

## Sources

### Primary (HIGH confidence)
- Codebase direct analysis: `src/app/api/checkout/route.ts`, `src/app/api/webhooks/stripe/route.ts`, `src/lib/supabase/storage.ts`, `src/types/database.ts`, `database/001_initial_schema.sql`, `CONCERNS.md`
- Stripe Connect Express: https://stripe.com/docs/connect/express-accounts (established, HIGH confidence from training)
- Stripe marketplace payments: https://stripe.com/docs/connect/collect-then-transfer-guide

### Secondary (MEDIUM confidence)
- react-map-gl: https://visgl.github.io/react-map-gl/ — training knowledge through August 2025
- Resend: https://resend.com/docs/introduction — training knowledge through August 2025
- Dockwa / Snag-A-Slip feature analysis — training knowledge, not verified against current live sites
- Airbnb map UX patterns — well-established, HIGH confidence

### Tertiary (LOW confidence)
- Netlify 4MB serverless body limit — stated in ARCHITECTURE.md; verify in Netlify docs before implementation
- Supabase pg_cron for stale booking cleanup — standard PostgreSQL extension but Supabase enablement may require project plan verification

---
*Research completed: 2026-03-09*
*Ready for roadmap: yes*
