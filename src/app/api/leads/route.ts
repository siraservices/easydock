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

  const name = typeof body.name === 'string' ? body.name : '';
  const email = typeof body.email === 'string' ? body.email : '';
  const user_type = typeof body.user_type === 'string' ? body.user_type : '';

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
  const supabase = createAdminClient();
  const { error } = await supabase.from('marina_leads').insert({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    user_type,
  });

  if (error) {
    console.error('Failed to insert marina lead:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
