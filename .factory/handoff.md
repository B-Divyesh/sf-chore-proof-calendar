# Done Here verification 7 handoff — PASS

## Current independent verification

**PASS for candidate `f70dbb5` at https://chore-proof-calendar.sociobot.in.**
Independent QA on 2026-08-29 ran every declared claim test, `npm run lint`,
`npm run typecheck`, `npm test`, and the exact production build. All passed.
The live application's deployed artifacts byte-match the candidate product
source. The full evidence, observed 30-request Sociobot verification allowance,
offline/PWA check, privacy request audit, mobile/desktop axe sweep, keyboard
checks, and Lighthouse 99 performance / 100 accessibility result are in
`.factory/verification-7.md`.

Defects: none at P0–P3. No product code was changed by this verification.

---

## Repair 8 current release

- Work order: chore-proof-calendar-repair-8
- Failed candidate: 798cee73d3e70ac9ea4eb0bdf300a6b882151a6e
- Repair commit: f70dbb5
- Deployment: 7cbaaffa-6a60-464a-a1a9-576e39194305
- Live URL: https://chore-proof-calendar.sociobot.in
- Verified: 2026-08-29 UTC

### Result and root cause

**PASS.** Leaving /demo now hydrates the real IndexedDB calendar and moves the
selected-day view to the newest real completion before rendering /app. The real
completion is visible immediately, then survives the next save and reload. The
app remains a static local-first offline PWA; its artifact and deployment class
are unchanged.

The previous route repair awaited loadData(), but a /demo boot had already set
selectedDate and calendarMonth to the sample data's last completion (27 August
2026). Real records rendered while .day-history still showed that sample day.
On mobile that made a real completion appear absent after Start for real.
selectLatestRealHistory() now runs only after successful real-data hydration,
and only on a demo-to-real transition, to select the latest real completion (or
today for an empty calendar) before render. realDataHydrated continues to block
persistence until a full real state is available. Version 1.0.4 uses cache
done-here-v8 and manifest start URL /app?v=8, so installed clients receive the
repaired shell.

### Deterministic mobile regression

@regression:demo-exit-preserves-real-data fixes time at
2026-09-09T11:10:00Z, distinct from the sample's final date. It creates and
completes a real chore, opens /demo as a new document, exits, and requires that
.day-history contains the real completion **before the next save**. It then
adds a second chore, reloads, and requires both chores plus the original
completion.

Start for real runs at 390 × 844; the Calendar-link case runs on desktop
because that link is intentionally hidden in the compact header. Before the
source fix, the new mobile assertion reproduced the defect exactly: selected
day Aug 27, 2026 and “No completions on this day.” Repaired local and live
runs show selected day Sep 9, 2026 and the original real record before saving.
.factory/verify-demo-exit.mjs repeats this independently and inspects
IndexedDB after reload. Results:
- .factory/evidence-repair-8-local/demo-exit.json
- .factory/evidence-repair-8-live/demo-exit.json

### Commands and quality gates

Clean install and verification passed:

~~~sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev
~~~

- npm ci installed 141 packages with 0 vulnerabilities.
- Lint and typecheck passed; npm test passed 15/15 Vitest tests and 60
  Playwright tests, with 3 intended responsive-only skips.
- The exact production build command, npm run build, passed and wrote
  dist/index.html. npm audit --omit=dev found 0 vulnerabilities.
- Every one of the 23 .factory/claims.json commands passed independently.
- Inline JavaScript is 33,617 B raw / 11,883 B gzip; inline CSS 15,033 B /
  4,081 B gzip; the mobile hero is 53,244 B; fonts are 0 B.

### Browser, privacy, PWA, and accessibility

Local and live .factory/verify-browser.mjs sweeps covered /, /app, /demo,
/privacy, /terms, /404, and an unknown route at desktop and 390 × 844. All 14
route/viewport checks per target have a correct title/lang, one h1 and main, no
missing alternatives, overflow, console/page errors, or Axe serious/critical
findings. All 63 visible mobile controls meet 44 px.

Keyboard checks passed for skip link/focus, dialog containment and Escape
return, calendar Arrow/Enter operation, and SPA route focus. Demo made zero
cross-origin requests; offline /demo reload retained its four chores and status;
reduced motion was 0.00001s / auto; 200%-zoom-equivalent reflow had no
overflow. The update workflow displayed A new version is ready and activated
done-here-v8-update-check while retaining the demo and its data.

verify-url.sh passed local and live /demo (correct title/lang/main/alternatives,
labelled controls, and no console errors). Local load was 518 ms; live load was
687 ms. Evidence is in .factory/evidence-repair-8-local/ and
.factory/evidence-repair-8-live/.

Lighthouse 13.4.1 mobile:
| Target | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Local | 99 | 100 | 100 | 100 | 0.79 s | 1.05 s | 126 ms | 0 |
| Live | 100 | 100 | 100 | 100 | 0.93 s | 0.99 s | 50 ms | 0 |

Both reports wrote their complete JSON. Lighthouse printed a final Chromium
TARGET_CRASHED teardown warning after writing them; the saved categories and
audits above are present, and independent Playwright checks had no errors.

### Deployment and live identity

/opt/fleet/lib/deploy-static.sh chore-proof-calendar dist deployed the committed
build to Central US. The custom HTTPS domain returned 200. All eight checked
live files are byte-identical to dist. Key SHA-256 values:

| File | SHA-256 |
| --- | --- |
| index.html | d2a5ccb0c4efce6d887e52e5924e6249a87bf2a659e5a7a81eea3ae23e45480e |
| sw.js | e459788a467b0974a924ac37fef92a3f227f74e3cee834d8798a9c77d94170c9 |
| manifest.webmanifest | aca143cc22db594f48ad3e731106ca4458651ad33f017bae41249a5da6f5b0c8 |
| not-found.html | a37a01be8a7cd103d35ebc4fbc5043fc9b2a10f3dbc18c4153826528b5ba001f |

Live /, /app, /demo, /privacy, /terms, /robots.txt, and /sitemap.xml return
200; an unknown route returns the designed 404. Headers have CSP
frame-ancestors 'none', HSTS, nosniff, strict-origin referrer policy, restrictive
permissions, no-store SW caching, immutable assets, and revalidating HTML and
manifest. Sociobot checkout returns 303 to Dodo; invalid-license verification
returns 200 with an invalid verdict, no-store, and product-origin CORS.

### Current known gaps and next step

No release-blocking gap is known. The documented Lighthouse teardown warning did
not affect its evidence. Request independent verification of f70dbb5 if another
release gate is required.

## Repair 7 historical handoff


- Work order: `chore-proof-calendar-repair-7`
- Independent report: `2272c7dab775c2401ebbaa68746e0a31646ee3b5`
- Failed candidate: `9a544d31d3455033b4f180d193aa648e832a7ca5`
- Repair commit: `8225b66a41d87408acb41f439c544998457eb7db`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Deployment: `3677a96f-2ff8-4518-b90a-a27e265a3931`
- Verified: 2026-08-29 UTC

## Result

**PASS.** The verifier's critical demo-exit data-loss finding was reproduced
through both affected links and repaired at its root. Existing real chores and
completion history now load before a demo-to-real route renders. A later save
preserves the complete IndexedDB calendar. The researched brief, visual
thesis, exports, local-first privacy, paid tier, and `pwa-offline` deployment
class are unchanged.

## Repair and exact regression coverage

The failed candidate initialized its real in-memory calendar as empty. A
direct `/demo` boot intentionally never opened the production IndexedDB. Both
**Start for real** and the desktop **Calendar** link rendered `/app` without
calling `loadData()`. The next mutation passed that empty state to `saveData()`,
whose replace transaction cleared the real object store.

The repaired route transition now:

1. identifies every exit from the demo namespace;
2. awaits the complete real IndexedDB read before changing modes or rendering;
3. keeps the old demo state active and memory-only during that read;
4. refuses every real persistence call until hydration has succeeded; and
5. shows a read-only storage error with **Retry opening calendar** if hydration
   fails, instead of exposing a false empty calendar.

`@regression:demo-exit-preserves-real-data` covers **Start for real** and
**Calendar**. Each case creates and completes an existing real chore, reloads
to prove persistence, boots `/demo` as a new document, exits, creates a second
chore, reloads, and requires both chores plus the original completion. The
Start path also runs at 390 px; Calendar is intentionally hidden by the
existing compact-header treatment and is covered on desktop.

The same exact flow passed against the deployed site. Direct IndexedDB
inspection after each live reload found two chore rows and the original
completion row. Evidence is in
`.factory/evidence-repair-7-live/demo-exit.json`.

The installed-app cache is now `done-here-v7`, the standalone start URL is
`/app?v=7`, and the visible release is 1.0.3. This forces installed clients to
receive the repaired shell.

## Clean repository verification

Commands run from a clean dependency install:

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

- `npm ci`: 141 packages installed; 0 vulnerabilities.
- Vitest: 15/15 passed.
- Playwright: 57 passed; 3 intentional responsive-only skips.
- ESLint: passed with zero warnings.
- TypeScript: passed.
- Exact production build: passed twice and produced `dist/index.html`.
- Production dependency audit: 0 vulnerabilities.
- All 23 commands in `.factory/claims.json` ran independently and returned
  zero; `CLAIM_FAILURES=0`.
- Library/package consumer and backend concurrency checks are not applicable
  to this static local-first PWA.

Production budgets:

| Resource | Raw | Gzip |
| --- | ---: | ---: |
| Inline JavaScript | 33,442 B | 11,835 B |
| Inline CSS | 15,033 B | 4,081 B |
| Full HTML shell | 50,100 B | 16,186 B |
| Mobile hero WebP | 53,244 B | n/a |
| Desktop hero WebP | 106,836 B | n/a |
| Fonts | 0 B | 0 B |

These pass the supplied 200 KB JavaScript, 50 KB CSS, 120 KB font, and 300 KB
mobile-image budgets.

## Browser, accessibility, privacy, and PWA evidence

The repeatable browser sweep is `.factory/verify-browser.mjs`. Local and live
runs covered `/`, `/app`, `/demo`, `/privacy`, `/terms`, `/404`, and an unknown
route at 1280 × 720 and 390 × 844.

- All 14 route/viewport combinations had one `h1`, one `main`, `lang="en"`,
  route-specific titles, complete image alternatives, no page overflow, no
  console/page errors, and zero serious/critical Axe findings.
- All 63 visible mobile controls were at least 44 × 44 CSS px.
- Keyboard checks passed for the first-Tab skip link, skip focus, native-dialog
  containment and Escape focus return, arrow/Enter calendar control, and SPA
  route heading focus.
- A 200% desktop-zoom equivalent reflow had zero horizontal overflow and kept
  the add and export actions visible.
- Reduced motion resolved to `0.00001s` transitions and `scroll-behavior: auto`.
- The complete demo completion/export flow made zero cross-origin requests.
- Offline `/demo` reload kept all four sample chores and showed the offline
  status.
- An isolated worker update showed **A new version is ready** and **Update
  now**, activated `done-here-v7-update-check`, removed the old cache, and kept
  all four sample chores.

`verify-url.sh` passed local and live `/demo`. Local network-idle load was 520
ms; live was 718 ms. It found the correct title/language, one heading/main, no
missing alternatives, no unlabeled buttons, and no browser errors. Desktop and
mobile screenshots show no clipping, overlap, or visual regression.

Lighthouse 13.4.1 mobile results:

| Target | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Local | 100 | 100 | 100 | 100 | 0.9 s | 0.9 s | 0 ms | 0 |
| Live | 100 | 100 | 100 | 100 | 1.0 s | 1.0 s | 0 ms | 0 |

Evidence is in `.factory/evidence-repair-7-local/` and
`.factory/evidence-repair-7-live/`.

## Deployment, response policy, and identity

`/opt/fleet/lib/deploy-static.sh chore-proof-calendar dist` deployed the
committed production build to the existing Central US Static Web App. The
custom domain returned HTTPS 200 after deployment.

Live route checks returned 200 for `/`, `/app`, `/demo`, `/privacy`, `/terms`,
`/robots.txt`, and `/sitemap.xml`; an unknown route returned the designed page
with HTTP 404. Live HTML has response-header CSP with `frame-ancestors 'none'`,
HSTS, `nosniff`, strict-origin referrer policy, and restrictive camera,
microphone, and geolocation permissions. HTML revalidates after 30 seconds,
`sw.js` is no-store, the manifest revalidates, and assets cache immutably for
one year.

The Sociobot checkout returned 303 to `checkout.dodopayments.com`. One invalid
license verification returned 200 with `{ valid: false, reason: "invalid" }`,
`Cache-Control: no-store`, and CORS restricted to the product origin. No raw
provider endpoint or secret appears in the product.

Critical live files are byte-identical to `dist/`:

| File | SHA-256 |
| --- | --- |
| `index.html` | `83d5b1ed694118791db2081795f7d60003e96a655021641065f1fc3c470a1ef3` |
| `sw.js` | `5d29f543a65a17b85d8d5a7e65b572ab10fba9dbe45838aebb2bc78815eebb4e` |
| `manifest.webmanifest` | `24d6294f14af26a652f5c2dfd26a3bc9f646e2f3e71cbabc7ff5f133949879a3` |
| `not-found.html` | `5e0f4fe6b90c39d4467a0e3df109c394276f198976593d12eec35961657a2336` |
| Mobile hero | `408852842ee58788231824855cb783bc76346f74485775f79f2c1dcc6bbe7648` |
| Desktop hero | `1998424b8887cb688cf65da67b1fa1fb4b764613ccf2cd586fc2c86a246cef31` |
| 192 px icon | `d855772336804f147efda6bdc2f2d7e669b3afabeea0493c59dae1e898c02585` |
| 512 px icon | `0bf25cb2aab9ca38970baff4f6b047e42fdd057ddef1f1a4494db0100470f6d5` |

## Known gaps and next step

No release-blocking gap is known. Request independent release verification of
repair commit `8225b66a41d87408acb41f439c544998457eb7db`.

## Run locally

```sh
npm ci
npm test
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/demo` for the isolated sample calendar.
