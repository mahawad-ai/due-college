import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('recommendations').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ recommendations: data });
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { recommender_name, recommender_role, subject, date_asked, status, notes } = body;
  if (!recommender_name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('recommendations').insert({ user_id: user.id, recommender_name, recommender_role: recommender_role || 'teacher', subject: subject || null, date_asked: date_asked || null, status: status || 'not_asked', notes: notes || null }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ recommendation: data });
}

export async function PATCH(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('recommendations').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ recommendation: data });
}

export async function DELETE(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from('recommendations').delete().eq('id', id).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
