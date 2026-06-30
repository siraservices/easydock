import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendCalculatorLeadAdminNotification } from "@/lib/email/send";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  const totalSlipsRaw = body.total_slips;
  const vacantSlipsRaw = body.vacant_slips;
  const avgMonthlyRateRaw = body.avg_monthly_rate;
  const avgVacancyMonthsRaw = body.avg_vacancy_months;
  const annualLossRaw = body.annual_loss;

  const totalSlips = typeof totalSlipsRaw === "number" ? totalSlipsRaw : null;
  const vacantSlips = typeof vacantSlipsRaw === "number" ? vacantSlipsRaw : null;
  const avgMonthlyRate = typeof avgMonthlyRateRaw === "number" ? avgMonthlyRateRaw : null;
  const avgVacancyMonths = typeof avgVacancyMonthsRaw === "number" ? avgVacancyMonthsRaw : null;
  const annualLoss = typeof annualLossRaw === "number" ? annualLossRaw : null;
  const phone = typeof body.phone === "string" ? body.phone.trim() || null : null;
  const role = typeof body.role === "string" ? body.role.trim() || null : null;
  const region = typeof body.region === "string" ? body.region.trim() || null : null;
  const marinaName = typeof body.marina_name === "string" ? body.marina_name.trim() || null : null;

  const admin = createAdminClient();
  const { error } = await (admin.from("calculator_leads") as ReturnType<typeof admin.from>).insert({
    email,
    phone,
    role,
    region,
    marina_name: marinaName,
    total_slips: totalSlips,
    vacant_slips: vacantSlips,
    avg_monthly_rate: avgMonthlyRate,
    avg_vacancy_months: avgVacancyMonths,
    annual_loss: annualLoss,
  });

  if (error) {
    console.error("calculator_leads insert error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  void sendCalculatorLeadAdminNotification({
    email,
    phone,
    role,
    marinaName,
    region,
    totalSlips,
    vacantSlips,
    avgMonthlyRate,
    annualLoss,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
