import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const collegeId = req.nextUrl.searchParams.get('collegeId');
  const supabase = createServerSupabaseClient();

  let query = supabase
    .from('deadlines')
    .select('*')
    .order('date', { ascending: true });

  if (collegeId) {
    query = query.eq('college_id', collegeId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ deadlines: data });
}
