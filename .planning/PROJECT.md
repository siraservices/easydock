# EasyDock

## What This Is

A two-sided marina booking marketplace for South Florida — Airbnb for boat slips. Yacht owners search an interactive map, find slips that fit their vessel, book and pay with Stripe. Marina owners list docks with photos and geocoded locations, manage bookings through a dashboard inbox, and receive payouts via Stripe Connect. Email notifications keep both parties informed at every booking stage.

## Core Value

A yacht owner can find an available slip, book it, and pay — and a marina owner receives that booking and gets paid. The complete transaction loop works end-to-end.

## Requirements

### Validated

- ✓ Next.js 15 app with TypeScript and Tailwind CSS — existing
- ✓ Supabase database schema (profiles, marinas, slips, bookings) with RLS — existing
- ✓ Auth system with signup/login/logout and role-based access — existing
- ✓ Protected routes with role-based guards — existing
- ✓ Marina owner dashboard with marina CRUD and slip management — existing
- ✓ Booking checkout API with Stripe session creation — existing
- ✓ Netlify deployment configuration — existing
- ✓ Server calculates total price from slip rate and dates (HARD-01) — v1.0
- ✓ Booking creation uses DB transaction to prevent double-booking (HARD-02) — v1.0
- ✓ Stripe webhook verifies DB write before returning 200 (HARD-03) — v1.0
- ✓ Landing page integrated as Next.js home page with lead capture (LAND-01, LAND-02) — v1.0
- ✓ Marina photo upload via drag-and-drop (MARI-01) — v1.0
- ✓ Marina address auto-geocoded to lat/lng (MARI-02) — v1.0
- ✓ Availability calendar per slip (MARI-03) — v1.0
- ✓ Interactive map search with marina pins (SRCH-01) — v1.0
- ✓ Unauthenticated browsing on search page (SRCH-02) — v1.0
- ✓ Vessel dimension filtering (SRCH-03) — v1.0
- ✓ Stripe Connect Express onboarding (PAY-01) — v1.0
- ✓ Checkout splits payment with platform fee (PAY-02) — v1.0
- ✓ Payout history in dashboard (PAY-03) — v1.0
- ✓ Booking inbox with approve/deny (BOOK-01) — v1.0
- ✓ Booking history and status display (BOOK-02) — v1.0
- ✓ Cancel with Stripe refund reversal (BOOK-03) — v1.0
- ✓ Email on booking creation (EMAL-01) — v1.0
- ✓ Email on status change (EMAL-02) — v1.0

### Active

<!-- Next milestone scope — to be defined via /gsd:new-milestone -->

### Out of Scope

- Real-time chat between owners — high complexity, not core to booking loop
- Mobile native app — web-first, PWA works well on mobile
- Multi-region expansion — South Florida only for MVP
- Video content for listings — storage/bandwidth costs, defer to post-launch
- OAuth social login — email/password sufficient for MVP
- Subscription/membership model — percentage-based fee is the model
- Offline mode — real-time booking availability is core

## Context

EasyDock shipped v1.0 MVP with 10,093 lines of TypeScript/TSX across 5 phases in 3 days. The full transaction loop is complete: yacht owners can search a Mapbox map, filter by vessel dimensions, book a slip, and pay via Stripe. Marina owners onboard with Stripe Connect, manage bookings through a dashboard inbox (approve/deny/cancel), and receive payouts. Both parties get email notifications on every booking event via Resend.

**Tech stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Supabase (PostgreSQL + Auth + Storage + RLS), Stripe Connect, Mapbox GL JS, Resend + React Email, Vitest (97 tests)

**Known tech debt:**
- 1 failing test in Phase 3 (buildSlipQuery missing null-coordinate guards — 2-line fix)
- Mock data fallback blocks demo booking flow (mock marinas have no Stripe Connect)
- Client-side price calculation in booking widget is dead code (server always recomputes)

**External setup required for production:**
- SQL migrations run in Supabase (database/001-008)
- Stripe webhook endpoint configured for Connect events
- RESEND_API_KEY + verified domain for email delivery
- MAPBOX_ACCESS_TOKEN for map and geocoding

## Constraints

- **Tech stack**: Next.js 15, React 19, Supabase, Stripe Connect, Tailwind CSS — established
- **Hosting**: Netlify with @netlify/plugin-nextjs for SSR
- **Geography**: South Florida marinas only for MVP
- **Revenue model**: 15% platform fee (10% yacht owner surcharge + 5% marina deduction)
- **Auth**: Supabase Auth with email/password, RLS on all tables

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Map-centric search over text search | Users think spatially about marinas | ✓ Good — Mapbox map with pins, viewport filtering |
| Stripe Connect for payouts | Industry standard for marketplace payments | ✓ Good — Express onboarding, destination charges |
| Percentage fee model (15% split) | Aligns EasyDock revenue with partner success | ✓ Good — 10% surcharge + 5% marina deduction |
| Landing page into Next.js | Single deployment, shared auth, consistent branding | ✓ Good — marketing page is app root |
| Both sides simultaneously | Need working marketplace for public launch | ✓ Good — full loop complete |
| Server-side price calculation | Prevent client-side price tampering | ✓ Good — HARD-01 verified |
| PostgreSQL FOR UPDATE lock for bookings | Atomic double-booking prevention | ✓ Good — HARD-02 verified |
| DB-first update before Stripe refund | Booking status correct even if Stripe fails | ✓ Good — cancel route pattern |
| Lazy Resend initialization | Avoid build-time crash without API key | ✓ Good — singleton getter pattern |
| adminClient for cross-user operations | RLS blocks cross-user email lookups and Connect status | ✓ Good — used in cancel, email, checkout |

---
*Last updated: 2026-03-12 after v1.0 milestone*
