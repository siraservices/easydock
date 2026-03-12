# Phase 1: Booking Hardening - Research

**Researched:** 2026-03-09
**Domain:** Payment security, database concurrency, webhook reliability (Stripe + Supabase/PostgreSQL)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Server computes price as `price_per_night × number of nights` — ignores any client-submitted totalPrice
- Flat nightly rate for now (no seasonal rates)
- EasyDock takes 15% fee, split between both sides (yacht owner pays a portion on top, marina absorbs a portion from payout)
- Checkout UI shows fee as a separate line item (Airbnb-style: subtotal + EasyDock service fee + total)
- Database transaction with row-level locking to prevent double-booking race condition
- Same-day turnover is OK (check-out day can equal next guest's check-in day — like hotels)
- On conflict: instant error "This slip is no longer available for those dates" — user returns to search
- No waitlist or alternative suggestions in this phase
- Webhook must be idempotent — track processed Stripe event IDs to prevent duplicate booking updates
- If DB write fails after Stripe charges customer: auto-refund the charge immediately
- Return appropriate HTTP status to Stripe (not always 200) so Stripe retries on real failures
- Stripe Checkout session expires after 30 minutes (configure `expires_after`)
- Rely on `checkout.session.expired` webhook to cancel stale pending bookings
- No additional cron job needed

### Claude's Discretion
- Exact transaction/locking mechanism (advisory lock, SELECT FOR UPDATE, or unique constraint)
- How to store processed Stripe event IDs (new table vs column)
- Refund error handling approach
- Whether to add a `platform_fee_amount` column to bookings now (for Phase 4 readiness)

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HARD-01 | Server calculates total price from slip rate and dates instead of trusting client-submitted price | Server reads `price_per_night` from slips table; `calculateNights()` utility already exists; fee math is deterministic |
| HARD-02 | Booking creation uses database transaction to prevent double-booking race condition on same slip/dates | PostgreSQL `SELECT FOR UPDATE` via Supabase RPC stored procedure; exclusive lock on slip row during conflict check + insert |
| HARD-03 | Stripe webhook handler verifies database write succeeded before returning 200 | Synchronous DB write + idempotency table; return 500 on DB failure (Stripe retries); return 200 only on success or already-processed |
</phase_requirements>

---

## Summary

This phase fixes three critical bugs in the existing checkout and webhook flow before any other feature work. The bugs are independently addressable but share a common thread: server-side trust. Currently, the checkout route trusts client-submitted `totalPrice`, runs availability check and booking insert as separate non-atomic operations, and the webhook handler returns 200 regardless of whether the database write succeeded.

The existing code structure is well-suited for these fixes. The checkout route (`src/app/api/checkout/route.ts`) already fetches the slip record server-side, so adding price calculation requires minimal change. The double-booking fix requires wrapping the conflict check and booking insert in a PostgreSQL function called via Supabase RPC — this is the only safe way to get atomic locking through Supabase's HTTP interface. The webhook fix requires a `stripe_processed_events` table and synchronous DB writes with proper error propagation.

The key architectural insight is the tension between Stripe's official guidance ("return 200 before complex logic") and the CONTEXT.md decision ("return appropriate HTTP status so Stripe retries on real failures"). These are reconcilable: idempotency is the safety net. We process synchronously, return 500 on real DB failures (Stripe retries), and the idempotency check prevents double-processing on retries. This pattern is safe at MVP scale where timeouts are not a concern.

**Primary recommendation:** Implement booking creation as a single PostgreSQL RPC function that does conflict check + row lock + insert atomically. This is the only approach that eliminates the race condition through Supabase's API layer.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| stripe (Node SDK) | ^20.4.0 (installed) | Stripe API calls, webhook verification, refunds | Already installed; used in checkout route |
| @supabase/supabase-js | ^2.47.12 (installed) | DB queries, RPC calls | Already installed; admin client available |
| PostgreSQL (Supabase) | Managed | Atomic transactions via stored procedures | Only way to get true row locking through Supabase HTTP API |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Next.js API routes | ^15.1.6 (installed) | Route handlers for checkout and webhook | Already the project pattern |
| @supabase/ssr | ^0.5.2 (installed) | Server-side Supabase client with cookie auth | Already the project convention |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| PostgreSQL RPC function for locking | Supabase JS `.select().eq()` + `.insert()` in sequence | Sequential Supabase calls cannot acquire row locks — race condition remains |
| Synchronous webhook processing | Async queue (SQS/BullMQ) | Queue adds infrastructure complexity; MVP scale doesn't warrant it |
| Separate `stripe_processed_events` table | Column on bookings | Table is cleaner and handles events not tied to a booking (e.g., future refund events) |

**Installation:** No new packages needed — all dependencies are already installed.

---

## Architecture Patterns

### Recommended Project Structure

No new directories needed. Changes are confined to:

```
src/
├── app/api/
│   ├── checkout/route.ts        # Rewrite: server-side pricing, RPC-based booking
│   └── webhooks/stripe/route.ts # Rewrite: idempotency check, error-aware responses
├── lib/
│   └── utils/
│       └── format.ts            # Already has calculateNights() — no changes needed
└── types/
    └── database.ts              # Add stripe_processed_events table type
database/
└── 003_booking_hardening.sql    # New migration: RPC function + stripe_processed_events table
```

### Pattern 1: Server-Side Price Calculation (HARD-01)

**What:** Server fetches slip from DB, calculates price using `price_per_night × calculateNights()`, adds 15% EasyDock fee split. Client-submitted `totalPrice` is ignored entirely.

**When to use:** Every checkout — always.

**Fee split (locked decision):** 15% total fee. Yacht owner pays a surcharge on top of the nightly rate, marina absorbs a deduction from their payout. For now (pre-Stripe Connect Phase 4), the total charged to the customer includes the yacht-owner portion of the fee. The marina's net payout is tracked for Phase 4.

**Example:**
```typescript
// In checkout/route.ts — server computes price, ignores body.totalPrice
const nights = calculateNights(checkIn, checkOut); // from src/lib/utils/format.ts
const basePrice = slip.price_per_night * nights;
const serviceFeeRate = 0.15;
// Split: yacht owner pays 8% surcharge, marina absorbs 7% deduction (example split)
const yachtOwnerFee = Math.round(basePrice * 0.08 * 100) / 100;
const totalChargedToCustomer = basePrice + yachtOwnerFee;
const marinaNet = Math.round(basePrice * (1 - 0.07) * 100) / 100;

// Stripe line items: two items or metadata — Airbnb-style breakdown in UI
const unitAmount = Math.round(totalChargedToCustomer * 100); // Stripe expects cents
```

**Note:** The exact fee split (8% yacht / 7% marina or another ratio) is Claude's discretion. The total is 15%. The planner should pick a concrete split.

### Pattern 2: Atomic Double-Booking Prevention via PostgreSQL RPC (HARD-02)

**What:** A PostgreSQL function that acquires a row-level lock on the slip, checks for date conflicts, and inserts the booking — all in one transaction. Called via `supabase.rpc()`.

**When to use:** Every booking creation.

**Why RPC is required:** The Supabase JavaScript client issues individual HTTP requests. Between a conflict-check `.select()` and a booking `.insert()`, another request can complete. The only way to make check + insert atomic through Supabase is to execute them in a single PostgreSQL function.

**Date conflict logic (same-day turnover allowed):**
- Conflict exists when: `existing.check_in < new.check_out AND existing.check_out > new.check_in`
- Same-day turnover OK: `existing.check_out = new.check_in` does NOT conflict (strict `<` and `>` operators)
- This matches the current code's `.lt("check_in", checkOut).gt("check_out", checkIn)` logic

**PostgreSQL RPC function pattern:**
```sql
-- In database/003_booking_hardening.sql
CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_slip_id UUID,
  p_marina_id UUID,
  p_boat_owner_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_total_price NUMERIC,
  p_vessel_name TEXT,
  p_vessel_length NUMERIC,
  p_vessel_type TEXT,
  p_special_requests TEXT,
  p_platform_fee_amount NUMERIC DEFAULT NULL
)
RETURNS TABLE(booking_id UUID, conflict BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking_id UUID;
  v_conflict BOOLEAN := FALSE;
BEGIN
  -- Lock the slip row to prevent concurrent booking attempts
  PERFORM id FROM slips WHERE id = p_slip_id FOR UPDATE;

  -- Check for date conflicts (same-day turnover allowed)
  SELECT EXISTS (
    SELECT 1 FROM bookings
    WHERE slip_id = p_slip_id
      AND status IN ('pending', 'approved', 'confirmed')
      AND check_in < p_check_out
      AND check_out > p_check_in
  ) INTO v_conflict;

  IF v_conflict THEN
    RETURN QUERY SELECT NULL::UUID, TRUE;
    RETURN;
  END IF;

  -- Insert booking
  INSERT INTO bookings (
    slip_id, marina_id, boat_owner_id, check_in, check_out,
    total_price, vessel_name, vessel_length, vessel_type,
    special_requests, platform_fee_amount, status
  ) VALUES (
    p_slip_id, p_marina_id, p_boat_owner_id, p_check_in, p_check_out,
    p_total_price, p_vessel_name, p_vessel_length, p_vessel_type,
    p_special_requests, p_platform_fee_amount, 'pending'
  )
  RETURNING id INTO v_booking_id;

  RETURN QUERY SELECT v_booking_id, FALSE;
END;
$$;
```

**Supabase RPC call:**
```typescript
// Source: https://supabase.com/docs/reference/javascript/rpc
const { data, error } = await adminClient.rpc('create_booking_atomic', {
  p_slip_id: slipId,
  p_marina_id: marinaId,
  p_boat_owner_id: user.id,
  p_check_in: checkIn,
  p_check_out: checkOut,
  p_total_price: totalChargedToCustomer,
  // ...other params
});

if (error) { /* return 500 */ }
if (data?.[0]?.conflict) {
  return NextResponse.json(
    { error: "This slip is no longer available for those dates" },
    { status: 409 }
  );
}
```

**Important:** The function uses `SECURITY DEFINER` so it executes with elevated privileges, bypassing RLS for the booking insert. This is safe because the function validates ownership internally. The admin client in checkout is appropriate here.

### Pattern 3: Idempotent Webhook Handler (HARD-03)

**What:** Store processed Stripe event IDs in a `stripe_processed_events` table. Check before processing; skip if already seen. Do DB writes synchronously and return 500 on failure (so Stripe retries with the same event ID, which will then be deduped).

**When to use:** Every webhook event.

**The retry pattern reconciliation:**
Stripe docs say "return 200 before complex logic." The CONTEXT.md says "return appropriate HTTP status so Stripe retries on real failures." These coexist because:
1. We process synchronously (MVP scale — no timeout risk for simple DB writes)
2. We return 200 only on success or "already processed" (idempotent)
3. We return 500 on actual DB failure so Stripe retries
4. On retry, the idempotency check prevents double-processing if the first attempt partially succeeded

**stripe_processed_events table:**
```sql
-- In database/003_booking_hardening.sql
CREATE TABLE stripe_processed_events (
  id TEXT PRIMARY KEY,          -- Stripe event ID (e.g., evt_xxx)
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  booking_id UUID REFERENCES bookings(id)
);
```

**Webhook handler pattern:**
```typescript
// Source: Stripe docs https://docs.stripe.com/webhooks
// 1. Verify signature (return 400 on failure — Stripe won't retry bad signatures)
// 2. Check idempotency
const { data: existing } = await adminClient
  .from('stripe_processed_events')
  .select('id')
  .eq('id', event.id)
  .single();

if (existing) {
  return NextResponse.json({ received: true }); // already processed — 200
}

// 3. Process event (synchronous DB write)
switch (event.type) {
  case 'checkout.session.completed': {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;
    const paymentIntentId = session.payment_intent as string;

    const { error } = await adminClient
      .from('bookings')
      .update({ status: 'confirmed', stripe_payment_intent_id: paymentIntentId })
      .eq('id', bookingId);

    if (error) {
      // DB write failed — auto-refund the charge
      try {
        await stripe.refunds.create({ payment_intent: paymentIntentId });
      } catch (refundErr) {
        console.error('Auto-refund failed:', refundErr);
        // Log but still return 500 so Stripe retries the original event
      }
      return NextResponse.json({ error: 'DB write failed' }, { status: 500 });
    }
    break;
  }
  // ...
}

// 4. Record event as processed
await adminClient.from('stripe_processed_events').insert({
  id: event.id,
  event_type: event.type,
  booking_id: bookingId ?? null,
});

return NextResponse.json({ received: true }); // 200 only after success
```

**HTTP status semantics:**
- `400` — Invalid signature (not a Stripe retry scenario — bad request)
- `200` — Success or already processed
- `500` — DB write failed — Stripe will retry with exponential backoff (up to 3 days in live mode)

### Anti-Patterns to Avoid

- **Trust client price:** Never use `body.totalPrice` — always compute from DB slip record
- **Sequential check then insert without locking:** The existing `select conflicts` then `insert booking` pattern has a TOCTOU (time-of-check-time-of-use) race condition — two requests can both pass the check before either inserts
- **Return 200 from webhook before DB write:** Without idempotency + retry, this means silent data loss when DB fails
- **Unique constraint alone on bookings:** A partial unique index for non-overlapping date ranges in PostgreSQL is complex (requires range types or exclusion constraints). Row locking via RPC is simpler and more readable for this use case

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Stripe webhook signature verification | Custom HMAC verification | `stripe.webhooks.constructEvent()` | Handles timing attacks, encoding, version differences |
| Stripe refund | Manual charge reversal | `stripe.refunds.create({ payment_intent })` | Handles partial refunds, already-refunded errors, idempotency keys |
| Date overlap detection | Custom date math | PostgreSQL `check_in < p_check_out AND check_out > p_check_in` | SQL handles edge cases natively in the same transaction |
| Idempotency key generation | UUID or hash | Stripe event ID (`event.id` — e.g., `evt_xxx`) is already a unique idempotency key | Stripe guarantees event ID uniqueness |

**Key insight:** The tricky parts of payment hardening (signature verification, refund mechanics, date overlap SQL) all have standard, battle-tested implementations. The only custom logic needed is the composition of these primitives.

---

## Common Pitfalls

### Pitfall 1: TOCTOU Race Condition in Sequential Supabase Calls
**What goes wrong:** Check for conflicts in one `.select()` call, then insert booking in a separate `.insert()` call. Two concurrent requests both pass the conflict check before either inserts, creating a double-booking.
**Why it happens:** Supabase's JavaScript client issues separate HTTP requests. No shared transaction context exists between them.
**How to avoid:** Use `supabase.rpc()` to call a PostgreSQL function that does both operations in a single transaction with `SELECT FOR UPDATE` locking.
**Warning signs:** High-traffic slips on popular dates; manual testing with concurrent browser tabs.

### Pitfall 2: `SECURITY DEFINER` RPC Function Bypasses RLS Unexpectedly
**What goes wrong:** The RPC function runs as the function owner (usually `postgres`), so it can bypass RLS on all tables it touches, including tables you didn't intend.
**Why it happens:** `SECURITY DEFINER` is required to do the insert when called by a non-admin user, but it's a broad permission grant.
**How to avoid:** Validate `p_boat_owner_id` matches the authenticated user inside the function. Or call the RPC via the admin client (which already bypasses RLS) and validate auth in the API route before calling RPC.
**Warning signs:** Bookings created for arbitrary user IDs by unauthorized users.

### Pitfall 3: Stripe Session `expires_at` vs `expires_after`
**What goes wrong:** The Stripe API parameter is `expires_at` (Unix timestamp), not `expires_after` (duration). Passing duration in seconds directly will silently set a timestamp equal to `Date.now() + 1800` seconds in epoch format — which is a date in 1970.
**Why it happens:** Naming confusion. CONTEXT.md says "configure `expires_after`" but the Stripe API uses `expires_at`.
**How to avoid:** Use `expires_at: Math.floor(Date.now() / 1000) + 1800` (30 minutes from now as Unix timestamp). Range: 30 minutes to 24 hours. Default is 24 hours.
**Warning signs:** Sessions immediately expiring or not expiring at 30 minutes.

### Pitfall 4: Refund Race on Webhook Retry
**What goes wrong:** First webhook delivery: DB write fails, auto-refund issued, 500 returned. Second webhook delivery (Stripe retry): idempotency check finds no processed event (because we never inserted it), DB write succeeds — but the money was already refunded.
**Why it happens:** Refund was issued but event was never marked as processed.
**How to avoid:** On DB write failure, attempt refund but do NOT insert into `stripe_processed_events`. On next retry, Stripe sends same event, we try DB write again. If DB is back up, write succeeds, no refund is issued. The refund from the failed attempt is already done — but the payment is also back — Stripe will have both a charge and a refund; the net is zero, and the new successful charge will come from the retry's Stripe session being already completed. Wait — actually the session is already completed at this point. The payment_intent has captured. A refund reverses it. On retry, we'd update the booking to confirmed again but money has been refunded.
**The correct approach:** Auto-refund is a last resort for catastrophic DB failure. In practice: try the DB write 1-2 times with brief retry before refunding. Only refund if all retries fail. Log prominently for manual review. For MVP, the risk of this exact race is acceptable with good monitoring.
**Warning signs:** Bookings in `confirmed` status with corresponding Stripe refunds in the dashboard.

### Pitfall 5: `calculateNights()` Minimum of 1
**What goes wrong:** `calculateNights()` in `src/lib/utils/format.ts` returns `Math.max(1, ...)`. A same-day booking (check_in === check_out) returns 1 night. This may be intentional but could surprise users who enter identical dates.
**Why it happens:** The utility was written with a minimum of 1 to avoid zero-price bookings.
**How to avoid:** Validate in the API route that `checkOut > checkIn` and return 400 if equal. The minimum-1 guard is then never hit.
**Warning signs:** Zero-night bookings charged for 1 night.

---

## Code Examples

Verified patterns from official sources:

### Stripe Refund (payment_intent)
```typescript
// Source: https://docs.stripe.com/api/refunds/create
const refund = await stripe.refunds.create({
  payment_intent: paymentIntentId,
  reason: 'requested_by_customer',
});
```

### Stripe Checkout Session with 30-Minute Expiry
```typescript
// Source: https://docs.stripe.com/api/checkout/sessions/create
// expires_at is a Unix timestamp — NOT a duration
const session = await stripe.checkout.sessions.create({
  expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
  // ...
});
```

### Supabase RPC Call
```typescript
// Source: https://supabase.com/docs/reference/javascript/rpc
const { data, error } = await supabase.rpc('create_booking_atomic', {
  p_slip_id: slipId,
  p_total_price: computedTotal,
  // ... other params
});
```

### Stripe Webhook Signature Verification
```typescript
// Source: https://docs.stripe.com/webhooks
const body = await request.text(); // MUST be raw text, not parsed JSON
const sig = request.headers.get('stripe-signature')!;
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
```

### Platform Fee Breakdown for Stripe Line Items
```typescript
// Airbnb-style breakdown — two line items
const baseAmount = Math.round(basePrice * 100);     // e.g., $200.00 → 20000
const feeAmount = Math.round(yachtOwnerFee * 100);  // e.g., $16.00 → 1600

const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: { name: `${slip.name} at ${marina.name}`, description: `${checkIn} to ${checkOut}` },
        unit_amount: baseAmount,
      },
      quantity: 1,
    },
    {
      price_data: {
        currency: 'usd',
        product_data: { name: 'EasyDock service fee' },
        unit_amount: feeAmount,
      },
      quantity: 1,
    },
  ],
  // ...
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-submitted price (current code) | Server-computed price from DB | This phase | Eliminates price tampering |
| Sequential check + insert (current code) | Atomic RPC transaction | This phase | Eliminates race condition |
| Webhook always returns 200 (current code) | 200 on success, 500 on DB failure | This phase | Enables meaningful Stripe retries |

**No deprecated APIs in play:** Stripe SDK v20 is current; `checkout.sessions.create` and `refunds.create` APIs are stable.

---

## Open Questions

1. **Exact fee split ratio (8%/7% or other)**
   - What we know: Total is 15%; yacht owner pays surcharge on top, marina absorbs deduction from payout
   - What's unclear: The exact per-side ratio (e.g., 8% + 7%, or 10% + 5%)
   - Recommendation: Planner should pick a concrete ratio. Phase 4 Stripe Connect will need this to compute `application_fee_amount`. Storing `platform_fee_amount` on the booking now makes Phase 4 easier.

2. **Should `create_booking_atomic` use admin client or user client?**
   - What we know: `SECURITY DEFINER` functions bypass RLS; the checkout route already has access to the user's identity via Supabase auth
   - What's unclear: Whether to validate the user inside the RPC or in the route before calling RPC
   - Recommendation: Validate auth in the API route (user must be authenticated), then call RPC via admin client. The function accepts `p_boat_owner_id` explicitly; set it from `user.id` in the route, not from the client body.

3. **`platform_fee_amount` column on bookings**
   - What we know: Phase 4 needs to know EasyDock's fee per booking for Stripe Connect transfers
   - What's unclear: Whether adding this column now is worth the migration complexity
   - Recommendation: Add it. The migration is trivial (nullable column), and it avoids a Phase 4 schema migration mid-feature. Store the total platform fee (e.g., 15% of base price).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed — Wave 0 must add Vitest |
| Config file | `vitest.config.ts` — Wave 0 creates this |
| Quick run command | `npx vitest run --reporter=verbose src/__tests__/` |
| Full suite command | `npx vitest run` |

**Why Vitest over Jest:** Next.js 15 + TypeScript projects use Vitest as the de facto standard in 2025. It requires no Babel config, supports ESM natively, and is the test runner recommended in the Next.js docs for unit tests. No additional transpilation config is needed.

**Installation (Wave 0):**
```bash
npm install -D vitest @vitejs/plugin-react
```

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HARD-01 | Server ignores client price, computes from slip.price_per_night × nights | unit | `npx vitest run src/__tests__/checkout-pricing.test.ts` | Wave 0 |
| HARD-01 | Fee math: 15% total, correct split, Stripe amounts in cents | unit | `npx vitest run src/__tests__/checkout-pricing.test.ts` | Wave 0 |
| HARD-02 | Conflict detection SQL: overlapping dates return conflict=true | integration | Manual — requires live Supabase | Wave 0 (manual) |
| HARD-02 | Same-day turnover: check_out == next check_in is NOT a conflict | integration | Manual — requires live Supabase | Wave 0 (manual) |
| HARD-03 | Duplicate event ID returns 200 without re-processing | unit | `npx vitest run src/__tests__/webhook-idempotency.test.ts` | Wave 0 |
| HARD-03 | Webhook returns 500 when DB write fails | unit | `npx vitest run src/__tests__/webhook-idempotency.test.ts` | Wave 0 |
| HARD-03 | Webhook returns 400 on invalid Stripe signature | unit | `npx vitest run src/__tests__/webhook-idempotency.test.ts` | Wave 0 |

**Note on integration tests:** HARD-02 requires a PostgreSQL transaction that cannot be mocked. These are marked manual-only for this phase. The RPC function SQL itself should be reviewed directly in Supabase SQL Editor with concurrent connections.

### Sampling Rate
- **Per task commit:** `npx vitest run src/__tests__/`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** All unit tests green + manual double-booking scenario verified before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` — test runner config
- [ ] `src/__tests__/checkout-pricing.test.ts` — covers HARD-01 fee math and price calculation logic
- [ ] `src/__tests__/webhook-idempotency.test.ts` — covers HARD-03 idempotency, 500 on failure, 400 on bad sig
- [ ] Install: `npm install -D vitest @vitejs/plugin-react`

---

## Sources

### Primary (HIGH confidence)
- Stripe Webhooks Docs (https://docs.stripe.com/webhooks) — retry behavior, HTTP status semantics, signature verification
- Stripe Refunds API (https://docs.stripe.com/api/refunds/create) — refund by payment_intent pattern
- Stripe Checkout Sessions API (https://docs.stripe.com/api/checkout/sessions/create) — `expires_at` parameter (Unix timestamp, 30min–24hr range)
- Supabase RPC Docs (https://supabase.com/docs/reference/javascript/rpc) — `.rpc()` call syntax
- PostgreSQL Explicit Locking Docs (https://www.postgresql.org/docs/current/explicit-locking.html) — `SELECT FOR UPDATE` semantics

### Secondary (MEDIUM confidence)
- Advisory locks for Supabase pattern (https://supaexplorer.com/best-practices/supabase-postgres/lock-advisory/) — confirmed against PostgreSQL official docs
- Stigg Stripe webhook best practices article (https://www.stigg.io/blog-posts/best-practices-i-wish-we-knew-when-integrating-stripe-webhooks) — idempotency table pattern, verified against Stripe official docs
- PostgreSQL race condition patterns (https://dev.to/mistval/winning-race-conditions-with-postgresql-54gn) — SELECT FOR UPDATE and constraint patterns

### Tertiary (LOW confidence)
- None — all critical claims verified against official sources

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies already installed; versions confirmed in package.json
- Architecture: HIGH — patterns verified against Stripe official docs and PostgreSQL docs
- Pitfalls: HIGH — derived from reading existing code + official documentation; no unverified claims
- Validation architecture: MEDIUM — Vitest as recommended framework is well-established but not verified against an official Next.js 15 recommendation page

**Research date:** 2026-03-09
**Valid until:** 2026-06-09 (stable APIs; Stripe and Supabase rarely break these interfaces)
