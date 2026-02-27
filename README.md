# EasyDock MVP - Marina Booking Marketplace

A full-stack marina booking marketplace built with Supabase, Vanilla JavaScript, and Netlify. Connect boat owners with marina owners for seamless dock reservations.

## Features

- **User Authentication**: Sign up/login with email/password (Supabase Auth)
- **Marina Listings**: Marina owners can create and manage listings
- **Search & Filter**: Boat owners can search marinas by location, price, boat size
- **Booking System**: Request, approve, and manage bookings
- **Admin Panel**: Approve marinas, view analytics, manage users
- **Responsive Design**: Works on mobile, tablet, and desktop

## Tech Stack

- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Hosting**: Netlify
- **Payments**: Stripe (to be integrated)
- **Email**: EmailJS (optional)

## Quick Start

1. **Set Up Supabase** - See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for detailed instructions
2. **Configure App** - Update `app/config.js` with your Supabase credentials
3. **Create Admin** - Sign up and set your user role to 'admin' in Supabase
4. **Deploy** - See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment instructions

For detailed setup instructions, see [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)

## Project Structure

```
easydock/
├── app/                    # Main web application
├── landing-page/           # Marketing landing page
├── cold-email-automation/  # Email outreach tools
├── database/               # Database schema
├── docs/                   # Documentation
└── netlify.toml            # Deployment config
```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for complete file structure.

## Documentation

- **[Setup Guide](docs/SETUP_GUIDE.md)** - Step-by-step setup instructions
- **[Architecture](docs/ARCHITECTURE.md)** - Technical details and system design
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Project Structure](PROJECT_STRUCTURE.md)** - Complete file organization

## Setup Instructions

### 1. Supabase Setup

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Go to SQL Editor and run the SQL from `database/schema.sql`
4. Go to Settings > API and copy your:
   - Project URL
   - Anon (public) key

### 2. Configure Environment Variables

1. Open `app/config.js`
2. Update with your Supabase credentials:
   ```javascript
   supabase: {
       url: 'YOUR_SUPABASE_URL',
       anonKey: 'YOUR_SUPABASE_ANON_KEY'
   }
   ```

### 3. Create Admin User

After running the database schema, you'll need to manually set a user as admin:

1. Sign up through the app
2. Go to Supabase Dashboard > Table Editor > `user_profiles`
3. Find your user and set `role` to `'admin'`

### 4. Deploy to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set build settings:
   - Build command: (leave empty - no build needed)
   - Publish directory: `app`
4. Deploy!

## User Flows

### Boat Owner Flow
1. Sign up / Sign in
2. Search for marinas
3. View marina details
4. Request booking
5. Wait for marina owner approval
6. Complete payment (Stripe integration pending)

### Marina Owner Flow
1. Sign up as marina owner
2. Create marina listing
3. Wait for admin approval
4. Receive booking requests
5. Approve/decline bookings
6. Receive payments (Stripe integration pending)

### Admin Flow
1. Sign in as admin
2. Approve/reject marina listings
3. View analytics and statistics
4. Manage users and bookings

## Payment Integration (Pending)

Stripe Connect integration is planned for:
- Boat owners pay upfront
- Platform takes 15% commission
- Marina owners receive automatic payouts

## Email Notifications (Optional)

EmailJS can be configured for:
- Booking confirmations
- Approval notifications
- Status updates

## Development

### Local Development

1. Serve the `app` directory with a local server:
   ```bash
   # Using Python
   cd app
   python -m http.server 8000
   
   # Using Node.js
   npx serve app
   ```

2. Open http://localhost:8000

### Testing

- Test user signup/login
- Create marina listings
- Make booking requests
- Test admin approval flow

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Admin users have elevated permissions
- Never commit `.env` or `config.js` with real credentials

## Future Enhancements

- [ ] Stripe payment integration
- [ ] Email notifications (EmailJS)
- [ ] Photo upload for marinas
- [ ] Advanced calendar/availability system
- [ ] Messaging between users
- [ ] Reviews and ratings
- [ ] Mobile app (React Native)

## Support

For issues or questions:
1. Check Supabase logs in dashboard
2. Check browser console for errors
3. Verify RLS policies are correct
4. Ensure admin user is set up correctly

## License

Private - All rights reserved

---

**EasyDock** - Connecting boat owners with marina spaces
