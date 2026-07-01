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

  // Fetch current status — approve is only valid for pending bookings
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
      { error: "Approve is only allowed for pending bookings." },
      { status: 422 }
    );
  }

  // Update booking status to 'approved' — RLS scopes UPDATE to marina owners
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "approved" } as never)
    .eq("id", id)
    .select("id, status")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Not found or not authorized" },
      { status: 404 }
    );
  }

  // Send booking approved email notification (non-fatal)
  try {
    const adminClient = createAdminClient();
    const emailParams = await fetchBookingEmailParams(adminClient, id);
    await sendBookingEmail("approved", emailParams);
  } catch (emailErr) {
    console.error("Email notification failed:", emailErr);
  }

  return NextResponse.json({ success: true, booking: data });
}
