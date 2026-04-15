'use client';

import { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import MobileNav from '@/components/MobileNav';
import { TestScore, TestScoreType } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';

const SCORE_TYPES: { value: TestScoreType; label: string; max: number; color: string }[] = [
  { value: 'SAT', label: 'SAT Total', max: 1600, color: 'bg-blue-100 text-blue-800' },
  { value: 'SAT_Math', label: 'SAT Math', max: 800, color: 'bg-indigo-100 text-indigo-800' },
  { value: 'SAT_EBRW', label: 'SAT EBRW', max: 800, color: 'bg-indigo-100 text-indigo-800' },
  { value: 'ACT', label: 'ACT', max: 36, color: 'bg-purple-100 text-purple-800' },
  { value: 'PSAT', label: 'PSAT', max: 1520, color: 'bg-violet-100 text-violet-800' },
  { value: 'AP', label: 'AP Exam', max: 5, color: 'bg-[#34c759]/10 text-[#34c759]' },
  { value: 'IB', label: 'IB Exam', max: 7, color: 'bg-teal-100 text-teal-800' },
  { value: 'TOEFL', label: 'TOEFL', max: 120, color: 'bg-[#ff9f0a]/10 text-[#ff9f0a]' },
  { value: 'Other', label: 'Other', max: 100, color: 'bg-[#f5f5f7] text-[#86868b]' },
];

const EMPTY = { type: 'SAT' as TestScoreType, score: '', max_score: '', test_date: '', subject: '', notes: '' };

export default function TestScoresPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [scores, setScores] = useState<TestScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push('/login'); return; }
    fetch('/api/test-scores').then(r => r.json()).then(d => { setScores(d.scores || []); setLoading(false); });
  }, [isLoaded, user, router]);

  function openAdd() { setForm(EMPTY); setEditingId(null); setShowForm(true); }
  function openEdit(s: TestScore) {
    setForm({ type: s.type, score: s.score.toString(), max_score: s.max_score?.toString() || '', test_date: s.test_date || '', subject: s.subject || '', notes: s.notes || '' });
    setEditingId(s.id); setShowForm(true);
  }

  const selectedTypeInfo = SCORE_TYPES.find(t => t.value === form.type);

  async function handleSave() {
    if (!form.score) return;
    setSaving(true);
    const payload = { type: form.type, score: parseInt(form.score), max_score: form.max_score ? parseInt(form.max_score) : selectedTypeInfo?.max || null, test_date: form.test_date || null, subject: form.subject || null, notes: form.notes || null };
    const method = editingId ? 'PATCH' : 'POST';
    const body = editingId ? { id: editingId, ...payload } : payload;
    const res = await fetch('/api/test-scores', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (editingId) setScores(p => p.map(s => s.id === editingId ? data.score : s));
    else setScores(p => [data.score, ...p]);
    setShowForm(false); setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/test-scores?id=${id}`, { method: 'DELETE' });
    setScores(p => p.filter(s => s.id !== id));
  }

  // Best scores by type
  const bestSAT = Math.max(...scores.filter(s => s.type === 'SAT').map(s => s.score), 0);
  const bestACT = Math.max(...scores.filter(s => s.type === 'ACT').map(s => s.score), 0);

  // Group by type
  const grouped = SCORE_TYPES.map(t => ({ ...t, scores: scores.filter(s => s.type === t.value) })).filter(g => g.scores.length > 0);

  if (!isLoaded || loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white pt-[90px] pb-28">
        <div className="max-w-container mx-auto px-4 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Link href="/more" className="text-sm text-[#86868b] hover:text-[#1d1d1f] font-medium mb-1 block">← More</Link>
              <h1 className="text-[40px] font-[800] tracking-[-2px] text-[#1d1d1f] leading-none">Test Scores</h1>
              <p className="text-sm text-[#86868b] mt-2">{scores.length} score{scores.length !== 1 ? 's' : ''} logged</p>
            </div>
            <UserButton appearance={{ elements: { avatarBox: 'w-10 h-10' } }} afterSignOutUrl="/" />
          </div>

          {/* Best scores summary */}
          {(bestSAT > 0 || bestACT > 0) && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {bestSAT > 0 && (
                <div className="bg-[#f5f5f7] rounded-2xl p-4 text-center">
                  <p className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-1">Best SAT</p>
                  <p className="text-3xl font-[800] text-[#1d1d1f]">{bestSAT}</p>
                  <p className="text-xs text-[#86868b]">/ 1600</p>
                  <div className="mt-2 h-1.5 bg-[#e8e8ed] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(bestSAT / 1600) * 100}%` }} />
                  </div>
                </div>
              )}
              {bestACT > 0 && (
                <div className="bg-[#f5f5f7] rounded-2xl p-4 text-center">
                  <p className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-1">Best ACT</p>
                  <p className="text-3xl font-[800] text-[#1d1d1f]">{bestACT}</p>
                  <p className="text-xs text-[#86868b]">/ 36</p>
                  <div className="mt-2 h-1.5 bg-[#e8e8ed] rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(bestACT / 36) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {scores.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📊</div>
              <h2 className="text-xl font-[800] text-[#1d1d1f] mb-2">Log your test scores</h2>
              <p className="text-[#86868b] mb-6">Track SAT, ACT, AP exams, and more. See your progress over time.</p>
              <button onClick={openAdd} className="inline-flex items-center gap-2 bg-[#ff3b30] text-white font-[600] px-6 py-3 rounded-xl hover:opacity-85">+ Add score</button>
            </div>
          )}

          {grouped.map(group => (
            <section key={group.value} className="mb-5">
              <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-3">{group.label}</h2>
              <div className="space-y-2">
                {group.scores.sort((a, b) => b.score - a.score).map(s => {
                  const typeInfo = SCORE_TYPES.find(t => t.value === s.type)!;
                  const maxScore = s.max_score || typeInfo.max;
                  const pct = Math.min((s.score / maxScore) * 100, 100);
                  const isBest = group.scores[0].id === s.id;
                  return (
                    <div key={s.id} className={cn('bg-[#f5f5f7] rounded-2xl p-4', isBest ? 'ring-1 ring-[#1d1d1f]' : '')}>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', typeInfo.color)}>{s.subject || group.label}</span>
                          {isBest && <span className="text-xs font-bold text-[#1d1d1f]">Best</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-[800] text-[#1d1d1f]">{s.score}</span>
                          <span className="text-sm text-[#86868b]">/ {maxScore}</span>
                          <button onClick={() => openEdit(s)} className="text-xs text-[#86868b] font-medium px-2 py-1 rounded hover:bg-[#e8e8ed]">Edit</button>
                          <button onClick={() => handleDelete(s.id)} className="text-xs text-[#ff3b30] font-medium px-2 py-1 rounded hover:bg-[#ff3b30]/10">✕</button>
                        </div>
                      </div>
                      <div className="h-1.5 bg-[#e8e8ed] rounded-full overflow-hidden">
                        <div className="h-full bg-[#1d1d1f] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      {s.test_date && <p className="text-xs text-[#86868b] mt-1.5">{formatDate(s.test_date)}</p>}
                      {s.notes && <p className="text-xs text-[#86868b] mt-1">{s.notes}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {scores.length > 0 && (
            <button onClick={openAdd} className="w-full py-3 rounded-xl border-2 border-dashed border-[#e8e8ed] text-[#86868b] text-sm font-semibold hover:border-[#ff3b30] hover:text-[#ff3b30] transition-colors">+ Add score</button>
          )}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-[800] text-[#1d1d1f]">{editingId ? 'Edit Score' : 'Add Score'}</h2>
                <button onClick={() => setShowForm(false)} className="text-[#86868b] text-2xl">×</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[#1d1d1f] block mb-1.5">Test Type *</label>
                  <div className="flex flex-wrap gap-2">
                    {SCORE_TYPES.map(t => (
                      <button key={t.value} onClick={() => setForm(f => ({ ...f, type: t.value, max_score: t.max.toString() }))} className={cn('text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors', form.type === t.value ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]' : 'bg-white text-[#86868b] border-[#e8e8ed] hover:border-[#1d1d1f]')}>{t.label}</button>
                    ))}
                  </div>
                </div>
                {(form.type === 'AP' || form.type === 'IB' || form.type === 'Other') && (
                  <div>
                    <label className="text-sm font-semibold text-[#1d1d1f] block mb-1.5">Subject</label>
                    <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. AP Calculus BC" className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-sm focus:outline-none" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-[#1d1d1f] block mb-1.5">Score *</label>
                    <input type="number" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} placeholder={selectedTypeInfo?.max.toString()} className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#1d1d1f] block mb-1.5">Max Score</label>
                    <input type="number" value={form.max_score} onChange={e => setForm(f => ({ ...f, max_score: e.target.value }))} placeholder={selectedTypeInfo?.max.toString()} className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-sm focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#1d1d1f] block mb-1.5">Test Date</label>
                  <input type="date" value={form.test_date} onChange={e => setForm(f => ({ ...f, test_date: e.target.value }))} className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#1d1d1f] block mb-1.5">Notes</label>
                  <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Retake planned, superscore eligible..." className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-sm focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-[#d2d2d7] text-[#1d1d1f] font-[600]">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.score} className="flex-1 py-3 rounded-xl bg-[#ff3b30] text-white font-[600] hover:opacity-85 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <MobileNav />
    </>
  );
}
