'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DeadlineCard from '@/components/DeadlineCard';
import ConflictAlert from '@/components/ConflictAlert';
import MobileNav from '@/components/MobileNav';
import TopNav from '@/components/TopNav';
import { DeadlineWithCollege, College, CircleData } from '@/lib/types';
import { getDaysRemaining, getUrgency, sortDeadlinesByUrgency, groupDeadlinesByUrgency, detectConflicts, cn } from '@/lib/utils';

type SortBy = 'date' | 'college';

const AVATAR_COLORS = ['#ff3b30', '#5e5ce6', '#30d158', '#0a84ff', '#ff9f0a', '#ac8e68'];

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [deadlines, setDeadlines] = useState<DeadlineWithCollege[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [circleData, setCircleData] = useState<CircleData | null>(null);
  const [essayStats, setEssayStats] = useState<{ total: number; done: number } | null>(null);

  // Filter / sort state
  const [filterCollege, setFilterCollege] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [showDone, setShowDone] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [deadlineRes, circleRes, essayRes] = await Promise.all([
        fetch('/api/user-deadlines'),
        fetch('/api/circle').catch(() => null),
        fetch('/api/essays').catch(() => null),
      ]);

      if (!deadlineRes.ok) throw new Error('Failed to load');
      const data = await deadlineRes.json();
      const enriched: DeadlineWithCollege[] = (data.deadlines || []).map((d: DeadlineWithCollege) => {
        const days = getDaysRemaining(d.date);
        return { ...d, daysRemaining: days, urgency: getUrgency(days) };
      });
      setDeadlines(sortDeadlinesByUrgency(enriched));

      if (circleRes?.ok) {
        const cd = await circleRes.json();
        setCircleData(cd);
      }

      if (essayRes?.ok) {
        const ed = await essayRes.json();
        const essays = ed.essays || [];
        setEssayStats({
          total: essays.length,
          done: essays.filter((e: { status: string }) => e.status === 'final').length,
        });
      }
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
    finally { setSyncing(false); }
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

  // Derived
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
    filtered = [...filtered].sort((a, b) => (a.college?.name || '').localeCompare(b.college?.name || ''));
  }

  const grouped = groupDeadlinesByUrgency(filtered);
  const conflicts = detectConflicts(deadlines.filter((d) => d.daysRemaining >= 0 && d.daysRemaining <= 30));
  const nextDeadline = deadlines.find((d) => d.daysRemaining >= 0 && !d.status?.submitted);
  const uniqueCollegesCount = new Set(deadlines.map((d) => d.college_id)).size;
  const submittedCount = deadlines.filter((d) => d.status?.submitted).length;
  const hasActiveFilters = filterCollege !== 'all' || filterType !== 'all' || sortBy !== 'date';

  // Circle latest activity
  const latestActivity = circleData?.activities?.[0];
  const members = circleData?.members ?? [];

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

          {/* ── Hero ── */}
          <div className="mb-10">
            <p className="text-[12px] font-[600] text-[#ff3b30] tracking-[0.7px] uppercase mb-3">Application Season 2025</p>
            <h1 className="text-[44px] font-[800] tracking-[-2px] leading-[1.05] text-[#1d1d1f] mb-4">
              {user?.firstName ? `Hi, ${user.firstName}.` : 'Get in.'}<br/>
              <span className="text-[#ff3b30]">Stay on track.</span>
            </h1>
            <p className="text-[17px] text-[#6e6e73] leading-[1.55] max-w-[480px] mb-6">
              Everything you need to manage your college applications — all in one place.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link href="/deadlines"
                className="text-[14px] font-[600] text-[#ff3b30] hover:opacity-75 transition-opacity">
                View deadlines →
              </Link>
              <Link href="/profile"
                className="text-[13px] font-[500] text-[#1d1d1f] border border-[#d2d2d7] px-4 py-2 rounded-full hover:border-[#1d1d1f] transition-colors no-underline">
                Update profile
              </Link>
            </div>
          </div>

          {/* ── Stat strip ── */}
          <div className="grid grid-cols-3 md:grid-cols-5 border border-[#e8e8ed] rounded-2xl overflow-hidden mb-8">
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

          {/* ── Circle activity strip ── */}
          {(members.length > 0 || latestActivity) && (
            <div className="border border-[#e8e8ed] rounded-2xl px-5 py-3.5 mb-8 flex items-center gap-4 flex-wrap">
              <span className="text-[11px] font-[700] text-[#86868b] uppercase tracking-[0.6px] shrink-0">Circle</span>
              {/* Avatars */}
              <div className="flex -space-x-2">
                {members.slice(0, 5).map((m, i) => (
                  <div
                    key={m.id}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-[700] text-white ring-2 ring-white shrink-0"
                    style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  >
                    {m.avatar_url
                      ? <img src={m.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                      : (m.display_name || 'A').charAt(0).toUpperCase()
                    }
                  </div>
                ))}
              </div>
              {/* Divider */}
              <div className="w-px h-4 bg-[#e8e8ed] shrink-0 hidden sm:block" />
              {/* Latest activity */}
              {latestActivity && (
                <p className="text-[13px] text-[#6e6e73] flex-1 min-w-0 truncate">
                  {latestActivity.activity_type === 'streak' ? '🔥' :
                   latestActivity.activity_type === 'essay_done' ? '✍️' :
                   latestActivity.activity_type === 'submitted' ? '🎉' : '📚'}{' '}
                  <strong className="text-[#1d1d1f]">{latestActivity.display_name}</strong>{' '}
                  {latestActivity.content}
                </p>
              )}
              <Link href="/circle"
                className="text-[13px] font-[600] text-[#ff3b30] hover:opacity-75 transition-opacity shrink-0 no-underline whitespace-nowrap">
                See Circle →
              </Link>
            </div>
          )}

          {/* ── Feature cards grid ── */}
          {deadlines.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Dark deadlines card */}
              <Link href="/deadlines"
                className="bg-[#1d1d1f] rounded-3xl p-8 flex flex-col justify-between no-underline group overflow-hidden relative"
                style={{ minHeight: 220 }}>
                <div>
                  <p className="text-[11px] font-[700] text-white/40 uppercase tracking-[0.6px] mb-3">Deadlines</p>
                  <h3 className="text-[22px] font-[700] text-white tracking-[-0.5px] mb-2 leading-tight">
                    {nextDeadline
                      ? `${nextDeadline.daysRemaining === 0 ? 'Due today —' : `${nextDeadline.daysRemaining} days until`} ${nextDeadline.college?.name}.`
                      : 'All caught up.'}
                  </h3>
                  <p className="text-[13px] text-white/50 leading-relaxed">
                    Don&apos;t miss your most important deadlines. We&apos;ll track every one.
                  </p>
                </div>
                <div className="flex items-end justify-between mt-6">
                  <span className="text-[13px] font-[600] text-[#ff3b30] group-hover:opacity-75 transition-opacity">View all deadlines →</span>
                  <span className="text-[64px] font-[900] text-white/10 tracking-tighter leading-none">
                    {nextDeadline ? `${nextDeadline.daysRemaining}d` : '✓'}
                  </span>
                </div>
              </Link>

              {/* Light essays card */}
              <Link href="/essays"
                className="bg-[#f5f5f7] rounded-3xl p-8 flex flex-col justify-between no-underline group overflow-hidden relative"
                style={{ minHeight: 220 }}>
                <div>
                  <p className="text-[11px] font-[700] text-[#86868b] uppercase tracking-[0.6px] mb-3">Essays</p>
                  <h3 className="text-[22px] font-[700] text-[#1d1d1f] tracking-[-0.5px] mb-2 leading-tight">
                    Your story, perfectly told.
                  </h3>
                  <p className="text-[13px] text-[#6e6e73] leading-relaxed">
                    Track every essay across every school. Know exactly where you stand.
                  </p>
                </div>
                <div className="flex items-end justify-between mt-6">
                  <span className="text-[13px] font-[600] text-[#ff3b30] group-hover:opacity-75 transition-opacity">Continue writing →</span>
                  <span className="text-[64px] font-[900] text-[#d2d2d7] tracking-tighter leading-none">
                    {essayStats ? (essayStats.total > 0 ? `${essayStats.done}/${essayStats.total}` : '—') : '—'}
                  </span>
                </div>
              </Link>
            </div>
          )}

          {syncing && <div className="bg-[#f5f5f7] text-[#6e6e73] rounded-2xl p-3 mb-6 text-sm font-medium">Syncing your schools...</div>}
          {error && <div className="bg-red-50 text-red-700 rounded-2xl p-3 mb-6 text-sm">{error}</div>}
          <ConflictAlert conflicts={conflicts} />

          {/* ── Filter bar ── */}
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

          {/* ── Empty state ── */}
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

          {deadlines.length > 0 && filtered.length === 0 && (
            <div className="text-center py-10 text-[#86868b]">
              <p className="text-sm">No deadlines match your filters.</p>
              <button onClick={() => { setFilterCollege('all'); setFilterType('all'); setShowDone(true); }}
                className="text-[#ff3b30] text-sm font-semibold mt-2 hover:underline">Clear filters</button>
            </div>
          )}

          {/* ── Deadline groups ── */}
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

          {/* ── Bottom actions ── */}
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
