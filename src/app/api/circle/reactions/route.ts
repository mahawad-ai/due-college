import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// POST /api/circle/reactions — toggle a reaction
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { activity_id, reaction } = await req.json();
  if (!activity_id || !reaction) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const supabase = createServerSupabaseClient();

  // Check if reaction exists
  const { data: existing } = await supabase
    .from('circle_reactions')
    .select('id')
    .eq('activity_id', activity_id)
    .eq('user_id', user.id)
    .eq('reaction', reaction)
    .single();

  if (existing) {
    await supabase.from('circle_reactions').delete().eq('id', existing.id);
    return NextResponse.json({ toggled: 'removed' });
  } else {
    await supabase.from('circle_reactions').insert({ activity_id, user_id: user.id, reaction });
    return NextResponse.json({ toggled: 'added' });
  }
}
