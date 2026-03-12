---
phase: 04-stripe-connect-payouts
plan: "02"
subsystem: payments
tags: [stripe-connect, checkout, destination-charge, booking-widget]
dependency_graph:
  requires: [04-00, 04-01]
  provides: [connect-destination-charge, marina-payment-guard]
  affects: [src/app/api/checkout/route.ts, src/components/booking-widget.tsx]
tech_stack:
  added: []
  patterns: [stripe-connect-destination-charge, application-fee-amount, 422-error-guard]
key_files:
  created: []
  modified:
    - src/app/api/checkout/route.ts
    - src/components/booking-widget.tsx
    - src/__tests__/checkout-connect.test.ts
decisions:
  - "adminClient used for marina Connect status check — RLS may block stripe_account_id and payouts_enabled for user client"
  - "safeFee = min(applicationFeeCents, totalChargeCents - 1) prevents application_fee_amount exceeding charge total"
  - "422 status detected explicitly in booking widget for clear user messaging vs generic error fallback"
metrics:
  duration: 5min
  completed_date: "2026-03-11"
  tasks_completed: 2
  files_modified: 3
---

# Phase 4 Plan 02: Connect Destination Charge Summary

Stripe Connect destination charge with platform fee split and marina payment guard.

## What Was Built

- Modified checkout route to query marina `stripe_account_id` and `payouts_enabled` before creating a Stripe session, returning 422 if the marina is not ready
- Added `payment_intent_data` to every successful Stripe session with `application_fee_amount` (15% of base price in cents) and `transfer_data.destination` pointing to the marina's connected Stripe account
- Safety cap prevents `application_fee_amount` from equaling or exceeding the total charge amount
- Booking widget detects 422 status explicitly and shows "not currently accepting online payments" in the existing error area
- Replaced 5 `it.todo` stubs in `checkout-connect.test.ts` with real assertions covering all 5 scenarios

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add Connect destination charge to checkout route | 30c74a0 | src/app/api/checkout/route.ts, src/__tests__/checkout-connect.test.ts |
| 2 | Handle unbookable-marina error in booking widget | 0f4fb3d | src/components/booking-widget.tsx |

## Key Implementation Details

The checkout route now performs a 3-step sequence before the RPC call:
1. Fetch slip via user client (RLS-respecting)
2. Fetch marina Connect status via `adminClient` (bypasses RLS for payment fields)
3. Guard: if no `stripe_account_id` or `payouts_enabled` is false → 422

Fee math:
- `platformFeeAmount` = 15% of base price (dollars)
- `applicationFeeCents` = `Math.round(platformFeeAmount * 100)`
- `safeFee` = `Math.min(applicationFeeCents, totalChargeCents - 1)`

The `adminClient` reference is created once before the Connect check and reused for the RPC call — no duplicate instantiation.

## Decisions Made

- adminClient used for marina Connect status check — user client respects RLS which may not expose `stripe_account_id` or `payouts_enabled` to boat owners
- Safety cap formula `min(fee, total - 1)` ensures Stripe never rejects a session for fee >= charge
- Explicit 422 detection in widget provides clear fallback message even if API error field is empty

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `npx tsc --noEmit`: PASS
- `npx vitest run src/__tests__/checkout-pricing.test.ts src/__tests__/checkout-connect.test.ts`: 12/12 PASS
- Checkout route has `payment_intent_data.application_fee_amount` and `payment_intent_data.transfer_data.destination`: confirmed
- Checkout returns 422 when marina lacks `payouts_enabled` or `stripe_account_id`: confirmed
- BookingWidget displays specific error for 422: confirmed

## Self-Check: PASSED

Files confirmed present:
- src/app/api/checkout/route.ts — FOUND
- src/components/booking-widget.tsx — FOUND
- src/__tests__/checkout-connect.test.ts — FOUND

Commits confirmed:
- 30c74a0 — FOUND
- 0f4fb3d — FOUND
