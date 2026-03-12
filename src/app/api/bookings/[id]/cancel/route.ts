import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBookingEmail, fetchBookingEmailParams } from "@/lib/email/send";
import Stripe from "stripe";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // 1. Authenticate
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch booking with marina owner info
    const adminClient = createAdminClient();
    const { data: booking, error: fetchError } = await adminClient
      .from("bookings")
      .select("*, marinas(owner_id)")
      .eq("id", id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 3. Authorization: must be the boat owner or the marina owner
    const marinaOwnerId = (booking.marinas as { owner_id: string } | null)
      ?.owner_id;
    const isBoatOwner = user.id === booking.boat_owner_id;
    const isMarinaOwner = user.id === marinaOwnerId;

    if (!isBoatOwner && !isMarinaOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4. Check-in guard: compare YYYY-MM-DD strings directly to avoid UTC edge cases
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    if (booking.check_in <= today) {
      return NextResponse.json(
        { error: "Cannot cancel after check-in date" },
        { status: 422 }
      );
    }

    // 5. Already-cancelled guard
    if (booking.status === "cancelled") {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 409 }
      );
    }

    // 6. DB-first update with optimistic lock (prevents race conditions)
    const { error: updateError } = await adminClient
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("status", booking.status);

    if (updateError) {
      return NextResponse.json(
        { error: "Booking already modified — please refresh and try again" },
        { status: 409 }
      );
    }

    // 7. Stripe refund (only if payment was made)
    const hasPaymentIntent = !!booking.stripe_payment_intent_id;

    if (hasPaymentIntent) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      await stripe.refunds.create({
        payment_intent: booking.stripe_payment_intent_id as string,
        reverse_transfer: true,
        refund_application_fee: true,
      });
    }

    // Send booking cancelled email notification (non-fatal)
    try {
      const emailParams = await fetchBookingEmailParams(adminClient, id);
      await sendBookingEmail("cancelled", emailParams);
    } catch (emailErr) {
      console.error("Email notification failed:", emailErr);
    }

    return NextResponse.json({ success: true, refunded: hasPaymentIntent });
  } catch (err) {
    console.error("Cancel booking error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
