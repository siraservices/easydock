# Phase 5: Booking Lifecycle and Notifications - Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Marina owners can manage incoming bookings (approve/deny), yacht owners can view booking history with status, either party can cancel with correct Stripe refund handling, and both parties receive email on every booking event. This completes the transaction loop for public launch.

</domain>

<decisions>
## Implementation Decisions

### Booking inbox location & layout
- Bookings tab added to the existing /dashboard page (not a separate page)
- Card-based list for booking requests — matches existing dashboard card style
- Tabs within inbox: Pending / Active / Past
  - Pending = needs action (approve/deny), shown first
  - Active = approved/confirmed bookings
  - Past = completed/cancelled/declined
- Pending tab shows badge count for at-a-glance awareness

### Approve/deny actions
- Instant action + toast — click approve/deny, immediate status update, brief success toast
- No confirmation dialog for approve/deny (low stakes, reversible via cancellation)
- Card moves to appropriate tab section after action

### Cancellation rules
- Both parties can cancel anytime before check-in date
- After check-in, no self-service cancellation
- Full refund always on cancellation before check-in — builds trust for MVP
- Stripe refund reverses charge + platform fee + marina transfer
- Note: payment is captured at checkout (Phase 4 decision), so all cancellations trigger a Stripe refund regardless of booking status

### Cancellation UX
- Confirmation dialog required before cancellation — "Cancel this booking?" with refund amount shown
- Unlike approve/deny (low stakes), cancellation triggers real money movement and warrants confirmation
- Cancel button only on booking detail page (/bookings/[id]), not on the list view — prevents accidental cancellation

### Email notifications
- Service: Resend with React Email templates
- From address: "EasyDock" <bookings@easydock.com> (requires domain verification in Resend)
- Style: Simple branded HTML — EasyDock logo/header, navy/teal brand colors, booking details in card layout, "View Booking" action button
- Triggers (covers EMAL-01 and EMAL-02):
  - Booking created → email to both parties
  - Booking approved → email to yacht owner
  - Booking denied → email to yacht owner
  - Booking cancelled → email to both parties

### Booking status visibility
- Status banner at top of booking detail page — colored by status (yellow=pending, green=approved, red=cancelled/denied)
- Context-appropriate action buttons per status (cancel when applicable)
- No navbar changes for yacht owners — "My Bookings" link is sufficient
- Marina dashboard shows pending booking count badge on Bookings tab

### Claude's Discretion
- React Email template component structure
- Toast notification implementation (existing pattern or new)
- Exact cancel confirmation dialog design
- API route structure for approve/deny/cancel endpoints
- Whether to use server actions or API routes for status updates
- Resend API integration details

</decisions>

<specifics>
## Specific Ideas

- Pending bookings should feel actionable — approve/deny buttons prominent, not hidden
- Cancellation dialog should show the refund amount so the yacht owner knows what they'll get back
- Emails should include all key booking details: marina name, slip, dates, price, status

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/status-badge.tsx`: StatusBadge component already handles booking statuses — extend with approve/deny visual states
- `src/components/ui/loading-spinner.tsx`: LoadingSpinner for async operations
- `src/components/ui/empty-state.tsx`: EmptyState component for empty inbox tabs
- `src/app/bookings/page.tsx`: Yacht owner booking list already exists — needs cancel button on detail page
- `src/app/bookings/[id]/page.tsx`: Booking detail page with status polling — add cancel action and status banner
- `src/app/dashboard/page.tsx`: Dashboard with marina cards + Stripe Connect — add Bookings tab here

### Established Patterns
- API routes use NextResponse.json() with typed error responses
- Stripe SDK via factory function with webhook signature verification
- Supabase admin client for operations bypassing RLS
- Booking status flow: pending → approved → confirmed → completed / cancelled / declined
- 15% platform fee split (10% yacht owner surcharge + 5% marina absorbs) stored as platform_fee_amount

### Integration Points
- `/api/webhooks/stripe/route.ts` — extend for refund-related webhook events
- `bookings` table — status updates via Supabase, RLS policies may need update for marina owner access
- `database/008_stripe_connect.sql` — Stripe Connect columns already on marinas table
- New API routes needed: booking approve/deny, booking cancel with Stripe refund, email send triggers

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-booking-lifecycle-and-notifications*
*Context gathered: 2026-03-12*
