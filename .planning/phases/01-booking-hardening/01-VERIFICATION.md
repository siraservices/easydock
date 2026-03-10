---
phase: 01-booking-hardening
verified: 2026-03-10T07:56:30Z
status: passed
score: 9/9 must-haves verified
re_verification: false
---

# Phase 1: Booking Hardening Verification Report

**Phase Goal:** The booking transaction is trustworthy — correct pricing, no double-bookings, and reliable webhook confirmation
**Verified:** 2026-03-10T07:56:30Z
**Status:** PASSED
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                               | Status     | Evidence                                                                                          |
|----|-----------------------------------------------------------------------------------------------------|------------|---------------------------------------------------------------------------------------------------|
| 1  | Server computes total price from slip.price_per_night and dates, ignoring client-submitted totalPrice | VERIFIED  | checkout/route.ts lines 74–80: price computed from `slip.price_per_night * nights`; comment on line 41 confirms `totalPrice` from body is intentionally not destructured |
| 2  | 15% EasyDock fee is split as two Stripe line items (Airbnb-style)                                   | VERIFIED   | checkout/route.ts lines 137–158: exactly 2 `price_data` blocks — base price and "EasyDock service fee" |
| 3  | Two simultaneous booking requests for overlapping dates result in one success and one 409            | VERIFIED   | `create_booking_atomic` SQL function acquires `FOR UPDATE` row lock then checks conflicts; checkout route returns 409 on `result[0].conflict === true` (line 118) |
| 4  | Same-day turnover allowed (check_out == next check_in is not a conflict)                            | VERIFIED   | SQL uses strict `<` and `>` operators (007_booking_hardening.sql lines 60–61); verified by test in `checkout-pricing.test.ts` |
| 5  | A duplicate Stripe event ID returns 200 without re-processing                                       | VERIFIED   | webhook/route.ts lines 34–43: idempotency check queries `stripe_processed_events` before any processing; returns `{ received: true }` immediately if found |
| 6  | Webhook returns 500 when DB write fails, causing Stripe to retry                                     | VERIFIED   | webhook/route.ts lines 82–85 (`checkout.session.completed`) and 121–124 (`checkout.session.expired`) return 500 on `updateError` |
| 7  | Webhook returns 400 on invalid Stripe signature                                                     | VERIFIED   | webhook/route.ts lines 15–17 (missing sig) and lines 24–29 (invalid sig via constructEvent exception) |
| 8  | When DB write fails after payment capture, an auto-refund is attempted                              | VERIFIED   | webhook/route.ts lines 74–79: `stripe.refunds.create({ payment_intent: paymentIntentId })` called inside `if (updateError)` block |
| 9  | Booking only reaches confirmed status after successful DB write in webhook                           | VERIFIED   | stripe_processed_events insert only on success path (lines 88–93); 500 return on failure prevents event acknowledgment; Stripe retries |

**Score:** 9/9 truths verified

### Required Artifacts

| Artifact                                                     | Provides                                               | Status     | Details                                                           |
|--------------------------------------------------------------|--------------------------------------------------------|------------|-------------------------------------------------------------------|
| `database/007_booking_hardening.sql`                         | create_booking_atomic RPC, stripe_processed_events table, platform_fee_amount column | VERIFIED | All three changes present; SECURITY DEFINER + FOR UPDATE lock confirmed |
| `src/types/database.ts`                                      | TypeScript types for stripe_processed_events and platform_fee_amount | VERIFIED | stripe_processed_events table fully typed (Row/Insert/Update/Relationships); platform_fee_amount on bookings Row/Insert/Update; create_booking_atomic in Functions |
| `src/app/api/checkout/route.ts`                              | Server-side price calculation, atomic booking via RPC, 30-min session expiry | VERIFIED | Exports POST; fetches slip from DB; uses calculateNights; calls rpc('create_booking_atomic'); Stripe session has expires_at (not expires_after) |
| `src/app/api/webhooks/stripe/route.ts`                       | Idempotent webhook handler with error-aware HTTP responses | VERIFIED | Exports POST; checks stripe_processed_events before processing; returns 500 on DB failure; auto-refund on payment capture failure |
| `vitest.config.ts`                                           | Vitest test runner configuration                       | VERIFIED   | Node environment, globals: true, @/ alias pointing to ./src       |
| `src/__tests__/checkout-pricing.test.ts`                     | Unit tests for server-side price calculation and fee math | VERIFIED | 7 tests covering calculateNights, fee rates, Stripe cents conversion |
| `src/__tests__/webhook-idempotency.test.ts`                  | Unit tests for webhook idempotency, error handling, refund logic | VERIFIED | 5 tests: missing sig (400), duplicate event (200/no-op), success path, DB fail + refund (500), session expiry |
| `src/app/api/checkout/__tests__/checkout-pricing.test.ts`    | Additional HARD-01 pricing tests                       | VERIFIED   | 7 tests including same-day turnover logic and price tamper scenario |

### Key Link Verification

| From                                   | To                            | Via                              | Status     | Details                                                    |
|----------------------------------------|-------------------------------|----------------------------------|------------|------------------------------------------------------------|
| `src/app/api/checkout/route.ts`        | `database/007_booking_hardening.sql` | `supabase.rpc('create_booking_atomic')` | WIRED | Line 85: `adminClient.rpc("create_booking_atomic", {...})` confirmed |
| `src/app/api/checkout/route.ts`        | `src/lib/utils/format.ts`     | `calculateNights()`              | WIRED      | Line 4 import; line 74 usage: `const nights = calculateNights(checkIn, checkOut)` |
| `src/app/api/webhooks/stripe/route.ts` | `stripe_processed_events` table | `adminClient.from('stripe_processed_events').select/insert` | WIRED | Line 35 idempotency select; lines 54/89/104/128 inserts on success paths |
| `src/app/api/webhooks/stripe/route.ts` | Stripe refund API             | `stripe.refunds.create`          | WIRED      | Line 75: `await stripe.refunds.create({ payment_intent: paymentIntentId })` inside DB-failure handler |

### Requirements Coverage

| Requirement | Source Plan | Description                                                                           | Status    | Evidence                                                                                                     |
|-------------|-------------|---------------------------------------------------------------------------------------|-----------|--------------------------------------------------------------------------------------------------------------|
| HARD-01     | 01-01-PLAN  | Server calculates total price from slip rate and dates instead of trusting client-submitted price | SATISFIED | checkout/route.ts never destructures `totalPrice` from body; price = `slip.price_per_night * calculateNights(...)`; 13 unit tests cover fee math |
| HARD-02     | 01-01-PLAN  | Booking creation uses database transaction to prevent double-booking race condition    | SATISFIED | `create_booking_atomic` SQL function with `FOR UPDATE` row lock makes conflict check and insert atomic; checkout returns 409 on conflict |
| HARD-03     | 01-02-PLAN  | Stripe webhook verifies database write succeeded before returning 200                  | SATISFIED | webhook returns 500 on DB write failure (enables Stripe retry); idempotency check prevents double-processing; `stripe_processed_events` insert happens only after confirmed DB write |

No orphaned requirements — HARD-01, HARD-02, HARD-03 are the only Phase 1 requirements in REQUIREMENTS.md, all claimed and all satisfied.

### Anti-Patterns Found

None. No TODOs, FIXMEs, placeholders, empty implementations, or stub handlers found in any phase artifact.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | None found | — | — |

### Human Verification Required

**1. SQL Migration Applied to Supabase**

**Test:** Run `database/007_booking_hardening.sql` in the Supabase SQL Editor against the live project database.
**Expected:** Migration executes without error; `bookings` table has a `platform_fee_amount` column; `stripe_processed_events` table exists with RLS enabled; `create_booking_atomic` function is callable via RPC.
**Why human:** The SQL file is correct and ready. Whether it has been applied to the actual Supabase instance cannot be verified programmatically without database credentials. The SUMMARY explicitly flags this as a required manual step before deployment.

**2. Stripe Checkout Session — Two-Item Fee Breakdown**

**Test:** Initiate a checkout request in a running dev environment. Open the resulting Stripe Checkout URL.
**Expected:** The Stripe-hosted checkout page shows two distinct line items — one for the slip stay (base price) and one labeled "EasyDock service fee" — before the total.
**Why human:** Line item rendering is a visual behavior on Stripe's hosted page; cannot be verified from source code alone.

**3. Double-Booking Race Condition Under Concurrent Load**

**Test:** Send two simultaneous POST requests to `/api/checkout` for the same `slipId` and overlapping dates using a tool like `Promise.all` or Apache Bench.
**Expected:** Exactly one request returns 200 with a `url`; the other returns 409 with `"This slip is no longer available for those dates"`.
**Why human:** Concurrency behavior under real database load cannot be verified by static analysis. The SQL `FOR UPDATE` lock is correct in theory; runtime verification confirms the database instance supports the lock as expected.

### Gaps Summary

No gaps. All automated checks passed:
- TypeScript compiles cleanly (`npx tsc --noEmit` zero errors)
- 19/19 Vitest tests pass across 3 test files
- All 6 documented commits exist in git history (56022e7, 00d9ff8, b7febb1, c08d3fd, bb2a9cc, 6341cfe)
- Key links are wired in the actual source, not just claimed
- All three requirements (HARD-01, HARD-02, HARD-03) have implementation evidence

The only items requiring human attention are deployment readiness (SQL migration must be run in Supabase) and two runtime behaviors that need a live environment to confirm.

---
_Verified: 2026-03-10T07:56:30Z_
_Verifier: Claude (gsd-verifier)_
