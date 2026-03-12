---
phase: 01-booking-hardening
plan: "02"
subsystem: payments/webhooks
tags: [stripe, webhooks, idempotency, testing, vitest]
dependency_graph:
  requires: [01-01]
  provides: [idempotent-webhook-handler, test-infrastructure]
  affects: [bookings, stripe_processed_events]
tech_stack:
  added: [vitest@4]
  patterns: [idempotency-check, auto-refund-on-failure, error-aware-http-responses, tdd]
key_files:
  created:
    - vitest.config.ts
    - src/__tests__/checkout-pricing.test.ts
    - src/__tests__/webhook-idempotency.test.ts
  modified:
    - src/app/api/webhooks/stripe/route.ts
decisions:
  - "Webhook returns 500 (not 200) on DB write failure to enable Stripe retry with exponential backoff"
  - "Auto-refund attempted via stripe.refunds.create() when DB write fails after payment capture"
  - "stripe_processed_events insert happens only after confirmed DB write success to prevent event loss on retry"
  - "Vitest module-level mocks with controllable mockState object used for webhook test isolation"
metrics:
  duration: "~5 minutes"
  completed: "2026-03-10"
  tasks_completed: 2
  files_modified: 4
---

# Phase 1 Plan 02: Idempotent Webhook Handler and Test Infrastructure Summary

**One-liner:** Idempotent Stripe webhook handler with auto-refund on DB failure, plus Vitest test infrastructure covering pricing math and all webhook behaviors.

## What Was Built

### Task 1: Vitest installation and test scaffolds

Installed `vitest@4` and created three test artifacts:

- `vitest.config.ts` — node environment, `@` path alias pointing to `./src`
- `src/__tests__/checkout-pricing.test.ts` — 7 unit tests for `calculateNights` and server-side fee math (green from start)
- `src/__tests__/webhook-idempotency.test.ts` — 5 unit tests for webhook signature validation, idempotency, success path, DB failure + auto-refund, and session expiry (red until Task 2)

Also discovered pre-existing test file at `src/app/api/checkout/__tests__/checkout-pricing.test.ts` (6 more tests covering HARD-01 truths) from a prior session. All 3 test files run together: 19 tests total.

### Task 2: Webhook handler rewrite

Rewrote `src/app/api/webhooks/stripe/route.ts` with four core behaviors:

1. **Signature validation** — returns 400 on missing or invalid `stripe-signature`
2. **Idempotency check** — queries `stripe_processed_events` by event ID before any DB write; returns 200 immediately if already processed
3. **Error-aware HTTP responses** — returns 500 (not 200) when DB write fails, enabling Stripe to retry
4. **Auto-refund on catastrophic failure** — when `checkout.session.completed` DB write fails, calls `stripe.refunds.create({ payment_intent })` wrapped in try/catch so refund errors are logged but don't prevent the 500 return
5. **Event recording only on success** — inserts into `stripe_processed_events` after confirmed DB write; never records on failure

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Plan 01-01 artifacts were not executed**

- **Found during:** Task 1 setup (checking prerequisites)
- **Issue:** Plan 01-02 depends on checkout route rewrite and TypeScript types from Plan 01-01. The prior session had committed the DB migration and TypeScript types but not the checkout route rewrite.
- **Fix:** Rewrote `src/app/api/checkout/route.ts` with server-side pricing, atomic RPC booking, and Airbnb-style Stripe fee breakdown before executing Plan 01-02 tasks.
- **Files modified:** `src/app/api/checkout/route.ts`
- **Commit:** b7febb1

**2. [Rule 2 - Mock pattern] Stripe constructor mock required function-constructor pattern**

- **Found during:** First test run of webhook tests
- **Issue:** `vi.mock('stripe', () => ({ default: vi.fn() }))` with `.mockImplementation(() => instance)` fails when `new Stripe()` is called because the implementation is an arrow function, not a constructor.
- **Fix:** Changed mock to use `function MockStripe(this: unknown) { return instance; }` pattern which works correctly as a constructor target.
- **Files modified:** `src/__tests__/webhook-idempotency.test.ts`
- **Commit:** bb2a9cc (updated in same task commit)

## Verification Results

- `npx vitest run` — 19/19 tests pass across 3 test files
- `npx tsc --noEmit` — zero TypeScript errors
- Webhook route queries `stripe_processed_events` before processing (line 35)
- Webhook route returns 500 on DB failure (lines 84, 123)
- Webhook route calls `stripe.refunds.create()` on payment capture + DB failure (line 75)
- Webhook route inserts into `stripe_processed_events` only after successful DB write (lines 89, 104)
- Booking only reaches `confirmed` status after successful DB write in webhook (enforced by 500 + Stripe retry pattern)

## Self-Check: PASSED

- `src/app/api/webhooks/stripe/route.ts` — confirmed exists and was modified
- `vitest.config.ts` — confirmed exists
- `src/__tests__/checkout-pricing.test.ts` — confirmed exists
- `src/__tests__/webhook-idempotency.test.ts` — confirmed exists
- Commits `bb2a9cc` and `6341cfe` confirmed in git log
