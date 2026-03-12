---
phase: 05-booking-lifecycle-and-notifications
plan: 01
subsystem: booking-lifecycle
tags: [bookings, dashboard, approve, deny, status-banner, tdd]
dependency_graph:
  requires: []
  provides: [approve-api, deny-api, dashboard-bookings-tab, booking-status-banner]
  affects: [dashboard, booking-detail]
tech_stack:
  added: []
  patterns: [tdd-red-green, mockState-pattern, supabase-rls-enforcement]
key_files:
  created:
    - src/app/api/bookings/[id]/approve/route.ts
    - src/app/api/bookings/[id]/deny/route.ts
    - src/__tests__/booking-approve.test.ts
    - src/__tests__/booking-deny.test.ts
  modified:
    - src/app/dashboard/page.tsx
    - src/app/bookings/[id]/page.tsx
    - src/app/bookings/page.tsx
    - src/app/slips/[id]/page.tsx
decisions:
  - "Approve route uses user Supabase client (not admin) so RLS enforces marina ownership on UPDATE"
  - "Deny sets status to 'declined' (not 'denied') matching the DB enum value"
  - "Status banner hidden when ?success=true to avoid competing with Stripe success flow"
  - "update({} as never) pattern used to satisfy Supabase v12 TypeScript generics — matches existing webhook route pattern"
metrics:
  duration: "7 min"
  completed: "2026-03-12"
  tasks_completed: 3
  files_changed: 8
---

# Phase 5 Plan 01: Marina Booking Inbox and Status Banner Summary

Marina owner booking inbox (approve/deny) with dashboard Bookings tab, RLS-enforced API routes, and colored status banner on booking detail page.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 (TDD RED) | Failing tests for approve/deny routes | 4ea9f4b |
| 1 (TDD GREEN) | Approve/deny API routes passing all tests | 794b15f |
| 2 | Dashboard Bookings tab with approve/deny workflow | 2e3df09 |
| 3 | Booking detail page colored status banner | c5790bc |

## What Was Built

**Approve API** (`POST /api/bookings/[id]/approve`): Authenticates user, updates booking status to `approved` using the user Supabase client so RLS enforces marina ownership. Returns 401 for unauthenticated, 404 if booking not found or user is not the marina owner.

**Deny API** (`POST /api/bookings/[id]/deny`): Same pattern, sets status to `declined`.

**Dashboard Bookings Tab**: Top-level Marinas/Bookings tab switcher. Bookings tab fetches all bookings across the marina owner's marinas. Pending/Active/Past sub-tabs with badge count. Pending cards show Approve (teal) and Deny (red outline) buttons. Clicking either calls the API, updates local state, and shows a toast notification with 3-second auto-dismiss.

**Status Banner**: Colored banner at top of booking detail page (above the Booking Confirmation header). Yellow for pending, blue for approved, green for confirmed, red for cancelled/declined, gray for completed. Hidden when `?success=true` to let the Stripe success flow take precedence.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed pre-existing TypeScript errors blocking build**
- **Found during:** Task 2 build verification
- **Issue:** Three files used `query as Promise<...>` for Supabase query types, which broke with Supabase v12 TypeScript generics. The Supabase `PostgrestFilterBuilder` no longer overlaps with `Promise<...>` directly.
- **Fix:** Changed to `query as unknown as Promise<...>` — the correct double-cast pattern. Also applied `{ status: "..." } as never` to the `.update()` call in the API routes (matching the existing pattern in the webhook route).
- **Files modified:** `src/app/bookings/page.tsx`, `src/app/slips/[id]/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/api/bookings/[id]/approve/route.ts`, `src/app/api/bookings/[id]/deny/route.ts`
- **Commit:** 2e3df09

## Decisions Made

- Approve/deny use the user Supabase client (not admin) — RLS on bookings table scopes UPDATE to marina owners, so unauthorized updates return no rows and the route returns 404
- `declined` status used for deny (not `denied`) — this is the correct DB enum value
- No confirmation dialog for approve/deny — per plan specification
- Status banner suppressed when `?success=true` to avoid competing with Stripe flow success messages

## Self-Check

- [x] `src/app/api/bookings/[id]/approve/route.ts` — exists
- [x] `src/app/api/bookings/[id]/deny/route.ts` — exists
- [x] `src/__tests__/booking-approve.test.ts` — exists, 3 tests pass
- [x] `src/__tests__/booking-deny.test.ts` — exists, 3 tests pass
- [x] `src/app/dashboard/page.tsx` — Bookings tab added
- [x] `src/app/bookings/[id]/page.tsx` — status banner added
- [x] Build: `npx next build` succeeds with no errors
- [x] Commits: 4ea9f4b, 794b15f, 2e3df09, c5790bc — all exist
