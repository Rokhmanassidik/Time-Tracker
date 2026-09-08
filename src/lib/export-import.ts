import type { ExportPayload, Project, TimeEntry } from '../types';

export function buildExportPayload(projects: Project[], timeEntries: TimeEntry[]): ExportPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    projects,
    timeEntries,
  };
}

export function downloadExport(payload: ExportPayload): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `time-tracker-backup-${payload.exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImportPayload(raw: string): ExportPayload {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('File is not valid JSON.');
  }
  if (
    typeof data !== 'object' ||
    data === null ||
    !Array.isArray((data as ExportPayload).projects) ||
    !Array.isArray((data as ExportPayload).timeEntries)
  ) {
    throw new Error('File does not look like a Time Tracker export.');
  }
  return data as ExportPayload;
}

/** Merges imported data into existing data by id; imported rows win on collision. */
export function mergeImportedData(
  existingProjects: Project[],
  existingEntries: TimeEntry[],
  incoming: ExportPayload,
): { projects: Project[]; timeEntries: TimeEntry[] } {
  const projectMap = new Map(existingProjects.map((p) => [p.id, p]));
  for (const p of incoming.projects) projectMap.set(p.id, p);

  const entryMap = new Map(existingEntries.map((e) => [e.id, e]));
  for (const e of incoming.timeEntries) entryMap.set(e.id, e);

  return {
    projects: [...projectMap.values()],
    timeEntries: [...entryMap.values()],
  };
}
