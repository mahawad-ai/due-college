import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();

  const { data: existing } = await supabase
    .from('circle_challenge_members')
    .select('challenge_id')
    .eq('challenge_id', params.id)
    .eq('user_id', user.id)
    .single();

  if (existing) {
    await supabase.from('circle_challenge_members')
      .delete().eq('challenge_id', params.id).eq('user_id', user.id);
    return NextResponse.json({ toggled: 'left' });
  } else {
    await supabase.from('circle_challenge_members')
      .insert({ challenge_id: params.id, user_id: user.id });
    return NextResponse.json({ toggled: 'joined' });
  }
}
