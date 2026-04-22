// @ts-nocheck
import { inngest } from '../client';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Resend } from 'resend';
import { createHmac } from 'crypto';
import { parseISO, isFuture } from 'date-fns';
import { detectConflicts, getDaysRemaining, getUrgency } from '@/lib/utils';
import { renderConflictAlertEmail } from '@/emails/conflict-alert';
import type { DeadlineWithCollege } from '@/lib/types';

function buildUnsubscribeUrl(userId: string): string {
  const secret = process.env.CLERK_SECRET_KEY || 'fallback-secret';
  const sig = createHmac('sha256', secret).update(userId).digest('hex');
  return `https://due.college/api/unsubscribe?uid=${encodeURIComponent(userId)}&sig=${sig}`;
}

const getResend = () => new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export const conflictDetection = inngest.createFunction(
  { id: 'conflict-detection', name: 'Detect Deadline Conflicts' },
  { event: 'app/conflict.check' },
  async ({ event, step }) => {
    const { userId } = event.data;
    const supabase = createServerSupabaseClient();
    const resend = getResend();

    // Get user info
    const user = await step.run('get-user', async () => {
      const { data } = await supabase.from('users').select('email, name').eq('id', userId).single();
      return data;
    });

    if (!user?.email) return { skipped: 'no user' };

    // Get user's colleges + deadlines
    const userColleges = await step.run('get-colleges', async () => {
      const { data } = await supabase.from('user_colleges').select('college_id').eq('user_id', userId);
      return data;
    });

    if (!userColleges?.length) return { skipped: 'no colleges' };

    const collegeIds = userColleges.map((uc: { college_id: string }) => uc.college_id);

    const deadlines = await step.run('get-deadlines', async () => {
      const { data } = await supabase
        .from('deadlines')
        .select('*, college:colleges(id, name, state, city, website, common_app)')
        .in('college_id', collegeIds)
        .order('date', { ascending: true });
      return data;
    });

    if (!deadlines?.length) return { skipped: 'no deadlines' };

    // Only look at future deadlines
    const futureDeadlines: DeadlineWithCollege[] = deadlines
      .filter((d: { date: string }) => isFuture(parseISO(d.date)))
      .map((d: { date: string }) => {
        const days = getDaysRemaining(d.date);
        return { ...d, daysRemaining: days, urgency: getUrgency(days) };
      });

    const conflicts = detectConflicts(futureDeadlines);

    if (conflicts.length === 0) return { conflicts: 0 };

    // Send conflict alert email
    await step.run('send-conflict-email', async () => {
      const conflictData = conflicts.map((c) => ({
        week: c.week,
        count: c.count,
        deadlines: c.deadlines.map((d) => ({
          college: d.college.name,
          type: d.type,
          date: d.date,
          daysRemaining: d.daysRemaining,
        })),
      }));

      return resend.emails.send({
        from: 'due.college <reminders@due.college>',
        to: user.email,
        subject: `⚠️ Deadline conflict: ${conflicts.length} busy week${conflicts.length !== 1 ? 's' : ''} ahead`,
        html: renderConflictAlertEmail({
          studentName: user.name || 'there',
          conflicts: conflictData,
          unsubscribeUrl: buildUnsubscribeUrl(userId),
        }),
      });
    });

    return { conflicts: conflicts.length };
  }
);
