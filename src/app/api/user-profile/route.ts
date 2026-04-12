import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Auto-create profile if missing
  if (!data) {
    const user = await currentUser();
    const newProfile = {
      id: userId,
      email: user?.primaryEmailAddress?.emailAddress || '',
      name: user?.fullName || '',
      subscription_tier: 'free',
    };
    const { data: created } = await supabase
      .from('users')
      .upsert(newProfile, { onConflict: 'id' })
      .select()
      .single();

    // Also create default notification preferences
    await supabase.from('notification_preferences').upsert(
      { user_id: userId },
      { onConflict: 'user_id', ignoreDuplicates: true }
    );

    return NextResponse.json(created || newProfile);
  }

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const updates = await req.json();
  // Only allow safe fields
  const allowed = ['name', 'phone'];
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  );

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .update(filtered)
    .eq('id', userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
