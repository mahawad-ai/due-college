import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { inngest } from '@/inngest/client';
import { postCircleActivity } from '@/lib/circle-auto-post';

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('user_colleges')
    .select('*, college:colleges(*)')
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ userColleges: data });
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { collegeIds } = body as { collegeIds: string[] };

  if (!Array.isArray(collegeIds) || collegeIds.length === 0) {
    return NextResponse.json({ error: 'collegeIds required' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  // Ensure user record exists
  await supabase.from('users').upsert(
    { id: user.id, email: body.email || '' },
    { onConflict: 'id', ignoreDuplicates: true }
  );

  // Insert user_colleges (ignore duplicates)
  const rows = collegeIds.map((id) => ({ user_id: user.id, college_id: id }));
  const { error } = await supabase
    .from('user_colleges')
    .upsert(rows, { onConflict: 'user_id,college_id', ignoreDuplicates: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Trigger Inngest reminders (non-fatal — college is already saved even if this fails)
  try {
    for (const collegeId of collegeIds) {
      await inngest.send({ name: 'app/college.added', data: { userId: user.id, collegeId } });
    }
  } catch (inngestErr) {
    console.error('Inngest send failed (non-fatal):', inngestErr);
  }

  // Auto-post to Circle — look up college names then post
  const { data: colleges } = await supabase
    .from('colleges')
    .select('name')
    .in('id', collegeIds);

  if (colleges && colleges.length > 0) {
    const displayName = user.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : 'Someone';

    const names = colleges.map((c: { name: string }) => c.name);
    const schoolList = names.length === 1
      ? names[0]
      : names.length === 2
      ? `${names[0]} and ${names[1]}`
      : `${names[0]}, ${names[1]}, and ${names.length - 2} more`;

    postCircleActivity({
      userId: user.id,
      displayName,
      avatarUrl: user.imageUrl || null,
      activityType: 'school_added',
      content: `added ${schoolList} to their list 🏫`,
      metadata: { collegeIds, collegeNames: names },
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { collegeId } = await req.json();
  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from('user_colleges')
    .delete()
    .eq('user_id', user.id)
    .eq('college_id', collegeId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
