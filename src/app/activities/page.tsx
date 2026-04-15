'use client';

import { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import MobileNav from '@/components/MobileNav';
import { Activity, ActivityType } from '@/lib/types';
import { formatDate, cn } from '@/lib/utils';

const ACTIVITY_TYPES: { value: ActivityType; label: string; emoji: string; color: string }[] = [
  { value: 'volunteering', label: 'Volunteering', emoji: '🤝', color: 'bg-green-100 text-green-800' },
  { value: 'internship', label: 'Internship', emoji: '💼', color: 'bg-blue-100 text-blue-800' },
  { value: 'work', label: 'Work / Job', emoji: '💰', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'extracurricular', label: 'Extracurricular', emoji: '🎭', color: 'bg-purple-100 text-purple-800' },
  { value: 'research', label: 'Research', emoji: '🔬', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'award', label: 'Award / Honor', emoji: '🏆', color: 'bg-orange-100 text-orange-800' },
  { value: 'other', label: 'Other', emoji: '⭐', color: 'bg-gray-100 text-gray-700' },
];

// Which activity types are considered "high impact" for display
const HIGH_IMPACT_TYPES: ActivityType[] = ['internship', 'research', 'award'];

const EMPTY_FORM = {
  type: 'volunteering' as ActivityType,
  title: '',
  organization: '',
  role: '',
  start_date: '',
  end_date: '',
  is_ongoing: false,
  hours_per_week: '',
  description: '',
};

export default function ActivitiesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all');

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push('/login'); return; }
    loadActivities();
  }, [isLoaded, user, router]);

  async function loadActivities() {
    setLoading(true);
    try {
      const res = await fetch('/api/activities');
      const data = await res.json();
      setActivities(data.activities || []);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(activity: Activity) {
    setForm({
      type: activity.type,
      title: activity.title,
      organization: activity.organization,
      role: activity.role || '',
      start_date: activity.start_date,
      end_date: activity.end_date || '',
      is_ongoing: activity.is_ongoing,
      hours_per_week: activity.hours_per_week?.toString() || '',
      description: activity.description || '',
    });
    setEditingId(activity.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title || !form.organization || !form.start_date) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        hours_per_week: form.hours_per_week ? parseInt(form.hours_per_week) : null,
        end_date: form.is_ongoing ? null : (form.end_date || null),
      };

      if (editingId) {
        const res = await fetch('/api/activities', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
        const data = await res.json();
        setActivities((prev) => prev.map((a) => a.id === editingId ? data.activity : a));
      } else {
        const res = await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        setActivities((prev) => [data.activity, ...prev]);
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/activities?id=${id}`, { method: 'DELETE' });
      setActivities((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  function getTypeInfo(type: ActivityType) {
    return ACTIVITY_TYPES.find((t) => t.value === type) || ACTIVITY_TYPES[ACTIVITY_TYPES.length - 1];
  }

  function formatDateRange(activity: Activity) {
    const start = formatDate(activity.start_date);
    if (activity.is_ongoing) return `${start} – Present`;
    if (activity.end_date) return `${start} – ${formatDate(activity.end_date)}`;
    return start;
  }

  const totalHours = activities
    .filter((a) => a.hours_per_week)
    .reduce((sum, a) => sum + (a.hours_per_week || 0), 0);

  const filtered = filterType === 'all' ? activities : activities.filter((a) => a.type === filterType);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-[#ff3b30] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white pt-[90px] pb-28">
        <div className="max-w-[680px] mx-auto px-6">

          {/* Hero */}
          <div className="mb-10 pt-6">
            <p className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-3">Activities</p>
            <h1 className="text-[44px] font-[800] tracking-[-2px] text-[#1d1d1f] leading-[1.05]">
              {activities.length} activit{activities.length !== 1 ? 'ies' : 'y'}.<br />
              <span className="text-[#ff3b30]">Your story.</span>
            </h1>
            <p className="text-[17px] text-[#6e6e73] mt-3">
              {totalHours > 0 ? `~${totalHours} hrs/week across all activities` : 'Add your extracurriculars, jobs, and honors.'}
            </p>
          </div>

          {/* Filter chips */}
          {activities.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
              <button
                onClick={() => setFilterType('all')}
                className={cn(
                  'flex-shrink-0 text-[13px] font-[600] px-3.5 py-1.5 rounded-full border transition-colors',
                  filterType === 'all'
                    ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]'
                    : 'bg-white text-[#6e6e73] border-[#d2d2d7] hover:border-[#1d1d1f]'
                )}
              >
                All ({activities.length})
              </button>
              {ACTIVITY_TYPES.filter((t) => activities.some((a) => a.type === t.value)).map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  className={cn(
                    'flex-shrink-0 text-[13px] font-[600] px-3.5 py-1.5 rounded-full border transition-colors whitespace-nowrap',
                    filterType === type.value
                      ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]'
                      : 'bg-white text-[#6e6e73] border-[#d2d2d7] hover:border-[#1d1d1f]'
                  )}
                >
                  {type.emoji} {type.label} ({activities.filter((a) => a.type === type.value).length})
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {activities.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-5">🌟</div>
              <h2 className="text-[22px] font-[700] text-[#1d1d1f] mb-2">Track your experiences</h2>
              <p className="text-[15px] text-[#6e6e73] mb-2">Add volunteering, internships, clubs, research, and more.</p>
              <p className="text-[13px] text-[#86868b] mb-8">Colleges look at activities outside the classroom.</p>
              <button
                onClick={openAdd}
                className="inline-flex items-center gap-2 bg-[#ff3b30] text-white font-[600] px-6 py-3 rounded-xl hover:bg-[#ff3b30]/90 transition-opacity"
              >
                + Add first activity
              </button>
            </div>
          )}

          {/* Numbered activity list */}
          {filtered.length > 0 && (
            <div className="mb-8 divide-y divide-[#e8e8ed]">
              {filtered.map((activity, index) => {
                const info = getTypeInfo(activity.type);
                const isHighImpact = HIGH_IMPACT_TYPES.includes(activity.type);

                return (
                  <div key={activity.id} className="flex items-center gap-4 py-4 group hover:bg-[#f5f5f7] rounded-2xl px-3 -mx-3 transition-colors">
                    {/* Drag handle */}
                    <span className="text-[18px] text-[#d2d2d7] select-none flex-shrink-0 cursor-grab">⠿</span>

                    {/* Rank number */}
                    <span className="text-[13px] font-[700] text-[#d2d2d7] w-6 flex-shrink-0 text-center">
                      {index + 1}
                    </span>

                    {/* Activity info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-[15px] font-[600] text-[#1d1d1f] truncate">{activity.title}</span>
                      </div>
                      <p className="text-[13px] text-[#86868b] truncate">
                        {activity.organization}
                        {activity.role ? ` · ${activity.role}` : ''}
                        {' · '}
                        {formatDateRange(activity)}
                        {activity.hours_per_week ? ` · ${activity.hours_per_week} hrs/wk` : ''}
                      </p>
                    </div>

                    {/* Category tag */}
                    <span className="bg-[#f5f5f7] text-[#6e6e73] text-xs px-2.5 py-1 rounded-full font-[500] flex-shrink-0 whitespace-nowrap hidden sm:block">
                      {info.emoji} {info.label}
                    </span>

                    {/* Impact badge */}
                    <span
                      className={cn(
                        'text-[12px] font-[600] flex-shrink-0 whitespace-nowrap',
                        isHighImpact ? 'text-[#ff3b30]' : 'text-[#86868b]'
                      )}
                    >
                      {isHighImpact ? 'High impact' : 'Med impact'}
                    </span>

                    {/* Actions — visible on hover */}
                    <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(activity)}
                        className="text-[12px] font-[600] text-[#1d1d1f] px-2.5 py-1.5 rounded-lg hover:bg-[#e8e8ed] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(activity.id)}
                        disabled={deletingId === activity.id}
                        className="text-[12px] font-[600] text-[#86868b] px-2.5 py-1.5 rounded-lg hover:bg-[#e8e8ed] hover:text-[#ff3b30] transition-colors"
                      >
                        {deletingId === activity.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add activity button */}
          {activities.length > 0 && (
            <button
              onClick={openAdd}
              className="w-full py-3 rounded-xl border border-[#d2d2d7] text-[#1d1d1f] font-[600] text-[14px] hover:bg-[#f5f5f7] transition-colors"
            >
              + Add another activity
            </button>
          )}
        </div>
      </main>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[19px] font-[700] text-[#1d1d1f]">
                  {editingId ? 'Edit Activity' : 'Add Activity'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-[#86868b] hover:text-[#1d1d1f] text-2xl leading-none transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Type */}
                <div>
                  <label className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] block mb-2">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ACTIVITY_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, type: type.value }))}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[13px] font-[600] transition-colors text-left',
                          form.type === type.value
                            ? 'border-[#1d1d1f] bg-[#1d1d1f] text-white'
                            : 'border-[#e8e8ed] text-[#6e6e73] hover:border-[#1d1d1f]'
                        )}
                      >
                        <span>{type.emoji}</span>
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] block mb-2">Title / Activity Name *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Tutor for local food bank"
                    className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-[14px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#1d1d1f] transition-colors"
                  />
                </div>

                {/* Organization */}
                <div>
                  <label className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] block mb-2">Organization *</label>
                  <input
                    type="text"
                    value={form.organization}
                    onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                    placeholder="e.g. City Food Bank"
                    className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-[14px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#1d1d1f] transition-colors"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] block mb-2">
                    Your Role <span className="normal-case font-normal text-[#86868b]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    placeholder="e.g. Weekly Volunteer, Summer Intern"
                    className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-[14px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#1d1d1f] transition-colors"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] block mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                      className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-[14px] text-[#1d1d1f] focus:outline-none focus:border-[#1d1d1f] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] block mb-2">End Date</label>
                    <input
                      type="date"
                      value={form.end_date}
                      disabled={form.is_ongoing}
                      onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                      className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-[14px] text-[#1d1d1f] focus:outline-none focus:border-[#1d1d1f] transition-colors disabled:opacity-40"
                    />
                  </div>
                </div>

                {/* Ongoing toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setForm((f) => ({ ...f, is_ongoing: !f.is_ongoing, end_date: '' }))}
                    className={cn(
                      'w-11 h-6 rounded-full transition-colors relative flex-shrink-0',
                      form.is_ongoing ? 'bg-[#1d1d1f]' : 'bg-[#e8e8ed]'
                    )}
                  >
                    <div className={cn(
                      'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm',
                      form.is_ongoing ? 'translate-x-5' : 'translate-x-0.5'
                    )} />
                  </div>
                  <span className="text-[14px] font-[500] text-[#1d1d1f]">Still ongoing / present</span>
                </label>

                {/* Hours per week */}
                <div>
                  <label className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] block mb-2">
                    Hours per week <span className="normal-case font-normal text-[#86868b]">(optional)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={form.hours_per_week}
                    onChange={(e) => setForm((f) => ({ ...f, hours_per_week: e.target.value }))}
                    placeholder="e.g. 5"
                    className="w-full px-4 py-3 border border-[#e8e8ed] rounded-xl text-[14px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:border-[#1d1d1f] transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] block mb-2">
                    Description <span className="normal-case font-normal text-[#86868b]">(optional)</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="What did you do? What impact did you make? What did you learn?"
                    rows={3}
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
                  disabled={saving || !form.title || !form.organization || !form.start_date}
                  className="flex-1 py-3 rounded-xl bg-[#ff3b30] text-white font-[600] hover:bg-[#ff3b30]/90 disabled:opacity-50 transition-opacity"
                >
                  {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add activity'}
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
