// @ts-nocheck
import { inngest } from '../client';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Resend } from 'resend';
import { formatDate, getDaysRemaining } from '@/lib/utils';
import { addDays } from 'date-fns';

const getResend = () => new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export const weeklyFamilySummary = inngest.createFunction(
  { id: 'weekly-family-summary', name: 'Weekly Family Summary Email' },
  // Every Sunday at 9am ET
  { cron: '0 14 * * 0' },
  async ({ step }) => {
    const supabase = createServerSupabaseClient();

    // Get all family tier users
    const { data: familyUsers } = await step.run('get-family-users', async () => {
      return supabase.from('users').select('id, email, name').eq('subscription_tier', 'family');
    });

    if (!familyUsers?.data || familyUsers.data.length === 0) return { sent: 0 };

    let sent = 0;

    for (const user of familyUsers.data) {
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

        // Build deadline rows HTML
        const deadlineRows = deadlines
          .map((d) => {
            const days = getDaysRemaining(d.date);
            const color = days <= 7 ? '#ff6b6b' : days <= 14 ? '#ffd93d' : '#6bcb77';
            return `
            <tr>
              <td style="padding:12px 16px;font-weight:600;color:#1a1f36">${d.college?.name}</td>
              <td style="padding:12px 16px">
                <span style="background:${color}20;color:${color === '#ffd93d' ? '#92400e' : color};font-size:12px;font-weight:700;padding:2px 8px;border-radius:100px">${d.type}</span>
              </td>
              <td style="padding:12px 16px;color:#6b7280">${formatDate(d.date)}</td>
              <td style="padding:12px 16px;text-align:right">
                <span style="background:${color};color:${color === '#ffd93d' ? '#1a1f36' : '#fff'};font-size:12px;font-weight:700;padding:4px 10px;border-radius:100px">
                  ${days} day${days !== 1 ? 's' : ''}
                </span>
              </td>
            </tr>`;
          })
          .join('');

        const emailHtml = `
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
      📅 ${studentName}'s deadlines in the next 30 days
    </h1>
    <p style="color:#6b7280;font-size:14px;margin:0 0 24px">
      ${deadlines.length} upcoming deadline${deadlines.length !== 1 ? 's' : ''}
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <thead>
        <tr style="background:#f9fafb">
          <th style="padding:10px 16px;text-align:left;font-size:12px;color:#6b7280;font-weight:600">School</th>
          <th style="padding:10px 16px;text-align:left;font-size:12px;color:#6b7280;font-weight:600">Type</th>
          <th style="padding:10px 16px;text-align:left;font-size:12px;color:#6b7280;font-weight:600">Date</th>
          <th style="padding:10px 16px;text-align:right;font-size:12px;color:#6b7280;font-weight:600">Days Left</th>
        </tr>
      </thead>
      <tbody>${deadlineRows}</tbody>
    </table>
    <a href="https://due.college/dashboard" style="display:block;text-align:center;background:#1a1f36;color:#fff;padding:14px 24px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px;margin-top:24px">
      Open Dashboard →
    </a>
  </div>
  <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:24px">
    due.college Weekly Summary · <a href="https://due.college/settings" style="color:#9ca3af">Manage notifications</a>
  </p>
</div>
</body>
</html>`;

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
