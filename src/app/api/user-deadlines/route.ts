import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

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
  if (!userColleges || userColleges.length === 0) {
    return NextResponse.json({ deadlines: [] });
  }

  const collegeIds = userColleges.map((uc) => uc.college_id);

  // Get all deadlines for those colleges
  const { data: deadlines, error: dError } = await supabase
    .from('deadlines')
    .select('*, college:colleges(id, name, state, city, website, common_app)')
    .in('college_id', collegeIds)
    .order('date', { ascending: true });

  if (dError) return NextResponse.json({ error: dError.message }, { status: 500 });

  // Get submission statuses
  const { data: statuses } = await supabase
    .from('user_deadline_status')
    .select('*')
    .eq('user_id', userId);

  const statusMap = new Map((statuses || []).map((s) => [s.deadline_id, s]));

  const enriched = (deadlines || []).map((d) => ({
    ...d,
    status: statusMap.get(d.id) || null,
  }));

  return NextResponse.json({ deadlines: enriched });
}
