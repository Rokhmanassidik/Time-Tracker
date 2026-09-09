export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  /** Break/rest time — tracked normally but excluded from the daily work total and overtime. */
  isBreak: boolean;
}

/** One contiguous block of work. `end === null` means the segment is currently running. */
export interface Segment {
  id: string;
  start: string;
  end: string | null;
}

/** All of one project's work segments for a single local calendar day. */
export interface TimeEntry {
  id: string;
  projectId: string;
  dateKey: string;
  segments: Segment[];
  status: 'running' | 'paused' | 'ended';
}

export interface ExportPayload {
  version: 1;
  exportedAt: string;
  projects: Project[];
  timeEntries: TimeEntry[];
}
