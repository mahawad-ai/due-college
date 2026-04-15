'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DeadlineCard from '@/components/DeadlineCard';
import ConflictAlert from '@/components/ConflictAlert';
import MobileNav from '@/components/MobileNav';
import TopNav from '@/components/TopNav';
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-7 h-7 border-2 border-[#ff3b30] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white pb-28 pt-[90px]">
        <div className="max-w-[860px] mx-auto px-6 py-8 page-fade">

          {/* Hero */}
          <div className="mb-10">
            <p className="text-[12px] font-[600] text-[#ff3b30] tracking-[0.7px] uppercase mb-3">Application Season 2025</p>
            <h1 className="text-[44px] font-[800] tracking-[-2px] leading-[1.05] text-[#1d1d1f] mb-4">
              {user?.firstName ? `Hi, ${user.firstName}.` : 'Get in.'}<br/>
              <span className="text-[#ff3b30]">Stay on track.</span>
            </h1>
            <p className="text-[17px] text-[#6e6e73] leading-[1.55] max-w-[480px]">
              Everything you need to manage your college applications — all in one place.
            </p>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-3 md:grid-cols-5 border border-[#e8e8ed] rounded-2xl overflow-hidden mb-10">
            <div className="p-5 border-r border-[#e8e8ed] text-center">
              <div className="text-[28px] font-[800] tracking-[-1px] text-[#1d1d1f]">{uniqueCollegesCount}</div>
              <div className="text-[12px] text-[#86868b] font-[500] mt-1">Schools</div>
            </div>
            <div className="p-5 border-r border-[#e8e8ed] text-center">
              <div className="text-[28px] font-[800] tracking-[-1px] text-[#ff3b30]">{grouped.urgent.length}</div>
              <div className="text-[12px] text-[#86868b] font-[500] mt-1">Urgent</div>
            </div>
            <div className="p-5 border-r border-[#e8e8ed] text-center">
              <div className="text-[28px] font-[800] tracking-[-1px] text-[#1d1d1f]">{submittedCount}</div>
              <div className="text-[12px] text-[#86868b] font-[500] mt-1">Submitted</div>
            </div>
            <div className="p-5 border-r border-[#e8e8ed] text-center hidden md:block">
              <div className="text-[28px] font-[800] tracking-[-1px] text-[#1d1d1f]">{deadlines.length}</div>
              <div className="text-[12px] text-[#86868b] font-[500] mt-1">Deadlines</div>
            </div>
            <div className="p-5 text-center hidden md:block">
              <div className="text-[28px] font-[800] tracking-[-1px] text-[#1d1d1f]">
                {deadlines.length > 0 ? `${Math.round((submittedCount / deadlines.length) * 100)}%` : '—'}
              </div>
              <div className="text-[12px] text-[#86868b] font-[500] mt-1">Progress</div>
            </div>
          </div>

          {/* Keep syncing/error alerts */}
          {syncing && <div className="bg-[#f5f5f7] text-[#6e6e73] rounded-2xl p-3 mb-6 text-sm font-medium">Syncing your schools...</div>}
          {error && <div className="bg-red-50 text-red-700 rounded-2xl p-3 mb-6 text-sm">{error}</div>}

          {/* Conflict alert — keep as-is */}
          <ConflictAlert conflicts={conflicts} />

          {/* Next deadline hero card */}
          {nextDeadline && (
            <div className="bg-[#1d1d1f] rounded-3xl p-8 mb-6 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-[600] text-white/40 uppercase tracking-[0.6px] mb-2">Next Deadline</p>
                <h2 className="text-[24px] font-[700] text-white mb-1 tracking-[-0.5px]">
                  {nextDeadline.daysRemaining === 0 ? 'Due today —' : `${nextDeadline.daysRemaining} days until`} {nextDeadline.college?.name}
                </h2>
                <p className="text-[14px] text-white/50">{nextDeadline.type}</p>
              </div>
              <div className="text-[64px] font-[900] text-white/10 tracking-tighter">
                {nextDeadline.daysRemaining}d
              </div>
            </div>
          )}

          {/* Filter bar */}
          {deadlines.length > 0 && (
            <div className="bg-[#f5f5f7] rounded-2xl p-3 mb-6 flex flex-wrap gap-2 items-center">
              {uniqueColleges.length > 1 && (
                <select value={filterCollege} onChange={(e) => setFilterCollege(e.target.value)}
                  className="text-xs border border-[#d2d2d7] rounded-lg px-3 py-2 bg-white text-[#1d1d1f] font-medium focus:outline-none focus:ring-1 focus:ring-[#ff3b30]/30">
                  <option value="all">All schools</option>
                  {uniqueColleges.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              {uniqueTypes.length > 1 && (
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                  className="text-xs border border-[#d2d2d7] rounded-lg px-3 py-2 bg-white text-[#1d1d1f] font-medium focus:outline-none focus:ring-1 focus:ring-[#ff3b30]/30">
                  <option value="all">All types</option>
                  {uniqueTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="text-xs border border-[#d2d2d7] rounded-lg px-3 py-2 bg-white text-[#1d1d1f] font-medium focus:outline-none focus:ring-1 focus:ring-[#ff3b30]/30">
                <option value="date">Sort by date</option>
                <option value="college">Sort by school</option>
              </select>
              <button onClick={() => setShowDone((v) => !v)}
                className={cn('text-xs font-semibold px-3 py-2 rounded-lg border transition-colors',
                  showDone ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]' : 'bg-white text-[#6e6e73] border-[#d2d2d7] hover:border-[#1d1d1f]')}>
                {showDone ? '✓ Showing done' : 'Show done'}
              </button>
              {hasActiveFilters && (
                <button onClick={() => { setFilterCollege('all'); setFilterType('all'); setSortBy('date'); }}
                  className="text-xs text-[#ff3b30] font-semibold hover:underline">Clear</button>
              )}
            </div>
          )}

          {/* Empty state */}
          {deadlines.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="text-5xl mb-5">🎓</div>
              <h2 className="text-[22px] font-[700] text-[#1d1d1f] mb-2 tracking-tight">No schools added yet</h2>
              <p className="text-[#86868b] mb-8">Add your colleges to see all your deadlines</p>
              <Link href="/" className="inline-flex items-center gap-2 bg-[#ff3b30] text-white font-[600] px-6 py-3 rounded-xl hover:opacity-85 transition-opacity">
                Add Schools →
              </Link>
            </div>
          )}

          {/* No results */}
          {deadlines.length > 0 && filtered.length === 0 && (
            <div className="text-center py-10 text-[#86868b]">
              <p className="text-sm">No deadlines match your filters.</p>
              <button onClick={() => { setFilterCollege('all'); setFilterType('all'); setShowDone(true); }}
                className="text-[#ff3b30] text-sm font-semibold mt-2 hover:underline">Clear filters</button>
            </div>
          )}

          {/* Deadline groups */}
          {grouped.urgent.length > 0 && (
            <section className="mb-8">
              <h2 className="text-[11px] font-[700] text-[#ff3b30] uppercase tracking-[0.7px] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b30] inline-block"/> Act now
              </h2>
              <div className="space-y-3">{grouped.urgent.map((d) => <DeadlineCard key={d.id} deadline={d} onToggleSubmitted={handleToggleSubmitted} />)}</div>
            </section>
          )}
          {grouped.upcoming.length > 0 && (
            <section className="mb-8">
              <h2 className="text-[11px] font-[700] text-[#ff9f0a] uppercase tracking-[0.7px] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff9f0a] inline-block"/> Coming up
              </h2>
              <div className="space-y-3">{grouped.upcoming.map((d) => <DeadlineCard key={d.id} deadline={d} onToggleSubmitted={handleToggleSubmitted} />)}</div>
            </section>
          )}
          {grouped.later.length > 0 && (
            <section className="mb-8">
              <h2 className="text-[11px] font-[700] text-[#34c759] uppercase tracking-[0.7px] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] inline-block"/> Plenty of time
              </h2>
              <div className="space-y-3">{grouped.later.map((d) => <DeadlineCard key={d.id} deadline={d} onToggleSubmitted={handleToggleSubmitted} />)}</div>
            </section>
          )}

          {/* Actions */}
          {deadlines.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-8 border-t border-[#e8e8ed]">
              <Link href="/" className="flex-1 text-center py-3 rounded-xl border border-[#d2d2d7] text-[#1d1d1f] font-[600] hover:border-[#1d1d1f] transition-colors text-sm">
                + Add another school
              </Link>
              <Link href="/circle" className="flex-1 text-center py-3 rounded-xl border border-[#ff3b30] text-[#ff3b30] font-[600] hover:bg-[rgba(255,59,48,0.05)] transition-colors text-sm">
                Your Circle →
              </Link>
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </>
  );
}
