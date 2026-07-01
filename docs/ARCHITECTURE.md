# EasyDock Architecture Documentation

> **Current stack:** Next.js 15 (App Router) + Supabase + Stripe Connect, deployed on Vercel.
> The old vanilla JS / Netlify app is archived in `app-legacy/`.

## Project Structure

```
easydock/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout (nav, auth provider, analytics)
│   │   ├── page.tsx            # Home / landing page
│   │   ├── search/             # Marina search with map
│   │   ├── marinas/[id]/       # Marina detail pages
│   │   ├── slips/[id]/         # Slip detail pages (dynamic OG metadata)
│   │   ├── bookings/           # Booking management (boat owner)
│   │   ├── dashboard/          # Marina owner dashboard
│   │   ├── admin/              # Admin panel
│   │   ├── login/              # Login page
│   │   ├── signup/             # Signup page (role selection)
│   │   ├── forgot-password/    # Password reset request
│   │   ├── reset-password/     # Password reset confirmation
│   │   ├── auth/callback/      # Supabase auth callback handler
│   │   ├── claim/              # Marina claim flow
│   │   ├── blog/               # SEO blog content
│   │   ├── pricing/            # Pricing page
│   │   ├── calculator/         # ROI calculator
│   │   ├── about/              # About page
│   │   ├── terms/              # Terms of service
│   │   ├── privacy/            # Privacy policy
│   │   ├── robots.ts           # robots.txt (dynamic, disallows auth/admin paths)
│   │   ├── sitemap.ts          # sitemap.xml (dynamic)
│   │   ├── not-found.tsx       # 404 page
│   │   ├── error.tsx           # Global error boundary
│   │   └── api/                # API routes
│   │       ├── checkout/       # Stripe checkout session creation
│   │       ├── webhooks/stripe/ # Stripe webhook handler
│   │       ├── connect/        # Stripe Connect (onboard/return/refresh/login-link)
│   │       ├── bookings/[id]/  # Booking actions (approve/deny/cancel)
│   │       ├── marinas/        # Marina CRUD
│   │       ├── slips/          # Slip CRUD
│   │       ├── leads/          # Lead capture
│   │       ├── calculator-leads/ # Calculator lead capture
│   │       └── admin/          # Admin endpoints
│   ├── components/             # Shared React components
│   │   └── ui/                 # UI primitives (LoadingSpinner, etc.)
│   ├── lib/
│   │   ├── auth-context.tsx    # AuthProvider + useAuth hook
│   │   └── supabase/
│   │       ├── client.ts       # Browser Supabase client
│   │       └── server.ts       # Server-side Supabase client
│   └── types/
│       └── database.ts         # TypeScript types matching DB schema
├── database/                   # SQL migrations (apply in order in Supabase SQL editor)
│   ├── 001_initial_schema.sql  # Core tables: profiles, marinas, slips, bookings
│   ├── 002_seed.sql            # Test seed data
│   ├── 003_*.sql               # Marina leads, claim flow, profile trigger fixes
│   ├── 004_*.sql               # Storage bucket, CSV import
│   ├── 005_*.sql               # Marina spot requests, owner slip read policy
│   ├── 006_marina_leads.sql
│   ├── 007_booking_hardening.sql
│   ├── 008_stripe_connect.sql  # stripe_account_id on marinas, Connect status
│   ├── 009_marina_leads_intake_fields.sql
│   ├── 010_slip_shore_power_type.sql
│   ├── 011_waitlist_signups.sql
│   └── 012_public_slip_reads.sql  # Public (anon) read on marinas/slips for SEO
├── docs/
│   ├── DEPLOYMENT.md           # Vercel deployment + Stripe live-mode runbook
│   ├── ARCHITECTURE.md         # This file
│   └── SETUP_GUIDE.md          # Local dev setup
├── public/                     # Static assets
├── app-legacy/                 # Archived vanilla JS app (do not use)
└── cold-email-automation/      # Python outreach tools (EAS-26)
```

## Technology Stack

### Frontend
- **Next.js 15** (App Router) — server components, streaming, dynamic routes
- **React 19** — client components where interactivity is needed
- **TypeScript** — strict typing throughout
- **Tailwind CSS 4** — utility-first styling, navy/teal theme

### Backend
- **Supabase** — PostgreSQL, Auth, Row Level Security, Storage
- **Next.js API routes** — server-side business logic, webhook handling

### Payments
- **Stripe Connect** — platform payments + marina owner payouts (currently test mode; live pending EAS-118)
- Webhook handler at `/api/webhooks/stripe` handles `checkout.session.completed`, `checkout.session.expired`, `account.updated`

### Hosting & Observability
- **Vercel** — hosting, edge middleware, preview deployments, analytics
- **Resend** — transactional email (booking notifications, lead alerts)
- **@vercel/analytics** — conversion event tracking

## Database Schema

### Core Tables

1. **profiles** — extends `auth.users`; stores `role` (boat_owner | marina_owner | admin), `company_name`, `phone`, `stripe_account_id`
2. **marinas** — listings with location, amenities, `is_active`, `stripe_account_id`, `stripe_onboarding_complete`
3. **slips** — individual dock slips with dimensions, daily/weekly/monthly rates, power/water
4. **bookings** — booking records; status flow: `pending → approved → confirmed → completed`; also `declined` and `cancelled`

### Row Level Security

- All tables have RLS enabled
- Marinas and slips: public (anon + authenticated) read when `is_active = TRUE` (migration 012)
- Bookings: boat owner sees own; marina owner sees bookings for their marina; admin sees all
- Profiles: users see their own; marina owners see profiles of their bookers

### Auth Trigger

`handle_new_user()` fires on `auth.users` insert; creates the `profiles` row including `full_name`, `role`, `company_name`, and `phone` from `raw_user_meta_data`. Migration `003_profile_trigger_company_phone.sql` extends the original trigger.

## User Flows

### Boat Owner
1. Sign up (email confirmation) → search marinas → view slip detail → create booking (Stripe checkout) → marina owner approves → confirmed → completed

### Marina Owner
1. Sign up → dashboard → list marina/slips → complete Stripe Connect onboarding → receive bookings → approve → receive payout
2. Or: claim an unclaimed marina listing via `/claim`

### Admin
1. Admin panel → approve/reject marina listings → manage users

## Security Model

- **Authentication**: Supabase Auth (email/password + email confirmation)
- **Authorization**: Supabase RLS policies (server-enforced)
- **API routes**: service-role key only on server; anon key on client
- **Stripe webhooks**: signature verification with `STRIPE_WEBHOOK_SECRET`
- **Booking state guards**: approve and deny routes reject non-pending bookings with 422

## Deployment

Push to `main` → Vercel auto-deploys. See `docs/DEPLOYMENT.md` for the Stripe live-mode switch runbook and environment variable reference.
