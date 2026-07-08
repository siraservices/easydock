import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/reviews?marina_id=<id>  — public, returns reviews with reviewer name
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const marinaId = searchParams.get("marina_id");

  if (!marinaId) {
    return NextResponse.json({ error: "marina_id is required" }, { status: 400 });
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("reviews")
    .select("id, rating, comment, created_at, reviewer_id, profiles(full_name)")
    .eq("marina_id", marinaId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }

  return NextResponse.json({ reviews: data ?? [] });
}

// POST /api/reviews  — authenticated boat_owner only, for a completed booking
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { booking_id, rating, comment } = body as {
      booking_id?: string;
      rating?: number;
      comment?: string;
    };

    if (!booking_id) {
      return NextResponse.json({ error: "booking_id is required" }, { status: 400 });
    }
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "rating must be 1–5" }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Verify booking belongs to this user and is completed
    const { data: booking, error: bookingErr } = await adminClient
      .from("bookings")
      .select("id, marina_id, boat_owner_id, status")
      .eq("id", booking_id)
      .single();

    if (bookingErr || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    if (booking.boat_owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (booking.status !== "completed") {
      return NextResponse.json(
        { error: "Reviews can only be left for completed bookings" },
        { status: 422 }
      );
    }

    // Insert (UNIQUE constraint on booking_id enforces one-review-per-booking)
    const { data: review, error: insertErr } = await adminClient
      .from("reviews")
      .insert({
        booking_id,
        marina_id: booking.marina_id,
        reviewer_id: user.id,
        rating,
        comment: comment?.trim() || null,
      })
      .select()
      .single();

    if (insertErr) {
      if (insertErr.code === "23505") {
        return NextResponse.json(
          { error: "You have already reviewed this booking" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
