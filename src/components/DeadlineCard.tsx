'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DeadlineWithCollege } from '@/lib/types';
import { formatDate, formatDaysRemaining, getDeadlineTypeColor, cn } from '@/lib/utils';

interface DeadlineCardProps {
  deadline: DeadlineWithCollege;
  onToggleSubmitted?: (deadlineId: string, submitted: boolean) => Promise<void>;
}

// Brand colors for top schools
const BRAND_COLORS: Record<string, string> = {
  'stanford':     '#8C1515',
  'harvard':      '#A51C30',
  'mit':          '#750014',
  'yale':         '#00356B',
  'princeton':    '#E77500',
  'columbia':     '#B9D9EB',
  'upenn':        '#011F5B',
  'penn':         '#011F5B',
  'duke':         '#003087',
  'northwestern': '#4E2A84',
  'michigan':     '#00274C',
  'ucla':         '#003B5C',
  'usc':          '#990000',
  'nyu':          '#57068C',
  'georgetown':   '#041E42',
  'vanderbilt':   '#866D4B',
  'emory':        '#012169',
  'notre dame':   '#0C2340',
  'rice':         '#00205B',
  'tufts':        '#3E8EDE',
  'boston':       '#CC0000',
  'bu':           '#CC0000',
  'bc':           '#8A0000',
};

function getBrandColor(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, color] of Object.entries(BRAND_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return '#1d1d1f';
}

function UniLogo({ college }: { college: DeadlineWithCollege['college'] }) {
  const [imgFailed, setImgFailed] = useState(false);
  const name = college.name;
  const initial = name.charAt(0).toUpperCase();
  const bgColor = getBrandColor(name);

  const domain = college.website
    ? college.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
    : null;

  if (!domain || imgFailed) {
    return (
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-white text-[14px] font-[800]">{initial}</span>
      </div>
    );
  }

  return (
    <div
      className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-sm"
      style={{ backgroundColor: bgColor }}
    >
      <img
        src={`https://logo.clearbit.com/${domain}`}
        alt={name}
        className="w-full h-full object-contain p-[3px]"
        onError={() => setImgFailed(true)}
      />
    </div>
  );
}

function urgencyDotColor(urgency: string, submitted: boolean): string {
  if (submitted) return 'bg-[#86868b]';
  if (urgency === 'urgent') return 'bg-[#ff3b30]';
  if (urgency === 'upcoming') return 'bg-[#ff9f0a]';
  return 'bg-[#34c759]';
}

function urgencyTextColor(urgency: string, submitted: boolean): string {
  if (submitted) return 'text-[#86868b]';
  if (urgency === 'urgent') return 'text-[#ff3b30] font-[700]';
  if (urgency === 'upcoming') return 'text-[#ff9f0a] font-[600]';
  return 'text-[#34c759] font-[600]';
}

export default function DeadlineCard({ deadline, onToggleSubmitted }: DeadlineCardProps) {
  const [submitted, setSubmitted] = useState(deadline.status?.submitted ?? false);
  const [toggling, setToggling] = useState(false);

  async function handleToggle() {
    if (!onToggleSubmitted) return;
    setToggling(true);
    const newVal = !submitted;
    setSubmitted(newVal);
    try {
      await onToggleSubmitted(deadline.id, newVal);
    } catch {
      setSubmitted(!newVal);
    } finally {
      setToggling(false);
    }
  }

  const typeColor = getDeadlineTypeColor(deadline.type);

  return (
    <div
      className={cn(
        'bg-white border border-[#e8e8ed] rounded-2xl p-4 hover:shadow-sm transition-all duration-200',
        submitted && 'opacity-55'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: logo + name + meta */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <UniLogo college={deadline.college} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  'inline-block w-1.5 h-1.5 rounded-full shrink-0',
                  urgencyDotColor(deadline.urgency, submitted)
                )}
              />
              <Link
                href={`/school/${deadline.college_id}`}
                className="font-[600] text-[#1d1d1f] text-[15px] hover:text-[#ff3b30] transition-colors leading-tight truncate block"
              >
                {deadline.college.name}
              </Link>
            </div>
            <div className="flex items-center flex-wrap gap-2 pl-3.5">
              <span className={cn('text-[11px] font-[700] px-2 py-0.5 rounded-full', typeColor)}>
                {deadline.type}
              </span>
              <span className="text-[12px] text-[#86868b]">{formatDate(deadline.date)}</span>
              {deadline.time && (
                <span className="text-[11px] text-[#86868b]">{deadline.time}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: days remaining + toggle */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={cn('text-[13px]', urgencyTextColor(deadline.urgency, submitted))}>
            {submitted ? 'Done ✓' : formatDaysRemaining(deadline.daysRemaining)}
          </span>
          {onToggleSubmitted && (
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={cn(
                'text-[11px] px-3 py-1 rounded-full border font-[600] transition-all',
                submitted
                  ? 'border-[#34c759]/40 bg-[#34c759]/10 text-[#34c759] hover:bg-[#34c759]/20'
                  : 'border-[#d2d2d7] text-[#86868b] hover:border-[#1d1d1f] hover:text-[#1d1d1f]'
              )}
            >
              {toggling ? '···' : submitted ? 'Unmark' : 'Mark done'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
