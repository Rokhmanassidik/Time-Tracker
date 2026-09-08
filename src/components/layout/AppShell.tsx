import { Clock } from 'lucide-react';
import type { ReactNode } from 'react';
import { TabBar } from './TabBar';
import type { Tab } from './TabBar';
import { ExportImportControls } from '../data/ExportImportControls';

interface AppShellProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  children: ReactNode;
}

export function AppShell({ activeTab, onTabChange, children }: AppShellProps) {
  return (
    <div className="min-h-svh bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Clock size={17} strokeWidth={2.25} />
            </span>
            <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">Time Tracker</h1>
          </div>
          <TabBar active={activeTab} onChange={onTabChange} />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4 flex justify-end">
          <ExportImportControls />
        </div>
        {children}
      </main>
    </div>
  );
}
