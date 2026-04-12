'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import DeadlineTable from '@/components/DeadlineTable';
import MobileNav from '@/components/MobileNav';
import { College, Deadline, CustomDeadline, ChecklistItem, AppStatus } from '@/lib/types';
import { getDaysRemaining, generateCalendarEvent, cn } from '@/lib/utils';

const APP_STATUS_CONFIG: Record<AppStatus, { label: string; color: string }> = {
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-500' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
  accepted: { label: '🎉 Accepted!', color: 'bg-green-100 text-green-700' },
  waitlisted: { label: 'Waitlisted', color: 'bg-orange-100 text-orange-700' },
  rejected: { label: 'Denied', color: 'bg-red-100 text-red-600' },
  deferred: { label: 'Deferred', color: 'bg-purple-100 text-purple-700' },
  enrolled: { label: '🎓 Enrolled', color: 'bg-green-200 text-green-800' },
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
        <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!college) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🏫</div>
          <h2 className="text-xl font-bold text-navy mb-2">School not found</h2>
          <p className="text-gray-500 mb-4">This college isn&apos;t in our database yet.</p>
          <a href="mailto:hello@due.college?subject=Add college request" className="text-coral font-medium hover:underline">
            Request this school →
          </a>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-24">
        <div className="max-w-container mx-auto px-4 py-6">
          {/* Back */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-navy text-sm font-medium mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </Link>

          {/* College Header */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 mb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h1 className="text-2xl font-extrabold text-navy mb-1">{college.name}</h1>
                {college.city && <p className="text-gray-500">{college.city}, {college.state}</p>}
              </div>
              {isSignedIn && (
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0', APP_STATUS_CONFIG[appStatus].color)}>
                  {APP_STATUS_CONFIG[appStatus].label}
                </span>
              )}
            </div>
            {isSignedIn && checklist.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Application progress</span>
                  <span>{completedChecklist}/{checklist.length} items · {progressPct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-coral rounded-full transition-all" style={{ width: `${progressPct}%` }} />
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
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Application Status</p>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(APP_STATUS_CONFIG) as [AppStatus, { label: string; color: string }][]).map(([status, cfg]) => (
                  <button key={status} onClick={() => updateAppStatus(status)} className={cn('text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors', appStatus === status ? 'bg-navy text-white border-navy' : 'bg-white text-gray-500 border-gray-200 hover:border-navy')}>
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* College Notes */}
          {isSignedIn && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">My Notes</p>
                {!editingNotes && <button onClick={() => setEditingNotes(true)} className="text-xs text-blue-600 font-medium hover:text-blue-800">{collegeNotes ? 'Edit' : '+ Add'}</button>}
              </div>
              {editingNotes ? (
                <div className="space-y-2">
                  <textarea value={collegeNotes} onChange={e => setCollegeNotes(e.target.value)} placeholder="Why you love this school, financial aid notes, visit impressions..." rows={3} className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy resize-none" />
                  <div className="flex gap-2">
                    <button onClick={saveCollegeNotes} className="text-xs bg-navy text-white font-semibold px-4 py-1.5 rounded-lg">Save</button>
                    <button onClick={() => setEditingNotes(false)} className="text-xs text-gray-400 px-3 py-1.5">Cancel</button>
                  </div>
                </div>
              ) : collegeNotes ? (
                <p className="text-sm text-gray-600">{collegeNotes}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">No notes yet.</p>
              )}
            </div>
          )}

          {/* Document Checklist */}
          {isSignedIn && checklist.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Document Checklist</p>
              <div className="space-y-2">
                {checklist.map(item => (
                  <label key={item.id} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked={item.completed} onChange={e => toggleChecklistItem(item.id, e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-navy focus:ring-navy/20 cursor-pointer" />
                    <span className={cn('text-sm flex-1', item.completed ? 'line-through text-gray-300' : 'text-gray-700 group-hover:text-navy')}>{item.item}</span>
                    {item.completed && <span className="text-xs text-green-500 font-medium">✓</span>}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Deadline Table */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-navy">
                Application Deadlines
                {(deadlines.length + customDeadlines.length) > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-400">
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
              <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center text-gray-500">
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
            <div className="bg-yellow-50 border border-yellow rounded-2xl p-4 mb-6">
              <p className="text-sm font-medium text-navy">
                📅 Upgrade to Plus to export deadlines to Google Calendar
              </p>
              <Link href="/upgrade" className="text-sm text-coral font-semibold hover:underline mt-1 block">
                Upgrade for $4.99/month →
              </Link>
            </div>
          )}

          {/* Affiliate Section */}
          {soonestDeadline && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-navy mb-3 text-sm">Resources</h3>
              {soonestDeadline.days > 30 && (
                <a
                  href="https://magoosh.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-navy">Still need SAT prep?</p>
                    <p className="text-xs text-gray-500">Affordable online prep that works</p>
                  </div>
                  <span className="text-sm font-bold text-coral">Magoosh →</span>
                </a>
              )}
              {soonestDeadline.days <= 30 && soonestDeadline.days > 7 && (
                <a
                  href="https://prompt.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-navy">
                      {college.name} {soonestDeadline.type} is in {soonestDeadline.days} days. Need essay help?
                    </p>
                    <p className="text-xs text-gray-500">Expert essay coaches and feedback</p>
                  </div>
                  <span className="text-sm font-bold text-coral">Prompt →</span>
                </a>
              )}
              {soonestDeadline.days <= 7 && soonestDeadline.days >= 0 && (
                <a
                  href="https://collegevine.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-navy">
                      Last-minute essay review — {soonestDeadline.days} day{soonestDeadline.days !== 1 ? 's' : ''} left
                    </p>
                    <p className="text-xs text-gray-500">Free peer reviews + expert feedback</p>
                  </div>
                  <span className="text-sm font-bold text-coral">CollegeVine →</span>
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
