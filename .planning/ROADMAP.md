# Roadmap: EasyDock

## Milestones

- ✅ **v1.0 MVP** — Phases 1-5 (shipped 2026-03-12)
- ✅ **v1.1 Vercel Deploy** — Phase 6 (shipped 2026-06-27)
- ✅ **v1.2 Marina Activation** — Phases 7-9 (shipped 2026-06-28)

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

### ✅ v1.1 Vercel Deploy (Complete — 2026-06-27)

**Milestone Goal:** Migrate hosting from Netlify to Vercel — remove Netlify artifacts, clean the Next.js config, preserve security headers, add Vercel Analytics, and confirm a clean production deployment.

#### Phase 6: Vercel Migration

- [x] **Phase 6: Vercel Migration** - Remove Netlify, configure Vercel, add analytics, and ship a clean production deploy — completed 2026-06-27

### ✅ v1.2 Marina Activation (Complete — 2026-06-28)

**Milestone Goal:** Convert the 237 CSV marinas into active listings and capture demand-side leads — creating the first path to real bookings without requiring all marina owners to sign up first.

#### Phase 7: Marina Claim Flow

- [x] **Phase 7: Marina Claim Flow** - /claim page where marina owners search and claim their CSV listing, linking their account to an existing marina record and unlocking the dashboard for real slip management — completed 2026-06-28

#### Phase 8: Demo Slip + Lead Capture

- [x] **Phase 8: Demo Slip + Lead Capture** - UnclaimedMarinaCard component, POST /api/marina-leads, 005_marina_spot_requests.sql, search page integration — completed 2026-06-28 (EAS-109)

#### Phase 9: Marina Activation Emails

- [x] **Phase 9: Marina Activation Emails** - marina-lead-confirmation.tsx (boat owner) + marina-activation-nudge.tsx (EasyDock admin) React Email templates — completed 2026-06-28 (EAS-109)

## Phase Details

### Phase 6: Vercel Migration
**Goal**: The app runs on Vercel with all Netlify artifacts removed and security headers intact
**Depends on**: Phase 5 (v1.0 complete)
**Requirements**: HOST-01, HOST-02, HOST-03, HOST-04, HOST-05
**Success Criteria** (what must be TRUE):
  1. netlify.toml is deleted and @netlify/plugin-nextjs is removed from the project
  2. `npm run build` completes with zero errors and no Netlify-related warnings
  3. HTTP responses from the deployed app include security headers (X-Frame-Options, X-Content-Type-Options, XSS protection)
  4. The app is live on a Vercel URL with all routes (home, search, auth, dashboard) responding correctly
  5. `@vercel/analytics` is installed and `<Analytics />` component is rendered in the root layout
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Booking Hardening | v1.0 | 2/2 | Complete | 2026-03-10 |
| 2. Landing Page and Marina Onboarding | v1.0 | 3/3 | Complete | 2026-03-11 |
| 3. Map Search | v1.0 | 2/2 | Complete | 2026-03-11 |
| 4. Stripe Connect Payouts | v1.0 | 4/4 | Complete | 2026-03-11 |
| 5. Booking Lifecycle and Notifications | v1.0 | 3/3 | Complete | 2026-03-12 |
| 6. Vercel Migration | v1.1 | 1/1 | Complete | 2026-06-27 |
| 7. Marina Claim Flow | v1.2 | 1/1 | Complete | 2026-06-28 |
| 8. Demo Slip + Lead Capture | v1.2 | 1/1 | Complete | 2026-06-28 |
| 9. Marina Activation Emails | v1.2 | 1/1 | Complete | 2026-06-28 |
