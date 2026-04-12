import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const TIER_BY_PRICE: Record<string, string> = {
  [process.env.STRIPE_PLUS_PRICE_ID!]: 'plus',
  [process.env.STRIPE_FAMILY_PRICE_ID!]: 'family',
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.clerk_user_id;
      const tier = session.metadata?.tier;
      if (userId && tier) {
        await supabase
          .from('users')
          .update({ subscription_tier: tier })
          .eq('id', userId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      await supabase
        .from('users')
        .update({ subscription_tier: 'free' })
        .eq('stripe_customer_id', customerId);
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const priceId = sub.items.data[0]?.price?.id;
      const tier = priceId ? (TIER_BY_PRICE[priceId] || 'free') : 'free';
      if (sub.status === 'active') {
        await supabase
          .from('users')
          .update({ subscription_tier: tier })
          .eq('stripe_customer_id', customerId);
      } else if (sub.status === 'canceled' || sub.status === 'unpaid') {
        await supabase
          .from('users')
          .update({ subscription_tier: 'free' })
          .eq('stripe_customer_id', customerId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
