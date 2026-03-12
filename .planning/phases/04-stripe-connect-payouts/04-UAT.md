---
status: complete
phase: 04-stripe-connect-payouts
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md]
started: 2026-03-11T22:30:00Z
updated: 2026-03-11T22:42:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running dev server. Run `npm run dev` from scratch. Server boots without errors at localhost:3000. Homepage loads with marina listings visible.
result: issue
reported: "It looks like the homepage isn't loading marina listings."
severity: major

### 2. Connect Stripe Button (Unconnected Marina)
expected: Navigate to /dashboard as a marina owner. Each marina card that hasn't connected Stripe shows an amber banner with a "Connect Stripe" button. Clicking it should POST to /api/connect/onboard and redirect you to a Stripe Express onboarding page.
result: issue
reported: "Runtime Error: Acquiring an exclusive Navigator LockManager lock 'lock:sb-ompeoptbtfszxedbamxz-auth-token' timed out waiting 10000ms. Dashboard fails to load."
severity: blocker

### 3. Return from Stripe Onboarding
expected: After completing (or partially completing) Stripe Express onboarding, you're redirected back to /dashboard with a query param like ?stripeStatus=connected or ?stripeStatus=pending. A success (green) or pending (blue) banner briefly appears, then the query param is cleared from the URL.
result: issue
reported: "No sign-up or login button on the home page to access the dashboard. Auth buttons missing from nav."
severity: blocker

### 4. Continue Setup (Incomplete Onboarding)
expected: If a marina started onboarding but didn't finish, the amber banner shows "Continue Setup" instead of "Connect Stripe". Clicking it generates a new onboarding link (reuses the existing Stripe account) and redirects to Stripe.
result: skipped
reason: Blocked by test 3 — no auth buttons to reach dashboard

### 5. Stripe Connected Badge & Payouts Button
expected: For a marina with completed Connect onboarding, the dashboard card shows a green dot with "Stripe Connected" text and an outlined "View Payouts" button. No amber banner is shown.
result: skipped
reason: Blocked by test 3 — no auth buttons to reach dashboard

### 6. View Payouts (Express Dashboard)
expected: Clicking "View Payouts" on a connected marina opens the Stripe Express Dashboard in a new browser tab via a login link.
result: skipped
reason: Blocked by test 3 — no auth buttons to reach dashboard

### 7. Checkout with Connected Marina
expected: Book a slip at a marina that has completed Stripe Connect. The checkout session should be created successfully (redirecting to Stripe Checkout). The charge should include a 15% platform fee split — visible in Stripe Dashboard as application_fee_amount with transfer_data.destination set to the marina's connected account.
result: skipped
reason: Blocked by test 3 — requires auth to book

### 8. Checkout Blocked for Unconnected Marina
expected: Attempt to book a slip at a marina that hasn't connected Stripe. The booking widget shows an error message like "not currently accepting online payments" instead of proceeding to checkout.
result: skipped
reason: Blocked by test 3 — requires auth to book

## Summary

total: 8
passed: 0
issues: 3
pending: 0
skipped: 5

## Gaps

- truth: "Homepage loads with marina listings visible after cold start"
  status: failed
  reason: "User reported: It looks like the homepage isn't loading marina listings."
  severity: major
  test: 1
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
- truth: "Navigate to /dashboard as marina owner, see amber Connect Stripe banner, click to start Express onboarding"
  status: failed
  reason: "User reported: Runtime Error: Acquiring an exclusive Navigator LockManager lock 'lock:sb-ompeoptbtfszxedbamxz-auth-token' timed out waiting 10000ms. Dashboard fails to load."
  severity: blocker
  test: 2
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
- truth: "Auth buttons (Log In / Sign Up) visible in nav to access dashboard and authenticated features"
  status: failed
  reason: "User reported: No sign-up or login button on the home page to access the dashboard. Auth buttons missing from nav."
  severity: blocker
  test: 3
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
