'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import PricingCard from '@/components/PricingCard';
import MobileNav from '@/components/MobileNav';

export default function UpgradePage() {
  const { user } = useUser();
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user-profile')
      .then((r) => r.json())
      .then((d) => setCurrentTier(d.subscription_tier || 'free'));
  }, []);

  async function handleUpgrade(tier: 'plus' | 'family') {
    setLoading(tier);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  const plans = [
    {
      tier: 'Free',
      price: '$0',
      features: [
        { text: 'Email reminders', included: true },
        { text: 'Up to 10 schools', included: true },
        { text: 'Deadline dashboard', included: true },
        { text: 'Parent read-only view', included: true },
        { text: 'SMS reminders', included: false },
        { text: 'Unlimited schools', included: false },
        { text: 'Google Calendar export', included: false },
        { text: 'Conflict alerts', included: false },
        { text: 'Submitted tracking', included: false },
      ],
      ctaLabel: 'Current plan',
      onCta: () => {},
      current: currentTier === 'free',
    },
    {
      tier: 'Plus',
      price: '$4.99',
      features: [
        { text: 'Everything in Free', included: true },
        { text: 'SMS reminders for student', included: true },
        { text: 'Unlimited schools', included: true },
        { text: 'Google Calendar export', included: true },
        { text: 'Conflict alerts', included: true },
        { text: 'Submitted tracking', included: true },
        { text: 'Parent SMS reminders', included: false },
        { text: 'Parent dashboard access', included: false },
        { text: 'Weekly family summary', included: false },
      ],
      ctaLabel: 'Upgrade to Plus',
      onCta: () => handleUpgrade('plus'),
      current: currentTier === 'plus',
    },
    {
      tier: 'Family',
      price: '$7.99',
      popular: true,
      features: [
        { text: 'Everything in Plus', included: true },
        { text: 'SMS reminders for parent', included: true },
        { text: 'Parent dashboard access', included: true },
        { text: 'Family deadline summary', included: true },
        { text: 'Every Sunday recap email', included: true },
        { text: 'Unlimited schools', included: true },
        { text: 'All notification options', included: true },
        { text: 'Priority support', included: true },
      ],
      ctaLabel: 'Upgrade to Family',
      onCta: () => handleUpgrade('family'),
      current: currentTier === 'family',
    },
  ];

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-24">
        <div className="max-w-container mx-auto px-4 py-8">
          <div className="text-center mb-10">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-navy mb-4 block">
              ← Back to dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-navy mb-2">Simple, honest pricing</h1>
            <p className="text-gray-500">
              Start free. Upgrade when you&apos;re ready.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 items-start">
            {plans.map((plan) => (
              <PricingCard
                key={plan.tier}
                tier={plan.tier}
                price={plan.price}
                features={plan.features}
                ctaLabel={plan.ctaLabel}
                onCta={plan.onCta}
                popular={plan.popular}
                current={plan.current}
                loading={loading === plan.tier.toLowerCase()}
              />
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            Cancel any time. No hidden fees. Questions?{' '}
            <a href="mailto:hello@due.college" className="text-coral hover:underline">
              hello@due.college
            </a>
          </p>
        </div>
      </main>
      <MobileNav />
    </>
  );
}
