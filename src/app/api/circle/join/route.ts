import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Resend } from 'resend';
import { renderCircleJoinedEmail } from '@/emails/circle-joined';

const getResend = () => new Resend(process.env.RESEND_API_KEY || 're_placeholder');

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

  // Notify circle owner
  notifyOwner(circle, user, supabase).catch(console.error);

  return NextResponse.json({ success: true, circle_id: circle.id });
}

async function notifyOwner(
  circle: { id: string; created_by: string },
  joiner: Awaited<ReturnType<typeof currentUser>>,
  supabase: ReturnType<typeof createServerSupabaseClient>
) {
  // Don't notify if the owner is joining their own circle
  if (circle.created_by === joiner?.id) return;

  const { data: owner } = await supabase
    .from('users')
    .select('email, name')
    .eq('id', circle.created_by)
    .single();

  if (!owner?.email) return;

  const { count: memberCount } = await supabase
    .from('circle_members')
    .select('*', { count: 'exact', head: true })
    .eq('circle_id', circle.id);

  const joinerName = joiner?.firstName
    ? `${joiner.firstName} ${joiner.lastName || ''}`.trim()
    : joiner?.emailAddresses[0]?.emailAddress || 'Someone';

  await getResend().emails.send({
    from: 'due.college <reminders@due.college>',
    to: owner.email,
    subject: `${joinerName} joined your Circle! 🎉`,
    html: renderCircleJoinedEmail({
      ownerName: owner.name || 'there',
      joinerName,
      memberCount: memberCount || 1,
      circleUrl: 'https://due.college/circle',
    }),
  });
}
