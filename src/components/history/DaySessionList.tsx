import { AlarmClockCheck, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { formatClock, formatDateKey, formatDuration } from '../../lib/date';
import { getEntryDurationMs } from '../../lib/time-entries';
import { getDayTotalMs, getOvertimeMs } from '../../lib/overtime';
import { EditSegmentModal } from './EditSegmentModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import type { Project, TimeEntry } from '../../types';

interface DaySessionListProps {
  dateKey: string;
  entries: TimeEntry[];
  projectsById: Map<string, Project>;
  onEditSegment: (entryId: string, segmentId: string, newStartISO: string, newEndISO: string) => void;
  onDeleteEntry: (entryId: string) => void;
}

interface EditingTarget {
  entryId: string;
  segmentId: string;
  projectName: string;
  segmentStart: string;
  segmentEnd: string;
}

interface DeleteEntryTarget {
  entryId: string;
  projectName: string;
}

export function DaySessionList({ dateKey, entries, projectsById, onEditSegment, onDeleteEntry }: DaySessionListProps) {
  const [editing, setEditing] = useState<EditingTarget | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<DeleteEntryTarget | null>(null);

  const dayTotalMs = getDayTotalMs(entries, dateKey);
  const overtimeMs = getOvertimeMs(dayTotalMs);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDateKey(dateKey)}</h3>
        {overtimeMs > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
            <AlarmClockCheck size={12} />
            OT {formatDuration(overtimeMs)}
          </span>
        )}
      </div>
      <ul className="space-y-3">
        {entries.map((entry) => {
          const project = projectsById.get(entry.projectId);
          const name = project ? project.name : 'Deleted project';
          const color = project?.color ?? '#94a3b8';
          return (
            <li key={entry.id} className="flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                  <span className="truncate font-medium text-slate-800 dark:text-slate-200">{name}</span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {entry.segments.map((s, i) => (
                    <span key={s.id} className="inline-flex items-center gap-0.5">
                      {i > 0 && <span>,</span>}
                      <span>
                        {formatClock(s.start)}–{s.end ? formatClock(s.end) : 'now'}
                      </span>
                      {s.end && (
                        <button
                          type="button"
                          aria-label="Edit session time"
                          onClick={() =>
                            setEditing({
                              entryId: entry.id,
                              segmentId: s.id,
                              projectName: name,
                              segmentStart: s.start,
                              segmentEnd: s.end as string,
                            })
                          }
                          className="rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                        >
                          <Pencil size={11} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300">
                  {formatDuration(getEntryDurationMs(entry))}
                </span>
                <button
                  type="button"
                  aria-label={`Delete ${name} for this day`}
                  onClick={() => setDeletingEntry({ entryId: entry.id, projectName: name })}
                  className="rounded-full p-1 text-slate-300 transition-colors hover:bg-slate-100 hover:text-red-600 dark:text-slate-600 dark:hover:bg-slate-800"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {editing && (
        <EditSegmentModal
          projectName={editing.projectName}
          segmentStart={editing.segmentStart}
          segmentEnd={editing.segmentEnd}
          onClose={() => setEditing(null)}
          onSave={(newStartISO, newEndISO) => {
            onEditSegment(editing.entryId, editing.segmentId, newStartISO, newEndISO);
            setEditing(null);
          }}
        />
      )}

      {deletingEntry && (
        <ConfirmDialog
          title="Delete day record"
          message={`Delete all of ${deletingEntry.projectName}'s tracked time on ${formatDateKey(dateKey)}? This can't be undone.`}
          confirmLabel="Delete"
          onCancel={() => setDeletingEntry(null)}
          onConfirm={() => {
            onDeleteEntry(deletingEntry.entryId);
            setDeletingEntry(null);
          }}
        />
      )}
    </div>
  );
}
