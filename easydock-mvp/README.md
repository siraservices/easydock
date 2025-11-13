# EasyDock Marina Marketplace MVP

A modern React application for connecting yacht owners with marina docking spaces.

## Tech Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Netlify Functions (serverless)
- **Database**: Supabase with PostgreSQL + Row Level Security
- **Auth**: Supabase Auth with role-based access
- **State**: Zustand for global state management
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then fill in your Supabase credentials:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

4. Set up the database:
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
   - This will create all necessary tables, indexes, and RLS policies

5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
easydock-mvp/
├── src/
│   ├── components/
│   │   ├── admin/          # Admin dashboard components
│   │   ├── common/         # Shared components (Layout, ProtectedRoute, etc.)
│   │   ├── landing/        # Landing page components
│   │   ├── marina/         # Marina owner components
│   │   └── yacht-owner/   # Yacht owner components
│   ├── lib/                # Utilities (Supabase client)
│   ├── pages/              # Page components
│   ├── stores/             # Zustand state stores
│   ├── types/              # TypeScript type definitions
│   └── App.tsx             # Main app component with routing
├── supabase/
│   └── schema.sql         # Database schema
└── netlify.toml            # Netlify deployment configuration
```

## Features

### Marina Owner Features
- Multi-step marina registration
- Slip inventory management (CRUD)
- Availability calendar for date blocking
- Booking approval/rejection workflow
- Analytics dashboard with occupancy and revenue metrics

### Yacht Owner Features
- Advanced search with filters (location, dates, boat size, amenities, price)
- Real-time availability and pricing
- Instant booking flow
- Booking management dashboard
- Vessel profile management

### Admin Features
- User management
- Platform metrics
- Lead management

### Landing Page
- Hero section
- Features showcase
- Lead capture form integrated with Supabase

## Deployment

### Netlify Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to Netlify:
   - Connect your repository to Netlify
   - Set environment variables in Netlify dashboard:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Netlify will automatically build and deploy

The `netlify.toml` file is already configured for deployment.

## Database Schema

The database includes the following tables:
- `profiles` - User profiles with role-based access
- `marinas` - Marina information
- `slips` - Individual slip specifications and pricing
- `availability` - Real-time availability tracking
- `bookings` - Booking records and status management
- `leads` - Lead capture from landing page

All tables have Row Level Security (RLS) policies enabled for secure data access.

## Performance Optimizations

- React.memo for expensive components
- Error boundaries for graceful error handling
- Lazy loading where appropriate
- Optimized database queries with indexes
- Pagination ready (can be implemented for large lists)

## Security

- Row Level Security (RLS) on all database tables
- Input validation with Zod schemas
- Protected routes with role-based access control
- Secure environment variable handling

## License

Private - All rights reserved
