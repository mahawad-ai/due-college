import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { DeadlineWithCollege } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDaysRemaining(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = parseISO(dateStr);
  return differenceInCalendarDays(deadline, today);
}

export function getUrgency(daysRemaining: number): 'urgent' | 'upcoming' | 'later' {
  if (daysRemaining <= 7) return 'urgent';
  if (daysRemaining <= 30) return 'upcoming';
  return 'later';
}

export function getUrgencyColor(urgency: 'urgent' | 'upcoming' | 'later'): string {
  switch (urgency) {
    case 'urgent':
      return 'text-coral bg-coral-light border-coral';
    case 'upcoming':
      return 'text-yellow-700 bg-yellow-light border-yellow';
    case 'later':
      return 'text-green-700 bg-green-light border-green';
  }
}

export function getUrgencyBadgeColor(urgency: 'urgent' | 'upcoming' | 'later'): string {
  switch (urgency) {
    case 'urgent':
      return 'bg-coral text-white';
    case 'upcoming':
      return 'bg-yellow text-navy';
    case 'later':
      return 'bg-green text-white';
  }
}

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDaysRemaining(days: number): string {
  if (days < 0) return 'Passed';
  if (days === 0) return 'Today!';
  if (days === 1) return '1 day';
  return `${days} days`;
}

export function getDeadlineTypeColor(type: string): string {
  const colors: Record<string, string> = {
    ED1: 'bg-red-100 text-red-700',
    ED2: 'bg-orange-100 text-orange-700',
    EA: 'bg-blue-100 text-blue-700',
    REA: 'bg-purple-100 text-purple-700',
    RD: 'bg-gray-100 text-gray-700',
    FAFSA: 'bg-green-100 text-green-700',
    Housing: 'bg-teal-100 text-teal-700',
    Scholarship: 'bg-yellow-100 text-yellow-700',
    Decision: 'bg-indigo-100 text-indigo-700',
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
}

export function sortDeadlinesByUrgency(deadlines: DeadlineWithCollege[]): DeadlineWithCollege[] {
  return [...deadlines].sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function groupDeadlinesByUrgency(deadlines: DeadlineWithCollege[]) {
  return {
    urgent: deadlines.filter((d) => d.urgency === 'urgent'),
    upcoming: deadlines.filter((d) => d.urgency === 'upcoming'),
    later: deadlines.filter((d) => d.urgency === 'later'),
  };
}

export function detectConflicts(deadlines: DeadlineWithCollege[]): { week: string; count: number; deadlines: DeadlineWithCollege[] }[] {
  const weekMap = new Map<string, DeadlineWithCollege[]>();

  for (const deadline of deadlines) {
    const date = parseISO(deadline.date);
    // Get start of the week (Sunday)
    const dayOfWeek = date.getDay();
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - dayOfWeek);
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, []);
    }
    weekMap.get(weekKey)!.push(deadline);
  }

  const conflicts = [];
  for (const [week, weekDeadlines] of weekMap.entries()) {
    if (weekDeadlines.length >= 2) {
      const weekDate = parseISO(week);
      conflicts.push({
        week: weekDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
        count: weekDeadlines.length,
        deadlines: weekDeadlines,
      });
    }
  }

  return conflicts;
}

export function generateCalendarEvent(deadline: { college: string; type: string; date: string; time?: string }): string {
  const date = parseISO(deadline.date);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const now = new Date();
  const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//due.college//deadline-tracker//EN
BEGIN:VEVENT
UID:${deadline.college}-${deadline.type}-${dateStr}@due.college
DTSTAMP:${dtStamp}
DTSTART;VALUE=DATE:${dateStr}
DTEND;VALUE=DATE:${dateStr}
SUMMARY:${deadline.college} ${deadline.type} Deadline
DESCRIPTION:${deadline.college} ${deadline.type} application deadline. Track all your deadlines at due.college
URL:https://due.college/dashboard
END:VEVENT
END:VCALENDAR`;
}
