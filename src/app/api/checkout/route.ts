import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
      totalPrice,
      vesselName,
      vesselLength,
      vesselType,
      specialRequests,
    } = body;

    if (!slipId || !marinaId || !checkIn || !checkOut || !totalPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify slip exists and is available
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

    // Check for date conflicts
    const { data: conflicts } = (await supabase
      .from("bookings")
      .select("id")
      .eq("slip_id", slipId)
      .in("status", ["pending", "approved", "confirmed"])
      .lt("check_in", checkOut)
      .gt("check_out", checkIn)) as unknown as { data: { id: string }[] | null };

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: "Slip is already booked for these dates" },
        { status: 409 }
      );
    }

    // Create booking with pending status
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        slip_id: slipId,
        marina_id: marinaId,
        boat_owner_id: user.id,
        check_in: checkIn,
        check_out: checkOut,
        total_price: totalPrice,
        vessel_name: vesselName,
        vessel_length: vesselLength,
        vessel_type: vesselType,
        special_requests: specialRequests,
        status: "pending",
      } as never)
      .select()
      .single();

    const booking = bookingData as unknown as { id: string } | null;

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${slip.name} at ${slip.marinas.name}`,
              description: `${checkIn} to ${checkOut}`,
            },
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.headers.get("origin")}/bookings/${booking.id}?success=true`,
      cancel_url: `${request.headers.get("origin")}/slips/${slipId}`,
      metadata: {
        booking_id: booking.id,
      },
    });

    return NextResponse.json({ url: session.url, bookingId: booking.id });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
