/**
 * circle-auto-post.ts
 * Call postCircleActivity() from any API route to auto-publish
 * an activity to the user's circle feed — silently, never blocking the main response.
 */

import { createServerSupabaseClient } from '@/lib/supabase-server';
import { CircleActivityType } from '@/lib/types';

interface AutoPostArgs {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  activityType: CircleActivityType;
  content: string;
  metadata?: Record<string, unknown>;
}

/**
 * Posts an activity to the user's circle feed.
 * Silently skips (no error thrown) if the user isn't in a circle.
 */
export async function postCircleActivity(args: AutoPostArgs): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();

    // Find circle membership
    const { data: membership } = await supabase
      .from('circle_members')
      .select('circle_id')
      .eq('user_id', args.userId)
      .single();

    if (!membership) return; // Not in a circle — skip silently

    await supabase.from('circle_activities').insert({
      circle_id: membership.circle_id,
      user_id: args.userId,
      display_name: args.displayName,
      avatar_url: args.avatarUrl,
      activity_type: args.activityType,
      content: args.content,
      metadata: args.metadata ?? {},
    });
  } catch {
    // Never crash the calling route — circle posts are best-effort
  }
}
