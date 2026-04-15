import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { postCircleActivity } from '@/lib/circle-auto-post';

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const collegeId = req.nextUrl.searchParams.get('collegeId');
  const supabase = createServerSupabaseClient();

  const { data: deadlines } = await supabase
    .from('deadlines')
    .select('id')
    .eq('college_id', collegeId);

  if (!deadlines || deadlines.length === 0) {
    return NextResponse.json({ submitted: [] });
  }

  const deadlineIds = deadlines.map((d) => d.id);
  const { data: statuses, error } = await supabase
    .from('user_deadline_status')
    .select('*')
    .eq('user_id', user.id)
    .in('deadline_id', deadlineIds);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ submitted: statuses || [] });
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { deadlineId, submitted } = await req.json();
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.from('user_deadline_status').upsert(
    {
      user_id: user.id,
      deadline_id: deadlineId,
      submitted,
      submitted_at: submitted ? new Date().toISOString() : null,
    },
    { onConflict: 'user_id,deadline_id' }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Auto-post to Circle when a deadline is marked done
  if (submitted) {
    // Look up the deadline + college name for a meaningful message
    const { data: dl } = await supabase
      .from('deadlines')
      .select('type, college:colleges(name)')
      .eq('id', deadlineId)
      .single();

    const collegeName = (dl?.college as { name?: string } | null)?.name ?? 'a school';
    const type = dl?.type ?? 'deadline';
    const displayName = user.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : 'Someone';

    postCircleActivity({
      userId: user.id,
      displayName,
      avatarUrl: user.imageUrl || null,
      activityType: 'deadline_met',
      content: `submitted their ${type} application for ${collegeName} 🎉`,
      metadata: { deadlineId, collegeName, type },
    });
  }

  return NextResponse.json({ success: true });
}
