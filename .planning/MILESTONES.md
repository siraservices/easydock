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

---

