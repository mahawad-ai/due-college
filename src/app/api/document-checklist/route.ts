import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const DEFAULT_ITEMS = [
  'Common App essay',
  'Supplemental essay(s)',
  'Official transcript',
  'SAT / ACT scores',
  'Recommendation letter #1',
  'Recommendation letter #2',
  'Counselor recommendation',
  'Financial aid / FAFSA',
  'Application fee / waiver',
];

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const collegeId = new URL(req.url).searchParams.get('collegeId');
  if (!collegeId) return NextResponse.json({ error: 'Missing collegeId' }, { status: 400 });
  const supabase = createServerSupabaseClient();

  let { data } = await supabase.from('document_checklist').select('*').eq('user_id', user.id).eq('college_id', collegeId);

  // Auto-seed default items on first visit
  if (!data || data.length === 0) {
    const inserts = DEFAULT_ITEMS.map((item) => ({ user_id: user.id, college_id: collegeId, item, completed: false }));
    const { data: seeded } = await supabase.from('document_checklist').insert(inserts).select();
    data = seeded;
  }

  return NextResponse.json({ items: data || [] });
}

export async function PATCH(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { id, completed } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('document_checklist').update({ completed, completed_at: completed ? new Date().toISOString() : null }).eq('id', id).eq('user_id', user.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { college_id, item } = body;
  if (!college_id || !item) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from('document_checklist').insert({ user_id: user.id, college_id, item, completed: false }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}
