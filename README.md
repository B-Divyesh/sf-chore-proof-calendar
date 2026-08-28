# Done Here

Done Here records when recurring household chores were completed. It is for
homes that need a visible history instead of scores or overdue badges.

Chores, notes, and optional photos live in browser storage. The app works after
the first visit without internet. It exports timezone-aware ICS, PDF, CSV, and
a full JSON backup.

Live site: <https://chore-proof-calendar.sociobot.in>

Try the isolated demo: <https://chore-proof-calendar.sociobot.in/demo>

## Features

- Named chores with a recurrence from 1 to 365 days
- One-tap completion with immediate last-done and calendar-day due dates
- Optional notes and consent-aware photos
- Monthly completion calendar with keyboard navigation
- ICS, PDF, CSV, and JSON export, plus JSON restore
- Offline app shell and installable PWA manifest
- Separate sample-data demo that does not read or write real data
- Free core calendar with five photos
- $12 one-time Household Pack with storage for 500 photos

The paid link uses the Sociobot billing API.

## Run locally

Requires Node.js 20.19 or newer.

```sh
npm install
npm run dev
```

Open `http://localhost:5173`. Use `/demo` for the sample-data sandbox.

## Test and build

Playwright 1.58.2 is pinned because the factory image provides that browser.

```sh
npm test
npm run build
```

The exact production build command is `npm run build`. Static output lands in
`dist/`, with `dist/index.html` at its root.

Individual claim tests are listed in [`.factory/claims.json`](.factory/claims.json).

## Deploy

Upload the contents of `dist/` to the static host. The included
`staticwebapp.config.json` provides history fallback, a 404 rewrite, and
security headers. The factory owns DNS, product registration, and deployment.

## Data and privacy

Real data uses IndexedDB database `done-here:v1`. Demo data stays in memory and
resets on reload. No analytics, remote fonts, or third-party runtime scripts
are included. License verification sends only the pasted token to Sociobot.

Read the in-app `/privacy` and `/terms` pages before sharing a device or buying
the Household Pack.

## License

MIT. See [LICENSE](LICENSE).
