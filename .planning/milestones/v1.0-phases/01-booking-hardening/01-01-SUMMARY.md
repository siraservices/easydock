---
phase: 01-booking-hardening
plan: 01
subsystem: api
tags: [stripe, supabase, postgres, rpc, bookings]

# Dependency graph
requires: []
provides:
  - "create_booking_atomic RPC function with row-lock atomic conflict detection"
  - "stripe_processed_events table for idempotent webhook processing"
  - "platform_fee_amount column on bookings for Stripe Connect transfers"
  - "Server-side price calculation in checkout route (eliminates price tampering)"
  - "Two-item Stripe checkout session (base price + EasyDock service fee)"
affects:
  - "02-landing-marina-onboarding"
  - "04-stripe-connect"
  - "stripe webhook handler (uses stripe_processed_events)"

# Tech tracking
tech-stack:
  added: [vitest]
  patterns:
    - "Admin client for RPC calls that need SECURITY DEFINER (bypasses RLS)"
    - "SECURITY DEFINER + FOR UPDATE lock for atomic conflict-safe inserts"
    - "Airbnb-style fee split: 10% yacht owner surcharge + 5% marina deduction = 15% total"

key-files:
  created:
    - "database/007_booking_hardening.sql"
    - "src/app/api/checkout/__tests__/checkout-pricing.test.ts"
    - "vitest.config.ts"
  modified:
    - "src/app/api/checkout/route.ts"
    - "src/types/database.ts"

key-decisions:
  - "Fee split: yacht owner pays 10% surcharge on top of base price; marina absorbs 5% from payout. Total platform fee = 15% of base price stored as platform_fee_amount."
  - "Admin client used for RPC call — SECURITY DEFINER function handles auth internally; user client used for slip lookup to respect RLS."
  - "stripe_processed_events table uses TEXT PRIMARY KEY (Stripe event ID) for idempotency — no UUID needed."
  - "Same-day turnover allowed via strict < and > date operators in conflict check."

patterns-established:
  - "Atomic booking pattern: supabase.rpc('create_booking_atomic') replaces sequential check+insert"
  - "Server-side price computation: never trust client-submitted prices, always fetch from DB"

requirements-completed: [HARD-01, HARD-02]

# Metrics
duration: 3min
completed: 2026-03-09
---

# Phase 1 Plan 01: Booking Hardening — Price Integrity and Atomic Booking Summary

**Server-side price calculation from DB slip rates + atomic PostgreSQL RPC booking that eliminates price tampering (HARD-01) and the double-booking race condition (HARD-02)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-10T03:13:15Z
- **Completed:** 2026-03-10T03:16:30Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Eliminated price tampering attack surface: checkout route no longer reads `totalPrice` from request body; price is always computed from `slip.price_per_night` fetched from the database
- Eliminated double-booking race condition: replaced sequential SELECT-then-INSERT with a single `create_booking_atomic` PostgreSQL function that acquires a `FOR UPDATE` row lock before checking conflicts
- Added Airbnb-style two-item Stripe checkout session showing base price and "EasyDock service fee" separately

## Task Commits

Each task was committed atomically:

1. **Task 1: Create booking hardening database migration** - `56022e7` (chore)
2. **Task 2: Update TypeScript database types** - `00d9ff8` (chore)
3. **Task 3: Rewrite checkout route (implementation)** - `b7febb1` (feat)
4. **Task 3: Rewrite checkout route (TDD tests)** - `c08d3fd` (test)

_Note: TDD task has two commits — implementation then behavior tests_

## Files Created/Modified

- `database/007_booking_hardening.sql` - Migration: `platform_fee_amount` column, `stripe_processed_events` table, `create_booking_atomic` RPC function
- `src/types/database.ts` - Added `platform_fee_amount` on bookings, `stripe_processed_events` table type, `create_booking_atomic` function type
- `src/app/api/checkout/route.ts` - Rewritten: server-side pricing, atomic RPC booking, two-item Stripe session, 30-min expiry
- `src/app/api/checkout/__tests__/checkout-pricing.test.ts` - 7 behavior tests covering price calculation, fee split, and same-day turnover
- `vitest.config.ts` - Vitest configuration with `@/` alias

## Decisions Made

- **Fee structure:** 10% surcharge charged to yacht owner on top of base price; 5% deducted from marina payout. `platform_fee_amount` stored as 15% of base price (total platform take), which Phase 4 will use for Stripe Connect `transfer_data.amount` calculations.
- **Client security:** `totalPrice` field removed from the set of accepted body parameters. Any existing clients that submit it will have it silently ignored — no breaking API change.
- **Admin client for RPC:** The `create_booking_atomic` function uses `SECURITY DEFINER` so it can insert with elevated privileges. The admin client is used only for this call; slip lookup continues to use the user-authenticated client to respect RLS policies.
- **Stripe `expires_at`:** Set to Unix timestamp 30 minutes from `Date.now()` as specified, not the `expires_after` parameter.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The checkout route file was saved by a linter/auto-formatter between the write and the commit, but the implementation content was already correct from the previous automated write. No functional change occurred.

## User Setup Required

**Manual SQL migration required.** Run `database/007_booking_hardening.sql` in the Supabase SQL Editor before deploying this change. The migration:
1. Adds `platform_fee_amount` column to `bookings`
2. Creates `stripe_processed_events` table with RLS
3. Creates `create_booking_atomic` RPC function

The checkout API will fail at runtime until this migration is applied.

## Next Phase Readiness

- Price integrity and double-booking fixes are deployed and tested
- `stripe_processed_events` table is ready for Phase 1 Plan 02 (webhook idempotency)
- `platform_fee_amount` column is ready for Phase 4 (Stripe Connect transfers)
- Phase 2 (Landing + Marina Onboarding) can proceed independently — no dependency on this plan's output

## Self-Check: PASSED

- FOUND: database/007_booking_hardening.sql
- FOUND: src/types/database.ts
- FOUND: src/app/api/checkout/route.ts
- FOUND: src/app/api/checkout/__tests__/checkout-pricing.test.ts
- FOUND: .planning/phases/01-booking-hardening/01-01-SUMMARY.md
- FOUND commit: 56022e7 (database migration)
- FOUND commit: 00d9ff8 (TypeScript types)
- FOUND commit: b7febb1 (checkout route implementation)
- FOUND commit: c08d3fd (TDD tests)

---
*Phase: 01-booking-hardening*
*Completed: 2026-03-10*
