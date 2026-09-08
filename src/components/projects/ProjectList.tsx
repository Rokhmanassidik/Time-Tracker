import { FolderPlus, Plus } from 'lucide-react';
import { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { ProjectCard } from './ProjectCard';
import { ProjectFormModal } from './ProjectFormModal';
import { DeleteProjectDialog } from './DeleteProjectDialog';
import { DailySummaryBar } from './DailySummaryBar';
import { Button } from '../ui/Button';
import type { Project } from '../../types';

export function ProjectList() {
  const { projects, addProject, updateProject, deleteProject } = useTracker();
  const [editing, setEditing] = useState<Project | null | 'new'>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Projects</h1>
        <Button onClick={() => setEditing('new')}>
          <Plus size={15} />
          Add project
        </Button>
      </div>

      <DailySummaryBar />

      {projects.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          <FolderPlus size={28} className="text-slate-300 dark:text-slate-600" />
          No projects yet. Add one to start tracking time.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => setEditing(project)}
              onDelete={() => setDeleting(project)}
            />
          ))}
        </div>
      )}

      {editing && (
        <ProjectFormModal
          project={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSave={(name, color) => {
            if (editing === 'new') {
              addProject(name, color);
            } else {
              updateProject(editing.id, { name, color });
            }
            setEditing(null);
          }}
        />
      )}

      {deleting && (
        <DeleteProjectDialog
          project={deleting}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            deleteProject(deleting.id);
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
