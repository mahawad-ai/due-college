import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET /api/student-profile — retrieve user's profile
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Student profile fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}

// POST /api/student-profile — create or update profile
// Matches the schema in migration 005 and the field names the /profile page sends.
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    gpa,
    gpa_scale,
    weighted_gpa,
    class_rank,
    class_size,
    graduation_year,
    intended_major,
    intended_major_2,
    best_sat,
    best_act,
    preferred_regions,
    preferred_settings,
    preferred_size,
  } = body;

  const payload = {
    user_id: user.id,
    gpa,
    gpa_scale,
    weighted_gpa,
    class_rank,
    class_size,
    graduation_year,
    intended_major,
    intended_major_2,
    best_sat,
    best_act,
    preferred_regions,
    preferred_settings,
    preferred_size,
    updated_at: new Date().toISOString(),
  };

  const supabase = createServerSupabaseClient();

  // Upsert on user_id (student_profiles has UNIQUE constraint there per migration 005)
  const { data, error } = await supabase
    .from('student_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('Profile upsert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}
