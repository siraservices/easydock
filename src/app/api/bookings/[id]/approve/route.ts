import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  // Update booking status to 'approved' — RLS scopes UPDATE to marina owners
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "approved" })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Not found or not authorized" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, booking: data });
}
