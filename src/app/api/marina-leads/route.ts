import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMarinaLeadEmails } from "@/lib/email/send";

interface LeadBody {
  marinaId?: string;
  name?: string;
  email?: string;
  checkIn?: string;
  checkOut?: string;
  vesselLengthFt?: number;
  message?: string;
}

export async function POST(request: Request) {
  let body: LeadBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { marinaId, name, email, checkIn, checkOut, vesselLengthFt, message } = body;

  if (!marinaId || typeof marinaId !== "string") {
    return NextResponse.json({ error: "marinaId is required" }, { status: 400 });
  }
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "valid email is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Fetch the marina to validate it exists and is unclaimed
  const { data: marina, error: marinaError } = await admin
    .from("marinas")
    .select("id, name, city, state, phone, website, owner_id")
    .eq("id", marinaId)
    .single();

  if (marinaError || !marina) {
    return NextResponse.json({ error: "Marina not found" }, { status: 404 });
  }
  if (marina.owner_id !== null) {
    return NextResponse.json(
      { error: "This marina is already claimed — use the regular booking flow" },
      { status: 409 }
    );
  }

  // Insert the lead
  const { data: lead, error: insertError } = await admin
    .from("marina_spot_requests")
    .insert({
      marina_id: marinaId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      check_in: checkIn || null,
      check_out: checkOut || null,
      vessel_length_ft: vesselLengthFt || null,
      message: message?.trim() || null,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("marina_spot_requests insert error:", insertError);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }

  // Fire emails non-blocking — never let email failure affect the response
  sendMarinaLeadEmails({
    requesterName: name.trim(),
    requesterEmail: email.trim().toLowerCase(),
    marinaName: marina.name,
    marinaCity: marina.city,
    marinaState: marina.state,
    marinaPhone: marina.phone,
    marinaWebsite: marina.website,
    checkIn,
    checkOut,
    vesselLengthFt,
    message,
  }).catch(() => {});

  return NextResponse.json({ id: lead.id }, { status: 201 });
}
