import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Resend } from 'resend';
import { renderNudgeEmail } from '@/emails/parent-nudge';

// Lazy-init so build-time page collection doesn't crash on missing env var
const getResend = () => new Resend(process.env.RESEND_API_KEY || 're_placeholder');

const NUDGE_MESSAGES = [
  "Hey, just checking in — how's the application going? 💪",
  "Friendly reminder: you've got a deadline coming up! Don't forget to work on it today. 📋",
  "Your parent wanted to make sure you're on track. You've got this! 🎯",
];

/**
 * POST /api/parent-view/[token]/nudge
 * Body: { deadline_id?: string, message_index?: number }
 * Sends a nudge email to the student on behalf of the parent.
 * Rate limited to 3 nudges per day per parent.
 */
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const supabase = createServerSupabaseClient();

  // Verify parent connection
  const { data: connection } = await supabase
    .from('parent_connections')
    .select('*')
    .eq('access_token', params.token)
    .single();

  if (!connection) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
  }

  // Rate limit: max 3 nudges per day
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('parent_nudges')
    .select('*', { count: 'exact', head: true })
    .eq('parent_connection_id', connection.id)
    .gte('sent_at', dayAgo);

  if ((count || 0) >= 3) {
    return NextResponse.json(
      { error: 'You can send up to 3 nudges per day. Try again tomorrow!' },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const messageIndex = typeof body.message_index === 'number' ? body.message_index : 0;
  const message = NUDGE_MESSAGES[messageIndex % NUDGE_MESSAGES.length];
  const deadlineId = body.deadline_id || null;

  // Get student info
  const { data: student } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', connection.student_user_id)
    .single();

  if (!student?.email) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  // Optionally get the specific deadline context
  let deadlineContext = '';
  if (deadlineId) {
    const { data: deadline } = await supabase
      .from('deadlines')
      .select('*, college:colleges(name)')
      .eq('id', deadlineId)
      .single();

    if (deadline) {
      const collegeName = (deadline.college as { name: string })?.name || 'your college';
      deadlineContext = `${collegeName} ${deadline.type} — due ${new Date(deadline.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
    }
  }

  // Record the nudge
  await supabase.from('parent_nudges').insert({
    parent_connection_id: connection.id,
    deadline_id: deadlineId,
    message,
  });

  // Send nudge email to the student
  const html = renderNudgeEmail({
    studentName: student.name || 'there',
    parentName: connection.parent_name,
    message,
    deadlineContext,
    unsubscribeUrl: `https://due.college/settings`,
  });

  try {
    await getResend().emails.send({
      from: 'due.college <reminders@due.college>',
      to: student.email,
      subject: `${connection.parent_name} sent you a nudge 💬`,
      html,
    });
  } catch (err) {
    console.error('Failed to send nudge email:', err);
    return NextResponse.json({ error: 'Failed to send nudge.' }, { status: 500 });
  }

  // Remaining nudges today
  const remaining = 3 - ((count || 0) + 1);

  return NextResponse.json({ ok: true, remaining });
}
