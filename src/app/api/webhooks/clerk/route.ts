/**
 * POST /api/webhooks/clerk
 *
 * Receives Clerk webhook events and reacts to them.
 * Currently handles:
 *   - user.created  → sends a welcome email via Resend
 *
 * Setup (one-time, in Clerk dashboard):
 *   Webhooks → Add Endpoint → https://due.college/api/webhooks/clerk
 *   Events: user.created
 *   Copy the signing secret → CLERK_WEBHOOK_SECRET in Vercel env vars
 */

import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { Resend } from 'resend';
import { renderWelcomeSignupEmail } from '@/emails/welcome-signup';

const getResend = () => new Resend(process.env.RESEND_API_KEY || '');

// Svix webhook signature verification
async function verifyWebhook(req: NextRequest): Promise<{ type: string; data: Record<string, unknown> } | null> {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[clerk-webhook] CLERK_WEBHOOK_SECRET is not set');
    return null;
  }

  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return null;
  }

  const body = await req.text();

  try {
    const wh = new Webhook(secret);
    const payload = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as { type: string; data: Record<string, unknown> };
    return payload;
  } catch (err) {
    console.error('[clerk-webhook] Signature verification failed:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const payload = await verifyWebhook(req);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const { type, data } = payload;

  // ── user.created ─────────────────────────────────────────────────────────
  if (type === 'user.created') {
    const emailAddresses = data.email_addresses as Array<{ email_address: string; id: string }> | undefined;
    const primaryEmailId = data.primary_email_address_id as string | undefined;

    // Find the primary email address
    const primaryEmail = emailAddresses?.find((e) => e.id === primaryEmailId)?.email_address
      ?? emailAddresses?.[0]?.email_address;

    const firstName = (data.first_name as string | null) || '';

    if (primaryEmail) {
      try {
        const html = renderWelcomeSignupEmail({ firstName });
        await getResend().emails.send({
          from: 'due.college <hello@due.college>',
          to: primaryEmail,
          subject: `Welcome to due.college${firstName ? `, ${firstName}` : ''}! 🎉`,
          html,
        });
        console.log(`[clerk-webhook] Welcome email sent to ${primaryEmail}`);
      } catch (err) {
        // Don't crash — email failure is non-fatal
        console.error('[clerk-webhook] Failed to send welcome email:', err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
