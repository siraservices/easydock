---
phase: 3
slug: map-search
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-11
verified: 2026-06-27
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.0.18 |
| **Config file** | `vitest.config.ts` (exists — `environment: 'node'`, no jsdom) |
| **Quick run command** | `npx vitest run src/__tests__/` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/__tests__/`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | SRCH-01 | unit | `npx vitest run src/__tests__/use-map-filter.test.ts` | ✅ | ✅ green |
| 03-01-02 | 01 | 1 | SRCH-03 | unit | `npx vitest run src/__tests__/use-map-filter.test.ts` | ✅ | ✅ green |
| 03-02-01 | 02 | 1 | SRCH-02 | unit | `npx vitest run src/__tests__/use-map-filter.test.ts` | ✅ | ✅ green |
| 03-02-02 | 02 | 1 | SRCH-03 | unit | `npx vitest run src/__tests__/use-map-filter.test.ts` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/__tests__/use-map-filter.test.ts` — covers SRCH-01/SRCH-02/SRCH-03 (filterMarinasByViewport + buildSlipQuery with null guards and dimension filters)

*Existing vitest infrastructure covers framework install — no additional setup needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Map renders with correct Mapbox tiles | SRCH-01 | WebGL rendering requires browser | Open /search, verify map tiles load with marina pins visible |
| Bi-directional hover sync | SRCH-01 | Visual interaction requires browser | Hover slip card → pin highlights; hover pin → card highlights |
| Mobile map overlay toggle | SRCH-01 | Responsive layout requires browser | Resize to mobile, tap "Show Map", verify full-screen overlay |
| Geolocation prompt and fallback | SRCH-01 | Browser permission API | Allow geolocation → map centers on user; deny → centers on South Florida |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** complete (2026-06-27, 312/312 tests green)
