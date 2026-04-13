import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

async function getClaudeRecommendations(profile: any, colleges: any[]) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const { Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });

    const collegeList = colleges
      .map(
        (c) =>
          `${c.name} (SAT: ${c.sat_25th}-${c.sat_75th}, Acceptance: ${Math.round(c.acceptance_rate * 100)}%, Location: ${c.location})`
      )
      .join('\n');

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Based on this student profile, recommend 10 colleges from the list below and explain why they're a good fit.

Student Profile:
- SAT: ${profile.sat_score || 'Not submitted'}
- ACT: ${profile.act_score || 'Not submitted'}
- GPA: ${profile.gpa_unweighted || 'Unknown'}
- Intended Majors: ${profile.intended_majors?.join(', ') || 'Undecided'}
- Location Preference: ${profile.location_preference || 'Any'}
- Budget: ${profile.budget_constraint ? '$' + profile.budget_constraint + '/year' : 'No limit'}

Available Colleges:
${collegeList}

Format response as JSON with this structure:
{
  "recommendations": [
    {
      "college_name": "College Name",
      "match_type": "reach|target|likely",
      "fit_percentage": 85,
      "reason": "Brief explanation of why this college fits"
    }
  ]
}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const parsed = JSON.parse(content.text);
      return parsed.recommendations;
    }
  } catch (err) {
    console.error('Claude API error:', err);
  }
  return null;
}

function calculateChancing(profile: any, college: any) {
  let score = 50;

  // SAT/GPA scoring
  if (profile.sat_score) {
    if (profile.sat_score >= college.sat_75th) score += 30;
    else if (profile.sat_score >= college.sat_25th) score += 15;
    else if (profile.sat_score >= college.sat_25th - 100) score += 5;
  }

  if (profile.gpa_unweighted) {
    if (profile.gpa_unweighted >= 3.9) score += 20;
    else if (profile.gpa_unweighted >= 3.7) score += 10;
    else if (profile.gpa_unweighted >= 3.5) score += 5;
  }

  // Acceptance rate adjustment
  const acceptanceAdjustment = Math.max(-20, -50 * college.acceptance_rate);
  score += acceptanceAdjustment;

  return Math.max(5, Math.min(95, score));
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();

  // Get student profile
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({
      error: 'No student profile found. Please complete your profile first.',
    }, { status: 400 });
  }

  // Get colleges
  let collegeQuery = supabase.from('colleges').select('*');

  if (profile.sat_score) {
    collegeQuery = collegeQuery
      .gte('sat_75th', Math.max(0, profile.sat_score - 200))
      .lte('sat_25th', profile.sat_score + 200);
  }

  if (profile.budget_constraint) {
    collegeQuery = collegeQuery.lte('tuition_out_of_state', profile.budget_constraint);
  }

  const { data: colleges } = await collegeQuery;

  if (!colleges || colleges.length === 0) {
    return NextResponse.json({
      recommendations: [],
      message: 'No colleges match your filters',
    });
  }

  // Calculate chancing for each college
  const recommendationsData = colleges.map((college) => ({
    ...college,
    chancing_percentage: calculateChancing(profile, college),
    match_type:
      calculateChancing(profile, college) > 70
        ? 'likely'
        : calculateChancing(profile, college) > 40
          ? 'target'
          : 'reach',
    overall_fit_score: Math.round(calculateChancing(profile, college)),
  }));

  // Try to get Claude recommendations
  const claudeRecs = await getClaudeRecommendations(profile, colleges);

  // Save matches to database
  for (const rec of recommendationsData) {
    await supabase.from('college_matches').upsert(
      {
        user_id: user.id,
        college_id: rec.id,
        match_type: rec.match_type,
        overall_fit_score: rec.overall_fit_score,
        chancing_percentage: rec.chancing_percentage,
      },
      { onConflict: 'user_id,college_id' }
    );
  }

  // Sort by fit score
  recommendationsData.sort((a, b) => b.overall_fit_score - a.overall_fit_score);

  return NextResponse.json({
    recommendations: recommendationsData.slice(0, 20),
    total: recommendationsData.length,
    ai_enriched: !!claudeRecs,
  });
}
