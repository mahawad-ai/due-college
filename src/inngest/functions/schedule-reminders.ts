import { inngest } from '../client';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { addDays, subDays, parseISO, isFuture } from 'date-fns';

export const scheduleReminders = inngest.createFunction(
  { id: 'schedule-reminders', name: 'Schedule Deadline Reminders' },
  { event: 'app/college.added' },
  async ({ event, step }) => {
    const { userId, collegeId } = event.data;
    const supabase = createServerSupabaseClient();

    // Get user's notification preferences
    const { data: prefs } = await step.run('get-prefs', async () => {
      return supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
    });

    const reminderDays = [
      { days: 30, enabled: prefs?.data?.remind_30_days ?? true },
      { days: 14, enabled: prefs?.data?.remind_14_days ?? true },
      { days: 7, enabled: prefs?.data?.remind_7_days ?? true },
      { days: 3, enabled: prefs?.data?.remind_3_days ?? true },
      { days: 1, enabled: prefs?.data?.remind_1_day ?? true },
    ].filter((r) => r.enabled);

    // Get all deadlines for this college
    const { data: deadlines } = await step.run('get-deadlines', async () => {
      return supabase
        .from('deadlines')
        .select('*')
        .eq('college_id', collegeId);
    });

    if (!deadlines?.data) return { scheduled: 0 };

    let scheduled = 0;

    for (const deadline of deadlines.data) {
      const deadlineDate = parseISO(deadline.date);

      for (const { days } of reminderDays) {
        const reminderDate = subDays(deadlineDate, days);

        // Only schedule future reminders
        if (!isFuture(reminderDate)) continue;

        await step.sendEvent(`schedule-email-${deadline.id}-${days}d`, {
          name: 'app/reminder.email',
          data: { userId, deadlineId: deadline.id, daysRemaining: days },
          ts: reminderDate.getTime(),
        });

        await step.sendEvent(`schedule-sms-${deadline.id}-${days}d`, {
          name: 'app/reminder.sms',
          data: { userId, deadlineId: deadline.id, daysRemaining: days },
          ts: reminderDate.getTime(),
        });

        await step.sendEvent(`schedule-parent-${deadline.id}-${days}d`, {
          name: 'app/reminder.parent',
          data: { userId, deadlineId: deadline.id, daysRemaining: days },
          ts: reminderDate.getTime(),
        });

        scheduled++;
      }
    }

    // Also run conflict detection
    await step.sendEvent('trigger-conflict-check', {
      name: 'app/conflict.check',
      data: { userId },
    });

    return { scheduled };
  }
);
