---
phase: 3
slug: map-search
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
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
| 03-01-01 | 01 | 1 | SRCH-01 | unit | `npx vitest run src/__tests__/map-view.test.ts -t "marina pins"` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | SRCH-03 | unit | `npx vitest run src/__tests__/map-view.test.ts -t "viewport"` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | SRCH-02 | unit | `npx vitest run src/__tests__/search-public-access.test.ts` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | SRCH-03 | unit | `npx vitest run src/__tests__/search-filters.test.ts -t "beam"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/map-view.test.ts` — stubs for SRCH-01 (pin rendering logic) and SRCH-03 (viewport filter)
- [ ] `src/__tests__/search-filters.test.ts` — stubs for SRCH-03 (beam filter query building)
- [ ] `src/__tests__/search-public-access.test.ts` — stubs for SRCH-02 (no ProtectedRoute logic)

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

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
