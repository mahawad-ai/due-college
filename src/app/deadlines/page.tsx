'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import CollegeLogo from '@/components/CollegeLogo';
import { DeadlineWithCollege, College } from '@/lib/types';
import { getDaysRemaining, getUrgency, cn } from '@/lib/utils';

interface CollegeBucket {
  college: College;
  total: number;
  done: number;
  progressPct: number;
  nextDeadline: DeadlineWithCollege | null; // earliest not-submitted deadline >= today
  allDone: boolean;
}

const TYPE_BADGE: Record<string, string> = {
  ED1: 'bg-[rgba(94,92,230,0.12)] text-[#5e5ce6]',
  ED2: 'bg-[rgba(94,92,230,0.12)] text-[#5e5ce6]',
  EA: 'bg-[rgba(255,159,10,0.12)] text-[#c77500]',
  REA: 'bg-[rgba(255,59,48,0.12)] text-[#ff3b30]',
  RD: 'bg-[rgba(52,199,89,0.15)] text-[#1e8e3e]',
  FAFSA: 'bg-[rgba(172,142,104,0.2)] text-[#6b5337]',
  Housing: 'bg-[rgba(10,132,255,0.12)] text-[#0a84ff]',
  Scholarship: 'bg-[rgba(10,132,255,0.12)] text-[#0a84ff]',
  Decision: 'bg-[#e8e8ed] text-[#1d1d1f]',
};

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function urgencyClasses(days: number): { pill: string; tile: string } {
  if (days < 0) return { pill: 'bg-[#86868b] text-white', tile: '' };
  if (days <= 7) return { pill: 'bg-[#ff3b30] text-white', tile: 'ring-1 ring-[#ff3b30]/30 bg-[rgba(255,59,48,0.025)]' };
  if (days <= 14) return { pill: 'bg-[#ff9f0a] text-white', tile: '' };
  return { pill: 'bg-[#e8e8ed] text-[#1d1d1f]', tile: '' };
}

function ProgressRing({ pct, color }: { pct: number; color: string }) {
  const CIRC = 2 * Math.PI * 16;
  const offset = CIRC * (1 - pct / 100);
  return (
    <div className="relative w-[44px] h-[44px] shrink-0">
      <svg width="44" height="44" className="-rotate-90">
        <circle cx="22" cy="22" r="16" stroke="#e8e8ed" strokeWidth="3.5" fill="none" />
        <circle
          cx="22" cy="22" r="16"
          stroke={color} strokeWidth="3.5" fill="none"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-[700] tracking-[-0.3px]">
        {pct}%
      </div>
    </div>
  );
}

export default function DeadlinesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [deadlines, setDeadlines] = useState<DeadlineWithCollege[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hideDone, setHideDone] = useState(false);

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
      setDeadlines(enriched);
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

  // ── Group by college ──
  const { buckets, focusDeadline, stats } = useMemo(() => {
    const byCollege = new Map<string, DeadlineWithCollege[]>();
    for (const d of deadlines) {
      if (!byCollege.has(d.college_id)) byCollege.set(d.college_id, []);
      byCollege.get(d.college_id)!.push(d);
    }

    const result: CollegeBucket[] = [];
    for (const [, items] of byCollege) {
      const total = items.length;
      const done = items.filter((d) => d.status?.submitted).length;
      const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
      // Next: earliest by date, not submitted, not in past
      const upcoming = items
        .filter((d) => !d.status?.submitted && d.daysRemaining >= 0)
        .sort((a, b) => a.daysRemaining - b.daysRemaining);
      const nextDeadline = upcoming[0] ?? null;
      result.push({
        college: items[0].college,
        total,
        done,
        progressPct,
        nextDeadline,
        allDone: total > 0 && done === total,
      });
    }

    // Sort: schools with urgent (next <=7d) first, then by next-date ascending, all-done last
    result.sort((a, b) => {
      if (a.allDone && !b.allDone) return 1;
      if (!a.allDone && b.allDone) return -1;
      const aDays = a.nextDeadline?.daysRemaining ?? 999;
      const bDays = b.nextDeadline?.daysRemaining ?? 999;
      return aDays - bDays;
    });

    // Focus: single most urgent next deadline across all schools
    const focus = deadlines
      .filter((d) => !d.status?.submitted && d.daysRemaining >= 0)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)[0] ?? null;

    const totalCount = deadlines.length;
    const doneCount = deadlines.filter((d) => d.status?.submitted).length;
    const schoolsCount = byCollege.size;

    return { buckets: result, focusDeadline: focus, stats: { totalCount, doneCount, schoolsCount } };
  }, [deadlines]);

  const visibleBuckets = hideDone ? buckets.filter((b) => !b.allDone) : buckets;

  if (!isLoaded || loading) {
    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-white pt-[90px] pb-28">
          <div className="max-w-6xl mx-auto px-6 flex justify-center py-24">
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
        <div className="max-w-6xl mx-auto px-6">
          {/* ── Header ── */}
          <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-[34px] font-[700] tracking-[-0.5px] text-[#1d1d1f] leading-tight">
                Your <span className="text-[#ff3b30]">Deadlines</span>
              </h1>
              <p className="text-[15px] text-[#86868b] mt-1">
                {stats.schoolsCount} schools · {stats.totalCount} deadlines · {stats.doneCount} done
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-[13px] text-[#1d1d1f]">
                <input
                  type="checkbox"
                  checked={hideDone}
                  onChange={(e) => setHideDone(e.target.checked)}
                  className="accent-[#ff3b30]"
                />
                Hide completed schools
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-[rgba(255,59,48,0.06)] border border-[#ff3b30]/20 text-[#ff3b30] rounded-2xl p-4 mb-6 text-[13px]">
              {error}
            </div>
          )}

          {/* ── Focus banner ── */}
          {focusDeadline && (
            <Link
              href={`/school/${focusDeadline.college_id}`}
              className="block mb-8 bg-[#1d1d1f] rounded-[20px] p-7 sm:p-8 no-underline group hover:bg-[#2a2a2c] transition-colors"
            >
              <div className="flex items-center justify-between gap-6 flex-wrap">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-[700] tracking-[0.8px] uppercase text-[#ff3b30] mb-2">
                    Next up — across all schools
                  </p>
                  <h2 className="text-[22px] sm:text-[26px] font-[700] tracking-[-0.4px] text-white leading-[1.2] mb-1">
                    {focusDeadline.type} &middot; {focusDeadline.college?.name}
                  </h2>
                  <p className="text-[13px] text-white/55">
                    Due {formatDateShort(focusDeadline.date)}
                    {focusDeadline.daysRemaining === 0
                      ? ' — today'
                      : focusDeadline.daysRemaining === 1
                      ? ' — 1 day away'
                      : ` — ${focusDeadline.daysRemaining} days away`}
                  </p>
                </div>
                <div className="text-[54px] sm:text-[64px] font-[900] tracking-[-2px] text-white/12 leading-none shrink-0">
                  {focusDeadline.daysRemaining === 0 ? 'today' : `${focusDeadline.daysRemaining}d`}
                </div>
              </div>
            </Link>
          )}

          {/* ── Empty state ── */}
          {buckets.length === 0 && (
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
          )}

          {/* ── All-done state when filter removes everything ── */}
          {buckets.length > 0 && visibleBuckets.length === 0 && (
            <div className="bg-[#f5f5f7] rounded-2xl p-8 text-center text-[14px] text-[#86868b]">
              All schools complete. Unchecking &ldquo;Hide completed schools&rdquo; will show them.
            </div>
          )}

          {/* ── Grid ── */}
          {visibleBuckets.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleBuckets.map((b) => {
                const days = b.nextDeadline?.daysRemaining ?? Infinity;
                const u = urgencyClasses(days);
                const ringColor = b.allDone ? '#34c759' : '#ff3b30';

                return (
                  <Link
                    key={b.college.id}
                    href={`/school/${b.college.id}`}
                    className={cn(
                      'group block bg-white border border-[#e8e8ed] rounded-[20px] p-5 no-underline',
                      'hover:border-[#1d1d1f] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:-translate-y-[1px]',
                      'transition-all duration-200',
                      b.allDone && 'opacity-85',
                      u.tile
                    )}
                  >
                    {/* Header: logo + name + ring */}
                    <div className="flex items-center gap-3 mb-4">
                      <CollegeLogo name={b.college.name} website={b.college.website} size="md" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[15px] font-[700] text-[#1d1d1f] leading-tight tracking-[-0.2px] truncate">
                          {b.college.name}
                        </h3>
                        {(b.college.city || b.college.state) && (
                          <p className="text-[12px] text-[#86868b] mt-0.5 truncate">
                            {[b.college.city, b.college.state].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                      <ProgressRing pct={b.progressPct} color={ringColor} />
                    </div>

                    {/* Next-up chip */}
                    {b.nextDeadline ? (
                      <div
                        className={cn(
                          'rounded-[12px] px-3.5 py-3 mb-3',
                          days <= 7 ? 'bg-[rgba(255,59,48,0.08)]' : 'bg-[#f5f5f7]'
                        )}
                      >
                        <p
                          className={cn(
                            'text-[10px] font-[700] uppercase tracking-[0.7px] mb-1',
                            days <= 7 ? 'text-[#ff3b30]' : 'text-[#86868b]'
                          )}
                        >
                          Next deadline
                        </p>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={cn(
                              'inline-block text-[10px] font-[700] px-2 py-[3px] rounded-full tracking-[0.3px]',
                              TYPE_BADGE[b.nextDeadline.type] ?? 'bg-[#e8e8ed] text-[#1d1d1f]'
                            )}
                          >
                            {b.nextDeadline.type}
                          </span>
                          <span className="text-[12px] text-[#86868b]">
                            {formatDateShort(b.nextDeadline.date)}
                          </span>
                        </div>
                        <span
                          className={cn(
                            'inline-block text-[11px] font-[700] px-2 py-[3px] rounded-full',
                            u.pill
                          )}
                        >
                          {days === 0
                            ? 'Due today'
                            : days === 1
                            ? '1 day'
                            : `${days} days`}
                        </span>
                      </div>
                    ) : (
                      <div className="rounded-[12px] px-3.5 py-3 mb-3 bg-[rgba(52,199,89,0.08)]">
                        <p className="text-[10px] font-[700] uppercase tracking-[0.7px] mb-1 text-[#34c759]">
                          All steps complete
                        </p>
                        <p className="text-[13px] font-[600] text-[#1d1d1f]">
                          Nothing outstanding
                        </p>
                      </div>
                    )}

                    {/* Progress bar */}
                    <div className="h-[4px] bg-[#e8e8ed] rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${b.progressPct}%`,
                          backgroundColor: b.allDone ? '#34c759' : '#ff3b30',
                        }}
                      />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#86868b] font-[500]">
                        {b.done} of {b.total} done
                      </span>
                      <span className="text-[#ff3b30] font-[600] group-hover:translate-x-[2px] transition-transform">
                        Open →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
