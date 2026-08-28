# Done Here repair handoff — PASS

- Work order: `chore-proof-calendar-repair-3`
- Failed candidate/base: `6e6e0d2f6564a7281a0b367c722e753c7bc6d98c`
- Repair commit: `e5ed3ec` (`fix: preserve calendar on rejected backup import`)
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Deployment: existing Azure Static Web App `sf-chore-proof-calendar` in Central US
- Verified: 2026-08-28 UTC

## Outcome

**PASS.** A malformed JSON backup now has a persistent, announced recovery
message and never replaces the existing calendar. The product remains the
original local-first static PWA with its IndexedDB storage, demo sandbox,
offline worker, and static deployment class.

## Repair

`replaceData()` already validates all chore and completion records before it
starts the IndexedDB write transaction. The regression was the UI feedback:
the import failure was placed only in a transient toast, which could disappear
during concurrent desktop/mobile browser runs. The failure is now rendered as
a persistent `role="alert"` in the import area:

> Backup was not imported. This backup has an invalid chore or completion.
> Your current calendar was not changed.

The alert is cleared only after a successful import. The focused Playwright
regression imports exactly
`{"chores":[{"id":"broken"}],"completions":[]}`, asserts the recovery
message, confirms the existing chore remains visible, downloads the current
backup to prove IndexedDB was unchanged, then reloads and confirms it again.
It runs in both Chromium desktop and the 390 × 844 mobile project.

## Verification

Commands run from a clean dependency install:

```sh
npm ci
npm run lint
npm run typecheck
CI=1 npx playwright test tests/e2e/product.spec.ts --grep @regression:malformed-backup --repeat-each=3 --reporter=line
CI=1 npm test
npm run build
```

- `npm ci`: 141 packages installed, 0 vulnerabilities.
- ESLint and TypeScript: pass with zero warnings/errors.
- Focused regression: 6/6 pass (three runs each on desktop and mobile).
- Unit suite: 14/14 pass.
- Full Playwright suite: 39 pass across Chromium and mobile, with one
  intentional desktop skip for the mobile-only touch-target measurement.
  This includes keyboard calendar navigation, offline reload, privacy/network,
  demo isolation, JSON restore, and mobile Axe coverage.
- `npm run build`: pass; `dist/index.html` is 48.38 kB raw / 15.71 kB gzip.

## Live verification and identity

- Deployed with `/opt/fleet/lib/deploy-static.sh chore-proof-calendar dist`.
- Live `/` SHA-256 equals local `dist/index.html`:
  `a7b460c224d039c961b8b4cca24fcc2d9ed0b649c340ace9ab9ddce4776bd25c`.
- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, 765 ms load, no console or
  page errors, title, `lang`, one h1, main landmark, and image/button labels.
- Live Axe scans found zero serious or critical findings on `/`, `/demo`,
  `/privacy`, and `/terms` at both desktop and 390 px mobile widths.
- Live malformed-import checks passed on desktop and mobile: exact recovery
  text shown; existing chore visible before and after reload; no browser errors.
- Live `/demo` completion and JSON export made no cross-origin requests. After
  worker control, an offline reload kept sample data and showed the offline
  notice.
- `/`, `/app`, `/demo`, `/privacy`, and `/terms` return 200. `/404` and an
  arbitrary missing route return 404.

Evidence is in `.factory/evidence-repair-3/` (`index.html`, desktop/mobile
screenshots, and `verify.json`).

## Known gaps

None for this repair. The live billing checkout is retained but no real charge
was submitted; payment, refunds, and license issuance remain handled by the
existing Sociobot/Dodo flow.
