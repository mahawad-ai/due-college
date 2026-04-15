'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DeadlineCard from '@/components/DeadlineCard';
import ConflictAlert from '@/components/ConflictAlert';
import TopNav from '@/components/TopNav';
import { DeadlineWithCollege } from '@/lib/types';
import {
  getDaysRemaining,
  getUrgency,
  sortDeadlinesByUrgency,
  groupDeadlinesByUrgency,
  detectConflicts,
} from '@/lib/utils';

type SortBy = 'date' | 'college';

export default function DeadlinesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [deadlines, setDeadlines] = useState<DeadlineWithCollege[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterCollege, setFilterCollege] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [showDone, setShowDone] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/user-deadlines');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      const enriched: DeadlineWithCollege[] = (data.deadlines || []).map((d: DeadlineWithCollege) => {
        const days = getDaysRemaining(d.date);
        return { ...d, daysRemaining: days, urgency: getUrgency(days) };
      });
      setDeadlines(sortDeadlinesByUrgency(enriched));
    } catch {
      setError('Could not load deadlines. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push('/login'); return; }
    load();
  }, [isLoaded, user, router, load]);

  async function handleToggleSubmitted(deadlineId: string, submitted: boolean) {
    await fetch('/api/deadline-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deadlineId, submitted }),
    });
  }

  const uniqueColleges = Array.from(
    new Map(deadlines.map((d) => [d.college_id, d.college])).entries()
  );
  const uniqueTypes = Array.from(new Set(deadlines.map((d) => d.type)));

  let filtered = deadlines.filter((d) => {
    if (filterCollege !== 'all' && d.college_id !== filterCollege) return false;
    if (filterType !== 'all' && d.type !== filterType) return false;
    if (!showDone && d.status?.submitted) return false;
    return true;
  });
  if (sortBy === 'college') {
    filtered = [...filtered].sort((a, b) => (a.college?.name || '').localeCompare(b.college?.name || ''));
  }

  const grouped = groupDeadlinesByUrgency(filtered);
  const conflicts = detectConflicts(deadlines.filter((d) => d.daysRemaining >= 0 && d.daysRemaining <= 30));
  const submittedCount = deadlines.filter((d) => d.status?.submitted).length;

  if (!isLoaded || loading) {
    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-white pt-[90px] pb-28">
          <div className="max-w-5xl mx-auto px-6 flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-[#ff3b30] border-t-transparent rounded-full animate-spin" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white pt-[90px] pb-28">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-[34px] font-[700] tracking-[-0.5px] text-[#1d1d1f] leading-tight">
                Your <span className="text-[#ff3b30]">Deadlines</span>
              </h1>
              <p className="text-[15px] text-[#86868b] mt-1">
                {deadlines.length} total · {submittedCount} submitted · {grouped.urgent.length} urgent
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-[13px] font-[500] text-[#1d1d1f] border border-[#d2d2d7] px-4 py-2 rounded-full hover:border-[#1d1d1f] transition-colors no-underline"
            >
              ← Back to dashboard
            </Link>
          </div>

          {error && (
            <div className="bg-[rgba(255,59,48,0.06)] border border-[#ff3b30]/20 text-[#ff3b30] rounded-2xl p-4 mb-6 text-[13px]">
              {error}
            </div>
          )}

          {conflicts.length > 0 && (
            <div className="mb-6">
              <ConflictAlert conflicts={conflicts} />
            </div>
          )}

          {deadlines.length === 0 ? (
            <div className="bg-[#f5f5f7] rounded-2xl p-12 text-center">
              <h2 className="text-[20px] font-[700] text-[#1d1d1f] mb-2">No deadlines yet</h2>
              <p className="text-[#86868b] mb-6">Add your colleges to start tracking deadlines.</p>
              <Link
                href="/discover/search"
                className="inline-block bg-[#ff3b30] hover:bg-[#e6352b] text-white px-6 py-3 rounded-xl font-[600] text-[14px] transition-colors no-underline"
              >
                Browse Colleges
              </Link>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="bg-[#f5f5f7] rounded-2xl p-5 mb-6 flex flex-wrap gap-3 items-center">
                <select
                  value={filterCollege}
                  onChange={(e) => setFilterCollege(e.target.value)}
                  className="bg-white border border-[#d2d2d7] rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-[#ff3b30]"
                >
                  <option value="all">All schools</option>
                  {uniqueColleges.map(([id, col]) => (
                    <option key={id} value={id}>{col?.name}</option>
                  ))}
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white border border-[#d2d2d7] rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-[#ff3b30]"
                >
                  <option value="all">All types</option>
                  {uniqueTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="bg-white border border-[#d2d2d7] rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-[#ff3b30]"
                >
                  <option value="date">Sort by urgency</option>
                  <option value="college">Sort by college</option>
                </select>
                <label className="flex items-center gap-2 text-[13px] text-[#1d1d1f] ml-2">
                  <input
                    type="checkbox"
                    checked={showDone}
                    onChange={(e) => setShowDone(e.target.checked)}
                    className="accent-[#ff3b30]"
                  />
                  Show submitted
                </label>
              </div>

              {filtered.length === 0 ? (
                <div className="bg-[#f5f5f7] rounded-2xl p-8 text-center text-[14px] text-[#86868b]">
                  No deadlines match your filters.
                </div>
              ) : (
                <div className="space-y-8">
                  {grouped.urgent.length > 0 && (
                    <section>
                      <h2 className="text-[14px] font-[700] text-[#ff3b30] uppercase tracking-[0.5px] mb-3">
                        Urgent ({grouped.urgent.length})
                      </h2>
                      <div className="space-y-3">
                        {grouped.urgent.map((d) => (
                          <DeadlineCard key={d.id} deadline={d} onToggleSubmitted={handleToggleSubmitted} />
                        ))}
                      </div>
                    </section>
                  )}
                  {grouped.upcoming.length > 0 && (
                    <section>
                      <h2 className="text-[14px] font-[700] text-[#ff9f0a] uppercase tracking-[0.5px] mb-3">
                        Upcoming ({grouped.upcoming.length})
                      </h2>
                      <div className="space-y-3">
                        {grouped.upcoming.map((d) => (
                          <DeadlineCard key={d.id} deadline={d} onToggleSubmitted={handleToggleSubmitted} />
                        ))}
                      </div>
                    </section>
                  )}
                  {grouped.later.length > 0 && (
                    <section>
                      <h2 className="text-[14px] font-[700] text-[#34c759] uppercase tracking-[0.5px] mb-3">
                        Later ({grouped.later.length})
                      </h2>
                      <div className="space-y-3">
                        {grouped.later.map((d) => (
                          <DeadlineCard key={d.id} deadline={d} onToggleSubmitted={handleToggleSubmitted} />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
