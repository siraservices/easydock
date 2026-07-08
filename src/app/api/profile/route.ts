import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { VESSEL_TYPES } from "@/lib/constants";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, role, vessel_name, vessel_length_ft, vessel_type")
    .eq("id", user.id)
    .single();

  if (error) return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { full_name, phone, vessel_name, vessel_length_ft, vessel_type } = body;

  // Validate vessel_type if provided
  if (vessel_type && !VESSEL_TYPES.includes(vessel_type)) {
    return NextResponse.json({ error: "Invalid vessel type" }, { status: 400 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (full_name !== undefined) update.full_name = full_name || null;
  if (phone !== undefined) update.phone = phone || null;
  if (vessel_name !== undefined) update.vessel_name = vessel_name || null;
  if (vessel_length_ft !== undefined) update.vessel_length_ft = vessel_length_ft ? Number(vessel_length_ft) : null;
  if (vessel_type !== undefined) update.vessel_type = vessel_type || null;

  const { error } = await supabase
    .from("profiles")
    .update(update as never)
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  return NextResponse.json({ success: true });
}
