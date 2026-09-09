import { Coffee } from 'lucide-react';
import { formatDuration } from '../../lib/date';
import type { Project } from '../../types';

interface WeeklyProjectBarProps {
  project: Pick<Project, 'name' | 'color' | 'isBreak'>;
  ms: number;
  maxMs: number;
}

export function WeeklyProjectBar({ project, ms, maxMs }: WeeklyProjectBarProps) {
  const pct = maxMs > 0 ? Math.round((ms / maxMs) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="flex w-32 shrink-0 items-center gap-1 truncate text-slate-700 dark:text-slate-300">
        <span className="truncate">{project.name}</span>
        {project.isBreak && <Coffee size={11} className="shrink-0 text-slate-400" />}
      </span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: project.color }} />
      </div>
      <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400">
        {formatDuration(ms)}
      </span>
    </div>
  );
}
