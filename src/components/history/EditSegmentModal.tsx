import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface EditSegmentModalProps {
  projectName: string;
  segmentStart: string;
  segmentEnd: string;
  onSave: (newStartISO: string, newEndISO: string) => void;
  onClose: () => void;
}

function toTimeInputValue(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function EditSegmentModal({ projectName, segmentStart, segmentEnd, onSave, onClose }: EditSegmentModalProps) {
  const [startTime, setStartTime] = useState(() => toTimeInputValue(segmentStart));
  const [endTime, setEndTime] = useState(() => toTimeInputValue(segmentEnd));
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const day = new Date(segmentStart);
    const buildTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      const d = new Date(day);
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    const newStart = buildTime(startTime);
    const newEnd = buildTime(endTime);

    if (newEnd.getTime() <= newStart.getTime()) {
      setError('End time must be after the start time.');
      return;
    }
    if (newEnd.getTime() > Date.now()) {
      setError('End time cannot be in the future.');
      return;
    }
    onSave(newStart.toISOString(), newEnd.toISOString());
  };

  return (
    <Modal title="Edit session" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-300">{projectName}</p>
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="segment-start" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Start time
            </label>
            <input
              id="segment-start"
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
            <label htmlFor="segment-end" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              End time
            </label>
            <input
              id="segment-end"
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
