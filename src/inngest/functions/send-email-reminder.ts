// @ts-nocheck
import { inngest } from '../client';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Resend } from 'resend';
import { createHmac } from 'crypto';
import { renderDeadlineReminderEmail } from '@/emails/deadline-reminder';
import { formatDate } from '@/lib/utils';

function buildUnsubscribeUrl(userId: string): string {
  const secret = process.env.CLERK_SECRET_KEY || 'fallback-secret';
  const sig = createHmac('sha256', secret).update(userId).digest('hex');
  return `https://due.college/api/unsubscribe?uid=${encodeURIComponent(userId)}&sig=${sig}`;
}

const getResend = () => new Resend(process.env.RESEND_API_KEY || 're_placeholder');

const CHECKLISTS: Record<number, string[]> = {
  30: [
    'Research this school deeply — visit campus if possible',
    'Start brainstorming your Common App / main essay',
    'Gather required test scores and transcripts',
  ],
  14: [
    'Finalize your personal statement — get a second opinion',
    'Request transcripts from your school counselor',
    'Confirm all supplemental essays are drafted',
  ],
  7: [
    'Proofread everything at least twice',
    'Confirm letters of recommendation are submitted',
    'Review all application requirements one final time',
  ],
  3: [
    'Final review of entire application',
    'Prepare payment method for application fee',
    'Double-check all uploaded documents are correct',
  ],
  1: [
    'Submit before midnight — don\'t wait until the last minute',
    'Screenshot your submission confirmation',
    'Email yourself a copy of your submitted application',
  ],
};

function getChecklist(days: number): string[] {
  const keys = [30, 14, 7, 3, 1];
  const closest = keys.reduce((prev, curr) =>
    Math.abs(curr - days) < Math.abs(prev - days) ? curr : prev
  );
  return CHECKLISTS[closest] || CHECKLISTS[7];
}

export const sendEmailReminder = inngest.createFunction(
  { id: 'send-email-reminder', name: 'Send Email Deadline Reminder' },
  { event: 'app/reminder.email' },
  async ({ event, step }) => {
    const { userId, deadlineId, daysRemaining } = event.data;
    const supabase = createServerSupabaseClient();
    const resend = getResend();

    // Get user info
    const user = await step.run('get-user', async () => {
      const { data } = await supabase.from('users').select('email, name').eq('id', userId).single();
      return data;
    });

    if (!user?.email) return { skipped: 'no user email' };

    // Check notification preferences
    const prefs = await step.run('get-prefs', async () => {
      const { data } = await supabase
        .from('notification_preferences')
        .select('email_enabled')
        .eq('user_id', userId)
        .single();
      return data;
    });

    if (prefs && prefs.email_enabled === false) return { skipped: 'email disabled' };

    // Get deadline with college
    const deadline = await step.run('get-deadline', async () => {
      const { data } = await supabase
        .from('deadlines')
        .select('*, college:colleges(name, city, state)')
        .eq('id', deadlineId)
        .single();
      return data;
    });

    if (!deadline) return { skipped: 'deadline not found' };

    // Check if already submitted
    const status = await step.run('check-status', async () => {
      const { data } = await supabase
        .from('user_deadline_status')
        .select('submitted')
        .eq('user_id', userId)
        .eq('deadline_id', deadlineId)
        .single();
      return data;
    });

    if (status?.submitted) return { skipped: 'already submitted' };

    const collegeName = deadline.college?.name || 'Unknown College';
    const checklist = getChecklist(daysRemaining);

    const urgency = daysRemaining <= 7 ? 'urgent' : daysRemaining <= 30 ? 'upcoming' : 'later';
    const urgencyColor = urgency === 'urgent' ? '#ff6b6b' : urgency === 'upcoming' ? '#ffd93d' : '#6bcb77';

    await step.run('send-email', async () => {
      return resend.emails.send({
        from: 'due.college <reminders@due.college>',
        to: user.email,
        subject: `⏰ ${collegeName} ${deadline.type} is in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
        html: renderDeadlineReminderEmail({
          studentName: user.name || 'there',
          collegeName,
          deadlineType: deadline.type,
          deadlineDate: formatDate(deadline.date),
          daysRemaining,
          checklist,
          urgencyColor,
          unsubscribeUrl: buildUnsubscribeUrl(userId),
        }),
      });
    });

    return { sent: true };
  }
);
