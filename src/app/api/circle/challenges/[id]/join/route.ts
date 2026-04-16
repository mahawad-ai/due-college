import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { postCircleActivity } from '@/lib/circle-auto-post';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();

  const { data: existing } = await supabase
    .from('circle_challenge_members')
    .select('challenge_id')
    .eq('challenge_id', params.id)
    .eq('user_id', user.id)
    .single();

  // Load the challenge so we can reference its title in the activity post
  const { data: challenge } = await supabase
    .from('circle_challenges')
    .select('id, title')
    .eq('id', params.id)
    .single();

  const displayName = user.firstName || user.fullName || 'Someone';
  const avatarUrl = user.imageUrl ?? null;

  if (existing) {
    await supabase
      .from('circle_challenge_members')
      .delete()
      .eq('challenge_id', params.id)
      .eq('user_id', user.id);

    if (challenge) {
      await postCircleActivity({
        userId: user.id,
        displayName,
        avatarUrl,
        activityType: 'custom',
        content: `left the "${challenge.title}" challenge`,
        metadata: { kind: 'challenge_left', challenge_id: challenge.id, challenge_title: challenge.title },
      });
    }
    return NextResponse.json({ toggled: 'left' });
  } else {
    await supabase
      .from('circle_challenge_members')
      .insert({ challenge_id: params.id, user_id: user.id });

    if (challenge) {
      await postCircleActivity({
        userId: user.id,
        displayName,
        avatarUrl,
        activityType: 'custom',
        content: `joined the "${challenge.title}" challenge`,
        metadata: { kind: 'challenge_joined', challenge_id: challenge.id, challenge_title: challenge.title },
      });
    }
    return NextResponse.json({ toggled: 'joined' });
  }
}
