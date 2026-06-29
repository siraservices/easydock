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
│   │   ├── layout.tsx          # Root layout with nav
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Tailwind imports + theme
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts       # Browser Supabase client
│   │       └── server.ts       # Server-side Supabase client
│   ├── components/             # Shared React components (coming)
│   └── types/
│       └── database.ts         # TypeScript types matching DB schema
├── database/
│   ├── 001_initial_schema.sql  # Current schema (profiles, marinas, slips, bookings)
│   ├── 002_seed.sql            # Test seed data
│   └── schema_legacy.sql       # Old v1 schema (reference only)
├── landing-page/               # Marketing landing page
├── cold-email-automation/      # Python email outreach tools
├── docs/                       # Setup, architecture, deployment guides
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

## Pending Features

- Authentication (signup/login) — Phase 2
- Marina search & listing pages — Phase 3
- Booking flow — Phase 4
- Stripe payment integration
- Marina owner dashboard
- Photo upload for marinas
