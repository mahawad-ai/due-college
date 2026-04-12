'use client';

import { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';
import { AppStatus } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';

interface CollegeWithStatus {
  id: string;
  college_id: string;
  app_status: AppStatus;
  college_notes: string | null;
  decision_date: string | null;
  added_at: string;
  college: { id: string; name: string; city: string | null; state: string | null };
}

const STATUS_CONFIG: Record<AppStatus, { label: string; color: string; bg: string; emoji: string }> = {
  not_started: { label: 'Not Started', color: 'text-gray-500', bg: 'bg-gray-100', emoji: '○' },
  in_progress: { label: 'In Progress', color: 'text-yellow-700', bg: 'bg-yellow-100', emoji: '✏️' },
  submitted: { label: 'Submitted', color: 'text-blue-700', bg: 'bg-blue-100', emoji: '📤' },
  accepted: { label: 'Accepted!', color: 'text-green-700', bg: 'bg-green-100', emoji: '🎉' },
  waitlisted: { label: 'Waitlisted', color: 'text-orange-700', bg: 'bg-orange-100', emoji: '⏳' },
  rejected: { label: 'Denied', color: 'text-red-600', bg: 'bg-red-100', emoji: '✕' },
  deferred: { label: 'Deferred', color: 'text-purple-700', bg: 'bg-purple-100', emoji: '↩️' },
  enrolled: { label: 'Enrolled ✓', color: 'text-green-800', bg: 'bg-green-200', emoji: '🎓' },
};

export default function DecisionsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [colleges, setColleges] = useState<CollegeWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ app_status: 'not_started' as AppStatus, college_notes: '', decision_date: '' });

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push('/login'); return; }
    fetch('/api/user-colleges/status').then(r => r.json()).then(d => { setColleges(d.colleges || []); setLoading(false); });
  }, [isLoaded, user, router]);

  async function updateStatus(collegeId: string, updates: { app_status?: AppStatus; college_notes?: string; decision_date?: string }) {
    await fetch('/api/user-colleges/status', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ college_id: collegeId, ...updates }) });
    setColleges(p => p.map(c => c.college_id === collegeId ? { ...c, ...updates } : c));
  }

  function openEdit(c: CollegeWithStatus) {
    setEditForm({ app_status: c.app_status || 'not_started', college_notes: c.college_notes || '', decision_date: c.decision_date || '' });
    setEditingId(c.college_id);
  }

  async function saveEdit() {
    if (!editingId) return;
    await updateStatus(editingId, { app_status: editForm.app_status, college_notes: editForm.college_notes || null as unknown as string, decision_date: editForm.decision_date || null as unknown as string });
    setEditingId(null);
  }

  const stats = {
    applied: colleges.filter(c => ['submitted', 'accepted', 'waitlisted', 'rejected', 'deferred', 'enrolled'].includes(c.app_status)).length,
    accepted: colleges.filter(c => c.app_status === 'accepted' || c.app_status === 'enrolled').length,
    waitlisted: colleges.filter(c => c.app_status === 'waitlisted').length,
    rejected: colleges.filter(c => c.app_status === 'rejected').length,
    enrolled: colleges.filter(c => c.app_status === 'enrolled').length,
  };

  if (!isLoaded || loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-28">
        <div className="max-w-container mx-auto px-4 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Link href="/more" className="text-sm text-gray-500 hover:text-navy font-medium mb-1 block">← More</Link>
              <h1 className="text-2xl font-extrabold text-navy">Decision Board</h1>
              <p className="text-sm text-gray-500 mt-1">{colleges.length} school{colleges.length !== 1 ? 's' : ''} · {stats.applied} applied</p>
            </div>
            <UserButton appearance={{ elements: { avatarBox: 'w-10 h-10' } }} afterSignOutUrl="/" />
          </div>

          {/* Stats */}
          {colleges.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[
                { label: 'Applied', value: stats.applied, color: 'text-blue-700' },
                { label: 'Accepted', value: stats.accepted, color: 'text-green-700' },
                { label: 'Waitlist', value: stats.waitlisted, color: 'text-orange-600' },
                { label: 'Enrolled', value: stats.enrolled, color: 'text-navy' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-3 text-center">
                  <div className={cn('text-xl font-extrabold', s.color)}>{s.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {colleges.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-xl font-bold text-navy mb-2">Decision Board</h2>
              <p className="text-gray-500 mb-4">Add schools to your dashboard first, then track decisions here.</p>
              <Link href="/" className="inline-flex items-center gap-2 bg-coral text-white font-semibold px-6 py-3 rounded-xl hover:bg-coral/90">Add Schools</Link>
            </div>
          )}

          {/* College cards */}
          <div className="space-y-3">
            {colleges.map(c => {
              const cfg = STATUS_CONFIG[c.app_status || 'not_started'];
              return (
                <div key={c.id} className={cn('bg-white rounded-2xl border p-4', c.app_status === 'accepted' || c.app_status === 'enrolled' ? 'border-green' : 'border-gray-200')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-lg font-extrabold text-navy">{c.college?.name}</span>
                        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', cfg.bg, cfg.color)}>{cfg.emoji} {cfg.label}</span>
                      </div>
                      {c.college?.city && <p className="text-xs text-gray-400">{c.college.city}, {c.college.state}</p>}
                      {c.decision_date && <p className="text-xs text-gray-400 mt-1">Decision: {formatDate(c.decision_date)}</p>}
                      {c.college_notes && <p className="text-sm text-gray-600 mt-2">{c.college_notes}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button onClick={() => openEdit(c)} className="text-xs text-blue-600 font-medium px-2 py-1 rounded hover:bg-blue-50">Edit</button>
                      <Link href={`/school/${c.college_id}`} className="text-xs text-gray-400 font-medium px-2 py-1 rounded hover:bg-gray-50 text-center">Deadlines</Link>
                    </div>
                  </div>

                  {/* Quick status change */}
                  <div className="flex gap-1.5 mt-3 pt-3 border-t border-gray-100 overflow-x-auto">
                    {(['not_started', 'in_progress', 'submitted', 'accepted', 'waitlisted', 'rejected', 'deferred', 'enrolled'] as AppStatus[]).map(s => (
                      <button key={s} onClick={() => updateStatus(c.college_id, { app_status: s })} className={cn('flex-shrink-0 text-xs px-2 py-1 rounded-full border font-semibold transition-colors', c.app_status === s ? 'bg-navy text-white border-navy' : 'bg-white text-gray-400 border-gray-200 hover:border-navy hover:text-navy')}>
                        {STATUS_CONFIG[s].emoji}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {editingId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-extrabold text-navy">Update Status</h2>
                <button onClick={() => setEditingId(null)} className="text-gray-400 text-2xl">×</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">Application Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(STATUS_CONFIG) as [AppStatus, typeof STATUS_CONFIG[AppStatus]][]).map(([v, cfg]) => (
                      <button key={v} onClick={() => setEditForm(f => ({ ...f, app_status: v }))} className={cn('flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors', editForm.app_status === v ? 'border-navy bg-navy text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
                        {cfg.emoji} {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">Decision Date</label>
                  <input type="date" value={editForm.decision_date} onChange={e => setEditForm(f => ({ ...f, decision_date: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">Notes</label>
                  <textarea value={editForm.college_notes} onChange={e => setEditForm(f => ({ ...f, college_notes: e.target.value }))} placeholder="Financial aid amount, why you love it..." rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setEditingId(null)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-navy font-semibold">Cancel</button>
                <button onClick={saveEdit} className="flex-1 py-3 rounded-xl bg-coral text-white font-semibold hover:bg-coral/90">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <MobileNav />
    </>
  );
}
