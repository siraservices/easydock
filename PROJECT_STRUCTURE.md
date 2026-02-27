# EasyDock Project Structure

```
easydock/
│
├── 📁 app/                          # Main web application (deployed to Netlify)
│   ├── 📄 index.html                # Home page
│   ├── 📄 auth.html                 # Login/signup page
│   ├── 📄 search.html               # Marina search page
│   ├── 📄 marina-detail.html        # Marina details & booking page
│   ├── 📄 dashboard.html            # User dashboard
│   ├── 📄 admin.html                # Admin panel
│   ├── ⚙️ config.js                 # Configuration (UPDATE WITH YOUR KEYS)
│   │
│   ├── 📁 css/
│   │   └── 📄 app.css                # Application styles
│   │
│   └── 📁 js/
│       ├── 📄 supabase-client.js    # Supabase initialization
│       ├── 📄 auth.js               # Authentication functions
│       ├── 📄 search.js              # Marina search & filtering
│       ├── 📄 booking.js             # Booking management
│       ├── 📄 dashboard.js          # Dashboard functionality
│       └── 📄 admin.js               # Admin panel functions
│
├── 📁 landing-page/                  # Marketing landing page (separate)
│   ├── 📄 index.html
│   ├── 📄 styles.css
│   ├── 📄 script.js
│   └── 📄 README.md
│
├── 📁 cold-email-automation/         # Email outreach automation tools
│   ├── 📄 email_automation.py
│   ├── 📄 requirements.txt
│   ├── 📄 test_email.py
│   ├── 📄 setup.py
│   ├── 📄 test-email-list.csv
│   └── 📄 README.md
│
├── 📁 database/                      # Database schema
│   └── 📄 schema.sql                 # Complete database setup (run in Supabase)
│
├── 📁 docs/                          # Documentation
│   ├── 📄 SETUP_GUIDE.md            # Detailed setup instructions
│   ├── 📄 ARCHITECTURE.md            # Technical architecture
│   └── 📄 DEPLOYMENT.md              # Deployment guide
│
├── 📄 README.md                      # Main project documentation
├── 📄 PROJECT_STRUCTURE.md           # This file
├── 📄 .gitignore                     # Git ignore rules
└── 📄 netlify.toml                   # Netlify deployment configuration
```

## Directory Descriptions

### `/app` - Main Application
The core web application that gets deployed to Netlify. Contains all HTML pages, JavaScript modules, and CSS.

**Key Files:**
- `config.js` - **IMPORTANT:** Update this with your Supabase credentials
- All HTML pages are entry points for different features
- JavaScript files are modular and handle specific functionality

### `/landing-page` - Marketing Site
Separate marketing landing page. Can be integrated with the main app or kept separate.

### `/cold-email-automation` - Outreach Tools
Python scripts for automated email outreach to marina owners. Separate tool for business development.

### `/database` - Database Schema
SQL file containing the complete database structure. Run this in your Supabase SQL Editor.

### `/docs` - Documentation
All documentation files:
- **SETUP_GUIDE.md** - Step-by-step setup instructions
- **ARCHITECTURE.md** - Technical details and architecture
- **DEPLOYMENT.md** - Deployment and production guide

## File Organization Principles

1. **Separation of Concerns**
   - Frontend code in `/app`
   - Database schema in `/database`
   - Documentation in `/docs`
   - Tools in separate directories

2. **Modular JavaScript**
   - Each feature has its own JS file
   - Shared utilities in `supabase-client.js`
   - No global dependencies

3. **Configuration Management**
   - All config in `app/config.js`
   - Never commit real credentials
   - Use `.gitignore` to protect secrets

4. **Documentation**
   - Main README for overview
   - Detailed guides in `/docs`
   - Each sub-project has its own README

## Next Steps

1. **Start Here:** Read `README.md`
2. **Setup:** Follow `docs/SETUP_GUIDE.md`
3. **Deploy:** See `docs/DEPLOYMENT.md`
4. **Understand:** Review `docs/ARCHITECTURE.md`

## Important Notes

- ⚠️ **Never commit** `app/config.js` with real credentials
- ✅ Always test locally before deploying
- 📝 Update documentation when adding features
- 🔒 Keep sensitive data out of version control

