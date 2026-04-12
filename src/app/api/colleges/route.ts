import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  const exact = req.nextUrl.searchParams.get('exact') === 'true';

  const supabase = createServerSupabaseClient();

  let query = supabase
    .from('colleges')
    .select('id, name, state, city, website, common_app')
    .order('name');

  if (exact) {
    query = query.ilike('name', q);
  } else if (q) {
    query = query.ilike('name', `%${q}%`);
  }

  query = query.limit(10);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ colleges: data });
}
