import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getBestCircleId } from '@/lib/circle-membership';
import { Resend } from 'resend';
import { renderCircleInviteEmail } from '@/emails/circle-invite';

// Lazy-init so build-time page collection doesn't crash on missing env var
const getResend = () => new Resend(process.env.RESEND_API_KEY || 're_placeholder');

/**
 * POST /api/circle/invite-email
 * Body: { email: string }
 * Sends a circle invite email on behalf of the current user.
 */
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { email } = await req.json();
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  // Get the sender's handle (if they have one)
  const { data: handleRow } = await supabase
    .from('user_handles')
    .select('handle')
    .eq('user_id', user.id)
    .maybeSingle();

  // Get the sender's best circle (prefers group circles over solo)
  const circleId = await getBestCircleId(supabase, user.id);
  if (!circleId) {
    return NextResponse.json({ error: 'You need a Circle first.' }, { status: 400 });
  }

  const { data: memberRow } = await supabase
    .from('circle_members')
    .select('display_name')
    .eq('circle_id', circleId)
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: circle } = await supabase
    .from('circles')
    .select('invite_code')
    .eq('id', circleId)
    .single();

  if (!circle) {
    return NextResponse.json({ error: 'Circle not found.' }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://due.college';
  const senderName = memberRow?.display_name || user.firstName || 'A friend';

  // Prefer handle-based URL, fallback to invite code URL
  const inviteUrl = handleRow?.handle
    ? `${baseUrl}/${handleRow.handle}`
    : `${baseUrl}/circle/join/${circle.invite_code}`;

  const html = renderCircleInviteEmail({
    senderName,
    inviteUrl,
  });

  try {
    await getResend().emails.send({
      from: 'due.college <noreply@due.college>',
      to: email.trim(),
      subject: `${senderName} invited you to their Circle on due.college`,
      html,
    });
  } catch (err: unknown) {
    console.error('Failed to send circle invite email:', err);
    return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
