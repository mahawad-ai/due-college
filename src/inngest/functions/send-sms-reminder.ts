// @ts-nocheck
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
    const user = await step.run('get-user', async () => {
      const { data } = await supabase
        .from('users')
        .select('phone, subscription_tier')
        .eq('id', userId)
        .single();
      return data;
    });

    // SMS only for plus/family subscribers with a phone number
    if (!user?.phone) return { skipped: 'no phone' };
    if (!['plus', 'family'].includes(user.subscription_tier)) {
      return { skipped: 'not a paid subscriber' };
    }

    // Check notification preferences
    const prefs = await step.run('get-prefs', async () => {
      const { data } = await supabase
        .from('notification_preferences')
        .select('sms_enabled')
        .eq('user_id', userId)
        .single();
      return data;
    });

    if (!prefs?.sms_enabled) return { skipped: 'sms disabled' };

    // Get deadline with college
    const deadline = await step.run('get-deadline', async () => {
      const { data } = await supabase
        .from('deadlines')
        .select('type, college:colleges(name)')
        .eq('id', deadlineId)
        .single();
      return data;
    });

    if (!deadline) return { skipped: 'deadline not found' };

    // Check if submitted
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

    const collegeName = deadline.college?.name || 'College';
    const deadlineType = deadline.type;

    // Max 160 chars
    const message = `⏰ ${collegeName} ${deadlineType} due in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Check your list: due.college/dashboard`;

    await step.run('send-sms', async () => {
      return twilioClient.messages.create({
        body: message.slice(0, 160),
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: user.phone!,
      });
    });

    return { sent: true };
  }
);
