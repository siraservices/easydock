# EasyDock Deployment Guide

> **Current stack:** Next.js 15 (App Router) deployed on **Vercel** at https://easydock.vercel.app  
> This document reflects the live production setup. The old legacy app (vanilla JS / Netlify) is archived in `app-legacy/`.

## Pre-Deployment Checklist

- [ ] Supabase project configured and schema applied
- [ ] Local build passes (`npm run build`)
- [ ] All relevant env vars set in Vercel dashboard
- [ ] Feature tested locally with `npm run dev`

## Deployment

EasyDock auto-deploys via **Vercel + GitHub**. Push to `main` → Vercel builds and deploys automatically.

```bash
git add .
git commit -m "your change"
git push origin main
# Vercel picks it up automatically — check status at vercel.com/dashboard
```

## Environment Variables (Vercel Dashboard)

All secrets live in the **Vercel** project environment settings — NOT Netlify.

Go to: https://vercel.com → EasyDock project → Settings → Environment Variables

### Required variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-side only) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_…` in test, `sk_live_…` in live) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret for `/api/webhook` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (client-side) |

### Stripe live-mode switch (EAS-118)

When the board confirms live Stripe keys are available:

1. In Vercel dashboard → Environment Variables, update:
   - `STRIPE_SECRET_KEY` → `sk_live_…`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_…`
   - `STRIPE_WEBHOOK_SECRET` → new live signing secret (from Stripe dashboard → Webhooks)

2. In the Stripe live dashboard, register the production webhook:
   - Endpoint: `https://easydock.vercel.app/api/webhook`
   - Events: `checkout.session.completed`, `checkout.session.expired`, `account.updated`

3. Trigger a Vercel redeploy so the new env vars take effect:
   ```bash
   # Trivial commit or use Vercel dashboard "Redeploy"
   git commit --allow-empty -m "chore: redeploy for live Stripe keys" && git push
   ```

4. Smoke test one low-value real charge and refund to confirm end-to-end.

## Preview Deployments

Every PR gets a Vercel preview URL automatically. Use these for QA before merging to `main`.

## Rollback

In Vercel dashboard → Deployments → find the last good deploy → click "..." → "Promote to Production".

## Monitoring

- **Runtime errors / logs**: Vercel dashboard → Project → Functions (or use `mcp__claude_ai_Vercel__get_runtime_errors`)
- **Supabase**: Supabase dashboard → Logs
- **Stripe**: Stripe dashboard → Developers → Events

## Troubleshooting

### Build fails
Check Vercel build logs in the dashboard. Common causes:
- TypeScript errors (`npm run build` locally to reproduce)
- Missing env vars (Vercel only receives vars that are explicitly set)

### Stripe webhooks not firing
- Verify the webhook endpoint is registered in the **live** Stripe dashboard (not test)
- Confirm `STRIPE_WEBHOOK_SECRET` matches the signing secret shown for that endpoint
- Check Vercel function logs for 4xx/5xx from `/api/webhook`

### Supabase connection issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and keys are set in Vercel env vars
- Check Supabase project is not paused (free-tier projects pause after inactivity)
