# EasyDock Stripe Live-Mode Go-Live Checklist

> **When to use this:** The moment Julio/board completes Stripe business verification and live keys are available. Estimated execution time: ~60 minutes.

## Prerequisites

Before starting, confirm you have:
- `sk_live_…` Stripe secret key
- `pk_live_…` Stripe publishable key
- Access to [Stripe live dashboard](https://dashboard.stripe.com) (non-test mode)
- Access to [Vercel EasyDock project](https://vercel.com) → Settings → Environment Variables

---

## Step 1: Update Vercel Environment Variables (5 min)

In the Vercel dashboard → EasyDock project → Settings → Environment Variables:

| Variable | Old value | New value |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_…` | `sk_live_…` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` | `pk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | test signing secret | _see Step 2_ |

**Do not redeploy yet** — wait until Step 2 to get the live webhook secret.

---

## Step 2: Register Live Webhook in Stripe (5 min)

In the [Stripe live dashboard](https://dashboard.stripe.com) → Developers → Webhooks:

1. Click **Add endpoint**
2. Endpoint URL: `https://easydock.vercel.app/api/webhooks/stripe`
3. Events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `account.updated`
4. Click **Add endpoint**
5. Copy the **Signing secret** (starts with `whsec_live_…`)
6. Paste it as `STRIPE_WEBHOOK_SECRET` in Vercel (from Step 1)

---

## Step 3: Trigger Redeploy (2 min)

```bash
git -C /Users/julio/easydock commit --allow-empty -m "chore: activate Stripe live mode (EAS-118)" && git push
```

Or use Vercel dashboard → Deployments → **Redeploy** on latest commit.

Wait for Vercel to show ✅ **Ready** before continuing.

---

## Step 4: Smoke Test — Real Booking (20 min)

Use a **real card** (Visa/Mastercard, not test card `4242…`). Use the **lowest-price available slip** to minimize the test charge.

### 4a. Full booking flow
1. Go to [easydock.vercel.app](https://easydock.vercel.app) → Search → pick a marina with Stripe Connect enabled
2. Select a slip → choose 1-night dates → fill booking form
3. Complete Stripe checkout with a real card
4. Confirm redirect to `/bookings/{id}?success=true`

### 4b. Verify database update
In [Supabase dashboard](https://supabase.com) → SQL Editor, run:
```sql
SELECT id, status, stripe_payment_intent_id, total_price
FROM bookings
ORDER BY created_at DESC
LIMIT 1;
```
Expected: `status = 'confirmed'`, `stripe_payment_intent_id` is set.

### 4c. Verify webhook receipt
In Stripe live dashboard → Developers → Webhooks → click your endpoint → recent deliveries:
- `checkout.session.completed` → HTTP 200 ✅

### 4d. Issue test refund
In Stripe dashboard → Payments → find the charge → **Refund** (to avoid leaving a real pending charge).

In Supabase, the booking should remain `confirmed` (refund doesn't auto-cancel the booking record — that's intentional).

---

## Step 5: Verify Stripe Connect Payouts (5 min)

If a marina owner has completed Connect onboarding:
1. Stripe live dashboard → Connect → Accounts → find marina's account
2. Verify payout is scheduled (may show as pending for a few business days)
3. Confirm `platform_fee` appears correctly in the transfer

---

## Step 6: Monitor First 30 Minutes (ongoing)

Check for errors in:
- **Vercel**: Dashboard → Functions → check for 5xx on `/api/checkout`, `/api/webhooks/stripe`
- **Stripe**: Dashboard → Developers → Events → watch for failed webhook deliveries
- **Supabase**: Dashboard → Logs → watch for DB errors

---

## Step 7: Update Issue Status

Once smoke test passes:
1. Comment on **EAS-118** with the live Stripe `payment_intent` ID from the smoke test
2. Mark EAS-118 **done**
3. Comment on **EAS-7** (MVP parent) noting live mode is active

---

## Rollback Plan

If anything breaks:

### Instant rollback (2 min)
Revert Vercel env vars to test keys:
- `STRIPE_SECRET_KEY` → `sk_test_…`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_test_…`
- `STRIPE_WEBHOOK_SECRET` → test signing secret

Trigger redeploy. App returns to test mode immediately.

### What NOT to roll back
- Do NOT delete the live webhook endpoint (you'll need it for rescheduled events)
- Do NOT rollback Supabase data (bookings already confirmed stay confirmed)

---

## Known Limitations (test mode only)

The following features are stubbed in test mode and will activate automatically in live mode:
- Real payouts to marina owners via Stripe Connect
- Real card charges (test cards `4242…` will NOT work in live mode)
- Platform fee collection (EasyDock's 15% application fee)

---

## Contacts / Support

- **Stripe live dashboard**: https://dashboard.stripe.com
- **Vercel EasyDock**: https://vercel.com/julio-airas-projects/easydock
- **Supabase**: https://supabase.com/dashboard
- **Live app**: https://easydock.vercel.app
