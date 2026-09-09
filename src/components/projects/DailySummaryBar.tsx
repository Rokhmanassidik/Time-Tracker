import { AlarmClockCheck, Coffee } from 'lucide-react';
import { useMemo } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { useNow } from '../../hooks/useNow';
import { toDateKey, formatDuration } from '../../lib/date';
import { DAILY_REGULAR_MS, getDayTotalMs, getOvertimeMs, getRegularMs, splitWorkAndBreakEntries } from '../../lib/overtime';

export function DailySummaryBar() {
  const { timeEntries, projects } = useTracker();
  const todayKey = toDateKey();
  const hasRunning = timeEntries.some((e) => e.dateKey === todayKey && e.status === 'running');
  const liveNow = useNow(hasRunning ? 1000 : 60_000);

  const projectsById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);
  const { work, breakEntries } = useMemo(() => splitWorkAndBreakEntries(timeEntries, projectsById), [timeEntries, projectsById]);

  const dayTotalMs = getDayTotalMs(work, todayKey, liveNow);
  const breakTotalMs = getDayTotalMs(breakEntries, todayKey, liveNow);
  const regularMs = getRegularMs(dayTotalMs);
  const overtimeMs = getOvertimeMs(dayTotalMs);
  const regularPct = Math.min(100, (regularMs / DAILY_REGULAR_MS) * 100);

  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-300">Today's work total</span>
        <div className="flex items-center gap-2">
          <span className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{formatDuration(dayTotalMs)}</span>
          {overtimeMs > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
              <AlarmClockCheck size={12} />
              OT {formatDuration(overtimeMs)}
            </span>
          )}
        </div>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full bg-indigo-500" style={{ width: `${regularPct}%` }} />
        {overtimeMs > 0 && <div className="h-full flex-1 bg-amber-500" />}
      </div>
      {breakTotalMs > 0 && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Coffee size={12} />
          Break today: <span className="font-mono tabular-nums">{formatDuration(breakTotalMs)}</span>
        </div>
      )}
    </div>
  );
}
