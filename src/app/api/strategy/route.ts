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
  if (college.acceptance_rate != null) {
    if (college.acceptance_rate < 5) score -= 20;
    else if (college.acceptance_rate < 10) score -= 12;
    else if (college.acceptance_rate < 20) score -= 5;
    else if (college.acceptance_rate > 50) score += 10;
  }
  return Math.max(4, Math.min(93, Math.round(score)));
}

// Best-effort JSON repair: fix unescaped quotes inside string values
function repairJson(text: string): string {
  // Replace smart/curly quotes with straight quotes
  let out = text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"');

  // Walk character by character and escape any bare " that appear inside a string value
  let result = '';
  let inString = false;
  let i = 0;
  while (i < out.length) {
    const ch = out[i];
    if (ch === '\\' && inString) {
      // already-escaped character — keep as-is and skip next char
      result += ch + (out[i + 1] ?? '');
      i += 2;
      continue;
    }
    if (ch === '"') {
      if (!inString) {
        inString = true;
        result += ch;
      } else {
        // Is this a closing quote?  Peek ahead for : , } ] whitespace
        let j = i + 1;
        while (j < out.length && out[j] === ' ') j++;
        const next = out[j];
        if (next === ':' || next === ',' || next === '}' || next === ']' || j >= out.length) {
          inString = false;
          result += ch;
        } else {
          // Bare quote inside a string — escape it
          result += '\\"';
        }
      }
      i++;
      continue;
    }
    result += ch;
    i++;
  }
  return result;
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { gpa, sat, act, intended_major, income_range, distance_pref, what_matters, home_state } = body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 });
  }

  const supabase = createServerSupabaseClient();

  const { data: allColleges, error: dbError } = await supabase
    .from('colleges')
    .select('id, name, city, state, acceptance_rate, sat_25th, sat_75th, tuition_in_state, tuition_out_of_state, enrollment, type, size, region')
    .limit(300);

  if (dbError) {
    console.error('Colleges query error:', dbError);
    return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 });
  }

  const colleges = allColleges || [];

  const scored = colleges
    .map((c) => ({ ...c, _chance: chanceScore(sat ?? null, gpa ?? null, c) }))
    .sort((a, b) => b._chance - a._chance)
    .slice(0, 50);

  // Build a name → id lookup so the client can add colleges without a search round-trip
  const collegeIdMap: Record<string, string> = {};
  scored.forEach((c) => { collegeIdMap[c.name] = c.id; });

  const collegeContext = scored
    .map((c) => {
      const location = [c.city, c.state].filter(Boolean).join(', ');
      const satRange = c.sat_25th && c.sat_75th ? `SAT ${c.sat_25th}-${c.sat_75th}` : 'test-blind';
      const tuition = c.tuition_out_of_state ? `$${Math.round(c.tuition_out_of_state / 1000)}k` : '';
      const accept = c.acceptance_rate != null ? `${c.acceptance_rate}%` : '';
      return `${c.name}|${location}|${satRange}|${accept}|${tuition}|${c._chance}%`;
    })
    .join('\n');

  const systemPrompt = `You are a college admissions counselor. Respond ONLY with a single valid JSON object. No markdown, no text outside the JSON.

CRITICAL JSON RULES:
- Never use double-quote characters inside string values. Use single quotes or rephrase instead.
- All strings must be properly closed.
- Numbers must not be quoted.

Output this exact shape:
{
  "headline": "one sentence summary of their position",
  "colleges": [
    {"name": "...", "location": "City, ST", "match": "reach|target|likely", "chance": 45, "why": "15 words max"}
  ],
  "ed_pick": {"school": "...", "match": "target", "reasoning": "25 words max why ED here helps"},
  "financial": {
    "summary": "25 words on their aid picture",
    "highlights": ["school known for merit aid", "school 2", "school 3"]
  },
  "essay": {
    "angle": "35 words of advice based on what matters most to them",
    "avoid": "the cliche to skip in 10 words"
  },
  "timeline": [
    {"when": "Now", "action": "specific action"},
    {"when": "May", "action": "specific action"},
    {"when": "June", "action": "specific action"},
    {"when": "August", "action": "specific action"},
    {"when": "November", "action": "specific action"}
  ]
}

colleges array: exactly 10 schools total — 3 reach, 4 target, 3 likely. Reaches first, then targets, then likelies.`;

  const userMessage = `Student: GPA ${gpa ?? 'unknown'}, SAT ${sat ?? 'none'}${act ? `/ACT ${act}` : ''}, major: ${intended_major || 'undecided'}, from ${home_state || 'unknown'}, income: ${income_range || 'unknown'}, distance: ${distance_pref || 'anywhere'}.
What matters most: ${what_matters || 'not provided'}

Colleges (name|location|SAT|accept%|tuition|chance):
${collegeContext}

Pick 10 schools (3 reach, 4 target, 3 likely) from the list above. Return JSON only.`;

  // Pick best available model
  let model = 'claude-haiku-4-5';
  try {
    const modelList = await anthropic.models.list();
    const ids = modelList.data.map((m: any) => m.id);
    const preferred = ['claude-sonnet-4-5', 'claude-haiku-4-5', 'claude-3-7-sonnet-20250219', 'claude-3-5-haiku-20241022'];
    model = preferred.find((m) => ids.includes(m)) ?? ids[0] ?? model;
  } catch { /* use default */ }

  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const raw = message.content[0].type === 'text' ? message.content[0].text : '';

    // Strip markdown fences if present
    const stripped = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    let strategy = null;

    // Attempt 1: direct parse
    try { strategy = JSON.parse(stripped); } catch { /* try repair */ }

    // Attempt 2: repair then parse
    if (!strategy) {
      try { strategy = JSON.parse(repairJson(stripped)); } catch { /* try extraction */ }
    }

    // Attempt 3: extract JSON block then repair
    if (!strategy) {
      const match = stripped.match(/\{[\s\S]*\}/);
      if (match) {
        try { strategy = JSON.parse(repairJson(match[0])); } catch { /* give up */ }
      }
    }

    if (!strategy) {
      console.error('Failed to parse Claude output:', stripped.slice(0, 500));
      return NextResponse.json({ error: 'Strategy generation failed — please try again' }, { status: 500 });
    }

    return NextResponse.json({ strategy, collegeIdMap });
  } catch (err: any) {
    console.error('Strategy API error:', err);
    const msg = err?.message ?? err?.error?.message ?? 'Failed to generate strategy';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
