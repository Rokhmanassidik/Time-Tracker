import { Coffee, Pause, Pencil, Play, Square, Trash2 } from 'lucide-react';
import { useTracker } from '../../context/TrackerContext';
import { useNow } from '../../hooks/useNow';
import { formatDuration } from '../../lib/date';
import { getEntryDurationMs } from '../../lib/time-entries';
import { Button } from '../ui/Button';
import type { Project, TimeEntry } from '../../types';

function LiveElapsed({ entry }: { entry: TimeEntry }) {
  const now = useNow(1000);
  return <>{formatDuration(getEntryDurationMs(entry, now))}</>;
}

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const { getTodayEntry, start, pause, resume, end } = useTracker();
  const entry = getTodayEntry(project.id);
  const status = entry?.status;

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
      style={{ borderTopColor: project.color, borderTopWidth: 3 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            {status === 'running' && (
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ backgroundColor: project.color }}
              />
            )}
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }} />
          </span>
          <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{project.name}</h3>
          {project.isBreak && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <Coffee size={10} />
              Break
            </span>
          )}
        </div>
        <div className="flex shrink-0 gap-0.5">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${project.name}`}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${project.name}`}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="font-mono text-2xl tabular-nums text-slate-900 dark:text-slate-100">
        {entry && status === 'running' ? (
          <LiveElapsed entry={entry} />
        ) : (
          formatDuration(entry ? getEntryDurationMs(entry) : 0)
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">today's total</p>

      <div className="flex gap-2">
        {(status === undefined) && (
          <Button className="flex-1" onClick={() => start(project.id)}>
            <Play size={14} />
            Start
          </Button>
        )}
        {status === 'running' && (
          <>
            <Button className="flex-1" variant="secondary" onClick={() => pause(project.id)}>
              <Pause size={14} />
              Pause
            </Button>
            <Button className="flex-1" variant="danger" onClick={() => end(project.id)}>
              <Square size={13} />
              End
            </Button>
          </>
        )}
        {status === 'paused' && (
          <>
            <Button className="flex-1" onClick={() => resume(project.id)}>
              <Play size={14} />
              Resume
            </Button>
            <Button className="flex-1" variant="danger" onClick={() => end(project.id)}>
              <Square size={13} />
              End
            </Button>
          </>
        )}
        {status === 'ended' && (
          <span className="flex-1 rounded-lg bg-slate-100 px-3 py-1.5 text-center text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Done for today
          </span>
        )}
      </div>
    </div>
  );
}
