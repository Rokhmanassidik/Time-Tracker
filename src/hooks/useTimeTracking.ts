import { useCallback, useEffect } from 'react';
import { useLocalStorageState } from './useLocalStorageState';
import { useTodayKey } from './useTodayKey';
import { toDateKey } from '../lib/date';
import { autoCloseStaleEntries, closeOpenSegment, getEntryDurationMs, openSegment } from '../lib/time-entries';
import type { TimeEntry } from '../types';

const STORAGE_KEY = 'time-tracker:time-entries';

export function useTimeTracking() {
  const [timeEntries, setTimeEntries] = useLocalStorageState<TimeEntry[]>(STORAGE_KEY, []);
  const todayKey = useTodayKey();

  // If a timer was left running past midnight (app closed overnight, or left
  // open while the day flips), force-close it at 23:59:59 of its own day.
  useEffect(() => {
    setTimeEntries((prev) => autoCloseStaleEntries(prev, todayKey).entries);
  }, [todayKey, setTimeEntries]);

  const getTodayEntry = useCallback(
    (projectId: string): TimeEntry | undefined => {
      const todayKey = toDateKey();
      return timeEntries.find((e) => e.projectId === projectId && e.dateKey === todayKey);
    },
    [timeEntries],
  );

  const getTodayTotalMs = useCallback(
    (projectId: string, now: number = Date.now()): number => {
      const entry = getTodayEntry(projectId);
      return entry ? getEntryDurationMs(entry, now) : 0;
    },
    [getTodayEntry],
  );

  const start = useCallback(
    (projectId: string) => {
      const nowISO = new Date().toISOString();
      const todayKey = toDateKey();

      setTimeEntries((prev) => {
        // Auto-pause any other entry that's currently running.
        const withOthersPaused = prev.map((e) =>
          e.status === 'running' && e.projectId !== projectId
            ? { ...closeOpenSegment(e, nowISO), status: 'paused' as const }
            : e,
        );

        const existing = withOthersPaused.find((e) => e.projectId === projectId && e.dateKey === todayKey);

        if (!existing) {
          const entry: TimeEntry = {
            id: crypto.randomUUID(),
            projectId,
            dateKey: todayKey,
            segments: [],
            status: 'running',
          };
          return [...withOthersPaused, openSegment(entry, nowISO)];
        }

        return withOthersPaused.map((e) =>
          e.id === existing.id ? { ...openSegment(e, nowISO), status: 'running' as const } : e,
        );
      });
    },
    [setTimeEntries],
  );

  const pause = useCallback(
    (projectId: string) => {
      const nowISO = new Date().toISOString();
      const todayKey = toDateKey();
      setTimeEntries((prev) =>
        prev.map((e) =>
          e.projectId === projectId && e.dateKey === todayKey
            ? { ...closeOpenSegment(e, nowISO), status: 'paused' as const }
            : e,
        ),
      );
    },
    [setTimeEntries],
  );

  const resume = useCallback((projectId: string) => start(projectId), [start]);

  const end = useCallback(
    (projectId: string) => {
      const nowISO = new Date().toISOString();
      const todayKey = toDateKey();
      setTimeEntries((prev) =>
        prev.map((e) =>
          e.projectId === projectId && e.dateKey === todayKey
            ? { ...closeOpenSegment(e, nowISO), status: 'ended' as const }
            : e,
        ),
      );
    },
    [setTimeEntries],
  );

  /** Deletes an entire day's record for one project (all its segments). */
  const deleteEntry = useCallback(
    (entryId: string) => {
      setTimeEntries((prev) => prev.filter((e) => e.id !== entryId));
    },
    [setTimeEntries],
  );

  return {
    timeEntries,
    setTimeEntries,
    getTodayEntry,
    getTodayTotalMs,
    start,
    pause,
    resume,
    end,
    deleteEntry,
  };
}
