import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const supabase = createServerSupabaseClient();

  // Find parent connection by token
  const { data: connection, error } = await supabase
    .from('parent_connections')
    .select('*')
    .eq('access_token', params.token)
    .single();

  if (error || !connection) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
  }

  // Get student info
  const { data: student } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', connection.student_user_id)
    .single();

  // Get student's colleges
  const { data: userColleges } = await supabase
    .from('user_colleges')
    .select('college_id')
    .eq('user_id', connection.student_user_id);

  if (!userColleges || userColleges.length === 0) {
    return NextResponse.json({
      studentName: student?.name || 'Your student',
      deadlines: [],
    });
  }

  const collegeIds = userColleges.map((uc) => uc.college_id);

  // Get deadlines
  const { data: deadlines } = await supabase
    .from('deadlines')
    .select('*, college:colleges(id, name, state, city, website, common_app)')
    .in('college_id', collegeIds)
    .order('date', { ascending: true });

  return NextResponse.json({
    studentName: student?.name || 'Your student',
    deadlines: deadlines || [],
  });
}
