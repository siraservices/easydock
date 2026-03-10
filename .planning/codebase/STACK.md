# Technology Stack

**Analysis Date:** 2026-03-09

## Languages

**Primary:**
- TypeScript 5.7.3 - Application code, type-safe development
- JavaScript (ES2017) - Configuration files and utilities

**Secondary:**
- Python 3.x - Cold email automation (`cold-email-automation/email_automation.py`)
- SQL - Database schema and migrations

## Runtime

**Environment:**
- Node.js (ES2017 target) - Next.js application runtime
- Python 3.x - Email automation tools

**Package Manager:**
- npm - Node.js dependencies
- Lockfile: `package-lock.json` (present in repo)

## Frameworks

**Core:**
- Next.js 15.1.6 (App Router) - Full-stack React framework with SSR
- React 19.0.0 - UI component library
- React DOM 19.0.0 - DOM rendering

**Styling:**
- Tailwind CSS 4.0.0 - Utility-first CSS framework with custom navy/teal theme
- @tailwindcss/postcss 4.0.0 - PostCSS plugin for Tailwind

**Testing:**
- ESLint 9.19.0 - Code linting
- eslint-config-next 15.1.6 - Next.js ESLint rules

**Build/Dev:**
- TypeScript 5.7.3 - Type checking compiler
- @types/node 22.12.0 - Node.js type definitions
- @types/react 19.0.8 - React type definitions
- @types/react-dom 19.0.3 - React DOM type definitions
- PostCSS (via @tailwindcss/postcss) - CSS processing

## Key Dependencies

**Critical:**
- @supabase/ssr 0.5.2 - Server-side rendering support for Supabase auth
- @supabase/supabase-js 2.47.12 - Supabase client library for database and auth
- stripe 20.4.0 - Stripe payment processing SDK

**Backend/Database:**
- Supabase (PostgreSQL) - All data persistence via Row Level Security (RLS)
- Next.js API Routes - Serverless functions for backend logic

**Email:**
- python-dotenv 1.0.0 - Environment variable management for Python scripts
- smtplib (Python stdlib) - SMTP email sending via Gmail
- ssl (Python stdlib) - TLS encryption for email

## Configuration

**Environment:**
- `.env.local` - Local Supabase credentials (not committed)
- `.env` in `cold-email-automation/` - Email credentials for Python automation (not committed)
- Environment variables required:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public)
  - `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin key (secret)
  - `STRIPE_SECRET_KEY` - Stripe secret key
  - `STRIPE_WEBHOOK_SECRET` - Stripe webhook signature verification
  - `SENDER_EMAIL` - Gmail sender address (Python automation)
  - `SENDER_PASSWORD` - Gmail app password (Python automation)

**Build:**
- `tsconfig.json` - TypeScript compiler configuration with strict mode, path aliases (`@/*`)
- `next.config.ts` - Next.js configuration with output file tracing
- `tailwind.config.ts` - Custom color palette (navy 50-900, teal 50-900)
- `postcss.config.mjs` - PostCSS configuration for Tailwind
- `netlify.toml` - Netlify deployment config with @netlify/plugin-nextjs for SSR

## Platform Requirements

**Development:**
- Node.js (LTS recommended)
- npm for package management
- Supabase account with database access
- Stripe account with API keys
- TypeScript knowledge for development

**Production:**
- Netlify - Primary hosting via `@netlify/plugin-nextjs`
- Supabase cloud instance - Database, auth, and storage
- Stripe - Payment processing

## Build & Deployment

**Next.js Build:**
- Output format: `.next/` directory published to Netlify
- File tracing enabled via `outputFileTracingRoot`
- Netlify build command: `npm run build`

**Security Headers:**
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

---

*Stack analysis: 2026-03-09*
