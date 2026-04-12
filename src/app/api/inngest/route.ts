import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { scheduleReminders } from '@/inngest/functions/schedule-reminders';
import { sendEmailReminder } from '@/inngest/functions/send-email-reminder';
import { sendSMSReminder } from '@/inngest/functions/send-sms-reminder';
import { sendParentReminder } from '@/inngest/functions/send-parent-reminder';
import { weeklyFamilySummary } from '@/inngest/functions/weekly-family-summary';
import { conflictDetection } from '@/inngest/functions/conflict-detection';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    scheduleReminders,
    sendEmailReminder,
    sendSMSReminder,
    sendParentReminder,
    weeklyFamilySummary,
    conflictDetection,
  ],
});
