import { endOfDay } from './date';
import type { Segment, TimeEntry } from '../types';

/** Total elapsed ms for one entry: closed segments summed exactly, open segment measured to `now`. */
export function getEntryDurationMs(entry: TimeEntry, now: number = Date.now()): number {
  return entry.segments.reduce((total, segment) => {
    const start = new Date(segment.start).getTime();
    const end = segment.end ? new Date(segment.end).getTime() : now;
    return total + Math.max(0, end - start);
  }, 0);
}

export function hasOpenSegment(entry: TimeEntry): boolean {
  return entry.segments.some((s) => s.end === null);
}

/** Closes the currently open segment (if any) at the given instant. */
export function closeOpenSegment(entry: TimeEntry, atISO: string): TimeEntry {
  return {
    ...entry,
    segments: entry.segments.map((s): Segment => (s.end === null ? { ...s, end: atISO } : s)),
  };
}

/** Appends a new open segment starting at the given instant. */
export function openSegment(entry: TimeEntry, atISO: string): TimeEntry {
  const segment: Segment = { id: crypto.randomUUID(), start: atISO, end: null };
  return { ...entry, segments: [...entry.segments, segment] };
}

/** Sums each project's total duration across the given set of dateKeys (e.g. a week). */
export function sumByProjectForDays(
  entries: TimeEntry[],
  dateKeys: string[],
  now: number = Date.now(),
): Record<string, number> {
  const dateKeySet = new Set(dateKeys);
  const totals: Record<string, number> = {};
  for (const entry of entries) {
    if (!dateKeySet.has(entry.dateKey)) continue;
    totals[entry.projectId] = (totals[entry.projectId] ?? 0) + getEntryDurationMs(entry, now);
  }
  return totals;
}

/**
 * Force-closes any entry still marked 'running' whose day has already passed
 * (e.g. the timer was left on overnight). Closes the open segment at 23:59:59.999
 * of the entry's own dateKey and marks it 'ended'. Returns the same array
 * reference when nothing needed closing, so callers can skip a state update.
 */
export function autoCloseStaleEntries(
  entries: TimeEntry[],
  todayKey: string,
): { entries: TimeEntry[]; changed: boolean } {
  let changed = false;
  const next = entries.map((entry) => {
    if (entry.status !== 'running' || entry.dateKey === todayKey) return entry;
    changed = true;
    return { ...closeOpenSegment(entry, endOfDay(entry.dateKey)), status: 'ended' as const };
  });
  return changed ? { entries: next, changed } : { entries, changed };
}

/** Replaces one segment's start and end time. Caller is responsible for validating the new values. */
export function updateSegment(entry: TimeEntry, segmentId: string, newStartISO: string, newEndISO: string): TimeEntry {
  return {
    ...entry,
    segments: entry.segments.map((s): Segment =>
      s.id === segmentId ? { ...s, start: newStartISO, end: newEndISO } : s,
    ),
  };
}
