import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET /api/custom-deadlines — list user's custom deadlines
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('custom_deadlines')
    .select('*')
    .eq('user_id', user.id)
    .order('due_date', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deadlines: data });
}

// POST /api/custom-deadlines — create a new custom deadline
export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { college_name, college_id, type, due_date, notes } = body;

  if (!college_name || !type || !due_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('custom_deadlines')
    .insert({
      user_id: user.id,
      college_name,
      college_id: college_id || null,
      type,
      due_date,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deadline: data });
}

// PATCH /api/custom-deadlines — update a custom deadline
export async function PATCH(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, college_name, type, due_date, notes, is_submitted } = body;

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = createServerSupabaseClient();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (college_name !== undefined) updates.college_name = college_name;
  if (type !== undefined) updates.type = type;
  if (due_date !== undefined) updates.due_date = due_date;
  if (notes !== undefined) updates.notes = notes;
  if (is_submitted !== undefined) {
    updates.is_submitted = is_submitted;
    updates.submitted_at = is_submitted ? new Date().toISOString() : null;
  }

  const { data, error } = await supabase
    .from('custom_deadlines')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deadline: data });
}

// DELETE /api/custom-deadlines?id=xxx
export async function DELETE(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from('custom_deadlines')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
