'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NormalizedDeadline, DeadlineWithCollege } from '@/lib/types';
import { formatDate, formatDaysRemaining, getDeadlineTypeColor, cn } from '@/lib/utils';
import CollegeLogo from '@/components/CollegeLogo';

interface DeadlineCardProps {
  deadline: DeadlineWithCollege | NormalizedDeadline;
  onToggleSubmitted?: (deadlineId: string, submitted: boolean) => Promise<void>;
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
          {'college' in deadline && deadline.college ? (
            <CollegeLogo name={deadline.college.name} website={deadline.college.website} size="sm" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[14px]">📋</div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  'inline-block w-1.5 h-1.5 rounded-full shrink-0',
                  urgencyDotColor(deadline.urgency, submitted)
                )}
              />
              {deadline.college_id ? (
                <Link
                  href={`/school/${deadline.college_id}`}
                  className="font-[600] text-[#1d1d1f] text-[15px] hover:text-[#ff3b30] transition-colors leading-tight truncate block"
                >
                  {'college' in deadline && deadline.college ? deadline.college.name : ('college_name' in deadline ? deadline.college_name : deadline.college_id)}
                </Link>
              ) : (
                <span className="font-[600] text-[#1d1d1f] text-[15px] leading-tight truncate block">
                  {'college_name' in deadline ? deadline.college_name : 'Personal'}
                </span>
              )}
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
