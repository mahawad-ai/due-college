import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Resend } from 'resend';
import { renderWelcomeEmail } from '@/emails/welcome';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');
  let event: { type: string; data: { id: string; email_addresses: { email_address: string }[]; first_name?: string; last_name?: string } };

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as typeof event;
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  if (event.type === 'user.created') {
    const { id, email_addresses, first_name, last_name } = event.data;
    const email = email_addresses[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(' ');

    // Create user record
    await supabase.from('users').upsert(
      { id, email, name: name || null, subscription_tier: 'free' },
      { onConflict: 'id', ignoreDuplicates: true }
    );

    // Create default notification preferences
    await supabase.from('notification_preferences').upsert(
      { user_id: id },
      { onConflict: 'user_id', ignoreDuplicates: true }
    );

    // Send welcome email
    if (email) {
      try {
        await resend.emails.send({
          from: 'due.college <reminders@due.college>',
          to: email,
          subject: "You're all set — here are your deadlines",
          html: renderWelcomeEmail({
            studentName: first_name || 'there',
            colleges: [],
          }),
        });
      } catch (e) {
        console.error('Welcome email failed:', e);
      }
    }
  }

  return NextResponse.json({ received: true });
}
