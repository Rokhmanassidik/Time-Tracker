import { useState } from 'react';
import { TrackerProvider } from './context/TrackerContext';
import { AppShell } from './components/layout/AppShell';
import type { Tab } from './components/layout/TabBar';
import { ProjectList } from './components/projects/ProjectList';
import { HistoryView } from './components/history/HistoryView';
import { WeeklySummaryView } from './components/weekly/WeeklySummaryView';

function App() {
  const [tab, setTab] = useState<Tab>('dashboard');

  return (
    <TrackerProvider>
      <AppShell activeTab={tab} onTabChange={setTab}>
        {tab === 'dashboard' && <ProjectList />}
        {tab === 'history' && <HistoryView />}
        {tab === 'weekly' && <WeeklySummaryView />}
      </AppShell>
    </TrackerProvider>
  );
}

export default App;
