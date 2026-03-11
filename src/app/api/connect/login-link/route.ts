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

    // Verify user owns this marina and fetch Stripe fields
    const { data: marina, error: marinaError } = await adminClient
      .from("marinas")
      .select("id, stripe_account_id, payouts_enabled")
      .eq("id", marinaId)
      .eq("owner_id", user.id)
      .single();

    if (marinaError || !marina) {
      return NextResponse.json(
        { error: "Marina not found or access denied" },
        { status: 404 }
      );
    }

    if (!marina.stripe_account_id || !marina.payouts_enabled) {
      return NextResponse.json(
        { error: "Stripe account not fully connected" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const loginLink = await stripe.accounts.createLoginLink(
      marina.stripe_account_id
    );

    return NextResponse.json({ url: loginLink.url });
  } catch (err) {
    console.error("Login link error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
