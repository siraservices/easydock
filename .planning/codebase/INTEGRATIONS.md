# External Integrations

**Analysis Date:** 2026-03-09

## APIs & External Services

**Payment Processing:**
- Stripe - Payment processing for dock slip bookings
  - SDK/Client: `stripe` npm package (20.4.0)
  - Auth: `STRIPE_SECRET_KEY` environment variable
  - Integration point: `src/app/api/checkout/route.ts`
  - Webhook listener: `src/app/api/webhooks/stripe/route.ts`
  - Usage: Checkout sessions, payment intent tracking, webhook events

**Email Services:**
- Gmail SMTP - Outbound email for cold email automation
  - Client: Python smtplib via `cold-email-automation/email_automation.py`
  - Auth: `SENDER_EMAIL` and `SENDER_PASSWORD` (.env file in cold-email-automation/)
  - SMTP Server: smtp.gmail.com:587 (TLS)

## Data Storage

**Databases:**
- PostgreSQL (via Supabase)
  - Connection: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Client: `@supabase/supabase-js` (2.47.12)
  - Tables: `profiles`, `marinas`, `slips`, `bookings`, `marina_leads`
  - Auth integration: Extends Supabase `auth.users` table
  - Row Level Security (RLS): Enabled on all tables for data isolation

**File Storage:**
- Supabase Storage - Marina photos and documents
  - Access: Via Supabase client library
  - Bucket configuration: `src/lib/supabase/storage.ts`
  - Path: `marinas/` storage bucket for marina photos

**Caching:**
- None implemented - Direct database queries via Supabase

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (PostgreSQL-backed)
  - Implementation: Custom auth context in `src/lib/auth-context.tsx`
  - Session management: Cookie-based via `@supabase/ssr`
  - User roles: `boat_owner`, `marina_owner`, `admin` (stored in `profiles.role`)
  - Implementation details:
    - Browser client: `src/lib/supabase/client.ts` (anonymous key)
    - Server client: `src/lib/supabase/server.ts` (anonymous key with cookie handling)
    - Admin client: `src/lib/supabase/admin.ts` (service role key for webhooks)

## Monitoring & Observability

**Error Tracking:**
- None detected - Not yet implemented

**Logs:**
- Console logging only - Development stage
  - Checkout errors logged to console in `src/app/api/checkout/route.ts`
  - Stripe webhook signature errors logged in `src/app/api/webhooks/stripe/route.ts`

## CI/CD & Deployment

**Hosting:**
- Netlify - Primary deployment platform
  - Plugin: `@netlify/plugin-nextjs` (for Next.js SSR support)
  - Build command: `npm run build`
  - Publish directory: `.next/`
  - Configuration file: `netlify.toml`

**CI Pipeline:**
- None detected - Manual deployments to Netlify

## Environment Configuration

**Required env vars (production):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (admin, server-side only)
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook endpoint secret
- `SENDER_EMAIL` - Gmail sender address (email automation only)
- `SENDER_PASSWORD` - Gmail app password (email automation only)

**Secrets location:**
- Local development: `.env.local` (gitignored)
- Email automation: `cold-email-automation/.env` (gitignored)
- Production (Netlify): Environment variables in Netlify dashboard
- Supabase credentials: Stored securely in Supabase project settings

## Webhooks & Callbacks

**Incoming:**
- Stripe webhooks - Payment status updates
  - Endpoint: `POST /api/webhooks/stripe`
  - Events: `checkout.session.completed`, `checkout.session.expired`
  - Signature validation: Via `stripe.webhooks.constructEvent()`
  - Actions:
    - `checkout.session.completed`: Updates booking to "confirmed" status, stores payment intent ID
    - `checkout.session.expired`: Updates booking to "cancelled" status

**Outgoing:**
- Stripe redirect URLs (user-facing callbacks, not webhooks)
  - Success: `/bookings/{bookingId}?success=true`
  - Cancel: `/slips/{slipId}`

## Database Schema Integration Points

**Booking → Stripe Integration:**
- Bookings table stores `stripe_payment_intent_id` and `stripe_charge_id` for reconciliation
- Booking status workflow: `pending` → `confirmed` (on payment) → `completed` (after stay)
- Metadata passing: Booking ID sent in Stripe session metadata for webhook matching

**Profiles ↔ Auth Integration:**
- `profiles` table has `id` UUID foreign key referencing `auth.users.id`
- ON DELETE CASCADE ensures profile cleanup when user deleted
- User roles stored in `profiles.role` for RLS policies

---

*Integration audit: 2026-03-09*
