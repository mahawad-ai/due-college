'use client';

import { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';
import { Recommendation, RecommenderRole, RecStatus } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';

const ROLES: { value: RecommenderRole; label: string; emoji: string }[] = [
  { value: 'teacher', label: 'Teacher', emoji: '📚' },
  { value: 'counselor', label: 'Counselor', emoji: '🎓' },
  { value: 'employer', label: 'Employer', emoji: '💼' },
  { value: 'mentor', label: 'Mentor', emoji: '🤝' },
  { value: 'other', label: 'Other', emoji: '👤' },
];

const STATUS_CONFIG: Record<RecStatus, { label: string; color: string; next: RecStatus | null; nextLabel: string }> = {
  not_asked: { label: 'Not Asked', color: 'bg-gray-100 text-gray-500', next: 'asked', nextLabel: 'Mark Asked' },
  asked: { label: 'Asked', color: 'bg-yellow-100 text-yellow-700', next: 'confirmed', nextLabel: 'Mark Confirmed' },
  confirmed: { label: 'Confirmed ✓', color: 'bg-blue-100 text-blue-700', next: 'submitted', nextLabel: 'Mark Submitted' },
  submitted: { label: 'Submitted ✓✓', color: 'bg-green-100 text-green-700', next: null, nextLabel: '' },
};

const EMPTY = { recommender_name: '', recommender_role: 'teacher' as RecommenderRole, subject: '', date_asked: '', status: 'not_asked' as RecStatus, notes: '' };

export default function RecommendationsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push('/login'); return; }
    fetch('/api/recommendations').then(r => r.json()).then(d => { setRecs(d.recommendations || []); setLoading(false); });
  }, [isLoaded, user, router]);

  function openAdd() { setForm(EMPTY); setEditingId(null); setShowForm(true); }
  function openEdit(r: Recommendation) {
    setForm({ recommender_name: r.recommender_name, recommender_role: r.recommender_role, subject: r.subject || '', date_asked: r.date_asked || '', status: r.status, notes: r.notes || '' });
    setEditingId(r.id); setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = { ...form, subject: form.subject || null, date_asked: form.date_asked || null, notes: form.notes || null };
    const method = editingId ? 'PATCH' : 'POST';
    const body = editingId ? { id: editingId, ...payload } : payload;
    const res = await fetch('/api/recommendations', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (editingId) setRecs(p => p.map(r => r.id === editingId ? data.recommendation : r));
    else setRecs(p => [data.recommendation, ...p]);
    setShowForm(false); setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/recommendations?id=${id}`, { method: 'DELETE' });
    setRecs(p => p.filter(r => r.id !== id));
  }

  async function advance(rec: Recommendation) {
    const cfg = STATUS_CONFIG[rec.status];
    if (!cfg.next) return;
    const res = await fetch('/api/recommendations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: rec.id, status: cfg.next, date_asked: rec.status === 'not_asked' ? new Date().toISOString().split('T')[0] : rec.date_asked }) });
    const data = await res.json();
    setRecs(p => p.map(r => r.id === rec.id ? data.recommendation : r));
  }

  const submittedCount = recs.filter(r => r.status === 'submitted').length;

  if (!isLoaded || loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-28">
        <div className="max-w-container mx-auto px-4 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Link href="/more" className="text-sm text-gray-500 hover:text-navy font-medium mb-1 block">← More</Link>
              <h1 className="text-2xl font-extrabold text-navy">Recommendation Letters</h1>
              <p className="text-sm text-gray-500 mt-1">{recs.length} recommender{recs.length !== 1 ? 's' : ''} · {submittedCount} submitted</p>
            </div>
            <UserButton appearance={{ elements: { avatarBox: 'w-10 h-10' } }} afterSignOutUrl="/" />
          </div>

          {/* Pipeline view */}
          {recs.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {(['not_asked', 'asked', 'confirmed', 'submitted'] as RecStatus[]).map(s => {
                const count = recs.filter(r => r.status === s).length;
                const cfg = STATUS_CONFIG[s];
                return (
                  <div key={s} className="bg-white rounded-2xl border border-gray-200 p-3 text-center">
                    <div className="text-lg font-extrabold text-navy">{count}</div>
                    <div className={cn('text-xs font-semibold mt-1 px-1.5 py-0.5 rounded-full', cfg.color)}>{cfg.label.replace(' ✓', '').replace(' ✓✓', '')}</div>
                  </div>
                );
              })}
            </div>
          )}

          {recs.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📬</div>
              <h2 className="text-xl font-bold text-navy mb-2">Track your recommendations</h2>
              <p className="text-gray-500 mb-6">Most schools require 2-3 letters. Stay on top of requests and submissions.</p>
              <button onClick={openAdd} className="inline-flex items-center gap-2 bg-coral text-white font-semibold px-6 py-3 rounded-xl hover:bg-coral/90">+ Add recommender</button>
            </div>
          )}

          <div className="space-y-3 mb-4">
            {recs.map(rec => {
              const roleInfo = ROLES.find(r => r.value === rec.recommender_role);
              const cfg = STATUS_CONFIG[rec.status];
              return (
                <div key={rec.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{roleInfo?.emoji}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-navy">{rec.recommender_name}</span>
                          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', cfg.color)}>{cfg.label}</span>
                        </div>
                        <p className="text-sm text-gray-500">{roleInfo?.label}{rec.subject ? ` — ${rec.subject}` : ''}</p>
                        {rec.date_asked && <p className="text-xs text-gray-400 mt-1">Asked {formatDate(rec.date_asked)}</p>}
                        {rec.notes && <p className="text-sm text-gray-600 mt-2">{rec.notes}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      {cfg.next && (
                        <button onClick={() => advance(rec)} className="text-xs bg-navy text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-navy/90 whitespace-nowrap">{cfg.nextLabel}</button>
                      )}
                      <button onClick={() => openEdit(rec)} className="text-xs text-blue-600 font-medium px-2 py-1 rounded hover:bg-blue-50">Edit</button>
                      <button onClick={() => handleDelete(rec.id)} className="text-xs text-red-500 font-medium px-2 py-1 rounded hover:bg-red-50">Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {recs.length > 0 && (
            <button onClick={openAdd} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 text-sm font-semibold hover:border-coral hover:text-coral transition-colors">+ Add recommender</button>
          )}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-extrabold text-navy">{editingId ? 'Edit Recommender' : 'Add Recommender'}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 text-2xl">×</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">Role *</label>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map(r => (
                      <button key={r.value} onClick={() => setForm(f => ({ ...f, recommender_role: r.value }))} className={cn('flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors', form.recommender_role === r.value ? 'bg-navy text-white border-navy' : 'bg-white text-gray-600 border-gray-200 hover:border-navy')}>{r.emoji} {r.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">Name *</label>
                  <input type="text" value={form.recommender_name} onChange={e => setForm(f => ({ ...f, recommender_name: e.target.value }))} placeholder="Mr. Smith" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">Subject / Context <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="AP English, 11th Grade" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-navy block mb-1.5">Date Asked</label>
                    <input type="date" value={form.date_asked} onChange={e => setForm(f => ({ ...f, date_asked: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-navy block mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as RecStatus }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none">
                      {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Reminder notes, topics to mention..." rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-navy font-semibold">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.recommender_name} className="flex-1 py-3 rounded-xl bg-coral text-white font-semibold hover:bg-coral/90 disabled:opacity-50">{saving ? 'Saving...' : editingId ? 'Save' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <MobileNav />
    </>
  );
}
