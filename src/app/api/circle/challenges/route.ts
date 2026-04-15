import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();
  const { data: membership } = await supabase
    .from('circle_members').select('circle_id').eq('user_id', user.id).single();
  if (!membership) return NextResponse.json({ challenges: [] });

  const { data, error } = await supabase
    .from('circle_challenges')
    .select('*, circle_challenge_members(user_id, completed_at)')
    .eq('circle_id', membership.circle_id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    challenges: (data || []).map((c) => ({
      ...c,
      member_count: (c.circle_challenge_members || []).length,
      user_joined: (c.circle_challenge_members || []).some((m: { user_id: string }) => m.user_id === user.id),
      user_completed: (c.circle_challenge_members || []).some((m: { user_id: string; completed_at: string | null }) => m.user_id === user.id && m.completed_at),
      circle_challenge_members: undefined,
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, description, due_date } = await req.json();
  if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 });

  const supabase = createServerSupabaseClient();
  const { data: membership } = await supabase
    .from('circle_members').select('circle_id').eq('user_id', user.id).single();
  if (!membership) return NextResponse.json({ error: 'Not in a circle' }, { status: 404 });

  const { data, error } = await supabase.from('circle_challenges').insert({
    circle_id: membership.circle_id,
    title,
    description: description || null,
    due_date: due_date || null,
    created_by: user.id,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ challenge: data });
}
