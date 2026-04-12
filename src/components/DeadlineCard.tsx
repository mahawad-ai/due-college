'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DeadlineWithCollege } from '@/lib/types';
import { formatDate, formatDaysRemaining, getDeadlineTypeColor, getUrgencyBadgeColor, cn } from '@/lib/utils';

interface DeadlineCardProps {
  deadline: DeadlineWithCollege;
  onToggleSubmitted?: (deadlineId: string, submitted: boolean) => Promise<void>;
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

  const badgeColor = getUrgencyBadgeColor(deadline.urgency);
  const typeColor = getDeadlineTypeColor(deadline.type);

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md',
        submitted ? 'opacity-60 border-gray-200' : 'border-gray-200',
        deadline.urgency === 'urgent' && !submitted ? 'border-l-4 border-l-coral' : '',
        deadline.urgency === 'upcoming' && !submitted ? 'border-l-4 border-l-yellow' : '',
        deadline.urgency === 'later' && !submitted ? 'border-l-4 border-l-green' : ''
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link
            href={`/school/${deadline.college_id}`}
            className="font-bold text-navy text-base hover:text-coral transition-colors leading-tight block truncate"
          >
            {deadline.college.name}
          </Link>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', typeColor)}>
              {deadline.type}
            </span>
            <span className="text-sm text-gray-500">{formatDate(deadline.date)}</span>
            {deadline.time && (
              <span className="text-xs text-gray-400">{deadline.time}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', badgeColor)}>
            {submitted ? '✓ Done' : formatDaysRemaining(deadline.daysRemaining)}
          </span>
          {onToggleSubmitted && (
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full border transition-all font-medium',
                submitted
                  ? 'border-green bg-green-light text-green-700 hover:bg-green-100'
                  : 'border-gray-300 text-gray-500 hover:border-navy hover:text-navy'
              )}
            >
              {toggling ? '...' : submitted ? 'Unmark' : 'Mark done'}
            </button>
          )}
        </div>
      </div>

      {deadline.college.city && (
        <p className="text-xs text-gray-400 mt-2">
          {deadline.college.city}, {deadline.college.state}
        </p>
      )}
    </div>
  );
}
