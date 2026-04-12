'use client';

import { cn } from '@/lib/utils';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  tier: string;
  price: string;
  period?: string;
  description?: string;
  features: PricingFeature[];
  ctaLabel: string;
  onCta: () => void;
  popular?: boolean;
  current?: boolean;
  loading?: boolean;
}

export default function PricingCard({
  tier,
  price,
  period = '/month',
  description,
  features,
  ctaLabel,
  onCta,
  popular = false,
  current = false,
  loading = false,
}: PricingCardProps) {
  return (
    <div
      className={cn(
        'relative bg-white rounded-3xl border-2 p-6 flex flex-col',
        popular ? 'border-coral shadow-xl shadow-coral/10 scale-[1.02]' : 'border-gray-200',
        current && 'ring-2 ring-green ring-offset-2'
      )}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-coral text-white text-xs font-bold px-4 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}
      {current && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green text-white text-xs font-bold px-3 py-1 rounded-full">
            Current Plan
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-bold text-navy uppercase tracking-wide">{tier}</h3>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-4xl font-extrabold text-navy">{price}</span>
          {price !== '$0' && <span className="text-gray-500 text-sm">{period}</span>}
        </div>
        {description && <p className="text-sm text-gray-500 mt-2">{description}</p>}
      </div>

      <ul className="space-y-3 flex-1 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <span className={cn('mt-0.5 text-base', feature.included ? 'text-green-600' : 'text-gray-300')}>
              {feature.included ? '✓' : '✗'}
            </span>
            <span className={feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}>
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={onCta}
        disabled={current || loading}
        className={cn(
          'w-full py-3 rounded-xl font-semibold text-sm transition-all',
          current
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : popular
            ? 'bg-coral text-white hover:bg-coral/90 shadow-lg shadow-coral/25'
            : 'bg-navy text-white hover:bg-navy/90'
        )}
      >
        {loading ? 'Loading...' : current ? 'Current Plan' : ctaLabel}
      </button>
    </div>
  );
}
