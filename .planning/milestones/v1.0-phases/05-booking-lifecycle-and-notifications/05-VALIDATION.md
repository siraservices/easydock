---
phase: 5
slug: booking-lifecycle-and-notifications
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-12
verified: 2026-06-27
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.0.18 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run src/__tests__/booking-approve.test.ts src/__tests__/booking-deny.test.ts src/__tests__/booking-cancel.test.ts` |
| **Full suite command** | `npx vitest run src/__tests__/` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command (relevant test files)
- **After every plan wave:** Run `npx vitest run src/__tests__/`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | BOOK-01 | unit | `npx vitest run src/__tests__/booking-approve.test.ts` | ✅ | ✅ green |
| 05-01-02 | 01 | 1 | BOOK-01 | unit | `npx vitest run src/__tests__/booking-deny.test.ts` | ✅ | ✅ green |
| 05-02-01 | 02 | 1 | BOOK-03 | unit | `npx vitest run src/__tests__/booking-cancel.test.ts` | ✅ | ✅ green |
| 05-03-01 | 03 | 2 | EMAL-01 | unit | `npx vitest run src/__tests__/email-send.test.ts` | ✅ | ✅ green |
| 05-03-02 | 03 | 2 | EMAL-02 | unit | included in approve/deny/cancel tests | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/__tests__/booking-approve.test.ts` — stubs for BOOK-01 approve
- [x] `src/__tests__/booking-deny.test.ts` — stubs for BOOK-01 deny
- [x] `src/__tests__/booking-cancel.test.ts` — stubs for BOOK-03 cancel + Stripe params
- [x] `src/__tests__/email-send.test.ts` — stubs for EMAL-01 / EMAL-02

*Existing infrastructure (Vitest) covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dashboard bookings tab renders with correct sub-tabs | BOOK-01 | UI layout verification | Navigate to /dashboard as marina owner, verify Pending/Active/Past tabs |
| Booking detail page shows status banner with correct color | BOOK-02 | Visual styling check | Navigate to /bookings/[id], verify status-colored banner |
| Cancel confirmation dialog shows refund amount | BOOK-03 | Dialog UX verification | Click cancel on booking detail, verify dialog content |
| Email received with correct branding/content | EMAL-01/02 | End-to-end email delivery | Trigger booking event, check email inbox |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete (2026-06-27, 312/312 tests green)
