# Feature Landscape

**Domain:** Marina/dock slip booking marketplace (two-sided: boat owners + marina owners)
**Researched:** 2026-03-09
**Confidence note:** Web search unavailable. Findings drawn from training knowledge of Dockwa, Snag-A-Slip, Marinas.com competitor analysis and Airbnb-pattern marketplace patterns. MEDIUM confidence overall; verified against existing codebase.

---

## Table Stakes

Features users expect. Missing = product feels incomplete or broken.

### Boat Owner Side

| Feature | Why Expected | Complexity | Current State | Notes |
|---------|--------------|------------|---------------|-------|
| Map-based slip discovery | Users think spatially — "near my yacht club" or "near X inlet." List view without map feels like Craigslist | Medium | Not built — current search is city-text + card grid | Requires geocoded marina lat/lng (schema has `lat`/`lng` columns already). Mapbox GL or Google Maps JS SDK |
| Date-range availability filtering | Core to any booking product. No one books blind | Low | Built (date conflict query exists in search) | Works but tied to text search; needs to survive map migration |
| Boat dimension matching | Slip must physically fit the vessel. Length/beam/draft filtering is safety-critical | Low | Partial — filters by boat length only, no beam/draft | Beam and draft columns exist on slips table. Should surface in filter UI |
| Slip detail page with specs + photos | Users won't book without knowing what they're getting | Low | Built — slip detail page with amenities, utility tags, pricing tiers | Photos rendering but placeholder shown when none uploaded |
| Price transparency before checkout | Subtotal, service fee, total — user sees full cost before entering card | Low | Partial — price shown per night, but EasyDock fee not yet surfaced | Checkout API receives `totalPrice` from client; fee not itemized |
| Online payment (card) | Non-negotiable for a booking product. Cash/check = not a product | Medium | Partial — Stripe Checkout session created but no Connect routing to marina | Current impl routes all money to platform account, not marina |
| Booking confirmation + status tracking | User needs proof of booking and knows what to expect next | Low | Built — /bookings/[id] detail page with status badge | Status visible but no email confirmation sent |
| Booking history | Users return to check past and upcoming bookings | Low | Built — /bookings page with full list | Works for boat owner role |
| Cancel booking | Users expect to be able to cancel | Low | Not built — no cancellation UI or policy handling | Status workflow allows `cancelled` state in DB; needs UI + refund logic |

### Marina Owner Side

| Feature | Why Expected | Complexity | Current State | Notes |
|---------|--------------|------------|---------------|-------|
| Marina listing CRUD | Owners must be able to list their property | Low | Built — /dashboard/marinas/new, /dashboard/marinas/[id] | Edit page exists at /dashboard/marinas/[id]/edit |
| Slip management (add/edit/delete) | Individual slips are the bookable units | Low | Built — slip modal in marina detail dashboard | Works |
| Photo upload for marina/slips | Listings without photos get skipped | Medium | Not built — photos[] array in schema but no upload UI or storage integration | Needs Supabase Storage bucket + signed upload URL flow |
| Booking inbox / approval workflow | Marina owner must see incoming requests and act | Medium | Not built as dedicated inbox — booking status in DB but no notification/management UI | Critical gap. Marina owner has no way to see or approve bookings |
| Stripe Connect onboarding | Marina owner must be connected to receive payouts | High | Not built — checkout API routes to platform account, no `stripe_account_id` in marina schema | Blocking for real money flow |
| Payout visibility | Owner needs to see what they earned and when | Medium | Not built | Follows from Stripe Connect Express dashboard |
| Occupancy calendar | Visual view of which slips are booked on which dates | Medium | Not built | Not blocking for MVP but expected within first month of use |
| Availability blocking (blackout dates) | Owner needs to mark slips unavailable without a booking | Medium | Not built — only binary `is_available` flag | Single boolean is too coarse; owners need date-range blocking |

### Platform / Shared

| Feature | Why Expected | Complexity | Current State | Notes |
|---------|--------------|------------|---------------|-------|
| Email confirmations | Both parties need paper trail for booking events | Low | Not built — no email sending anywhere in codebase | Supabase Edge Functions + Resend/SendGrid is standard approach |
| EasyDock service fee on booking | The business model | Low | Not built — checkout creates session for full `totalPrice` with no fee split | Fee must be implemented via Stripe Connect `application_fee_amount` |
| Auth (signup/login) | Access control for a two-sided marketplace | Low | Built — Supabase Auth with role-based routes | Working. Protected routes enforce role separation |

---

## Differentiators

Features that set EasyDock apart. Not universally expected, but meaningfully valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Stored vessel profile | Yacht owner saves specs once (length, beam, draft, type). Search pre-filters to compatible slips. Faster repeat bookings | Low | Schema: profiles table has no vessel fields. Separate `vessels` table or profile extension needed |
| Instant book vs. request-to-book toggle | Marinas with high confidence in data can enable instant confirmation, bypassing approval step. Increases conversion | Medium | Currently all bookings are pending-approval. Toggle at slip or marina level |
| Slip-level photo gallery | Separate photos per slip (not just per marina). Buyers see exactly what they're getting | Medium | Schema: slips table has no photos column (only marinas.photos). Additive schema change |
| Amenity search filters | Filter by fuel dock, pump-out, laundry, pool, restaurant, etc. | Low | Amenities array in schema, but not surfaced in search filter UI |
| Map cluster view with price pins | Airbnb-style price markers on map. Reveal density at zoom-out, detail at zoom-in | Medium | Requires map integration first. Differentiator over Dockwa's simpler map |
| Weekly/monthly pricing tiers | Marina owners set different rates for longer stays. Expected in Florida transient/liveaboard market | Low | Schema already supports price_per_week and price_per_month. Booking widget needs tiered calculation |
| Cancellation policy display | Clear terms before booking reduces chargebacks and disputes | Low | No cancellation policy field in schema. Simple text field or enum (flexible/moderate/strict) sufficient for MVP |

---

## Anti-Features

Features to explicitly NOT build in this phase.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Real-time chat between boat owner and marina | High complexity (WebSockets, message storage, notifications), not core to booking loop. Dockwa has this; EasyDock doesn't need it at launch | Special requests field in booking form + email to marina on booking creation |
| Guest checkout (no signup required) | Two-sided marketplace requires identity on both sides. Stripe Connect also requires named customer for disputes | Keep email/password auth. Keep signup friction low |
| Review/rating system | Requires volume of completed bookings to be meaningful. Empty review sections look worse than no reviews | Build after first 20-30 completed transactions |
| Recurring/subscription bookings | Monthly liveaboard contracts are a different legal/billing model. High complexity with Stripe subscriptions | Accept monthly price tier as a quote; handle one-time payments only |
| Multi-currency | South Florida only. USD only | Hard-code USD |
| Mobile native app | Web-first is sufficient for launch. App store review cycles delay iteration | Responsive web. PWA if needed |
| Waitlist / slip request when unavailable | Adds queue management complexity. No inventory pressure at launch (supply-constrained) | Show "not available" and allow new search |
| Dynamic/surge pricing | Pricing intelligence requires booking volume data. Not available at launch | Fixed rates set by marina owner |
| Admin CMS for featured marinas | Marketing complexity. Not needed at launch | Manual DB updates for any featured state |

---

## Feature Dependencies

The following dependency chain determines build order:

```
Stripe Connect onboarding (marina)
  → EasyDock fee via application_fee_amount
    → Payout visibility (Stripe Express dashboard link)

Map integration
  → Map cluster/price pins (differentiator)
  → Geocoded marina lat/lng (already in schema — needs data in seed)

Booking inbox (marina owner sees requests)
  → Approve/decline action
    → Email confirmation to boat owner on status change
      → Cancel booking with refund

Photo upload (Supabase Storage)
  → Marina photo gallery (exists, photos just need to be uploaded)
  → Slip-level photos (additive)

Stripe Connect onboarding
  → Booking inbox approve action (can't approve without payout route set)
```

---

## MVP Feature Prioritization

For the milestone targeting a working public launch with real money flowing:

**Must ship (blocking the transaction loop):**

1. Stripe Connect onboarding for marina owners — payments cannot route without it
2. EasyDock fee via `application_fee_amount` — the revenue model
3. Booking inbox for marina owners — approve/decline incoming requests
4. Email confirmations on booking events — both parties need notifications
5. Map-based slip discovery (replace text search) — users expect spatial search

**Ship alongside (launch quality):**

6. Photo upload (Supabase Storage) — listings without photos get skipped
7. Cancel booking with refund via Stripe — users will ask day one
8. Price transparency (fee itemization before checkout)

**Defer post-launch:**

- Occupancy calendar — useful but marina owners can survive with booking inbox initially
- Stored vessel profile — nice but form fill at booking time works
- Slip-level photos — marina-level photos are sufficient for launch
- Availability blocking (blackout dates) — `is_available` boolean covers launch
- Review/rating system — needs transaction volume first
- Payout history page — Stripe Express dashboard covers this initially

---

## Behavioral Notes for Each Active Feature

### Map-Based Search

Expected behavior based on Dockwa/Airbnb patterns (MEDIUM confidence):
- Map fills the viewport. Sidebar or bottom sheet shows slip cards
- Pins on map represent individual marinas (not individual slips)
- Clicking a pin highlights that marina's card in the sidebar
- Dragging the map re-queries slips in the visible bounding box
- Zoom out collapses nearby pins into clusters with count
- Price labels on pins is a differentiator (Airbnb does this; Dockwa does not)
- Filter bar floats above the map (dates, boat length, amenities)

### Stripe Connect Marketplace Payments

Expected behavior (HIGH confidence — well-documented Stripe pattern):
- Marina owner goes through Stripe Connect Express onboarding (Stripe-hosted flow)
- `stripe_account_id` stored on marina record
- At checkout: `application_fee_amount` set to EasyDock's percentage
- Remainder transferred to marina's connected account
- Webhook `checkout.session.completed` confirms payment → update booking status from `pending` to `approved` or `confirmed`
- Marina owner accesses payouts via Stripe Express dashboard link (no custom payout UI needed at launch)
- Refunds on cancel: `stripe.refunds.create({ payment_intent: ... })` — Stripe handles routing the refund back to cardholder and reversing the transfer

### Booking Management (Marina Owner Inbox)

Expected behavior:
- Marina owner sees list of incoming booking requests with vessel info, dates, slip name
- Can approve (moves to `confirmed`) or decline (moves to `declined`)
- Boat owner receives email on either outcome
- If booking payment already captured (post-Stripe webhook), approval is instant confirmation rather than initiating payment — the payment/approval sequence needs a design decision: capture on approval vs. capture on booking creation with hold

**Key design question:** Does payment capture happen at booking creation (before approval) or at approval? Dockwa captures at approval. Airbnb captures at booking. For marina context where operators want veto, consider authorize-on-book + capture-on-approve pattern using Stripe Payment Intents (not Checkout sessions). Current Stripe Checkout sessions do immediate capture — this is a meaningful arch decision.

### Occupancy Calendar

Expected behavior:
- Per-marina view, showing each slip as a row, dates as columns
- Booked dates shown as colored blocks with guest name/booking ID
- Clicking a block navigates to booking detail
- Blocked (unavailable) dates shown in grey
- Marina owner can click empty cell to block availability

Complexity driver: Rendering a calendar grid for arbitrary date ranges with many slips requires either a dedicated calendar library (react-big-calendar, FullCalendar) or custom grid. FullCalendar has a resource timeline view that maps directly to slip-per-row. Medium complexity.

### Marina Onboarding Flow

Expected behavior:
- Marina owner signs up → role = marina_owner
- Prompted immediately to add their first marina (city, address, description, amenities)
- Then add at least one slip (dimensions, price, utilities)
- Then connect Stripe account
- Listing goes live after Stripe Connect onboarded (or admin approval — depends on trust model)
- Photo upload is part of onboarding but can be deferred (show placeholder, prompt to add photos)

---

## Sources

- Training knowledge of Dockwa (dockwa.com) feature set — MEDIUM confidence
- Training knowledge of Snag-A-Slip feature set — MEDIUM confidence
- Stripe Connect Express documentation patterns — HIGH confidence (well-established)
- Airbnb marketplace UX patterns (map, price pins, booking flow) — HIGH confidence
- Existing EasyDock codebase analysis (schema, API routes, pages) — HIGH confidence
- No live web fetch was possible in this session; findings not verified against current competitor sites
