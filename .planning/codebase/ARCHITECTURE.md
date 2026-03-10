# Architecture

**Analysis Date:** 2026-03-09

## Pattern Overview

**Overall:** Next.js 15 full-stack marketplace with Supabase backend and role-based access control

**Key Characteristics:**
- Client-Server architecture with Next.js App Router (SSR/SSG hybrid)
- Supabase PostgreSQL database with Row Level Security (RLS) enforcing data access
- Three user roles: boat_owner, marina_owner, admin
- Stateful auth context propagated through React Context
- Stripe Connect integration for payment processing
- Event-driven booking lifecycle with status workflow

## Layers

**Presentation Layer:**
- Purpose: React components rendering UI with Tailwind CSS styling
- Location: `src/app/` (pages), `src/components/` (reusable components)
- Contains: Page components, UI components (cards, forms, modals), layout components
- Depends on: Auth Context, Supabase client, utility functions
- Used by: Browser client

**Application Layer:**
- Purpose: Business logic, API routes, and state management
- Location: `src/app/api/` (API endpoints), `src/lib/` (business logic)
- Contains: Auth context, Supabase clients, utility functions, constants
- Depends on: Supabase SDK, Stripe SDK, Next.js runtime
- Used by: Components and API consumers

**Data Access Layer:**
- Purpose: Database interaction and authentication
- Location: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/types/database.ts`
- Contains: Supabase client factories, TypeScript type definitions for DB schema
- Depends on: @supabase/ssr, @supabase/supabase-js
- Used by: Auth context, components, API routes

**Database Layer:**
- Purpose: Data persistence with security policies
- Location: `database/001_initial_schema.sql` (schema), Supabase backend
- Contains: Tables (profiles, marinas, slips, bookings), indexes, RLS policies, triggers
- Depends on: PostgreSQL, Auth extension
- Used by: Supabase client via RLS-enforced queries

## Data Flow

**User Signup Flow:**

1. User submits email/password/name/role to `/signup`
2. `AuthProvider.signUp()` calls Supabase Auth API
3. Supabase Auth trigger (`handle_new_user`) creates profile row
4. Optional: Profile enriched with company_name/phone via `profiles.update()`
5. Auth session stored in cookies (via @supabase/ssr)
6. Component re-renders with `useAuth()` reflecting new user

**Search & Booking Flow:**

1. Boat owner navigates to `/search`
2. `SearchPage` component calls `slips.select("*, marinas!inner(*)")` with RLS filtering
3. Only active marinas' slips returned (RLS policy enforces)
4. If dates provided: queries `bookings` to detect conflicts (status IN pending/approved/confirmed)
5. Boat owner clicks slip → navigates to `/slips/[id]`
6. Slip detail fetches full slip + marina with booking widget
7. Boat owner sets dates, vessel info → clicks "Book & Pay"
8. Browser calls `POST /api/checkout`
9. Checkout route creates booking with status "pending", generates Stripe session
10. Browser redirected to Stripe Checkout → payment → success_url with bookingId

**Marina Owner Dashboard Flow:**

1. Marina owner navigates to `/dashboard`
2. `DashboardPage` queries `marinas.select()` filtered by `owner_id = auth.uid()` (RLS enforces)
3. Shows card for each marina with slip count
4. Owner clicks marina → `/dashboard/marinas/[id]`
5. Owner can create slip via modal, delete slip, edit marina details
6. All CRUD operations flow through Supabase with RLS validation

**State Management:**

- **Auth State:** AuthProvider (React Context) stores user, profile, loading state. Syncs with Supabase `auth.onAuthStateChange()`.
- **Page State:** Components use `useState` for form inputs, loading, search filters. No global state management (Redux/Zustand).
- **Server State:** Database is source of truth. Components fetch on mount/filter change, cache in local state.
- **Client Tokens:** Supabase session stored in HTTP-only cookies (managed by @supabase/ssr, not exposed to JavaScript).

## Key Abstractions

**AuthProvider (Context):**
- Purpose: Centralize authentication logic and user session management
- Examples: `src/lib/auth-context.tsx`
- Pattern: React Context Provider + custom hook `useAuth()`. Exposes signUp, signIn, signOut, user, profile, loading.

**Supabase Clients (Factory):**
- Purpose: Separate browser-side and server-side database access
- Examples: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`
- Pattern: `createClient()` factory returns typed Supabase instance. Server client reads cookies; browser client sends auth headers.

**ProtectedRoute Component:**
- Purpose: Guard pages based on user role and auth state
- Examples: `src/components/protected-route.tsx`
- Pattern: Wraps pages, checks `useAuth()`. Redirects to login if unauthenticated; redirects to home if role mismatch.

**Database Types (TypeScript):**
- Purpose: Type-safe database queries
- Examples: `src/types/database.ts`
- Pattern: Database interface generated/manually maintained. All table rows, inserts, updates typed. Prevents runtime errors.

**API Checkout Handler:**
- Purpose: Backend payment initiation and booking creation
- Examples: `src/app/api/checkout/route.ts`
- Pattern: Server-side POST handler. Validates user, checks slip availability, detects booking conflicts, creates booking, calls Stripe API, returns session URL.

## Entry Points

**Home Page:**
- Location: `src/app/page.tsx`
- Triggers: User navigates to `/`
- Responsibilities: Marketing landing page. Links to search or signup. Shows build progress checklist.

**Root Layout (Auth Wrapper):**
- Location: `src/app/layout.tsx`
- Triggers: Every page load
- Responsibilities: Wraps all pages with AuthProvider, renders Navbar, applies global Tailwind styles.

**Search Page (Boat Owner):**
- Location: `src/app/search/page.tsx`
- Triggers: Authenticated boat owner navigates to `/search`
- Responsibilities: Fetch slips by city/dates/boat length. Filter for availability. Render slip cards.

**Dashboard (Marina Owner):**
- Location: `src/app/dashboard/page.tsx`
- Triggers: Authenticated marina owner navigates to `/dashboard`
- Responsibilities: Fetch user's marinas. Display marina cards. Link to detail/create flows.

**Checkout API:**
- Location: `src/app/api/checkout/route.ts`
- Triggers: Client calls `POST /api/checkout`
- Responsibilities: Validate booking request. Check slip availability. Detect date conflicts. Create pending booking. Call Stripe. Return checkout URL.

## Error Handling

**Strategy:** Try-catch in async operations. Return error messages to client. Log errors server-side. No global error boundary yet.

**Patterns:**
- API routes return `NextResponse.json({ error: "message" }, { status: 4xx/5xx })`
- Components catch fetch errors, display error message in UI
- Supabase query errors logged, null returned if retrieval fails
- Auth errors (invalid credentials) return error message, user corrects and retries

**Notable gaps:**
- No error boundary in React tree (crashes not caught gracefully)
- No centralized error logging service
- Stripe webhook errors not documented

## Cross-Cutting Concerns

**Logging:**
- Approach: `console.log/error` in development. Browser DevTools and server stdout capture.
- No structured logging to external service yet.

**Validation:**
- Approach: Client-side form validation (check required fields, date ranges, vessel length vs slip capacity).
- Database enforces NOT NULL, CHECK constraints, referential integrity.
- API route validates required fields before DB operations.

**Authentication:**
- Approach: Supabase Auth (JWT tokens in cookies via @supabase/ssr).
- RLS policies check `auth.uid()` on every query.
- ProtectedRoute component checks user role before rendering page.

**Authorization:**
- Approach: Role-based (boat_owner, marina_owner, admin in profiles.role).
- Marina owner pages check user.profile.role === "marina_owner".
- Boat owner pages check user.profile.role === "boat_owner".
- RLS enforces: boat owner sees only own bookings; marina owner sees bookings/slips/marinas for own marinas.

**Pagination:**
- Approach: Not implemented. All queries return full result set (scalability risk).

---

*Architecture analysis: 2026-03-09*
