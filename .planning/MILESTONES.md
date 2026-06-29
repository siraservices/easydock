# Milestones

## v1.0 MVP (Shipped: 2026-03-12)

**Phases completed:** 5 phases, 14 plans, 6 tasks

**Key accomplishments:**
- Server-side price calculation, atomic double-booking prevention, and idempotent webhook handler with auto-refund
- Marketing landing page with lead capture, drag-and-drop photo uploads, Mapbox geocoding, and availability calendar
- Interactive Mapbox map search with vessel dimension filters, bi-directional hover sync, and mobile responsive layout
- Stripe Connect Express onboarding, destination charges with platform fee split, and payout dashboard
- Booking inbox with approve/deny/cancel workflows, Stripe refund reversal, and email notifications via Resend

**Stats:**
- Timeline: 3 days (2026-03-09 → 2026-03-12)
- Lines of code: 10,093 TypeScript/TSX
- Commits: 84
- Tests: 97 passing
- Requirements: 19/19 satisfied

**Tech debt accepted:**
- Phase 3: 1 failing test (buildSlipQuery missing null-coordinate guards)
- Mock data blocks demo booking flow (mock marinas have no Stripe Connect)
- Dead client-side price calculation in booking-widget.tsx
- Misleading migration filename: 006_marina_leads.sql creates marina_prospects table

**Tech debt resolved (post-ship):**
- Phase 3 failing test fixed: buildSlipQuery null guards added (EAS-100, 2026-06-27)
- Mock data E2E flow fixed: isDemo prop shows contact card for mock marina IDs (EAS-99, 2026-06-27)
- Dead client-side price removed from booking-widget; service fee now displayed (EAS-100, 2026-06-27)
- buildSlipQuery null guard tests: all 312 tests pass (EAS-100, 2026-06-27)

---

## v1.1 Vercel Deploy (Shipped: 2026-06-27)

**Phases completed:** 1 phase (Phase 6)

**Key accomplishments:**
- Removed netlify.toml and @netlify/plugin-nextjs from the project
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy) configured in next.config.ts
- Vercel Analytics installed and rendered in root layout
- Clean production deployment on Vercel with all routes functional
- Added 237 South Florida marinas from marinas.com CSV data

**Stats:**
- Requirements: 5/5 satisfied (HOST-01 through HOST-05)
- Tests: 312 passing (up from 97 at v1.0 ship)
- TypeScript: clean (zero errors)

---

## v1.2 Marina Activation (Shipped: 2026-06-28)

**Phases completed:** 3 phases, 3 plans

**Key accomplishments:**
- Marina claim flow: /claim page where marina owners search and claim their CSV listing, linking their account to an existing marina record and unlocking the dashboard for real slip management
- Admin dashboard: 3-tab UI (Overview / Marinas / Claims) with stats, paginated list, and PATCH endpoint for claim review
- Lead capture for unclaimed marinas: UnclaimedMarinaCard in search results, POST /api/marina-leads, spot_requests table with RLS
- Marina activation emails: confirmation email to boat owners + nudge email to EasyDock admin (React Email templates)
- 241 South Florida marinas imported from CSV (includes 4 previously missing records)

**Stats:**
- Tests: 332 passing (up from 312 at v1.1 ship)
- TypeScript: clean (zero errors)
- Issues: EAS-107, EAS-108, EAS-109

---

