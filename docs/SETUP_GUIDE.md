# EasyDock MVP Setup Guide

This guide will walk you through setting up your EasyDock MVP from scratch.

## Prerequisites

- A Supabase account (free tier is sufficient)
- A Netlify account (free tier is sufficient)
- Basic knowledge of HTML/JavaScript (helpful but not required)

## Step 1: Set Up Supabase

1. **Create a Supabase Project**
   - Go to https://supabase.com and sign up/login
   - Click "New Project"
   - Choose a name (e.g., "easydock")
   - Set a database password (save this!)
   - Choose a region close to you
   - Click "Create new project"
   - Wait 2-3 minutes for setup to complete

2. **Run the Database Schema**
   - In your Supabase dashboard, go to "SQL Editor"
   - Click "New query"
   - Open `database/schema.sql` from this project
   - Copy and paste the entire SQL into the editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - You should see "Success. No rows returned"

3. **Get Your API Keys**
   - Go to Settings > API
   - Copy your "Project URL" (looks like: `https://xxxxx.supabase.co`)
   - Copy your "anon public" key (long string starting with `eyJ...`)

## Step 2: Configure the Application

1. **Update Configuration**
   - Open `app/config.js`
   - Replace `YOUR_SUPABASE_URL` with your Project URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your anon key
   - Save the file

## Step 3: Create Your Admin Account

1. **Sign Up Through the App**
   - Open `app/index.html` in a browser (or use a local server)
   - Click "Sign Up"
   - Create an account with your email
   - Choose any user type (you'll change this)

2. **Make Yourself Admin**
   - Go to Supabase Dashboard > Table Editor > `user_profiles`
   - Find your user (by email)
   - Click to edit
   - Change `role` from `'user'` to `'admin'`
   - Save

3. **Test Admin Access**
   - Sign out and sign back in
   - Navigate to `app/admin.html`
   - You should see the admin panel

## Step 4: Test the Application Locally

1. **Start a Local Server**
   ```bash
   # Option 1: Python
   cd app
   python -m http.server 8000
   
   # Option 2: Node.js
   npx serve app
   
   # Option 3: VS Code Live Server extension
   # Right-click index.html > "Open with Live Server"
   ```

2. **Test User Flows**
   - **Boat Owner Flow:**
     - Sign up as a boat owner
     - Search for marinas (will be empty initially)
     - Try creating a booking (will fail without marinas)
   
   - **Marina Owner Flow:**
     - Sign up as a marina owner
     - Go to Dashboard
     - Create a marina listing
     - Wait for admin approval (you can approve it yourself)
   
   - **Admin Flow:**
     - Sign in as admin
     - Go to Admin Panel
     - Approve the marina you created
     - View statistics

## Step 5: Deploy to Netlify

1. **Push to GitHub**
   - Create a new GitHub repository
   - Push your code:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin YOUR_REPO_URL
     git push -u origin main
     ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click "Add new site" > "Import an existing project"
   - Choose GitHub and authorize
   - Select your repository
   - Configure build settings:
     - **Build command:** (leave empty)
     - **Publish directory:** `app`
   - Click "Deploy site"

3. **Update Configuration for Production**
   - After deployment, your site will have a URL like `https://your-site.netlify.app`
   - The same `config.js` file will work (it's client-side)
   - Test your deployed site

## Step 6: Optional - Set Up Email Notifications

1. **Create EmailJS Account**
   - Go to https://www.emailjs.com
   - Sign up for free account (200 emails/month)
   - Create an email service (Gmail, etc.)
   - Create an email template
   - Get your Service ID, Template ID, and Public Key

2. **Update Configuration**
   - Add EmailJS credentials to `app/config.js`
   - Email notifications will now work for bookings

## Step 7: Optional - Set Up Stripe Payments

1. **Create Stripe Account**
   - Go to https://stripe.com
   - Create account and verify
   - Get your Publishable Key from Dashboard > Developers > API keys

2. **Update Configuration**
   - Add Stripe key to `app/config.js`
   - Note: Full Stripe Connect integration requires backend code (not included in MVP)

## Troubleshooting

### "Supabase client not initialized" Error
- Make sure `config.js` is loaded before other scripts
- Check that your Supabase URL and key are correct
- Open browser console to see detailed errors

### "Unauthorized" Errors
- Check Row Level Security (RLS) policies in Supabase
- Make sure you're signed in
- Verify your user profile exists in `user_profiles` table

### Database Errors
- Verify you ran the schema.sql file completely
- Check Supabase logs in Dashboard > Logs
- Make sure all tables were created (check Table Editor)

### Marina Not Showing in Search
- Check that `is_active = true` and `is_approved = true` in the marinas table
- Verify RLS policies allow public read access

## Next Steps

1. **Add Real Marinas**
   - Use the cold email automation to reach out to marinas
   - Manually create listings or have marina owners sign up

2. **Customize Design**
   - Edit `app/css/app.css` to match your brand
   - Update colors, fonts, logos

3. **Add Features**
   - Photo uploads (Supabase Storage)
   - Advanced calendar/availability
   - Messaging system
   - Reviews and ratings

4. **Scale**
   - Monitor Supabase usage (free tier limits)
   - Upgrade when needed ($25/mo for Pro)
   - Add more automation

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs
3. Verify all configuration values
4. Review the README.md for more details

---

**You're all set!** Your EasyDock MVP is ready to use. Start by creating your first marina listing and testing the booking flow.

