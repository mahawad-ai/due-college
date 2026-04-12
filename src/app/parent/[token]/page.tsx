'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DeadlineCard from '@/components/DeadlineCard';
import ConflictAlert from '@/components/ConflictAlert';
import { DeadlineWithCollege } from '@/lib/types';
import { getDaysRemaining, getUrgency, sortDeadlinesByUrgency, groupDeadlinesByUrgency, detectConflicts } from '@/lib/utils';

interface ParentViewData {
  studentName: string;
  deadlines: DeadlineWithCollege[];
}

export default function ParentViewPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<ParentViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneSubmitting, setPhoneSubmitting] = useState(false);
  const [phoneSuccess, setPhoneSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/parent-view/${token}`);
        if (!res.ok) throw new Error('Invalid or expired link');
        const json = await res.json();
        const enriched = (json.deadlines || []).map((d: DeadlineWithCollege) => {
          const days = getDaysRemaining(d.date);
          return { ...d, daysRemaining: days, urgency: getUrgency(days) };
        });
        setData({
          studentName: json.studentName,
          deadlines: sortDeadlinesByUrgency(enriched),
        });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handleEnableSMS(e: React.FormEvent) {
    e.preventDefault();
    setPhoneSubmitting(true);
    try {
      await fetch(`/api/parent-view/${token}/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      setPhoneSuccess(true);
    } catch {
      // ignore
    } finally {
      setPhoneSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h2 className="text-xl font-bold text-navy mb-2">Link not found</h2>
          <p className="text-gray-500">{error || 'This parent invite link is invalid or has expired.'}</p>
        </div>
      </main>
    );
  }

  const grouped = groupDeadlinesByUrgency(data.deadlines);
  const conflicts = detectConflicts(data.deadlines.filter((d) => d.daysRemaining >= 0 && d.daysRemaining <= 30));
  const nextDeadline = data.deadlines.find((d) => d.daysRemaining >= 0);
  const uniqueColleges = new Set(data.deadlines.map((d) => d.college_id)).size;

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <a href="/" className="text-sm font-bold text-navy tracking-tight mb-1 block">
            due.college
          </a>
          <h1 className="text-2xl font-extrabold text-navy">
            {data.studentName}&apos;s College Deadlines
          </h1>
          {uniqueColleges > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {uniqueColleges} school{uniqueColleges !== 1 ? 's' : ''}
              {nextDeadline && ` · Next deadline in ${nextDeadline.daysRemaining} days`}
            </p>
          )}
          <div className="inline-flex items-center gap-1.5 mt-2 bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Read-only view
          </div>
        </div>

        {/* Conflict Alerts */}
        <ConflictAlert conflicts={conflicts} />

        {/* SMS Opt-in */}
        {!phoneSuccess ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
            <h3 className="font-semibold text-navy mb-1 text-sm">Get SMS reminders</h3>
            <p className="text-xs text-gray-500 mb-3">
              Receive the same deadline reminders as {data.studentName} via text.
            </p>
            <form onSubmit={handleEnableSMS} className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 555-5555"
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-navy"
                required
              />
              <button
                type="submit"
                disabled={phoneSubmitting}
                className="px-4 py-2.5 bg-coral text-white text-sm font-semibold rounded-xl hover:bg-coral/90 transition-colors whitespace-nowrap"
              >
                {phoneSubmitting ? '...' : 'Enable SMS'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-green-50 border border-green rounded-2xl p-4 mb-6 text-sm text-green-700 font-medium">
            ✓ You&apos;ll receive SMS reminders for {data.studentName}&apos;s deadlines.
          </div>
        )}

        {/* Urgent */}
        {grouped.urgent.length > 0 && (
          <section className="mb-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
              <span>🔴</span> Urgent — under 7 days
            </h2>
            <div className="space-y-3">
              {grouped.urgent.map((d) => (
                <DeadlineCard key={d.id} deadline={d} />
              ))}
            </div>
          </section>
        )}

        {/* Coming Up */}
        {grouped.upcoming.length > 0 && (
          <section className="mb-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
              <span>🟡</span> Coming Up — 7 to 30 days
            </h2>
            <div className="space-y-3">
              {grouped.upcoming.map((d) => (
                <DeadlineCard key={d.id} deadline={d} />
              ))}
            </div>
          </section>
        )}

        {/* Later */}
        {grouped.later.length > 0 && (
          <section className="mb-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
              <span>🟢</span> Later — over 30 days
            </h2>
            <div className="space-y-3">
              {grouped.later.map((d) => (
                <DeadlineCard key={d.id} deadline={d} />
              ))}
            </div>
          </section>
        )}

        {data.deadlines.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No deadlines added yet.
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            Powered by{' '}
            <a href="/" className="font-bold text-navy">
              due.college
            </a>{' '}
            · Free college deadline tracker
          </p>
        </div>
      </div>
    </main>
  );
}
