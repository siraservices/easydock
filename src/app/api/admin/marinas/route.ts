import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all"; // all | active | inactive
  const claimed = searchParams.get("claimed") ?? "all"; // all | claimed | unclaimed
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = 25;
  const offset = (page - 1) * pageSize;

  const admin = createAdminClient();

  let query = admin
    .from("marinas")
    .select(
      "id, name, address, city, state, zip, phone, email, website, is_active, source, claimed_at, owner_id, created_at, profiles!marinas_owner_id_fkey(email, full_name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (search.trim()) {
    query = query.or(
      `name.ilike.%${search.trim()}%,city.ilike.%${search.trim()}%,state.ilike.%${search.trim()}%`
    );
  }

  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  if (claimed === "claimed") {
    query = query.not("owner_id", "is", null);
  } else if (claimed === "unclaimed") {
    query = query.is("owner_id", null);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Admin marinas query error:", error);
    return NextResponse.json({ error: "Failed to fetch marinas" }, { status: 500 });
  }

  return NextResponse.json({
    marinas: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
  });
}
