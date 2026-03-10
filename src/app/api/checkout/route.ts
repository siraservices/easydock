import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateNights } from "@/lib/utils/format";
import Stripe from "stripe";
import type { Database } from "@/types/database";

type Marina = Database["public"]["Tables"]["marinas"]["Row"];
type SlipWithMarina = Database["public"]["Tables"]["slips"]["Row"] & {
  marinas: Marina;
};

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      slipId,
      marinaId,
      checkIn,
      checkOut,
      vesselName,
      vesselLength,
      vesselType,
      specialRequests,
    } = body;

    // Note: totalPrice from body is intentionally NOT used — server computes price
    if (!slipId || !marinaId || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      return NextResponse.json(
        { error: "Check-out must be after check-in" },
        { status: 400 }
      );
    }

    // Fetch slip with marina details (uses RLS-respecting user client)
    const { data: slipData } = await supabase
      .from("slips")
      .select("*, marinas!inner(*)")
      .eq("id", slipId)
      .eq("is_available", true)
      .single();

    const slip = slipData as unknown as SlipWithMarina | null;

    if (!slip) {
      return NextResponse.json(
        { error: "Slip not available" },
        { status: 400 }
      );
    }

    // Server-side price computation — client-submitted totalPrice is never used
    const nights = calculateNights(checkIn, checkOut);
    const basePrice = slip.price_per_night * nights;
    const serviceFeeRate = 0.15;
    const yachtOwnerFeeRate = 0.10; // yacht owner pays 10% surcharge on top
    const yachtOwnerFee = Math.round(basePrice * yachtOwnerFeeRate * 100) / 100;
    const totalChargedToCustomer = basePrice + yachtOwnerFee;
    const platformFeeAmount = Math.round(basePrice * serviceFeeRate * 100) / 100;

    // Create booking atomically via RPC (conflict check + insert in one transaction)
    const adminClient = createAdminClient();
    const { data: rpcData, error: rpcError } = await adminClient.rpc(
      "create_booking_atomic",
      {
        p_slip_id: slipId,
        p_marina_id: marinaId,
        p_boat_owner_id: user.id,
        p_check_in: checkIn,
        p_check_out: checkOut,
        p_total_price: totalChargedToCustomer,
        p_vessel_name: vesselName || "",
        p_vessel_length: vesselLength || 0,
        p_vessel_type: vesselType || "",
        p_special_requests: specialRequests || "",
        p_platform_fee_amount: platformFeeAmount,
      }
    );

    if (rpcError) {
      console.error("RPC error creating booking:", rpcError);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 }
      );
    }

    const result = rpcData as { booking_id: string | null; conflict: boolean }[] | null;

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 }
      );
    }

    if (result[0].conflict) {
      return NextResponse.json(
        { error: "This slip is no longer available for those dates" },
        { status: 409 }
      );
    }

    const bookingId = result[0].booking_id;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 }
      );
    }

    // Create Stripe Checkout Session with Airbnb-style fee breakdown
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${slip.name} at ${slip.marinas.name}`,
              description: `${checkIn} to ${checkOut} (${nights} night${nights === 1 ? "" : "s"})`,
            },
            unit_amount: Math.round(basePrice * 100),
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "EasyDock service fee",
            },
            unit_amount: Math.round(yachtOwnerFee * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes from now
      success_url: `${request.headers.get("origin")}/bookings/${bookingId}?success=true`,
      cancel_url: `${request.headers.get("origin")}/slips/${slipId}`,
      metadata: {
        booking_id: bookingId,
      },
    });

    return NextResponse.json({ url: session.url, bookingId });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
