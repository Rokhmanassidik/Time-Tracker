import { Download, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { buildExportPayload, downloadExport, mergeImportedData, parseImportPayload } from '../../lib/export-import';
import { Button } from '../ui/Button';

export function ExportImportControls() {
  const { projects, timeEntries, setProjects, setTimeEntries } = useTracker();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [importedAt, setImportedAt] = useState<number | null>(null);

  const handleExport = () => {
    downloadExport(buildExportPayload(projects, timeEntries));
  };

  const handleImportClick = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const payload = parseImportPayload(text);
      const merged = mergeImportedData(projects, timeEntries, payload);
      setProjects(merged.projects);
      setTimeEntries(merged.timeEntries);
      setError(null);
      setImportedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import file.');
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <Button variant="secondary" onClick={handleExport}>
          <Download size={15} />
          Export JSON
        </Button>
        <Button variant="secondary" onClick={handleImportClick}>
          <Upload size={15} />
          Import JSON
        </Button>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      {!error && importedAt && <p className="text-xs text-emerald-600 dark:text-emerald-400">Import successful.</p>}
    </div>
  );
}
