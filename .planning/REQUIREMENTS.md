# Requirements: EasyDock

**Defined:** 2026-03-09
**Core Value:** A yacht owner can find an available slip, book it, and pay — and a marina owner receives that booking and gets paid.

## v1 Requirements

Requirements for public launch. Each maps to roadmap phases.

### Booking Hardening

- [x] **HARD-01**: Server calculates total price from slip rate and dates instead of trusting client-submitted price
- [x] **HARD-02**: Booking creation uses database transaction to prevent double-booking race condition on same slip/dates
- [x] **HARD-03**: Stripe webhook handler verifies database write succeeded before returning 200

### Landing Page

- [x] **LAND-01**: Existing landing page HTML integrated as Next.js home page with consistent branding
- [x] **LAND-02**: Lead capture form submits to Supabase marina_leads table with validation

### Marina Onboarding

- [x] **MARI-01**: Marina owner can upload photos for their marina listing via drag-and-drop UI
- [x] **MARI-02**: Marina address is auto-geocoded to lat/lng when marina is created or edited
- [x] **MARI-03**: Marina owner can view a visual availability calendar showing booked vs open dates per slip

### Map Search

- [x] **SRCH-01**: Yacht owner sees an interactive map with marina location pins on the search page
- [x] **SRCH-02**: Anyone can browse marinas without signing up (no auth requirement on search)
- [x] **SRCH-03**: Yacht owner can filter slips by vessel length and beam to match their boat

### Stripe Connect

- [x] **PAY-01**: Marina owner can link their Stripe account via Connect Express onboarding flow
- [x] **PAY-02**: Checkout splits payment: EasyDock takes percentage fee, remainder transfers to marina's Stripe account
- [x] **PAY-03**: Marina owner can view payout history and upcoming transfers in their dashboard

### Booking Management

- [ ] **BOOK-01**: Marina owner sees an inbox of incoming bookings and can approve or deny each one
- [ ] **BOOK-02**: Yacht owner can view their booking history and current booking status
- [ ] **BOOK-03**: Either party can cancel a booking with appropriate refund logic

### Email Notifications

- [ ] **EMAL-01**: Both parties receive email confirmation when a booking is created
- [ ] **EMAL-02**: Both parties receive email when booking status changes (approved, denied, cancelled)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Profiles

- **PROF-01**: Yacht owner can save boat specs (length, beam, draft, type) to auto-fill during booking
- **PROF-02**: Marina owner profile with company details and contact info

### Advanced Search

- **ASRCH-01**: Search by date range with real-time availability filtering
- **ASRCH-02**: Slip clustering on map at zoom-out levels

### Dashboard

- **DASH-01**: Marina owner occupancy analytics and revenue reports
- **DASH-02**: Admin dashboard for platform oversight

### Moderation

- **MODR-01**: Admin can review and approve new marina listings before they go live
- **MODR-02**: Admin can suspend marina or yacht owner accounts

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time chat | High complexity, not core to booking loop |
| Mobile native app | Web-first, mobile responsive is sufficient for launch |
| Multi-region support | South Florida only for MVP |
| Video content | Storage/bandwidth costs, defer to post-launch |
| OAuth social login | Email/password sufficient for MVP |
| Subscription model | Percentage-based fee is the chosen model |
| In-app messaging | Email notifications sufficient for MVP |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| HARD-01 | Phase 1 | Complete |
| HARD-02 | Phase 1 | Complete |
| HARD-03 | Phase 1 | Complete |
| LAND-01 | Phase 2 | Complete |
| LAND-02 | Phase 2 | Complete |
| MARI-01 | Phase 2 | Complete |
| MARI-02 | Phase 2 | Complete |
| MARI-03 | Phase 2 | Complete |
| SRCH-01 | Phase 3 | Complete |
| SRCH-02 | Phase 3 | Complete |
| SRCH-03 | Phase 3 | Complete |
| PAY-01 | Phase 4 | Complete |
| PAY-02 | Phase 4 | Complete |
| PAY-03 | Phase 4 | Complete |
| BOOK-01 | Phase 5 | Pending |
| BOOK-02 | Phase 5 | Pending |
| BOOK-03 | Phase 5 | Pending |
| EMAL-01 | Phase 5 | Pending |
| EMAL-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0

---
*Requirements defined: 2026-03-09*
*Last updated: 2026-03-09 after roadmap creation*
