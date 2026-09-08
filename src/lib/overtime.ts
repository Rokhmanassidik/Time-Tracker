import { getEntryDurationMs } from './time-entries';
import type { TimeEntry } from '../types';

/** Regular workday length before overtime kicks in. */
export const DAILY_REGULAR_MS = 8 * 60 * 60 * 1000;

/** Total ms worked on a given day, across every project combined. */
export function getDayTotalMs(entries: TimeEntry[], dateKey: string, now: number = Date.now()): number {
  return entries
    .filter((e) => e.dateKey === dateKey)
    .reduce((total, entry) => total + getEntryDurationMs(entry, now), 0);
}

export function getRegularMs(dayTotalMs: number): number {
  return Math.min(dayTotalMs, DAILY_REGULAR_MS);
}

export function getOvertimeMs(dayTotalMs: number): number {
  return Math.max(0, dayTotalMs - DAILY_REGULAR_MS);
}
