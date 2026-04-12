'use client';

import { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';
import { Essay, EssayType, EssayStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const ESSAY_TYPES: { value: EssayType; label: string }[] = [
  { value: 'common_app', label: 'Common App' },
  { value: 'supplemental', label: 'Supplemental' },
  { value: 'why_school', label: 'Why School' },
  { value: 'additional', label: 'Additional Info' },
  { value: 'other', label: 'Other' },
];

const STATUS_CONFIG: Record<EssayStatus, { label: string; color: string; dot: string }> = {
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-300' },
  draft: { label: 'Draft', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  reviewed: { label: 'Reviewed', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
  final: { label: 'Final ✓', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
};

const EMPTY = { college_name: '', type: 'supplemental' as EssayType, prompt: '', word_limit: '', status: 'not_started' as EssayStatus, notes: '' };

export default function EssaysPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push('/login'); return; }
    fetch('/api/essays').then(r => r.json()).then(d => { setEssays(d.essays || []); setLoading(false); });
  }, [isLoaded, user, router]);

  function openAdd() { setForm(EMPTY); setEditingId(null); setShowForm(true); }
  function openEdit(e: Essay) {
    setForm({ college_name: e.college_name || '', type: e.type, prompt: e.prompt || '', word_limit: e.word_limit?.toString() || '', status: e.status, notes: e.notes || '' });
    setEditingId(e.id); setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = { ...form, word_limit: form.word_limit ? parseInt(form.word_limit) : null, college_name: form.college_name || null, prompt: form.prompt || null, notes: form.notes || null };
    const method = editingId ? 'PATCH' : 'POST';
    const body = editingId ? { id: editingId, ...payload } : payload;
    const res = await fetch('/api/essays', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (editingId) setEssays(p => p.map(e => e.id === editingId ? data.essay : e));
    else setEssays(p => [data.essay, ...p]);
    setShowForm(false); setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/essays?id=${id}`, { method: 'DELETE' });
    setEssays(p => p.filter(e => e.id !== id));
  }

  async function quickStatus(id: string, status: EssayStatus) {
    const res = await fetch('/api/essays', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    const data = await res.json();
    setEssays(p => p.map(e => e.id === id ? data.essay : e));
  }

  const commonApp = essays.filter(e => e.type === 'common_app');
  const supplemental = essays.filter(e => e.type !== 'common_app');
  const finalCount = essays.filter(e => e.status === 'final').length;

  if (!isLoaded || loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-28">
        <div className="max-w-container mx-auto px-4 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Link href="/more" className="text-sm text-gray-500 hover:text-navy font-medium mb-1 block">← More</Link>
              <h1 className="text-2xl font-extrabold text-navy">Essay Tracker</h1>
              <p className="text-sm text-gray-500 mt-1">{essays.length} essay{essays.length !== 1 ? 's' : ''} · {finalCount} final</p>
            </div>
            <UserButton appearance={{ elements: { avatarBox: 'w-10 h-10' } }} afterSignOutUrl="/" />
          </div>

          {/* Progress bar */}
          {essays.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
              <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
                <span>Overall progress</span>
                <span>{finalCount}/{essays.length} final</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green rounded-full transition-all" style={{ width: `${essays.length ? (finalCount / essays.length) * 100 : 0}%` }} />
              </div>
              <div className="flex gap-4 mt-3">
                {(['not_started', 'draft', 'reviewed', 'final'] as EssayStatus[]).map(s => {
                  const count = essays.filter(e => e.status === s).length;
                  if (!count) return null;
                  const cfg = STATUS_CONFIG[s];
                  return <span key={s} className="flex items-center gap-1.5 text-xs text-gray-500"><span className={cn('w-2 h-2 rounded-full', cfg.dot)} />{count} {cfg.label}</span>;
                })}
              </div>
            </div>
          )}

          {essays.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">✍️</div>
              <h2 className="text-xl font-bold text-navy mb-2">Track your essays</h2>
              <p className="text-gray-500 mb-6">Add your Common App essay + supplements for each school.</p>
              <button onClick={openAdd} className="inline-flex items-center gap-2 bg-coral text-white font-semibold px-6 py-3 rounded-xl hover:bg-coral/90">+ Add first essay</button>
            </div>
          )}

          {commonApp.length > 0 && (
            <section className="mb-5">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Common App</h2>
              <div className="space-y-3">{commonApp.map(e => <EssayCard key={e.id} essay={e} expanded={expandedId === e.id} onToggle={() => setExpandedId(expandedId === e.id ? null : e.id)} onEdit={() => openEdit(e)} onDelete={() => handleDelete(e.id)} onStatusChange={(s) => quickStatus(e.id, s)} />)}</div>
            </section>
          )}

          {supplemental.length > 0 && (
            <section className="mb-5">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Supplemental & Other</h2>
              <div className="space-y-3">{supplemental.map(e => <EssayCard key={e.id} essay={e} expanded={expandedId === e.id} onToggle={() => setExpandedId(expandedId === e.id ? null : e.id)} onEdit={() => openEdit(e)} onDelete={() => handleDelete(e.id)} onStatusChange={(s) => quickStatus(e.id, s)} />)}</div>
            </section>
          )}

          {essays.length > 0 && (
            <button onClick={openAdd} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 text-sm font-semibold hover:border-coral hover:text-coral transition-colors">+ Add essay</button>
          )}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-extrabold text-navy">{editingId ? 'Edit Essay' : 'Add Essay'}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">Type *</label>
                  <div className="flex flex-wrap gap-2">
                    {ESSAY_TYPES.map(t => (
                      <button key={t.value} onClick={() => setForm(f => ({ ...f, type: t.value }))} className={cn('text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors', form.type === t.value ? 'bg-navy text-white border-navy' : 'bg-white text-gray-600 border-gray-200 hover:border-navy')}>{t.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">College <span className="text-gray-400 font-normal">(leave blank for Common App)</span></label>
                  <input type="text" value={form.college_name} onChange={e => setForm(f => ({ ...f, college_name: e.target.value }))} placeholder="e.g. Harvard University" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">Prompt <span className="text-gray-400 font-normal">(optional)</span></label>
                  <textarea value={form.prompt} onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))} placeholder="Paste the essay prompt here..." rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-navy block mb-1.5">Word Limit</label>
                    <input type="number" value={form.word_limit} onChange={e => setForm(f => ({ ...f, word_limit: e.target.value }))} placeholder="650" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-navy block mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as EssayStatus }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy bg-white">
                      {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Key points, outline ideas..." rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-navy font-semibold">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-coral text-white font-semibold hover:bg-coral/90 disabled:opacity-50">{saving ? 'Saving...' : editingId ? 'Save' : 'Add essay'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <MobileNav />
    </>
  );
}

function EssayCard({ essay, expanded, onToggle, onEdit, onDelete, onStatusChange }: { essay: Essay; expanded: boolean; onToggle: () => void; onEdit: () => void; onDelete: () => void; onStatusChange: (s: EssayStatus) => void }) {
  const cfg = STATUS_CONFIG[essay.status];
  const typeLabel = ESSAY_TYPES.find(t => t.value === essay.type)?.label || essay.type;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{typeLabel}</span>
              {essay.college_name && <span className="text-xs text-gray-500 font-medium">{essay.college_name}</span>}
              {essay.word_limit && <span className="text-xs text-gray-400">{essay.word_limit} words</span>}
            </div>
            {essay.prompt && <p className="text-sm text-gray-600 line-clamp-2 mt-1">{essay.prompt}</p>}
            {!essay.prompt && <p className="text-sm text-gray-400 italic mt-1">No prompt added</p>}
          </div>
          <span className={cn('text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0', cfg.color)}>{cfg.label}</span>
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            {essay.notes && <p className="text-sm text-gray-600 mb-3">{essay.notes}</p>}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="text-xs text-gray-400 font-medium">Quick status:</span>
              {(['not_started', 'draft', 'reviewed', 'final'] as EssayStatus[]).map(s => (
                <button key={s} onClick={() => onStatusChange(s)} className={cn('text-xs px-2 py-1 rounded-full border transition-colors font-medium', essay.status === s ? 'bg-navy text-white border-navy' : 'bg-white text-gray-500 border-gray-200 hover:border-navy')}>{STATUS_CONFIG[s].label}</button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={onEdit} className="text-xs text-blue-600 hover:text-blue-800 font-semibold">Edit</button>
              <button onClick={onDelete} className="text-xs text-red-500 hover:text-red-700 font-semibold">Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
