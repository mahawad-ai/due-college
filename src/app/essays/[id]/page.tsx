'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Essay, EssayStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<EssayStatus, { label: string; color: string }> = {
  not_started: { label: 'Not Started', color: 'bg-[#f5f5f7] text-[#86868b]' },
  draft: { label: 'Draft', color: 'bg-[#ff9f0a]/10 text-[#ff9f0a]' },
  reviewed: { label: 'Reviewed', color: 'bg-blue-100 text-blue-700' },
  final: { label: 'Final ✓', color: 'bg-[#34c759]/10 text-[#34c759]' },
};

export default function EssayEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [essay, setEssay] = useState<Essay | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [status, setStatus] = useState<EssayStatus>('not_started');
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push('/login'); return; }
    fetch(`/api/essays?id=${id}`).then(r => r.json()).then(d => {
      if (d.essay) {
        setEssay(d.essay);
        setContent(d.essay.notes || '');
        setStatus(d.essay.status);
      }
      setLoading(false);
    });
  }, [id, isLoaded, user, router]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const wordLimit = essay?.word_limit || null;
  const overLimit = wordLimit ? wordCount > wordLimit : false;
  const nearLimit = wordLimit ? wordCount >= wordLimit * 0.9 : false;

  const save = useCallback(async (newContent: string, newStatus?: EssayStatus) => {
    setSaving(true);
    await fetch('/api/essays', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, notes: newContent, status: newStatus || status }),
    });
    setLastSaved(new Date());
    setSaving(false);
  }, [id, status]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setContent(val);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => save(val), 1500);
  }

  async function handleStatusChange(newStatus: EssayStatus) {
    setStatus(newStatus);
    await save(content, newStatus);
  }

  function autoResize() {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }

  if (!isLoaded || loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" /></div>;
  if (!essay) return <div className="min-h-screen flex items-center justify-center"><p className="text-[#86868b]">Essay not found.</p></div>;

  const cfg = STATUS_CONFIG[status];

  return (
    <main className="min-h-screen bg-white">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#e8e8ed]">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link href="/essays" className="text-sm text-[#86868b] hover:text-[#1d1d1f] font-medium flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Essays
            </Link>

            <div className="flex items-center gap-2 flex-1 justify-center">
              {/* Word count */}
              <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', overLimit ? 'bg-[#ff3b30]/10 text-[#ff3b30]' : nearLimit ? 'bg-[#ff9f0a]/10 text-[#ff9f0a]' : 'bg-[#f5f5f7] text-[#86868b]')}>
                {wordCount}{wordLimit ? `/${wordLimit}` : ''} words
              </span>
              {saving && <span className="text-xs text-[#86868b]">Saving...</span>}
              {!saving && lastSaved && <span className="text-xs text-[#34c759]">✓ Saved</span>}
            </div>

            {/* Status selector */}
            <select
              value={status}
              onChange={e => handleStatusChange(e.target.value as EssayStatus)}
              className={cn('text-xs font-semibold px-2.5 py-1 rounded-full border-0 focus:outline-none cursor-pointer', cfg.color)}
            >
              {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Essay info */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-2">
        <div className="mb-1">
          <p className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b]">
            {essay.college_name || 'Common App'} · {essay.type.replace('_', ' ')}
          </p>
        </div>
        {essay.prompt && (
          <div className="bg-[#f5f5f7] rounded-2xl p-4 mb-4">
            <p className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-1">Prompt</p>
            <p className="text-sm text-[#1d1d1f] leading-relaxed">{essay.prompt}</p>
          </div>
        )}
      </div>

      {/* Writing area */}
      <div className="max-w-2xl mx-auto px-4 pb-24">
        <div className="bg-[#f5f5f7] rounded-2xl overflow-hidden">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onInput={autoResize}
            placeholder="Start writing your essay here...&#10;&#10;Your work is automatically saved every 1.5 seconds."
            className="w-full px-6 py-5 text-base text-[#1d1d1f] leading-relaxed focus:outline-none resize-none min-h-[400px] font-serif bg-transparent"
            style={{ lineHeight: '1.8' }}
          />
        </div>

        {/* Footer stats */}
        <div className="flex justify-between items-center mt-3 px-1 text-xs text-[#86868b]">
          <span>{charCount.toLocaleString()} characters</span>
          {wordLimit && (
            <span className={cn('font-semibold', overLimit ? 'text-[#ff3b30]' : nearLimit ? 'text-[#ff9f0a]' : 'text-[#86868b]')}>
              {overLimit ? `${wordCount - wordLimit} words over limit` : `${wordLimit - wordCount} words remaining`}
            </span>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={() => save(content)}
          disabled={saving}
          className="mt-4 w-full py-3 bg-[#ff3b30] text-white font-[600] rounded-xl hover:opacity-85 disabled:opacity-50 transition-opacity"
        >
          {saving ? 'Saving...' : 'Save Now'}
        </button>
      </div>
    </main>
  );
}
