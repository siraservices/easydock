---
phase: 02-landing-page-and-marina-onboarding
plan: "03"
subsystem: marina-dashboard
tags: [calendar, availability, ui, tdd]
dependency_graph:
  requires: []
  provides: [availability-calendar-component, marina-detail-calendar-section]
  affects: [src/app/dashboard/marinas/[id]/page.tsx]
tech_stack:
  added: []
  patterns: [pure-function-export-for-testing, string-based-date-comparison, details-collapsible]
key_files:
  created:
    - src/components/availability-calendar.tsx
    - src/__tests__/availability-calendar.test.ts
  modified:
    - src/app/dashboard/marinas/[id]/page.tsx
    - src/types/database.ts
decisions:
  - "isDayBooked accepts YYYY-MM-DD strings (not Date objects) to avoid timezone ambiguity between test environments (UTC midnight from ISO parse) and calendar construction (local midnight from new Date(y,m,d))"
  - "Used <details open> collapsible for calendar section — native HTML, no JS state needed, open by default"
  - "database.ts marina_leads type committed as part of build fix (pre-existing gap from phase 2 planning work)"
metrics:
  duration: 5 min
  completed_date: "2026-03-10"
  tasks_completed: 2
  files_created: 2
  files_modified: 2
---

# Phase 2 Plan 03: Availability Calendar Summary

**One-liner:** Read-only monthly availability calendar with pure `isDayBooked` string comparison, slip selector, month navigation, and green/red color coding wired into marina detail page.

## What Was Built

### AvailabilityCalendar component (`src/components/availability-calendar.tsx`)

- `"use client"` React component accepting `slips: {id, name}[]` and `marinaId: string`
- Slip selector `<select>` dropdown to switch between slips
- Month navigation with left/right arrow buttons and "Month YYYY" heading
- 7-column calendar grid (Sun-Sat headers, leading empty cells for alignment)
- Day coloring: `bg-green-50 text-green-700` (open) or `bg-red-100 text-red-700` (booked)
- Legend with colored squares and Open/Booked labels
- Supabase fetch filters: `neq("status", "cancelled")`, `neq("status", "declined")`, `gte("check_out", startOfMonth)`, `lte("check_in", endOfMonth)`
- Exported `isDayBooked(dayStr: string, bookings: Booking[]): boolean` pure function

### Test suite (`src/__tests__/availability-calendar.test.ts`)

8 tests covering:
- Day on check_in date → booked
- Day on check_out date → NOT booked (same-day turnover)
- Day between check_in and check_out → booked
- Day before check_in → not booked
- Day after check_out → not booked
- Empty bookings array → not booked
- Multiple bookings, day overlaps one → booked
- Day in gap between bookings → not booked

### Marina detail page update (`src/app/dashboard/marinas/[id]/page.tsx`)

- Imports `AvailabilityCalendar`
- Renders `<details open>` section with "Slip Availability" header below slips card
- Only renders when `slips.length > 0`
- Passes `slips.map(s => ({id: s.id, name: s.name}))` and `marinaId={id}`

## Decisions Made

1. **String-based date comparison in isDayBooked** — `new Date('2026-03-10')` parses as midnight UTC but `new Date(year, month, day)` is local midnight. To eliminate timezone ambiguity, `isDayBooked` accepts `YYYY-MM-DD` strings and the calendar builds date strings directly with `buildDateStr(year, month, day)`. Comparison is pure lexicographic: `check_in <= dayStr < check_out`.

2. **`<details open>` collapsible** — Research recommended collapsible section for calendar. Used native HTML `<details>` element, no JS toggle state needed, defaults open.

3. **`marinaId` prop kept for future use** — Named `_marinaId` in destructuring to suppress lint warning while preserving the prop interface for future filtering or audit purposes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed timezone ambiguity in isDayBooked date comparison**
- **Found during:** Task 1 GREEN phase — 2 tests failed after first implementation
- **Issue:** `toDateStr(d)` used `getUTCDate()` for calendar days built with `new Date(year, month, day)` (local time), causing off-by-one in UTC-behind timezones. `isDayBooked(new Date('2026-03-10'), ...)` returned false because UTC getter on local-midnight Date was wrong day.
- **Fix:** Changed `isDayBooked` to accept `string` (YYYY-MM-DD) instead of `Date`. Calendar builds strings directly via `buildDateStr`. Tests pass strings directly. No timezone conversion needed.
- **Files modified:** `src/components/availability-calendar.tsx`, `src/__tests__/availability-calendar.test.ts`
- **Commit:** 0f97981

**2. [Rule 3 - Blocking] Fixed pre-existing marina_leads type gap in database.ts**
- **Found during:** Task 2 build verification — `leads/route.ts` referenced `marina_leads` table not in `database.ts`
- **Issue:** Prior phase 2 planning work added `leads/route.ts` referencing a `marina_leads` table, but the working tree already had `database.ts` updated with the type — it just hadn't been committed yet.
- **Fix:** Committed the `database.ts` addition of `marina_leads` Row/Insert/Update types separately.
- **Files modified:** `src/types/database.ts`
- **Commit:** a0fa093

### Build Note

`npx next build` produces a `/500` prerender error unrelated to this plan (export configuration for `/500` error page). TypeScript type checking (`npx tsc --noEmit`) passes cleanly. The prerender error is a pre-existing infrastructure issue deferred per scope boundary rules.

## Verification Results

- `npx vitest run src/__tests__/availability-calendar.test.ts` — 8/8 tests pass
- `npx tsc --noEmit` — no errors
- `npx next build` — compiled and type-checked successfully; prerender error on `/500` is pre-existing

## Self-Check: PASSED

All created files exist on disk. All task commits verified in git log (0f97981, a0fa093, bda807c).
