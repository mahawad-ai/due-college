import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

function calculateChancing(profile: any, college: any): number {
  let score = 50;
  if (profile.sat_score) {
    if (profile.sat_score >= college.sat_75th) score += 30;
    else if (profile.sat_score >= college.sat_25th) score += 15;
    else if (profile.sat_score >= college.sat_25th - 100) score += 5;
    else score -= 15;
  }
  if (profile.gpa_unweighted) {
    if (profile.gpa_unweighted >= 3.9) score += 20;
    else if (profile.gpa_unweighted >= 3.7) score += 10;
    else if (profile.gpa_unweighted >= 3.5) score += 5;
    else score -= 10;
  }
  const acceptanceAdj = Math.max(-20, (college.acceptance_rate - 0.5) * 40);
  score += acceptanceAdj;
  return Math.max(5, Math.min(95, Math.round(score)));
}

function getMatchType(chancing: number): string {
  if (chancing >= 70) return 'likely';
  if (chancing >= 40) return 'target';
  return 'reach';
}

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const collegeId = searchParams.get('id');
  if (!collegeId) return NextResponse.json({ error: 'college id required' }, { status: 400 });

  const supabase = createServerSupabaseClient();

  const { data: college } = await supabase.from('colleges').select('*').eq('id', collegeId).single();
  if (!college) return NextResponse.json({ error: 'College not found' }, { status: 404 });

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({
      chancing_percentage: null,
      overall_fit_score: null,
      match_type: null,
      message: 'Complete your profile for personalized results',
    });
  }

  const chancing = calculateChancing(profile, college);
  const matchType = getMatchType(chancing);

  return NextResponse.json({
    chancing_percentage: chancing,
    overall_fit_score: chancing,
    match_type: matchType,
  });
}
