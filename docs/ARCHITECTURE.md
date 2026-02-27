# EasyDock Architecture Documentation

## Project Structure

```
easydock/
├── app/                          # Main web application
│   ├── index.html               # Home page
│   ├── auth.html                # Login/signup page
│   ├── search.html              # Marina search page
│   ├── marina-detail.html       # Marina details & booking
│   ├── dashboard.html           # User dashboard
│   ├── admin.html               # Admin panel
│   ├── config.js                # Configuration (update with your keys)
│   ├── css/
│   │   └── app.css              # Application styles
│   └── js/
│       ├── supabase-client.js   # Supabase initialization
│       ├── auth.js              # Authentication functions
│       ├── search.js            # Marina search & filtering
│       ├── booking.js           # Booking management
│       ├── dashboard.js         # Dashboard functionality
│       └── admin.js             # Admin panel functions
│
├── landing-page/                 # Marketing landing page
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── README.md
│
├── cold-email-automation/        # Email outreach tools
│   ├── email_automation.py
│   ├── requirements.txt
│   ├── test_email.py
│   └── README.md
│
├── database/                     # Database schema
│   └── schema.sql               # Complete database setup
│
├── docs/                        # Documentation
│   ├── SETUP_GUIDE.md          # Setup instructions
│   └── ARCHITECTURE.md         # This file
│
├── .gitignore                   # Git ignore rules
├── netlify.toml                 # Netlify deployment config
└── README.md                    # Main project documentation
```

## Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables
- **Vanilla JavaScript** - No framework dependencies
- **Supabase JS Client** - Backend integration

### Backend
- **Supabase** - PostgreSQL database, authentication, storage
- **Row Level Security (RLS)** - Database security policies

### Hosting & Deployment
- **Netlify** - Static site hosting
- **GitHub** - Version control (recommended)

### Third-Party Services
- **Stripe** - Payment processing (to be integrated)
- **EmailJS** - Email notifications (optional)

## Database Schema

### Core Tables

1. **user_profiles**
   - Extends Supabase auth.users
   - Stores user type (boat_owner, marina_owner, admin)
   - User preferences and settings

2. **marinas**
   - Marina listings with details
   - Pricing information
   - Location and amenities
   - Approval status

3. **bookings**
   - Booking requests and confirmations
   - Payment information
   - Status tracking

4. **availability**
   - Calendar availability for marinas
   - Price overrides for specific dates

5. **messages**
   - Communication between users
   - Booking-related messages

6. **reviews**
   - Post-booking reviews and ratings

## Security Model

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Public read access for approved marinas
- Admin users have elevated permissions

### Authentication
- Supabase Auth handles all authentication
- Email/password authentication
- Session management automatic

## User Flows

### Boat Owner Flow
1. Sign up → Create account
2. Search → Browse available marinas
3. View Details → See marina information
4. Request Booking → Submit booking request
5. Wait for Approval → Marina owner reviews
6. Payment → Complete payment (when integrated)

### Marina Owner Flow
1. Sign up → Create marina owner account
2. Create Listing → Add marina details
3. Wait for Approval → Admin reviews listing
4. Receive Requests → View booking requests
5. Approve/Decline → Manage bookings
6. Receive Payments → Get paid (when integrated)

### Admin Flow
1. Sign in → Access admin panel
2. Review Listings → Approve/reject marinas
3. Monitor Activity → View analytics
4. Manage Users → User administration

## API Integration

### Supabase Client
- Initialized in `app/js/supabase-client.js`
- Used throughout the application
- Handles authentication and data operations

### Configuration
- All API keys stored in `app/config.js`
- Never commit real credentials to git
- Use environment variables in production

## Deployment

### Netlify Configuration
- `netlify.toml` defines deployment settings
- Publish directory: `app`
- No build process required
- Automatic deployments from GitHub

### Environment Setup
1. Configure `app/config.js` with Supabase keys
2. Run database schema in Supabase
3. Create admin user
4. Deploy to Netlify

## Future Enhancements

### Planned Features
- [ ] Stripe payment integration
- [ ] Photo upload functionality
- [ ] Advanced calendar system
- [ ] Real-time messaging
- [ ] Reviews and ratings
- [ ] Mobile app (React Native)

### Scalability Considerations
- Supabase free tier: ~100 users
- Upgrade to Pro ($25/mo) for more capacity
- Consider CDN for static assets
- Implement caching strategies

## Development Guidelines

### Code Organization
- Modular JavaScript files
- Reusable helper functions
- Consistent naming conventions
- Error handling throughout

### Best Practices
- Always check authentication before operations
- Validate user input
- Handle errors gracefully
- Provide user feedback

### Testing
- Test all user flows
- Verify RLS policies
- Check error handling
- Test on multiple browsers

## Support & Maintenance

### Monitoring
- Check Supabase logs regularly
- Monitor Netlify deployment logs
- Review user feedback
- Track error rates

### Updates
- Keep Supabase client library updated
- Monitor security advisories
- Update dependencies regularly
- Test updates in staging first

