import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type');
  const region = searchParams.get('region');
  const setting = searchParams.get('setting');
  const maxAcceptance = searchParams.get('maxAcceptance');
  const minSAT = searchParams.get('minSAT');
  const maxTuition = searchParams.get('maxTuition');
  const limit = parseInt(searchParams.get('limit') || '20');

  const supabase = createServerSupabaseClient();
  let query = supabase
    .from('colleges')
    .select('id,name,city,state,type,region,setting,acceptance_rate,avg_gpa,sat_25,sat_75,act_25,act_75,tuition_in_state,tuition_out_state,enrollment,common_app,website')
    .order('acceptance_rate', { ascending: true, nullsFirst: false })
    .limit(limit);

  if (q) query = query.ilike('name', `%${q}%`);
  if (type) query = query.eq('type', type);
  if (region) query = query.eq('region', region);
  if (setting) query = query.eq('setting', setting);
  if (maxAcceptance) query = query.lte('acceptance_rate', parseFloat(maxAcceptance));
  if (minSAT) query = query.gte('sat_25', parseInt(minSAT));
  if (maxTuition) query = query.lte('tuition_out_state', parseInt(maxTuition));

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ colleges: data || [] });
}
