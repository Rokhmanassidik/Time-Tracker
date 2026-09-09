import { AlarmClockCheck, ChevronRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { formatClock, formatDateKey, formatDuration } from '../../lib/date';
import { getEntryDurationMs } from '../../lib/time-entries';
import { getDayTotalMs, getOvertimeMs, splitWorkAndBreakEntries } from '../../lib/overtime';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import type { Project, TimeEntry } from '../../types';

interface DaySessionListProps {
  dateKey: string;
  entries: TimeEntry[];
  projectsById: Map<string, Project>;
  onOpenDay: (dateKey: string) => void;
  onDeleteEntry: (entryId: string) => void;
}

interface DeleteEntryTarget {
  entryId: string;
  projectName: string;
}

export function DaySessionList({ dateKey, entries, projectsById, onOpenDay, onDeleteEntry }: DaySessionListProps) {
  const [deletingEntry, setDeletingEntry] = useState<DeleteEntryTarget | null>(null);

  const { work } = splitWorkAndBreakEntries(entries, projectsById);
  const dayTotalMs = getDayTotalMs(work, dateKey);
  const overtimeMs = getOvertimeMs(dayTotalMs);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onOpenDay(dateKey)}
          className="group flex items-center gap-1 text-sm font-semibold text-slate-900 transition-colors hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
        >
          {formatDateKey(dateKey)}
          <ChevronRight size={15} className="text-slate-400 transition-transform group-hover:translate-x-0.5" />
        </button>
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
                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                  {entry.segments.map((s) => `${formatClock(s.start)}–${s.end ? formatClock(s.end) : 'now'}`).join(', ')}
                </p>
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
