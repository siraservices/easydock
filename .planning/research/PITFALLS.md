# Domain Pitfalls

**Domain:** Marina booking marketplace (two-sided, map-centric, Stripe Connect payouts)
**Researched:** 2026-03-09
**Confidence:** HIGH — pitfalls derived from direct codebase analysis of existing bugs and structural issues in CONCERNS.md plus domain knowledge of Stripe Connect, map SDKs, and Supabase storage patterns.

---

## Critical Pitfalls

Mistakes that cause rewrites, lost money, or broken trust with real users.

---

### Pitfall 1: Stripe Connect Bypassed — Direct Charges Instead of Split Payments

**What goes wrong:** The current checkout creates a direct Stripe Checkout session that charges the customer and sends the full amount to EasyDock's Stripe account. This is NOT Stripe Connect. Marina owners cannot receive payouts. The Stripe Connect onboarding flow (where marina owners become "connected accounts") does not exist yet.

**Why it happens:** The checkout route (`src/app/api/checkout/route.ts`) calls `stripe.checkout.sessions.create()` with no `payment_intent_data.transfer_data` and no `on_behalf_of` parameter. The Stripe session has no reference to a connected account. Funds flow to EasyDock's account only.

**Consequences:**
- Marina owners cannot get paid — the marketplace cannot launch
- When Stripe Connect is added later, the checkout session creation must be rewritten with `transfer_data.destination` pointing to the marina's connected account ID, and `application_fee_amount` for EasyDock's cut
- If marina owners have already onboarded without Connect, their accounts are unlinked from the payment flow
- Platform compliance risk: charging customers on behalf of third parties without Connect violates Stripe ToS

**Prevention:**
- Before building the Stripe Connect onboarding UI, add `stripe_connect_account_id` column to the `marinas` table
- Require this field to be non-null before a slip can go live (`is_available = TRUE`)
- Rewrite checkout to use `transfer_data: { destination: marina.stripe_connect_account_id }` and `application_fee_amount` (EasyDock's percentage in cents)
- Test with Stripe test mode connected accounts before any real marina onboards

**Warning signs:**
- `stripe.checkout.sessions.create()` call has no `transfer_data` or `on_behalf_of` parameter
- No `stripe_connect_account_id` column exists on the `marinas` table
- Marina owner has no UI path to "Connect with Stripe"

**Phase:** Stripe Connect integration (must be the first Stripe-related work, not an add-on)

---

### Pitfall 2: Double-Booking Race Condition — No Database Lock Between Check and Insert

**What goes wrong:** Two simultaneous checkout requests for the same slip on the same dates can both pass the availability check and both create bookings. The current code reads conflicts, then inserts — a classic check-then-act race condition with no transaction or lock.

**Why it happens:** In `src/app/api/checkout/route.ts` lines 64–78, a SELECT checks for conflicting bookings, then on lines 80–97 a separate INSERT creates the booking. Between those two operations, a concurrent request can pass the same conflict check and also INSERT. Supabase (PostgreSQL) does not auto-serialize these as a unit.

**Consequences:**
- Two confirmed bookings for the same slip on the same dates
- At least one customer is charged for a slip they cannot use
- Manual resolution required: refund one customer, apologize, risk chargeback

**Prevention:**
- Move the conflict check and booking insert into a single Supabase RPC (PostgreSQL function) using `SELECT ... FOR UPDATE` to lock the slip row during the transaction
- Add a partial unique index as a safety net: `CREATE UNIQUE INDEX bookings_no_overlap ON bookings (slip_id, check_in, check_out) WHERE status NOT IN ('cancelled', 'declined');`
- The unique index is a last-resort guard; the RPC with row lock is the primary fix

**Warning signs:**
- Conflict check and booking insert are in separate sequential `await` calls in the same API route
- No `BEGIN/COMMIT` transaction wrapping both operations
- No unique constraint on `(slip_id, check_in, check_out)` for active statuses

**Phase:** Booking flow hardening (address before any real traffic)

---

### Pitfall 3: Webhook Delivery Gap Creates "Paid but Pending" Bookings

**What goes wrong:** A customer completes Stripe Checkout and is charged, but the booking stays in `pending` status because the webhook (`checkout.session.completed`) arrives late or fails. The booking detail page polls for 60 seconds then stops. The customer sees "pending" indefinitely and thinks their booking failed.

**Why it happens:** `src/app/bookings/[id]/page.tsx` lines 54–76 poll every 3 seconds for 60 seconds to compensate for webhook delay. If the webhook takes longer than 60 seconds, or the webhook secret validation fails silently, the booking status never updates to `confirmed`. The webhook handler also has no retry logic — if the Supabase UPDATE fails, the event is consumed and gone.

**Consequences:**
- Customer is charged but sees "pending" — calls support or disputes the charge
- Marina owner sees no confirmed booking — may accept a walk-in for the same slip
- If the customer books again thinking the first failed, double charge

**Prevention:**
- Add idempotency: check whether the booking is already `confirmed` before updating in the webhook handler to prevent duplicate processing
- Add explicit error logging with the booking ID when the Supabase UPDATE fails inside the webhook
- Return HTTP 200 only after a successful database write; Stripe will retry on non-2xx responses
- Replace the 60-second polling with a Supabase Realtime subscription on the booking row: `supabase.from('bookings').on('UPDATE', ...).eq('id', bookingId).subscribe()`
- As a UX fallback, add a "Refresh status" button rather than silently stopping the poll

**Warning signs:**
- Webhook handler returns `{ received: true }` before checking if the database UPDATE succeeded
- No Supabase Realtime subscription in the booking status page
- Booking page polling loop has a hard stop at 60 seconds with no user notification

**Phase:** Booking flow hardening (fix before launch)

---

### Pitfall 4: totalPrice Accepted from Client — Price Tampering Vulnerability

**What goes wrong:** The checkout API receives `totalPrice` in the request body from the client (`src/app/api/checkout/route.ts` line 33) and uses it directly as the Stripe charge amount (`unit_amount: Math.round(totalPrice * 100)`). A user can modify the request and book a $500 slip for $1.

**Why it happens:** The server does not recalculate the price from the slip's `price_per_night` and the number of nights. It trusts the client-supplied total.

**Consequences:**
- Revenue loss on every booking where a user manually crafts the request
- Stripe charge amount does not match what the marina expects to receive
- Audit trail shows discrepancy between booking `total_price` and actual charge

**Prevention:**
- Remove `totalPrice` from the checkout request body
- After fetching the slip from the database, compute the total server-side: `nights = daysBetween(checkIn, checkOut); total = slip.price_per_night * nights`
- Apply EasyDock fee server-side as well: `applicationFee = Math.round(total * FEE_RATE * 100)`
- Store the server-computed total in the booking record, not the client-supplied value

**Warning signs:**
- `totalPrice` appears in the POST request body schema
- `unit_amount` is computed from a value received from the client

**Phase:** Booking flow hardening (fix before any real payment)

---

### Pitfall 5: Map Library API Key Exposed in Client Bundle

**What goes wrong:** When adding map-based search (Google Maps, Mapbox, or similar), developers put the API key directly in environment variables prefixed with `NEXT_PUBLIC_` so the map component can access it. The key is shipped in the client bundle and visible to anyone who opens DevTools. With unrestricted keys, this results in API bill fraud.

**Why it happens:** React/Next.js map components (Mapbox GL, Google Maps JS API) require the key at initialization in the browser. The `NEXT_PUBLIC_` prefix is the obvious solution, and most tutorials use it without restrictions.

**Consequences:**
- API key scraped by bots; map tile requests billed to EasyDock
- Google Maps API bills can reach thousands of dollars overnight from key abuse
- Mapbox has similar metered billing; uncapped usage = unbounded cost

**Prevention:**
- For Google Maps: restrict the API key in Google Cloud Console to specific HTTP referrers (your domain only) and only the Maps JavaScript API
- For Mapbox: restrict the token to specific URLs in the Mapbox account dashboard
- Set billing alerts and API key quotas before deploying the map to production
- Consider server-side tile proxying if budget is a concern, but referrer-restricted keys are sufficient for MVP

**Warning signs:**
- `NEXT_PUBLIC_MAP_API_KEY` in `.env.local` with no restrictions documented
- No billing alert configured in the map provider dashboard
- Key used in a component without checking whether it has referrer restrictions

**Phase:** Map-centric slip discovery

---

### Pitfall 6: Stripe Connect Onboarding Redirect Loop or Incomplete State

**What goes wrong:** Stripe Connect uses an OAuth-style redirect flow (or Express onboarding links). Marina owners start onboarding, get redirected to Stripe, and return to EasyDock. If the return URL handling is wrong, or if the marina owner abandons mid-flow, `stripe_connect_account_id` is never stored, or is stored with an incomplete account that cannot receive payouts.

**Why it happens:** Stripe Connect onboarding is multi-step. An account can be created (`accounts.create`) without being fully onboarded (`charges_enabled: false`, `payouts_enabled: false`). If the app stores the account ID on creation but never verifies `payouts_enabled`, the marina owner appears connected but cannot receive money.

**Consequences:**
- Marina owner thinks they are set up; EasyDock cannot transfer funds after a booking
- Payout failures surface only at time of transfer, not at time of booking
- Marina owner has a bad first experience when their first payout fails

**Prevention:**
- Never mark a marina as "ready to accept bookings" based solely on `stripe_connect_account_id` being non-null
- After the Connect redirect return, call `stripe.accounts.retrieve(accountId)` and check `charges_enabled` and `payouts_enabled`
- Store a `stripe_onboarding_complete` boolean on the marina record, set it only when both flags are true
- Provide a "Complete Stripe setup" re-entry link for incomplete onboarding using `stripe.accountLinks.create({ type: 'account_onboarding' })`
- Listen to `account.updated` webhooks to update `stripe_onboarding_complete` in real time

**Warning signs:**
- No check of `charges_enabled`/`payouts_enabled` after storing Connect account ID
- Marina can go live without `stripe_onboarding_complete = TRUE`
- No webhook handler for `account.updated` events

**Phase:** Stripe Connect integration

---

## Moderate Pitfalls

Mistakes that degrade reliability or user experience but do not cause money loss.

---

### Pitfall 7: Date Boundary Off-By-One in Conflict Detection

**What goes wrong:** The conflict query uses `lt("check_in", checkOut)` and `gt("check_out", checkIn)`. This is the correct interval overlap condition, but because dates are stored as `DATE` (not `TIMESTAMPTZ`), a booking from March 10–12 and a new booking from March 12–14 will correctly NOT conflict — the last night of one is the first night of the next, which is valid for marina slips. However, if the logic were reversed or boundary conditions changed, consecutive bookings would be incorrectly blocked.

**What goes wrong (secondary):** The `totalPrice` is computed on the frontend using JavaScript date arithmetic that varies by timezone. A user in EST computing "March 10 to March 12" may produce a different number of nights than the server expects, depending on how dates are serialized. The server stores `DATE` but the client sends ISO datetime strings.

**Prevention:**
- Normalize all date inputs to `YYYY-MM-DD` strings before sending to the API; strip any time component
- Server-side: validate `checkIn < checkOut` before the conflict query
- Document the "same-day checkout" rule (checkout day is not a billing night) in a comment in the checkout route

**Warning signs:**
- Dates passed as full ISO timestamps (`2026-03-10T00:00:00.000Z`) rather than plain date strings
- Frontend computes nights using `Date` objects without timezone normalization

**Phase:** Booking flow hardening

---

### Pitfall 8: Photo Upload Without File Validation or Size Limits

**What goes wrong:** `src/lib/supabase/storage.ts` uploads whatever `File` object is passed to it. There is no check on file type (could upload a `.exe`), file size (could upload a 100MB RAW camera file), or total photo count per marina (no limit enforced at the application layer).

**Why it happens:** The storage helper is minimal — it trusts the caller to validate. No middleware enforces size or type before the Supabase Storage upload call.

**Consequences:**
- Storage costs grow unbounded if marina owners upload large files
- Non-image files served from a public bucket could be a distribution vector
- The `marinas.photos` array has no length constraint, so a marina can store hundreds of URLs

**Prevention:**
- In the upload UI component, validate: `file.type.startsWith('image/')` and `file.size < 5 * 1024 * 1024` (5MB limit) before calling `uploadMarinaPhoto`
- Enforce a maximum of 10 photos per marina/slip in the UI before upload and with a database CHECK constraint: `CHECK (array_length(photos, 1) <= 10)`
- Set Supabase Storage bucket size limits in the dashboard if available

**Warning signs:**
- `uploadMarinaPhoto()` called without preceding MIME type or size check in the component
- No `array_length` CHECK constraint on `marinas.photos`

**Phase:** Marina onboarding / photo upload

---

### Pitfall 9: Map Markers All Loaded at Once — No Clustering or Viewport Bounds Filter

**What goes wrong:** When adding a map to the search page, a common mistake is to fetch all active marinas and render all of them as map markers simultaneously. With 50+ marinas, this creates DOM and render performance issues. With 500+, the map becomes unusable.

**Why it happens:** The existing search page already loads all available slips in memory and filters client-side. This pattern will be carried into the map implementation if not deliberately broken.

**Prevention:**
- Use marker clustering from the start (Mapbox: `supercluster`; Google Maps: `@googlemaps/markerclusterer`)
- Implement viewport-bounds filtering: only query/display marinas within the current map bounding box, re-querying on map move
- The Supabase query should filter by lat/lng bounding box: `gte('lat', bounds.south).lte('lat', bounds.north).gte('lng', bounds.west).lte('lng', bounds.east)`
- For South Florida MVP with fewer than 100 marinas, clustering is enough; bounding box queries can be added in a follow-up

**Warning signs:**
- Map search query has no spatial filter — it fetches all `is_active = TRUE` marinas regardless of viewport
- No clustering library in `package.json`

**Phase:** Map-centric slip discovery

---

### Pitfall 10: Missing `stripe_connect_account_id` Blocks Cancellation Refunds

**What goes wrong:** The current codebase has no refund logic. When Stripe Connect is added, refunds become more complex: for a split payment, you must refund the original charge using the connected account's charge ID, and specify whether to reverse the application fee. A direct `stripe.refunds.create({ charge: id })` will not work correctly for Connect charges.

**Prevention:**
- When creating the booking, store both the `payment_intent_id` and the `charge_id` (retrieved from the payment intent after capture)
- When implementing refunds, use `stripe.refunds.create({ charge: chargeId, reverse_transfer: true, refund_application_fee: true })` for full cancellation refunds
- Define and document the cancellation/refund policy before building the refund endpoint — partial refunds require knowing the policy at code time

**Warning signs:**
- Cancellation flow calls `stripe.refunds.create()` without `reverse_transfer` parameter
- No `stripe_charge_id` stored at booking confirmation time (the schema has `stripe_charge_id` column but the webhook handler only stores `payment_intent_id`)

**Phase:** Booking management / cancellation flow

---

### Pitfall 11: RLS Prevents Admin from Reading User Profiles

**What goes wrong:** The `profiles` RLS policy `"Users can read own profile"` uses `auth.uid() = id`, which means no user can read another user's profile — including admins. Any admin dashboard feature that lists users or looks up a booking participant's contact info will fail with an RLS-blocked empty result.

**Why it happens:** The policy was written for the self-service case. Admin bypass was not included. Documented in CONCERNS.md but not yet fixed.

**Consequences:**
- Admin dashboard cannot display user names or contact info alongside bookings
- Support workflows require jumping to Supabase Dashboard to look up users manually

**Prevention:**
- Add an admin bypass policy: `CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));`
- Note: this creates a recursive policy — Supabase handles this with `SECURITY DEFINER` helper functions. Use a helper function approach instead to avoid infinite recursion
- Alternatively, use the admin client (service role) for all admin dashboard queries, bypassing RLS entirely

**Warning signs:**
- Admin dashboard returns empty profile lists
- No "admin bypass" policy on the `profiles` table

**Phase:** Admin/booking management

---

## Minor Pitfalls

---

### Pitfall 12: Manually Maintained TypeScript Types Drift from Schema

**What goes wrong:** `src/types/database.ts` is hand-written and must be updated every time a migration is run. Migration files 003–006 added columns (phone, email, website on marinas) that may not be reflected in the TypeScript types. The `as unknown as` casts throughout the codebase hide these mismatches until runtime.

**Prevention:**
- Add to `package.json`: `"types:gen": "supabase gen types typescript --schema public > src/types/database.ts"`
- Run this after every migration and commit the updated types file
- Remove `as unknown as` type assertions incrementally once types are auto-generated

**Warning signs:**
- New migration added but `types:gen` not run
- `as unknown as` casts in API routes accessing recently added columns

**Phase:** Any phase that adds a database migration

---

### Pitfall 13: Booking Created Before Stripe Session — Orphaned Pending Bookings

**What goes wrong:** The checkout flow creates a booking record in `pending` status, then creates a Stripe Checkout session. If the user abandons the Stripe Checkout page (closes the tab, back button), the booking stays in `pending` indefinitely. Over time, the bookings table accumulates phantom pending records that block availability.

**Why it happens:** The current code handles `checkout.session.expired` webhook to cancel the booking. But if the session is created and the user never reaches Stripe (network error on redirect), there is no expiry event.

**Prevention:**
- Stripe Checkout sessions expire after 24 hours by default; the `checkout.session.expired` webhook fires and cancels the booking — verify this handler is working
- Add a Supabase scheduled job (pg_cron) that cancels bookings older than 2 hours that are still `pending` with no `stripe_payment_intent_id`
- Filter `pending` bookings without payment intent from conflict detection if desired

**Warning signs:**
- More than a handful of `pending` bookings with null `stripe_payment_intent_id` in the database
- No cron job cleaning up stale pending bookings

**Phase:** Booking flow hardening

---

### Pitfall 14: Search Page Requires Login — Hurts Conversion

**What goes wrong:** `src/app/search/page.tsx` wraps in `<ProtectedRoute allowedRoles={["boat_owner"]}>`. A marina owner or unauthenticated visitor navigating to the search page is redirected to login. This creates friction for potential customers who want to browse before committing.

**Prevention:**
- For the map-based search, allow unauthenticated browsing of marina locations and slip listings
- Gate only the booking action (redirect to signup/login when "Book Now" is clicked)
- Remove `ProtectedRoute` from the search/map page, or replace it with an optional auth check

**Warning signs:**
- Map/search page wrapped in `ProtectedRoute`
- Unauthenticated test shows immediate redirect instead of map view

**Phase:** Map-centric slip discovery

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Stripe Connect integration | Onboarding incomplete state — account created but `payouts_enabled: false` | Check both `charges_enabled` and `payouts_enabled` before marking marina live |
| Stripe Connect integration | Current checkout sends full amount to platform account, not connected account | Rewrite checkout with `transfer_data.destination` before any real booking |
| Booking checkout | Client-supplied `totalPrice` used as Stripe charge amount | Recalculate server-side from slip record |
| Booking checkout | Race condition on double-booking | Supabase RPC with row lock + partial unique index |
| Booking management | Webhook delay leaves users in "paid but pending" limbo | Supabase Realtime subscription + webhook error logging |
| Booking management | Cancellation refunds incorrect for Connect split payments | Store `stripe_charge_id`; use `reverse_transfer: true` |
| Map discovery | API key exposed without referrer restrictions | Restrict key in provider dashboard before deploying |
| Map discovery | All markers loaded at once | Add clustering library from the start |
| Map discovery | Search requires login, blocks browsing | Remove `ProtectedRoute` from map page |
| Marina onboarding | Photo uploads without type/size validation | Validate in UI component before upload call |
| Marina onboarding | Marina deactivated while bookings are active | Database trigger blocking `is_active = FALSE` with pending/confirmed bookings |
| Any migration | TypeScript types not regenerated after schema change | Run `types:gen` as part of every migration |
| Admin features | RLS blocks admin from reading profiles | Add admin bypass policy or use service role client |

---

## Sources

- **CONCERNS.md** (codebase analysis, 2026-03-09) — direct source for pitfalls 1–3, 7–8, 11–13 (HIGH confidence, sourced from actual code)
- **src/app/api/checkout/route.ts** — direct verification of price tampering vulnerability, race condition, and missing Connect parameters (HIGH confidence)
- **src/app/api/webhooks/stripe/route.ts** — direct verification of webhook gap, missing idempotency, missing charge ID storage (HIGH confidence)
- **src/app/search/page.tsx** — direct verification of ProtectedRoute wrapping, client-side filtering pattern (HIGH confidence)
- **database/001_initial_schema.sql** — verification of RLS policies, DATE type usage, missing unique constraints (HIGH confidence)
- **database/004_storage_bucket.sql** — verification of storage policy structure, no size constraints (HIGH confidence)
- Stripe Connect documentation patterns — Stripe Connect architecture (MEDIUM confidence, training knowledge, recommend verifying at https://stripe.com/docs/connect/collect-then-transfer-guide)
- Map API key restriction patterns — Google Maps / Mapbox key restriction (MEDIUM confidence, standard industry practice)
