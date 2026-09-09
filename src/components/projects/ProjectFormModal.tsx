import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Project } from '../../types';

const PRESET_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#64748b'];

interface ProjectFormModalProps {
  project?: Project;
  onSave: (name: string, color: string, isBreak: boolean) => void;
  onClose: () => void;
}

export function ProjectFormModal({ project, onSave, onClose }: ProjectFormModalProps) {
  const [name, setName] = useState(project?.name ?? '');
  const [color, setColor] = useState(project?.color ?? PRESET_COLORS[0]);
  const [isBreak, setIsBreak] = useState(project?.isBreak ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed, color, isBreak);
  };

  return (
    <Modal title={project ? 'Edit project' : 'Add project'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="project-name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Name
          </label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
            placeholder="e.g. Client A"
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Color</span>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Choose color ${c}`}
                className={`h-7 w-7 rounded-full ring-offset-2 dark:ring-offset-slate-900 ${color === c ? 'ring-2 ring-slate-900 dark:ring-white' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={isBreak}
            onChange={(e) => setIsBreak(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600"
          />
          <span className="text-slate-700 dark:text-slate-300">
            This is break/rest time
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              Tracked normally, but excluded from the daily work total and overtime.
            </span>
          </span>
        </label>
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
