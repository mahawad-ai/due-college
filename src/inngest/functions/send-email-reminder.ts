// @ts-nocheck
import { inngest } from '../client';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Resend } from 'resend';
import { renderDeadlineReminderEmail } from '@/emails/deadline-reminder';
import { formatDate } from '@/lib/utils';

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

    // Get user info
    const { data: user } = await step.run('get-user', async () => {
      return supabase.from('users').select('email, name').eq('id', userId).single();
    });

    if (!user?.data?.email) return { skipped: 'no user email' };

    // Get deadline with college
    const { data: deadline } = await step.run('get-deadline', async () => {
      return supabase
        .from('deadlines')
        .select('*, college:colleges(name, city, state)')
        .eq('id', deadlineId)
        .single();
    });

    if (!deadline?.data) return { skipped: 'deadline not found' };

    // Check if already submitted
    const { data: status } = await step.run('check-status', async () => {
      return supabase
        .from('user_deadline_status')
        .select('submitted')
        .eq('user_id', userId)
        .eq('deadline_id', deadlineId)
        .single();
    });

    if (status?.data?.submitted) return { skipped: 'already submitted' };

    const d = deadline.data;
    const collegeName = d.college?.name || 'Unknown College';
    const checklist = getChecklist(daysRemaining);

    const urgency = daysRemaining <= 7 ? 'urgent' : daysRemaining <= 30 ? 'upcoming' : 'later';
    const urgencyColor = urgency === 'urgent' ? '#ff6b6b' : urgency === 'upcoming' ? '#ffd93d' : '#6bcb77';

    await step.run('send-email', async () => {
      return resend.emails.send({
        from: 'due.college <reminders@due.college>',
        to: user.data!.email,
        subject: `⏰ ${collegeName} ${d.type} is in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
        html: renderDeadlineReminderEmail({
          studentName: user.data!.name || 'there',
          collegeName,
          deadlineType: d.type,
          deadlineDate: formatDate(d.date),
          daysRemaining,
          checklist,
          urgencyColor,
        }),
      });
    });

    return { sent: true };
  }
);
