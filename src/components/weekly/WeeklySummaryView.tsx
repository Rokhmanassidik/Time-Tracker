import { AlarmClockCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { formatDuration, formatShortDate, formatWeekRange, getWeekRange, shiftWeek } from '../../lib/date';
import { sumByProjectForDays } from '../../lib/time-entries';
import { getDayTotalMs, getOvertimeMs, getRegularMs } from '../../lib/overtime';
import { WeeklyProjectBar } from './WeeklyProjectBar';
import { Button } from '../ui/Button';

export function WeeklySummaryView() {
  const { projects, timeEntries } = useTracker();
  const [anchor, setAnchor] = useState(() => new Date());

  const { startKey, endKey, days } = useMemo(() => getWeekRange(anchor), [anchor]);

  const totals = useMemo(() => sumByProjectForDays(timeEntries, days), [timeEntries, days]);
  const maxMs = Math.max(1, ...Object.values(totals));

  const rows = projects
    .map((project) => ({ project, ms: totals[project.id] ?? 0 }))
    .sort((a, b) => b.ms - a.ms);

  const dailyBreakdown = useMemo(
    () =>
      days.map((dateKey) => {
        const dayTotalMs = getDayTotalMs(timeEntries, dateKey);
        return { dateKey, dayTotalMs, regularMs: getRegularMs(dayTotalMs), overtimeMs: getOvertimeMs(dayTotalMs) };
      }),
    [days, timeEntries],
  );
  const weeklyOvertimeMs = dailyBreakdown.reduce((sum, d) => sum + d.overtimeMs, 0);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Weekly summary</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setAnchor((d) => shiftWeek(d, -1))}>
            <ChevronLeft size={15} />
            Prev
          </Button>
          <span className="text-sm text-slate-600 dark:text-slate-300">{formatWeekRange(startKey, endKey)}</span>
          <Button variant="secondary" onClick={() => setAnchor((d) => shiftWeek(d, 1))}>
            Next
            <ChevronRight size={15} />
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No projects yet.
        </div>
      ) : (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          {rows.map(({ project, ms }) => (
            <WeeklyProjectBar key={project.id} project={project} ms={ms} maxMs={maxMs} />
          ))}
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Overtime by day</h2>
          {weeklyOvertimeMs > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-400">
              <AlarmClockCheck size={12} />
              {formatDuration(weeklyOvertimeMs)} total OT
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-slate-500 dark:text-slate-400">
                <th className="pb-2 font-medium">Day</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Regular</th>
                <th className="pb-2 font-medium">OT</th>
              </tr>
            </thead>
            <tbody>
              {dailyBreakdown.map((d) => (
                <tr key={d.dateKey} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-1.5 text-slate-700 dark:text-slate-300">{formatShortDate(d.dateKey)}</td>
                  <td className="py-1.5 font-mono tabular-nums text-slate-900 dark:text-slate-100">
                    {formatDuration(d.dayTotalMs)}
                  </td>
                  <td className="py-1.5 font-mono tabular-nums text-slate-600 dark:text-slate-400">
                    {formatDuration(d.regularMs)}
                  </td>
                  <td className="py-1.5 font-mono tabular-nums text-amber-700 dark:text-amber-400">
                    {d.overtimeMs > 0 ? formatDuration(d.overtimeMs) : '–'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
