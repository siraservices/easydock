---
phase: 04-stripe-connect-payouts
plan: "03"
subsystem: payments-ui
tags: [stripe-connect, dashboard, webhooks, ui]
dependency_graph:
  requires: ["04-00", "04-01"]
  provides: ["stripe-connect-dashboard-ui", "login-link-api", "account-updated-webhook"]
  affects: ["src/app/dashboard/page.tsx", "src/app/api/connect/login-link/route.ts", "src/app/api/webhooks/stripe/route.ts"]
tech_stack:
  added: []
  patterns: ["Stripe Express login link", "account.updated webhook sync", "stripeStatus query param cleanup"]
key_files:
  created:
    - src/app/api/connect/login-link/route.ts
  modified:
    - src/app/dashboard/page.tsx
    - src/app/api/webhooks/stripe/route.ts
    - src/__tests__/connect-login-link.test.ts
    - src/__tests__/webhook-connect.test.ts
decisions:
  - "event.account used as connected account ID for account.updated webhook (Connect events include this); falls back to account.id"
  - "Marina cards changed from full <Link> wrapper to inner <Link> with sibling ConnectBanner/PayoutsButton components to allow button clicks without nav conflict"
  - "stripeStatus query param cleared via router.replace immediately after reading to keep URL clean"
  - "Webhook secret note: endpoint must be configured in Stripe Dashboard for 'Events on Connected accounts' to receive account.updated — this is a dashboard config step, not a code change"
metrics:
  duration: "2 min"
  completed_date: "2026-03-11"
  tasks_completed: 2
  files_modified: 5
---

# Phase 4 Plan 03: Stripe Connect Dashboard UI and Webhook Sync Summary

Stripe Connect UI added to marina dashboard — banner with Connect Stripe/Continue Setup button for unconnected marinas, green status badge and View Payouts button for connected marinas, login-link API route for Express Dashboard access, and account.updated webhook sync for payouts_enabled/stripe_onboarding_complete.

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Dashboard Connect banner, status badge, payout button | fc78f38 | src/app/dashboard/page.tsx |
| 2 | Login-link API route and account.updated webhook handler | 64e5357 | src/app/api/connect/login-link/route.ts, src/app/api/webhooks/stripe/route.ts, src/__tests__/connect-login-link.test.ts, src/__tests__/webhook-connect.test.ts |

## What Was Built

### Task 1: Dashboard UI

Updated `src/app/dashboard/page.tsx`:

- Extended `MarinaWithSlipCount` interface with `stripe_account_id`, `stripe_onboarding_complete`, `payouts_enabled`
- Updated Supabase query to fetch all three new stripe fields
- Added `ConnectBanner` component: amber card shown when `!payouts_enabled`; button says "Connect Stripe" (no account yet) or "Continue Setup" (account exists but incomplete); POSTs to `/api/connect/onboard`, then redirects via `window.location.href`
- Added `PayoutsButton` component: green dot + "Stripe Connected" text + outlined "View Payouts" button shown when `payouts_enabled=true`; POSTs to `/api/connect/login-link`, opens result URL in new tab
- Marina cards restructured from full `<Link>` wrapper to inner `<Link>` + sibling components so button clicks don't trigger nav
- Added `stripeStatus` query param handling: reads on mount, shows green or blue banner, removes param via `router.replace`

### Task 2: Login-link route and webhook extension

New `src/app/api/connect/login-link/route.ts`:
- Auth check via `createClient().auth.getUser()` — 401 if not authenticated
- Verifies marina ownership via `adminClient` query with `owner_id = user.id`
- Returns 400 with "Stripe account not fully connected" if `!stripe_account_id || !payouts_enabled`
- Calls `stripe.accounts.createLoginLink(marina.stripe_account_id)`
- Returns `{ url: loginLink.url }`

Extended `src/app/api/webhooks/stripe/route.ts` with `account.updated` case:
- Extracts `event.account` as connected account ID (falls back to `account.id`)
- Updates marinas table: `stripe_onboarding_complete = account.details_submitted`, `payouts_enabled = account.payouts_enabled` WHERE `stripe_account_id = connectedAccountId`
- Returns 500 on DB failure (Stripe retries); records event with `booking_id: null` on success

Test stubs in `connect-login-link.test.ts` and `webhook-connect.test.ts` replaced with real assertions — 12 tests total, all passing.

## Verification

- `npx tsc --noEmit` — passes (0 errors)
- `npx vitest run` on all 3 test files — 12/12 tests pass
- No regression in existing webhook-idempotency tests (5 tests still passing)

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written, with one structural adjustment:

**[Rule 2 - Correctness] Restructured marina cards from full-`<Link>` to inner-`<Link>` pattern**
- **Found during:** Task 1
- **Issue:** Plan's design placed ConnectBanner and PayoutsButton with onClick handlers inside a card wrapped by a `<Link>`, which causes click events on buttons to also trigger navigation
- **Fix:** Changed outer wrapper from `<Link>` to `<div>` with `hover:shadow-md` class; added `<Link>` as inner block element covering the card content; ConnectBanner and PayoutsButton sit as siblings outside the inner link
- **Files modified:** src/app/dashboard/page.tsx
- **Commit:** fc78f38

## Webhook Configuration Note

The `account.updated` webhook event requires the endpoint to be registered for "Events on Connected accounts" in the Stripe Dashboard. The webhook secret can be shared with the existing endpoint — this is a Stripe Dashboard configuration step, not a code change.

## Self-Check

- [x] src/app/dashboard/page.tsx — exists and modified
- [x] src/app/api/connect/login-link/route.ts — created
- [x] src/app/api/webhooks/stripe/route.ts — exists and modified
- [x] src/__tests__/connect-login-link.test.ts — updated, 4 tests pass
- [x] src/__tests__/webhook-connect.test.ts — updated, 3 tests pass
- [x] Commit fc78f38 — verified
- [x] Commit 64e5357 — verified
