# Review recurring chore completion history — PASS

- Work order: `chore-proof-calendar-review-6`
- Reviewed: 2026-09-06 UTC
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Runtime implementation reviewed: `da9493593009fcf702410ab246b5f6ab04f54706`
- Documentation/report baseline: `924a1bbd13d1feeb02a9ab1d73c6e24cb5ad92df`
- Product class: offline PWA

## Verdict

**PASS.** There are zero findings at every severity and zero untested public claims.

## Job, audience, and first action

Before scrolling, fresh 1440 × 900 desktop and 390 × 844 phone browsers both said:

- Job: **See when each chore was done**.
- Audience: households that need a clear record of when recurring work was finished.
- First action: **Try it with sample data**.
- Result promised beside it: **See a filled calendar in one click**.

Both action elements and the audience sentence were visible above the fold. The action opened August 2026 with four realistic chores, seven completions, and six populated days. The persistent banner read **Demo — sample data, nothing is saved**. It included **Reset demo** and **Start for real**. Adding a completion moved the view to September; reset restored the original August calendar and seven completions. A real-data IndexedDB sentinel was unchanged on both devices, and neither flow made an external request or browser error.

Evidence: `evidence-review-6/sample-calendar-live.json`, screenshots, and `evidence-review-6/demo-exit-live.json`.

## Claims and clean checkout

A new GitHub clone at `924a1bb` received `npm ci` successfully (141 packages, zero reported vulnerabilities). Every exact command declared in `.factory/claims.json` was executed separately and passed:

`demo-sandbox`, `filled-sample-calendar`, `one-tap-completion`, `offline-reload`, `installable-pwa`, `no-account`, `local-data`, `runtime-privacy`, `license-token-only`, `refunded-license`, `ics-export`, `pdf-export`, `csv-export`, `json-export`, `no-household-ranking`, `json-restore`, `recurrence-bounds`, `due-status`, `completion-proof`, `photo-json-local`, `archive-retention`, `site-data-deletion`, `free-core`, `keyboard-calendar`, `photo-tier`, `paid-photo-cap`, and `accessible-baseline`.

Result: **27 passed, 0 failed, 0 untested.** The landing page, app, README, privacy, terms, and 404 copy were checked against this registry; no unlisted public promise was found.

The clean clone also passed `npm run lint`, `npm run typecheck`, `npm audit --omit=dev`, `npm run build`, and `npm test`. The full suite passed 17 unit tests and 65 browser tests, with three expected responsive skips. The build created `dist/index.html` at 50.35 kB raw and 16.18 kB gzip.

## Live paths, accessibility, and privacy

The live sample and real-calendar paths confirmed normal completion, reset, and both demo exits without overwriting real records. The existing claim coverage exercised invalid recurrence values, malformed restore data, invalid photo input and missing consent, archive/export retention, exports, offline reload, keyboard calendar use, and local site-data deletion.

Fresh desktop and phone Axe scans of `/`, `/app`, `/demo`, `/privacy`, `/terms`, `/404`, and an unknown route had zero serious or critical issues. Each rendered route had `lang="en"`, a route title, exactly one `h1`, one `main`, no console error, and no horizontal overflow. The provided URL check also passed live `/demo` in 549 ms with no missing image alternatives or unlabelled buttons.

Direct `/404` and an unknown address returned HTTP 404 when requested without a service worker and rendered the designed not-found page. These expected 404s are not defects. The live checkout returned 303 to hosted Dodo checkout. License verification allowed 30 requests, then returned 429 on request 31 with `Retry-After: 4` and the product origin in CORS.

## Deployment identity and earlier findings

The rebuilt candidate byte-matches the live `index.html`, worker, manifest, 404 document, hero images, and app icons. Known routes, legal pages, robots, and sitemap return 200; an unknown route returns 404. Security and caching headers remain correct: the worker is no-store, artwork is immutable, and the document supplies CSP, HSTS, nosniff, referrer policy, permissions policy, and response-header `frame-ancestors 'none'`.

All earlier review, verification, and polish reports were inspected. Their 36 findings remain fixed: plain first-screen and README wording; complete direct 404; correct due dates; safe malformed-backup recovery; checkout; Unicode PDF; mobile targets and spacing; valid photo validation; demo license isolation; complete claims registry; Start-for-real and Calendar exit retention; filled demo reset; archive retention; full JSON fidelity; photo persistence; and site-data deletion. No closed finding regressed.

## Findings

- Critical: 0
- High: 0
- Medium: 0
- Low: 0
- Untested public claims: 0
- Known product gaps: none observed
