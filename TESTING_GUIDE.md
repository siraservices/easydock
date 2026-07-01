# EasyDock MVP Testing Guide

## 🚀 Quick Start - Preview the MVP

### Step 1: Start Local Server

The local server should already be running at: **http://localhost:8000**

If it's not running, start it with:
```bash
cd app
python -m http.server 8000
```

Or using Node.js:
```bash
npx serve app
```

### Step 2: Open in Browser

Open your browser and navigate to: **http://localhost:8000**

---

## ⚠️ Important: Supabase Configuration Required

**Before testing functionality**, you need to configure Supabase:

1. **Check Current Status**: Open `app/config.js` - if you see `YOUR_SUPABASE_URL`, it's not configured yet.

2. **Set Up Supabase** (if not done):
   - Create account at https://supabase.com
   - Create a new project
   - Run the SQL schema from `database/schema.sql` in Supabase SQL Editor
   - Get your Project URL and anon key from Settings > API
   - Update `app/config.js` with your credentials

3. **Without Supabase**: You can still preview the UI/design, but authentication and data features won't work.

---

## 📋 Testing Checklist

### ✅ Visual/UI Testing (Works without Supabase)

- [ ] **Homepage (index.html)**
  - [ ] Page loads correctly
  - [ ] Navigation links work
  - [ ] Buttons are clickable
  - [ ] Responsive design (test on mobile/tablet)
  - [ ] Font Awesome icons display

- [ ] **Authentication Page (auth.html)**
  - [ ] Sign in form displays
  - [ ] Sign up form displays (switch between forms)
  - [ ] Form validation works (try submitting empty form)
  - [ ] User type selection (boat owner/marina owner) shows

- [ ] **Search Page (search.html)**
  - [ ] Search filters display
  - [ ] UI is responsive
  - [ ] Empty state shows when no marinas (expected without data)

- [ ] **Dashboard (dashboard.html)**
  - [ ] Page structure loads
  - [ ] Tabs display correctly
  - [ ] Forms render properly

- [ ] **Admin Panel (admin.html)**
  - [ ] Page loads
  - [ ] Admin interface displays

---

### 🔐 Authentication Testing (Requires Supabase)

**Prerequisites**: Supabase must be configured in `app/config.js`

- [ ] **Sign Up**
  - [ ] Create new account with email/password
  - [ ] Select user type (boat owner or marina owner)
  - [ ] Account created successfully
  - [ ] Redirects to dashboard after signup

- [ ] **Sign In**
  - [ ] Sign in with existing account
  - [ ] Session persists on page refresh
  - [ ] User menu shows in header when logged in

- [ ] **Sign Out**
  - [ ] Sign out button works
  - [ ] Session cleared
  - [ ] Redirected to home page

---

### 🏖️ Marina Owner Flow (Requires Supabase)

- [ ] **Create Marina Listing**
  - [ ] Navigate to Dashboard
  - [ ] Click "Create Marina" tab
  - [ ] Fill out marina form:
    - Name, description, location
    - Price, boat size limits
    - Amenities
  - [ ] Submit form
  - [ ] Marina created (status: pending approval)

- [ ] **View My Marinas**
  - [ ] See created marina in "My Marinas" tab
  - [ ] Status shows as "Pending Approval"

- [ ] **Manage Bookings**
  - [ ] View booking requests (if any)
  - [ ] Approve/decline bookings

---

### 🚤 Boat Owner Flow (Requires Supabase)

- [ ] **Search Marinas**
  - [ ] Use search filters (location, price, boat size)
  - [ ] See approved marinas in results
  - [ ] Click on marina to view details

- [ ] **View Marina Details**
  - [ ] See full marina information
  - [ ] View pricing
  - [ ] See amenities
  - [ ] Booking form displays

- [ ] **Request Booking**
  - [ ] Fill out booking form (dates, boat info)
  - [ ] Submit booking request
  - [ ] Booking shows as "Pending" in dashboard

- [ ] **View My Bookings**
  - [ ] See booking status
  - [ ] View booking details

---

### 👨‍💼 Admin Flow (Requires Supabase + Admin Role)

**Prerequisites**: 
1. Supabase configured
2. Your user role set to 'admin' in `user_profiles` table

- [ ] **Access Admin Panel**
  - [ ] Navigate to `admin.html`
  - [ ] Admin panel loads (not accessible to non-admins)

- [ ] **Approve Marinas**
  - [ ] See pending marinas
  - [ ] Approve a marina
  - [ ] Marina now appears in search results

- [ ] **View Analytics**
  - [ ] See user statistics
  - [ ] See booking statistics
  - [ ] See marina statistics

- [ ] **Manage Users**
  - [ ] View user list
  - [ ] Change user roles if needed

---

## 🐛 Common Issues & Solutions

### Issue: "Supabase client not initialized"
**Solution**: 
- Check browser console for errors
- Verify `config.js` has valid Supabase credentials
- Ensure `config.js` loads before other scripts

### Issue: "Unauthorized" errors
**Solution**:
- Make sure you're signed in
- Check Supabase RLS policies
- Verify user profile exists in `user_profiles` table

### Issue: Marinas not showing in search
**Solution**:
- Check marina has `is_active = true` and `is_approved = true`
- Verify RLS policies allow public read access
- Check browser console for errors

### Issue: Can't access admin panel
**Solution**:
- Verify your user role is set to 'admin' in Supabase
- Sign out and sign back in after changing role
- Check browser console for errors

---

## 📱 Responsive Testing

Test on different screen sizes:
- [ ] Mobile (375px - iPhone)
- [ ] Tablet (768px - iPad)
- [ ] Desktop (1920px)

Use browser DevTools (F12) > Toggle device toolbar

---

## 🔍 Browser Console Testing

**Always check the browser console (F12)** for:
- JavaScript errors
- Supabase connection issues
- Network request failures
- Authentication errors

---

## 📝 Test Data Suggestions

### Create Test Users:
1. **Boat Owner**: `boatowner@test.com`
2. **Marina Owner**: `marinaowner@test.com`
3. **Admin**: Your own account

### Create Test Marina:
- Name: "Test Marina"
- Location: "San Francisco, CA"
- Price: $50/night
- Boat Size: Up to 40ft
- Add some amenities

### Create Test Booking:
- Use boat owner account
- Book the test marina
- Test approval flow as marina owner

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All Supabase credentials configured
- [ ] Database schema deployed
- [ ] Admin user created
- [ ] Test all user flows
- [ ] Check responsive design
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Verify no console errors
- [ ] Test with real data (not just test data)

---

## 🎯 Next Steps After Testing

1. **Fix any bugs** found during testing
2. **Add real marina data** (use cold email automation)
3. **Customize branding** (colors, logos, copy)
4. **Deploy to Vercel** (see DEPLOYMENT.md)
5. **Set up email notifications** (optional)
6. **Integrate Stripe payments** (future enhancement)

---

**Happy Testing! 🚀**

If you encounter issues, check:
1. Browser console (F12)
2. Supabase dashboard logs
3. Network tab for failed requests
4. This guide's troubleshooting section

