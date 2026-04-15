import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET /api/circle/activities
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();
  const { data: membership } = await supabase
    .from('circle_members').select('circle_id').eq('user_id', user.id).single();
  if (!membership) return NextResponse.json({ activities: [] });

  const { data, error } = await supabase
    .from('circle_activities')
    .select('*, circle_reactions(reaction, user_id)')
    .eq('circle_id', membership.circle_id)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    activities: (data || []).map((a) => ({
      ...a,
      reactions: aggregateReactions(a.circle_reactions || []),
      user_reactions: (a.circle_reactions || []).filter((r: { user_id: string }) => r.user_id === user.id).map((r: { reaction: string }) => r.reaction),
      circle_reactions: undefined,
    })),
  });
}

// POST /api/circle/activities
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { activity_type, content, metadata } = await req.json();
  if (!activity_type || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const supabase = createServerSupabaseClient();
  const { data: membership } = await supabase
    .from('circle_members').select('circle_id').eq('user_id', user.id).single();
  if (!membership) return NextResponse.json({ error: 'Not in a circle' }, { status: 404 });

  const { data, error } = await supabase.from('circle_activities').insert({
    circle_id: membership.circle_id,
    user_id: user.id,
    display_name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Someone',
    avatar_url: user.imageUrl || null,
    activity_type,
    content,
    metadata: metadata || {},
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ activity: data });
}

function aggregateReactions(reactions: Array<{ reaction: string }>) {
  const counts: Record<string, number> = { fire: 0, muscle: 0, heart: 0 };
  reactions.forEach((r) => { if (counts[r.reaction] !== undefined) counts[r.reaction]++; });
  return Object.entries(counts).map(([reaction, count]) => ({ reaction, count }));
}
