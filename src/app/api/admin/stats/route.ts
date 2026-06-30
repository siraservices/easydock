import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const profile = profileData as { role: string } | null;

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  const [
    totalResult,
    claimedResult,
    activeResult,
    bookingsTotalResult,
    bookingsActiveResult,
    revenueResult,
  ] = await Promise.all([
    admin.from("marinas").select("id", { count: "exact", head: true }),
    admin
      .from("marinas")
      .select("id", { count: "exact", head: true })
      .not("owner_id", "is", null),
    admin
      .from("marinas")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    admin.from("bookings").select("id", { count: "exact", head: true }),
    admin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "approved", "confirmed"]),
    admin.from("bookings").select("total_price").in("status", ["confirmed", "completed"]),
  ]);

  const total = totalResult.count ?? 0;
  const claimed = claimedResult.count ?? 0;
  const active = activeResult.count ?? 0;
  const bookingsTotal = bookingsTotalResult.count ?? 0;
  const bookingsActive = bookingsActiveResult.count ?? 0;
  const totalRevenue = (revenueResult.data ?? []).reduce(
    (sum, b) => sum + ((b as { total_price: number }).total_price ?? 0),
    0
  );

  return NextResponse.json({
    total,
    claimed,
    unclaimed: total - claimed,
    active,
    bookingsTotal,
    bookingsActive,
    totalRevenue,
  });
}
