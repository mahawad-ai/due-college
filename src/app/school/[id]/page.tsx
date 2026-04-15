'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import MobileNav from '@/components/MobileNav';
import DeadlineTable from '@/components/DeadlineTable';
import { College, Deadline, CustomDeadline, ChecklistItem, AppStatus } from '@/lib/types';
import { getDaysRemaining, generateCalendarEvent, cn } from '@/lib/utils';

const APP_STATUS_CONFIG: Record<AppStatus, { label: string; color: string }> = {
  not_started: { label: 'Not Started', color: 'bg-[#f5f5f7] text-[#86868b]' },
  in_progress: { label: 'In Progress', color: 'bg-[#ff9f0a]/10 text-[#ff9f0a]' },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
  accepted: { label: '🎉 Accepted!', color: 'bg-[#34c759]/10 text-[#34c759]' },
  waitlisted: { label: 'Waitlisted', color: 'bg-[#ff9f0a]/10 text-[#ff9f0a]' },
  rejected: { label: 'Denied', color: 'bg-[#ff3b30]/10 text-[#ff3b30]' },
  deferred: { label: 'Deferred', color: 'bg-purple-100 text-purple-700' },
  enrolled: { label: '🎓 Enrolled', color: 'bg-[#34c759]/10 text-[#34c759]' },
};

export default function SchoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [college, setCollege] = useState<College | null>(null);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [customDeadlines, setCustomDeadlines] = useState<CustomDeadline[]>([]);
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());
  const [deadlineNotes, setDeadlineNotes] = useState<Map<string, string>>(new Map());
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [appStatus, setAppStatus] = useState<AppStatus>('not_started');
  const [collegeNotes, setCollegeNotes] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<string>('free');

  useEffect(() => {
    async function load() {
      try {
        const [collegeRes, deadlineRes] = await Promise.all([
          fetch(`/api/colleges/${id}`),
          fetch(`/api/deadlines?collegeId=${id}`),
        ]);
        const collegeData = await collegeRes.json();
        const deadlineData = await deadlineRes.json();
        setCollege(collegeData.college);
        setDeadlines(deadlineData.deadlines || []);

        if (isSignedIn) {
          const [statusRes, profileRes, customRes, checklistRes, collegeStatusRes] = await Promise.all([
            fetch(`/api/deadline-status?collegeId=${id}`),
            fetch('/api/user-profile'),
            fetch('/api/custom-deadlines'),
            fetch(`/api/document-checklist?collegeId=${id}`),
            fetch('/api/user-colleges/status'),
          ]);
          const statusData = await statusRes.json();
          const profile = await profileRes.json();
          const customData = await customRes.json();
          const checklistData = await checklistRes.json();
          const collegeStatusData = await collegeStatusRes.json();

          setSubmittedIds(new Set((statusData.submitted || []).map((s: { deadline_id: string }) => s.deadline_id)));

          const notesMap = new Map<string, string>();
          for (const s of (statusData.submitted || [])) {
            if (s.user_notes) notesMap.set(s.deadline_id, s.user_notes);
          }
          setDeadlineNotes(notesMap);
          setSubscription(profile.subscription_tier || 'free');
          setChecklist(checklistData.items || []);

          const collegeEntry = (collegeStatusData.colleges || []).find((c: { college_id: string }) => c.college_id === id);
          if (collegeEntry) {
            setAppStatus(collegeEntry.app_status || 'not_started');
            setCollegeNotes(collegeEntry.college_notes || '');
          }

          const collegeCustom = (customData.deadlines || []).filter(
            (d: CustomDeadline) => d.college_id === id || d.college_name === collegeData.college?.name
          );
          setCustomDeadlines(collegeCustom);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isSignedIn]);

  async function handleToggleSubmitted(deadlineId: string, submitted: boolean, isCustom?: boolean) {
    if (isCustom) {
      await fetch('/api/custom-deadlines', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deadlineId, is_submitted: submitted }),
      });
    } else {
      await fetch('/api/deadline-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deadlineId, submitted }),
      });
    }
  }

  function handleDownloadCalendar(deadline: Deadline) {
    if (!college) return;
    const ics = generateCalendarEvent({
      college: college.name,
      type: deadline.type,
      date: deadline.date,
      time: deadline.time || undefined,
    });
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${college.name.replace(/\s+/g, '-')}-${deadline.type}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleCustomSaved(deadline: CustomDeadline) {
    setCustomDeadlines((prev) => {
      const idx = prev.findIndex((d) => d.id === deadline.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = deadline;
        return next;
      }
      return [...prev, deadline];
    });
  }

  function handleCustomDeleted(id: string) {
    setCustomDeadlines((prev) => prev.filter((d) => d.id !== id));
  }

  async function toggleChecklistItem(itemId: string, completed: boolean) {
    await fetch('/api/document-checklist', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: itemId, completed }) });
    setChecklist(prev => prev.map(item => item.id === itemId ? { ...item, completed, completed_at: completed ? new Date().toISOString() : null } : item));
  }

  async function updateAppStatus(status: AppStatus) {
    setAppStatus(status);
    await fetch('/api/user-colleges/status', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ college_id: id, app_status: status }) });
  }

  async function saveCollegeNotes() {
    setEditingNotes(false);
    await fetch('/api/user-colleges/status', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ college_id: id, college_notes: collegeNotes }) });
  }

  const completedChecklist = checklist.filter(i => i.completed).length;
  const progressPct = checklist.length > 0 ? Math.round((completedChecklist / checklist.length) * 100) : 0;

  const allDeadlines = [...deadlines, ...customDeadlines.map((d) => ({ ...d, date: d.due_date }))];
  const soonestDeadline = allDeadlines
    .map((d) => ({ ...d, days: getDaysRemaining(d.date) }))
    .filter((d) => d.days >= 0)
    .sort((a, b) => a.days - b.days)[0];

  const canExportCalendar = subscription === 'plus' || subscription === 'family';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!college) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🏫</div>
          <h2 className="text-xl font-[800] text-[#1d1d1f] mb-2">School not found</h2>
          <p className="text-[#86868b] mb-4">This college isn&apos;t in our database yet.</p>
          <a href="mailto:hello@due.college?subject=Add college request" className="text-[#ff3b30] font-medium hover:underline">
            Request this school →
          </a>
        </div>
      </main>
    );
  }

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white pt-[90px] pb-28">
        <div className="max-w-container mx-auto px-4 py-6">
          {/* Back */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-[#86868b] hover:text-[#1d1d1f] text-sm font-medium mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </Link>

          {/* College Header */}
          <div className="bg-[#f5f5f7] rounded-2xl p-6 mb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4 flex-1">
                {/* University logo */}
                {(() => {
                  const domain = college.website
                    ? college.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
                    : null;
                  const initial = college.name.charAt(0).toUpperCase();
                  return domain ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#1d1d1f] flex items-center justify-center shrink-0 shadow-sm">
                      <img
                        src={`https://logo.clearbit.com/${domain}`}
                        alt={college.name}
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          const t = e.currentTarget;
                          t.style.display = 'none';
                          const fb = t.parentElement;
                          if (fb) fb.innerHTML = `<span style="color:white;font-size:22px;font-weight:800;">${initial}</span>`;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-[#1d1d1f] flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-white text-[22px] font-[800]">{initial}</span>
                    </div>
                  );
                })()}
                <div>
                  <h1 className="text-2xl font-[800] text-[#1d1d1f] tracking-tight mb-1">{college.name}</h1>
                  {college.city && <p className="text-[#86868b]">{college.city}, {college.state}</p>}
                </div>
              </div>
              {isSignedIn && (
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0', APP_STATUS_CONFIG[appStatus].color)}>
                  {APP_STATUS_CONFIG[appStatus].label}
                </span>
              )}
            </div>
            {isSignedIn && checklist.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-[#86868b] mb-1">
                  <span>Application progress</span>
                  <span>{completedChecklist}/{checklist.length} items · {progressPct}%</span>
                </div>
                <div className="h-2 bg-[#e8e8ed] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff3b30] rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-3 mt-4">
              {college.website && <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline font-medium">Visit website →</a>}
              {college.common_app && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">Common App</span>}
            </div>
          </div>

          {/* Application Status */}
          {isSignedIn && (
            <div className="bg-[#f5f5f7] rounded-2xl p-4 mb-4">
              <p className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-3">Application Status</p>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(APP_STATUS_CONFIG) as [AppStatus, { label: string; color: string }][]).map(([status, cfg]) => (
                  <button key={status} onClick={() => updateAppStatus(status)} className={cn('text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors', appStatus === status ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]' : 'bg-white text-[#86868b] border-[#e8e8ed] hover:border-[#1d1d1f]')}>
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* College Notes */}
          {isSignedIn && (
            <div className="bg-[#f5f5f7] rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b]">My Notes</p>
                {!editingNotes && <button onClick={() => setEditingNotes(true)} className="text-xs text-[#ff3b30] font-medium hover:opacity-70">{collegeNotes ? 'Edit' : '+ Add'}</button>}
              </div>
              {editingNotes ? (
                <div className="space-y-2">
                  <textarea value={collegeNotes} onChange={e => setCollegeNotes(e.target.value)} placeholder="Why you love this school, financial aid notes, visit impressions..." rows={3} className="w-full text-sm px-3 py-2 border border-[#e8e8ed] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1d1d1f]/20 focus:border-[#1d1d1f] resize-none bg-white" />
                  <div className="flex gap-2">
                    <button onClick={saveCollegeNotes} className="text-xs bg-[#ff3b30] text-white font-[600] px-4 py-1.5 rounded-xl hover:opacity-85">Save</button>
                    <button onClick={() => setEditingNotes(false)} className="text-xs text-[#86868b] px-3 py-1.5">Cancel</button>
                  </div>
                </div>
              ) : collegeNotes ? (
                <p className="text-sm text-[#1d1d1f]">{collegeNotes}</p>
              ) : (
                <p className="text-sm text-[#86868b] italic">No notes yet.</p>
              )}
            </div>
          )}

          {/* Document Checklist */}
          {isSignedIn && checklist.length > 0 && (
            <div className="bg-[#f5f5f7] rounded-2xl p-4 mb-4">
              <p className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-3">Document Checklist</p>
              <div className="space-y-2">
                {checklist.map(item => (
                  <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={item.completed} onChange={e => toggleChecklistItem(item.id, e.target.checked)} className="w-4 h-4 rounded border-[#e8e8ed] text-[#1d1d1f] focus:ring-[#1d1d1f]/20 cursor-pointer" />
                    <span className={cn('text-sm flex-1', item.completed ? 'line-through text-[#86868b]' : 'text-[#1d1d1f] group-hover:text-[#1d1d1f]')}>{item.item}</span>
                    {item.completed && <span className="text-xs text-[#34c759] font-medium">✓</span>}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Deadline Table */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-[800] text-[#1d1d1f] tracking-tight">
                Application Deadlines
                {(deadlines.length + customDeadlines.length) > 0 && (
                  <span className="ml-2 text-sm font-normal text-[#86868b]">
                    ({deadlines.length + customDeadlines.length} total)
                  </span>
                )}
              </h2>
            </div>

            {(deadlines.length > 0 || customDeadlines.length > 0) ? (
              <DeadlineTable
                deadlines={deadlines}
                customDeadlines={customDeadlines}
                collegeName={college.name}
                collegeId={id}
                submittedIds={submittedIds}
                deadlineNotes={deadlineNotes}
                onToggleSubmitted={isSignedIn ? handleToggleSubmitted : undefined}
                onDownloadCalendar={handleDownloadCalendar}
                onCustomDeadlineSaved={handleCustomSaved}
                onCustomDeadlineDeleted={handleCustomDeleted}
                canExportCalendar={canExportCalendar}
                showAddButton={!!isSignedIn}
              />
            ) : (
              <div className="bg-[#f5f5f7] rounded-2xl p-6 text-center text-[#86868b]">
                No deadlines on record for this school.
                {isSignedIn && (
                  <DeadlineTable
                    deadlines={[]}
                    customDeadlines={[]}
                    collegeName={college.name}
                    collegeId={id}
                    onCustomDeadlineSaved={handleCustomSaved}
                    onCustomDeadlineDeleted={handleCustomDeleted}
                    showAddButton
                  />
                )}
              </div>
            )}
          </div>

          {/* Calendar export upgrade prompt */}
          {!canExportCalendar && isSignedIn && deadlines.length > 0 && (
            <div className="bg-[#ff9f0a]/10 border border-[#ff9f0a]/20 rounded-2xl p-4 mb-6">
              <p className="text-sm font-medium text-[#1d1d1f]">
                📅 Upgrade to Plus to export deadlines to Google Calendar
              </p>
              <Link href="/upgrade" className="text-sm text-[#ff3b30] font-semibold hover:underline mt-1 block">
                Upgrade for $4.99/month →
              </Link>
            </div>
          )}

          {/* Affiliate Section */}
          {soonestDeadline && (
            <div className="bg-[#f5f5f7] rounded-2xl p-5">
              <h3 className="font-[800] text-[#1d1d1f] mb-3 text-sm tracking-tight">Resources</h3>
              {soonestDeadline.days > 30 && (
                <a
                  href="https://magoosh.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white rounded-xl hover:bg-[#e8e8ed] transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#1d1d1f]">Still need SAT prep?</p>
                    <p className="text-xs text-[#86868b]">Affordable online prep that works</p>
                  </div>
                  <span className="text-sm font-bold text-[#ff3b30]">Magoosh →</span>
                </a>
              )}
              {soonestDeadline.days <= 30 && soonestDeadline.days > 7 && (
                <a
                  href="https://prompt.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white rounded-xl hover:bg-[#e8e8ed] transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#1d1d1f]">
                      {college.name} {soonestDeadline.type} is in {soonestDeadline.days} days. Need essay help?
                    </p>
                    <p className="text-xs text-[#86868b]">Expert essay coaches and feedback</p>
                  </div>
                  <span className="text-sm font-bold text-[#ff3b30]">Prompt →</span>
                </a>
              )}
              {soonestDeadline.days <= 7 && soonestDeadline.days >= 0 && (
                <a
                  href="https://collegevine.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-[#ff3b30]/5 rounded-xl hover:bg-[#ff3b30]/10 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#1d1d1f]">
                      Last-minute essay review — {soonestDeadline.days} day{soonestDeadline.days !== 1 ? 's' : ''} left
                    </p>
                    <p className="text-xs text-[#86868b]">Free peer reviews + expert feedback</p>
                  </div>
                  <span className="text-sm font-bold text-[#ff3b30]">CollegeVine →</span>
                </a>
              )}
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </>
  );
}
