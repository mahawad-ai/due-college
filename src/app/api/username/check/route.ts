import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { validateHandle, suggestHandles, handleErrorMessage } from '@/lib/usernames';

/**
 * POST /api/username/check
 * Body: { handle: string }
 * Returns: { available: boolean, reason?: string, suggestions?: string[] }
 */
export async function POST(req: NextRequest) {
  const { handle } = await req.json();
  const h = String(handle || '').trim().toLowerCase();

  const err = validateHandle(h);
  if (err !== 'ok') {
    return NextResponse.json({
      available: false,
      reason: handleErrorMessage(err),
    });
  }

  const supabase = createServerSupabaseClient();

  const { data: existing } = await supabase
    .from('user_handles')
    .select('user_id')
    .eq('handle', h)
    .maybeSingle();

  const { data: grace } = await supabase
    .from('handle_grace_pool')
    .select('handle')
    .eq('handle', h)
    .maybeSingle();

  if (existing || grace) {
    // Gather a handful of taken slugs to seed the suggester
    const { data: nearby } = await supabase
      .from('user_handles')
      .select('handle')
      .ilike('handle', `${h}%`)
      .limit(20);
    const taken = new Set<string>((nearby || []).map((r) => r.handle));
    taken.add(h);
    const suggestions = suggestHandles(h, taken);
    return NextResponse.json({
      available: false,
      reason: 'That handle is already taken.',
      suggestions,
    });
  }

  return NextResponse.json({ available: true });
}
