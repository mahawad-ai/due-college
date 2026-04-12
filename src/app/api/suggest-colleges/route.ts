import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export interface SuggestedCollege {
  name: string;
  fit: 'reach' | 'match' | 'safety';
  reason: string;
  acceptance_rate: string;
  known_for: string;
}

const ACT_TO_SAT: Record<number, number> = {
  36: 1590, 35: 1540, 34: 1500, 33: 1460, 32: 1430,
  31: 1400, 30: 1370, 29: 1340, 28: 1310, 27: 1280,
  26: 1240, 25: 1210, 24: 1180, 23: 1140, 22: 1110,
  21: 1080, 20: 1040, 19: 1010, 18: 970, 17: 930,
};

function getRuleBasedSuggestions(profileDesc: string): SuggestedCollege[] {
  const satMatch = profileDesc.match(/SAT[:\s]+(\d{3,4})/i);
  const actMatch = profileDesc.match(/ACT[:\s]+(\d{1,2})/i);

  let sat = satMatch ? parseInt(satMatch[1]) : 0;
  if (!sat && actMatch) {
    const act = parseInt(actMatch[1]);
    sat = ACT_TO_SAT[act] ?? 0;
  }

  if (sat >= 1450) {
    return [
      { name: 'Duke University', fit: 'reach', reason: 'Highly selective — your scores are in range but competition is fierce', acceptance_rate: '6%', known_for: 'Medicine, Law, Business, Basketball' },
      { name: 'Vanderbilt University', fit: 'reach', reason: 'Top-tier research university with strong merit aid', acceptance_rate: '7%', known_for: 'Education, Medicine, Engineering' },
      { name: 'Carnegie Mellon University', fit: 'match', reason: 'Your scores align with CMU\'s middle 50%', acceptance_rate: '15%', known_for: 'Computer Science, Engineering, Drama' },
      { name: 'University of Michigan', fit: 'match', reason: 'Strong public university with excellent outcomes', acceptance_rate: '18%', known_for: 'Engineering, Business, Medicine' },
      { name: 'University of Virginia', fit: 'safety', reason: 'Your credentials are above UVA\'s typical admitted student', acceptance_rate: '21%', known_for: 'Law, Business, Public Policy' },
    ];
  }
  if (sat >= 1300) {
    return [
      { name: 'University of Virginia', fit: 'reach', reason: 'Competitive public flagship — your scores are in range', acceptance_rate: '21%', known_for: 'Law, Business, Public Policy' },
      { name: 'University of Michigan', fit: 'reach', reason: 'Strong public university with holistic admissions', acceptance_rate: '18%', known_for: 'Engineering, Business, Medicine' },
      { name: 'Penn State University', fit: 'match', reason: 'Solid match with your academic profile', acceptance_rate: '54%', known_for: 'Business, Engineering, Communications' },
      { name: 'University of Florida', fit: 'match', reason: 'Top public university with strong programs', acceptance_rate: '31%', known_for: 'Business, Engineering, Education' },
      { name: 'Ohio State University', fit: 'safety', reason: 'Well-ranked flagship where you\'d be a competitive applicant', acceptance_rate: '54%', known_for: 'Engineering, Business, Medicine' },
    ];
  }
  if (sat >= 1100) {
    return [
      { name: 'Penn State University', fit: 'reach', reason: 'Selective flagship within your score range', acceptance_rate: '54%', known_for: 'Business, Engineering, Communications' },
      { name: 'Ohio State University', fit: 'match', reason: 'Strong public university that fits your academic profile', acceptance_rate: '54%', known_for: 'Engineering, Business, Medicine' },
      { name: 'University of Cincinnati', fit: 'match', reason: 'Excellent co-op programs and strong outcomes', acceptance_rate: '79%', known_for: 'Engineering, Design, Business' },
      { name: 'University of Tennessee', fit: 'safety', reason: 'Merit scholarships available for your score range', acceptance_rate: '68%', known_for: 'Business, Engineering, Agriculture' },
      { name: 'University of Alabama', fit: 'safety', reason: 'Generous merit aid — you\'d likely qualify for significant scholarships', acceptance_rate: '82%', known_for: 'Business, Engineering, Nursing' },
    ];
  }
  return [
    { name: 'Ohio State University', fit: 'reach', reason: 'Public flagship worth applying to — strong outcomes', acceptance_rate: '54%', known_for: 'Engineering, Business, Medicine' },
    { name: 'University of Alabama', fit: 'match', reason: 'Strong merit aid school with many programs', acceptance_rate: '82%', known_for: 'Business, Engineering, Nursing' },
    { name: 'University of Tennessee', fit: 'match', reason: 'Good programs and merit scholarships available', acceptance_rate: '68%', known_for: 'Business, Engineering, Agriculture' },
    { name: 'Western Kentucky University', fit: 'safety', reason: 'Solid regional university with generous merit awards', acceptance_rate: '97%', known_for: 'Business, Education, Nursing' },
    { name: 'University of Cincinnati', fit: 'safety', reason: 'Strong co-op programs and career outcomes', acceptance_rate: '79%', known_for: 'Engineering, Design, Business' },
  ];
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { profileDesc } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      // Dynamic import so build doesn't fail if SDK not installed
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const client = new Anthropic({ apiKey });

      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are a college admissions counselor. Based on this student profile, suggest 5-7 colleges with a balanced Reach/Match/Safety list.

Student Profile:
${profileDesc}

Respond ONLY with a JSON array. No explanation, no markdown, no code fences — just the raw JSON array.
Each object must have exactly these fields:
- name: college name (string)
- fit: "reach", "match", or "safety" (string)
- reason: 1 sentence explaining why this fit level (string)
- acceptance_rate: percentage as string like "15%" (string)
- known_for: 2-4 things the college is known for, comma separated (string)

Include 2-3 reaches, 2-3 matches, 1-2 safeties.`,
          },
        ],
      });

      const text = message.content[0].type === 'text' ? message.content[0].text : '';
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const suggestions: SuggestedCollege[] = JSON.parse(cleaned);
      return NextResponse.json({ suggestions, source: 'ai' });
    } catch {
      // Fall through to rule-based
    }
  }

  const suggestions = getRuleBasedSuggestions(profileDesc ?? '');
  return NextResponse.json({ suggestions, source: 'rules' });
}
