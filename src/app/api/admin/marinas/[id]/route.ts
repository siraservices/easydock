import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized", status: 401, user: null };

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const profile = profileData as { role: string } | null;

  if (!profile || profile.role !== "admin") {
    return { error: "Forbidden", status: 403, user: null };
  }

  return { error: null, status: 200, user };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const allowedFields = [
    "name",
    "address",
    "city",
    "state",
    "zip",
    "phone",
    "email",
    "website",
    "description",
    "is_active",
  ];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 1) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("marinas")
    .update(updates as never)
    .eq("id", id)
    .select("id, name, is_active, updated_at")
    .single();

  if (error) {
    console.error("Admin marina update error:", error);
    return NextResponse.json({ error: "Failed to update marina" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Marina not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, marina: data });
}
