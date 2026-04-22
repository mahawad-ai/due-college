// @ts-nocheck
import { inngest } from '../client';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { subDays, parseISO, isFuture } from 'date-fns';

export const scheduleReminders = inngest.createFunction(
  { id: 'schedule-reminders', name: 'Schedule Deadline Reminders' },
  { event: 'app/college.added' },
  async ({ event, step }) => {
    const { userId, collegeId } = event.data;
    const supabase = createServerSupabaseClient();

    // Get user's notification preferences
    const prefs = await step.run('get-prefs', async () => {
      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      return data;
    });

    const reminderDays = [
      { days: 30, enabled: prefs?.remind_30_days ?? true },
      { days: 14, enabled: prefs?.remind_14_days ?? true },
      { days: 7, enabled: prefs?.remind_7_days ?? true },
      { days: 3, enabled: prefs?.remind_3_days ?? true },
      { days: 1, enabled: prefs?.remind_1_day ?? true },
    ].filter((r) => r.enabled);

    // Get all deadlines for this college
    const deadlines = await step.run('get-deadlines', async () => {
      const { data } = await supabase
        .from('deadlines')
        .select('*')
        .eq('college_id', collegeId);
      return data;
    });

    if (!deadlines) return { scheduled: 0 };

    let scheduled = 0;

    for (const deadline of deadlines) {
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
