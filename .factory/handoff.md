# Done Here repair handoff — PASS

- Work order: `chore-proof-calendar-repair-4`
- Base verification: `78489f8bc2222f483715a591c7cc29a549d76be5`
- Repaired candidate: the committed `main` repair revision
- Date: 2026-08-29 UTC

## Repair

The independent verifier found one release blocker: at 390 px the footer
**Terms** link was `38.30 × 44 px`. Anchors only had a minimum height, so a
short link could remain too narrow.

- `src/styles.css` now gives every anchor `min-width: 44px` and
  `min-height: 44px`.
- `@regression:mobile-target-size` now measures both width and height for each
  visible header, demo-banner, and footer control at the 390 × 844 mobile
  viewport. This includes Terms.
- The service-worker cache key is now `done-here-v4`, so deployed existing
  installs fetch this repaired app shell rather than retaining the old cached
  inline CSS. The offline claim checks that exact cache key.

The brief, local-first storage, PWA class, demo sandbox, exports, photo policy,
and all formerly passing behavior remain unchanged.

## Verification

Clean install and production gates:

```sh
npm ci                         # 141 packages; 0 vulnerabilities
npm run lint                   # pass, zero warnings
npm run typecheck              # pass
npm test                       # 14 Vitest tests; Playwright full suite passed
npm audit --omit=dev           # 0 vulnerabilities
```

All 16 exact commands in `.factory/claims.json` passed from the clean install.
After the cache-version edit, the exact `@claim:offline-reload` command was run
again and passed. It loads `/demo`, verifies `done-here-v4` has the app shell,
then reloads while browser networking is disabled.

The final production build produced `dist/index.html` at 48.39 kB raw / 15.71
kB gzip. The focused mobile regression passes:

```sh
npm run test:e2e -- --grep @regression:mobile-target-size --project=mobile
```

An additional production-build Playwright sweep visited `/`, `/app`, `/demo`,
`/privacy`, `/terms`, and `/404` at both 1280 × 720 and 390 × 844. All 12
route/viewport combinations had zero serious or critical Axe findings, zero
browser console/page errors, and every visible header/demo/footer target was
at least 44 × 44 px. Keyboard calendar navigation, dialog behavior, privacy,
exports/import recovery, billing response, PWA offline behavior, and route
metadata are covered by the complete existing Playwright suite and claim tests.

`verify-url.sh` against the local production preview at `/demo` passed:

- title `Demo — Done Here`, `lang="en"`, one `h1`, and one `main`;
- no missing image alt text or unlabeled buttons;
- no browser errors; 525 ms network-idle load.

Its captured evidence is in
`.factory/evidence-repair-4-local/`.

## Deploy and known gaps

The static deployment is triggered by pushing `main` to the configured origin.
The live URL and build identity are checked after that push. There are no known
product gaps from this repair.

## Run locally

```sh
npm ci
npm test
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/demo` for the isolated sample-data calendar.
