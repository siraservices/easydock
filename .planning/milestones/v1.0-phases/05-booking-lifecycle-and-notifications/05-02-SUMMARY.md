---
phase: 05-booking-lifecycle-and-notifications
plan: 02
subsystem: payments
tags: [stripe, cancel, refund, react, api, next.js]

# Dependency graph
requires:
  - phase: 05-01
    provides: booking detail page with status banner (page.tsx), approve/deny API routes
  - phase: 04-stripe-connect-payouts
    provides: Stripe Connect destination charges with application_fee_amount and transfer_data

provides:
  - POST /api/bookings/[id]/cancel route with full Stripe refund reversal
  - Cancel button + confirmation dialog on booking detail page (/bookings/[id])
  - Unit tests for all cancel route behaviors (9 tests)

affects:
  - 05-03 (notifications will reference cancel events)
  - any future refund/dispute handling

# Tech tracking
tech-stack:
  added: []
  patterns:
    - DB-first update pattern before Stripe API call (prevents partial state on network failure)
    - Optimistic lock via .eq('status', booking.status) in update query (prevents race conditions)
    - YYYY-MM-DD string comparison for check-in date guard (avoids UTC midnight edge cases)
    - Modal confirmation dialog with inline error display using useState

key-files:
  created:
    - src/app/api/bookings/[id]/cancel/route.ts
    - src/__tests__/booking-cancel.test.ts
  modified:
    - src/app/bookings/[id]/page.tsx

key-decisions:
  - "adminClient used for cancel route — boat owners have no UPDATE RLS policy on bookings"
  - "DB update first, Stripe refund second — if Stripe fails, booking is already cancelled (can retry refund manually vs booking that appears active but was never refunded)"
  - "Optimistic lock: .eq('status', booking.status) prevents two concurrent cancel requests from both succeeding"
  - "YYYY-MM-DD string comparison for check-in date matches same pattern used in isDayBooked (avoids UTC/local timezone ambiguity)"
  - "stripe_payment_intent_id cast to string inside hasPaymentIntent guard — TypeScript narrowing doesn't fully eliminate null in Supabase row types"

patterns-established:
  - "Cancel guard order: auth -> fetch -> authz -> check-in date -> already-cancelled -> DB update -> Stripe"
  - "Stripe mock uses vi.fn().mockImplementation(function(this) {...}) with function keyword for correct constructor behavior"

requirements-completed: [BOOK-03]

# Metrics
duration: 4min
completed: 2026-03-12
---

# Phase 05 Plan 02: Booking Cancellation Summary

**Cancel booking API with Stripe reverse_transfer + refund_application_fee, and cancel button with confirmation dialog on the booking detail page**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-12T15:12:35Z
- **Completed:** 2026-03-12T15:16:30Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- POST /api/bookings/[id]/cancel route: authenticates user, verifies ownership (boat owner or marina owner), rejects post-check-in cancellations (422), prevents double-cancel (409 with optimistic lock), updates DB first, then issues full Stripe refund with reverse_transfer=true and refund_application_fee=true
- 9 unit tests covering all behaviors including Stripe mock with correct constructor pattern
- Cancel button on booking detail page: red outline style, only shown for pending/approved/confirmed bookings before check-in
- Confirmation dialog shows refund amount, provides "Keep Booking" and "Cancel Booking" actions, disables during in-flight request, shows inline error on failure

## Task Commits

1. **Task 1: Cancel API route with Stripe refund and tests** - `6d9a9a5` (feat + test - TDD)
2. **Task 2: Cancel button and confirmation dialog on booking detail page** - `b8260e1` (feat)

## Files Created/Modified

- `src/app/api/bookings/[id]/cancel/route.ts` - POST route: auth, ownership check, date guard, DB update, Stripe refund
- `src/__tests__/booking-cancel.test.ts` - 9 unit tests covering all cancel route behaviors
- `src/app/bookings/[id]/page.tsx` - Cancel button (conditional), confirmation dialog modal, cancel handler

## Decisions Made

- adminClient used for cancel route — boat owners have no UPDATE RLS on bookings, and marina owner check requires fetching marina data that may be RLS-restricted
- DB-first update pattern: booking set to 'cancelled' before Stripe refund call. If Stripe fails after DB update, the booking correctly shows cancelled and the refund can be retried manually — safer than leaving a booking "active" with a potential double-refund risk
- Optimistic lock: `.eq('status', booking.status)` in the update prevents race condition where two simultaneous cancel requests both succeed
- YYYY-MM-DD string comparison for check-in date guard: `booking.check_in <= today` matches the existing pattern in isDayBooked and avoids UTC midnight edge cases

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript error: stripe_payment_intent_id null type**
- **Found during:** Task 2 (build verification)
- **Issue:** TypeScript error: `Type 'string | null' is not assignable to type 'string | undefined'` for `payment_intent` param in `stripe.refunds.create()`
- **Fix:** Added `as string` cast inside the `hasPaymentIntent` guard where the value is guaranteed non-null
- **Files modified:** `src/app/api/bookings/[id]/cancel/route.ts`
- **Verification:** Build passed after fix, tests still passing
- **Committed in:** b8260e1 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed Stripe vi.mock constructor pattern**
- **Found during:** Task 1 (TDD GREEN phase)
- **Issue:** `vi.fn().mockImplementation(() => ({...}))` with arrow function fails as Stripe constructor — vitest requires `function` keyword for constructor mocks
- **Fix:** Changed to `vi.fn().mockImplementation(function(this: unknown) { return {...}; })`
- **Files modified:** `src/__tests__/booking-cancel.test.ts`
- **Verification:** 3 failing tests now pass, all 9 pass
- **Committed in:** 6d9a9a5 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - bugs)
**Impact on plan:** Both auto-fixes were compile/test correctness issues, no scope creep.

## Issues Encountered

None beyond the two auto-fixed issues above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Cancel flow fully functional end-to-end
- Plan 05-03 (notifications) can reference cancellation status changes
- Stripe refund behavior (reverse_transfer + refund_application_fee) established as the correct pattern for destination charges

## Self-Check: PASSED

- FOUND: src/app/api/bookings/[id]/cancel/route.ts
- FOUND: src/__tests__/booking-cancel.test.ts
- FOUND: .planning/phases/05-booking-lifecycle-and-notifications/05-02-SUMMARY.md
- FOUND: commit 6d9a9a5 (Task 1)
- FOUND: commit b8260e1 (Task 2)

---
*Phase: 05-booking-lifecycle-and-notifications*
*Completed: 2026-03-12*
