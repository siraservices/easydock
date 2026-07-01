# EasyDock — Marina Booking Marketplace

A full-stack marina booking marketplace connecting boat owners with marina owners for dock slip reservations.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **Hosting**: Vercel — deployed at https://easydock.vercel.app
- **Payments**: Stripe Connect (test mode; live switch pending Stripe account verification — see EAS-118)
- **Email**: Resend (transactional emails via React Email templates)
- **Analytics**: Vercel Analytics (custom events for booking/claim/lead funnel)

## Quick Start

```bash
npm install
npm run dev    # http://localhost:3000
```

Environment variables required (copy from Vercel dashboard → EasyDock → Settings → Env Vars):
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY` / `NEXT_PUBLIC_APP_URL`

## Deploy

Push to `main` → Vercel auto-deploys. All env vars live in the Vercel dashboard (not Netlify).

For the Stripe live-mode switch runbook, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Project Structure

```
easydock/
├── src/
│   ├── app/                # Next.js App Router pages + API routes
│   ├── components/         # Shared React components
│   ├── lib/supabase/       # Supabase client (browser + server)
│   └── types/database.ts   # TypeScript types from DB schema
├── database/               # SQL migrations (001–012)
├── docs/                   # Deployment, architecture, and setup guides
├── public/                 # Static assets
└── supabase/               # Supabase local dev config
```

## Database

Run migrations in order (`database/001_initial_schema.sql` through `database/012_public_slip_reads.sql`) in the Supabase SQL Editor. Seed with `database/002_seed.sql` for local dev.

## Testing

```bash
npm test          # Vitest unit + integration tests
npm run build     # TypeScript + Next.js build check
```

## User Roles

- `boat_owner` — searches and books slips
- `marina_owner` — manages marina listings, slips, and bookings
- `admin` — approves marinas, views analytics (set manually in Supabase dashboard)

## Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) — Vercel deploy + Stripe live-mode runbook
- [Setup Guide](docs/SETUP_GUIDE.md) — Local dev setup
- [Architecture](docs/ARCHITECTURE.md) — System design

## License

Private — All rights reserved
