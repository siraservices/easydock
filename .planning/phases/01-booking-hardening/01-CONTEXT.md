# Phase 1: Booking Hardening - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix three security/reliability bugs in the existing checkout and webhook flow: server-side price calculation (HARD-01), database-level double-booking prevention (HARD-02), and webhook reliability with idempotency (HARD-03). No new features — only hardening what exists.

</domain>

<decisions>
## Implementation Decisions

### Price calculation
- Server computes price as `price_per_night × number of nights` — ignores any client-submitted totalPrice
- Flat nightly rate for now (no seasonal rates)
- EasyDock takes 15% fee, split between both sides (yacht owner pays a portion on top, marina absorbs a portion from payout)
- Checkout UI shows fee as a separate line item (Airbnb-style: subtotal + EasyDock service fee + total)

### Conflict handling
- Database transaction with row-level locking to prevent double-booking race condition
- Same-day turnover is OK (check-out day can equal next guest's check-in day — like hotels)
- On conflict: instant error "This slip is no longer available for those dates" — user returns to search
- No waitlist or alternative suggestions in this phase

### Webhook reliability
- Webhook must be idempotent — track processed Stripe event IDs to prevent duplicate booking updates
- If DB write fails after Stripe charges customer: auto-refund the charge immediately
- Return appropriate HTTP status to Stripe (not always 200) so Stripe retries on real failures

### Stale booking cleanup
- Stripe Checkout session expires after 30 minutes (configure `expires_after`)
- Rely on `checkout.session.expired` webhook to cancel stale pending bookings (existing handler already does this)
- No additional cron job needed

### Claude's Discretion
- Exact transaction/locking mechanism (advisory lock, SELECT FOR UPDATE, or unique constraint)
- How to store processed Stripe event IDs (new table vs column)
- Refund error handling approach
- Whether to add a `platform_fee_amount` column to bookings now (for Phase 4 readiness)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — standard patterns for payment security and booking integrity.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/api/checkout/route.ts`: Current checkout route — needs rewrite for server-side pricing and transactional booking
- `src/app/api/webhooks/stripe/route.ts`: Current webhook handler — needs idempotency and error-aware responses
- `src/lib/supabase/admin.ts`: Admin client (bypasses RLS) — used in webhook handler
- `src/lib/utils/format.ts`: Has `calculateNights()` utility already available

### Established Patterns
- API routes use `NextResponse.json()` with appropriate status codes
- Error handling: try-catch with `console.error()` and typed error responses
- Supabase queries use `.select()` with type casting via `as unknown as`
- Stripe SDK instantiated via `getStripe()` factory function

### Integration Points
- Checkout route is called from slip detail page booking widget
- Webhook route receives events at `/api/webhooks/stripe`
- Booking status drives the booking detail page UI (pending → confirmed)
- `bookings` table: status, total_price, stripe_payment_intent_id columns exist

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-booking-hardening*
*Context gathered: 2026-03-09*
