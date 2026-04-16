'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import DeadlineCard from '@/components/DeadlineCard';
import ConflictAlert from '@/components/ConflictAlert';
import { DeadlineWithCollege } from '@/lib/types';
import { getDaysRemaining, getUrgency, sortDeadlinesByUrgency, groupDeadlinesByUrgency, detectConflicts } from '@/lib/utils';

interface ParentViewData {
  studentName: string;
  deadlines: DeadlineWithCollege[];
}

interface PulseData {
  studentName: string;
  totalColleges: number;
  totalDeadlines: number;
  submitted: number;
  progressPct: number;
  overdue: { id: string; college: string; type: string; date: string; daysOverdue: number }[];
  upcoming: { id: string; college: string; type: string; date: string; daysLeft: number }[];
  statusEmoji: string;
  statusText: string;
}

// ── Sub-components ──────────────────────────────────────────

function ProgressRing({ progress, size = 64, strokeWidth = 5 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;
  const color = progress === 100 ? '#34c759' : progress >= 50 ? '#ff9500' : '#ff3b30';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute top-0 left-0" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e8e8ed" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span className="text-[16px] font-[800] text-[#1d1d1f]">{progress}%</span>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────

export default function ParentViewPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<ParentViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneSubmitting, setPhoneSubmitting] = useState(false);
  const [phoneSuccess, setPhoneSuccess] = useState(false);

  // Pulse
  const [pulse, setPulse] = useState<PulseData | null>(null);
  const [pulseLoading, setPulseLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  // Nudge
  const [nudgingId, setNudgingId] = useState<string | null>(null);
  const [nudgeSuccess, setNudgeSuccess] = useState<string | null>(null);
  const [nudgeError, setNudgeError] = useState<string | null>(null);
  const [nudgesRemaining, setNudgesRemaining] = useState<number | null>(null);

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

  const fetchPulse = useCallback(async () => {
    setPulseLoading(true);
    try {
      const res = await fetch(`/api/parent-view/${token}/pulse`);
      if (res.ok) {
        const json = await res.json();
        setPulse(json);
        setShowPulse(true);
      }
    } catch {
      // fail silently
    } finally {
      setPulseLoading(false);
    }
  }, [token]);

  async function handleNudge(deadlineId?: string) {
    const id = deadlineId || '__general';
    setNudgingId(id);
    setNudgeError(null);
    setNudgeSuccess(null);
    try {
      const res = await fetch(`/api/parent-view/${token}/nudge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deadline_id: deadlineId || null,
          message_index: Math.floor(Math.random() * 3),
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setNudgeError(body.error || 'Failed to send nudge.');
        setNudgingId(null);
        return;
      }
      setNudgeSuccess(id);
      setNudgesRemaining(body.remaining);
      setNudgingId(null);
      setTimeout(() => setNudgeSuccess(null), 3000);
    } catch {
      setNudgeError('Network error.');
      setNudgingId(null);
    }
  }

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
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h2 className="text-xl font-[800] text-[#1d1d1f] mb-2">Link not found</h2>
          <p className="text-[#86868b]">{error || 'This parent invite link is invalid or has expired.'}</p>
        </div>
      </main>
    );
  }

  const grouped = groupDeadlinesByUrgency(data.deadlines);
  const conflicts = detectConflicts(data.deadlines.filter((d) => d.daysRemaining >= 0 && d.daysRemaining <= 30));
  const nextDeadline = data.deadlines.find((d) => d.daysRemaining >= 0);
  const uniqueColleges = new Set(data.deadlines.map((d) => d.college_id)).size;
  const firstName = data.studentName.split(' ')[0];

  return (
    <main className="min-h-screen bg-[#f5f5f7] pb-12">
      <div className="max-w-[600px] mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <a href="/" className="text-[15px] font-[800] text-[#1d1d1f] tracking-tight">
              <span>due</span>
              <span className="text-[#ff3b30]">.</span>
              <span>college</span>
            </a>
            <div className="flex items-center gap-1.5 bg-[#f5f5f7] border border-[#e8e8ed] text-[#86868b] text-[11px] font-[600] px-2.5 py-1 rounded-full">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Read-only
            </div>
          </div>
          <h1 className="text-[24px] font-[800] text-[#1d1d1f] leading-tight">
            {data.studentName}&apos;s Deadlines
          </h1>
          {uniqueColleges > 0 && (
            <p className="text-[13px] text-[#86868b] mt-1">
              {uniqueColleges} school{uniqueColleges !== 1 ? 's' : ''}
              {nextDeadline && ` · Next deadline in ${nextDeadline.daysRemaining} day${nextDeadline.daysRemaining !== 1 ? 's' : ''}`}
            </p>
          )}
        </div>

        {/* ── Action Buttons: Pulse + Nudge ──────────────── */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={fetchPulse}
            disabled={pulseLoading}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px] bg-[#1d1d1f] text-white text-[14px] font-[700] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {pulseLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>📊</span>
            )}
            {pulseLoading ? 'Loading…' : 'Pulse Brief'}
          </button>
          <button
            onClick={() => handleNudge()}
            disabled={nudgingId === '__general'}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px] bg-[#ff3b30] text-white text-[14px] font-[700] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {nudgingId === '__general' ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : nudgeSuccess === '__general' ? (
              <span>✓</span>
            ) : (
              <span>💬</span>
            )}
            {nudgingId === '__general' ? 'Sending…' : nudgeSuccess === '__general' ? 'Sent!' : `Nudge ${firstName}`}
          </button>
        </div>

        {/* Nudge feedback */}
        {nudgeError && (
          <div className="bg-[#fff5f5] border border-[#ffe0db] rounded-[14px] p-3 mb-4 text-[13px] text-[#ff3b30]">
            {nudgeError}
          </div>
        )}
        {nudgesRemaining !== null && nudgesRemaining < 3 && (
          <p className="text-[12px] text-[#aeaeb2] mb-4 text-center">
            {nudgesRemaining} nudge{nudgesRemaining !== 1 ? 's' : ''} remaining today
          </p>
        )}

        {/* ── Pulse Brief Panel ──────────────────────────── */}
        {showPulse && pulse && (
          <div className="bg-white rounded-[22px] border border-[#e5e7eb] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 mb-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-[800] text-[#1d1d1f]">
                {pulse.statusEmoji} Pulse Brief
              </h2>
              <button
                onClick={() => setShowPulse(false)}
                className="text-[#aeaeb2] hover:text-[#86868b] text-[18px] leading-none"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-5 mb-4">
              <ProgressRing progress={pulse.progressPct} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-[#1d1d1f] font-[600] mb-1">{pulse.statusText}</p>
                <p className="text-[13px] text-[#86868b]">
                  {pulse.submitted}/{pulse.totalDeadlines} deadlines submitted · {pulse.totalColleges} school{pulse.totalColleges !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Overdue warnings */}
            {pulse.overdue.length > 0 && (
              <div className="bg-[#fff5f5] border border-[#ffe0db] rounded-[14px] p-4 mb-3">
                <p className="text-[13px] font-[700] text-[#ff3b30] mb-2">
                  🚨 Past due
                </p>
                {pulse.overdue.map((d) => (
                  <div key={d.id} className="flex items-center justify-between py-1.5">
                    <span className="text-[13px] text-[#1d1d1f]">
                      {d.college} <span className="text-[#86868b]">{d.type}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[#ff3b30] font-[600]">
                        {d.daysOverdue}d overdue
                      </span>
                      <button
                        onClick={() => handleNudge(d.id)}
                        disabled={nudgingId === d.id}
                        className="text-[11px] font-[700] text-[#ff3b30] bg-[#fff0f0] px-2 py-1 rounded-[8px] hover:bg-[#ffe0db] transition-colors disabled:opacity-40"
                      >
                        {nudgingId === d.id ? '…' : nudgeSuccess === d.id ? '✓' : 'Nudge'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upcoming next */}
            {pulse.upcoming.length > 0 && (
              <div className="bg-[#f5f5f7] rounded-[14px] p-4">
                <p className="text-[13px] font-[700] text-[#1d1d1f] mb-2">
                  📅 Coming up next
                </p>
                {pulse.upcoming.map((d) => (
                  <div key={d.id} className="flex items-center justify-between py-1.5">
                    <span className="text-[13px] text-[#1d1d1f]">
                      {d.college} <span className="text-[#86868b]">{d.type}</span>
                    </span>
                    <span className="text-[12px] text-[#86868b] font-[600]">
                      {d.daysLeft}d left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conflict Alerts */}
        <ConflictAlert conflicts={conflicts} />

        {/* SMS Opt-in */}
        {!phoneSuccess ? (
          <div className="bg-white rounded-[20px] border border-[#e5e7eb] p-5 mb-6">
            <h3 className="font-[700] text-[#1d1d1f] mb-1 text-[14px]">📱 Get SMS reminders</h3>
            <p className="text-[13px] text-[#86868b] mb-3">
              Receive the same deadline reminders as {firstName} via text.
            </p>
            <form onSubmit={handleEnableSMS} className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 555-5555"
                className="flex-1 px-3 py-2.5 border border-[#e8e8ed] rounded-[12px] text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#ff3b30] transition-colors"
                required
              />
              <button
                type="submit"
                disabled={phoneSubmitting}
                className="px-4 py-2.5 bg-[#1d1d1f] text-white text-[13px] font-[700] rounded-[12px] hover:opacity-90 transition-all whitespace-nowrap disabled:opacity-50"
              >
                {phoneSubmitting ? '...' : 'Enable'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[16px] p-4 mb-6 text-[13px] text-[#166534] font-[600]">
            ✓ You&apos;ll receive SMS reminders for {firstName}&apos;s deadlines.
          </div>
        )}

        {/* ── Deadline Sections ───────────────────────────── */}

        {/* Urgent */}
        {grouped.urgent.length > 0 && (
          <section className="mb-6">
            <h2 className="text-[13px] font-[600] text-[#6e6e73] uppercase tracking-[0.05em] mb-3">
              🔴 Urgent — under 7 days
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
            <h2 className="text-[13px] font-[600] text-[#6e6e73] uppercase tracking-[0.05em] mb-3">
              🟡 Coming Up — 7 to 30 days
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
            <h2 className="text-[13px] font-[600] text-[#6e6e73] uppercase tracking-[0.05em] mb-3">
              🟢 Later — over 30 days
            </h2>
            <div className="space-y-3">
              {grouped.later.map((d) => (
                <DeadlineCard key={d.id} deadline={d} />
              ))}
            </div>
          </section>
        )}

        {data.deadlines.length === 0 && (
          <div className="text-center py-12 text-[#aeaeb2]">
            No deadlines added yet.
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-[12px] text-[#aeaeb2]">
            Powered by{' '}
            <a href="/" className="font-[700] text-[#1d1d1f]">
              due.college
            </a>{' '}
            · Free college deadline tracker
          </p>
        </div>
      </div>
    </main>
  );
}
