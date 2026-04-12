import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET /api/activities — list user's activities
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ activities: data });
}

// POST /api/activities — create a new activity
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { type, title, organization, role, start_date, end_date, is_ongoing, hours_per_week, description } = body;

  if (!type || !title || !organization || !start_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('activities')
    .insert({
      user_id: user.id,
      type,
      title,
      organization,
      role: role || null,
      start_date,
      end_date: is_ongoing ? null : (end_date || null),
      is_ongoing: is_ongoing || false,
      hours_per_week: hours_per_week || null,
      description: description || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ activity: data });
}

// PATCH /api/activities — update an activity
export async function PATCH(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, type, title, organization, role, start_date, end_date, is_ongoing, hours_per_week, description } = body;

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = createServerSupabaseClient();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (type !== undefined) updates.type = type;
  if (title !== undefined) updates.title = title;
  if (organization !== undefined) updates.organization = organization;
  if (role !== undefined) updates.role = role;
  if (start_date !== undefined) updates.start_date = start_date;
  if (is_ongoing !== undefined) {
    updates.is_ongoing = is_ongoing;
    updates.end_date = is_ongoing ? null : (end_date || null);
  } else if (end_date !== undefined) {
    updates.end_date = end_date;
  }
  if (hours_per_week !== undefined) updates.hours_per_week = hours_per_week;
  if (description !== undefined) updates.description = description;

  const { data, error } = await supabase
    .from('activities')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ activity: data });
}

// DELETE /api/activities?id=xxx
export async function DELETE(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
