import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// POST /api/circle/join — join a circle via invite code
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { invite_code } = await req.json();
  if (!invite_code) return NextResponse.json({ error: 'Missing invite_code' }, { status: 400 });

  const supabase = createServerSupabaseClient();

  const { data: circle, error: findErr } = await supabase
    .from('circles').select('*').eq('invite_code', invite_code).single();
  if (findErr || !circle) return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });

  // Check member count (max 8)
  const { count } = await supabase
    .from('circle_members').select('*', { count: 'exact', head: true }).eq('circle_id', circle.id);
  if ((count || 0) >= 8) return NextResponse.json({ error: 'Circle is full (max 8 members)' }, { status: 409 });

  const { error: joinErr } = await supabase.from('circle_members').upsert({
    circle_id: circle.id,
    user_id: user.id,
    display_name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.emailAddresses[0]?.emailAddress,
    avatar_url: user.imageUrl || null,
  }, { onConflict: 'circle_id,user_id' });

  if (joinErr) return NextResponse.json({ error: joinErr.message }, { status: 500 });

  // Post join activity
  await supabase.from('circle_activities').insert({
    circle_id: circle.id,
    user_id: user.id,
    display_name: user.firstName || 'Someone',
    avatar_url: user.imageUrl || null,
    activity_type: 'custom',
    content: `${user.firstName || 'A new friend'} joined the Circle! 🎉`,
  });

  return NextResponse.json({ success: true, circle_id: circle.id });
}
