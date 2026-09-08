# Time Tracker

A personal time tracker for logging how much time you spend on each project, per day.

## Features

- **Projects** — add, edit, delete; shown as cards on the dashboard.
- **Timer** — Start / Pause / Resume / End per project, with a live-ticking display and today's total.
- **Overtime** — daily work beyond 8 hours (combined across all projects) is tracked as OT, shown on the dashboard, in History, and in the Weekly Summary.
- **Auto-stop** — a timer left running overnight is automatically closed at the end of the day it started, so it never silently bleeds into the next day.
- **History** — a day-by-day log of every session, with inline editing (start/end time) and delete.
- **Weekly summary** — per-project totals and a daily overtime breakdown for the selected week.
- **Export / Import** — download all data as JSON and restore it later, since everything is stored locally.

## Data storage

All data lives in the browser's `localStorage` — there's no backend or account. That means it persists across restarts on the same browser/device, but isn't backed up anywhere automatically. Use **Export JSON** periodically if you want a portable backup.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
```

Built with React, TypeScript, Vite, and Tailwind CSS.
