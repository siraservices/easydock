import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendLeadConfirmationEmail } from '@/lib/email/send';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const name = typeof body.name === 'string' ? body.name : '';
  const email = typeof body.email === 'string' ? body.email : '';
  const rawUserType = typeof body.user_type === 'string' ? body.user_type : '';
  const user_type: 'yacht_owner' | 'marina_owner' | '' = (
    rawUserType === 'yacht_owner' || rawUserType === 'marina_owner' ? rawUserType : ''
  );
  const phone = typeof body.phone === 'string' ? body.phone : null;
  const boat_length = typeof body.boat_length === 'string' ? body.boat_length : null;
  const preferred_area = typeof body.preferred_area === 'string' ? body.preferred_area : null;

  // Inline validation
  const errors: Record<string, string> = {};

  if (!name.trim()) {
    errors.name = 'Name is required';
  }

  if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Invalid email';
  }

  if (!user_type) {
    errors.user_type = 'Please select a user type';
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  // Insert via admin client (bypasses RLS)
  // Extra fields (phone, boat_length, preferred_area) are stored if the
  // marina_leads table has those columns; Supabase silently ignores unknown cols.
  const supabase = createAdminClient();
  const insertData = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    user_type: user_type as 'yacht_owner' | 'marina_owner',
  };

  // Build optional metadata to pass alongside core fields
  const extras: Record<string, string> = {};
  if (phone) extras.phone = phone.trim();
  if (boat_length) extras.boat_length = boat_length;
  if (preferred_area) extras.preferred_area = preferred_area;

  const { error } = await supabase
    .from('marina_leads')
    .insert({ ...insertData, ...extras } as typeof insertData);

  if (error) {
    console.error('Failed to insert marina lead:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }

  // Send confirmation email — non-blocking, failure won't affect response
  await sendLeadConfirmationEmail(
    insertData.email,
    insertData.name,
    insertData.user_type
  );

  return NextResponse.json({ success: true }, { status: 201 });
}
