'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DeadlineWithCollege } from '@/lib/types';
import { formatDate, formatDaysRemaining, getDeadlineTypeColor, cn } from '@/lib/utils';

interface DeadlineCardProps {
  deadline: DeadlineWithCollege;
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
        'bg-white border border-[#e8e8ed] rounded-2xl p-4 hover:shadow-sm transition-shadow',
        submitted && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Urgency dot */}
            <span
              className={cn(
                'inline-block w-2 h-2 rounded-full shrink-0',
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
          <div className="flex items-center flex-wrap gap-2 mt-1.5 pl-4">
            <span className={cn('text-[12px] font-[600] px-2 py-0.5 rounded-full', typeColor)}>
              {deadline.type}
            </span>
            <span className="text-[13px] text-[#86868b]">{formatDate(deadline.date)}</span>
            {deadline.time && (
              <span className="text-[12px] text-[#86868b]">{deadline.time}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={cn('text-[13px]', urgencyTextColor(deadline.urgency, submitted))}>
            {submitted ? 'Done' : formatDaysRemaining(deadline.daysRemaining)}
          </span>
          {onToggleSubmitted && (
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={cn(
                'text-[12px] px-3 py-1 rounded-full border font-[500] transition-all',
                submitted
                  ? 'border-[#34c759]/40 bg-[#34c759]/10 text-[#34c759] hover:bg-[#34c759]/20'
                  : 'border-[#d2d2d7] text-[#86868b] hover:border-[#1d1d1f] hover:text-[#1d1d1f]'
              )}
            >
              {toggling ? '...' : submitted ? 'Unmark' : 'Mark done'}
            </button>
          )}
        </div>
      </div>

      {deadline.college.city && (
        <p className="text-[12px] text-[#86868b] mt-2 pl-4">
          {deadline.college.city}, {deadline.college.state}
        </p>
      )}
    </div>
  );
}
