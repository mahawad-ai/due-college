import { NextRequest, NextResponse } from 'next/server';

function ruleBasedFeedback(essays: string[], activities: string[], sat_score: number, gpa: number, target_college: string) {
  let overall_score = 50;

  if (gpa >= 3.9) overall_score += 20;
  else if (gpa >= 3.7) overall_score += 15;
  else if (gpa >= 3.5) overall_score += 8;

  if (sat_score >= 1500) overall_score += 20;
  else if (sat_score >= 1400) overall_score += 12;
  else if (sat_score >= 1300) overall_score += 6;

  if (activities.length >= 8) overall_score += 10;
  else if (activities.length >= 5) overall_score += 6;

  const essayLength = essays.reduce((sum, e) => sum + e.length, 0);
  if (essayLength > 2000) overall_score += 5;

  overall_score = Math.min(100, overall_score);

  return {
    overall_score,
    essay_feedback:
      essayLength < 500
        ? 'Your essays are quite short. Aim for more detail and personal narrative to stand out.'
        : essayLength < 1500
        ? 'Your essays have a decent length. Focus on specificity and showing your unique perspective.'
        : 'Your essays show good depth. Ensure each one has a clear narrative arc and authentic voice.',
    activity_feedback:
      activities.length < 4
        ? 'Consider adding more extracurricular activities. Colleges like to see diverse engagement.'
        : activities.length < 7
        ? 'Good range of activities. Try to highlight leadership roles or notable achievements.'
        : 'Excellent activity list. Make sure your most impactful roles are described with specific impact.',
    strengths: [
      ...(gpa >= 3.7 ? ['Strong academic record'] : []),
      ...(sat_score >= 1400 ? ['Competitive test scores'] : []),
      ...(activities.length >= 6 ? ['Well-rounded extracurricular profile'] : []),
      ...(essayLength > 1500 ? ['Detailed essay responses'] : []),
    ],
    improvements: [
      ...(gpa < 3.7 ? ['Focus on improving GPA in remaining semesters'] : []),
      ...(sat_score < 1400 ? ['Consider retaking SAT/ACT for a higher score'] : []),
      ...(activities.length < 5 ? ['Add more extracurricular activities or leadership roles'] : []),
      ...(essayLength < 1000 ? ['Expand your essays with more specific personal stories'] : []),
    ],
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { essays, activities, sat_score, gpa, target_college } = body as {
    essays: string[];
    activities: string[];
    sat_score: number;
    gpa: number;
    target_college: string;
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(ruleBasedFeedback(essays, activities, sat_score, gpa, target_college));
  }

  try {
    const { Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });

    const prompt = `You are an expert college admissions counselor. Analyze this student's application for ${target_college}.

Student Profile:
- SAT Score: ${sat_score}
- GPA: ${gpa}
- Activities: ${activities.join('; ')}
- Essays (${essays.length} total): ${essays.map((e, i) => `Essay ${i + 1}: ${e.substring(0, 500)}`).join('\n')}

Provide honest, actionable feedback. Return JSON only:
{
  "overall_score": <0-100>,
  "essay_feedback": "<2-3 sentences>",
  "activity_feedback": "<2-3 sentences>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "improvements": ["<improvement1>", "<improvement2>", "<improvement3>"]
}`;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return NextResponse.json(JSON.parse(jsonMatch[0]));
      }
    }
  } catch (err) {
    console.error('Claude API error:', err);
  }

  return NextResponse.json(ruleBasedFeedback(essays, activities, sat_score, gpa, target_college));
}
