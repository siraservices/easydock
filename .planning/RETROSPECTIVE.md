# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-12
**Phases:** 5 | **Plans:** 14 | **Sessions:** ~8

### What Was Built
- Hardened booking flow with server-side pricing, atomic double-booking prevention, and idempotent webhooks
- Marketing landing page with lead capture and marina onboarding (photos, geocoding, availability calendar)
- Interactive Mapbox map search with vessel filters, bi-directional hover sync, and mobile responsive layout
- Stripe Connect marketplace payments with Express onboarding, destination charges, and payout dashboard
- Booking lifecycle management (approve/deny/cancel with Stripe refund reversal) and email notifications via Resend

### What Worked
- Wave-based sequential execution kept phases clean — no cross-phase conflicts
- TDD red/green pattern caught real issues early (Stripe mock constructors, Supabase type generics)
- Phase ordering (hardening first, then features) prevented compounding bugs
- Parallel plan execution within waves when possible
- Lazy initialization pattern for external services (Resend) avoided build-time failures

### What Was Inefficient
- SUMMARY frontmatter `requirements_completed` field was never populated — metadata gap across all 14 plans
- Phase 3 verification caught a test/implementation mismatch (missing `.not()` guards) that should have been caught during execution
- Some Phase 4 decisions were logged redundantly in STATE.md (duplicate entries)
- Mock data was never updated to support Stripe Connect demo flow — blocks manual E2E testing

### Patterns Established
- `adminClient` for cross-user operations (cancel route, email lookups, Connect status checks)
- DB-first pattern: update database before calling external services (Stripe refund, email send)
- Non-fatal external calls: email failures don't block booking operations
- `as never` / `as unknown as` casts for Supabase v12 generic type mismatches
- Lazy singleton pattern for external SDK clients (Resend)

### Key Lessons
1. Always update mock data when adding guards that affect the demo path — mock marinas with `payouts_enabled: false` blocked the entire booking demo flow
2. Verify tests pass after implementation, not just that implementation is correct — Phase 3's missing `.not()` guards were functionally harmless but left a failing test
3. Fee calculation safety cap (`safeFee = min(fee, charge - 1)`) prevents Stripe rejections at edge cases
4. Storing external IDs (stripe_account_id) before generating one-time-use links prevents data loss if user closes tab mid-flow

### Cost Observations
- Model mix: ~5% opus (orchestration), ~90% sonnet (execution + verification), ~5% haiku (tools)
- Sessions: ~8 across 3 days
- Notable: Wave-based execution kept orchestrator context under 15%, allowing fresh 200k context per executor

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~8 | 5 | Initial process — wave execution, TDD, verification |

### Cumulative Quality

| Milestone | Tests | Coverage | Tech Debt Items |
|-----------|-------|----------|----------------|
| v1.0 | 97 | — | 5 |

### Top Lessons (Verified Across Milestones)

1. DB-first, external-second: always persist state before calling external APIs
2. Mock data must evolve with feature guards — stale mocks create invisible demo blockers
