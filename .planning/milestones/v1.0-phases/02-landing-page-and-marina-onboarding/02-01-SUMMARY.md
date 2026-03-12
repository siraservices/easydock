---
phase: 02-landing-page-and-marina-onboarding
plan: "01"
subsystem: marketing-landing-page
tags: [landing-page, lead-capture, supabase, tdd, nextjs]
dependency_graph:
  requires: []
  provides: [landing-page, lead-capture-api, marina_leads-table]
  affects: [src/app/page.tsx, src/app/layout.tsx, src/app/api/leads/route.ts, src/components/lead-modal.tsx]
tech_stack:
  added: [font-awesome-cdn]
  patterns: [client-component-modal, inline-validation, admin-client-insert, tdd-red-green]
key_files:
  created:
    - database/003_marina_leads.sql
    - src/app/api/leads/route.ts
    - src/components/lead-modal.tsx
    - src/__tests__/lead-api.test.ts
  modified:
    - src/app/page.tsx
    - src/app/layout.tsx
    - src/types/database.ts
decisions:
  - "Added marina_leads TypeScript type to database.ts manually (table not yet in Supabase, type needed for compile-time safety)"
  - "Used as-cast for user_type narrowing after validation ensures non-empty string is the union type"
metrics:
  duration: 5 min
  completed_date: "2026-03-10"
  tasks_completed: 2
  files_changed: 7
---

# Phase 2 Plan 01: Landing Page + Lead Capture Summary

**One-liner:** Marketing landing page with South Florida hero, How It Works tabs, and Supabase-backed lead capture modal via POST /api/leads using createAdminClient.

## What Was Built

### Task 1: marina_leads DDL and lead capture API route (TDD)

**RED phase:** Created `src/__tests__/lead-api.test.ts` with 7 test cases covering all validation paths. Tests confirmed to fail before implementation.

**GREEN phase:** Created the API route and DDL file. All 7 tests pass.

- `database/003_marina_leads.sql` — marina_leads table with RLS enabled, email index, user_type CHECK constraint
- `src/app/api/leads/route.ts` — POST handler with inline validation (name required, email regex, user_type required), createAdminClient insert, proper 400/201/500 responses
- `src/__tests__/lead-api.test.ts` — 7 Vitest tests with mocked admin client

### Task 2: Landing page and lead modal

- `src/app/page.tsx` — Full-width navy hero with Unsplash marina photo overlay, headline "Find the Perfect Marina in South Florida", two CTA buttons that open LeadModal, How It Works section with two-tab toggle (yacht owners / marina owners), simple footer with disclaimer
- `src/components/lead-modal.tsx` — User type selector (yacht_owner / marina_owner cards with icons), name + email form fields, inline validation, fetch POST to /api/leads, in-modal success confirmation
- `src/app/layout.tsx` — Font Awesome 6.4.0 CDN link added to `<head>`
- `src/types/database.ts` — marina_leads table types added for compile-time safety

## Verification Results

- `npx vitest run src/__tests__/lead-api.test.ts` — 7/7 passing
- `npx next build` — compiled successfully, 14 static pages generated, no type errors

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Type Error] Added marina_leads to Database TypeScript types**
- **Found during:** Task 2, first build attempt
- **Issue:** `supabase.from('marina_leads').insert(...)` failed type check — `marina_leads` not in the `Database` interface since the table is new (DDL not yet run in Supabase)
- **Fix:** Added full Row/Insert/Update types for marina_leads to `src/types/database.ts`
- **Files modified:** `src/types/database.ts`
- **Commit:** c333eed

## Self-Check

- [x] `database/003_marina_leads.sql` exists
- [x] `src/app/api/leads/route.ts` exists and exports POST
- [x] `src/components/lead-modal.tsx` exists (109 lines)
- [x] `src/app/page.tsx` updated (247 lines, imports LeadModal)
- [x] Tests: 7/7 passing
- [x] Build: no type errors
- [x] Commits: f122e71 (task 1), c333eed (task 2)

## Self-Check: PASSED
