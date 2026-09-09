import { useCallback, useMemo } from 'react';
import { useTracker } from '../context/TrackerContext';
import { useLocalStorageState } from './useLocalStorageState';
import { assignRange, buildDayTimeline, resizeWorkRange, timelineToEntries } from '../lib/day-timeline';
import type { TimelineBlock } from '../lib/day-timeline';

interface DayRange {
  workStart: string;
  workEnd: string;
}

const DAY_RANGES_KEY = 'time-tracker:day-ranges';

/**
 * A manually-widened/shrunk work range has no segment to anchor it (an Unassigned
 * edge isn't persisted as a TimeEntry), so it's remembered separately here —
 * otherwise it would silently snap back to min/max segment bounds on next open.
 */
export function useDayTimeline(dateKey: string) {
  const { timeEntries, setTimeEntries } = useTracker();
  const [dayRanges, setDayRanges] = useLocalStorageState<Record<string, DayRange>>(DAY_RANGES_KEY, {});

  const { blocks, workStart, workEnd } = useMemo(() => {
    const base = buildDayTimeline(timeEntries, dateKey);
    const override = dayRanges[dateKey];
    if (!override) return base;
    return {
      blocks: resizeWorkRange(base.blocks, override.workStart, override.workEnd),
      workStart: override.workStart,
      workEnd: override.workEnd,
    };
  }, [timeEntries, dateKey, dayRanges]);

  const persistBlocks = useCallback(
    (nextBlocks: TimelineBlock[]) => {
      setTimeEntries((prev) => [...prev.filter((e) => e.dateKey !== dateKey), ...timelineToEntries(nextBlocks, dateKey)]);
    },
    [setTimeEntries, dateKey],
  );

  const assign = useCallback(
    (start: string, end: string, projectId: string | null) => {
      persistBlocks(assignRange(blocks, start, end, projectId));
    },
    [blocks, persistBlocks],
  );

  const setWorkRange = useCallback(
    (newStart: string, newEnd: string) => {
      persistBlocks(resizeWorkRange(blocks, newStart, newEnd));
      setDayRanges((prev) => ({ ...prev, [dateKey]: { workStart: newStart, workEnd: newEnd } }));
    },
    [blocks, dateKey, persistBlocks, setDayRanges],
  );

  return { blocks, workStart, workEnd, assign, setWorkRange };
}
