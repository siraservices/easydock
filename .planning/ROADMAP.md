# Roadmap: EasyDock

## Milestones

- ✅ **v1.0 MVP** — Phases 1-5 (shipped 2026-03-12)
- 🚧 **v1.1 Vercel Deploy** — Phase 6 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-5) — SHIPPED 2026-03-12</summary>

- [x] Phase 1: Booking Hardening (2/2 plans) — completed 2026-03-10
- [x] Phase 2: Landing Page and Marina Onboarding (3/3 plans) — completed 2026-03-11
- [x] Phase 3: Map Search (2/2 plans) — completed 2026-03-11
- [x] Phase 4: Stripe Connect Payouts (4/4 plans) — completed 2026-03-11
- [x] Phase 5: Booking Lifecycle and Notifications (3/3 plans) — completed 2026-03-12

Full details: `.planning/milestones/v1.0-ROADMAP.md`

</details>

### 🚧 v1.1 Vercel Deploy (In Progress)

**Milestone Goal:** Migrate hosting from Netlify to Vercel — remove Netlify artifacts, clean the Next.js config, preserve security headers, and confirm a clean production deployment.

#### Phase 6: Vercel Migration

- [ ] **Phase 6: Vercel Migration** - Remove Netlify, configure Vercel, and ship a clean production deploy

## Phase Details

### Phase 6: Vercel Migration
**Goal**: The app runs on Vercel with all Netlify artifacts removed and security headers intact
**Depends on**: Phase 5 (v1.0 complete)
**Requirements**: HOST-01, HOST-02, HOST-03, HOST-04
**Success Criteria** (what must be TRUE):
  1. netlify.toml is deleted and @netlify/plugin-nextjs is removed from the project
  2. `npm run build` completes with zero errors and no Netlify-related warnings
  3. HTTP responses from the deployed app include security headers (X-Frame-Options, X-Content-Type-Options, XSS protection)
  4. The app is live on a Vercel URL with all routes (home, search, auth, dashboard) responding correctly
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Booking Hardening | v1.0 | 2/2 | Complete | 2026-03-10 |
| 2. Landing Page and Marina Onboarding | v1.0 | 3/3 | Complete | 2026-03-11 |
| 3. Map Search | v1.0 | 2/2 | Complete | 2026-03-11 |
| 4. Stripe Connect Payouts | v1.0 | 4/4 | Complete | 2026-03-11 |
| 5. Booking Lifecycle and Notifications | v1.0 | 3/3 | Complete | 2026-03-12 |
| 6. Vercel Migration | v1.1 | 0/TBD | Not started | - |
