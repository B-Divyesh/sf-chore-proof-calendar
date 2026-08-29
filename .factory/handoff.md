# Done Here polish 2 handoff — PASS

- Work order: `chore-proof-calendar-polish-2`
- Base reviewed: `990229fbb097e8039d725f82dc2520eb175a23b4`
- Repair commit: `385de6d`
- Deployment: `999990ef-1798-4f6f-8f24-3b06fa020f2a`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Completed: 2026-08-29 UTC

## What changed

- Closed F-2-1 through F-2-3: the first-screen and README wording no longer
  contradict overdue status, photo consent is stated as a checkbox, and the
  license disclosure is named **Enter a license**.
- Updated the photo-proof claim and its observable Playwright test. The test
  now confirms that a photo cannot save before consent is checked.
- Bumped the PWA shell cache to `done-here-v10` and manifest version query to
  `?v=10`, preserving in-place service-worker updates for existing installs.
- Removed remaining app-route mood labels in favor of functional labels while
  preserving the ceramic visual identity.
- Updated the verb-first catalog description and the copy audit.
- Revalidated all review-1 and review-2 findings. The complete mapping is in
  [`.factory/polish-2.md`](polish-2.md).

## Exact verification evidence

Fresh clone: `/tmp/chore-proof-calendar-polish-2-clean.n4G94U/repo` from
commit `385de6d`, followed by `npm ci`.

- Every one of the 23 exact commands in `.factory/claims.json` passed
  separately. This includes `@claim:demo-sandbox`, offline reload, all
  exports/restore, photo consent, license verification/revocation, keyboard
  calendar, paid limits, and mobile accessible baseline.
- Fresh-clone `npm test` passed: 17 unit tests and 60 Playwright tests, with
  two intended project-specific skips. Fresh-clone `npm run lint`,
  `npm run typecheck`, and `npm run build` passed; `dist/index.html` exists.
- Local browser matrix: `node .factory/verify-browser.mjs
  http://127.0.0.1:4173 /tmp/polish-2-browser-local.json` passed with 14
  route scans, no serious/critical Axe findings, no console errors, no mobile
  overflow, and 63 visible mobile targets at least 44 px.
- `node .factory/verify-update.mjs` passed: the update prompt appeared and
  refreshed the isolated demo into `done-here-v10-update-check` with four
  sample chores intact.
- Live cold check passed. [`browser-matrix.json`](evidence-polish-2-live/browser-matrix.json)
  records zero serious/critical Axe findings, console errors, external demo
  requests, overflow, or undersized controls; it also records working skip
  focus, dialog focus return, route focus, keyboard calendar, offline reload,
  reduced motion, and zoom.
- Live byte identity and response checks are in
  [`response-identity.json`](evidence-polish-2-live/response-identity.json):
  shell, worker, manifest, 404, images, and icons match `dist`; `/`, `/app`,
  `/demo`, `/privacy`, and `/terms` return 200; a missing route returns 404.
- [`finding-check.json`](evidence-polish-2-live/finding-check.json) confirms
  the corrected first-screen copy, no old overdue-badge text, one **Enter a
  license** control, `?demo=1`, the demo banner, Reset demo, Start for real,
  four sample chores, and no console errors. Screenshots: [desktop](evidence-polish-2-live/first-read-desktop.png)
  and [mobile demo](evidence-polish-2-live/first-read-demo-mobile.png).
- The standalone `@axe-core/cli` invocation could not start because its
  Selenium driver cannot find a Chrome binary in this container. The product's
  Playwright Axe integration ran instead, both in `@claim:accessible-baseline`
  and in the 14-route local/live browser matrices, with zero serious/critical
  findings.

## Run and deploy

```sh
npm ci
npm test
npm run lint
npm run typecheck
npm run build
```

Deploy the generated `dist/` through the factory static work order. This
repair was deployed with `/opt/fleet/lib/deploy-static.sh chore-proof-calendar dist`.

## Known gaps

None. All cumulative review findings are closed and live-verified.
