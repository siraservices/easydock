import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Idempotency check — do not process the same Stripe event twice
  const { data: existing } = await supabase
    .from("stripe_processed_events")
    .select("id")
    .eq("id", event.id)
    .single();

  if (existing) {
    // Already processed — return 200 without re-processing
    return NextResponse.json({ received: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      const paymentIntentId = session.payment_intent as string;

      if (!bookingId) {
        // No booking to update — log and record event, return 200
        console.warn("checkout.session.completed: no booking_id in metadata", event.id);
        await supabase.from("stripe_processed_events").insert({
          id: event.id,
          event_type: event.type,
          booking_id: null,
        });
        return NextResponse.json({ received: true });
      }

      // Update booking to confirmed with payment intent
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          stripe_payment_intent_id: paymentIntentId,
        } as never)
        .eq("id", bookingId);

      if (updateError) {
        // DB write failed — attempt auto-refund so the customer isn't charged
        console.error("DB write failed for checkout.session.completed:", updateError);
        try {
          await stripe.refunds.create({ payment_intent: paymentIntentId });
          console.log("Auto-refund created for payment_intent:", paymentIntentId);
        } catch (refundErr) {
          console.error("Auto-refund failed:", refundErr);
        }
        // Do NOT insert into stripe_processed_events — Stripe will retry (idempotency check
        // on next attempt will detect if DB is back up and skip the already-processed event)
        return NextResponse.json(
          { error: "Database write failed" },
          { status: 500 }
        );
      }

      // DB write succeeded — record event to prevent duplicate processing
      await supabase.from("stripe_processed_events").insert({
        id: event.id,
        event_type: event.type,
        booking_id: bookingId,
      });

      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;

      if (!bookingId) {
        // No booking to cancel — record event and return 200
        await supabase.from("stripe_processed_events").insert({
          id: event.id,
          event_type: event.type,
          booking_id: null,
        });
        return NextResponse.json({ received: true });
      }

      // Cancel the booking
      const { error: cancelError } = await supabase
        .from("bookings")
        .update({ status: "cancelled" } as never)
        .eq("id", bookingId);

      if (cancelError) {
        console.error("DB write failed for checkout.session.expired:", cancelError);
        // Return 500 so Stripe retries
        return NextResponse.json(
          { error: "Database write failed" },
          { status: 500 }
        );
      }

      // Record event to prevent duplicate processing
      await supabase.from("stripe_processed_events").insert({
        id: event.id,
        event_type: event.type,
        booking_id: bookingId,
      });

      break;
    }

    default:
      // Unhandled event type — acknowledge receipt without processing
      break;
  }

  return NextResponse.json({ received: true });
}
