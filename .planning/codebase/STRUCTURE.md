# Codebase Structure

**Analysis Date:** 2026-03-09

## Directory Layout

```
easydock/
├── src/
│   ├── app/                           # Next.js App Router pages and routes
│   │   ├── layout.tsx                 # Root layout with AuthProvider, Navbar
│   │   ├── globals.css                # Tailwind imports and theme colors
│   │   ├── page.tsx                   # Home / landing page
│   │   ├── api/
│   │   │   ├── checkout/
│   │   │   │   └── route.ts           # POST handler for booking + Stripe checkout
│   │   │   └── webhooks/
│   │   │       └── stripe/
│   │   │           └── route.ts       # Stripe webhook receiver (pending)
│   │   ├── search/
│   │   │   └── page.tsx               # Boat owner slip search and filter
│   │   ├── slips/
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Slip detail page with booking widget
│   │   ├── bookings/
│   │   │   ├── page.tsx               # Boat owner's booking list
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Booking detail page
│   │   ├── dashboard/
│   │   │   ├── page.tsx               # Marina owner main dashboard
│   │   │   └── marinas/
│   │   │       ├── new/
│   │   │       │   └── page.tsx       # Create new marina form
│   │   │       └── [id]/
│   │   │           ├── page.tsx       # Marina detail and slip management
│   │   │           └── edit/
│   │   │               └── page.tsx   # Edit marina details
│   │   ├── login/
│   │   │   └── page.tsx               # User login form
│   │   └── signup/
│   │       └── page.tsx               # User registration with role selection
│   ├── components/
│   │   ├── navbar.tsx                 # Top navigation bar
│   │   ├── protected-route.tsx        # Role-based page guard
│   │   ├── booking-widget.tsx         # Booking form with date/vessel inputs
│   │   ├── marina-form.tsx            # Create/edit marina form
│   │   ├── slip-form-modal.tsx        # Create/edit slip modal
│   │   ├── slip-card.tsx              # Slip card in search results
│   │   ├── slip-row.tsx               # Slip row in marina dashboard
│   │   ├── search-filters.tsx         # Search bar with filters
│   │   └── ui/
│   │       ├── empty-state.tsx        # Empty state placeholder
│   │       ├── loading-spinner.tsx    # Loading indicator
│   │       └── status-badge.tsx       # Status badge component
│   ├── lib/
│   │   ├── auth-context.tsx           # Auth provider and useAuth hook
│   │   ├── constants.ts               # Amenities, vessel types, defaults
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser Supabase client factory
│   │   │   ├── server.ts              # Server Supabase client factory
│   │   │   └── admin.ts               # Admin-only Supabase client (if needed)
│   │   └── utils/
│   │       └── format.ts              # Price, date, night calculation helpers
│   └── types/
│       └── database.ts                # TypeScript types for database schema
├── database/
│   ├── 001_initial_schema.sql         # Current schema with RLS policies
│   ├── 002_seed.sql                   # Test seed data
│   └── schema_legacy.sql              # v1 schema reference only
├── public/                            # Static assets (if needed)
├── .env.local                         # Environment variables (gitignored)
├── .env.example                       # Environment template (committed)
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
├── next.config.ts                     # Next.js configuration
├── tailwind.config.ts                 # Tailwind CSS configuration
├── postcss.config.mjs                 # PostCSS configuration
├── netlify.toml                       # Netlify deploy config
├── .eslintrc.json                     # ESLint rules
├── .gitignore                         # Git ignore file
└── .planning/
    └── codebase/                      # GSD analysis documents
        ├── ARCHITECTURE.md
        └── STRUCTURE.md
```

## Directory Purposes

**src/app:**
- Purpose: Next.js App Router pages and API routes
- Contains: Page components, layout, global styles, API endpoints
- Key files: `layout.tsx` (root), `page.tsx` (home), `globals.css` (Tailwind), `api/checkout/route.ts` (payment)

**src/components:**
- Purpose: Reusable React components
- Contains: UI building blocks, page sections, role-based guards
- Key files: `navbar.tsx`, `protected-route.tsx`, `booking-widget.tsx`, `marina-form.tsx`

**src/lib:**
- Purpose: Shared business logic, authentication, database access
- Contains: Auth context, Supabase clients, utility functions, constants
- Key files: `auth-context.tsx` (auth provider), `supabase/client.ts`, `constants.ts`

**src/types:**
- Purpose: TypeScript type definitions
- Contains: Database schema types
- Key files: `database.ts` (auto-generated or manually maintained Supabase types)

**database:**
- Purpose: Database schema and seed data
- Contains: SQL migrations, RLS policies, triggers, indexes
- Key files: `001_initial_schema.sql` (main schema), `002_seed.sql` (test data)

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout wrapping all pages with AuthProvider and Navbar
- `src/app/page.tsx`: Home page with marketing copy and progress checklist
- `src/app/api/checkout/route.ts`: API endpoint for booking + Stripe checkout initiation

**Configuration:**
- `package.json`: Dependencies (Next.js, React, Supabase, Stripe, Tailwind), scripts
- `tsconfig.json`: TypeScript settings, path aliases (`@/*` → `src/*`)
- `tailwind.config.ts`: Tailwind CSS theme config
- `next.config.ts`: Next.js settings (outputFileTracingRoot for Netlify)
- `.env.local`: Supabase credentials and Stripe API keys (gitignored)
- `netlify.toml`: Netlify deployment config

**Core Logic:**
- `src/lib/auth-context.tsx`: Authentication state management (signUp, signIn, signOut, useAuth hook)
- `src/lib/supabase/client.ts`: Browser-side Supabase client factory
- `src/lib/supabase/server.ts`: Server-side Supabase client factory (handles cookies)
- `src/types/database.ts`: TypeScript type definitions matching Supabase schema
- `src/lib/constants.ts`: Shared constants (amenities list, vessel types, default city)

**Testing:**
- Not present yet (no test files found)

**Database:**
- `database/001_initial_schema.sql`: Complete schema with tables, indexes, RLS policies, triggers
  - Tables: profiles, marinas, slips, bookings
  - RLS: Enforces user isolation and role-based access
  - Triggers: Auto-update timestamps, auto-create profiles on signup

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` (e.g., `BookingWidget.tsx`, `ProtectedRoute.tsx`)
- Pages: `kebab-case.tsx` (e.g., `page.tsx`), dynamic routes use `[param]/` (e.g., `[id]/page.tsx`)
- Utilities/functions: `camelCase.ts` (e.g., `format.ts`, `constants.ts`)
- API routes: `route.ts` in endpoint directories (e.g., `api/checkout/route.ts`)

**Directories:**
- Feature directories: `kebab-case` (e.g., `dashboard`, `search`, `bookings`)
- Component subdirs: `ui/` for base UI components
- Lib subdirs: `supabase/` for database access, `utils/` for helpers

**Components/Functions:**
- React components: `PascalCase` (e.g., `function BookingWidget() {}`)
- Exported functions: `camelCase` (e.g., `formatPrice()`, `calculateNights()`)
- Constants: `UPPER_CASE` for truly constant values (e.g., `DEFAULT_CITY`, `AMENITIES`)

**Variables:**
- State variables: `camelCase` (e.g., `checkIn`, `slips`, `loading`)
- Type names: `PascalCase` (e.g., `type Slip = ...`, `interface SignUpResult {}`)

**Database:**
- Tables: `snake_case` (e.g., `profiles`, `marinas`, `slips`, `bookings`)
- Columns: `snake_case` (e.g., `boat_owner_id`, `check_in`, `is_available`)
- Relationships: Foreign keys use table singular + `_id` (e.g., `marina_id`, `boat_owner_id`)

## Where to Add New Code

**New Feature (e.g., Reviews):**
- Primary code: `src/app/reviews/page.tsx` (page component) + `src/components/review-card.tsx` (reusable component)
- Business logic: `src/lib/supabase/` (add client queries if complex) or inline in page
- Tests: `src/app/reviews/page.test.tsx` (co-located, not present yet)
- Database: `database/003_add_reviews.sql` (new migration file)
- Types: Add to `src/types/database.ts`

**New Component (e.g., ModalDialog):**
- Implementation: `src/components/ui/modal-dialog.tsx`
- Export: Prefer individual exports over barrel files (currently no barrel files used)
- Usage: Import directly: `import ModalDialog from "@/components/ui/modal-dialog"`

**Utilities (e.g., Validators):**
- Shared helpers: `src/lib/utils/validators.ts`
- Format helpers: Already in `src/lib/utils/format.ts`
- Constants: Already in `src/lib/constants.ts`
- Export: Direct imports: `import { validateEmail } from "@/lib/utils/validators"`

**API Endpoint (e.g., Webhook Handler):**
- Implementation: `src/app/api/webhooks/event/route.ts`
- Pattern: Follow `POST /api/checkout/route.ts` (auth check → validate → process → return response)

## Special Directories

**node_modules:**
- Purpose: Installed npm dependencies
- Generated: Yes (from `npm install`)
- Committed: No (in .gitignore)

**.next:**
- Purpose: Next.js build output
- Generated: Yes (from `npm run build`)
- Committed: No (in .gitignore)

**public:**
- Purpose: Static assets (images, fonts)
- Generated: No
- Committed: Yes (manual content)

**.env.local:**
- Purpose: Environment variables for local development
- Generated: No (manual)
- Committed: No (in .gitignore, use .env.example as template)

**database:**
- Purpose: SQL schema and migrations
- Generated: No (manually written)
- Committed: Yes (version controlled)

**.planning/codebase:**
- Purpose: GSD analysis documents
- Generated: Yes (by GSD commands)
- Committed: Yes (version controlled for future reference)

---

*Structure analysis: 2026-03-09*
