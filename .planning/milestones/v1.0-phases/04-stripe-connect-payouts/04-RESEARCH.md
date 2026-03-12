# Phase 4: Stripe Connect Payouts - Research

**Researched:** 2026-03-11
**Domain:** Stripe Connect Express accounts, destination charges, Express Dashboard login links
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Connect onboarding flow**
- Stripe Connect Express accounts (hosted onboarding — Stripe handles KYC/compliance)
- "Connect Stripe" button lives on the marina dashboard home (/dashboard) as a prominent banner/card when not yet connected
- Stripe account linked per marina (stripe_account_id on marinas table), not per user profile — supports one owner with multiple marinas using different bank accounts
- After successful onboarding: green checkmark status badge next to marina name on dashboard, brief success toast
- Banner disappears once Stripe is connected and payouts are enabled

**Payment splitting**
- Use `transfer_data` with `destination` = marina's connected Stripe account on the Checkout Session
- `application_fee_amount` = `platform_fee_amount` (already stored as 15% of base price on every booking from Phase 1)
- Immediate capture at checkout — no authorization holds. If marina declines later (Phase 5), a refund is issued
- No changes to yacht owner fee display — booking widget already shows base price + EasyDock service fee = total

**Onboarding-incomplete blocking**
- Server-side block: checkout API checks marina's stripe_account_id and payouts_enabled before creating Stripe session
- Yacht owner message: "This marina is not currently accepting online payments. Please try another marina." — no internal Stripe details exposed
- Marina owners see persistent dashboard banner: "Complete Stripe setup to start receiving bookings" with Connect button until connected
- Marinas without Stripe still appear on map/search — visible but unbookable

**Payout visibility**
- "View Payouts" button on dashboard home card opens Stripe's hosted Express Dashboard via login link API
- No custom payout table in EasyDock — Stripe Express Dashboard handles all payout details, balance, and bank info
- Dashboard card shows Stripe connection status alongside the View Payouts button

**Onboarding status sync**
- Listen for `account.updated` webhook to keep stripe_onboarding_complete and payouts_enabled in sync
- Catches cases where Stripe later disables payouts (failed verification, policy changes)
- Add to existing webhook handler at /api/webhooks/stripe

### Claude's Discretion
- Database migration details (column names, types for stripe fields on marinas table)
- Express Dashboard login link API implementation details
- Webhook handler structure for account.updated events
- Error handling for failed Connect onboarding redirects
- Whether to store additional Stripe account metadata beyond ID and status

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PAY-01 | Marina owner can link their Stripe account via Connect Express onboarding flow | Verified: `stripe.accounts.create({ type: 'express' })` + `stripe.accountLinks.create({ type: 'account_onboarding' })` flow documented |
| PAY-02 | Checkout splits payment: EasyDock takes percentage fee, remainder transfers to marina's Stripe account | Verified: `payment_intent_data.application_fee_amount` + `payment_intent_data.transfer_data.destination` on Checkout Session |
| PAY-03 | Marina owner can view payout history and upcoming transfers in their dashboard | Verified: `stripe.accounts.createLoginLink(accountId)` generates single-use URL to Express Dashboard |
</phase_requirements>

## Summary

Phase 4 implements Stripe Connect Express so marina owners receive their cut automatically on every booking. The approach is "destination charges": EasyDock collects the full charge on the platform account, deducts `application_fee_amount` (the 15% platform fee already stored in `bookings.platform_fee_amount`), and Stripe automatically transfers the remainder to the marina's connected account via `transfer_data.destination`.

The three implementation areas are: (1) Connect onboarding — create an Express account, generate a one-time account link, handle return/refresh URL callbacks; (2) checkout rewrite — add `payment_intent_data.application_fee_amount` and `payment_intent_data.transfer_data.destination` to the existing Checkout Session creation; (3) status sync — extend the existing webhook handler with `account.updated` to keep `payouts_enabled` in sync, and add a login-link API route for the Express Dashboard button.

**Primary recommendation:** Use destination charges (not direct charges or separate charges + transfers). application_fee_amount lives under `payment_intent_data` on the Checkout Session — NOT at the top level of the session params. This is the most common mistake when reading older Stripe examples that used the PaymentIntent API directly.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| stripe (Node.js SDK) | Already installed | Accounts, AccountLinks, Checkout Sessions, LoginLinks | Already used in project; provides typed API |

### New API Surface (within existing SDK)
| API | Method | Purpose |
|-----|--------|---------|
| Connect Accounts | `stripe.accounts.create({ type: 'express' })` | Create marina's Stripe Express account |
| Account Links | `stripe.accountLinks.create({ type: 'account_onboarding' })` | Generate one-time hosted onboarding URL |
| Account Retrieval | `stripe.accounts.retrieve(accountId)` | Check `payouts_enabled`, `charges_enabled` after return URL |
| Login Links | `stripe.accounts.createLoginLink(accountId)` | Generate single-use Express Dashboard URL |
| Checkout Sessions | Existing `stripe.checkout.sessions.create()` | Add `payment_intent_data.application_fee_amount` and `transfer_data.destination` |

**No new npm packages required.** The existing `stripe` SDK covers all needed API calls.

### New Environment Variables Needed
```
STRIPE_SECRET_KEY          # Already exists
STRIPE_WEBHOOK_SECRET      # Already exists (may need second secret for Connect webhooks)
NEXT_PUBLIC_APP_URL        # Needed for return_url and refresh_url construction
```

## Architecture Patterns

### Recommended File Structure for Phase 4
```
src/
├── app/
│   ├── api/
│   │   ├── checkout/route.ts              # MODIFY: add payment_intent_data.application_fee_amount + transfer_data
│   │   ├── webhooks/stripe/route.ts       # MODIFY: add account.updated handler
│   │   ├── connect/
│   │   │   ├── onboard/route.ts           # NEW: create Express account + account link
│   │   │   ├── return/route.ts            # NEW: handle Stripe return URL (check account status)
│   │   │   ├── refresh/route.ts           # NEW: handle Stripe refresh URL (regenerate account link)
│   │   │   └── login-link/route.ts        # NEW: generate Express Dashboard login link
│   ├── dashboard/
│   │   └── page.tsx                       # MODIFY: add Connect banner + Stripe status card
├── types/
│   └── database.ts                        # MODIFY: add stripe fields to marinas table type
database/
└── 008_stripe_connect.sql                 # NEW: ALTER TABLE marinas + migration
```

### Pattern 1: Connect Onboarding (Two-Step)

**What:** Create account first, then generate a one-time link. Account ID must be stored before redirecting because the link expires.

**When to use:** When marina owner clicks "Connect Stripe" button.

```typescript
// Source: https://docs.stripe.com/connect/express-accounts
// POST /api/connect/onboard
export async function POST(request: Request) {
  const stripe = getStripe();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get marina for this owner (passed in body or from session)
  const { marinaId } = await request.json();

  // Step 1: Create Express account
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  // Step 2: Persist account ID BEFORE redirecting (link is one-time-use)
  const adminClient = createAdminClient();
  await adminClient
    .from('marinas')
    .update({ stripe_account_id: account.id })
    .eq('id', marinaId)
    .eq('owner_id', user!.id);

  // Step 3: Generate onboarding account link
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const link = await stripe.accountLinks.create({
    account: account.id,
    type: 'account_onboarding',
    return_url: `${appUrl}/api/connect/return?marinaId=${marinaId}`,
    refresh_url: `${appUrl}/api/connect/refresh?accountId=${account.id}&marinaId=${marinaId}`,
  });

  return NextResponse.json({ url: link.url });
}
```

### Pattern 2: Return URL Handler

**What:** Called by Stripe after onboarding completes. Retrieve account to verify payouts_enabled. Do NOT trust the URL alone — always retrieve the account.

**Critical:** The return URL being called does NOT guarantee onboarding is complete. Always retrieve and check `payouts_enabled`.

```typescript
// Source: https://docs.stripe.com/connect/express-accounts
// GET /api/connect/return?marinaId=xxx
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const marinaId = searchParams.get('marinaId');

  // Fetch marina's stripe_account_id from DB
  const adminClient = createAdminClient();
  const { data: marina } = await adminClient
    .from('marinas')
    .select('stripe_account_id')
    .eq('id', marinaId!)
    .single();

  // Always retrieve account to check actual status
  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(marina!.stripe_account_id!);

  // Update DB with current status
  await adminClient
    .from('marinas')
    .update({
      stripe_onboarding_complete: account.details_submitted,
      payouts_enabled: account.payouts_enabled,
    })
    .eq('id', marinaId!);

  // Redirect back to dashboard with status indicator
  const status = account.payouts_enabled ? 'connected' : 'pending';
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?stripeStatus=${status}`
  );
}
```

### Pattern 3: Checkout Session with Destination Charge

**What:** Add `payment_intent_data.application_fee_amount` and `payment_intent_data.transfer_data.destination` to existing session creation. These are under `payment_intent_data`, NOT top-level.

**Critical:** `application_fee_amount` is in cents (integer). The existing `platform_fee_amount` in the DB is stored as dollars — multiply by 100.

```typescript
// Source: https://docs.stripe.com/api/checkout/sessions/create?lang=node
// Modification to existing src/app/api/checkout/route.ts

// Add guard before creating Stripe session:
const { data: marinaForConnect } = await adminClient
  .from('marinas')
  .select('stripe_account_id, payouts_enabled')
  .eq('id', marinaId)
  .single();

if (!marinaForConnect?.stripe_account_id || !marinaForConnect?.payouts_enabled) {
  return NextResponse.json(
    { error: 'This marina is not currently accepting online payments. Please try another marina.' },
    { status: 422 }
  );
}

// Modify the session creation:
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [ /* existing line items */ ],
  mode: 'payment',
  success_url: `...`,
  cancel_url: `...`,
  metadata: { booking_id: bookingId },
  payment_intent_data: {
    application_fee_amount: Math.round(platformFeeAmount * 100), // dollars → cents
    transfer_data: {
      destination: marinaForConnect.stripe_account_id,
    },
  },
});
```

### Pattern 4: Express Dashboard Login Link

**What:** Generate single-use login link on demand when marina owner clicks "View Payouts".

**When to use:** Only when user actively requests access — do not pre-generate or email these URLs.

```typescript
// Source: https://docs.stripe.com/connect/integrate-express-dashboard
// POST /api/connect/login-link
export async function POST(request: Request) {
  const stripe = getStripe();
  const { marinaId } = await request.json();

  const adminClient = createAdminClient();
  const { data: marina } = await adminClient
    .from('marinas')
    .select('stripe_account_id, payouts_enabled')
    .eq('id', marinaId)
    .single();

  if (!marina?.stripe_account_id || !marina?.payouts_enabled) {
    return NextResponse.json(
      { error: 'Stripe account not fully connected' },
      { status: 400 }
    );
  }

  const loginLink = await stripe.accounts.createLoginLink(
    marina.stripe_account_id
  );

  return NextResponse.json({ url: loginLink.url });
}
```

### Pattern 5: account.updated Webhook Handler

**What:** Extend existing switch statement in webhook handler to catch `account.updated` events and sync status to DB.

**Connect webhook note:** `account.updated` events from connected accounts require the webhook endpoint to be configured with "Events on Connected accounts" in the Stripe Dashboard. The platform account's webhook secret is used — but you must configure it to receive Connect events. Consider whether a separate STRIPE_CONNECT_WEBHOOK_SECRET is needed.

```typescript
// Source: https://docs.stripe.com/connect/webhooks
// Addition to existing src/app/api/webhooks/stripe/route.ts switch statement

case 'account.updated': {
  const account = event.data.object as Stripe.Account;

  // event.account contains the connected account ID for Connect webhooks
  const connectedAccountId = (event as Stripe.Event & { account?: string }).account
    ?? account.id;

  const adminClient = createAdminClient();
  const { error: updateError } = await adminClient
    .from('marinas')
    .update({
      stripe_onboarding_complete: account.details_submitted,
      payouts_enabled: account.payouts_enabled,
    })
    .eq('stripe_account_id', connectedAccountId);

  if (updateError) {
    console.error('Failed to update marina Stripe status:', updateError);
    return NextResponse.json({ error: 'Database write failed' }, { status: 500 });
  }

  await supabase.from('stripe_processed_events').insert({
    id: event.id,
    event_type: event.type,
    booking_id: null,
  });

  break;
}
```

### Anti-Patterns to Avoid

- **Top-level application_fee_amount:** In Checkout Sessions, fees MUST be under `payment_intent_data.application_fee_amount`, not at session top level. Top-level only works for subscription mode.
- **Trusting the return URL:** Always call `stripe.accounts.retrieve()` after return — Stripe calls return_url when user exits the flow, not necessarily when they complete it.
- **Pre-generating login links:** Login links are single-use and must not be emailed. Generate on demand only.
- **Storing the account link URL:** Account links expire after ~5 minutes and can only be used once. Only store `stripe_account_id`.
- **Missing refresh URL handler:** If the link expires (user takes too long), Stripe redirects to refresh_url. Must regenerate a fresh account link there.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| KYC / identity verification | Custom ID collection + verification flow | Stripe Express hosted onboarding | Handles ID upload, bank linking, tax forms, country compliance. Massive regulatory complexity. |
| Payout scheduling + bank transfers | Manual payout logic | Stripe automatic payouts | Stripe handles retry logic, failed payouts, bank routing. Don't build this. |
| Connected account dashboard | Custom payout history table | Express Dashboard login link | Stripe Express Dashboard shows balance, payout history, and bank info. One API call. |
| Fee splitting math at transfer time | Post-payment transfer jobs | `application_fee_amount` + `transfer_data.destination` | Atomic with the charge. No race conditions, no delayed jobs. |
| Webhook deduplication for connect events | Separate idempotency table | Existing `stripe_processed_events` table | Already in place and working. Reuse. |

**Key insight:** The entire marketplace split, KYC, payout scheduling, and dashboard are Stripe features. Phase 4 is primarily plumbing — connecting existing code to existing Stripe APIs.

## Common Pitfalls

### Pitfall 1: payment_intent_data vs top-level fields
**What goes wrong:** Developer adds `application_fee_amount` at the top level of `stripe.checkout.sessions.create({})`. Stripe silently ignores it or throws a type error.
**Why it happens:** Older Stripe docs and many community examples use `stripe.paymentIntents.create()` directly, where `application_fee_amount` IS top-level. Checkout Sessions are different.
**How to avoid:** Always place under `payment_intent_data: { application_fee_amount: ..., transfer_data: { destination: ... } }`.
**Warning signs:** Charges succeed but no ApplicationFee objects appear in Stripe Dashboard; marina receives full amount minus Stripe fees.

### Pitfall 2: Fee amount in dollars vs cents
**What goes wrong:** `platformFeeAmount` is stored as dollars (e.g., `45.00`) in the DB. Passing it directly to `application_fee_amount` sends $0.45 instead of $45.00.
**Why it happens:** Stripe amounts are always integers in the smallest currency unit (cents for USD).
**How to avoid:** Always multiply by 100 and `Math.round()`: `Math.round(platformFeeAmount * 100)`.
**Warning signs:** Platform fee appears as tiny amount in Stripe Dashboard; easy to spot in test mode.

### Pitfall 3: Account link expiration without refresh URL handler
**What goes wrong:** Marina owner starts onboarding, steps away for 10 minutes, link expires. Stripe redirects to `refresh_url`. If that route doesn't exist or doesn't regenerate the link, the marina owner sees an error.
**Why it happens:** Account links are one-time-use and expire in ~5 minutes.
**How to avoid:** Implement `/api/connect/refresh` that retrieves the stored `stripe_account_id` from DB and generates a fresh account link.

### Pitfall 4: Connect webhook not configured for connected account events
**What goes wrong:** `account.updated` events never arrive at the webhook endpoint.
**Why it happens:** By default, Stripe webhook endpoints only receive platform account events. Connected account events require explicit configuration ("Events on Connected accounts" toggle in Stripe Dashboard, or `connect: true` on the API-created endpoint).
**How to avoid:** In Stripe Dashboard, ensure the webhook endpoint is configured to receive Connect events. In test mode, use Stripe CLI with `stripe listen --forward-connect-to localhost:3000/api/webhooks/stripe`.
**Warning signs:** Onboarding completes but DB never updates; `payouts_enabled` stays false in DB.

### Pitfall 5: Blocking checkout before stripe_account_id is stored
**What goes wrong:** Race condition where checkout API checks `stripe_account_id` but the onboard API hasn't finished storing it yet (unlikely but possible with concurrent requests).
**Why it happens:** Onboard route must store `stripe_account_id` in DB before generating the account link redirect. If this step fails, marina has a dangling Stripe account with no DB record.
**How to avoid:** Store `stripe_account_id` in DB before generating the account link. If DB write fails, abort — do not redirect to Stripe. Log the orphaned account ID for manual recovery.

### Pitfall 6: application_fee_amount exceeding charge amount
**What goes wrong:** If platform fee calculation produces a value greater than the total charge (shouldn't happen with 15% fee, but edge cases with rounding).
**Why it happens:** Stripe rejects the charge if `application_fee_amount` > total charge amount.
**How to avoid:** Add guard: `application_fee_amount = Math.min(applicationFeeAmountCents, totalAmountCents - 1)`. The 15% fee will never exceed 100% so this is a safety net only.

## Code Examples

### Database Migration: Add Stripe Fields to Marinas

```sql
-- 008_stripe_connect.sql
ALTER TABLE marinas
  ADD COLUMN stripe_account_id TEXT DEFAULT NULL,
  ADD COLUMN stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  ADD COLUMN payouts_enabled BOOLEAN DEFAULT FALSE;

-- Index for webhook handler lookup by stripe_account_id
CREATE INDEX idx_marinas_stripe_account_id
  ON marinas(stripe_account_id)
  WHERE stripe_account_id IS NOT NULL;

-- RLS: service role can update stripe fields (webhook handler uses admin client)
-- Existing marinas RLS policies cover marina_owner reads via user client
-- No new policies needed — admin client bypasses RLS
```

### TypeScript Type Update for marinas Table

```typescript
// Add to database.ts marinas Row/Insert/Update:
// Row additions:
stripe_account_id: string | null;
stripe_onboarding_complete: boolean;
payouts_enabled: boolean;

// Insert additions:
stripe_account_id?: string | null;
stripe_onboarding_complete?: boolean;
payouts_enabled?: boolean;

// Update additions:
stripe_account_id?: string | null;
stripe_onboarding_complete?: boolean;
payouts_enabled?: boolean;
```

### Connect Status Check on Checkout

```typescript
// Source: https://docs.stripe.com/connect/express-accounts
// Guard inserted in checkout route before stripe.checkout.sessions.create()

const { data: marina } = await adminClient
  .from('marinas')
  .select('stripe_account_id, payouts_enabled')
  .eq('id', marinaId)
  .single();

if (!marina?.stripe_account_id || !marina?.payouts_enabled) {
  return NextResponse.json(
    { error: 'This marina is not currently accepting online payments. Please try another marina.' },
    { status: 422 }
  );
}
```

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| Stripe Connect OAuth flow (old Express) | Account Links with `account_onboarding` type | OAuth flow is deprecated for new integrations; Account Links are the current standard |
| `application_fee_amount` at PaymentIntent top level | `payment_intent_data.application_fee_amount` in Checkout Sessions | Checkout Sessions wrap PaymentIntents — fields nest under payment_intent_data |
| Custom payout dashboards | Express Dashboard login links | Stripe provides hosted dashboard; no need to build payout history UI |

**Deprecated/outdated:**
- Old Express OAuth connect flow: Still functional but new integrations should use Account Links
- `on_behalf_of` for same-country Express: Not needed for US platform + US marinas. Only required for cross-border marketplace scenarios.

## Open Questions

1. **Single vs separate webhook secret for Connect events**
   - What we know: The existing webhook handler uses `STRIPE_WEBHOOK_SECRET`. Connect events can share the same endpoint if it's configured for "Events on Connected accounts."
   - What's unclear: Whether Stripe uses the same signing secret for Connect events on the same endpoint, or whether a second secret is issued.
   - Recommendation: Configure existing endpoint for Connect events in Stripe Dashboard; test with Stripe CLI `--forward-connect-to` flag to verify signature validation works with existing secret. If signatures fail, add `STRIPE_CONNECT_WEBHOOK_SECRET` env var.

2. **Express account country/business_type prefill**
   - What we know: `stripe.accounts.create()` accepts `country`, `business_type`, `email` for prefill.
   - What's unclear: Whether to prefill from marina owner's profile or leave blank for Stripe to collect.
   - Recommendation: Prefill `email` from the authenticated user's email and `country: 'US'` (MVP is South Florida only). Skip `business_type` — let Stripe's onboarding flow collect it.

3. **payouts_enabled vs charges_enabled as the gate**
   - What we know: Stripe has both `charges_enabled` (can accept payments) and `payouts_enabled` (can receive payouts).
   - What's unclear: Which is the correct gate for the checkout block.
   - Recommendation: Use `payouts_enabled` as the gate per the CONTEXT.md decision. This is the more restrictive check — if payouts are enabled, charges are also enabled. Aligns with the business requirement that marinas must be able to receive money.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (vitest.config.ts present) |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PAY-01 | Connect onboarding route creates Express account + account link | unit | `npx vitest run src/__tests__/connect-onboard.test.ts -x` | ❌ Wave 0 |
| PAY-01 | Return URL handler updates marina stripe status in DB | unit | `npx vitest run src/__tests__/connect-return.test.ts -x` | ❌ Wave 0 |
| PAY-02 | Checkout route adds application_fee_amount + transfer_data when marina has payouts_enabled | unit | `npx vitest run src/__tests__/checkout-connect.test.ts -x` | ❌ Wave 0 |
| PAY-02 | Checkout route blocks with 422 when marina lacks stripe_account_id or payouts_enabled=false | unit | `npx vitest run src/__tests__/checkout-connect.test.ts -x` | ❌ Wave 0 |
| PAY-03 | Login link route returns Express Dashboard URL for connected marina | unit | `npx vitest run src/__tests__/connect-login-link.test.ts -x` | ❌ Wave 0 |
| PAY-01 | account.updated webhook syncs stripe_onboarding_complete and payouts_enabled to DB | unit | `npx vitest run src/__tests__/webhook-connect.test.ts -x` | ❌ Wave 0 |

**Testing approach:** Follow existing pattern from `webhook-idempotency.test.ts` — mock the `stripe` module and `@/lib/supabase/admin` module, import route handlers, and test behavior by inspecting mock call args. No real Stripe API calls in tests.

### Sampling Rate
- **Per task commit:** `npx vitest run src/__tests__/checkout-pricing.test.ts src/__tests__/webhook-idempotency.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/connect-onboard.test.ts` — covers PAY-01 onboarding route
- [ ] `src/__tests__/connect-return.test.ts` — covers PAY-01 return URL handler
- [ ] `src/__tests__/checkout-connect.test.ts` — covers PAY-02 payment split + blocking guard
- [ ] `src/__tests__/connect-login-link.test.ts` — covers PAY-03 login link generation
- [ ] `src/__tests__/webhook-connect.test.ts` — covers account.updated handler

## Sources

### Primary (HIGH confidence)
- https://docs.stripe.com/connect/express-accounts — Express account creation, AccountLinks, return/refresh URL pattern
- https://docs.stripe.com/api/checkout/sessions/create?lang=node — `payment_intent_data.application_fee_amount` and `payment_intent_data.transfer_data.destination` parameters
- https://docs.stripe.com/connect/destination-charges — Destination charge pattern, constraints on fee amount cap
- https://docs.stripe.com/connect/integrate-express-dashboard — Login link generation pattern
- https://docs.stripe.com/connect/webhooks — Connect webhook configuration, `account.updated` event structure

### Secondary (MEDIUM confidence)
- Existing codebase: `src/app/api/webhooks/stripe/route.ts` — established idempotency, mock, and error-handling patterns to follow
- Existing codebase: `src/app/api/checkout/route.ts` — fee calculation already correct; `platformFeeAmount` is already 15% of base in dollars, needs `* 100` for Stripe cents

### Tertiary (LOW confidence)
- Whether same webhook signing secret is reused for Connect events vs needing a separate secret — requires empirical testing with Stripe CLI

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — No new packages needed; all Stripe API surface verified against official docs
- Architecture: HIGH — Patterns verified against current Stripe documentation; existing codebase patterns well understood
- Pitfalls: HIGH — cents/dollars pitfall and payment_intent_data nesting verified from official API reference; webhook config verified from official Connect webhooks docs
- Open questions: MEDIUM — Single webhook secret question requires test mode verification

**Research date:** 2026-03-11
**Valid until:** 2026-06-11 (Stripe API is stable; 90-day window appropriate)
