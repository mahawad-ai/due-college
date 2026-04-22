import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { postCircleActivity } from '@/lib/circle-auto-post';
import { Resend } from 'resend';
import { createHmac } from 'crypto';
import { renderSubmissionConfirmationEmail } from '@/emails/submission-confirmation';
import { formatDate, getDaysRemaining } from '@/lib/utils';

function buildUnsubscribeUrl(userId: string): string {
  const secret = process.env.CLERK_SECRET_KEY || 'fallback-secret';
  const sig = createHmac('sha256', secret).update(userId).digest('hex');
  return `https://due.college/api/unsubscribe?uid=${encodeURIComponent(userId)}&sig=${sig}`;
}

const getResend = () => new Resend(process.env.RESEND_API_KEY || 're_placeholder');

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

    // Send submission confirmation email (fire-and-forget)
    sendConfirmationEmail(user.id, deadlineId, collegeName, type, user).catch(console.error);
  }

  return NextResponse.json({ success: true });
}

async function sendConfirmationEmail(
  userId: string,
  deadlineId: string,
  collegeName: string,
  deadlineType: string,
  clerkUser: Awaited<ReturnType<typeof currentUser>>
) {
  const supabase = createServerSupabaseClient();

  // Get user email and name from our DB
  const { data: dbUser } = await supabase
    .from('users')
    .select('email, name')
    .eq('id', userId)
    .single();

  if (!dbUser?.email) return;

  // Find the next upcoming deadline across all their colleges
  const { data: userColleges } = await supabase
    .from('user_colleges')
    .select('college_id')
    .eq('user_id', userId);

  let nextDeadline: { college: string; type: string; date: string; daysRemaining: number } | undefined;

  if (userColleges && userColleges.length > 0) {
    const collegeIds = userColleges.map((uc) => uc.college_id);
    const today = new Date().toISOString().split('T')[0];

    const { data: upcomingDeadlines } = await supabase
      .from('deadlines')
      .select('id, type, date, college:colleges(name)')
      .in('college_id', collegeIds)
      .gt('date', today)
      .neq('id', deadlineId)
      .order('date', { ascending: true })
      .limit(5);

    if (upcomingDeadlines && upcomingDeadlines.length > 0) {
      // Skip ones already submitted
      const { data: submittedStatuses } = await supabase
        .from('user_deadline_status')
        .select('deadline_id')
        .eq('user_id', userId)
        .eq('submitted', true)
        .in('deadline_id', upcomingDeadlines.map((d) => d.id));

      const submittedIds = new Set((submittedStatuses || []).map((s) => s.deadline_id));
      const next = upcomingDeadlines.find((d) => !submittedIds.has(d.id));

      if (next) {
        const days = getDaysRemaining(next.date);
        nextDeadline = {
          college: (next.college as { name?: string } | null)?.name ?? 'Unknown',
          type: next.type,
          date: formatDate(next.date),
          daysRemaining: days,
        };
      }
    }
  }

  const studentName = dbUser.name || clerkUser?.firstName || 'there';
  const resend = getResend();

  await resend.emails.send({
    from: 'due.college <reminders@due.college>',
    to: dbUser.email,
    subject: `✅ ${collegeName} ${deadlineType} submitted!`,
    html: renderSubmissionConfirmationEmail({
      studentName,
      collegeName,
      deadlineType,
      nextDeadline,
      unsubscribeUrl: buildUnsubscribeUrl(userId),
    }),
  });
}
