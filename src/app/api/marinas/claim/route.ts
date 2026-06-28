import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  let body: { marinaId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { marinaId } = body;
  if (!marinaId) {
    return NextResponse.json({ error: "marinaId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the user has marina_owner role
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const profile = profileData as { role: string } | null;

  if (!profile || profile.role !== "marina_owner") {
    return NextResponse.json(
      { error: "Only marina owners can claim a marina" },
      { status: 403 }
    );
  }

  // Use admin client to bypass RLS — we validate ownership manually above
  const admin = createAdminClient();

  // Check the marina exists and is unclaimed
  const { data: marina } = await admin
    .from("marinas")
    .select("id, name, owner_id, source")
    .eq("id", marinaId)
    .single();

  if (!marina) {
    return NextResponse.json({ error: "Marina not found" }, { status: 404 });
  }

  if (marina.owner_id !== null) {
    return NextResponse.json(
      { error: "This marina has already been claimed" },
      { status: 409 }
    );
  }

  // Claim the marina
  const { data: updated, error } = await admin
    .from("marinas")
    .update({
      owner_id: user.id,
      claimed_at: new Date().toISOString(),
      is_active: false, // owner must complete setup before going live
    } as never)
    .eq("id", marinaId)
    .select("id, name")
    .single();

  if (error || !updated) {
    console.error("Claim update error:", error);
    return NextResponse.json({ error: "Failed to claim marina" }, { status: 500 });
  }

  return NextResponse.json({ success: true, marina: updated });
}
