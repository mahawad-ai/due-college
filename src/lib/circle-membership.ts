import { createServerSupabaseClient } from './supabase-server';

type Supabase = ReturnType<typeof createServerSupabaseClient>;

/**
 * Returns the best circle_id for a user.
 *
 * A user can end up in multiple circles when they visit /circle
 * (auto-creating a solo circle) and then join an invited group circle.
 * In that case we pick the circle with the most members — that's the
 * group they actually want to see.
 *
 * Returns null if the user has no circle memberships.
 */
export async function getBestCircleId(supabase: Supabase, userId: string): Promise<string | null> {
  const { data: memberships } = await supabase
    .from('circle_members')
    .select('circle_id')
    .eq('user_id', userId);

  if (!memberships || memberships.length === 0) return null;
  if (memberships.length === 1) return memberships[0].circle_id;

  // Multiple memberships — pick the one with the most members
  const circleIds = memberships.map((m) => m.circle_id);
  const { data: allMembers } = await supabase
    .from('circle_members')
    .select('circle_id')
    .in('circle_id', circleIds);

  const countMap: Record<string, number> = {};
  (allMembers || []).forEach((r: { circle_id: string }) => {
    countMap[r.circle_id] = (countMap[r.circle_id] || 0) + 1;
  });

  return circleIds.reduce((best, id) =>
    (countMap[id] || 0) > (countMap[best] || 0) ? id : best
  , circleIds[0]);
}
