---
phase: 05-booking-lifecycle-and-notifications
plan: 03
subsystem: email-notifications
tags: [resend, react-email, transactional-email, booking-lifecycle]
dependency_graph:
  requires: [05-01, 05-02]
  provides: [email-notifications]
  affects: [checkout-route, approve-route, deny-route, cancel-route]
tech_stack:
  added: [resend, "@react-email/components"]
  patterns: [lazy-init-singleton, non-fatal-fire-and-forget, admin-client-rls-bypass]
key_files:
  created:
    - src/lib/email/send.ts
    - src/emails/booking-created.tsx
    - src/emails/booking-approved.tsx
    - src/emails/booking-denied.tsx
    - src/emails/booking-cancelled.tsx
    - src/__tests__/email-send.test.ts
  modified:
    - src/app/api/checkout/route.ts
    - src/app/api/bookings/[id]/approve/route.ts
    - src/app/api/bookings/[id]/deny/route.ts
    - src/app/api/bookings/[id]/cancel/route.ts
    - src/__tests__/booking-approve.test.ts
    - src/__tests__/booking-deny.test.ts
    - src/__tests__/booking-cancel.test.ts
    - src/__tests__/checkout-connect.test.ts
decisions:
  - "Lazy-initialize Resend client to avoid constructor throw at Next.js build time when RESEND_API_KEY is absent"
  - "Mock @/lib/email/send entirely in existing route tests rather than expanding admin client mocks — keeps test scope minimal"
  - "fetchBookingEmailParams uses adminClient to bypass RLS for cross-user profile email lookups"
metrics:
  duration: "7 min"
  completed: "2026-03-12"
  tasks: 2
  files: 14
---

# Phase 5 Plan 3: Email Notifications Summary

**One-liner:** Resend transactional emails with React Email templates for all 4 booking events, wired non-fatally into checkout/approve/deny/cancel API routes.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install deps, create email templates and send helper with tests | 49d9100 | 6 created |
| 2 | Integrate email sends into all booking API routes | 9c56b60 | 8 modified |

## What Was Built

### Email Send Helper (`src/lib/email/send.ts`)
- `sendBookingEmail(trigger, params)` — sends to correct recipients per event:
  - `created` / `cancelled`: both boat owner and marina owner
  - `approved` / `denied`: boat owner only
- `fetchBookingEmailParams(adminClient, bookingId)` — fetches booking + slip + marina + both party emails via admin client (bypasses RLS)
- Lazy Resend initialization via singleton pattern (avoids build-time constructor failure)
- All errors caught and logged — never throws, never blocks API response

### React Email Templates (4 files in `src/emails/`)
- EasyDock branding: navy (#1e3a5f) header, white body, light gray (#f5f7fa) background
- Teal (#0d9488) CTA button and accent — except denied/cancelled which use amber/red accents for visual distinction
- Booking details card with slip name, marina, check-in/out, price
- "View Booking" button links to `NEXT_PUBLIC_APP_URL/bookings/{bookingId}`
- Inline styles throughout (email client compatibility)

### API Route Integration
- `checkout/route.ts`: sends `created` email after bookingId confirmed, before Stripe session URL returned
- `approve/route.ts`: sends `approved` email after DB update succeeds
- `deny/route.ts`: sends `denied` email after DB update succeeds
- `cancel/route.ts`: sends `cancelled` email after DB update + Stripe refund

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Resend constructor throws at build time without API key**
- **Found during:** Task 2 (build verification)
- **Issue:** `new Resend(process.env.RESEND_API_KEY)` at module load throws when `RESEND_API_KEY` is undefined — Next.js build-time page data collection triggered this
- **Fix:** Converted to lazy singleton pattern — `getResend()` instantiates only on first email send, not at module load
- **Files modified:** `src/lib/email/send.ts`
- **Commit:** 9c56b60

**2. [Rule 3 - Blocking] Existing route tests failed after email integration**
- **Found during:** Task 2 (full test suite run)
- **Issue:** `booking-approve`, `booking-deny`, `booking-cancel`, `checkout-connect` tests imported routes that now import `@/lib/email/send`, which creates `new Resend(undefined)` — test environment has no `RESEND_API_KEY`
- **Fix:** Added `vi.mock('@/lib/email/send', ...)` stubs to all 4 affected test files
- **Files modified:** `src/__tests__/booking-approve.test.ts`, `booking-deny.test.ts`, `booking-cancel.test.ts`, `checkout-connect.test.ts`
- **Commit:** 9c56b60

## Verification Results

- `npx vitest run src/__tests__/email-send.test.ts` — 8/8 tests pass
- `npx vitest run src/__tests__/` — 97/97 tests pass (no regressions)
- `npx next build` — build succeeds, all routes compiled

## User Setup Required

Before emails will send in production:

1. **Resend account**: Create API key at [resend.com](https://resend.com) dashboard
2. **Set env vars**:
   - `RESEND_API_KEY=re_...` (Resend Dashboard -> API Keys)
   - `NEXT_PUBLIC_APP_URL=https://easydock.netlify.app` (used in "View Booking" links)
3. **Verify domain**: Add DNS records for `easydock.com` in Resend Dashboard -> Domains to send from `bookings@easydock.com`

## Self-Check: PASSED

Files created:
- `src/lib/email/send.ts` — FOUND
- `src/emails/booking-created.tsx` — FOUND
- `src/emails/booking-approved.tsx` — FOUND
- `src/emails/booking-denied.tsx` — FOUND
- `src/emails/booking-cancelled.tsx` — FOUND
- `src/__tests__/email-send.test.ts` — FOUND

Commits:
- `49d9100` — FOUND
- `9c56b60` — FOUND
