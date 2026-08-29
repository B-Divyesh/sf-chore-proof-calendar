# Done Here repair handoff — PASS

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
