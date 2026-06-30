import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const marinaId = searchParams.get("marinaId");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://easydock.vercel.app";

    if (!accountId || !marinaId) {
      return NextResponse.json(
        { error: "Missing accountId or marinaId" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // Generate a fresh account onboarding link for the expired session
    const link = await stripe.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      return_url: `${appUrl}/api/connect/return?marinaId=${marinaId}`,
      refresh_url: `${appUrl}/api/connect/refresh?accountId=${accountId}&marinaId=${marinaId}`,
    });

    // Redirect directly to the new Stripe-hosted onboarding link
    return NextResponse.redirect(link.url);
  } catch (err) {
    console.error("Connect refresh error:", err);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://easydock.vercel.app";
    return NextResponse.redirect(`${appUrl}/dashboard?stripeStatus=error`);
  }
}
