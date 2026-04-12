import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    // Return defaults
    return NextResponse.json({
      user_id: userId,
      email_enabled: true,
      sms_enabled: false,
      remind_30_days: true,
      remind_14_days: true,
      remind_7_days: true,
      remind_3_days: true,
      remind_1_day: true,
    });
  }

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const updates = await req.json();
  const allowed = ['email_enabled', 'sms_enabled', 'remind_30_days', 'remind_14_days', 'remind_7_days', 'remind_3_days', 'remind_1_day'];
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  );

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({ user_id: userId, ...filtered }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
