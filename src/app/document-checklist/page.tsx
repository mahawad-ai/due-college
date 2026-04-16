'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import MobileNav from '@/components/MobileNav';
import { ChecklistItem } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CollegeOption {
  id: string;
  name: string;
  state: string | null;
}

export default function DocumentChecklistPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [colleges, setColleges] = useState<CollegeOption[]>([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  // Add custom item
  const [newItem, setNewItem] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push('/login'); return; }

    fetch('/api/user-colleges')
      .then(r => r.json())
      .then(d => {
        const list: CollegeOption[] = (d.userColleges || []).map(
          (uc: { college_id: string; college: { id: string; name: string; state: string | null } }) => ({
            id: uc.college.id,
            name: uc.college.name,
            state: uc.college.state,
          })
        );
        setColleges(list);
        if (list.length > 0) setSelectedCollegeId(list[0].id);
        setLoadingColleges(false);
      });
  }, [isLoaded, user, router]);

  const loadItems = useCallback(async (collegeId: string) => {
    setLoadingItems(true);
    try {
      const res = await fetch(`/api/document-checklist?collegeId=${collegeId}`);
      const data = await res.json();
      setItems(data.items || []);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCollegeId) loadItems(selectedCollegeId);
  }, [selectedCollegeId, loadItems]);

  async function toggleItem(item: ChecklistItem) {
    setToggling(item.id);
    const next = !item.completed;
    // Optimistic update
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, completed: next } : i));
    try {
      await fetch('/api/document-checklist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, completed: next }),
      });
    } catch {
      // Revert on error
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, completed: !next } : i));
    } finally {
      setToggling(null);
    }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.trim() || !selectedCollegeId) return;
    setAddingItem(true);
    try {
      const res = await fetch('/api/document-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ college_id: selectedCollegeId, item: newItem.trim() }),
      });
      const data = await res.json();
      if (data.item) {
        setItems(prev => [...prev, data.item]);
        setNewItem('');
      }
    } finally {
      setAddingItem(false);
    }
  }

  const selectedCollege = colleges.find(c => c.id === selectedCollegeId);
  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (!isLoaded || loadingColleges) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white pt-[90px] pb-28">
        <div className="max-w-container mx-auto px-4 py-6">

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <Link href="/more" className="text-sm text-[#86868b] hover:text-[#1d1d1f] font-medium mb-1 block">← More</Link>
              <h1 className="text-[40px] font-[800] tracking-[-2px] text-[#1d1d1f] leading-none">Documents</h1>
              <p className="text-sm text-[#86868b] mt-2">Track what you&apos;ve submitted per school</p>
            </div>
            <UserButton appearance={{ elements: { avatarBox: 'w-10 h-10' } }} afterSignOutUrl="/" />
          </div>

          {/* No colleges state */}
          {colleges.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📭</div>
              <h2 className="text-[20px] font-[800] text-[#1d1d1f] mb-2">No schools yet</h2>
              <p className="text-[14px] text-[#86868b] mb-6">Add colleges to your list to track documents per school.</p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 bg-[#1d1d1f] text-white font-[700] px-6 py-3 rounded-[14px] text-sm hover:opacity-85 transition-opacity"
              >
                Explore Colleges →
              </Link>
            </div>
          ) : (
            <>
              {/* College Selector */}
              <div className="mb-5">
                <label className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] block mb-2">School</label>
                <div className="flex flex-wrap gap-2">
                  {colleges.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCollegeId(c.id)}
                      className={cn(
                        'text-sm font-[600] px-4 py-2 rounded-[12px] border transition-colors',
                        selectedCollegeId === c.id
                          ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]'
                          : 'bg-[#f5f5f7] text-[#1d1d1f] border-[#e8e8ed] hover:border-[#1d1d1f]'
                      )}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress bar */}
              {selectedCollege && !loadingItems && totalCount > 0 && (
                <div className="bg-[#f5f5f7] rounded-[18px] p-4 mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-[700] text-[#1d1d1f]">{selectedCollege.name}</span>
                    <span className="text-[13px] font-[700] text-[#86868b]">
                      {completedCount}/{totalCount} done
                    </span>
                  </div>
                  <div className="h-2 bg-[#e8e8ed] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: progressPct === 100 ? '#34c759' : progressPct >= 50 ? '#ff9f0a' : '#ff3b30',
                      }}
                    />
                  </div>
                  {progressPct === 100 && (
                    <p className="text-[12px] font-[600] text-[#34c759] mt-2 text-center">
                      🎉 All documents ready for {selectedCollege.name}!
                    </p>
                  )}
                </div>
              )}

              {/* Checklist items */}
              {loadingItems ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="bg-[#f5f5f7] rounded-[20px] overflow-hidden mb-4">
                  {items.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item)}
                      disabled={toggling === item.id}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors',
                        idx < items.length - 1 ? 'border-b border-[#e8e8ed]' : '',
                        item.completed ? 'hover:bg-[#edf7f0]' : 'hover:bg-[#e8e8ed]'
                      )}
                    >
                      {/* Checkbox */}
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                          toggling === item.id
                            ? 'border-[#aeaeb2] bg-transparent'
                            : item.completed
                            ? 'border-[#34c759] bg-[#34c759]'
                            : 'border-[#aeaeb2] bg-transparent'
                        )}
                      >
                        {item.completed && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      <span
                        className={cn(
                          'flex-1 text-[14px] font-[500]',
                          item.completed ? 'line-through text-[#aeaeb2]' : 'text-[#1d1d1f]'
                        )}
                      >
                        {item.item}
                      </span>

                      {item.completed && item.completed_at && (
                        <span className="text-[11px] text-[#aeaeb2] flex-shrink-0">
                          {new Date(item.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </button>
                  ))}

                  {items.length === 0 && (
                    <div className="text-center py-8 text-[#aeaeb2] text-[14px]">
                      No items yet
                    </div>
                  )}
                </div>
              )}

              {/* Add custom item */}
              {selectedCollegeId && !loadingItems && (
                <form onSubmit={addItem} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    placeholder="Add a custom document…"
                    className="flex-1 px-4 py-3 border border-[#e8e8ed] rounded-[14px] text-[14px] text-[#1d1d1f] placeholder:text-[#aeaeb2] focus:outline-none focus:border-[#1d1d1f] bg-white transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!newItem.trim() || addingItem}
                    className="px-5 py-3 bg-[#1d1d1f] text-white text-[14px] font-[700] rounded-[14px] hover:opacity-85 disabled:opacity-40 transition-all"
                  >
                    {addingItem ? '…' : 'Add'}
                  </button>
                </form>
              )}

              <p className="text-[12px] text-[#aeaeb2] text-center mt-4">
                Documents are tracked per school. Check them off as you submit.
              </p>
            </>
          )}
        </div>
      </main>
      <MobileNav />
    </>
  );
}
