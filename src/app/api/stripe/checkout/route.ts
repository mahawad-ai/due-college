import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const PRICE_IDS: Record<string, string> = {
  plus: process.env.STRIPE_PLUS_PRICE_ID!,
  family: process.env.STRIPE_FAMILY_PRICE_ID!,
};

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { tier } = await req.json();
  if (!tier || !PRICE_IDS[tier]) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
  }

  const user = await currentUser();
  const supabase = createServerSupabaseClient();

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id, email')
    .eq('id', userId)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user?.primaryEmailAddress?.emailAddress || profile?.email,
      name: user?.fullName || undefined,
      metadata: { clerk_user_id: userId },
    });
    customerId = customer.id;
    await supabase
      .from('users')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);
  }

  const origin = req.headers.get('origin') || 'https://due.college';

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: PRICE_IDS[tier],
        quantity: 1,
      },
    ],
    success_url: `${origin}/dashboard?upgraded=true`,
    cancel_url: `${origin}/upgrade`,
    metadata: {
      clerk_user_id: userId,
      tier,
    },
  });

  return NextResponse.json({ url: session.url });
}
