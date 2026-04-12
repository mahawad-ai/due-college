import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { inngest } from '@/inngest/client';

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('user_colleges')
    .select('*, college:colleges(*)')
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ userColleges: data });
}

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { collegeIds } = body as { collegeIds: string[] };

  if (!Array.isArray(collegeIds) || collegeIds.length === 0) {
    return NextResponse.json({ error: 'collegeIds required' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  // Ensure user record exists
  await supabase.from('users').upsert(
    {
      id: userId,
      email: body.email || '',
    },
    { onConflict: 'id', ignoreDuplicates: true }
  );

  // Insert user_colleges (ignore duplicates)
  const rows = collegeIds.map((id) => ({ user_id: userId, college_id: id }));
  const { error } = await supabase
    .from('user_colleges')
    .upsert(rows, { onConflict: 'user_id,college_id', ignoreDuplicates: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Trigger Inngest scheduleReminders for each college
  for (const collegeId of collegeIds) {
    await inngest.send({
      name: 'app/college.added',
      data: { userId, collegeId },
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { collegeId } = await req.json();
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from('user_colleges')
    .delete()
    .eq('user_id', userId)
    .eq('college_id', collegeId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
