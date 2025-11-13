# EasyDock Marina Marketplace MVP

A modern React application for connecting yacht owners with marina docking spaces. Built with Vite, React, TypeScript, Tailwind CSS, and Supabase.

## Features

### Phase 1: Foundation & Database Setup
- ✅ Supabase database with PostgreSQL
- ✅ Row Level Security (RLS) policies
- ✅ Authentication with role-based access control
- ✅ User profiles with roles (marina_owner, yacht_owner, admin)

### Phase 2: Marina Dashboard (Supply Side)
- ✅ Marina registration and onboarding
- ✅ Slip inventory management (CRUD operations)
- ✅ Dynamic pricing (daily/weekly/monthly rates)
- ✅ Availability calendar for date blocking
- ✅ Booking approval/rejection workflow
- ✅ Analytics dashboard with occupancy rates and revenue tracking

### Phase 3: Yacht Owner Interface (Demand Side)
- ✅ Advanced search with filters (location, dates, boat size, amenities, price)
- ✅ Real-time availability checking
- ✅ Booking flow with vessel information
- ✅ Yacht owner dashboard
- ✅ Vessel profile management
- ✅ Booking history

### Phase 4: Landing Page Integration
- ✅ Converted HTML landing page to React components
- ✅ Lead capture form integrated with Supabase
- ✅ Hero section, features, and how it works sections

### Phase 5: Admin Dashboard
- ✅ User management
- ✅ Lead management
- ✅ Booking oversight
- ✅ Platform metrics

## Tech Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router DOM
- **Date Handling**: date-fns
- **Payments**: Stripe integration setup (ready for implementation)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository and navigate to the project:
```bash
cd easydock-mvp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
   - This will create all tables, indexes, RLS policies, and triggers

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
easydock-mvp/
├── src/
│   ├── components/
│   │   ├── admin/          # Admin dashboard components
│   │   ├── auth/           # Authentication components
│   │   ├── common/         # Shared components
│   │   ├── landing/        # Landing page components
│   │   ├── marina/         # Marina dashboard components
│   │   └── yacht-owner/    # Yacht owner components
│   ├── lib/
│   │   └── supabase.ts     # Supabase client configuration
│   ├── pages/              # Page components
│   ├── stores/             # Zustand state management
│   │   ├── authStore.ts
│   │   ├── marinaStore.ts
│   │   └── searchStore.ts
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Main app component with routing
│   └── main.tsx            # Entry point
├── supabase/
│   └── schema.sql          # Database schema
└── package.json
```

## Database Schema

The database includes the following tables:
- `profiles` - User profiles with role-based access
- `marinas` - Marina information
- `slips` - Individual slip specifications and pricing
- `availability` - Real-time availability tracking
- `bookings` - Booking records and status management
- `leads` - Lead capture from landing page

All tables have Row Level Security (RLS) enabled with appropriate policies.

## User Roles

- **marina_owner**: Can manage marinas, slips, availability, and approve/reject bookings
- **yacht_owner**: Can search for slips, make bookings, and manage vessel profiles
- **admin**: Can view all users, leads, and bookings for platform oversight

## Deployment

### Netlify Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy to Netlify:
   - Connect your repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

3. Configure Supabase:
   - Update Supabase project settings for production
   - Ensure RLS policies are active
   - Set up any required API keys

## Performance Optimizations

The application is designed to handle 100+ concurrent users with:
- Efficient database queries with proper indexes
- Pagination for data lists
- React.memo for expensive components (ready for implementation)
- Image optimization and lazy loading (ready for implementation)
- Error boundaries and loading states
- Caching strategies for API responses

## Security

- Row Level Security (RLS) on all database tables
- Input validation with Zod schemas
- Secure environment variable handling
- CORS configuration for API access
- Role-based route protection

## Future Enhancements

- Full Stripe payment integration
- Image upload and management
- Email notifications
- Advanced analytics and reporting
- Mobile app
- Real-time chat support
- Review and rating system

## License

Proprietary - EasyDock Marina Marketplace
