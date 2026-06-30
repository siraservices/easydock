import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { marinaId } = body;

    if (!marinaId) {
      return NextResponse.json(
        { error: "Missing marinaId" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // Verify user owns this marina
    const { data: marina, error: marinaError } = await adminClient
      .from("marinas")
      .select("id, owner_id, stripe_account_id, stripe_onboarding_complete")
      .eq("id", marinaId)
      .eq("owner_id", user.id)
      .single();

    if (marinaError || !marina) {
      return NextResponse.json(
        { error: "Marina not found or access denied" },
        { status: 404 }
      );
    }

    // If already connected and onboarding complete, no need to re-onboard
    if (marina.stripe_account_id && marina.stripe_onboarding_complete) {
      return NextResponse.json(
        { error: "Already connected" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://easydock.vercel.app";

    let accountId = marina.stripe_account_id;

    // Create a new Express account only if one doesn't exist yet
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      accountId = account.id;

      // Store stripe_account_id BEFORE generating the account link
      // (link is one-time-use; we must persist the ID even if the user closes the tab)
      const { error: updateError } = await adminClient
        .from("marinas")
        .update({ stripe_account_id: accountId })
        .eq("id", marinaId)
        .eq("owner_id", user.id);

      if (updateError) {
        console.error("Failed to store stripe_account_id:", updateError);
        return NextResponse.json(
          { error: "Failed to save Stripe account" },
          { status: 500 }
        );
      }
    }

    // Generate a fresh account onboarding link
    const link = await stripe.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      return_url: `${appUrl}/api/connect/return?marinaId=${marinaId}`,
      refresh_url: `${appUrl}/api/connect/refresh?accountId=${accountId}&marinaId=${marinaId}`,
    });

    return NextResponse.json({ url: link.url });
  } catch (err) {
    console.error("Connect onboard error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
