# EasyDock Deployment Guide

## Pre-Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Database schema executed successfully
- [ ] Admin user created and verified
- [ ] `app/config.js` updated with real credentials
- [ ] All features tested locally
- [ ] Git repository created and code pushed

## Deployment Steps

### 1. Prepare Your Code

```bash
# Ensure all files are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Netlify

1. **Connect Repository**
   - Go to https://app.netlify.com
   - Click "Add new site" > "Import an existing project"
   - Choose your Git provider (GitHub, GitLab, Bitbucket)
   - Select your repository

2. **Configure Build Settings**
   - **Build command:** (leave empty - no build needed)
   - **Publish directory:** `app`
   - Click "Deploy site"

3. **Wait for Deployment**
   - Netlify will deploy your site
   - You'll get a URL like `https://your-site-name.netlify.app`
   - First deployment takes 1-2 minutes

### 3. Configure Custom Domain (Optional)

1. In Netlify dashboard, go to Site settings > Domain management
2. Click "Add custom domain"
3. Enter your domain (easydock.com)
4. Follow DNS configuration instructions
5. Wait for DNS propagation (can take up to 48 hours)

### 4. Environment Variables (If Needed)

If you need to use environment variables:
1. Go to Site settings > Environment variables
2. Add variables (though config.js is client-side, so this is optional)
3. Redeploy if needed

### 5. Post-Deployment Verification

- [ ] Visit your deployed site
- [ ] Test user signup
- [ ] Test login
- [ ] Verify Supabase connection
- [ ] Test marina search
- [ ] Test booking flow
- [ ] Verify admin panel access

## Production Configuration

### Security Checklist

- [ ] HTTPS enabled (automatic with Netlify)
- [ ] Supabase RLS policies verified
- [ ] No sensitive data in client-side code
- [ ] API keys are public (Supabase anon key is safe to expose)
- [ ] Admin access restricted properly

### Performance Optimization

1. **Enable Netlify CDN** (automatic)
2. **Configure Caching** (already in netlify.toml)
3. **Optimize Images** (if adding photos)
4. **Minify Assets** (optional, Netlify can do this)

### Monitoring

1. **Set up Netlify Analytics** (optional, paid feature)
2. **Monitor Supabase Dashboard** for usage
3. **Set up Error Tracking** (optional)
4. **Check Logs Regularly**

## Troubleshooting Deployment Issues

### Build Fails
- Check Netlify build logs
- Verify publish directory is correct
- Ensure all files are committed

### Site Not Loading
- Check Netlify deployment status
- Verify domain configuration
- Check browser console for errors

### Database Connection Issues
- Verify Supabase URL and key in config.js
- Check Supabase project status
- Verify RLS policies allow public access where needed

### Authentication Not Working
- Check Supabase Auth settings
- Verify redirect URLs in Supabase dashboard
- Check browser console for errors

## Rollback Procedure

If you need to rollback:

1. Go to Netlify dashboard > Deploys
2. Find the previous working deployment
3. Click "..." menu > "Publish deploy"
4. Site will revert to that version

## Continuous Deployment

Netlify automatically deploys when you push to your main branch:

1. Make changes locally
2. Commit and push to GitHub
3. Netlify automatically builds and deploys
4. Check deployment status in Netlify dashboard

## Maintenance

### Regular Tasks

- **Weekly:** Check error logs
- **Monthly:** Review Supabase usage
- **Quarterly:** Update dependencies
- **As needed:** Monitor user feedback

### Updates

To update the site:
1. Make changes locally
2. Test thoroughly
3. Commit and push
4. Netlify auto-deploys
5. Verify on production

## Support Resources

- **Netlify Docs:** https://docs.netlify.com
- **Supabase Docs:** https://supabase.com/docs
- **Project README:** See README.md
- **Setup Guide:** See docs/SETUP_GUIDE.md

---

**Your site is now live!** Share your URL and start onboarding users.

