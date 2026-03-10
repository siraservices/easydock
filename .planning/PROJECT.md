# EasyDock

## What This Is

A two-sided marketplace connecting yacht owners with marina slip rentals in South Florida — Airbnb for boat slips. Yacht owners search a map, find available slips that fit their vessel, book and pay online. Marina owners list their docks, manage availability, and receive payouts.

## Core Value

A yacht owner can find an available slip, book it, and pay — and a marina owner receives that booking and gets paid. The complete transaction loop must work end-to-end.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. Inferred from existing codebase. -->

- ✓ Next.js 15 app with TypeScript and Tailwind CSS — existing
- ✓ Supabase database schema (profiles, marinas, slips, bookings) with RLS — existing
- ✓ Auth system with signup/login/logout and role-based access (boat_owner, marina_owner, admin) — existing
- ✓ Protected routes with role-based guards — existing
- ✓ Marina owner dashboard with marina CRUD and slip management — existing
- ✓ Slip search page with filtering by city/dates/boat length — existing
- ✓ Booking checkout API with Stripe session creation — existing
- ✓ Landing page with lead capture form (partially working) — existing
- ✓ Netlify deployment configuration — existing

### Active

<!-- Current scope. Building toward these. -->

- [ ] Landing page integrated as Next.js home page (replace current placeholder)
- [ ] Marina onboarding flow: marina owner signs up → adds slip with price/availability/photos → slip goes live
- [ ] Map-centric slip discovery: yacht owners see pins on a map, explore by location
- [ ] Complete booking flow: select slip + dates → see total price with EasyDock fee → checkout
- [ ] Stripe Connect integration: marina owners onboard to Stripe, receive payouts
- [ ] EasyDock percentage-based fee on each booking
- [ ] Booking management: marina owner approves/denies; yacht owner sees status
- [ ] Email confirmations for both parties on booking events
- [ ] Marina dashboard: occupancy calendar, revenue summary, payout history
- [ ] Yacht owner profile: stored boat specs (length, beam, draft, type) for faster booking
- [ ] Photo upload for marina and slip listings

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Real-time chat between owners — high complexity, not core to booking loop
- Mobile native app — web-first, mobile later
- Multi-region expansion — South Florida only for MVP
- Video content for listings — storage/bandwidth costs, defer to post-launch
- OAuth social login — email/password sufficient for MVP
- Subscription/membership model — percentage-based fee is the model

## Context

EasyDock is a brownfield project with significant existing code. The Next.js app has auth, database schema, search, dashboard, and checkout API routes already built. However, the full transaction loop is not yet complete — Stripe Connect for marina payouts is missing, the landing page sits in a separate `landing-page/` directory outside the Next.js app, and the map-based search experience needs to replace the current text-based search.

There is a separate `cold-email-automation/` Python tool for marina outreach, and a `landing-page/` static HTML site with a partially working lead capture form that submits to Supabase's `marina_leads` table.

The goal is a public launch — both sides of the marketplace working simultaneously, real payments flowing.

## Constraints

- **Tech stack**: Next.js 15, React 19, Supabase, Stripe Connect, Tailwind CSS — already established
- **Hosting**: Netlify with @netlify/plugin-nextjs for SSR
- **Geography**: South Florida marinas only for MVP
- **Revenue model**: Percentage-based fee on each booking (exact % TBD)
- **Auth**: Supabase Auth with email/password, RLS on all tables

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Map-centric search over text search | Users think spatially about marinas — "near me" or "near my yacht club" | — Pending |
| Stripe Connect for payouts | Industry standard for marketplace payments, handles compliance | — Pending |
| Percentage fee model | Aligns EasyDock revenue with partner success | — Pending |
| Landing page into Next.js | Single deployment, shared auth, consistent branding | — Pending |
| Both sides simultaneously | Need working marketplace for public launch, can't launch one-sided | — Pending |

---
*Last updated: 2026-03-09 after initialization*
