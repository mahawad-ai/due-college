'use client';

import { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import MobileNav from '@/components/MobileNav';
import { Scholarship, ScholarshipStatus } from '@/lib/types';
import { cn, formatDate, getDaysRemaining } from '@/lib/utils';

const STATUS_CONFIG: Record<ScholarshipStatus, { label: string; color: string }> = {
  researching: { label: 'Researching', color: 'bg-[#f5f5f7] text-[#86868b]' },
  in_progress: { label: 'In Progress', color: 'bg-[#ff9f0a]/10 text-[#ff9f0a]' },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
  awarded: { label: '🏆 Awarded!', color: 'bg-[#34c759]/10 text-[#34c759]' },
  rejected: { label: 'Not Selected', color: 'bg-[#ff3b30]/10 text-[#ff3b30]' },
};

const EMPTY = { name: '', organization: '', amount: '', deadline: '', requirements: '', status: 'researching' as ScholarshipStatus, website: '', notes: '' };

export default function ScholarshipsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push('/login'); return; }
    fetch('/api/scholarships').then(r => r.json()).then(d => { setScholarships(d.scholarships || []); setLoading(false); });
  }, [isLoaded, user, router]);

  function openAdd() { setForm(EMPTY); setEditingId(null); setShowForm(true); }
  function openEdit(s: Scholarship) {
    setForm({ name: s.name, organization: s.organization || '', amount: s.amount?.toString() || '', deadline: s.deadline || '', requirements: s.requirements || '', status: s.status, website: s.website || '', notes: s.notes || '' });
    setEditingId(s.id); setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    const payload = { ...form, amount: form.amount ? parseInt(form.amount) : null, deadline: form.deadline || null, organization: form.organization || null, requirements: form.requirements || null, website: form.website || null, notes: form.notes || null };
    const method = editingId ? 'PATCH' : 'POST';
    const body = editingId ? { id: editingId, ...payload } : payload;
    const res = await fetch('/api/scholarships', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (editingId) setScholarships(p => p.map(s => s.id === editingId ? data.scholarship : s));
    else setScholarships(p => [...p, data.scholarship]);
    setShowForm(false); setSaving(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/scholarships?id=${id}`, { method: 'DELETE' });
    setScholarships(p => p.filter(s => s.id !== id));
  }

  async function updateStatus(id: string, status: ScholarshipStatus) {
    const res = await fetch('/api/scholarships', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    const data = await res.json();
    setScholarships(p => p.map(s => s.id === id ? data.scholarship : s));
  }

  const totalAwarded = scholarships.filter(s => s.status === 'awarded').reduce((sum, s) => sum + (s.amount || 0), 0);

  if (!isLoaded || loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white pt-[90px] pb-28">
        <div className="max-w-container mx-auto px-4 py-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Link href="/more" className="text-sm text-[#86868b] hover:text-[#1d1d1f] font-medium mb-1 block">← More</Link>
              <h1 className="text-[40px] font-[800] tracking-[-2px] text-[#1d1d1f] leading-none">Scholarships</h1>
              <p className="text-sm text-[#86868b] mt-2">
                {scholarships.length} scholarship{scholarships.length !== 1 ? 's' : ''}
                {totalAwarded > 0 && ` · $${totalAwarded.toLocaleString()} awarded`}
              </p>
            </div>
            <UserButton appearance={{ elements: { avatarBox: 'w-10 h-10' } }} afterSignOutUrl="/" />
          </div>

          {scholarships.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">💰</div>
              <h2 className="text-xl font-[800] text-[#1d1d1f] mb-2">Track scholarships</h2>
              <p className="text-[#86868b] mb-6">Keep track of scholarships you're applying for — deadlines, amounts, and status.</p>
              <button onClick={openAdd} className="inline-flex items-center gap-2 bg-[#ff3b30] text-white font-[600] px-6 py-3 rounded-xl hover:opacity-85">+ Add scholarship</button>
            </div>
          )}

          <div className="space-y-3 mb-4">
            {scholarships.map(s => {
              const cfg = STATUS_CONFIG[s.status];
              const days = s.deadline ? getDaysRemaining(s.deadline) : null;
              const urgent = days !== null && days >= 0 && days <= 7;
              return (
                <div key={s.id} className={cn('bg-[#f5f5f7] rounded-2xl p-4', urgent ? 'ring-1 ring-[#ff3b30]' : '')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <span className="font-[800] text-[#1d1d1f]">{s.name}</span>
                          {s.amount && <span className="ml-2 text-sm font-bold text-[#34c759]">${s.amount.toLocaleString()}</span>}
                        </div>
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0', cfg.color)}>{cfg.label}</span>
                      </div>
                      {s.organization && <p className="text-sm text-[#86868b]">{s.organization}</p>}
                      {s.deadline && (
                        <p className={cn('text-xs mt-1 font-medium', urgent ? 'text-[#ff3b30]' : 'text-[#86868b]')}>
                          Due {formatDate(s.deadline)}{days !== null && days >= 0 ? ` · ${days === 0 ? 'Today!' : `${days}d left`}` : days !== null && days < 0 ? ' · Passed' : ''}
                        </p>
                      )}
                      {s.requirements && <p className="text-sm text-[#1d1d1f] mt-2 line-clamp-2">{s.requirements}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#e8e8ed] flex-wrap">
                    <select value={s.status} onChange={e => updateStatus(s.id, e.target.value as ScholarshipStatus)} className="text-xs border border-[#e8e8ed] rounded-lg px-2 py-1.5 bg-white text-[#1d1d1f] font-medium focus:outline-none">
                      {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                    </select>
                    {s.website && <a href={s.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-medium hover:underline">Visit →</a>}
                    <button onClick={() => openEdit(s)} className="text-xs text-[#86868b] font-medium hover:text-[#1d1d1f] ml-auto">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-xs text-[#ff3b30] font-medium hover:opacity-70">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>

          {scholarships.length > 0 && (
            <button onClick={openAdd} className="w-full py-3 rounded-xl border-2 border-dashed border-[#e8e8ed] text-[#86868b] text-sm font-semibold hover:border-[#ff3b30] hover:text-[#ff3b30] transition-colors">+ Add scholarship</button>
          )}
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-[800] text-[#1d1d1f]">{editingId ? 'Edit Scholarship' : 'Add Scholarship'}</h2>
                <button onClick={() => setShowForm(false)} className="text-[#86868b] text-2xl">×</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[#1d1d1f] block mb-1.5">Scholarship Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. National Merit Scholarship" className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1d1d1f]/20 focus:border-[#1d1d1f]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-[#1d1d1f] block mb-1.5">Organization</label>
                    <input type="text" value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} placeholder="Org name" className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#1d1d1f] block mb-1.5">Amount ($)</label>
                    <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="5000" className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-sm focus:outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-[#1d1d1f] block mb-1.5">Deadline</label>
                    <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#1d1d1f] block mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ScholarshipStatus }))} className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-sm bg-white focus:outline-none">
                      {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#1d1d1f] block mb-1.5">Requirements</label>
                  <textarea value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))} placeholder="GPA 3.5+, essay required, must be enrolled..." rows={2} className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-sm focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#1d1d1f] block mb-1.5">Website</label>
                  <input type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#1d1d1f] block mb-1.5">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-sm focus:outline-none resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-[#d2d2d7] text-[#1d1d1f] font-[600]">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.name} className="flex-1 py-3 rounded-xl bg-[#ff3b30] text-white font-[600] hover:opacity-85 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <MobileNav />
    </>
  );
}
