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
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    sat_score,
    act_score,
    gpa_weighted,
    gpa_unweighted,
    intended_majors,
    location_preference,
    budget_constraint,
    size_preference,
  } = body;

  const supabase = createServerSupabaseClient();

  // Check if profile exists
  const { data: existing } = await supabase
    .from('student_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (existing) {
    // Update
    const { data, error } = await supabase
      .from('student_profiles')
      .update({
        sat_score,
        act_score,
        gpa_weighted,
        gpa_unweighted,
        intended_majors,
        location_preference,
        budget_constraint,
        size_preference,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } else {
    // Create
    const { data, error } = await supabase
      .from('student_profiles')
      .insert({
        user_id: user.id,
        sat_score,
        act_score,
        gpa_weighted,
        gpa_unweighted,
        intended_majors,
        location_preference,
        budget_constraint,
        size_preference,
      })
      .select()
      .single();

    if (error) {
      console.error('Profile insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  }
}
