# CLAUDE.md - EasyDock Development Guide

This file provides context for Claude Code when working on this project.

## Project Overview

EasyDock is a marina booking marketplace MVP that connects boat owners with marina owners for dock slip reservations. Built as a full-stack application using Next.js, TypeScript, Tailwind CSS, and Supabase.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4 with navy/teal theme
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Row Level Security)
- **Hosting**: Vercel (deployed at https://easydock.vercel.app; analytics via `@vercel/analytics`)
- **Payments**: Stripe Connect (test mode; live mode pending board verification — see EAS-118)

## Project Structure

```
easydock/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with nav + metadata
│   │   ├── page.tsx            # Home/landing page
│   │   ├── globals.css         # Tailwind imports + theme
│   │   ├── robots.ts           # robots.txt (disallows admin/dashboard/api)
│   │   ├── sitemap.ts          # Dynamic sitemap.xml including all marina URLs
│   │   ├── not-found.tsx       # Branded 404 page
│   │   ├── error.tsx           # Global error boundary
│   │   ├── about/              # About page
│   │   ├── admin/              # Admin dashboard (bookings panel, leads, marinas)
│   │   ├── api/                # API routes
│   │   │   ├── admin/          # Admin endpoints (bookings, leads)
│   │   │   ├── bookings/       # Booking CRUD + approve/deny/cancel
│   │   │   ├── calculator-leads/ # Lead capture from pricing calculator
│   │   │   ├── leads/          # Marina lead intake
│   │   │   ├── marinas/        # Marina management + bookings inbox
│   │   │   ├── slips/          # Slip management
│   │   │   ├── stripe/         # Stripe Connect onboarding
│   │   │   └── webhooks/stripe # Stripe webhook handler
│   │   ├── auth/callback/      # Supabase auth callback (preserves returnTo)
│   │   ├── blog/               # SEO blog — 5+ posts targeting marina/boat-owner keywords
│   │   ├── bookings/           # Boat owner bookings list (upcoming + past)
│   │   ├── calculator/         # ROI calculator with lead capture
│   │   ├── claim/              # Public marina claim flow
│   │   ├── dashboard/          # Marina owner dashboard + slip management
│   │   ├── forgot-password/    # Password recovery
│   │   ├── login/              # Email/password login
│   │   ├── marinas/[id]/       # Public marina profile page
│   │   ├── pricing/            # Pricing page with CTA
│   │   ├── privacy/            # Privacy policy
│   │   ├── reset-password/     # Reset password (Supabase recovery flow)
│   │   ├── search/             # Interactive map search (Mapbox)
│   │   ├── signup/             # Role-aware signup (role + returnTo params)
│   │   ├── slips/[id]/         # Public slip detail + booking widget
│   │   └── terms/              # Terms of service
│   ├── components/             # Shared React components
│   ├── config/                 # App configuration
│   ├── emails/                 # React Email templates (Resend)
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts       # Browser Supabase client
│   │       └── server.ts       # Server-side Supabase client
│   ├── middleware.ts            # Auth middleware (protects dashboard/admin/bookings)
│   └── types/
│       └── database.ts         # TypeScript types matching DB schema
├── database/                   # SQL migrations (001–012); run in Supabase SQL Editor
├── docs/                       # ARCHITECTURE.md, DEPLOYMENT.md, SETUP_GUIDE.md
├── landing-page/               # Legacy standalone landing page (archived)
├── cold-email-automation/      # Python email outreach tools
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
└── .env.local                  # Supabase + Stripe credentials (gitignored)
```

## Key Database Tables

- `profiles` - User data (extends auth.users), roles: boat_owner, marina_owner, admin
- `marinas` - Marina listings with location, amenities, photos
- `slips` - Individual dock slips with dimensions, rates, power/water
- `bookings` - Booking records with status workflow and vessel info

## Development Commands

```bash
# Local development
npm run dev        # Start Next.js dev server at localhost:3000
npm run build      # Production build
npm run lint       # Run ESLint

# Database
# Run database/001_initial_schema.sql in Supabase SQL Editor
# Then run database/002_seed.sql for test data
```

## Important Conventions

### Security
- Row Level Security (RLS) is enabled on all tables - respect these policies
- Never commit `.env.local` with real Supabase credentials
- Use `@supabase/ssr` for both client and server Supabase clients
- Admin role must be manually set in Supabase Dashboard

### User Roles
- `role` in profiles: boat_owner | marina_owner | admin

### Booking Status Flow
pending -> approved -> confirmed -> completed
pending -> declined
pending/approved/confirmed -> cancelled

### Supabase Client Usage
- Browser components: `import { createClient } from "@/lib/supabase/client"`
- Server components/actions: `import { createClient } from "@/lib/supabase/server"`

### Styling
- Use Tailwind CSS utility classes
- Theme colors: `navy-*` (primary) and `teal-*` (accent)
- Responsive design: mobile-first approach

## Files to Never Commit

- `.env.local` (Supabase credentials)
- `.env` files
- `app/config.js` (legacy credentials)
- `cold-email-automation/*.csv` (contact lists)

## Current Status (as of 2026-07-01)

All core features are shipped and production-verified (132 tests green):
- Auth: signup/login/logout with role-based access, email confirmation, password reset
- Marina search: Mapbox interactive map, vessel dimension filters, public browsing
- Booking flow: full lifecycle pending→approved→confirmed→completed, email notifications
- Stripe Connect: Test-mode verified end-to-end (live-mode pending board — see EAS-118)
- Marina owner dashboard: slip CRUD, bookings inbox with approve/deny, onboarding checklist
- Photo upload for marinas: drag-and-drop via Supabase Storage
- SEO: blog (5 posts), sitemap.xml, robots.txt, per-page OG/Twitter metadata
- Admin: bookings panel, leads panel, GMV stats

## Pending Board Action

**EAS-118** — Stripe live-mode switch (revenue unblock). Engineering work is complete.
Board must complete Stripe business verification and provide live keys. See `docs/DEPLOYMENT.md` for the runbook.
