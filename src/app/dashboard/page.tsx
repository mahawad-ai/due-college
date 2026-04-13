'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DeadlineCard from '@/components/DeadlineCard';
import ConflictAlert from '@/components/ConflictAlert';
import MobileNav from '@/components/MobileNav';
import DashboardSidebar from '@/components/DashboardSidebar';
import { DeadlineWithCollege, College } from '@/lib/types';
import { getDaysRemaining, getUrgency, sortDeadlinesByUrgency, groupDeadlinesByUrgency, detectConflicts, cn } from '@/lib/utils';

type SortBy = 'date' | 'college';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [deadlines, setDeadlines] = useState<DeadlineWithCollege[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);

  // Filter / sort state
  const [filterCollege, setFilterCollege] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [showDone, setShowDone] = useState(false);

  const loadDashboard = useCallback(async () => {
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

  async function syncFromLocalStorage() {
    try {
      const saved = localStorage.getItem('selectedColleges');
      if (!saved) return;
      const colleges: College[] = JSON.parse(saved);
      if (colleges.length === 0) return;
      setSyncing(true);
      await fetch('/api/user-colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeIds: colleges.map((c) => c.id) }),
      });
      localStorage.removeItem('selectedColleges');
    } catch {}
    finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push('/login'); return; }
    syncFromLocalStorage().then(loadDashboard);
  }, [isLoaded, user, router, loadDashboard]);

  async function handleToggleSubmitted(deadlineId: string, submitted: boolean) {
    await fetch('/api/deadline-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deadlineId, submitted }),
    });
  }

  // Derived filter/sort values
  const uniqueColleges = Array.from(
    new Map(deadlines.map((d) => [d.college_id, d.college])).entries()
  ).map(([id, college]) => ({ id, name: college?.name || id }));

  const uniqueTypes = Array.from(new Set(deadlines.map((d) => d.type)));

  let filtered = deadlines.filter((d) => {
    if (!showDone && d.status?.submitted) return false;
    if (filterCollege !== 'all' && d.college_id !== filterCollege) return false;
    if (filterType !== 'all' && d.type !== filterType) return false;
    return true;
  });

  if (sortBy === 'college') {
    filtered = [...filtered].sort((a, b) =>
      (a.college?.name || '').localeCompare(b.college?.name || '')
    );
  }

  const grouped = groupDeadlinesByUrgency(filtered);
  const conflicts = detectConflicts(deadlines.filter((d) => d.daysRemaining >= 0 && d.daysRemaining <= 30));
  const nextDeadline = deadlines.find((d) => d.daysRemaining >= 0 && !d.status?.submitted);
  const uniqueCollegesCount = new Set(deadlines.map((d) => d.college_id)).size;
  const submittedCount = deadlines.filter((d) => d.status?.submitted).length;
  const hasActiveFilters = filterCollege !== 'all' || filterType !== 'all' || sortBy !== 'date';

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <DashboardSidebar />
      <main className="min-h-screen bg-gray-50 pb-24 ml-64">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <a href="/" className="text-sm font-bold text-navy tracking-tight mb-1 block">due.college</a>
              <h1 className="text-2xl font-extrabold text-navy">Your College Deadlines</h1>
              {uniqueCollegesCount > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {uniqueCollegesCount} school{uniqueCollegesCount !== 1 ? 's' : ''}
                  {nextDeadline && ` · Next in ${nextDeadline.daysRemaining} days`}
                  {submittedCount > 0 && ` · ${submittedCount} submitted`}
                </p>
              )}
            </div>
            <UserButton appearance={{ elements: { avatarBox: 'w-10 h-10' } }} afterSignOutUrl="/" />
          </div>

          {syncing && (
            <div className="bg-blue-50 text-blue-700 rounded-2xl p-3 mb-4 text-sm font-medium">
              Syncing your schools...
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-700 rounded-2xl p-3 mb-4 text-sm">{error}</div>
          )}

          {/* Activities banner */}
          <Link
            href="/activities"
            className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-4 mb-4 hover:from-purple-100 hover:to-indigo-100 transition-colors"
          >
            <div>
              <p className="text-sm font-bold text-navy">🌟 Activities & Experience</p>
              <p className="text-xs text-gray-500 mt-0.5">Track volunteering, internships, clubs & more</p>
            </div>
            <span className="text-navy text-sm font-semibold">→</span>
          </Link>

          {/* Conflict Alerts */}
          <ConflictAlert conflicts={conflicts} />

          {/* Filter / Sort bar */}
          {deadlines.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-3 mb-4">
              <div className="flex flex-wrap gap-2 items-center">
                {/* College filter */}
                {uniqueColleges.length > 1 && (
                  <select
                    value={filterCollege}
                    onChange={(e) => setFilterCollege(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-navy font-medium focus:outline-none focus:ring-1 focus:ring-navy/20"
                  >
                    <option value="all">All schools</option>
                    {uniqueColleges.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}

                {/* Type filter */}
                {uniqueTypes.length > 1 && (
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-navy font-medium focus:outline-none focus:ring-1 focus:ring-navy/20"
                  >
                    <option value="all">All types</option>
                    {uniqueTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                )}

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-navy font-medium focus:outline-none focus:ring-1 focus:ring-navy/20"
                >
                  <option value="date">Sort by date</option>
                  <option value="college">Sort by school</option>
                </select>

                {/* Show/hide done */}
                <button
                  onClick={() => setShowDone((v) => !v)}
                  className={cn(
                    'text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors',
                    showDone ? 'bg-navy text-white border-navy' : 'bg-white text-gray-500 border-gray-200 hover:border-navy'
                  )}
                >
                  {showDone ? '✓ Showing done' : 'Show done'}
                </button>

                {/* Clear filters */}
                {hasActiveFilters && (
                  <button
                    onClick={() => { setFilterCollege('all'); setFilterType('all'); setSortBy('date'); }}
                    className="text-xs text-coral font-semibold hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Empty state */}
          {deadlines.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🎓</div>
              <h2 className="text-xl font-bold text-navy mb-2">No schools added yet</h2>
              <p className="text-gray-500 mb-6">Add your colleges to see deadlines</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-coral text-white font-semibold px-6 py-3 rounded-xl hover:bg-coral/90 transition-colors"
              >
                Add Schools
              </Link>
            </div>
          )}

          {/* No results from filter */}
          {deadlines.length > 0 && filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">No deadlines match your filters.</p>
              <button
                onClick={() => { setFilterCollege('all'); setFilterType('all'); setShowDone(true); }}
                className="text-coral text-sm font-semibold mt-2 hover:underline"
              >
                Clear filters
              </button>
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
                  <DeadlineCard key={d.id} deadline={d} onToggleSubmitted={handleToggleSubmitted} />
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
                  <DeadlineCard key={d.id} deadline={d} onToggleSubmitted={handleToggleSubmitted} />
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
                  <DeadlineCard key={d.id} deadline={d} onToggleSubmitted={handleToggleSubmitted} />
                ))}
              </div>
            </section>
          )}

          {/* Actions */}
          {deadlines.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link
                href="/"
                className="flex-1 text-center py-3 rounded-xl border-2 border-gray-200 text-navy font-semibold hover:border-navy transition-colors"
              >
                + Add another school
              </Link>
              <Link
                href="/invite"
                className="flex-1 text-center py-3 rounded-xl border-2 border-coral text-coral font-semibold hover:bg-coral-light transition-colors"
              >
                Invite Parent
              </Link>
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </>
  );
}
