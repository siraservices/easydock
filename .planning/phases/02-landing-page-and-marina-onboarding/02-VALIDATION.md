---
phase: 2
slug: landing-page-and-marina-onboarding
status: draft
nyquist_compliant: false
wave_0_complete: false
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

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | LAND-01 | manual-only | n/a | n/a | pending |
| 02-01-02 | 01 | 1 | LAND-02 | unit | `npx vitest run src/__tests__/lead-api.test.ts` | Wave 0 | pending |
| 02-02-01 | 02 | 1 | MARI-01 | unit | `npx vitest run src/__tests__/photo-drop-zone.test.ts` | Wave 0 | pending |
| 02-03-01 | 03 | 2 | MARI-02 | unit | `npx vitest run src/__tests__/geocode-api.test.ts` | Wave 0 | pending |
| 02-03-02 | 03 | 2 | MARI-03 | unit | `npx vitest run src/__tests__/availability-calendar.test.ts` | Wave 0 | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/lead-api.test.ts` — stubs for LAND-02 (validation logic, 400/201 responses)
- [ ] `src/__tests__/photo-drop-zone.test.ts` — stubs for MARI-01 (drag events, file extraction)
- [ ] `src/__tests__/geocode-api.test.ts` — stubs for MARI-02 (Mapbox response parsing + failure path)
- [ ] `src/__tests__/availability-calendar.test.ts` — stubs for MARI-03 (date overlap logic)

*Vitest already installed — no framework setup needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Landing page renders Hero and How It Works sections with correct styling | LAND-01 | Visual layout verification | Visit `/`, confirm Hero section renders with heading, CTA buttons, How It Works cards display |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
