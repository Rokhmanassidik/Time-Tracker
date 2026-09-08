import { useCallback } from 'react';
import { useLocalStorageState } from './useLocalStorageState';
import type { Project } from '../types';

const STORAGE_KEY = 'time-tracker:projects';

export function useProjects() {
  const [projects, setProjects] = useLocalStorageState<Project[]>(STORAGE_KEY, []);

  const addProject = useCallback(
    (name: string, color: string) => {
      const project: Project = {
        id: crypto.randomUUID(),
        name,
        color,
        createdAt: new Date().toISOString(),
      };
      setProjects((prev) => [...prev, project]);
      return project;
    },
    [setProjects],
  );

  const updateProject = useCallback(
    (id: string, patch: Partial<Pick<Project, 'name' | 'color'>>) => {
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    },
    [setProjects],
  );

  const deleteProject = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    },
    [setProjects],
  );

  return { projects, setProjects, addProject, updateProject, deleteProject };
}
