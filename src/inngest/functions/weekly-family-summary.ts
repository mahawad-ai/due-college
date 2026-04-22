// @ts-nocheck
import { inngest } from '../client';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Resend } from 'resend';
import { createHmac } from 'crypto';
import { formatDate, getDaysRemaining } from '@/lib/utils';
import { renderWeeklySummaryEmail } from '@/emails/weekly-summary';
import { addDays } from 'date-fns';

function buildUnsubscribeUrl(userId: string): string {
  const secret = process.env.CLERK_SECRET_KEY || 'fallback-secret';
  const sig = createHmac('sha256', secret).update(userId).digest('hex');
  return `https://due.college/api/unsubscribe?uid=${encodeURIComponent(userId)}&sig=${sig}`;
}

const getResend = () => new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export const weeklyFamilySummary = inngest.createFunction(
  { id: 'weekly-family-summary', name: 'Weekly Family Summary Email' },
  // Every Sunday at 9am ET
  { cron: '0 14 * * 0' },
  async ({ step }) => {
    const supabase = createServerSupabaseClient();
    const resend = getResend();

    // Get all family tier users
    const familyUsers = await step.run('get-family-users', async () => {
      const { data } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('subscription_tier', 'family');
      return data;
    });

    if (!familyUsers || familyUsers.length === 0) return { sent: 0 };

    let sent = 0;

    for (const user of familyUsers) {
      await step.run(`send-summary-${user.id}`, async () => {
        // Get user's colleges
        const { data: userColleges } = await supabase
          .from('user_colleges')
          .select('college_id')
          .eq('user_id', user.id);

        if (!userColleges || userColleges.length === 0) return;

        const collegeIds = userColleges.map((uc) => uc.college_id);

        // Get deadlines in next 30 days
        const today = new Date();
        const in30Days = addDays(today, 30);

        const { data: deadlines } = await supabase
          .from('deadlines')
          .select('*, college:colleges(name)')
          .in('college_id', collegeIds)
          .gte('date', today.toISOString().split('T')[0])
          .lte('date', in30Days.toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (!deadlines || deadlines.length === 0) return;

        const studentName = user.name || 'Your student';

        const deadlineData = deadlines.map((d) => ({
          college: d.college?.name ?? 'Unknown',
          type: d.type,
          date: formatDate(d.date),
          daysRemaining: getDaysRemaining(d.date),
        }));

        const emailHtml = renderWeeklySummaryEmail({
          studentName,
          deadlines: deadlineData,
          unsubscribeUrl: buildUnsubscribeUrl(user.id),
        });

        // Send to student
        await resend.emails.send({
          from: 'due.college <reminders@due.college>',
          to: user.email,
          subject: `📅 ${studentName}'s college deadlines this week`,
          html: emailHtml,
        });

        // Send to parent if connected
        const { data: parentConn } = await supabase
          .from('parent_connections')
          .select('parent_email, parent_name')
          .eq('student_user_id', user.id)
          .single();

        if (parentConn) {
          await resend.emails.send({
            from: 'due.college <reminders@due.college>',
            to: parentConn.parent_email,
            subject: `📅 ${studentName}'s college deadlines this week`,
            html: emailHtml,
          });
        }

        sent++;
      });
    }

    return { sent };
  }
);
