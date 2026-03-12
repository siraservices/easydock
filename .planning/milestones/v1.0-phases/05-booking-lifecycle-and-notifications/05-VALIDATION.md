---
phase: 5
slug: booking-lifecycle-and-notifications
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
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
| 05-01-01 | 01 | 1 | BOOK-01 | unit | `npx vitest run src/__tests__/booking-approve.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | BOOK-01 | unit | `npx vitest run src/__tests__/booking-deny.test.ts` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 1 | BOOK-03 | unit | `npx vitest run src/__tests__/booking-cancel.test.ts` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 2 | EMAL-01 | unit | `npx vitest run src/__tests__/email-send.test.ts` | ❌ W0 | ⬜ pending |
| 05-03-02 | 03 | 2 | EMAL-02 | unit | included in approve/deny/cancel tests | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/booking-approve.test.ts` — stubs for BOOK-01 approve
- [ ] `src/__tests__/booking-deny.test.ts` — stubs for BOOK-01 deny
- [ ] `src/__tests__/booking-cancel.test.ts` — stubs for BOOK-03 cancel + Stripe params
- [ ] `src/__tests__/email-send.test.ts` — stubs for EMAL-01 / EMAL-02

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

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
