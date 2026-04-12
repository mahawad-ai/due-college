import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from('student_profiles').select('*').eq('user_id', user.id).single();
  return NextResponse.json({ profile: data || null });
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('student_profiles')
    .upsert({ user_id: user.id, ...body, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}
