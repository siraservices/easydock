# Phase 4: Stripe Connect Payouts - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Marina owners can link their Stripe account via Express onboarding, and the checkout routes the correct split — EasyDock platform fee plus transfer to the marina — for every completed booking. No booking management, no cancellation/refund flow, no email notifications.

</domain>

<decisions>
## Implementation Decisions

### Connect onboarding flow
- Stripe Connect Express accounts (hosted onboarding — Stripe handles KYC/compliance)
- "Connect Stripe" button lives on the marina dashboard home (/dashboard) as a prominent banner/card when not yet connected
- Stripe account linked per marina (stripe_account_id on marinas table), not per user profile — supports one owner with multiple marinas using different bank accounts
- After successful onboarding: green checkmark status badge next to marina name on dashboard, brief success toast
- Banner disappears once Stripe is connected and payouts are enabled

### Payment splitting
- Use `transfer_data` with `destination` = marina's connected Stripe account on the Checkout Session
- `application_fee_amount` = `platform_fee_amount` (already stored as 15% of base price on every booking from Phase 1)
- Immediate capture at checkout — no authorization holds. If marina declines later (Phase 5), a refund is issued
- No changes to yacht owner fee display — booking widget already shows base price + EasyDock service fee = total

### Onboarding-incomplete blocking
- Server-side block: checkout API checks marina's stripe_account_id and payouts_enabled before creating Stripe session
- Yacht owner message: "This marina is not currently accepting online payments. Please try another marina." — no internal Stripe details exposed
- Marina owners see persistent dashboard banner: "Complete Stripe setup to start receiving bookings" with Connect button until connected
- Marinas without Stripe still appear on map/search — visible but unbookable (keeps marketplace looking active, marina can set up listing while completing Stripe)

### Payout visibility
- "View Payouts" button on dashboard home card opens Stripe's hosted Express Dashboard via login link API
- No custom payout table in EasyDock — Stripe Express Dashboard handles all payout details, balance, and bank info
- Dashboard card shows Stripe connection status alongside the View Payouts button

### Onboarding status sync
- Listen for `account.updated` webhook to keep stripe_onboarding_complete and payouts_enabled in sync
- Catches cases where Stripe later disables payouts (failed verification, policy changes)
- Add to existing webhook handler at /api/webhooks/stripe

### Claude's Discretion
- Database migration details (column names, types for stripe fields on marinas table)
- Express Dashboard login link API implementation details
- Webhook handler structure for account.updated events
- Error handling for failed Connect onboarding redirects
- Whether to store additional Stripe account metadata beyond ID and status

</decisions>

<specifics>
## Specific Ideas

No specific requirements — standard Stripe Connect Express marketplace pattern.

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/api/checkout/route.ts`: Checkout route already computes platformFeeAmount and yachtOwnerFee — needs transfer_data addition
- `src/app/api/webhooks/stripe/route.ts`: Webhook handler with idempotency via stripe_processed_events — extend for account.updated
- `src/lib/supabase/admin.ts`: Admin client for server-side operations bypassing RLS
- `src/components/booking-widget.tsx`: BookingWidget already shows fee breakdown — no changes needed for yacht owner display

### Established Patterns
- API routes use NextResponse.json() with appropriate status codes
- Stripe SDK via getStripe() factory function (new Stripe(process.env.STRIPE_SECRET_KEY!))
- Webhook signature verification with stripe.webhooks.constructEvent()
- Idempotency via stripe_processed_events table
- Error handling: try-catch with console.error() and typed error responses

### Integration Points
- `bookings.platform_fee_amount` column already stores 15% of base price — use as application_fee_amount
- `marinas` table needs new columns: stripe_account_id, stripe_onboarding_complete, payouts_enabled
- Checkout route needs transfer_data.destination and application_fee_amount on Stripe session
- Dashboard at /dashboard/page.tsx — add Connect banner and payout card
- Webhook at /api/webhooks/stripe — add account.updated handler
- New API routes needed: Connect onboarding initiation, Connect return/refresh URLs, Express Dashboard login link

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-stripe-connect-payouts*
*Context gathered: 2026-03-11*
