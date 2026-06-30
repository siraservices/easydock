import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: marinaId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify caller owns this marina
  const { data: marina } = (await supabase
    .from("marinas")
    .select("id, owner_id")
    .eq("id", marinaId)
    .single()) as unknown as {
    data: { id: string; owner_id: string | null } | null;
    error: unknown;
  };

  if (!marina || marina.owner_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "all";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = 25;

  const admin = createAdminClient();

  let query = admin
    .from("bookings")
    .select(
      `id, status, check_in, check_out, total_price, vessel_name, vessel_length, vessel_type,
       special_requests, created_at,
       slips(id, name),
       profiles!bookings_boat_owner_id_fkey(email, full_name)`,
      { count: "exact" }
    )
    .eq("marina_id", marinaId)
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (status !== "all") {
    query = query.eq(
      "status",
      status as
        | "pending"
        | "approved"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "declined"
    );
  }

  const { data: bookings, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: bookings ?? [], total: count ?? 0 });
}
