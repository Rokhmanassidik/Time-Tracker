import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Project } from '../../types';

interface AssignRangeModalProps {
  projects: Project[];
  workStart: string;
  workEnd: string;
  initialStart: string;
  initialEnd: string;
  initialProjectId: string | null;
  onSave: (startISO: string, endISO: string, projectId: string | null) => void;
  onClose: () => void;
}

function toTimeInputValue(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function AssignRangeModal({
  projects,
  workStart,
  workEnd,
  initialStart,
  initialEnd,
  initialProjectId,
  onSave,
  onClose,
}: AssignRangeModalProps) {
  const [startTime, setStartTime] = useState(() => toTimeInputValue(initialStart));
  const [endTime, setEndTime] = useState(() => toTimeInputValue(initialEnd));
  const [projectId, setProjectId] = useState<string>(initialProjectId ?? '');
  const [error, setError] = useState<string | null>(null);

  const day = new Date(workStart);
  const buildTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const d = new Date(day);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = buildTime(startTime);
    const end = buildTime(endTime);

    if (end.getTime() <= start.getTime()) {
      setError('End time must be after the start time.');
      return;
    }
    if (start.getTime() < new Date(workStart).getTime() || end.getTime() > new Date(workEnd).getTime()) {
      setError('Time must be within the work range for this day.');
      return;
    }
    onSave(start.toISOString(), end.toISOString(), projectId === '' ? null : projectId);
  };

  return (
    <Modal title="Assign session" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="assign-project" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Project
          </label>
          <select
            id="assign-project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Unassigned</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="assign-start" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Start time
            </label>
            <input
              id="assign-start"
              type="time"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                setError(null);
              }}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="assign-end" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              End time
            </label>
            <input
              id="assign-end"
              type="time"
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                setError(null);
              }}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
}
