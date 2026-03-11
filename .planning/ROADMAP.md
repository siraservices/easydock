# Roadmap: EasyDock

## Overview

Five phases to close the transaction loop: harden the existing booking flow before adding anything, prepare the supply side with photos and geocoding, replace text search with a map, wire real marketplace payouts via Stripe Connect, then complete the booking lifecycle with management tools and email notifications. At the end of Phase 5 a yacht owner can find a slip on a map, book it, and pay — and a marina owner receives that booking, acts on it, and gets paid.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Booking Hardening** - Fix price tampering, double-booking, and webhook gaps before anything is built on top (completed 2026-03-10)
- [x] **Phase 2: Landing Page and Marina Onboarding** - Integrate marketing home page and give marina owners photo uploads and geocoded listings (completed 2026-03-11)
- [x] **Phase 3: Map Search** - Replace text-based search with Mapbox map and allow unauthenticated browsing (completed 2026-03-11)
- [ ] **Phase 4: Stripe Connect Payouts** - Wire marketplace payments so marina owners can onboard and receive real money
- [ ] **Phase 5: Booking Lifecycle and Notifications** - Booking inbox, cancellations with refunds, and email notifications for both parties

## Phase Details

### Phase 1: Booking Hardening
**Goal**: The booking transaction is trustworthy — correct pricing, no double-bookings, and reliable webhook confirmation
**Depends on**: Nothing (first phase)
**Requirements**: HARD-01, HARD-02, HARD-03
**Success Criteria** (what must be TRUE):
  1. Submitting a manipulated price in the checkout request does not change what the user is charged — the server ignores client-supplied price and recalculates from slip rate and dates
  2. Two simultaneous booking requests for the same slip and dates result in exactly one confirmed booking and one rejection
  3. A booking only reaches "confirmed" status in the database after the Stripe webhook has successfully verified the payment and completed the database write
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Server-side price calculation, atomic double-booking prevention via PostgreSQL RPC, and database migration
- [ ] 01-02-PLAN.md — Idempotent webhook handler with error-aware responses and Vitest test scaffolding

### Phase 2: Landing Page and Marina Onboarding
**Goal**: The public home page is the Next.js app, marina owners can upload photos, and every marina has geocoded coordinates ready for the map
**Depends on**: Phase 1
**Requirements**: LAND-01, LAND-02, MARI-01, MARI-02, MARI-03
**Success Criteria** (what must be TRUE):
  1. Visiting the root URL renders the marketing landing page with the lead capture form inside the Next.js app (not a separate static site)
  2. A marina owner submits the lead capture form and their details appear in the Supabase marina_leads table with validation errors shown for missing fields
  3. A marina owner uploads photos via drag-and-drop in the marina form and the images appear publicly on the listing
  4. Creating or editing a marina with a street address automatically populates the lat/lng fields without the marina owner entering coordinates manually
  5. A marina owner opens the availability calendar and sees which dates each slip is booked versus open
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Landing page integration with lead capture form and marina_leads API route
- [ ] 02-02-PLAN.md — Drag-and-drop photo upload and Mapbox geocoding for marina form
- [ ] 02-03-PLAN.md — Read-only availability calendar on marina detail page

### Phase 3: Map Search
**Goal**: Yacht owners can browse marina locations on an interactive map without signing in, and filter results by vessel dimensions
**Depends on**: Phase 2
**Requirements**: SRCH-01, SRCH-02, SRCH-03
**Success Criteria** (what must be TRUE):
  1. A visitor who is not logged in can navigate to the search page, see a Mapbox map with marina location pins, and click a pin to view slip details
  2. A yacht owner enters their vessel length and beam into filter controls and the map and list both update to show only compatible slips
  3. The "Book Now" button on a slip requires authentication but browsing the map and viewing slip details does not
**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md — Core map search: MapView component, split map/list layout, beam filter, unauthenticated access
- [ ] 03-02-PLAN.md — Interactive polish: bi-directional hover sync, mobile responsive layout, geolocation, empty states

### Phase 4: Stripe Connect Payouts
**Goal**: Marina owners can link their Stripe account, and the checkout routes the correct split — EasyDock platform fee plus transfer to the marina — for every completed booking
**Depends on**: Phase 2
**Requirements**: PAY-01, PAY-02, PAY-03
**Success Criteria** (what must be TRUE):
  1. A marina owner clicks "Connect Stripe" in their dashboard, completes the Express onboarding flow, and their account shows as active with payouts enabled
  2. A completed booking charges the yacht owner the correct total, deducts EasyDock's platform fee, and the remainder transfers to the marina's connected Stripe account
  3. A marina whose Stripe onboarding is incomplete cannot accept bookings — the checkout is blocked with a clear message
  4. A marina owner can view their payout history (via Stripe Express dashboard link) from within the EasyDock dashboard
**Plans**: TBD

Plans:
- [ ] 04-01: Database migration and Connect onboarding API routes
- [ ] 04-02: Checkout rewrite with transfer_data and platform fee
- [ ] 04-03: Payout history view and onboarding status webhook

### Phase 5: Booking Lifecycle and Notifications
**Goal**: Marina owners can manage incoming bookings, either party can cancel with correct refund handling, and both parties receive email on every booking event — the product is ready for public launch
**Depends on**: Phase 4
**Requirements**: BOOK-01, BOOK-02, BOOK-03, EMAL-01, EMAL-02
**Success Criteria** (what must be TRUE):
  1. A marina owner sees all incoming booking requests in a dashboard inbox and can approve or deny each one with a single action
  2. A yacht owner can view their full booking history with current status (pending, approved, confirmed, cancelled) from their account
  3. Either party can cancel a booking and the yacht owner receives a Stripe refund that correctly reverses both the platform fee and the marina transfer
  4. Both parties receive an email when a booking is created, and again when booking status changes to approved, denied, or cancelled
**Plans**: TBD

Plans:
- [ ] 05-01: Booking inbox for marina owners and booking history for yacht owners
- [ ] 05-02: Cancellation with Stripe refund reversal
- [ ] 05-03: Email notifications via Resend for all booking events

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Booking Hardening | 2/2 | Complete   | 2026-03-10 |
| 2. Landing Page and Marina Onboarding | 3/3 | Complete   | 2026-03-11 |
| 3. Map Search | 2/2 | Complete   | 2026-03-11 |
| 4. Stripe Connect Payouts | 0/3 | Not started | - |
| 5. Booking Lifecycle and Notifications | 0/3 | Not started | - |
