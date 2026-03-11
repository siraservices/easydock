-- Migration: Add Stripe Connect columns to marinas table
-- Phase 4: Stripe Connect Payouts

ALTER TABLE marinas
  ADD COLUMN IF NOT EXISTS stripe_account_id TEXT DEFAULT NULL;

ALTER TABLE marinas
  ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT FALSE NOT NULL;

ALTER TABLE marinas
  ADD COLUMN IF NOT EXISTS payouts_enabled BOOLEAN DEFAULT FALSE NOT NULL;

-- Index for webhook lookups by Stripe account ID (sparse — only rows with a value)
CREATE INDEX IF NOT EXISTS idx_marinas_stripe_account_id
  ON marinas(stripe_account_id)
  WHERE stripe_account_id IS NOT NULL;
