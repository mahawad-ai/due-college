'use client';

import { useState } from 'react';
import { CustomDeadline } from '@/lib/types';
import { cn } from '@/lib/utils';

const DEADLINE_TYPES = [
  'ED1', 'ED2', 'EA', 'REA', 'RD', 'FAFSA', 'Housing', 'Scholarship', 'Financial Aid', 'Custom',
];

interface AddDeadlineModalProps {
  collegeId?: string;
  collegeName?: string;
  onClose: () => void;
  onSaved: (deadline: CustomDeadline) => void;
  editing?: CustomDeadline | null;
}

export default function AddDeadlineModal({
  collegeId,
  collegeName,
  onClose,
  onSaved,
  editing = null,
}: AddDeadlineModalProps) {
  const [form, setForm] = useState({
    college_name: editing?.college_name || collegeName || '',
    type: editing?.type || 'Custom',
    due_date: editing?.due_date || '',
    notes: editing?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!form.college_name || !form.type || !form.due_date) {
      setError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        college_name: form.college_name,
        college_id: collegeId || null,
        type: form.type,
        due_date: form.due_date,
        notes: form.notes || null,
      };

      let res;
      if (editing) {
        res = await fetch('/api/custom-deadlines', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...payload }),
        });
      } else {
        res = await fetch('/api/custom-deadlines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong.');
        return;
      }
      const data = await res.json();
      onSaved(data.deadline);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-extrabold text-navy">
              {editing ? 'Edit Deadline' : 'Add Custom Deadline'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-2 mb-4">{error}</div>
          )}

          <div className="space-y-4">
            {/* College name */}
            <div>
              <label className="text-sm font-semibold text-navy block mb-1.5">
                College / Organization *
              </label>
              <input
                type="text"
                value={form.college_name}
                onChange={(e) => setForm((f) => ({ ...f, college_name: e.target.value }))}
                placeholder="e.g. Harvard, Local Scholarship Fund"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-sm font-semibold text-navy block mb-1.5">Deadline Type *</label>
              <div className="flex flex-wrap gap-2">
                {DEADLINE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type }))}
                    className={cn(
                      'text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors',
                      form.type === type
                        ? 'bg-navy text-white border-navy'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-navy'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Due date */}
            <div>
              <label className="text-sm font-semibold text-navy block mb-1.5">Due Date *</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-semibold text-navy block mb-1.5">
                Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Any reminders or details about this deadline..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-navy font-semibold hover:border-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.college_name || !form.due_date}
              className="flex-1 py-3 rounded-xl bg-coral text-white font-semibold hover:bg-coral/90 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Add deadline'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
