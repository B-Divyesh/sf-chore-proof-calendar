# Done Here polish 1 handoff — PASS

- Work order: `chore-proof-calendar-polish-1`
- Base: `f70dbb5`
- Repair: `14daf331bb8f762707638249b1dfe90c513c384b`
- Deployment: `70639713-e540-4b9d-983c-a0a22a4d4717`
- Live URL: <https://chore-proof-calendar.sociobot.in/?demo=1>
- Verified: 2026-08-29 UTC

## What changed

All 13 findings in `.factory/review-1.md` are repaired. The landing labels now
name their sections, the public artwork-provenance statement was removed, and
the README uses plain household language. The first-screen action enters the
isolated `?demo=1` sample app directly; its claim test covers both direct entry
and clicking the action. The demo remains memory-only, shows the persistent
banner, and provides **Reset demo** and **Start for real**.

Direct HTTP 404 responses now use the complete Done Here header, footer, legal
links, favicon, canonical, description, Open Graph, and Twitter metadata.
SPA navigation now updates the canonical and Open Graph/Twitter route metadata.
Release `1.0.5` advances the service-worker cache to `done-here-v9` and the
installed start URL to `/app?v=9` so installed clients receive the repair.

The catalog description is verb-first and 93 characters:
`See when recurring household chores were done with notes and a compact calendar history.`

## Verification

From a clean dependency install:

```sh
npm ci
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e
npm run build
```

Passed: ESLint; TypeScript; 16/16 Vitest tests; 60 Playwright tests (three
responsive-project skips); and the production build to `dist/`. Every exact
command in `.factory/claims.json` was also invoked separately after `npm ci`;
all 23 passed. This includes the query-demo sandbox, offline reload, local
request audit, JSON restore, recurrence bounds, keyboard calendar, and paid
checkout claim tests.

Local evidence is in `.factory/evidence-polish-1-local/`:

- `browser-matrix.json`: 14 route/viewport checks, zero console errors and
  zero Axe serious/critical findings; 63 mobile targets, all at least 44 px.
- `demo-exit.json`: existing real records survived both demo exit paths.
- `verify.json`, `screenshot-desktop.png`, and `screenshot-mobile.png`: cold
  `?demo=1` load had title/lang/main/alt/control checks and no console errors.
- `lighthouse.json`: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP/LCP 0.8 s, CLS 0, TBT 30 ms.

Live evidence is in `.factory/evidence-polish-1-live/`:

- `response-identity.json`: all eight checked artifacts byte-match `dist`;
  `/`, `/app`, `/demo`, `/privacy`, `/terms`, robots, and sitemap return 200;
  unknown routes return 404; asset caching and security headers pass.
- `browser-matrix.json`: the same 14 route/viewport, keyboard, offline,
  privacy, mobile, and Axe checks pass live.
- `demo-exit.json`: real IndexedDB data survives Start for real and Calendar
  exits on the live deployment.
- `404-mobile.png`: a cold unknown URL returns the complete 404 page at HTTP
  404 with shared navigation, footer, and legal links.
- `verify.json`, `screenshot-desktop.png`, and `screenshot-mobile.png`: cold
  live `?demo=1` check passed with no console errors.
- `lighthouse.json`: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP/LCP 1.2 s, CLS 0, TBT 0 ms.

No known gaps remain.
