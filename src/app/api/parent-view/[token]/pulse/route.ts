import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * GET /api/parent-view/[token]/pulse
 * Returns a one-click pulse brief: snapshot of the student's overall progress.
 */
export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const supabase = createServerSupabaseClient();

  // Verify parent connection
  const { data: connection } = await supabase
    .from('parent_connections')
    .select('*')
    .eq('access_token', params.token)
    .single();

  if (!connection) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
  }

  const userId = connection.student_user_id;

  // Get student name
  const { data: student } = await supabase
    .from('users')
    .select('name')
    .eq('id', userId)
    .single();

  // Get all user colleges
  const { data: userColleges } = await supabase
    .from('user_colleges')
    .select('college_id')
    .eq('user_id', userId);

  if (!userColleges || userColleges.length === 0) {
    return NextResponse.json({
      studentName: student?.name || 'Your student',
      totalColleges: 0,
      totalDeadlines: 0,
      submitted: 0,
      upcoming: [],
      overdue: [],
      progressPct: 0,
      statusEmoji: '📭',
      statusText: 'No colleges added yet.',
    });
  }

  const collegeIds = userColleges.map((uc) => uc.college_id);

  // Get all deadlines with college names
  const { data: deadlines } = await supabase
    .from('deadlines')
    .select('*, college:colleges(id, name)')
    .in('college_id', collegeIds)
    .order('date', { ascending: true });

  // Get submission statuses
  const { data: statuses } = await supabase
    .from('user_deadline_status')
    .select('deadline_id, submitted')
    .eq('user_id', userId);

  const statusMap = new Map(
    (statuses || []).map((s) => [s.deadline_id, s.submitted])
  );

  const now = new Date();
  const allDeadlines = deadlines || [];
  const submitted = allDeadlines.filter((d) => statusMap.get(d.id) === true);
  const notSubmitted = allDeadlines.filter((d) => statusMap.get(d.id) !== true);

  const overdue = notSubmitted
    .filter((d) => new Date(d.date) < now)
    .map((d) => ({
      id: d.id,
      college: (d.college as { name: string })?.name || 'Unknown',
      type: d.type,
      date: d.date,
      daysOverdue: Math.floor((now.getTime() - new Date(d.date).getTime()) / 86_400_000),
    }));

  const upcoming = notSubmitted
    .filter((d) => new Date(d.date) >= now)
    .slice(0, 5)
    .map((d) => ({
      id: d.id,
      college: (d.college as { name: string })?.name || 'Unknown',
      type: d.type,
      date: d.date,
      daysLeft: Math.ceil((new Date(d.date).getTime() - now.getTime()) / 86_400_000),
    }));

  const totalDeadlines = allDeadlines.length;
  const submittedCount = submitted.length;
  const progressPct = totalDeadlines > 0 ? Math.round((submittedCount / totalDeadlines) * 100) : 0;

  // Pick a status emoji + text
  let statusEmoji: string;
  let statusText: string;

  if (overdue.length > 0) {
    statusEmoji = '🚨';
    statusText = `${overdue.length} deadline${overdue.length > 1 ? 's' : ''} past due — might need a nudge.`;
  } else if (upcoming.length > 0 && upcoming[0].daysLeft <= 3) {
    statusEmoji = '⏰';
    statusText = `${upcoming[0].college} ${upcoming[0].type} due in ${upcoming[0].daysLeft} day${upcoming[0].daysLeft !== 1 ? 's' : ''}.`;
  } else if (progressPct === 100) {
    statusEmoji = '🎉';
    statusText = 'All deadlines submitted! Everything is on track.';
  } else if (progressPct >= 75) {
    statusEmoji = '💪';
    statusText = 'Great progress — almost there!';
  } else if (progressPct >= 50) {
    statusEmoji = '👍';
    statusText = 'Making steady progress.';
  } else if (upcoming.length === 0 && totalDeadlines > 0) {
    statusEmoji = '✅';
    statusText = 'No upcoming deadlines right now.';
  } else {
    statusEmoji = '📋';
    statusText = 'Early days — deadlines are ahead.';
  }

  return NextResponse.json({
    studentName: student?.name || 'Your student',
    totalColleges: collegeIds.length,
    totalDeadlines,
    submitted: submittedCount,
    progressPct,
    overdue,
    upcoming,
    statusEmoji,
    statusText,
  });
}
