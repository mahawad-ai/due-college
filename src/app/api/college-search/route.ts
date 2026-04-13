import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Single college fetch by id
  const id = searchParams.get('id');
  if (id) {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.from('colleges').select('*').eq('id', id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json({ college: data });
  }

  const satMin = searchParams.get('sat_min') ? parseInt(searchParams.get('sat_min')!) : null;
  const satMax = searchParams.get('sat_max') ? parseInt(searchParams.get('sat_max')!) : null;
  const acceptanceRateMax = searchParams.get('acceptance_rate_max')
    ? parseInt(searchParams.get('acceptance_rate_max')!) / 100
    : null;
  const size = searchParams.get('size');
  const location = searchParams.get('location');
  const major = searchParams.get('major');

  const supabase = createServerSupabaseClient();

  let query = supabase
    .from('colleges')
    .select('*')
    .order('acceptance_rate', { ascending: true });

  if (satMin) {
    query = query.gte('sat_75th', satMin);
  }
  if (satMax) {
    query = query.lte('sat_25th', satMax);
  }
  if (acceptanceRateMax) {
    query = query.lte('acceptance_rate', acceptanceRateMax);
  }
  if (size) {
    query = query.eq('size', size);
  }
  if (location) {
    query = query.ilike('location', `%${location}%`);
  }
  if (major) {
    query = query.contains('majors_offered', [major]);
  }

  const { data, error } = await query;

  if (error) {
    console.error('College search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ colleges: data || [] });
}
