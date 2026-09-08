import { useMemo } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { DaySessionList } from './DaySessionList';

export function HistoryView() {
  const { projects, timeEntries, editSegment, deleteEntry } = useTracker();

  const projectsById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects]);

  const entriesByDay = useMemo(() => {
    const map = new Map<string, typeof timeEntries>();
    for (const entry of timeEntries) {
      const list = map.get(entry.dateKey);
      if (list) list.push(entry);
      else map.set(entry.dateKey, [entry]);
    }
    return [...map.entries()].sort(([a], [b]) => (a < b ? 1 : -1));
  }, [timeEntries]);

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">History</h1>
      {entriesByDay.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No sessions recorded yet.
        </div>
      ) : (
        <div className="space-y-4">
          {entriesByDay.map(([dateKey, entries]) => (
            <DaySessionList
              key={dateKey}
              dateKey={dateKey}
              entries={entries}
              projectsById={projectsById}
              onEditSegment={editSegment}
              onDeleteEntry={deleteEntry}
            />
          ))}
        </div>
      )}
    </div>
  );
}
