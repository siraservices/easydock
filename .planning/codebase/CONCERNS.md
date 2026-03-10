# Codebase Concerns

**Analysis Date:** 2026-03-09

## Tech Debt

**Pervasive TypeScript Type Safety Issues:**
- Issue: Heavy use of `as unknown as` type assertions and `as never` casts throughout codebase to work around Supabase client type limitations
- Files: `src/app/api/checkout/route.ts`, `src/app/api/webhooks/stripe/route.ts`, `src/lib/auth-context.tsx`, `src/components/marina-form.tsx`, `src/components/slip-form-modal.tsx`, `src/app/search/page.tsx`, `src/app/bookings/page.tsx`, `src/app/bookings/[id]/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/dashboard/marinas/[id]/page.tsx`, `src/lib/supabase/storage.ts`
- Impact: Type checking is bypassed, making refactoring risky and IDE support unreliable. Runtime errors from type mismatches won't be caught at compile time. Makes future maintenance harder and increases regression risk.
- Fix approach: Generate strongly-typed Supabase types using `supabase gen types --lang typescript --schema public > src/types/supabase-generated.ts`, then refactor type assertions to use proper types. Update `src/types/database.ts` to be auto-generated from schema rather than manually maintained.

**Manual Database Type Definition:**
- Issue: `src/types/database.ts` is manually maintained and must be kept in sync with actual database schema
- Files: `src/types/database.ts`
- Impact: Drift between TypeScript types and actual database schema causes runtime failures. Schema migration files (003-006) are not reflected in types until manually updated.
- Fix approach: Replace manual type file with Supabase CLI generated types. Add to package.json: `"types:gen": "supabase gen types --lang typescript --schema public > src/types/database.ts"` and run before builds.

**Unhandled Error Cases in API Routes:**
- Issue: `/api/checkout` and `/api/webhooks/stripe` lack comprehensive error handling for Supabase failures and network errors
- Files: `src/app/api/checkout/route.ts` (lines 48-106), `src/app/api/webhooks/stripe/route.ts` (lines 34-62)
- Impact: Database INSERT/UPDATE failures don't return detailed errors to client (generic "Internal server error"). Stripe webhook failures silently fail without retry mechanism. Booking status mismatches between payment and database state.
- Fix approach: Wrap Supabase operations in try-catch. Return error details in dev mode. Add middleware to log and retry failed webhook operations. Consider adding idempotency keys to webhook handler.

**Incomplete Error Logging:**
- Issue: Only 3 console.error statements exist; most errors are logged without context for debugging
- Files: `src/app/api/webhooks/stripe/route.ts`, `src/app/api/checkout/route.ts`, `src/lib/auth-context.tsx`
- Impact: Production debugging is difficult. Webhook failures and checkout errors have no trace logs. Can't diagnose user issues without logs.
- Fix approach: Add structured logging with request context (user ID, booking ID, etc). Use proper logger library (e.g., pino or winston) instead of console.error. Log at INFO level for success paths, ERROR for failures.

## Known Bugs

**Stripe Webhook May Miss Payment Confirmations:**
- Symptoms: Booking remains in "pending" status after successful payment. User must manually refresh or wait for polling timeout.
- Files: `src/app/api/webhooks/stripe/route.ts` (lines 34-47), `src/app/bookings/[id]/page.tsx` (lines 54-76)
- Trigger: Payment completes but webhook delivery is delayed > 60 seconds (polling timeout in booking detail page). Or webhook secret validation fails silently.
- Workaround: Manual page refresh or wait 60 seconds for status to update. User can check email confirmation from Stripe.
- Risk: High - affects core payment workflow. Users may think booking failed even though charge succeeded.

**Date Conflict Detection Uses Implicit Timezone Conversion:**
- Symptoms: Booking date conflicts may be missed if check-in/check-out dates cross timezone boundaries or are stored as DATE instead of TIMESTAMPTZ
- Files: `src/app/api/checkout/route.ts` (lines 64-78), `src/app/search/page.tsx` (lines 63-82), `database/001_initial_schema.sql` (lines 84-85)
- Cause: Database schema uses DATE type for `check_in`/`check_out`, but comparison logic in checkout API doesn't account for timezone or time-of-day logic. A booking from 2026-03-09 to 2026-03-10 may incorrectly conflict with 2026-03-10 to 2026-03-11.
- Workaround: Frontend validation in booking widget enforces min check-out > check-in, but server-side logic is loose.

**Profile RLS Policy Prevents Admins from Reading Other Profiles:**
- Symptoms: Admin role cannot query user profiles. Admin dashboard (when built) will fail to function.
- Files: `database/001_initial_schema.sql` (lines 120-126)
- Cause: Profiles RLS policy `"Users can read own profile"` only allows `auth.uid() = id`, no admin bypass.
- Workaround: None - requires RLS policy change.

## Security Considerations

**Supabase Service Role Key Exposed in Webhook Handler:**
- Risk: `src/lib/supabase/admin.ts` initializes admin client with `SUPABASE_SERVICE_ROLE_KEY`, only guarded by `process.env`. If server-side env var leaks, entire database access is compromised.
- Files: `src/lib/supabase/admin.ts` (lines 4-9), `src/app/api/webhooks/stripe/route.ts` (line 31)
- Current mitigation: Key is server-side only (not in client bundle). netlify.toml sets security headers (X-Frame-Options, etc).
- Recommendations:
  - Add API authentication to `/api/webhooks/stripe` - verify request source (Stripe IP ranges or bearer token)
  - Rotate `SUPABASE_SERVICE_ROLE_KEY` in production if console access is compromised
  - Use Supabase JWT roles instead of admin client where possible
  - Add rate limiting to webhook endpoint

**Payment Intent ID Stored Without Validation:**
- Risk: Stripe payment intent ID stored in database (`src/app/api/webhooks/stripe/route.ts`, line 43) without verifying it matches the booking's expected amount
- Files: `src/app/api/webhooks/stripe/route.ts` (line 43), `database/001_initial_schema.sql` (line 90)
- Current mitigation: None - assumes Stripe webhook is authentic
- Recommendations:
  - Verify payment intent amount matches booking total_price before updating status
  - Add idempotency key to webhook handler to prevent duplicate status updates
  - Store payment status separately from booking status for audit trail

**Booking Creation Vulnerable to Race Condition:**
- Risk: Two simultaneous checkout requests for same slip can both pass availability check and create duplicate bookings
- Files: `src/app/api/checkout/route.ts` (lines 47-78)
- Current mitigation: Slip has `is_available` boolean, but no transaction/lock prevents race condition between SELECT and INSERT
- Recommendations:
  - Use database-level constraint: `UNIQUE (slip_id, check_in, check_out)` on bookings table with partial index on status != 'cancelled'
  - Move conflict check and booking insert into SQL transaction or use Supabase RPC
  - Implement optimistic locking with version numbers

**Marina Ownership Not Validated on Slip Operations:**
- Risk: A marina owner could theoretically modify slips belonging to other marinas if they craft API requests (though RLS should prevent this)
- Files: `src/app/dashboard/marinas/[id]/page.tsx` (slip operations), `database/001_initial_schema.sql` (lines 160-188)
- Current mitigation: RLS policies check marina ownership, but relies on Supabase enforcement
- Recommendations:
  - Add server-side ownership verification in API routes before mutations
  - Audit RLS policies in production - test that non-owners cannot access slips
  - Log all slip modifications with user ID and timestamp for audit trail

## Performance Bottlenecks

**Search Page Loads All Slips Then Filters in Memory:**
- Problem: Search page fetches full slip list with marinas join (`src/app/search/page.tsx`, lines 39-54), then filters conflicts in client-side JavaScript
- Files: `src/app/search/page.tsx` (lines 35-85)
- Cause: Supabase nested SELECT limitations make date filtering complex in query layer. Falls back to client-side filtering.
- Impact: If 1000+ slips exist, frontend must load, deserialize, and filter all results. Network latency scales linearly with slip count.
- Improvement path: Move conflict checking to SQL. Create an RPC function that returns available slips for given date range. Example: `SELECT * FROM slips WHERE marina_id = ANY(active_marinas) AND is_available = TRUE AND NOT EXISTS (SELECT 1 FROM bookings WHERE ... conflict conditions ...)`

**Booking Detail Page Polls Every 3 Seconds for 60 Seconds:**
- Problem: `src/app/bookings/[id]/page.tsx` (lines 54-76) sets up polling interval that runs indefinitely if webhook doesn't arrive
- Files: `src/app/bookings/[id]/page.tsx` (lines 55-76)
- Cause: Compensates for delayed webhook delivery by polling status every 3 seconds
- Impact: Generates unnecessary database queries (20 requests over 60s per booking viewed). Scales poorly if many users view booking details after payment.
- Improvement path: Use Supabase Realtime subscriptions instead of polling. Listen to booking status changes in real-time: `supabase.from('bookings').on('UPDATE', ...).subscribe()`

**Slip and Marina Photos Stored as Text Arrays Without Pagination:**
- Problem: `marinas.photos` and implicit photo handling don't have limits on array size
- Files: `database/001_initial_schema.sql` (line 53)
- Cause: No constraint on array length. Marina could upload unlimited photos, bloating each record.
- Impact: Slip list queries load all photo URLs even if not displayed. Large arrays slow down table scans.
- Improvement path: Limit photos array to 10 items with `CHECK (array_length(photos, 1) <= 10)`. Move photos to separate table for lazy loading.

## Fragile Areas

**Authentication Context Depends on Profile Fetch Success:**
- Files: `src/lib/auth-context.tsx` (lines 52-64, 67-92)
- Why fragile: `fetchProfile()` silently returns null on error (line 60). If profile doesn't exist (e.g., trigger failed during signup), `profile` stays null and user cannot access protected routes even though they're authenticated.
- Safe modification: Add explicit error state to AuthContext. Return `profile: null | { error: string }` so caller knows if auth failed vs. profile doesn't exist yet. In fetchProfile, add retry logic with exponential backoff.
- Test coverage: No tests for signup flow when profile creation fails. Missing: integration test for auth.onAuthStateChange when profile is missing.

**Booking Status Workflow Not Enforced at Database Level:**
- Files: `database/001_initial_schema.sql` (line 92), `src/app/api/webhooks/stripe/route.ts` (lines 34-62)
- Why fragile: Status field has CHECK constraint allowing all transitions, but business logic requires `pending -> approved|declined`, `approved -> confirmed|cancelled`, etc. No trigger prevents invalid transitions like `confirmed -> pending`.
- Safe modification: Create a status_transition table that whitelist allowed transitions. Check against it in trigger before allowing UPDATE.
- Test coverage: Missing tests for invalid booking status transitions.

**Marina Owner Can Deactivate Marina While Bookings Are Pending:**
- Files: `src/app/dashboard/marinas/[id]/page.tsx` (marina edit form), `database/001_initial_schema.sql` (line 54, `is_active` boolean)
- Why fragile: No constraint prevents setting `is_active = FALSE` on marina with active bookings. Could hide bookings from users or cause orphaned booking records.
- Safe modification: Add database trigger: `BEFORE UPDATE ON marinas SET is_active = FALSE, prevent if EXISTS (SELECT 1 FROM bookings WHERE status IN ('pending', 'approved', 'confirmed'))`
- Test coverage: Missing test for deactivating marina with active bookings.

**Type Assertions Hide Real Type Mismatches:**
- Files: Throughout codebase (see Tech Debt section) - 20+ `as unknown as` assertions
- Why fragile: If Supabase response shape changes, code fails silently at runtime instead of type-checking errors. Example: if API adds required field, code doesn't fail until field is accessed.
- Safe modification: Replace assertions with proper types. Use Supabase CLI to generate types from schema.
- Test coverage: No type tests. Consider adding type-level tests with TypeScript compiler checks.

## Scaling Limits

**Single Booking Page Query N+1 Problem:**
- Current capacity: Safe up to ~100 concurrent users viewing their bookings simultaneously
- Limit: Each booking detail page runs full SELECT with joins (`src/app/bookings/[id]/page.tsx`, line 36-40). For 1000 users viewing bookings = 1000 queries.
- Scaling path: Implement query result caching (Redis or Supabase cache). Add computed columns in database for common queries. Use dataloader pattern to batch booking fetches.

**Stripe Webhook Rate Limiting Not Implemented:**
- Current capacity: 100 webhooks/second (Stripe rate)
- Limit: No rate limiting on `/api/webhooks/stripe`. If Stripe sends burst of webhook retries, could spike database load.
- Scaling path: Add Redis-backed rate limiter. Queue webhook events in Supabase or external queue (e.g., Bull). Process async instead of synchronously.

**Search Query Filter Performance:**
- Current capacity: ~500 slips across active marinas
- Limit: Search queries with date range and boat length filter become slow once slip count exceeds 1000. No database indexes optimize combined (city, is_available, length_ft, date_range) queries.
- Scaling path: Add composite index on `slips(marina_id, is_available, length_ft)`. Create materialized view of available slips by city for faster filtering.

**Realtime Notifications Missing:**
- Current capacity: N/A - not implemented
- Limit: Without Realtime subscriptions or webhooks, marina owners don't get notified of new bookings in real-time. Must manually refresh dashboard.
- Scaling path: Enable Supabase Realtime for bookings table. Push notifications when new booking created. Email digest for marina owners.

## Dependencies at Risk

**Stripe SDK Version Hard-Pinned:**
- Risk: `stripe@^20.4.0` in package.json could have security vulnerabilities. Manual updates required, no security patches automatically.
- Files: `package.json` (line 17)
- Impact: If CVE disclosed in Stripe SDK, deployment must wait for manual version bump and re-deploy.
- Migration plan: Add Dependabot/Renovate for automated dependency updates with PR testing. Or use `npm audit` in CI to catch vulnerabilities.

**Next.js/React Versions at Bleeding Edge:**
- Risk: `next@^15.1.6` and `react@^19.0.0` are latest majors. Bug fixes and security patches take time to stabilize.
- Files: `package.json` (lines 14-15)
- Impact: Unexpected breaking changes in minor updates. App Router and React 19 features are still evolving.
- Migration plan: Lock to stable minor versions: `"next": "15.1.x"` instead of `^15.1.6`. Upgrade quarterly rather than constantly.

**No Testing Framework:**
- Risk: Zero test coverage means regressions slip to production undetected.
- Files: No `jest.config.ts`, `vitest.config.ts`, or `*.test.ts` files found
- Impact: Cannot safely refactor type assertions or business logic. Booking workflow changes risk breaking payment flow.
- Migration plan: Add Vitest (faster than Jest for TS). Target 80% coverage on API routes first (`src/app/api/`), then component logic.

## Missing Critical Features

**Booking Status Transitions Not Enforced:**
- Problem: Stripe webhook sets booking to `confirmed` automatically, but no UI for marina owners to `approve` bookings first. Status field allows all values, no workflow state machine.
- Blocks: Marina owner approval workflow. Cannot require marina owner confirmation before payment is accepted.
- Fix: Add approval flow: `pending -> approved` (marina owner confirms) -> `confirmed` (payment complete) -> `completed`. Implement in `src/app/dashboard/` marina inbox.

**Refunds and Cancellation Not Handled:**
- Problem: Booking cancellation sets status to `cancelled` but doesn't refund customer or call Stripe refund API.
- Files: `database/001_initial_schema.sql` (status includes 'cancelled'), no refund logic in API routes
- Blocks: Cannot offer cancellations without manual refund process. User trust risk.
- Fix: Add `/api/refunds` endpoint that calls `stripe.refunds.create()` and updates booking status with refund timestamp.

**Invoice Generation Not Implemented:**
- Problem: After payment, no invoice PDF generated or sent to users.
- Blocks: Professional invoicing required for business users and tax compliance.
- Fix: Integrate Stripe invoice API or third-party PDF service (e.g., Stripe's built-in invoicing or generate custom PDF with Puppeteer).

**Email Notifications Missing:**
- Problem: No email sent on booking confirmation, status changes, or cancellations.
- Blocks: Users have no confirmation they booked. Marina owners not notified of new bookings.
- Fix: Set up Supabase Edge Functions or external service (SendGrid, Resend) to send transactional emails on booking triggers.

## Test Coverage Gaps

**No API Route Testing:**
- Untested area: Entire `/src/app/api/` directory (checkout flow, webhook handling)
- Files: `src/app/api/checkout/route.ts`, `src/app/api/webhooks/stripe/route.ts`
- Risk: Payment flow could break silently. Webhook logic cannot be verified without hitting real Stripe. Race conditions in booking creation undetectable.
- Priority: Critical - payment flow is highest-risk area. Should have 100% coverage.

**No Authentication Flow Testing:**
- Untested area: Sign-up, sign-in, profile creation, role-based access
- Files: `src/lib/auth-context.tsx`, `src/app/signup/page.tsx`, `src/app/login/page.tsx`, `src/components/protected-route.tsx`
- Risk: Auth breakages (e.g., profile not created after signup) only caught in manual testing. Cannot verify role-based route protection works.
- Priority: High - auth is security critical and user-facing.

**No Database RLS Policy Testing:**
- Untested area: Row-level security policies that enforce data isolation
- Files: `database/001_initial_schema.sql` (RLS policies, lines 119-217)
- Risk: Authorization bypass possible if RLS policies have bugs. Boat owner could read another owner's bookings.
- Priority: High - security risk. Should be tested with integration tests hitting Supabase directly.

**No Booking Conflict Detection Testing:**
- Untested area: Date conflict checking in search page and checkout API
- Files: `src/app/api/checkout/route.ts` (lines 64-78), `src/app/search/page.tsx` (lines 63-82)
- Risk: Double-booking possible if conflict logic has off-by-one errors or timezone issues.
- Priority: High - core business logic.

**No Component Integration Testing:**
- Untested area: Forms (booking widget, marina form, slip form), protected routes, error states
- Files: `src/components/booking-widget.tsx`, `src/components/marina-form.tsx`, `src/components/slip-form-modal.tsx`
- Risk: Form validation, error handling, and UI state transitions cannot be verified. User workflows break undetected.
- Priority: Medium - affects user experience but less critical than payment flow.

---

*Concerns audit: 2026-03-09*
