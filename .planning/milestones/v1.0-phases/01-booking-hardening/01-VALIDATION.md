---
phase: 1
slug: booking-hardening
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-09
verified: 2026-06-27
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (Wave 0 installs) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | HARD-01 | unit | `npx vitest run src/__tests__/checkout-pricing.test.ts` | ✅ | ✅ green |
| 01-01-02 | 01 | 1 | HARD-02 | unit | `npx vitest run src/__tests__/checkout-pricing.test.ts` | ✅ | ✅ green |
| 01-02-01 | 02 | 1 | HARD-03 | unit | `npx vitest run src/__tests__/webhook-idempotency.test.ts` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `vitest` + `@vitejs/plugin-react` — install test framework
- [x] `vitest.config.ts` — configure vitest for Next.js project
- [x] `src/__tests__/checkout-pricing.test.ts` — stubs for HARD-01, HARD-02
- [x] `src/__tests__/webhook-idempotency.test.ts` — stubs for HARD-03

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Stripe Checkout session expiry | HARD-03 | Requires real Stripe session timeout (30 min) | Create booking, don't complete payment, wait for expiry webhook |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete (2026-06-27, 312/312 tests green)
