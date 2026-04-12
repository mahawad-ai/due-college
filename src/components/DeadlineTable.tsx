'use client';

import { useState } from 'react';
import { Deadline, CustomDeadline } from '@/lib/types';
import { formatDate, formatDaysRemaining, getDaysRemaining, getDeadlineTypeColor, getUrgencyBadgeColor, getUrgency, cn } from '@/lib/utils';
import AddDeadlineModal from './AddDeadlineModal';

type AnyDeadline = (Deadline & { isCustom?: false }) | (CustomDeadline & { isCustom: true; date: string; type: string });

interface DeadlineTableProps {
  deadlines: Deadline[];
  customDeadlines?: CustomDeadline[];
  collegeName: string;
  collegeId?: string;
  submittedIds?: Set<string>;
  deadlineNotes?: Map<string, string>;
  onToggleSubmitted?: (deadlineId: string, submitted: boolean, isCustom?: boolean) => Promise<void>;
  onDownloadCalendar?: (deadline: Deadline) => void;
  onCustomDeadlineSaved?: (deadline: CustomDeadline) => void;
  onCustomDeadlineDeleted?: (id: string) => void;
  canExportCalendar?: boolean;
  showAddButton?: boolean;
}

export default function DeadlineTable({
  deadlines,
  customDeadlines = [],
  collegeName,
  collegeId,
  submittedIds = new Set(),
  deadlineNotes = new Map(),
  onToggleSubmitted,
  onDownloadCalendar,
  onCustomDeadlineSaved,
  onCustomDeadlineDeleted,
  canExportCalendar = false,
  showAddButton = false,
}: DeadlineTableProps) {
  const [localSubmitted, setLocalSubmitted] = useState<Set<string>>(new Set(submittedIds));
  const [toggling, setToggling] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustom, setEditingCustom] = useState<CustomDeadline | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Normalize all deadlines to a single shape
  const allDeadlines: AnyDeadline[] = [
    ...deadlines.map((d) => ({ ...d, isCustom: false as const })),
    ...customDeadlines.map((d) => ({
      ...d,
      isCustom: true as const,
      date: d.due_date,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get unique types for filter chips
  const allTypes = Array.from(new Set(allDeadlines.map((d) => d.type)));

  const filtered = filterType === 'all' ? allDeadlines : allDeadlines.filter((d) => d.type === filterType);
  const pendingFiltered = filtered.filter((d) => !localSubmitted.has(d.id));

  async function handleToggle(deadline: AnyDeadline) {
    if (!onToggleSubmitted) return;
    setToggling(deadline.id);
    const current = localSubmitted.has(deadline.id);
    const next = new Set(localSubmitted);
    if (current) next.delete(deadline.id); else next.add(deadline.id);
    setLocalSubmitted(next);
    try {
      await onToggleSubmitted(deadline.id, !current, deadline.isCustom);
    } catch {
      setLocalSubmitted(localSubmitted);
    } finally {
      setToggling(null);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAllPending() {
    setSelectedIds(new Set(pendingFiltered.map((d) => d.id)));
  }

  async function bulkMarkDone() {
    if (!onToggleSubmitted || selectedIds.size === 0) return;
    setBulkLoading(true);
    const next = new Set(localSubmitted);
    for (const id of selectedIds) next.add(id);
    setLocalSubmitted(next);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => {
          const deadline = allDeadlines.find((d) => d.id === id);
          return onToggleSubmitted(id, true, deadline?.isCustom);
        })
      );
    } catch {
      setLocalSubmitted(localSubmitted);
    } finally {
      setBulkLoading(false);
      setSelectedIds(new Set());
    }
  }

  function openNoteEditor(deadlineId: string) {
    setEditingNote(deadlineId);
    setNoteValue(deadlineNotes.get(deadlineId) || '');
    setExpandedNotes((prev) => new Set([...prev, deadlineId]));
  }

  async function saveNote(deadlineId: string) {
    setSavingNote(true);
    try {
      await fetch('/api/deadline-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deadlineId, submitted: localSubmitted.has(deadlineId), notes: noteValue }),
      });
      deadlineNotes.set(deadlineId, noteValue);
    } finally {
      setSavingNote(false);
      setEditingNote(null);
    }
  }

  async function handleDeleteCustom(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/custom-deadlines?id=${id}`, { method: 'DELETE' });
      onCustomDeadlineDeleted?.(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {/* Filter bar */}
      {allTypes.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              'flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors',
              filterType === 'all' ? 'bg-navy text-white border-navy' : 'bg-white text-gray-500 border-gray-200 hover:border-navy'
            )}
          >
            All ({allDeadlines.length})
          </button>
          {allTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                'flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors',
                filterType === type ? 'bg-navy text-white border-navy' : 'bg-white text-gray-500 border-gray-200 hover:border-navy'
              )}
            >
              {type} ({allDeadlines.filter((d) => d.type === type).length})
            </button>
          ))}
        </div>
      )}

      {/* Bulk actions bar */}
      {onToggleSubmitted && pendingFiltered.length > 1 && (
        <div className="flex items-center gap-3 mb-3 px-1">
          <button
            onClick={selectAllPending}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Select all pending ({pendingFiltered.length})
          </button>
          {selectedIds.size > 0 && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-xs text-gray-500">{selectedIds.size} selected</span>
              <button
                onClick={bulkMarkDone}
                disabled={bulkLoading}
                className="text-xs bg-green text-white font-semibold px-3 py-1 rounded-full hover:bg-green/90 transition-colors disabled:opacity-50"
              >
                {bulkLoading ? 'Saving...' : `Mark ${selectedIds.size} done`}
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            </>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {onToggleSubmitted && pendingFiltered.length > 1 && (
                <th className="pl-4 py-3 w-8" />
              )}
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Days Left</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((deadline) => {
              const days = getDaysRemaining(deadline.date);
              const urgency = getUrgency(days);
              const typeColor = getDeadlineTypeColor(deadline.type);
              const badgeColor = getUrgencyBadgeColor(urgency);
              const isSubmitted = localSubmitted.has(deadline.id);
              const isSelected = selectedIds.has(deadline.id);
              const note = deadlineNotes.get(deadline.id) || (deadline.isCustom ? deadline.notes : null) || '';
              const isEditingNote = editingNote === deadline.id;
              const isExpanded = expandedNotes.has(deadline.id) || !!note;

              return (
                <>
                  <tr
                    key={deadline.id}
                    className={cn(
                      'transition-colors',
                      isSubmitted ? 'opacity-50 bg-gray-50' : isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                    )}
                  >
                    {onToggleSubmitted && pendingFiltered.length > 1 && (
                      <td className="pl-4 py-3">
                        {!isSubmitted && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(deadline.id)}
                            className="rounded border-gray-300 text-navy focus:ring-navy/20"
                          />
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', typeColor)}>
                          {deadline.type}
                        </span>
                        {deadline.isCustom && (
                          <span className="text-xs text-gray-400 font-medium">custom</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-navy">
                      {formatDate(deadline.date)}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', isSubmitted ? 'bg-green-100 text-green-700' : badgeColor)}>
                        {isSubmitted ? '✓ Done' : formatDaysRemaining(days)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isSubmitted ? (
                        <span className="text-xs text-green-600 font-medium">Submitted</span>
                      ) : (
                        <span className="text-xs text-gray-400">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Notes button */}
                        {!deadline.isCustom && onToggleSubmitted && (
                          <button
                            onClick={() => openNoteEditor(deadline.id)}
                            className={cn(
                              'text-xs px-2 py-1 rounded-lg transition-colors font-medium',
                              note ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            )}
                            title="Add note"
                          >
                            {note ? '📝' : '+ Note'}
                          </button>
                        )}
                        {/* Cal export */}
                        {canExportCalendar && onDownloadCalendar && !deadline.isCustom && (
                          <button
                            onClick={() => onDownloadCalendar(deadline as Deadline)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                          >
                            + Cal
                          </button>
                        )}
                        {/* Mark done toggle */}
                        {onToggleSubmitted && (
                          <button
                            onClick={() => handleToggle(deadline)}
                            disabled={toggling === deadline.id}
                            className={cn(
                              'text-xs px-2.5 py-1 rounded-full border transition-all font-medium whitespace-nowrap',
                              isSubmitted
                                ? 'border-green bg-green-light text-green-700 hover:bg-green-100'
                                : 'border-gray-300 text-gray-500 hover:border-navy hover:text-navy'
                            )}
                          >
                            {toggling === deadline.id ? '...' : isSubmitted ? '✓ Done' : 'Mark done'}
                          </button>
                        )}
                        {/* Edit / Delete for custom deadlines */}
                        {deadline.isCustom && (
                          <>
                            <button
                              onClick={() => { setEditingCustom(deadline as CustomDeadline); setShowAddModal(true); }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium px-1.5 py-1 rounded hover:bg-blue-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCustom(deadline.id)}
                              disabled={deletingId === deadline.id}
                              className="text-xs text-red-500 hover:text-red-700 font-medium px-1.5 py-1 rounded hover:bg-red-50"
                            >
                              {deletingId === deadline.id ? '...' : 'Delete'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Note row */}
                  {isExpanded && (
                    <tr key={`${deadline.id}-note`} className="bg-blue-50/50">
                      <td
                        colSpan={7}
                        className="px-4 pb-3 pt-0"
                      >
                        {isEditingNote ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={noteValue}
                              onChange={(e) => setNoteValue(e.target.value)}
                              placeholder="Add a note for this deadline..."
                              autoFocus
                              onKeyDown={(e) => { if (e.key === 'Enter') saveNote(deadline.id); if (e.key === 'Escape') setEditingNote(null); }}
                              className="flex-1 text-xs px-3 py-1.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-navy/20 bg-white"
                            />
                            <button
                              onClick={() => saveNote(deadline.id)}
                              disabled={savingNote}
                              className="text-xs bg-navy text-white px-3 py-1.5 rounded-lg font-medium hover:bg-navy/90"
                            >
                              {savingNote ? '...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingNote(null)}
                              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-blue-700">📝 {note}</span>
                            <button
                              onClick={() => openNoteEditor(deadline.id)}
                              className="text-xs text-blue-400 hover:text-blue-600 underline"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add custom deadline button */}
      {showAddButton && (
        <button
          onClick={() => { setEditingCustom(null); setShowAddModal(true); }}
          className="mt-3 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 text-sm font-semibold hover:border-coral hover:text-coral transition-colors"
        >
          + Add custom deadline
        </button>
      )}

      {/* Add/Edit custom deadline modal */}
      {showAddModal && (
        <AddDeadlineModal
          collegeId={collegeId}
          collegeName={collegeName}
          editing={editingCustom}
          onClose={() => { setShowAddModal(false); setEditingCustom(null); }}
          onSaved={(deadline) => {
            onCustomDeadlineSaved?.(deadline);
            setShowAddModal(false);
            setEditingCustom(null);
          }}
        />
      )}
    </div>
  );
}
