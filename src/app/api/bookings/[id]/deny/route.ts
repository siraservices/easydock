import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendBookingEmail, fetchBookingEmailParams } from "@/lib/email/send";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Authenticate user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch current status — deny is only valid for pending bookings
  const { data: existing, error: fetchError } = await supabase
    .from("bookings")
    .select("id, status")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "Not found or not authorized" },
      { status: 404 }
    );
  }

  if (existing.status !== "pending") {
    return NextResponse.json(
      {
        error:
          "Deny is only allowed for pending bookings; use cancel to reverse a confirmed booking.",
      },
      { status: 422 }
    );
  }

  // Update booking status to 'declined' — RLS scopes UPDATE to marina owners
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "declined" } as never)
    .eq("id", id)
    .select("id, status")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Not found or not authorized" },
      { status: 404 }
    );
  }

  // Send booking denied email notification (non-fatal)
  try {
    const adminClient = createAdminClient();
    const emailParams = await fetchBookingEmailParams(adminClient, id);
    await sendBookingEmail("denied", emailParams);
  } catch (emailErr) {
    console.error("Email notification failed:", emailErr);
  }

  return NextResponse.json({ success: true, booking: data });
}
