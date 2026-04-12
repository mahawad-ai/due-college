import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 });

  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from('parent_connections')
    .update({ parent_phone: phone, sms_enabled: true })
    .eq('access_token', params.token);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
