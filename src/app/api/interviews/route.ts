import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('interviews').select('*').eq('user_id', user.id).order('interview_date', { ascending: true, nullsFirst: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ interviews: data });
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { college_name, college_id, interview_date, format, interviewer_name, status, prep_notes, outcome_notes } = body;
  if (!college_name) return NextResponse.json({ error: 'Missing college name' }, { status: 400 });
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('interviews').insert({ user_id: user.id, college_name, college_id: college_id || null, interview_date: interview_date || null, format: format || 'unknown', interviewer_name: interviewer_name || null, status: status || 'invited', prep_notes: prep_notes || null, outcome_notes: outcome_notes || null }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ interview: data });
}

export async function PATCH(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('interviews').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ interview: data });
}

export async function DELETE(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from('interviews').delete().eq('id', id).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
