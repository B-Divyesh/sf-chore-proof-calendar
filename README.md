# Done Here

Done Here records when recurring household chores were completed. It is for
homes that need a visible history without scores.

Chores, notes, and optional photos live in browser storage. The app works after
the first visit without internet. It exports timezone-aware ICS, PDF, CSV, and
a full JSON backup.

Live site: <https://chore-proof-calendar.sociobot.in>

Try the isolated demo: <https://chore-proof-calendar.sociobot.in/?demo=1>

## Features

- Name chores and repeat each one every 1 to 365 days
- Mark a chore done once and see when it was last completed and next due
- Optional notes and photos, with a checkbox to confirm consent
- Monthly completion calendar with keyboard navigation
- ICS, PDF, CSV, and JSON export, plus JSON restore
- Works without internet after the first visit and can be installed as an app
- Separate sample-data demo that does not read or write real calendar or license data
- Free core calendar with five photos
- $12 one-time Household Pack with storage for 500 photos

The $12 purchase opens Sociobot checkout.

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

Upload the contents of `dist/` to the static host. The included host settings
keep direct links working, show a 404 page for missing addresses, and set
security headers. The factory owns DNS, product registration, and deployment.

## Data and privacy

Your real calendar is stored only in this browser. Demo changes disappear when
you reload and never change your real calendar. No analytics, remote fonts, or third-party runtime scripts are included. License verification sends only the pasted token to Sociobot.

Read the in-app `/privacy` and `/terms` pages before sharing a device or buying
the Household Pack.

## License

MIT. See [LICENSE](LICENSE).
