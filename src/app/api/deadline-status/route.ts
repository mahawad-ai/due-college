import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const collegeId = req.nextUrl.searchParams.get('collegeId');
  const supabase = createServerSupabaseClient();

  // Get deadlines for the college
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
    .eq('user_id', userId)
    .in('deadline_id', deadlineIds);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ submitted: statuses || [] });
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { deadlineId, submitted } = await req.json();
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.from('user_deadline_status').upsert(
    {
      user_id: userId,
      deadline_id: deadlineId,
      submitted: submitted,
      submitted_at: submitted ? new Date().toISOString() : null,
    },
    { onConflict: 'user_id,deadline_id' }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
