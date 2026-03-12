---
phase: 2
slug: landing-page-and-marina-onboarding
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-10
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.0.18 |
| **Config file** | `vitest.config.ts` (root) |
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

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 02-01-01 | 01 | 1 | LAND-01 | manual-only | n/a | pending |
| 02-01-02 | 01 | 1 | LAND-02 | unit (inline TDD) | `npx vitest run src/__tests__/lead-api.test.ts` | pending |
| 02-02-01 | 02 | 1 | MARI-01 | unit (inline TDD) | `npx vitest run src/__tests__/photo-drop-zone.test.ts` | pending |
| 02-02-02 | 02 | 1 | MARI-02 | unit (inline TDD) | `npx vitest run src/__tests__/geocode-api.test.ts` | pending |
| 02-03-01 | 03 | 1 | MARI-03 | unit (inline TDD) | `npx vitest run src/__tests__/availability-calendar.test.ts` | pending |

*Status: pending / green / red / flaky*

*Note: All test files are created inline within their respective TDD tasks (tasks marked `tdd="true"`). No separate Wave 0 stub plan is needed — each task writes tests as part of the RED-GREEN-REFACTOR cycle.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Landing page renders Hero and How It Works sections with correct styling | LAND-01 | Visual layout verification | Visit `/`, confirm Hero section renders with heading, CTA buttons, How It Works cards display |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or are marked manual-only
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Inline TDD approach: each `tdd="true"` task creates its own test file
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
