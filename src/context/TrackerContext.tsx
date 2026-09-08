import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useTimeTracking } from '../hooks/useTimeTracking';

type TrackerContextValue = ReturnType<typeof useProjects> & ReturnType<typeof useTimeTracking>;

const TrackerContext = createContext<TrackerContextValue | null>(null);

export function TrackerProvider({ children }: { children: ReactNode }) {
  const projectsApi = useProjects();
  const timeTrackingApi = useTimeTracking();

  const value: TrackerContextValue = { ...projectsApi, ...timeTrackingApi };

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>;
}

export function useTracker(): TrackerContextValue {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error('useTracker must be used within a TrackerProvider');
  return ctx;
}
