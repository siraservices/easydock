---
phase: 04-stripe-connect-payouts
plan: "00"
subsystem: testing
tags: [stripe-connect, vitest, test-stubs, tdd-scaffolding]
dependency_graph:
  requires: []
  provides: [connect-onboard-stubs, connect-return-stubs, checkout-connect-stubs, login-link-stubs, webhook-connect-stubs]
  affects: [04-01, 04-02, 04-03]
tech_stack:
  added: []
  patterns: [vitest-mock-pattern, controllable-mock-state]
key_files:
  created:
    - src/__tests__/connect-onboard.test.ts
    - src/__tests__/connect-return.test.ts
    - src/__tests__/checkout-connect.test.ts
    - src/__tests__/connect-login-link.test.ts
    - src/__tests__/webhook-connect.test.ts
  modified: []
decisions:
  - "All stubs use controllable mockState objects (same pattern as webhook-idempotency.test.ts) so Plan 01-03 executors can toggle mock behavior without restructuring the file"
  - "vi.mock calls cover @/lib/supabase/admin, @/lib/supabase/server, and stripe — all three dependencies needed by Connect routes"
  - "webhook-connect.test.ts includes idempotency table mock (stripe_processed_events) in addition to marinas table — consistent with existing webhook handler architecture"
metrics:
  duration: ~2 min
  completed_date: "2026-03-11"
  tasks_completed: 2
  files_created: 5
  files_modified: 0
---

# Phase 4 Plan 00: Test Stub Scaffolding Summary

**One-liner:** 5 vitest stub files with controllable mock state and it.todo placeholders establish Wave 0 Nyquist sampling contract for all Stripe Connect plans

## What Was Built

Five test stub files in `src/__tests__/` that provide the test scaffolding framework for Phase 4 Stripe Connect implementation. Each file follows the established `webhook-idempotency.test.ts` pattern: a controllable `mockState` object, `vi.mock` calls for all dependencies, and `it.todo` placeholders that document expected behaviors for Plans 01, 02, and 03 to implement.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Connect onboarding and return route stubs (PAY-01) | 9b7ad13 | connect-onboard.test.ts, connect-return.test.ts |
| 2 | Checkout-connect, login-link, webhook-connect stubs (PAY-02, PAY-03) | 947cb22 | checkout-connect.test.ts, connect-login-link.test.ts, webhook-connect.test.ts |

## Test Coverage Established

| File | Describe Block | Todo Count |
|------|---------------|------------|
| connect-onboard.test.ts | POST /api/connect/onboard | 5 |
| connect-return.test.ts | GET /api/connect/return | 3 |
| checkout-connect.test.ts | POST /api/checkout — Connect integration | 5 |
| connect-login-link.test.ts | POST /api/connect/login-link | 4 |
| webhook-connect.test.ts | POST /api/webhooks/stripe — account.updated | 3 |
| **Total** | | **20 todos** |

## Verification

- All 5 files recognized by vitest (`vitest run --reporter=verbose`)
- 20 todo tests shown, 0 failures
- Existing 62 tests continue to pass (no regressions)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- FOUND: src/__tests__/connect-onboard.test.ts
- FOUND: src/__tests__/connect-return.test.ts
- FOUND: src/__tests__/checkout-connect.test.ts
- FOUND: src/__tests__/connect-login-link.test.ts
- FOUND: src/__tests__/webhook-connect.test.ts
- FOUND commit: 9b7ad13 (Task 1)
- FOUND commit: 947cb22 (Task 2)
