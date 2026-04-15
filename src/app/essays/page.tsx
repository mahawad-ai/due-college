'use client';

import { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import MobileNav from '@/components/MobileNav';
import CollegeLogo from '@/components/CollegeLogo';
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
  not_started: { label: 'Not Started', color: 'bg-[#f5f5f7] text-[#86868b]', dot: 'bg-[#86868b]' },
  draft: { label: 'Draft', color: 'bg-[#f5f5f7] text-[#86868b]', dot: 'bg-[#86868b]' },
  reviewed: { label: 'In Review', color: 'bg-[#ff9f0a]/10 text-[#ff9f0a]', dot: 'bg-[#ff9f0a]' },
  final: { label: 'Final', color: 'bg-[#34c759]/10 text-[#34c759]', dot: 'bg-[#34c759]' },
};

const EMPTY = { college_name: '', type: 'supplemental' as EssayType, prompt: '', word_limit: '', status: 'not_started' as EssayStatus, notes: '' };

const uniDomains: Record<string, { domain: string; color: string }> = {
  'Stanford': { domain: 'stanford.edu', color: '#8C1515' },
  'Harvard': { domain: 'harvard.edu', color: '#A51C30' },
  'MIT': { domain: 'mit.edu', color: '#750014' },
  'Yale': { domain: 'yale.edu', color: '#00356B' },
  'Princeton': { domain: 'princeton.edu', color: '#FF6900' },
  'Columbia': { domain: 'columbia.edu', color: '#003DA5' },
  'UPenn': { domain: 'upenn.edu', color: '#011F5B' },
  'Penn': { domain: 'upenn.edu', color: '#011F5B' },
  'Duke': { domain: 'duke.edu', color: '#003087' },
  'Northwestern': { domain: 'northwestern.edu', color: '#4E2A84' },
  'Michigan': { domain: 'umich.edu', color: '#00274C' },
  'Vanderbilt': { domain: 'vanderbilt.edu', color: '#866D4B' },
  'UNC': { domain: 'unc.edu', color: '#4B9CD3' },
  'Georgetown': { domain: 'georgetown.edu', color: '#041E42' },
  'Dartmouth': { domain: 'dartmouth.edu', color: '#00693E' },
  'Brown': { domain: 'brown.edu', color: '#4E3629' },
  'Cornell': { domain: 'cornell.edu', color: '#B31B1B' },
};

function getUniLogo(schoolName: string) {
  const key = Object.keys(uniDomains).find(k => schoolName?.includes(k));
  return key ? uniDomains[key] : { domain: '', color: '#1d1d1f' };
}

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

  if (!isLoaded || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-[#ff3b30] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white pt-[90px] pb-28">
        <div className="max-w-[680px] mx-auto px-6">

          {/* Hero */}
          <div className="mb-10 pt-6">
            <p className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-3">Essays</p>
            <h1 className="text-[44px] font-[800] tracking-[-2px] text-[#1d1d1f] leading-[1.05]">
              {essays.length} essay{essays.length !== 1 ? 's' : ''}.<br />
              <span className="text-[#ff3b30]">Your story.</span>
            </h1>
            <p className="text-[17px] text-[#6e6e73] mt-3">
              {finalCount} final · {essays.length - finalCount} in progress
            </p>
          </div>

          {/* Overall progress bar */}
          {essays.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between text-[12px] font-[600] text-[#86868b] mb-2">
                <span>Overall progress</span>
                <span>{finalCount}/{essays.length} final</span>
              </div>
              <div className="h-[4px] bg-[#f5f5f7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#34c759] rounded-full transition-all"
                  style={{ width: `${essays.length ? (finalCount / essays.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Empty state */}
          {essays.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-5">✍️</div>
              <h2 className="text-[22px] font-[700] text-[#1d1d1f] mb-2">Track your essays</h2>
              <p className="text-[15px] text-[#6e6e73] mb-8">Add your Common App essay and supplements for each school.</p>
              <button
                onClick={openAdd}
                className="inline-flex items-center gap-2 bg-[#ff3b30] text-white font-[600] px-6 py-3 rounded-xl hover:bg-[#ff3b30]/90 transition-opacity"
              >
                + Add first essay
              </button>
            </div>
          )}

          {/* Common App section */}
          {commonApp.length > 0 && (
            <section className="mb-8">
              <p className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-4">Common App</p>
              <div className="divide-y divide-[#e8e8ed]">
                {commonApp.map(e => (
                  <EssayRow
                    key={e.id}
                    essay={e}
                    expanded={expandedId === e.id}
                    onToggle={() => setExpandedId(expandedId === e.id ? null : e.id)}
                    onEdit={() => openEdit(e)}
                    onDelete={() => handleDelete(e.id)}
                    onStatusChange={(s) => quickStatus(e.id, s)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Supplemental section */}
          {supplemental.length > 0 && (
            <section className="mb-8">
              <p className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-4">Supplemental & Other</p>
              <div className="divide-y divide-[#e8e8ed]">
                {supplemental.map(e => (
                  <EssayRow
                    key={e.id}
                    essay={e}
                    expanded={expandedId === e.id}
                    onToggle={() => setExpandedId(expandedId === e.id ? null : e.id)}
                    onEdit={() => openEdit(e)}
                    onDelete={() => handleDelete(e.id)}
                    onStatusChange={(s) => quickStatus(e.id, s)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Add essay button */}
          {essays.length > 0 && (
            <button
              onClick={openAdd}
              className="w-full py-3 rounded-xl border border-[#d2d2d7] text-[#1d1d1f] font-[600] text-[14px] hover:bg-[#f5f5f7] transition-colors"
            >
              + Add essay
            </button>
          )}
        </div>
      </main>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[19px] font-[700] text-[#1d1d1f]">{editingId ? 'Edit Essay' : 'Add Essay'}</h2>
                <button onClick={() => setShowForm(false)} className="text-[#86868b] hover:text-[#1d1d1f] text-2xl leading-none transition-colors">×</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] block mb-2">Type</label>
                  <div className="flex flex-wrap gap-2">
                    {ESSAY_TYPES.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setForm(f => ({ ...f, type: t.value }))}
                        className={cn(
                          'text-[13px] font-[600] px-3 py-1.5 rounded-full border transition-colors',
                          form.type === t.value
                            ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]'
                            : 'bg-white text-[#6e6e73] border-[#d2d2d7] hover:border-[#1d1d1f]'
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] block mb-2">
                    College <span className="normal-case font-normal text-[#86868b]">(leave blank for Common App)</span>
                  </label>
                  <input
                    type="text"
                    value={form.college_name}
                    onChange={e => setForm(f => ({ ...f, college_name: e.target.value }))}
                    placeholder="e.g. Harvard University"
                    className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-[14px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#1d1d1f] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] block mb-2">
                    Prompt <span className="normal-case font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.prompt}
                    onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))}
                    placeholder="Paste the essay prompt here..."
                    rows={3}
                    className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-[14px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#1d1d1f] transition-colors resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] block mb-2">Word Limit</label>
                    <input
                      type="number"
                      value={form.word_limit}
                      onChange={e => setForm(f => ({ ...f, word_limit: e.target.value }))}
                      placeholder="650"
                      className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-[14px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#1d1d1f] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] block mb-2">Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm(f => ({ ...f, status: e.target.value as EssayStatus }))}
                      className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-[14px] text-[#1d1d1f] focus:outline-none focus:border-[#1d1d1f] transition-colors bg-white"
                    >
                      {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] block mb-2">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Key points, outline ideas..."
                    rows={2}
                    className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-[14px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#1d1d1f] transition-colors resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl border border-[#d2d2d7] text-[#1d1d1f] font-[600] hover:bg-[#f5f5f7] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-[#ff3b30] text-white font-[600] hover:bg-[#ff3b30]/90 disabled:opacity-50 transition-opacity"
                >
                  {saving ? 'Saving...' : editingId ? 'Save' : 'Add essay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MobileNav />
    </>
  );
}

function EssayRow({
  essay,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  essay: Essay;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (s: EssayStatus) => void;
}) {
  const cfg = STATUS_CONFIG[essay.status];
  const typeLabel = ESSAY_TYPES.find(t => t.value === essay.type)?.label || essay.type;

  // Derive a rough word count from notes or default to 0 when not tracked
  const wordCount = 0;
  const wordLimit = essay.word_limit || 650;
  const progress = Math.min((wordCount / wordLimit) * 100, 100);

  return (
    <div className="group">
      <div
        className="flex items-center gap-4 py-4 cursor-pointer hover:bg-[#f5f5f7] rounded-2xl px-3 -mx-3 transition-colors"
        onClick={onToggle}
      >
        {/* University logo badge */}
        <CollegeLogo name={essay.college_name || typeLabel} size="md" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[15px] font-[600] text-[#1d1d1f] truncate">
              {essay.college_name || 'Common App'}
            </span>
            <span className="text-[12px] text-[#86868b] flex-shrink-0">{typeLabel}</span>
          </div>
          {essay.prompt && (
            <p className="text-[13px] text-[#6e6e73] truncate mb-2">{essay.prompt}</p>
          )}
          {!essay.prompt && (
            <p className="text-[13px] text-[#86868b] italic mb-2">No prompt added</p>
          )}
          {/* Progress bar */}
          <div className="h-[4px] bg-[#f5f5f7] rounded-full overflow-hidden w-full">
            <div
              className="h-full bg-[#ff3b30] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Right side: word count + status */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-[600]', cfg.color)}>
            {cfg.label}
          </span>
          <span className="text-[12px] text-[#86868b]">{wordCount}/{wordLimit}</span>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="px-3 pb-4 -mt-1">
          <div className="bg-[#f5f5f7] rounded-2xl p-4">
            {essay.notes && (
              <p className="text-[13px] text-[#6e6e73] mb-4 leading-relaxed">{essay.notes}</p>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-[12px] text-[#86868b] font-[500] self-center">Quick status:</span>
              {(['not_started', 'draft', 'reviewed', 'final'] as EssayStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => onStatusChange(s)}
                  className={cn(
                    'text-[12px] px-3 py-1 rounded-full border transition-colors font-[600]',
                    essay.status === s
                      ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]'
                      : 'bg-white text-[#6e6e73] border-[#d2d2d7] hover:border-[#1d1d1f]'
                  )}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={onEdit}
                className="text-[13px] font-[600] text-[#1d1d1f] hover:text-[#ff3b30] transition-colors"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="text-[13px] font-[600] text-[#86868b] hover:text-[#ff3b30] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
