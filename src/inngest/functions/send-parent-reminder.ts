import { inngest } from '../client';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Resend } from 'resend';
import twilio from 'twilio';
import { formatDate } from '@/lib/utils';

const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const sendParentReminder = inngest.createFunction(
  { id: 'send-parent-reminder', name: 'Send Parent Reminder' },
  { event: 'app/reminder.parent' },
  async ({ event, step }) => {
    const { userId, deadlineId, daysRemaining } = event.data;
    const supabase = createServerSupabaseClient();

    // Check if parent connection exists
    const { data: connection } = await step.run('get-parent-connection', async () => {
      return supabase
        .from('parent_connections')
        .select('*')
        .eq('student_user_id', userId)
        .single();
    });

    if (!connection?.data) return { skipped: 'no parent connection' };

    // Get student info
    const { data: student } = await step.run('get-student', async () => {
      return supabase.from('users').select('name, subscription_tier').eq('id', userId).single();
    });

    // Get deadline with college
    const { data: deadline } = await step.run('get-deadline', async () => {
      return supabase
        .from('deadlines')
        .select('*, college:colleges(name)')
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

    const studentName = student?.data?.name || 'Your student';
    const collegeName = deadline.data.college?.name || 'College';
    const deadlineType = deadline.data.type;
    const deadlineDate = formatDate(deadline.data.date);
    const parentName = connection.data.parent_name;
    const accessToken = connection.data.access_token;

    // Send parent email
    await step.run('send-parent-email', async () => {
      const dashboardUrl = `https://due.college/parent/${accessToken}`;

      return resend.emails.send({
        from: 'due.college <reminders@due.college>',
        to: connection.data.parent_email,
        subject: `${studentName}'s ${collegeName} ${deadlineType} is in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,system-ui,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:40px 24px">
  <div style="text-align:center;margin-bottom:32px">
    <span style="font-size:20px;font-weight:800;color:#1a1f36;letter-spacing:-0.5px">due.college</span>
  </div>
  <div style="background:#fff;border-radius:24px;padding:32px;border:1px solid #e5e7eb">
    <p style="color:#6b7280;margin:0 0 8px">Hi ${parentName},</p>
    <h1 style="font-size:22px;font-weight:800;color:#1a1f36;margin:0 0 24px">
      ${studentName}'s ${collegeName} ${deadlineType} is in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}
    </h1>
    <div style="background:#fff8f0;border:1px solid #fed7aa;border-radius:16px;padding:20px;margin-bottom:24px">
      <p style="margin:0;font-size:14px;color:#92400e">
        <strong>${collegeName}</strong> — ${deadlineType}<br>
        Due: ${deadlineDate}
      </p>
    </div>
    <p style="color:#6b7280;font-size:14px;margin:0 0 24px">
      Make sure ${studentName} is on track. You can view their full deadline dashboard below.
    </p>
    <a href="${dashboardUrl}" style="display:block;text-align:center;background:#1a1f36;color:#fff;padding:14px 24px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px">
      View ${studentName}'s Deadlines →
    </a>
  </div>
  <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:24px">
    due.college · <a href="https://due.college/unsubscribe" style="color:#9ca3af">Unsubscribe</a>
  </p>
</div>
</body>
</html>`,
      });
    });

    // Send parent SMS if enabled and student is on family plan
    const isFamilyPlan = student?.data?.subscription_tier === 'family';
    if (connection.data.sms_enabled && connection.data.parent_phone && isFamilyPlan) {
      await step.run('send-parent-sms', async () => {
        const msg = `📚 ${studentName}'s ${collegeName} ${deadlineType} is due in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. due.college/parent/${accessToken}`;
        return twilioClient.messages.create({
          body: msg.slice(0, 160),
          from: process.env.TWILIO_PHONE_NUMBER!,
          to: connection.data.parent_phone!,
        });
      });
    }

    return { sent: true };
  }
);
