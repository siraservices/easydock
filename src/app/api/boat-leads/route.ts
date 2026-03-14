import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : null;
  const boat_length = typeof body.boat_length === 'string' ? body.boat_length : '';
  const boat_beam = typeof body.boat_beam === 'string' ? body.boat_beam.trim() : null;
  const preferred_area = typeof body.preferred_area === 'string' ? body.preferred_area : '';
  const timeline = typeof body.timeline === 'string' ? body.timeline : null;

  const errors: Record<string, string> = {};

  if (!name) errors.name = 'Name is required';
  if (!EMAIL_REGEX.test(email)) errors.email = 'Valid email is required';
  if (!boat_length) errors.boat_length = 'Boat length is required';
  if (!preferred_area) errors.preferred_area = 'Preferred area is required';

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('boat_owner_leads').insert({
    name,
    email,
    phone,
    boat_length,
    boat_beam,
    preferred_area,
    timeline,
  });

  if (error) {
    console.error('Failed to insert boat owner lead:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
