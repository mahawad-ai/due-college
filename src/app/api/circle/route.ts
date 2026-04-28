import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getBestCircleId } from '@/lib/circle-membership';

// GET /api/circle — get or create user's circle with members, activities, challenges
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();

  // Find the best circle for this user (handles multi-membership edge case)
  let circleId: string | null = await getBestCircleId(supabase, user.id);

  if (!circleId) {
    // Create a new circle and add user as first member
    const { data: newCircle, error: createErr } = await supabase
      .from('circles')
      .insert({ created_by: user.id })
      .select()
      .single();
    if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 });
    circleId = newCircle.id;

    await supabase.from('circle_members').insert({
      circle_id: circleId,
      user_id: user.id,
      display_name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.emailAddresses[0]?.emailAddress,
      avatar_url: user.imageUrl || null,
    });
  }

  // Fetch circle
  const { data: circle } = await supabase.from('circles').select('*').eq('id', circleId).single();

  // Fetch members
  const { data: members } = await supabase
    .from('circle_members')
    .select('*')
    .eq('circle_id', circleId)
    .order('joined_at', { ascending: true });

  // Fetch recent activities with reaction counts
  const { data: activities } = await supabase
    .from('circle_activities')
    .select('*, circle_reactions(reaction, user_id)')
    .eq('circle_id', circleId)
    .order('created_at', { ascending: false })
    .limit(20);

  // Fetch active challenges
  const { data: challenges } = await supabase
    .from('circle_challenges')
    .select('*, circle_challenge_members(user_id, completed_at)')
    .eq('circle_id', circleId)
    .order('created_at', { ascending: false });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://due.college';

  // Prefer handle-based invite URL if the user has claimed a handle
  const { data: handleRow } = await supabase
    .from('user_handles')
    .select('handle')
    .eq('user_id', user.id)
    .maybeSingle();

  const inviteUrl = handleRow?.handle
    ? `${baseUrl}/${handleRow.handle}`
    : `${baseUrl}/circle/join/${circle?.invite_code}`;

  return NextResponse.json({
    circle,
    members: members || [],
    activities: (activities || []).map((a) => ({
      ...a,
      reactions: aggregateReactions(a.circle_reactions || [], user.id),
      user_reactions: (a.circle_reactions || []).filter((r: { user_id: string }) => r.user_id === user.id).map((r: { reaction: string }) => r.reaction),
      circle_reactions: undefined,
    })),
    challenges: (challenges || []).map((c) => ({
      ...c,
      member_count: (c.circle_challenge_members || []).length,
      user_joined: (c.circle_challenge_members || []).some((m: { user_id: string }) => m.user_id === user.id),
      user_completed: (c.circle_challenge_members || []).some((m: { user_id: string; completed_at: string | null }) => m.user_id === user.id && m.completed_at),
      circle_challenge_members: undefined,
    })),
    invite_url: inviteUrl,
    user_handle: handleRow?.handle ?? null,
  });
}

// PATCH /api/circle — update privacy mode
export async function PATCH(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { privacy_mode } = await req.json();
  const supabase = createServerSupabaseClient();

  const { data: memberships } = await supabase
    .from('circle_members').select('circle_id').eq('user_id', user.id);
  const membership = memberships?.[0] ?? null;
  if (!membership) return NextResponse.json({ error: 'No circle found' }, { status: 404 });

  const { data, error } = await supabase
    .from('circles')
    .update({ privacy_mode })
    .eq('id', membership.circle_id)
    .eq('created_by', user.id)
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ circle: data });
}

function aggregateReactions(reactions: Array<{ reaction: string; user_id: string }>, _currentUserId: string) {
  const counts: Record<string, number> = { fire: 0, muscle: 0, heart: 0 };
  reactions.forEach((r) => { if (counts[r.reaction] !== undefined) counts[r.reaction]++; });
  return Object.entries(counts).map(([reaction, count]) => ({ reaction, count }));
}
