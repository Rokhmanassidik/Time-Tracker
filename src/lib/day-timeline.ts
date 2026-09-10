import type { Segment, TimeEntry } from '../types';

/** A contiguous slice of a day's work range, assigned to a project or left unassigned (null). */
export interface TimelineBlock {
  start: string;
  end: string;
  projectId: string | null;
}

/**
 * Flattens every project's segments for a day into one sorted, gap-free timeline.
 * The work range defaults to the earliest segment start / latest segment end for
 * that day; any gap inside that range becomes a `projectId: null` block.
 */
export function buildDayTimeline(
  entries: TimeEntry[],
  dateKey: string,
): { blocks: TimelineBlock[]; workStart: string; workEnd: string } {
  const dayEntries = entries.filter((e) => e.dateKey === dateKey);

  // A still-open segment (e.g. the timer was left running) is treated as ending
  // "now" so its elapsed time shows up as a normal, editable block instead of
  // silently disappearing from the timeline.
  const nowISO = new Date().toISOString();
  const raw: TimelineBlock[] = dayEntries.flatMap((entry) =>
    entry.segments.map((s) => ({ start: s.start, end: s.end ?? nowISO, projectId: entry.projectId })),
  );
  raw.sort((a, b) => a.start.localeCompare(b.start));

  const workStart = raw.length > 0 ? raw[0].start : new Date().toISOString();
  const workEnd = raw.length > 0 ? raw.reduce((max, b) => (b.end > max ? b.end : max), raw[0].end) : workStart;

  const blocks: TimelineBlock[] = [];
  let cursor = workStart;
  for (const block of raw) {
    if (block.start > cursor) blocks.push({ start: cursor, end: block.start, projectId: null });
    blocks.push(block);
    cursor = block.end > cursor ? block.end : cursor;
  }
  if (cursor < workEnd) blocks.push({ start: cursor, end: workEnd, projectId: null });

  return { blocks: mergeAdjacent(blocks), workStart, workEnd };
}

/** Merges consecutive blocks that share the same projectId (including two adjacent nulls). */
function mergeAdjacent(blocks: TimelineBlock[]): TimelineBlock[] {
  const merged: TimelineBlock[] = [];
  for (const block of blocks) {
    const last = merged[merged.length - 1];
    if (last && last.projectId === block.projectId && last.end === block.start) {
      last.end = block.end;
    } else {
      merged.push({ ...block });
    }
  }
  return merged;
}

/**
 * Assigns `projectId` (or null to clear) to [rangeStart, rangeEnd) within the timeline,
 * splitting/trimming overlapped blocks as needed. The result always keeps blocks
 * contiguous. Callers are responsible for keeping rangeStart/rangeEnd within
 * the day's own [workStart, workEnd] bounds.
 */
export function assignRange(
  blocks: TimelineBlock[],
  rangeStart: string,
  rangeEnd: string,
  projectId: string | null,
): TimelineBlock[] {
  if (rangeEnd <= rangeStart) return blocks;

  const pieces: TimelineBlock[] = [];
  for (const block of blocks) {
    const overlapStart = block.start > rangeStart ? block.start : rangeStart;
    const overlapEnd = block.end < rangeEnd ? block.end : rangeEnd;

    if (overlapStart >= overlapEnd) {
      // No overlap with the assigned range at all.
      pieces.push(block);
      continue;
    }
    if (block.start < overlapStart) pieces.push({ start: block.start, end: overlapStart, projectId: block.projectId });
    pieces.push({ start: overlapStart, end: overlapEnd, projectId });
    if (block.end > overlapEnd) pieces.push({ start: overlapEnd, end: block.end, projectId: block.projectId });
  }

  return mergeAdjacent(pieces);
}

/** Grows the work range with a new Unassigned block, or clips/drops blocks when shrinking. */
export function resizeWorkRange(blocks: TimelineBlock[], newWorkStart: string, newWorkEnd: string): TimelineBlock[] {
  if (newWorkEnd <= newWorkStart) return blocks;

  let next: TimelineBlock[] = blocks
    .map((b) => ({
      start: b.start < newWorkStart ? newWorkStart : b.start,
      end: b.end > newWorkEnd ? newWorkEnd : b.end,
      projectId: b.projectId,
    }))
    .filter((b) => b.start < b.end);

  const currentStart = next.length > 0 ? next[0].start : newWorkEnd;
  const currentEnd = next.length > 0 ? next[next.length - 1].end : newWorkStart;

  if (newWorkStart < currentStart) next = [{ start: newWorkStart, end: currentStart, projectId: null }, ...next];
  if (newWorkEnd > currentEnd) next = [...next, { start: currentEnd, end: newWorkEnd, projectId: null }];

  return mergeAdjacent(next);
}

/** Converts a finished timeline back into per-project TimeEntry rows for that day. */
export function timelineToEntries(blocks: TimelineBlock[], dateKey: string): TimeEntry[] {
  const byProject = new Map<string, Segment[]>();
  for (const block of blocks) {
    if (block.projectId === null) continue;
    const segments = byProject.get(block.projectId) ?? [];
    segments.push({ id: crypto.randomUUID(), start: block.start, end: block.end });
    byProject.set(block.projectId, segments);
  }

  return [...byProject.entries()].map(([projectId, segments]) => ({
    id: crypto.randomUUID(),
    projectId,
    dateKey,
    segments,
    // 'paused', not 'ended' — a Day Detail edit is a correction, not a declaration
    // that the project is done for the day. Start/Resume must stay available;
    // the user can still hit End explicitly if they really are finished.
    status: 'paused' as const,
  }));
}
