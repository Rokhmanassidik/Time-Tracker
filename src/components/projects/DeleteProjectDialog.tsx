import { ConfirmDialog } from '../ui/ConfirmDialog';
import type { Project } from '../../types';

interface DeleteProjectDialogProps {
  project: Project;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteProjectDialog({ project, onConfirm, onCancel }: DeleteProjectDialogProps) {
  return (
    <ConfirmDialog
      title="Delete project"
      message={`Delete "${project.name}"? Its tracked time will stay in History and Weekly Summary, but you won't be able to start new timers for it.`}
      confirmLabel="Delete"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
