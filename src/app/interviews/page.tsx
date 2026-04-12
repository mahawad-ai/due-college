'use client';

import { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';
import { Interview, InterviewFormat, InterviewStatus } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';

const FORMAT_CONFIG: Record<InterviewFormat, { label: string; emoji: string }> = {
  virtual: { label: 'Virtual', emoji: '💻' },
  in_person: { label: 'In Person', emoji: '🏫' },
  phone: { label: 'Phone', emoji: '📞' },
  unknown: { label: 'TBD', emoji: '❓' },
};

const STATUS_CONFIG: Record<InterviewStatus, { label: string; color: string }> = {
  invited: { label: 'Invited', color: 'bg-yellow-100 text-yellow-700' },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed ✓', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500' },
};

const EMPTY = { college_name: '', interview_date: '', format: 'unknown' as InterviewFormat, interviewer_name: '', status: 'invited' as InterviewStatus, prep_notes: '', outcome_notes: '' };

export default function InterviewsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push('/login'); return; }
    fetch('/api/interviews').then(r => r.json()).then(d => { setInterviews(d.interviews || []); setLoading(false); });
  }, [isLoaded, user, router]);

  function openAdd() { setForm(EMPTY); setEditingId(null); setShowForm(true); }
  function openEdit(i: Interview) {
    setForm({ college_name: i.college_name, interview_date: i.interview_date || '', format: i.format, interviewer_name: i.interviewer_name || '', status: i.status, prep_notes: i.prep_notes || '', outcome_notes: i.outcome_notes || '' });
    setEditingId(i.id); setShowForm(true);
  }

  async function handleSave() {
    if (!form.college_name) return;
    setSaving(true);
    const payload = { ...form, interview_date: form.interview_date || null, interviewer_name: form.interviewer_name || null, prep_notes: form.prep_notes || null, outcome_notes: form.outcome_notes || null };
    const method = editingId ? 'PATCH' : 'POST';
    const body = editingId ? { id: editingId, ...payload } : payload;
    const res = await fetch('/api/interviews', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (editingId) setInterviews(p => p.map(i => i.id === editingId ? data.interview : i));
    else setInterviews(p => [...p, data.interview]);
    setShowForm(false); setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/interviews?id=${id}`, { method: 'DELETE' });
    setInterviews(p => p.filter(i => i.id !== id));
  }

  async function updateStatus(id: string, status: InterviewStatus) {
    const res = await fetch('/api/interviews', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    const data = await res.json();
    setInterviews(p => p.map(i => i.id === id ? data.interview : i));
  }

  if (!isLoaded || loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-28">
        <div className="max-w-container mx-auto px-4 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Link href="/more" className="text-sm text-gray-500 hover:text-navy font-medium mb-1 block">← More</Link>
              <h1 className="text-2xl font-extrabold text-navy">Interview Tracker</h1>
              <p className="text-sm text-gray-500 mt-1">{interviews.length} interview{interviews.length !== 1 ? 's' : ''}</p>
            </div>
            <UserButton appearance={{ elements: { avatarBox: 'w-10 h-10' } }} afterSignOutUrl="/" />
          </div>

          {interviews.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🎙️</div>
              <h2 className="text-xl font-bold text-navy mb-2">Track interviews</h2>
              <p className="text-gray-500 mb-6">Log alumni interviews, admissions interviews, and your prep notes.</p>
              <button onClick={openAdd} className="inline-flex items-center gap-2 bg-coral text-white font-semibold px-6 py-3 rounded-xl hover:bg-coral/90">+ Add interview</button>
            </div>
          )}

          <div className="space-y-3 mb-4">
            {interviews.map(i => {
              const fmt = FORMAT_CONFIG[i.format];
              const sts = STATUS_CONFIG[i.status];
              const expanded = expandedId === i.id;
              return (
                <div key={i.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 cursor-pointer" onClick={() => setExpandedId(expanded ? null : i.id)}>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-navy">{i.college_name}</span>
                          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', sts.color)}>{sts.label}</span>
                          <span className="text-xs text-gray-400">{fmt.emoji} {fmt.label}</span>
                        </div>
                        {i.interview_date && <p className="text-sm text-gray-500">{formatDate(i.interview_date)}</p>}
                        {i.interviewer_name && <p className="text-xs text-gray-400 mt-0.5">with {i.interviewer_name}</p>}
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button onClick={() => openEdit(i)} className="text-xs text-blue-600 font-medium px-2 py-1 rounded hover:bg-blue-50">Edit</button>
                        <button onClick={() => handleDelete(i.id)} className="text-xs text-red-500 font-medium px-2 py-1 rounded hover:bg-red-50">Delete</button>
                      </div>
                    </div>

                    {expanded && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                        <div className="flex gap-2 flex-wrap">
                          {(['invited', 'scheduled', 'completed', 'cancelled'] as InterviewStatus[]).map(s => (
                            <button key={s} onClick={() => updateStatus(i.id, s)} className={cn('text-xs px-2.5 py-1 rounded-full border font-semibold transition-colors', i.status === s ? 'bg-navy text-white border-navy' : 'bg-white text-gray-500 border-gray-200 hover:border-navy')}>{STATUS_CONFIG[s].label}</button>
                          ))}
                        </div>
                        {i.prep_notes && (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Prep Notes</p>
                            <p className="text-sm text-gray-600">{i.prep_notes}</p>
                          </div>
                        )}
                        {i.outcome_notes && (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Outcome Notes</p>
                            <p className="text-sm text-gray-600">{i.outcome_notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {interviews.length > 0 && (
            <button onClick={openAdd} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 text-sm font-semibold hover:border-coral hover:text-coral transition-colors">+ Add interview</button>
          )}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-extrabold text-navy">{editingId ? 'Edit Interview' : 'Add Interview'}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 text-2xl">×</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">College *</label>
                  <input type="text" value={form.college_name} onChange={e => setForm(f => ({ ...f, college_name: e.target.value }))} placeholder="Harvard University" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-navy" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-navy block mb-1.5">Date</label>
                    <input type="date" value={form.interview_date} onChange={e => setForm(f => ({ ...f, interview_date: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-navy block mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as InterviewStatus }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none">
                      {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">Format</label>
                  <div className="flex gap-2">
                    {(['virtual', 'in_person', 'phone', 'unknown'] as InterviewFormat[]).map(f => (
                      <button key={f} onClick={() => setForm(fm => ({ ...fm, format: f }))} className={cn('flex-1 text-xs font-semibold py-2 rounded-xl border transition-colors', form.format === f ? 'bg-navy text-white border-navy' : 'bg-white text-gray-600 border-gray-200 hover:border-navy')}>
                        {FORMAT_CONFIG[f].emoji} {FORMAT_CONFIG[f].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">Interviewer Name</label>
                  <input type="text" value={form.interviewer_name} onChange={e => setForm(f => ({ ...f, interviewer_name: e.target.value }))} placeholder="Alumni name" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">Prep Notes</label>
                  <textarea value={form.prep_notes} onChange={e => setForm(f => ({ ...f, prep_notes: e.target.value }))} placeholder="Questions to ask, talking points..." rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">Outcome Notes</label>
                  <textarea value={form.outcome_notes} onChange={e => setForm(f => ({ ...f, outcome_notes: e.target.value }))} placeholder="How it went, follow-up actions..." rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-navy font-semibold">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.college_name} className="flex-1 py-3 rounded-xl bg-coral text-white font-semibold hover:bg-coral/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <MobileNav />
    </>
  );
}
