---
phase: 4
slug: stripe-connect-payouts
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-11
verified: 2026-06-27
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | PAY-01 | unit | `npx vitest run src/__tests__/connect-onboard.test.ts -x` | ✅ | ✅ green |
| 04-01-02 | 01 | 1 | PAY-01 | unit | `npx vitest run src/__tests__/connect-return.test.ts -x` | ✅ | ✅ green |
| 04-02-01 | 02 | 1 | PAY-02 | unit | `npx vitest run src/__tests__/checkout-connect.test.ts -x` | ✅ | ✅ green |
| 04-02-02 | 02 | 1 | PAY-02 | unit | `npx vitest run src/__tests__/checkout-connect.test.ts -x` | ✅ | ✅ green |
| 04-03-01 | 03 | 2 | PAY-03 | unit | `npx vitest run src/__tests__/connect-login-link.test.ts -x` | ✅ | ✅ green |
| 04-03-02 | 03 | 2 | PAY-01 | unit | `npx vitest run src/__tests__/webhook-connect.test.ts -x` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/__tests__/connect-onboard.test.ts` — stubs for PAY-01 onboarding route
- [x] `src/__tests__/connect-return.test.ts` — stubs for PAY-01 return URL handler
- [x] `src/__tests__/checkout-connect.test.ts` — stubs for PAY-02 payment split + blocking guard
- [x] `src/__tests__/connect-login-link.test.ts` — stubs for PAY-03 login link generation
- [x] `src/__tests__/webhook-connect.test.ts` — stubs for account.updated handler

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Stripe Express onboarding redirect flow | PAY-01 | Requires real Stripe hosted UI interaction | Use Stripe test mode; click "Connect Stripe", verify redirect to Stripe, complete onboarding, verify return to dashboard |
| Express Dashboard login link opens correctly | PAY-03 | External Stripe UI | Click "View Payouts", verify new tab opens Stripe Express Dashboard |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete (2026-06-27, 312/312 tests green)
