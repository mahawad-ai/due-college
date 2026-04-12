'use client';

import { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-28">
        <div className="max-w-container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <Link href="/dashboard" className="text-sm text-gray-500 hover:text-navy font-medium mb-1 block">
                ← Dashboard
              </Link>
              <h1 className="text-2xl font-extrabold text-navy">Activities & Experience</h1>
              <p className="text-sm text-gray-500 mt-1">
                {activities.length} activit{activities.length !== 1 ? 'ies' : 'y'}
                {totalHours > 0 && ` · ~${totalHours} hrs/week`}
              </p>
            </div>
            <UserButton appearance={{ elements: { avatarBox: 'w-10 h-10' } }} afterSignOutUrl="/" />
          </div>

          {/* Stats row */}
          {activities.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {(['volunteering', 'internship', 'extracurricular'] as ActivityType[]).map((type) => {
                const count = activities.filter((a) => a.type === type).length;
                const info = getTypeInfo(type);
                return (
                  <div key={type} className="bg-white rounded-2xl border border-gray-200 p-3 text-center">
                    <div className="text-xl mb-1">{info.emoji}</div>
                    <div className="text-lg font-extrabold text-navy">{count}</div>
                    <div className="text-xs text-gray-500 capitalize">{type}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Filter chips */}
          {activities.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              <button
                onClick={() => setFilterType('all')}
                className={cn(
                  'flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors',
                  filterType === 'all'
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-navy'
                )}
              >
                All ({activities.length})
              </button>
              {ACTIVITY_TYPES.filter((t) => activities.some((a) => a.type === t.value)).map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  className={cn(
                    'flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap',
                    filterType === type.value
                      ? 'bg-navy text-white border-navy'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-navy'
                  )}
                >
                  {type.emoji} {type.label} ({activities.filter((a) => a.type === type.value).length})
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {activities.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🌟</div>
              <h2 className="text-xl font-bold text-navy mb-2">Track your experiences</h2>
              <p className="text-gray-500 mb-2">Add volunteering, internships, clubs, research, and more.</p>
              <p className="text-sm text-gray-400 mb-6">Colleges look at activities outside the classroom.</p>
              <button
                onClick={openAdd}
                className="inline-flex items-center gap-2 bg-coral text-white font-semibold px-6 py-3 rounded-xl hover:bg-coral/90 transition-colors"
              >
                + Add first activity
              </button>
            </div>
          )}

          {/* Activity list */}
          {filtered.length > 0 && (
            <div className="space-y-3 mb-6">
              {filtered.map((activity) => {
                const info = getTypeInfo(activity.type);
                return (
                  <div key={activity.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className="text-2xl flex-shrink-0 mt-0.5">{info.emoji}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-navy">{activity.title}</h3>
                            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', info.color)}>
                              {info.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-0.5">{activity.organization}</p>
                          {activity.role && (
                            <p className="text-xs text-gray-400 mt-0.5">{activity.role}</p>
                          )}
                          <div className="flex flex-wrap gap-3 mt-2">
                            <span className="text-xs text-gray-500">{formatDateRange(activity)}</span>
                            {activity.hours_per_week && (
                              <span className="text-xs text-gray-500">{activity.hours_per_week} hrs/week</span>
                            )}
                          </div>
                          {activity.description && (
                            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{activity.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          onClick={() => openEdit(activity)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(activity.id)}
                          disabled={deletingId === activity.id}
                          className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          {deletingId === activity.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add button (when there are activities) */}
          {activities.length > 0 && (
            <button
              onClick={openAdd}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-semibold hover:border-coral hover:text-coral transition-colors text-sm"
            >
              + Add another activity
            </button>
          )}
        </div>
      </main>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-extrabold text-navy">
                  {editingId ? 'Edit Activity' : 'Add Activity'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Type */}
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ACTIVITY_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, type: type.value }))}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors text-left',
                          form.type === type.value
                            ? 'border-navy bg-navy text-white'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
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
                  <label className="text-sm font-semibold text-navy block mb-1.5">Title / Activity Name *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Tutor for local food bank"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                  />
                </div>

                {/* Organization */}
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">Organization *</label>
                  <input
                    type="text"
                    value={form.organization}
                    onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                    placeholder="e.g. City Food Bank"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">Your Role <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    placeholder="e.g. Weekly Volunteer, Summer Intern"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold text-navy block mb-1.5">Start Date *</label>
                    <input
                      type="date"
                      value={form.start_date}
                      onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-navy block mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={form.end_date}
                      disabled={form.is_ongoing}
                      onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy disabled:opacity-40"
                    />
                  </div>
                </div>

                {/* Ongoing toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setForm((f) => ({ ...f, is_ongoing: !f.is_ongoing, end_date: '' }))}
                    className={cn(
                      'w-11 h-6 rounded-full transition-colors relative',
                      form.is_ongoing ? 'bg-navy' : 'bg-gray-200'
                    )}
                  >
                    <div className={cn(
                      'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm',
                      form.is_ongoing ? 'translate-x-5' : 'translate-x-0.5'
                    )} />
                  </div>
                  <span className="text-sm font-medium text-navy">Still ongoing / present</span>
                </label>

                {/* Hours per week */}
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">Hours per week <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={form.hours_per_week}
                    onChange={(e) => setForm((f) => ({ ...f, hours_per_week: e.target.value }))}
                    placeholder="e.g. 5"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-semibold text-navy block mb-1.5">
                    Description <span className="text-gray-400 font-normal">(optional — use for college essay notes)</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="What did you do? What impact did you make? What did you learn?"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-navy font-semibold hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title || !form.organization || !form.start_date}
                  className="flex-1 py-3 rounded-xl bg-coral text-white font-semibold hover:bg-coral/90 disabled:opacity-50 transition-colors"
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
