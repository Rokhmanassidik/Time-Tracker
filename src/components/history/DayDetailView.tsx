import { ArrowLeft, Pencil, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { useDayTimeline } from '../../hooks/useDayTimeline';
import { formatClock, formatDateKey, formatDuration } from '../../lib/date';
import { AssignRangeModal } from './AssignRangeModal';
import { Button } from '../ui/Button';
import type { TimelineBlock } from '../../lib/day-timeline';

interface DayDetailViewProps {
  dateKey: string;
  onBack: () => void;
}

type EditingTarget = { block: TimelineBlock } | 'new';

function toTimeInputValue(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function DayDetailView({ dateKey, onBack }: DayDetailViewProps) {
  const { projects } = useTracker();
  const { blocks, workStart, workEnd, assign, setWorkRange } = useDayTimeline(dateKey);
  const [editing, setEditing] = useState<EditingTarget | null>(null);

  const projectsById = new Map(projects.map((p) => [p.id, p]));

  const handleWorkRangeChange = (which: 'start' | 'end', time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const day = new Date(workStart);
    const changed = new Date(day);
    changed.setHours(hours, minutes, 0, 0);

    const newStart = which === 'start' ? changed.toISOString() : workStart;
    const newEnd = which === 'end' ? changed.toISOString() : workEnd;
    if (new Date(newEnd).getTime() <= new Date(newStart).getTime()) return;
    setWorkRange(newStart, newEnd);
  };

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft size={15} />
        Back to History
      </button>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatDateKey(dateKey)}</h1>
        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            Work start
            <input
              type="time"
              value={toTimeInputValue(workStart)}
              onChange={(e) => handleWorkRangeChange('start', e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
          <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            Work end
            <input
              type="time"
              value={toTimeInputValue(workEnd)}
              onChange={(e) => handleWorkRangeChange('end', e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Sessions</h2>
          <Button onClick={() => setEditing('new')}>
            <Plus size={15} />
            Assign session
          </Button>
        </div>

        <ul className="space-y-2">
          {blocks.map((block) => {
            const project = block.projectId ? projectsById.get(block.projectId) : undefined;
            const isUnassigned = block.projectId === null;
            return (
              <li
                key={`${block.start}-${block.end}`}
                className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-sm ${
                  isUnassigned
                    ? 'border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: isUnassigned ? '#cbd5e1' : (project?.color ?? '#94a3b8') }}
                  />
                  <div className="min-w-0">
                    <p
                      className={`truncate font-medium ${
                        isUnassigned ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {isUnassigned ? 'Unassigned' : (project?.name ?? 'Deleted project')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatClock(block.start)}–{formatClock(block.end)} · {formatDuration(new Date(block.end).getTime() - new Date(block.start).getTime())}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    aria-label="Edit this session"
                    onClick={() => setEditing({ block })}
                    className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                  >
                    <Pencil size={14} />
                  </button>
                  {!isUnassigned && (
                    <button
                      type="button"
                      aria-label="Clear this session"
                      onClick={() => assign(block.start, block.end, null)}
                      className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {editing && (
        <AssignRangeModal
          projects={projects}
          workStart={workStart}
          workEnd={workEnd}
          initialStart={editing === 'new' ? workStart : editing.block.start}
          initialEnd={editing === 'new' ? workEnd : editing.block.end}
          initialProjectId={editing === 'new' ? null : editing.block.projectId}
          onClose={() => setEditing(null)}
          onSave={(start, end, projectId) => {
            assign(start, end, projectId);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
