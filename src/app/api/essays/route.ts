import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { postCircleActivity } from '@/lib/circle-auto-post';

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('essays')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ essays: data });
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { college_id, college_name, type, prompt, word_limit, status, notes } = body;
  if (!type) return NextResponse.json({ error: 'Missing type' }, { status: 400 });
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('essays')
    .insert({
      user_id: user.id,
      college_id: college_id || null,
      college_name: college_name || null,
      type,
      prompt: prompt || null,
      word_limit: word_limit || null,
      status: status || 'not_started',
      notes: notes || null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ essay: data });
}

export async function PATCH(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = createServerSupabaseClient();

  // Fetch current essay to detect status transition
  const { data: existing } = await supabase
    .from('essays')
    .select('status, college_name, type')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  const { data, error } = await supabase
    .from('essays')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Auto-post to Circle when an essay is marked as final (and wasn't already)
  if (fields.status === 'final' && existing?.status !== 'final') {
    const displayName = user.firstName
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : 'Someone';
    const school = existing?.college_name ? ` for ${existing.college_name}` : '';
    const essayType = existing?.type === 'common_app' ? 'Common App essay'
      : existing?.type === 'supplemental' ? 'supplemental essay'
      : existing?.type === 'why_school' ? '"Why This School" essay'
      : 'essay';

    postCircleActivity({
      userId: user.id,
      displayName,
      avatarUrl: user.imageUrl || null,
      activityType: 'essay_done',
      content: `finished their ${essayType}${school} ✍️`,
      metadata: { essayId: id, type: existing?.type, collegeName: existing?.college_name },
    });
  }

  return NextResponse.json({ essay: data });
}

export async function DELETE(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from('essays').delete().eq('id', id).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
