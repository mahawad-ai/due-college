import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' });

// Acceptance rate is stored as percentage (3.7 = 3.7%)
function chanceScore(sat: number | null, gpa: number | null, college: any): number {
  let score = 50;
  if (sat && college.sat_25th && college.sat_75th) {
    if (sat >= college.sat_75th) score += 25;
    else if (sat >= college.sat_25th) score += 12;
    else if (sat >= college.sat_25th - 100) score += 3;
    else score -= 18;
  }
  if (gpa) {
    if (gpa >= 3.9) score += 18;
    else if (gpa >= 3.7) score += 10;
    else if (gpa >= 3.5) score += 4;
    else score -= 10;
  }
  // acceptance_rate is a percentage — lower = more selective
  if (college.acceptance_rate != null) {
    if (college.acceptance_rate < 5) score -= 20;
    else if (college.acceptance_rate < 10) score -= 12;
    else if (college.acceptance_rate < 20) score -= 5;
    else if (college.acceptance_rate > 50) score += 10;
  }
  return Math.max(4, Math.min(93, Math.round(score)));
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const {
    gpa,
    sat,
    act,
    intended_major,
    income_range,
    distance_pref,
    what_matters,
    home_state,
  } = body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 });
  }

  const supabase = createServerSupabaseClient();

  // Pull all colleges — simple query, no complex OR filters
  const { data: allColleges, error: dbError } = await supabase
    .from('colleges')
    .select('id, name, city, state, acceptance_rate, sat_25th, sat_75th, tuition_in_state, tuition_out_of_state, enrollment, type, size, region')
    .limit(300);

  if (dbError) {
    console.error('Colleges query error:', dbError);
    return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 });
  }
  const colleges = allColleges || [];

  // Score + sort — give Claude the best 60 candidates so prompt stays lean
  const scored = colleges
    .map((c) => ({ ...c, _chance: chanceScore(sat ?? null, gpa ?? null, c) }))
    .sort((a, b) => b._chance - a._chance)
    .slice(0, 60);

  const collegeContext = scored
    .map((c) => {
      const location = [c.city, c.state].filter(Boolean).join(', ');
      const satRange =
        c.sat_25th && c.sat_75th ? `SAT ${c.sat_25th}–${c.sat_75th}` : 'test-blind';
      const tuition = c.tuition_out_of_state
        ? `$${Math.round(c.tuition_out_of_state / 1000)}k OOS`
        : '';
      const accept = c.acceptance_rate != null ? `${c.acceptance_rate}% accept` : '';
      return `${c.name} | ${location} | ${satRange} | ${accept} | ${tuition} | type:${c.type || ''} | size:${c.size || ''} | chance:${c._chance}%`;
    })
    .join('\n');

  const systemPrompt = `You are an elite college admissions counselor with 20 years of experience. You give honest, specific, data-driven advice — not vague platitudes. You know that students need clarity, not hedging. You speak directly to the student ("you", "your").

Respond ONLY with a valid JSON object — no markdown fences, no explanation outside the JSON. The JSON must match this exact shape:

{
  "colleges": [
    {
      "name": "string",
      "location": "string (city, state)",
      "match": "reach|target|likely",
      "chance": number (0-100, integer),
      "why": "string (max 20 words, specific to this student)"
    }
  ],
  "ed_pick": {
    "school": "string",
    "match": "reach|target|likely",
    "reasoning": "string (max 30 words on why ED here maximizes their chances)"
  },
  "financial": {
    "summary": "string (max 30 words on their aid landscape)",
    "highlights": ["string", "string", "string"]
  },
  "essay": {
    "angle": "string (max 40 words of specific essay advice based on what matters most to them)",
    "avoid": "string (max 15 words — the cliché to avoid)"
  },
  "timeline": [
    { "when": "string", "action": "string" }
  ],
  "headline": "string (one punchy sentence summarizing their position, e.g. 'Strong target at Michigan, real shot at Vanderbilt ED')"
}

Rules:
- colleges array: exactly 12 schools (3 reach, 5 target, 4 likely)
- Sort colleges: reaches first, then targets, then likelies
- Be honest about chances — don't inflate them to be nice
- For test-blind schools (UC system, etc.), set chance based on GPA and acceptance rate only
- timeline: exactly 5 items spanning now through application deadlines
- financial highlights: name specific schools known for merit aid at the student's stats
- Use only schools from the provided college list`;

  const userMessage = `Build a complete college strategy for this student:

STUDENT PROFILE:
- GPA (unweighted): ${gpa ?? 'not provided'}
- SAT: ${sat ?? 'not provided'}${act ? ` | ACT: ${act}` : ''}
- Intended major: ${intended_major || 'Undecided'}
- Home state: ${home_state || 'not provided'}
- Family income: ${income_range || 'not provided'}
- Distance preference: ${distance_pref || 'anywhere'}
- What matters most to them: "${what_matters || 'not provided'}"

AVAILABLE COLLEGES (name | location | SAT range | acceptance rate | tuition OOS | type | size | estimated chance for this student):
${collegeContext}

Select exactly 12 schools: 3 reaches, 5 targets, 4 likelies. Choose the ED pick from the target/reach group where ED gives the most strategic advantage. Keep all text fields concise — follow the word limits in the schema exactly.`;

  // Pick the best available model on this account
  let model = 'claude-haiku-4-5';
  try {
    const modelList = await anthropic.models.list();
    const ids = modelList.data.map((m: any) => m.id);
    const preferred = [
      'claude-sonnet-4-5',
      'claude-haiku-4-5',
      'claude-3-7-sonnet-20250219',
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
    ];
    model = preferred.find((m) => ids.includes(m)) ?? ids[0] ?? model;
  } catch {
    // fall through to default
  }

  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    let strategy;
    try {
      strategy = JSON.parse(cleaned);
    } catch {
      // If Claude wrapped it anyway, try to extract the JSON
      const match = cleaned.match(/\{[\s\S]*\}/);
      strategy = match ? JSON.parse(match[0]) : null;
    }

    if (!strategy) {
      return NextResponse.json({ error: 'Strategy generation failed — please retry' }, { status: 500 });
    }

    return NextResponse.json({ strategy });
  } catch (err: any) {
    console.error('Strategy API error:', err);
    const msg = err?.message ?? err?.error?.message ?? 'Failed to generate strategy';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
