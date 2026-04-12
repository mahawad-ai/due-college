import { inngest } from '../client';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export const sendSMSReminder = inngest.createFunction(
  { id: 'send-sms-reminder', name: 'Send SMS Deadline Reminder' },
  { event: 'app/reminder.sms' },
  async ({ event, step }) => {
    const { userId, deadlineId, daysRemaining } = event.data;
    const supabase = createServerSupabaseClient();

    // Get user info
    const { data: user } = await step.run('get-user', async () => {
      return supabase
        .from('users')
        .select('phone, subscription_tier')
        .eq('id', userId)
        .single();
    });

    // SMS only for plus/family subscribers
    if (!user?.data?.phone) return { skipped: 'no phone' };
    if (!['plus', 'family'].includes(user.data.subscription_tier)) {
      return { skipped: 'not a paid subscriber' };
    }

    // Check notification preferences
    const { data: prefs } = await step.run('get-prefs', async () => {
      return supabase
        .from('notification_preferences')
        .select('sms_enabled')
        .eq('user_id', userId)
        .single();
    });

    if (!prefs?.data?.sms_enabled) return { skipped: 'sms disabled' };

    // Get deadline with college
    const { data: deadline } = await step.run('get-deadline', async () => {
      return supabase
        .from('deadlines')
        .select('type, college:colleges(name)')
        .eq('id', deadlineId)
        .single();
    });

    if (!deadline?.data) return { skipped: 'deadline not found' };

    // Check if submitted
    const { data: status } = await step.run('check-status', async () => {
      return supabase
        .from('user_deadline_status')
        .select('submitted')
        .eq('user_id', userId)
        .eq('deadline_id', deadlineId)
        .single();
    });

    if (status?.data?.submitted) return { skipped: 'already submitted' };

    const collegeName = deadline.data.college?.name || 'College';
    const deadlineType = deadline.data.type;

    // Max 160 chars
    const message = `⏰ ${collegeName} ${deadlineType} due in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Check your list: due.college/dashboard`;

    await step.run('send-sms', async () => {
      return twilioClient.messages.create({
        body: message.slice(0, 160),
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: user.data!.phone!,
      });
    });

    return { sent: true };
  }
);
