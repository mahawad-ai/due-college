import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const collegeId = searchParams.get('college_id');
  if (!collegeId) return NextResponse.json({ error: 'college_id required' }, { status: 400 });

  const supabase = createServerSupabaseClient();

  const { data: college } = await supabase.from('colleges').select('*').eq('id', collegeId).single();
  if (!college) return NextResponse.json({ error: 'College not found' }, { status: 404 });

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const stickerPrice = college.tuition_out_of_state || college.tuition || 50000;

  let estimatedMeritAid = 0;
  let estimatedNeedAid = 0;

  if (profile) {
    const gpa = profile.gpa_unweighted || 0;
    if (gpa >= 3.7) {
      const avgMerit = college.avg_merit_aid || 8000;
      estimatedMeritAid = Math.round(avgMerit * (gpa >= 3.9 ? 1.3 : gpa >= 3.8 ? 1.15 : 1));
    }
    if (profile.budget_constraint && stickerPrice > profile.budget_constraint) {
      const avgNeed = college.avg_need_based_aid || 12000;
      const gap = stickerPrice - profile.budget_constraint;
      estimatedNeedAid = Math.min(avgNeed, Math.round(gap * 0.6));
    }
  }

  const estimatedNetCost = Math.max(0, stickerPrice - estimatedMeritAid - estimatedNeedAid);

  let affordabilityScore = 100;
  if (profile?.budget_constraint) {
    const ratio = estimatedNetCost / profile.budget_constraint;
    if (ratio <= 1) affordabilityScore = Math.round((1 - ratio * 0.5) * 100);
    else affordabilityScore = Math.max(0, Math.round((2 - ratio) * 50));
  }

  return NextResponse.json({
    sticker_price: stickerPrice,
    estimated_merit_aid: estimatedMeritAid,
    estimated_need_aid: estimatedNeedAid,
    estimated_net_cost: estimatedNetCost,
    affordability_score: affordabilityScore,
  });
}
