import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getDaysRemaining, getUrgency } from '@/lib/utils';
import type { NormalizedDeadline, College } from '@/lib/types';

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();

  // Get user's colleges
  const { data: userColleges, error: ucError } = await supabase
    .from('user_colleges')
    .select('college_id')
    .eq('user_id', userId);

  if (ucError) return NextResponse.json({ error: ucError.message }, { status: 500 });

  const collegeIds = (userColleges || []).map((uc) => uc.college_id);

  // Fetch shared deadlines and custom deadlines in parallel
  const [sharedResult, customResult] = await Promise.all([
    collegeIds.length > 0
      ? supabase
          .from('deadlines')
          .select('*, college:colleges(id, name, state, city, website, common_app)')
          .in('college_id', collegeIds)
          .order('date', { ascending: true })
      : Promise.resolve({ data: [], error: null }),

    supabase
      .from('custom_deadlines')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true }),
  ]);

  if (sharedResult.error) return NextResponse.json({ error: sharedResult.error.message }, { status: 500 });
  if (customResult.error) return NextResponse.json({ error: customResult.error.message }, { status: 500 });

  // Get submission statuses for shared deadlines
  const sharedDeadlines = sharedResult.data || [];
  const { data: statuses } = await supabase
    .from('user_deadline_status')
    .select('*')
    .eq('user_id', userId);

  const statusMap = new Map((statuses || []).map((s) => [s.deadline_id, s]));

  // Normalize shared deadlines
  const normalized: NormalizedDeadline[] = sharedDeadlines.map((d) => {
    const days = getDaysRemaining(d.date);
    const s = statusMap.get(d.id);
    return {
      id: d.id,
      college_id: d.college_id,
      college: d.college as College,
      college_name: (d.college as College)?.name ?? 'Unknown',
      type: d.type,
      date: d.date,
      time: d.time ?? null,
      notes: d.notes ?? null,
      is_custom: false,
      status: s ? { submitted: s.submitted, submitted_at: s.submitted_at } : null,
      daysRemaining: days,
      urgency: getUrgency(days),
    };
  });

  // Normalize custom deadlines
  const customDeadlines = customResult.data || [];
  for (const cd of customDeadlines) {
    const days = getDaysRemaining(cd.due_date);

    // If the custom deadline is linked to one of the user's colleges, fetch that college
    let college: College | null = null;
    if (cd.college_id && collegeIds.includes(cd.college_id)) {
      const { data: col } = await supabase
        .from('colleges')
        .select('id, name, state, city, website, common_app, created_at')
        .eq('id', cd.college_id)
        .single();
      college = col ?? null;
    }

    normalized.push({
      id: cd.id,
      college_id: cd.college_id ?? null,
      college,
      college_name: cd.college_name,
      type: cd.type,
      date: cd.due_date,
      time: null,
      notes: cd.notes ?? null,
      is_custom: true,
      status: { submitted: cd.is_submitted, submitted_at: cd.submitted_at },
      daysRemaining: days,
      urgency: getUrgency(days),
    });
  }

  // Sort everything by date ascending
  normalized.sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ deadlines: normalized });
}
