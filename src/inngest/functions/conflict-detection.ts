// @ts-nocheck
import { inngest } from '../client';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Resend } from 'resend';
import { parseISO, isFuture } from 'date-fns';
import { detectConflicts, getDaysRemaining, getUrgency } from '@/lib/utils';
import type { DeadlineWithCollege } from '@/lib/types';

const getResend = () => new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export const conflictDetection = inngest.createFunction(
  { id: 'conflict-detection', name: 'Detect Deadline Conflicts' },
  { event: 'app/conflict.check' },
  async ({ event, step }) => {
    const { userId } = event.data;
    const supabase = createServerSupabaseClient();

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
      const studentName = user.name || 'there';

      const conflictItems = conflicts
        .map(
          (c) => `
        <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;padding:16px;margin-bottom:12px">
          <p style="font-weight:700;color:#1a1f36;margin:0 0 8px">Week of ${c.week} — ${c.count} deadlines</p>
          ${c.deadlines
            .map(
              (d) => `<p style="margin:2px 0;font-size:14px;color:#6b7280">
                • ${d.college.name} ${d.type} — ${d.daysRemaining} days away
              </p>`
            )
            .join('')}
        </div>`
        )
        .join('');

      return resend.emails.send({
        from: 'due.college <reminders@due.college>',
        to: user.email,
        subject: `⚠️ You have ${conflicts.reduce((a, c) => a + c.count, 0)} deadlines in ${conflicts.length} busy week${conflicts.length !== 1 ? 's' : ''}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,system-ui,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:40px 24px">
  <div style="text-align:center;margin-bottom:32px">
    <span style="font-size:20px;font-weight:800;color:#1a1f36">due.college</span>
  </div>
  <div style="background:#fff;border-radius:24px;padding:32px;border:1px solid #e5e7eb">
    <h1 style="font-size:22px;font-weight:800;color:#1a1f36;margin:0 0 8px">
      ⚠️ You have overlapping deadlines, ${studentName}
    </h1>
    <p style="color:#6b7280;font-size:14px;margin:0 0 24px">
      These weeks have multiple applications due. Start early so you're not rushed.
    </p>
    ${conflictItems}
    <a href="https://due.college/dashboard" style="display:block;text-align:center;background:#ff6b6b;color:#fff;padding:14px 24px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px;margin-top:24px">
      View My Dashboard →
    </a>
  </div>
  <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:24px">
    due.college · <a href="https://due.college/settings" style="color:#9ca3af">Unsubscribe</a>
  </p>
</div>
</body>
</html>`,
      });
    });

    return { conflicts: conflicts.length };
  }
);
