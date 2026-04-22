'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import CollegeLogo from '@/components/CollegeLogo';
import { NormalizedDeadline, College } from '@/lib/types';
import { cn } from '@/lib/utils';

const DEADLINE_TYPES = ['ED1', 'ED2', 'EA', 'REA', 'RD', 'FAFSA', 'Housing', 'Scholarship', 'Decision', 'Custom'];

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
  Custom: 'bg-[rgba(175,82,222,0.12)] text-[#9b59b6]',
};

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
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

// Modal for adding/editing custom deadlines
function CustomDeadlineModal({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: () => void;
  initial?: NormalizedDeadline;
}) {
  const [collegeName, setCollegeName] = useState(initial?.college_name ?? '');
  const [type, setType] = useState(initial?.type ?? 'Custom');
  const [date, setDate] = useState(initial?.date ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!collegeName || !date) { setError('College name and date are required.'); return; }
    setSaving(true);
    try {
      const body = { college_name: collegeName, type, due_date: date, notes };
      if (initial) {
        await fetch('/api/custom-deadlines', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: initial.id, ...body }),
        });
      } else {
        await fetch('/api/custom-deadlines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      onSave();
      onClose();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-[18px] font-[800] text-[#1d1d1f] mb-5">
          {initial ? 'Edit deadline' : 'Add personal deadline'}
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-1">
              School / Label
            </label>
            <input
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="e.g. MIT, Scholarship Application"
              className="w-full px-4 py-3 border-2 border-[#e8e8ed] rounded-xl text-sm focus:outline-none focus:border-[#1d1d1f]"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#e8e8ed] rounded-xl text-sm focus:outline-none focus:border-[#1d1d1f] bg-white"
              >
                {DEADLINE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#e8e8ed] rounded-xl text-sm focus:outline-none focus:border-[#1d1d1f]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-1">Notes</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
              className="w-full px-4 py-3 border-2 border-[#e8e8ed] rounded-xl text-sm focus:outline-none focus:border-[#1d1d1f]"
            />
          </div>
          {error && <p className="text-[#ff3b30] text-xs">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-[#e8e8ed] text-sm font-[600] hover:border-[#1d1d1f] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-[#1d1d1f] text-white text-sm font-[700] hover:opacity-85 transition-opacity disabled:opacity-50">
              {saving ? 'Saving…' : initial ? 'Save changes' : 'Add deadline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CollegeBucket {
  college: College | null;
  college_name: string;
  college_id: string | null;
  deadlines: NormalizedDeadline[];
  total: number;
  done: number;
  progressPct: number;
  nextDeadline: NormalizedDeadline | null;
  allDone: boolean;
  isPersonal: boolean; // custom deadlines with no matching college
}

export default function DeadlinesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [deadlines, setDeadlines] = useState<NormalizedDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hideDone, setHideDone] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<NormalizedDeadline | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/user-deadlines');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setDeadlines(data.deadlines || []);
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

  async function toggleCustom(d: NormalizedDeadline) {
    const newVal = !d.status?.submitted;
    setDeadlines((prev) =>
      prev.map((x) => x.id === d.id ? { ...x, status: { submitted: newVal, submitted_at: newVal ? new Date().toISOString() : null } } : x)
    );
    await fetch('/api/custom-deadlines', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: d.id, is_submitted: newVal }),
    });
  }

  async function deleteCustom(d: NormalizedDeadline) {
    if (!confirm(`Delete "${d.type} – ${d.college_name}"?`)) return;
    setDeadlines((prev) => prev.filter((x) => x.id !== d.id));
    await fetch(`/api/custom-deadlines?id=${d.id}`, { method: 'DELETE' });
  }

  // ── Group by college ──
  const { collegeBuckets, personalBuckets, focusDeadline, stats } = useMemo(() => {
    // Separate shared deadlines (with known college in user list) vs pure personal custom
    const collegeMap = new Map<string, NormalizedDeadline[]>();
    const personalByName = new Map<string, NormalizedDeadline[]>();

    for (const d of deadlines) {
      if (!d.is_custom || (d.is_custom && d.college_id)) {
        // Shared deadlines always have college_id. Custom with college_id → merge into that bucket.
        const key = d.college_id!;
        if (!collegeMap.has(key)) collegeMap.set(key, []);
        collegeMap.get(key)!.push(d);
      } else {
        // Custom with no college_id → personal bucket by college_name
        const key = d.college_name;
        if (!personalByName.has(key)) personalByName.set(key, []);
        personalByName.get(key)!.push(d);
      }
    }

    function makeBucket(items: NormalizedDeadline[], isPersonal: boolean): CollegeBucket {
      const total = items.length;
      const done = items.filter((d) => d.status?.submitted).length;
      const progressPct = total > 0 ? Math.round((done / total) * 100) : 0;
      const upcoming = items
        .filter((d) => !d.status?.submitted && d.daysRemaining >= 0)
        .sort((a, b) => a.daysRemaining - b.daysRemaining);
      return {
        college: items[0].college ?? null,
        college_name: items[0].college_name,
        college_id: items[0].college_id,
        deadlines: [...items].sort((a, b) => a.date.localeCompare(b.date)),
        total,
        done,
        progressPct,
        nextDeadline: upcoming[0] ?? null,
        allDone: total > 0 && done === total,
        isPersonal,
      };
    }

    const cBuckets: CollegeBucket[] = [];
    for (const [, items] of collegeMap) cBuckets.push(makeBucket(items, false));

    cBuckets.sort((a, b) => {
      if (a.allDone && !b.allDone) return 1;
      if (!a.allDone && b.allDone) return -1;
      return (a.nextDeadline?.daysRemaining ?? 999) - (b.nextDeadline?.daysRemaining ?? 999);
    });

    const pBuckets: CollegeBucket[] = [];
    for (const [, items] of personalByName) pBuckets.push(makeBucket(items, true));
    pBuckets.sort((a, b) => (a.nextDeadline?.daysRemaining ?? 999) - (b.nextDeadline?.daysRemaining ?? 999));

    const focus = deadlines
      .filter((d) => !d.status?.submitted && d.daysRemaining >= 0)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)[0] ?? null;

    const doneCount = deadlines.filter((d) => d.status?.submitted).length;

    return {
      collegeBuckets: cBuckets,
      personalBuckets: pBuckets,
      focusDeadline: focus,
      stats: { totalCount: deadlines.length, doneCount, schoolsCount: cBuckets.length },
    };
  }, [deadlines]);

  const visibleCollegeBuckets = hideDone ? collegeBuckets.filter((b) => !b.allDone) : collegeBuckets;

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
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-[13px] text-[#1d1d1f]">
                <input
                  type="checkbox"
                  checked={hideDone}
                  onChange={(e) => setHideDone(e.target.checked)}
                  className="accent-[#ff3b30]"
                />
                Hide completed schools
              </label>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-[#1d1d1f] text-white text-[13px] font-[600] rounded-xl hover:opacity-85 transition-opacity"
              >
                + Add personal deadline
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-[rgba(255,59,48,0.06)] border border-[#ff3b30]/20 text-[#ff3b30] rounded-2xl p-4 mb-6 text-[13px]">
              {error}
            </div>
          )}

          {/* ── Focus banner ── */}
          {focusDeadline && (
            focusDeadline.is_custom && !focusDeadline.college_id ? (
              <div className="block mb-8 bg-[#1d1d1f] rounded-[20px] p-7 sm:p-8">
                <div className="flex items-center justify-between gap-6 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-[700] tracking-[0.8px] uppercase text-[#ff3b30] mb-2">
                      Next up — across all deadlines
                    </p>
                    <h2 className="text-[22px] sm:text-[26px] font-[700] tracking-[-0.4px] text-white leading-[1.2] mb-1">
                      {focusDeadline.type} &middot; {focusDeadline.college_name}
                    </h2>
                    <p className="text-[13px] text-white/55">
                      Due {formatDateShort(focusDeadline.date)}
                      {focusDeadline.daysRemaining === 0 ? ' — today' : focusDeadline.daysRemaining === 1 ? ' — 1 day away' : ` — ${focusDeadline.daysRemaining} days away`}
                    </p>
                  </div>
                  <div className="text-[54px] sm:text-[64px] font-[900] tracking-[-2px] text-white/12 leading-none shrink-0">
                    {focusDeadline.daysRemaining === 0 ? 'today' : `${focusDeadline.daysRemaining}d`}
                  </div>
                </div>
              </div>
            ) : (
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
                      {focusDeadline.type} &middot; {focusDeadline.college_name}
                    </h2>
                    <p className="text-[13px] text-white/55">
                      Due {formatDateShort(focusDeadline.date)}
                      {focusDeadline.daysRemaining === 0 ? ' — today' : focusDeadline.daysRemaining === 1 ? ' — 1 day away' : ` — ${focusDeadline.daysRemaining} days away`}
                    </p>
                  </div>
                  <div className="text-[54px] sm:text-[64px] font-[900] tracking-[-2px] text-white/12 leading-none shrink-0">
                    {focusDeadline.daysRemaining === 0 ? 'today' : `${focusDeadline.daysRemaining}d`}
                  </div>
                </div>
              </Link>
            )
          )}

          {/* ── Empty state ── */}
          {collegeBuckets.length === 0 && personalBuckets.length === 0 && (
            <div className="bg-[#f5f5f7] rounded-2xl p-12 text-center">
              <h2 className="text-[20px] font-[700] text-[#1d1d1f] mb-2">No deadlines yet</h2>
              <p className="text-[#86868b] mb-6">Add your colleges to start tracking deadlines, or add a personal deadline above.</p>
              <Link
                href="/discover/search"
                className="inline-block bg-[#ff3b30] hover:bg-[#e6352b] text-white px-6 py-3 rounded-xl font-[600] text-[14px] transition-colors no-underline"
              >
                Browse Colleges
              </Link>
            </div>
          )}

          {/* ── College grid ── */}
          {collegeBuckets.length > 0 && (
            <>
              {collegeBuckets.length > 0 && visibleCollegeBuckets.length === 0 ? (
                <div className="bg-[#f5f5f7] rounded-2xl p-8 text-center text-[14px] text-[#86868b] mb-8">
                  All schools complete. Uncheck &ldquo;Hide completed schools&rdquo; to show them.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                  {visibleCollegeBuckets.map((b) => {
                    const days = b.nextDeadline?.daysRemaining ?? Infinity;
                    const u = urgencyClasses(days);
                    const ringColor = b.allDone ? '#34c759' : '#ff3b30';
                    return (
                      <Link
                        key={b.college_id}
                        href={`/school/${b.college_id}`}
                        className={cn(
                          'group block bg-white border border-[#e8e8ed] rounded-[20px] p-5 no-underline',
                          'hover:border-[#1d1d1f] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:-translate-y-[1px]',
                          'transition-all duration-200',
                          b.allDone && 'opacity-85',
                          u.tile
                        )}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <CollegeLogo name={b.college_name} website={b.college?.website ?? null} size="md" />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-[15px] font-[700] text-[#1d1d1f] leading-tight tracking-[-0.2px] truncate">
                              {b.college_name}
                            </h3>
                            {(b.college?.city || b.college?.state) && (
                              <p className="text-[12px] text-[#86868b] mt-0.5 truncate">
                                {[b.college?.city, b.college?.state].filter(Boolean).join(', ')}
                              </p>
                            )}
                          </div>
                          <ProgressRing pct={b.progressPct} color={ringColor} />
                        </div>

                        {b.nextDeadline ? (
                          <div className={cn('rounded-[12px] px-3.5 py-3 mb-3', days <= 7 ? 'bg-[rgba(255,59,48,0.08)]' : 'bg-[#f5f5f7]')}>
                            <p className={cn('text-[10px] font-[700] uppercase tracking-[0.7px] mb-1', days <= 7 ? 'text-[#ff3b30]' : 'text-[#86868b]')}>
                              Next deadline
                            </p>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={cn('inline-block text-[10px] font-[700] px-2 py-[3px] rounded-full tracking-[0.3px]', TYPE_BADGE[b.nextDeadline.type] ?? 'bg-[#e8e8ed] text-[#1d1d1f]')}>
                                {b.nextDeadline.type}
                              </span>
                              <span className="text-[12px] text-[#86868b]">{formatDateShort(b.nextDeadline.date)}</span>
                            </div>
                            <span className={cn('inline-block text-[11px] font-[700] px-2 py-[3px] rounded-full', u.pill)}>
                              {days === 0 ? 'Due today' : days === 1 ? '1 day' : `${days} days`}
                            </span>
                          </div>
                        ) : (
                          <div className="rounded-[12px] px-3.5 py-3 mb-3 bg-[rgba(52,199,89,0.08)]">
                            <p className="text-[10px] font-[700] uppercase tracking-[0.7px] mb-1 text-[#34c759]">All steps complete</p>
                            <p className="text-[13px] font-[600] text-[#1d1d1f]">Nothing outstanding</p>
                          </div>
                        )}

                        <div className="h-[4px] bg-[#e8e8ed] rounded-full overflow-hidden mb-3">
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${b.progressPct}%`, backgroundColor: b.allDone ? '#34c759' : '#ff3b30' }} />
                        </div>

                        <div className="flex items-center justify-between text-[12px]">
                          <span className="text-[#86868b] font-[500]">{b.done} of {b.total} done</span>
                          <span className="text-[#ff3b30] font-[600] group-hover:translate-x-[2px] transition-transform">Open →</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* ── Personal Deadlines ── */}
          {personalBuckets.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[20px] font-[700] tracking-[-0.3px] text-[#1d1d1f]">Personal Deadlines</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-[13px] text-[#ff3b30] font-[600] hover:opacity-70"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-3">
                {personalBuckets.map((b) => (
                  <div key={b.college_name} className="bg-white border border-[#e8e8ed] rounded-2xl overflow-hidden">
                    {/* Bucket header */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f0f0f0]">
                      <div className="w-8 h-8 bg-[rgba(175,82,222,0.1)] rounded-lg flex items-center justify-center text-[14px]">📋</div>
                      <div className="flex-1">
                        <p className="text-[14px] font-[700] text-[#1d1d1f]">{b.college_name}</p>
                        <p className="text-[12px] text-[#86868b]">{b.done} of {b.total} done</p>
                      </div>
                      <div className="h-[4px] w-16 bg-[#e8e8ed] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#9b59b6]" style={{ width: `${b.progressPct}%` }} />
                      </div>
                    </div>
                    {/* Deadline rows */}
                    <div className="divide-y divide-[#f5f5f7]">
                      {b.deadlines.map((d) => {
                        const submitted = !!d.status?.submitted;
                        const u = urgencyClasses(d.daysRemaining);
                        return (
                          <div key={d.id} className="flex items-center gap-3 px-5 py-3">
                            <button
                              onClick={() => toggleCustom(d)}
                              className={cn(
                                'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                                submitted ? 'bg-[#34c759] border-[#34c759]' : 'border-[#d1d1d6] hover:border-[#1d1d1f]'
                              )}
                            >
                              {submitted && <span className="text-white text-[10px] font-[800]">✓</span>}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={cn('text-[10px] font-[700] px-2 py-[2px] rounded-full', TYPE_BADGE[d.type] ?? 'bg-[#e8e8ed] text-[#1d1d1f]')}>
                                  {d.type}
                                </span>
                                <span className="text-[13px] text-[#1d1d1f] font-[500]">{formatDateShort(d.date)}</span>
                                {d.daysRemaining >= 0 && !submitted && (
                                  <span className={cn('text-[11px] font-[700] px-2 py-[2px] rounded-full', u.pill)}>
                                    {d.daysRemaining === 0 ? 'today' : `${d.daysRemaining}d`}
                                  </span>
                                )}
                              </div>
                              {d.notes && <p className="text-[12px] text-[#86868b] mt-0.5 truncate">{d.notes}</p>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button onClick={() => setEditTarget(d)} className="text-[12px] text-[#86868b] hover:text-[#1d1d1f] font-[500]">Edit</button>
                              <button onClick={() => deleteCustom(d)} className="text-[12px] text-[#ff3b30] hover:opacity-70 font-[500]">Delete</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty personal section prompt */}
          {personalBuckets.length === 0 && collegeBuckets.length > 0 && (
            <div className="mt-6 text-center py-6 border border-dashed border-[#e8e8ed] rounded-2xl">
              <p className="text-[14px] text-[#86868b] mb-2">Have extra deadlines? Add personal ones.</p>
              <button onClick={() => setShowAddModal(true)} className="text-[13px] text-[#ff3b30] font-[600] hover:opacity-70">
                + Add personal deadline
              </button>
            </div>
          )}
        </div>
      </main>

      {showAddModal && (
        <CustomDeadlineModal
          onClose={() => setShowAddModal(false)}
          onSave={load}
        />
      )}
      {editTarget && (
        <CustomDeadlineModal
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={load}
        />
      )}
    </>
  );
}
