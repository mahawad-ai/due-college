import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { validateHandle, handleErrorMessage } from '@/lib/usernames';

/**
 * POST /api/username/claim
 * Body: { handle: string }
 * Claims the handle for the currently-signed-in user.
 * If the user already has a handle, moves the old one to the grace pool and sets the new one.
 */
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { handle } = await req.json();
  const h = String(handle || '').trim().toLowerCase();

  const err = validateHandle(h);
  if (err !== 'ok') {
    return NextResponse.json({ error: handleErrorMessage(err) }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  // Is it already taken by someone else?
  const { data: taken } = await supabase
    .from('user_handles')
    .select('user_id')
    .eq('handle', h)
    .maybeSingle();

  if (taken && taken.user_id !== user.id) {
    return NextResponse.json({ error: 'That handle is already taken.' }, { status: 409 });
  }

  // Is it cooling in the grace pool (claimed by someone else previously)?
  const { data: grace } = await supabase
    .from('handle_grace_pool')
    .select('previous_user_id, reclaim_at')
    .eq('handle', h)
    .maybeSingle();

  if (grace && grace.previous_user_id !== user.id) {
    return NextResponse.json(
      { error: 'That handle was recently released and is temporarily reserved.' },
      { status: 409 }
    );
  }

  // Does this user already have a handle? If so, release the old one to the grace pool.
  const { data: existingForUser } = await supabase
    .from('user_handles')
    .select('handle')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingForUser && existingForUser.handle !== h) {
    await supabase
      .from('handle_grace_pool')
      .upsert({ handle: existingForUser.handle, previous_user_id: user.id });
  }

  // Upsert the new claim
  const { error: upsertErr } = await supabase
    .from('user_handles')
    .upsert(
      { user_id: user.id, handle: h, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );

  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  // If we just re-claimed a handle that was in our own grace pool, clear it.
  await supabase.from('handle_grace_pool').delete().eq('handle', h).eq('previous_user_id', user.id);

  return NextResponse.json({ ok: true, handle: h });
}

/**
 * GET /api/username/claim
 * Returns the current user's handle (or null).
 */
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('user_handles')
    .select('handle')
    .eq('user_id', user.id)
    .maybeSingle();

  return NextResponse.json({ handle: data?.handle ?? null });
}
