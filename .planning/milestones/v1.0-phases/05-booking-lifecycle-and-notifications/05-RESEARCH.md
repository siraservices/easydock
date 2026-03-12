# Phase 5: Booking Lifecycle and Notifications - Research

**Researched:** 2026-03-12
**Domain:** Booking management UI, Stripe Connect refunds, transactional email (Resend + React Email)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- Bookings tab added to existing /dashboard page (not a separate page)
- Card-based list for booking requests — matches existing dashboard card style
- Tabs within inbox: Pending / Active / Past
  - Pending = needs action (approve/deny), shown first
  - Active = approved/confirmed bookings
  - Past = completed/cancelled/declined
- Pending tab shows badge count for at-a-glance awareness
- Instant action + toast — click approve/deny, immediate status update, brief success toast
- No confirmation dialog for approve/deny (low stakes, reversible via cancellation)
- Card moves to appropriate tab section after action
- Both parties can cancel anytime before check-in date
- After check-in, no self-service cancellation
- Full refund always on cancellation before check-in — builds trust for MVP
- Stripe refund reverses charge + platform fee + marina transfer
- Payment is captured at checkout (Phase 4 decision), so all cancellations trigger a Stripe refund regardless of booking status
- Confirmation dialog required before cancellation — "Cancel this booking?" with refund amount shown
- Cancel button only on booking detail page (/bookings/[id]), not on the list view
- Service: Resend with React Email templates
- From address: "EasyDock" <bookings@easydock.com> (requires domain verification in Resend)
- Style: Simple branded HTML — EasyDock logo/header, navy/teal brand colors, booking details in card layout, "View Booking" action button
- Email triggers:
  - Booking created → email to both parties
  - Booking approved → email to yacht owner
  - Booking denied → email to yacht owner
  - Booking cancelled → email to both parties
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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BOOK-01 | Marina owner sees inbox of incoming bookings and can approve or deny each one | Dashboard tab UI pattern + Supabase bookings query filtered by marina_id + approve/deny API routes using adminClient |
| BOOK-02 | Yacht owner can view booking history and current booking status | /bookings/page.tsx already exists with list; /bookings/[id] exists with detail — extend with status banner and cancel action |
| BOOK-03 | Either party can cancel a booking with appropriate refund logic | Stripe refunds.create with reverse_transfer=true + refund_application_fee=true; RLS already allows marina owner UPDATE on bookings |
| EMAL-01 | Both parties receive email confirmation when a booking is created | Resend + React Email called from /api/checkout after booking creation; fetch both user emails from profiles table |
| EMAL-02 | Both parties receive email when booking status changes (approved, denied, cancelled) | Resend called from approve/deny/cancel API routes after successful DB status update |
</phase_requirements>

---

## Summary

Phase 5 completes the booking transaction loop by connecting three domains: booking management UI (marina dashboard inbox + yacht owner history), Stripe Connect refund mechanics, and transactional email via Resend/React Email.

The codebase already has substantial scaffolding. The bookings table, all status values (pending/approved/confirmed/completed/cancelled/declined), and RLS policies are fully in place. The dashboard page is a client component that fetches marina data — adding a Bookings tab is an additive change. The booking detail page (/bookings/[id]) has polling and status display — it needs a status banner, cancel button, and cancel confirmation dialog. The /bookings list page is complete for BOOK-02.

The two new technical dependencies are Resend (for email) and the Stripe refund flow. Stripe refund mechanics for destination charges with application fees require explicit parameters (reverse_transfer=true, refund_application_fee=true) — these are not automatic. Resend's current API (^4.x) uses `resend.emails.send({ react: <Component /> })` which renders server-side — no separate render call needed when using the react property.

**Primary recommendation:** Build in 4 plans: (1) Database migration + RLS check, (2) Booking inbox in marina dashboard, (3) Cancel flow (detail page + API route + Stripe refund), (4) Email notifications (Resend setup + React Email templates + trigger integration).

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| resend | ^4.x | Transactional email delivery | User decision; co-created with React Email; tight Next.js integration |
| @react-email/components | ^0.0.x (latest) | Email template component library | User decision; official React Email component set |
| stripe (existing) | ^20.4.0 | Refund creation | Already installed; same SDK handles refunds |
| @supabase/supabase-js (existing) | ^2.47.12 | DB status updates | Already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-email | ^4.x or ^5.x | Dev preview server for email templates | Local dev only — not in production bundle |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Resend | SendGrid / Postmark | User locked Resend; Resend has best React Email DX |
| React Email | MJML / plain HTML | React Email is co-authored with Resend; better TypeScript DX |
| API routes | Server Actions | Both work; API routes match existing codebase pattern (NextResponse.json) |

**Installation:**
```bash
npm install resend @react-email/components
```

Note: `react-email` dev server is optional — not required to send emails. Only install if template previews are needed locally.

---

## Architecture Patterns

### Recommended Project Structure for New Files

```
src/
├── app/
│   ├── api/
│   │   ├── bookings/
│   │   │   ├── [id]/
│   │   │   │   ├── approve/route.ts    # POST — marina owner approves booking
│   │   │   │   ├── deny/route.ts       # POST — marina owner denies booking
│   │   │   │   └── cancel/route.ts     # POST — either party cancels booking
│   ├── dashboard/
│   │   └── page.tsx                    # Extend with Bookings tab
│   └── bookings/
│       └── [id]/
│           └── page.tsx                # Extend with status banner + cancel UI
├── emails/
│   ├── booking-created.tsx             # React Email template
│   ├── booking-approved.tsx            # React Email template
│   ├── booking-denied.tsx              # React Email template
│   └── booking-cancelled.tsx           # React Email template
└── lib/
    └── email/
        └── send.ts                     # Resend wrapper — sendBookingEmail(trigger, booking)
database/
└── 009_booking_rls_cancel.sql          # Add boat_owner UPDATE policy for cancellations
```

### Pattern 1: Resend with React Email

**What:** Initialize Resend once, call resend.emails.send() with a React component in the `react` property. Resend renders server-side.

**When to use:** All transactional email triggers in API routes.

**Example:**
```typescript
// src/lib/email/send.ts
import { Resend } from 'resend';
import BookingCreatedEmail from '@/emails/booking-created';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingCreatedEmail(params: {
  to: string;
  marinaName: string;
  slipName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  bookingId: string;
}) {
  const { data, error } = await resend.emails.send({
    from: 'EasyDock <bookings@easydock.com>',
    to: [params.to],
    subject: `Booking ${params.marinaName} — ${params.slipName}`,
    react: BookingCreatedEmail(params),
  });
  if (error) {
    console.error('Email send failed:', error);
    // Non-fatal — log and continue. Do not fail the API response over email.
  }
  return data;
}
```

**React Email template structure:**
```typescript
// src/emails/booking-created.tsx
import {
  Body, Container, Head, Heading, Html, Preview,
  Section, Text, Button, Hr
} from '@react-email/components';

interface BookingCreatedEmailProps {
  marinaName: string;
  slipName: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  bookingId: string;
}

export default function BookingCreatedEmail({
  marinaName, slipName, checkIn, checkOut, totalPrice, bookingId
}: BookingCreatedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Booking confirmed at {marinaName}</Preview>
      <Body style={{ backgroundColor: '#f5f7fa', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px', padding: '32px' }}>
          <Heading style={{ color: '#1e3a5f' }}>EasyDock Booking</Heading>
          <Section style={{ backgroundColor: '#f0fdfa', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
            <Text style={{ margin: 0, color: '#374151' }}><strong>{marinaName}</strong> — {slipName}</Text>
            <Text style={{ margin: '4px 0 0', color: '#6b7280' }}>{checkIn} → {checkOut}</Text>
            <Text style={{ margin: '4px 0 0', fontWeight: 'bold', color: '#1e3a5f' }}>${totalPrice}</Text>
          </Section>
          <Button
            href={`${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}`}
            style={{ backgroundColor: '#0d9488', color: '#ffffff', borderRadius: '8px', padding: '12px 24px', textDecoration: 'none', fontWeight: 'bold' }}
          >
            View Booking
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
```

### Pattern 2: Stripe Refund for Destination Charges

**What:** Full refund of a destination charge that used application_fee_amount. Requires two explicit flags or the platform absorbs the fee and the connected account keeps the transfer.

**When to use:** Every cancellation in /api/bookings/[id]/cancel.

**Example:**
```typescript
// Source: https://docs.stripe.com/connect/marketplace/tasks/refunds-disputes
const refund = await stripe.refunds.create({
  payment_intent: booking.stripe_payment_intent_id,
  reverse_transfer: true,      // REQUIRED: reverses the transfer to connected account
  refund_application_fee: true, // REQUIRED: returns platform fee to platform (not connected account)
});
```

**Critical:** Both flags must be set. Omitting `reverse_transfer` leaves the marina with the funds while the platform absorbs the refund. Omitting `refund_application_fee` has no practical harm (platform keeps the fee) but per CONTEXT.md the intent is full refund so include it.

### Pattern 3: Marina Dashboard Bookings Tab

**What:** Add a tab switcher to the existing /dashboard page that fetches bookings for all marinas owned by the current user, grouped by status.

**When to use:** Marina owner inbox (BOOK-01).

**Key query:**
```typescript
// Fetch all bookings for marinas owned by this user
const { data } = await supabase
  .from('bookings')
  .select('*, slips(name), marinas(name, city, state)')
  .in('marina_id', marinaIds)           // marinaIds from existing marinas fetch
  .order('created_at', { ascending: false });

// Client-side grouping (no extra DB round-trip)
const pending = bookings.filter(b => b.status === 'pending');
const active  = bookings.filter(b => ['approved', 'confirmed'].includes(b.status));
const past    = bookings.filter(b => ['completed', 'cancelled', 'declined'].includes(b.status));
```

### Pattern 4: RLS for Boat Owner Cancellation

**What:** The existing bookings UPDATE policy allows marina owners to update bookings for their marinas. Boat owners have no UPDATE policy. Cancellation by a boat owner must go through an API route using adminClient (SECURITY DEFINER pattern, consistent with create_booking_atomic).

**When to use:** /api/bookings/[id]/cancel route.

```typescript
// Use adminClient — boat owners have no UPDATE RLS on bookings
const adminClient = createAdminClient();
const { error } = await adminClient
  .from('bookings')
  .update({ status: 'cancelled' })
  .eq('id', bookingId);
```

Alternatively, add an RLS UPDATE policy for boat owners scoped to cancellation only:
```sql
-- 009_booking_rls_cancel.sql
CREATE POLICY "Boat owners can cancel own bookings"
  ON bookings FOR UPDATE
  USING (boat_owner_id = auth.uid())
  WITH CHECK (status = 'cancelled');
```

This is cleaner than adminClient for a single-field update. Use the DB migration approach.

### Pattern 5: Toast Notification

**What:** The project has no existing toast library. Build a minimal inline toast using React state in the component that needs it — no library required for two use cases (approve/deny).

**Implementation:**
```typescript
const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

// Show for 3 seconds then dismiss
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  setToast({ message, type });
  setTimeout(() => setToast(null), 3000);
};

// In JSX
{toast && (
  <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white text-sm font-medium z-50 ${
    toast.type === 'success' ? 'bg-teal-600' : 'bg-red-600'
  }`}>
    {toast.message}
  </div>
)}
```

### Anti-Patterns to Avoid

- **Calling resend.emails.send inside the same try/catch as the DB update:** Email failure should not roll back the status update. Log and continue.
- **Using user client for status updates in cancel route:** Boat owners have no UPDATE policy. Use adminClient or the RLS migration.
- **Calling stripe.refunds.create without `reverse_transfer: true`:** The marina retains the transferred funds, creating a negative balance on the platform account.
- **Trusting client-submitted refund amounts:** Always compute refund amount server-side from booking.total_price (stored in DB).
- **Cancelling after check-in:** Check `booking.check_in` server-side before processing cancel. Reject if today >= check_in date.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email rendering | Custom HTML string builder | React Email components | Email client compatibility is notoriously complex; React Email handles MSO conditionals, Outlook quirks |
| Email delivery | Custom SMTP or fetch to Mailgun | Resend SDK | Rate limiting, retry, delivery tracking already handled |
| Refund calculation | Re-calculate from slip rates | Use booking.total_price from DB | Already stored at checkout with server-computed price |

---

## Common Pitfalls

### Pitfall 1: Refund Without reverse_transfer
**What goes wrong:** Platform issues refund to customer but marina keeps the transferred funds. Platform absorbs the full charge amount as a loss.
**Why it happens:** `reverse_transfer` defaults to false — must be set explicitly.
**How to avoid:** Always set `{ reverse_transfer: true, refund_application_fee: true }` in stripe.refunds.create.
**Warning signs:** Stripe Dashboard shows refund on platform but connected account balance unchanged.

### Pitfall 2: Double-Refund Race Condition
**What goes wrong:** Both parties trigger cancel simultaneously, two Stripe refunds created, customer gets double refund.
**Why it happens:** No optimistic locking on cancel.
**How to avoid:** Update booking status to 'cancelled' in DB first, then call Stripe. If DB update fails (already cancelled), return 409 early. Pattern: `UPDATE bookings SET status='cancelled' WHERE id=? AND status != 'cancelled'` — check rows affected.

### Pitfall 3: Email Sends Before DB Commit
**What goes wrong:** Email fires, then DB update fails — customer gets "approved" email but booking remains pending.
**Why it happens:** Email sent optimistically before checking DB result.
**How to avoid:** Always await DB update result and check for error before calling email helper.

### Pitfall 4: Cancellation After Check-in
**What goes wrong:** Yacht owner cancels a booking for a stay already underway.
**Why it happens:** Cancel route not checking date boundary server-side.
**How to avoid:** Server-side guard: if `new Date(booking.check_in) <= new Date()`, return 422.

### Pitfall 5: Marina Owner Reading All Platform Bookings
**What goes wrong:** Marina owner queries all bookings, RLS does not properly scope to their marinas.
**Why it happens:** Existing RLS policy does correctly scope (checked in 001_initial_schema.sql) but query must use correct user client (not adminClient) to have RLS enforced.
**How to avoid:** Use user Supabase client for marina dashboard booking reads — RLS enforces marina ownership automatically.

### Pitfall 6: Missing RESEND_API_KEY in Production
**What goes wrong:** Emails silently fail in production after working locally.
**Why it happens:** Environment variable not added to Netlify/hosting config.
**How to avoid:** Add RESEND_API_KEY to Netlify environment variables. Add NEXT_PUBLIC_APP_URL as well (used in email "View Booking" links).

---

## Code Examples

Verified patterns from official sources:

### Resend email send — react property (source: resend.com/docs/send-with-nextjs)
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.emails.send({
  from: 'EasyDock <bookings@easydock.com>',
  to: ['user@example.com'],
  subject: 'Your booking at Marina Name',
  react: BookingCreatedEmail({ marinaName: 'Marina Name', ... }),
});
```

### Stripe refund for destination charge (source: docs.stripe.com/connect/marketplace/tasks/refunds-disputes)
```typescript
const refund = await stripe.refunds.create({
  payment_intent: booking.stripe_payment_intent_id,
  reverse_transfer: true,
  refund_application_fee: true,
});
```

### Approve/deny route structure
```typescript
// POST /api/bookings/[id]/approve
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify marina ownership via RLS (supabase user client enforces policy)
  const { data: booking } = await supabase
    .from('bookings')
    .update({ status: 'approved' })
    .eq('id', params.id)
    .select('*, marinas(owner_id)')
    .single();

  if (!booking) return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 });

  // Send email (non-fatal)
  await sendBookingApprovedEmail({ ... });

  return NextResponse.json({ success: true });
}
```
Note: Marina owner UPDATE policy in RLS already scoped to their marinas — user client enforces this automatically. If the marina doesn't belong to the current user, the update returns no rows.

### Cancel route — DB-first, then Stripe
```typescript
// POST /api/bookings/[id]/cancel
// Works for both boat_owner (via adminClient) and marina_owner (via user client)
const adminClient = createAdminClient();

// Check cancellation eligibility
const { data: booking } = await adminClient.from('bookings').select('*').eq('id', id).single();
if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

if (new Date(booking.check_in) <= new Date()) {
  return NextResponse.json({ error: 'Cannot cancel after check-in' }, { status: 422 });
}

if (booking.status === 'cancelled') {
  return NextResponse.json({ error: 'Already cancelled' }, { status: 409 });
}

// Update DB first
const { error: updateError } = await adminClient
  .from('bookings')
  .update({ status: 'cancelled' })
  .eq('id', id)
  .eq('status', booking.status); // Guard against race condition

if (updateError) return NextResponse.json({ error: 'Update failed' }, { status: 500 });

// Then Stripe refund (only if payment was captured)
if (booking.stripe_payment_intent_id) {
  await stripe.refunds.create({
    payment_intent: booking.stripe_payment_intent_id,
    reverse_transfer: true,
    refund_application_fee: true,
  });
}

// Send cancellation emails (non-fatal)
await sendBookingCancelledEmails({ ... });
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| nodemailer + custom SMTP | Resend SDK with React Email | ~2023 | Simpler setup, React component templates, better deliverability |
| react-email render() + resend html property | resend `react` property (auto-renders) | Resend SDK v2+ | No separate render call needed |
| stripe.charges.refund() | stripe.refunds.create() | Stripe API v3+ | PaymentIntent-based refunds are the current standard |

**Deprecated/outdated:**
- `@react-email/render` manual call before send: No longer required when using `react` property in resend.emails.send. Resend renders the component server-side automatically.
- `stripe.charges.refund()`: Use `stripe.refunds.create({ payment_intent: ... })` with current Stripe SDK v20.

---

## Open Questions

1. **Resend domain verification timing**
   - What we know: From address is `bookings@easydock.com`; Resend requires domain DNS verification
   - What's unclear: Whether `easydock.com` DNS records are pre-configured in Resend
   - Recommendation: This is a deployment step, not a code step. Document as a Wave 0 prerequisite checklist item. During development, use Resend's test domain `onboarding@resend.dev` or add `RESEND_API_KEY=re_test_...` to trigger test mode.

2. **Boat owner profile email lookup**
   - What we know: `profiles` table has `email` column; `bookings.boat_owner_id` references profiles
   - What's unclear: Whether the profiles RLS allows marina owner to read a yacht owner's email
   - Recommendation: Use adminClient to fetch both party emails in all email-sending routes. The profiles "Users can read own profile" policy would block cross-user reads with user client.

3. **Marina owner email lookup for notifications**
   - What we know: Marina `owner_id` → profiles.id → profiles.email
   - What's unclear: Nothing — same adminClient pattern resolves this
   - Recommendation: In cancel/approve/deny routes, fetch marina.owner_id then profiles.email via adminClient join.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 |
| Config file | vitest.config.ts (project root) |
| Quick run command | `npx vitest run src/__tests__/booking-approve.test.ts` |
| Full suite command | `npx vitest run src/__tests__/` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BOOK-01 | Approve route updates status to 'approved', rejects non-owner | unit | `npx vitest run src/__tests__/booking-approve.test.ts` | Wave 0 |
| BOOK-01 | Deny route updates status to 'declined', rejects non-owner | unit | `npx vitest run src/__tests__/booking-deny.test.ts` | Wave 0 |
| BOOK-02 | Booking list page renders — covered by existing /bookings/page.tsx | manual | n/a | n/a |
| BOOK-03 | Cancel route: DB-first, then Stripe refund, rejects post-check-in | unit | `npx vitest run src/__tests__/booking-cancel.test.ts` | Wave 0 |
| BOOK-03 | Cancel Stripe params include reverse_transfer + refund_application_fee | unit | `npx vitest run src/__tests__/booking-cancel.test.ts` | Wave 0 |
| EMAL-01 | Email helper called with correct params after booking created | unit | `npx vitest run src/__tests__/email-send.test.ts` | Wave 0 |
| EMAL-02 | Email helper called after approve / deny / cancel status change | unit | included in approve/deny/cancel test files | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run src/__tests__/booking-approve.test.ts src/__tests__/booking-deny.test.ts src/__tests__/booking-cancel.test.ts`
- **Per wave merge:** `npx vitest run src/__tests__/`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/booking-approve.test.ts` — covers BOOK-01 approve
- [ ] `src/__tests__/booking-deny.test.ts` — covers BOOK-01 deny
- [ ] `src/__tests__/booking-cancel.test.ts` — covers BOOK-03 cancel + Stripe params
- [ ] `src/__tests__/email-send.test.ts` — covers EMAL-01 / EMAL-02 email call verification

---

## Existing Code Inventory (Phase 5 Touchpoints)

| File | Current State | Phase 5 Change |
|------|---------------|----------------|
| src/app/dashboard/page.tsx | Marina cards + Stripe Connect UI | Add Bookings tab with Pending/Active/Past sub-tabs and approve/deny actions |
| src/app/bookings/page.tsx | Yacht owner booking list (complete) | BOOK-02 done — only minor: no tab structure needed per CONTEXT.md |
| src/app/bookings/[id]/page.tsx | Detail page with polling + StatusBadge | Add status banner, cancel button, cancel confirmation dialog |
| src/components/ui/status-badge.tsx | Handles all 6 booking statuses | No changes needed — already covers approved/declined/cancelled |
| src/app/api/webhooks/stripe/route.ts | checkout.session.completed, expired, account.updated | No changes needed for Phase 5 (refunds are Stripe-push, not webhook-driven) |
| src/app/api/checkout/route.ts | Creates booking + Stripe session | Extend: call sendBookingCreatedEmail after RPC succeeds |

---

## Sources

### Primary (HIGH confidence)
- Official Stripe Docs: https://docs.stripe.com/connect/marketplace/tasks/refunds-disputes — reverse_transfer and refund_application_fee parameters verified
- Resend Official Docs: https://resend.com/docs/send-with-nextjs — react property API confirmed
- Project source: src/app/api/webhooks/stripe/route.ts — existing Stripe factory + adminClient patterns
- Project source: database/001_initial_schema.sql — RLS policies on bookings confirmed

### Secondary (MEDIUM confidence)
- React Email 5.0 release: https://resend.com/blog/react-email-5 — React 19 support confirmed
- npm search results for resend: current version ^4.x confirmed via WebSearch

### Tertiary (LOW confidence)
- Resend package version: confirmed as active/maintained but exact pinned version not verified from npm registry (403 on direct fetch). Install `resend` without version pin; npm will get latest ^4.x.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Resend + React Email confirmed from official docs; Stripe from official docs
- Architecture: HIGH — All patterns derived from existing codebase conventions + official docs
- Pitfalls: HIGH — Stripe refund flags verified from official docs; RLS analysis from source code

**Research date:** 2026-03-12
**Valid until:** 2026-04-12 (Resend API is stable; Stripe refund API is stable)
