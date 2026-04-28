import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getBestCircleId } from '@/lib/circle-membership';

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();
  const circleId = await getBestCircleId(supabase, user.id);
  if (!circleId) return NextResponse.json({ challenges: [] });

  const { data, error } = await supabase
    .from('circle_challenges')
    .select('*, circle_challenge_members(user_id, completed_at)')
    .eq('circle_id', circleId)
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
  const circleId = await getBestCircleId(supabase, user.id);
  if (!circleId) return NextResponse.json({ error: 'Not in a circle' }, { status: 404 });

  const { data, error } = await supabase.from('circle_challenges').insert({
    circle_id: circleId,
    title,
    description: description || null,
    due_date: due_date || null,
    created_by: user.id,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Post to the circle feed so all members see the new challenge
  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Someone';

  supabase.from('circle_activities').insert({
    circle_id: circleId,
    user_id: user.id,
    display_name: displayName,
    avatar_url: user.imageUrl || null,
    activity_type: 'custom',
    content: `started a new challenge: "${title}" 🏆`,
    metadata: { challenge_id: data.id },
  }).then(() => {}).catch(console.error);

  return NextResponse.json({ challenge: data });
}
