import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const marinaId = searchParams.get("marinaId");

    if (!marinaId) {
      return NextResponse.json({ error: "Missing marinaId" }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    // Fetch marina's stripe_account_id from DB
    const { data: marina, error: marinaError } = await adminClient
      .from("marinas")
      .select("id, stripe_account_id")
      .eq("id", marinaId)
      .single();

    if (marinaError || !marina || !marina.stripe_account_id) {
      console.error("Marina or stripe_account_id not found:", marinaError);
      return NextResponse.redirect(`${appUrl}/dashboard?stripeStatus=error`);
    }

    const stripe = getStripe();

    // Always retrieve from Stripe to get the authoritative account status
    const account = await stripe.accounts.retrieve(marina.stripe_account_id);

    // Sync status back to DB
    const { error: updateError } = await adminClient
      .from("marinas")
      .update({
        stripe_onboarding_complete: account.details_submitted,
        payouts_enabled: account.payouts_enabled ?? false,
      })
      .eq("id", marinaId);

    if (updateError) {
      console.error("Failed to update stripe status:", updateError);
      return NextResponse.redirect(`${appUrl}/dashboard?stripeStatus=error`);
    }

    const status =
      account.payouts_enabled ? "connected" : "pending";

    return NextResponse.redirect(`${appUrl}/dashboard?stripeStatus=${status}`);
  } catch (err) {
    console.error("Connect return error:", err);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    return NextResponse.redirect(`${appUrl}/dashboard?stripeStatus=error`);
  }
}
