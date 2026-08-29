# Demo sandbox

- URL: `https://chore-proof-calendar.sociobot.in/demo`
- Local URL: `http://localhost:5173/demo`
- Query entry: `/?demo=1` (the first-screen Try action uses this URL)

The sample contains four household chores and seven completions across ten
days. Notes cover plants, bed sheets, a fridge shelf, and a coffee filter.

The demo keeps its mutable copy in memory. It never opens the real IndexedDB
database and never reads or writes local storage, including production license
keys. A license-bearing demo URL is ignored, and cached license state cannot
change the demo. Reloading or choosing **Reset demo** restores the bundled
sample. **Start for real** opens `/app` without copying any sample record.

Verifiers can mark a chore done, inspect the calendar, export every format, set
the browser offline, and reload `/demo`. The service worker keeps the demo app
and its sample available after the first visit. On exit, the app reads the
complete real calendar before it renders or enables a real-data change.
