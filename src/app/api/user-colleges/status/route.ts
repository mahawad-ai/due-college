import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// PATCH /api/user-colleges/status — update app_status, college_notes, or decision_date for a college
export async function PATCH(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { college_id, app_status, college_notes, decision_date } = body;
  if (!college_id) return NextResponse.json({ error: 'Missing college_id' }, { status: 400 });

  const supabase = createServerSupabaseClient();
  const updates: Record<string, unknown> = {};
  if (app_status !== undefined) updates.app_status = app_status;
  if (college_notes !== undefined) updates.college_notes = college_notes;
  if (decision_date !== undefined) updates.decision_date = decision_date;

  const { data, error } = await supabase
    .from('user_colleges')
    .update(updates)
    .eq('user_id', user.id)
    .eq('college_id', college_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ college: data });
}

// GET /api/user-colleges/status — get all colleges with their statuses
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('user_colleges')
    .select('*, college:colleges(*)')
    .eq('user_id', user.id)
    .order('added_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ colleges: data });
}
