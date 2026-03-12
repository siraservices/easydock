---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: in-progress
stopped_at: Phase 5 context gathered
last_updated: "2026-03-12T04:32:38.657Z"
last_activity: 2026-03-11 — Plan 03-02 completed (bi-directional hover sync + mobile layout)
progress:
  total_phases: 5
  completed_phases: 4
  total_plans: 11
  completed_plans: 11
  percent: 82
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: in-progress
stopped_at: Completed 04-stripe-connect-payouts 04-00-PLAN.md
last_updated: "2026-03-11T21:51:38.120Z"
last_activity: 2026-03-11 — Plan 04-00 completed (Stripe Connect test scaffolding)
progress:
  [████████░░] 82%
  completed_phases: 3
  total_plans: 11
  completed_plans: 8
  percent: 73
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-09)

**Core value:** A yacht owner can find an available slip, book it, and pay — and a marina owner receives that booking and gets paid.
**Current focus:** Phase 4 — Stripe Connect

## Current Position

Phase: 3 of 5 (Map Search) — COMPLETE
Plan: 2 of 2 in current phase — COMPLETE
Status: In Progress (moving to Phase 4)
Last activity: 2026-03-11 — Plan 03-02 completed (bi-directional hover sync + mobile layout)

Progress: [████████░░] 88%

## Performance Metrics

**Velocity:**
- Total plans completed: 7
- Average duration: ~5 min
- Total execution time: ~35 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-booking-hardening | 2/2 | ~10 min | 5 min |
| 02-landing-page-and-marina-onboarding | 3/3 | ~15 min | 5 min |
| 03-map-search | 2/2 | ~10 min | 5 min |

**Recent Trend:**
- Last 5 plans: ~5 min each
- Trend: Consistent

*Updated after each plan completion*
| Phase 01-booking-hardening P02 | 5m | 2 tasks | 4 files |
| Phase 02-landing-page-and-marina-onboarding P02 | 5 min | 2 tasks | 7 files |
| Phase 02-landing-page-and-marina-onboarding P01 | 5m | 2 tasks | 7 files |
| Phase 02-landing-page-and-marina-onboarding P03 | 5m | 2 tasks | 4 files |
| Phase 03-map-search P01 | 5 min | 2 tasks | 6 files |
| Phase 03-map-search P02 | 20 min | 3 tasks | 3 files |
| Phase 04-stripe-connect-payouts P00 | 5min | 2 tasks | 5 files |
| Phase 04-stripe-connect-payouts P01 | 3min | 2 tasks | 7 files |
| Phase 04-stripe-connect-payouts P01 | 5m | 2 tasks | 8 files |
| Phase 04-stripe-connect-payouts P02 | 5m | 2 tasks | 3 files |
| Phase 04-stripe-connect-payouts P03 | 2min | 2 tasks | 5 files |
| Phase 04-stripe-connect-payouts P02 | 2min | 2 tasks | 3 files |
| Phase 04-stripe-connect-payouts P03 | 5min | 2 tasks | 5 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Phase 1 must precede all other work — price tampering, double-booking race condition, and webhook gaps exist in the current checkout. Adding Stripe Connect on top of these bugs creates compounded failures.
- [Roadmap]: Phase 2 (Landing + Marina Onboarding) and Phase 4 (Stripe Connect) both depend on marina records; Phase 2 comes first to satisfy Phase 3 geocoding prerequisite.
- [Roadmap]: Phase 3 (Map) and Phase 4 (Connect) are ordered 3 before 4 for user-facing testability during onboarding, not hard dependency.
- [Phase 01-booking-hardening]: Fee split: yacht owner pays 10% surcharge; marina absorbs 5% from payout; platform_fee_amount stored as 15% of base price for Phase 4 Stripe Connect transfers
- [Phase 01-booking-hardening]: Admin client used for RPC create_booking_atomic (SECURITY DEFINER); user client for slip lookup (respects RLS)
- [Phase 01-booking-hardening]: Same-day turnover allowed via strict < and > date operators in conflict check
- [Phase 01-booking-hardening]: Webhook returns 500 on DB failure to enable Stripe retry — not 200 which would silently drop the event
- [Phase 01-booking-hardening]: Auto-refund on payment capture + DB failure prevents customer being charged without a confirmed booking
- [Phase 02-landing-page-and-marina-onboarding]: PhotoDropZone uses pointer-events-none on children to prevent drag-leave flicker
- [Phase 02-landing-page-and-marina-onboarding]: Geocoding runs after marina save so record persists even if Mapbox fails
- [Phase 02-landing-page-and-marina-onboarding]: Mapbox v6 geometry.coordinates is [lng, lat] order, not [lat, lng]
- [Phase 02-landing-page-and-marina-onboarding]: marina_leads TypeScript type added manually to database.ts since table is new and not yet in Supabase — type provides compile-time safety
- [Phase 02-landing-page-and-marina-onboarding]: isDayBooked accepts YYYY-MM-DD strings (not Date objects) to eliminate UTC/local timezone ambiguity in calendar date comparison
- [Phase 02-landing-page-and-marina-onboarding]: Used native HTML <details open> collapsible for availability calendar section — no JS toggle state needed
- [Phase 03-map-search]: AnySupabaseClient any-type used in buildSlipQuery to avoid Supabase v2 generic arity mismatch
- [Phase 03-map-search]: MapView initializes visibleMarinaIds to all marinas on first render so list is not empty before first map move fires
- [Phase 03-map-search]: Search button triggers Supabase re-fetch; viewport pan/zoom updates visible list client-side without re-fetching
- [Phase 03-map-search]: hoverSource ref distinguishes map-initiated vs card-initiated hovers to prevent scroll-into-view from fighting user scroll
- [Phase 03-map-search]: Geolocation uses mapRef.current.flyTo after mount rather than updating initialViewState to avoid map re-initialization
- [Phase 03-map-search]: Mobile map overlay uses fixed inset-0 z-40 with Tailwind responsive classes — no JS media query needed for the base layout
- [Phase 04-stripe-connect-payouts]: Stub files use controllable mockState objects matching webhook-idempotency.test.ts pattern so Plan 01-03 executors can toggle mock behavior without restructuring
- [Phase 04-stripe-connect-payouts]: Store stripe_account_id in DB before generating account link (link is one-time-use; must persist even if user closes tab mid-flow)
- [Phase 04-stripe-connect-payouts]: Return route always retrieves from Stripe (never trusts DB status) for authoritative payouts_enabled/details_submitted
- [Phase 04-stripe-connect-payouts]: Refresh route uses NextResponse.redirect (not JSON) — Stripe calls refresh_url as a browser redirect target
- [Phase 04-stripe-connect-payouts]: stripe_account_id stored in DB before generating account link — link is one-time-use; must persist even if user closes tab mid-flow
- [Phase 04-stripe-connect-payouts]: Return route always calls stripe.accounts.retrieve() for authoritative status — never trusts cached DB values for payouts_enabled or details_submitted
- [Phase 04-stripe-connect-payouts]: adminClient used for marina Connect status check in checkout route — RLS may block stripe_account_id and payouts_enabled for user client
- [Phase 04-stripe-connect-payouts]: safeFee = min(applicationFeeCents, totalChargeCents - 1) prevents Stripe rejection when fee >= charge total
- [Phase 04-stripe-connect-payouts]: event.account used as connected account ID for account.updated webhook (falls back to account.id)
- [Phase 04-stripe-connect-payouts]: Webhook endpoint must be configured in Stripe Dashboard for 'Events on Connected accounts' to receive account.updated — dashboard config step, not code
- [Phase 04-stripe-connect-payouts]: adminClient used to query marina Connect status — RLS may block stripe_account_id/payouts_enabled for user client
- [Phase 04-stripe-connect-payouts]: safeFee = min(applicationFeeCents, totalChargeCents - 1) prevents application_fee_amount exceeding charge total
- [Phase 04-stripe-connect-payouts]: 422 used for unbookable-marina gate; booking widget detects it explicitly for clear user messaging
- [Phase 04-stripe-connect-payouts]: Login-link route guards on payouts_enabled=true — only fully connected accounts can access Express Dashboard
- [Phase 04-stripe-connect-payouts]: Webhook uses event.account (Connect-specific property) as connected account ID, falls back to account.id

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 4]: Verify `transfer_data` vs `on_behalf_of` distinction in current Stripe Connect docs before implementation — tax and compliance implications differ.
- [Phase 4]: Payment capture timing decision unresolved — instant capture at checkout vs manual capture at marina approval. Must decide before Phase 4 begins.
- [Phase 5]: Confirm `resend` package is still ^3.x and API surface unchanged before installation.

## Session Continuity

Last session: 2026-03-12T04:32:38.653Z
Stopped at: Phase 5 context gathered
Resume file: .planning/phases/05-booking-lifecycle-and-notifications/05-CONTEXT.md
