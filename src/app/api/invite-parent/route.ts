import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Resend } from 'resend';
import { renderParentInviteEmail } from '@/emails/parent-invite';

const getResend = () => new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, email, phone } = await req.json();
  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const user = await currentUser();

  // Get student's colleges for the email
  const { data: userColleges } = await supabase
    .from('user_colleges')
    .select('college:colleges(name)')
    .eq('user_id', userId);

  const colleges = (userColleges || []).map((uc: { college: { name: string }[] | { name: string } | null }) => {
    const col = uc.college;
    if (!col) return '';
    if (Array.isArray(col)) return col[0]?.name || '';
    return col.name || '';
  }).filter(Boolean);

  // Create or update parent connection
  const { data: connection, error } = await supabase
    .from('parent_connections')
    .upsert(
      {
        student_user_id: userId,
        parent_name: name,
        parent_email: email,
        parent_phone: phone || null,
      },
      { onConflict: 'student_user_id' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const studentName = user?.firstName || user?.fullName || 'Your student';
  const accessToken = connection.access_token;

  // Send parent invite email
  let emailSent = false;
  let emailError: string | null = null;
  try {
    const result = await getResend().emails.send({
      from: 'due.college <reminders@due.college>',
      to: email,
      subject: `${studentName} added you to their college deadline tracker`,
      html: renderParentInviteEmail({
        parentName: name,
        studentName,
        colleges,
        accessToken,
      }),
    });
    // Resend returns { id } on success; an error property means it failed
    emailSent = !!(result as { id?: string }).id;
    if (!emailSent) emailError = 'Email provider returned an unexpected response.';
  } catch (e) {
    console.error('Email send failed:', e);
    emailError = e instanceof Error ? e.message : 'Failed to send email.';
  }

  return NextResponse.json({ success: true, accessToken, emailSent, emailError });
}
