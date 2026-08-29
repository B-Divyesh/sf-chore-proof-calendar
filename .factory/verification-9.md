# Independent verification 9 — PASS

- Candidate commit: `da7c153a9cd90536516dcd5a5d7a8ce6ce331001`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Verified: 2026-08-29 UTC
- Product class: offline PWA

## Verdict

**PASS.** Fresh evidence does not reproduce a deployment-only failure. The
live application byte-matches a production build from the candidate, every
registered claim passes, the complete local suite passes, and the smallest
useful product works on the deployed URL. No product source was changed during
verification.

## Mandatory release gates

### First read and one-click demo

A cold browser with empty storage opened `/` at 1440 × 900 and 390 × 844. The
first screen says:

- what it does: **“See when each chore was done”**;
- who it serves: **“For households that need a clear record of when recurring
  work was finished”**;
- what to do first: **“Try it with sample data”**, with **“See a filled
  calendar in one click”** beside it.

The first screen also shows the offline, browser-local, and price/photo-limit
facts. The primary sample action is visible in both viewports. One click opens
`/?demo=1`, immediately shows four realistic chores, and retains **“Demo —
sample data, nothing is saved”**, **Reset demo**, and **Start for real**. After
a completion and JSON export, localStorage and sessionStorage remained empty;
the backup contained four chores and eight completions.

Evidence: [`first-read-desktop.png`](evidence-verification-9/first-read-desktop.png),
[`first-read-mobile.png`](evidence-verification-9/first-read-mobile.png), and
[`request-log-first-read.json`](evidence-verification-9/request-log-first-read.json).

### Claims

From the initially clean checkout at the candidate commit, I ran `npm ci` and
then every `test` value in `.factory/claims.json` separately and exactly as
written. All 23 passed; no claim declaration or tagged test was missing.

The passing claims cover demo isolation, one-tap completion, offline reload,
installability, no-account use, local data, runtime privacy, license-token
minimization and revocation, ICS/PDF/CSV/JSON export, JSON restore, absence of
household ranking, recurrence limits, due status, note/photo consent, the free
core, keyboard calendar use, photo limits, pricing/checkout, and the mobile
accessible baseline.

I also read the live landing, app, privacy, terms, and README copy against the
claim registry. Customer-facing promises map to registered claims; no unlisted
claim was found. Exact results are in
[`claims-summary.json`](evidence-verification-9/claims-summary.json).

## Clean install, tests, and production build

- `npm ci` — PASS; 141 packages installed and 0 audit vulnerabilities.
- `npm run lint` — PASS with zero warnings.
- `npm run typecheck` — PASS.
- `npm run build` — PASS; Vite produced `dist/index.html`.
- `npm test` — PASS; 17/17 Vitest tests and 57 Playwright tests passed. Three
  project-specific cases were intentionally skipped.

The exact production build reported `dist/index.html` as 50.40 kB raw and
16.20 kB gzip. The final Playwright status is preserved in
[`full-suite-result.json`](evidence-verification-9/full-suite-result.json).

## Live end-to-end behavior

A separate fresh live `/app` flow exercised real IndexedDB storage:

- the empty state led directly to adding a chore;
- recurrence 0 and 366 were rejected, while 21 was accepted; the claim suite
  also accepted both supported endpoints, 1 and 365;
- one-tap completion created dated history, updated last-done/next-due text,
  and survived reload;
- a note and valid PNG could not be saved until photo consent was checked,
  then both appeared in history and the JSON backup;
- a fake PNG produced a specific supported-file error and left the dialog open
  for recovery;
- ICS had two UTC `DTSTART` events, PDF began `%PDF-`, CSV had one header and
  two records, and JSON retained the chore, completions, note, and photo;
- a malformed backup produced an announced recovery message, preserved the
  existing calendar, and left the app usable;
- archiving removed the active card while retaining the chore and its two
  completions in export.

Existing real data also survived both demo exits: **Start for real** at 390 px
and **Calendar** at desktop. The existing dated history was visible before a
new save, and both old and new records survived reload in IndexedDB.

Evidence: [`live-e2e.json`](evidence-verification-9/live-e2e.json),
[`demo-exit-live.json`](evidence-verification-9/demo-exit-live.json), and
[`demo-exit-local.json`](evidence-verification-9/demo-exit-local.json).

## Privacy, network, billing, and response policy

With service workers blocked so network traffic could not be hidden, the cold
landing, one-click demo entry, completion, and JSON export made two requests:
the document and the same-origin hero image. There were no external requests,
analytics, remote fonts, third-party runtime scripts, console errors, or page
errors. The complete live real-calendar flow also made no cross-origin
request. Demo changes did not use localStorage, sessionStorage, or the real
IndexedDB calendar.

The only optional product cross-origin action is explicit license
verification. It sends a bodyless `GET` with the token to the Sociobot product
endpoint, returns `Cache-Control: no-store`, and permits the live origin via
CORS. Checkout returns 303 to `checkout.dodopayments.com`.

Fresh single-client rate-limit evidence observed requests 1–30 return 200;
request 31 returned **429** with **`Retry-After: 4`**. The observed allowance is
therefore 30 requests in the active window.

Live document headers include a restrictive CSP with `frame-ancestors 'none'`
as a response header, HSTS, `nosniff`, strict-origin referrer policy, and a
camera/microphone/geolocation permissions policy. The product has no account
or sign-in flow, so Microsoft Entra authority validation is not applicable.

Evidence: [`response-identity.json`](evidence-verification-9/response-identity.json),
[`rate-limit.json`](evidence-verification-9/rate-limit.json), and the request
log linked above.

## Deployment identity, routes, and caching

A fresh candidate build byte-matched the live `index.html`, service worker,
manifest, 404 document, both hero images, and both PWA icons by SHA-256. Known
routes, robots, and sitemap returned 200; an unknown route returned the
designed HTTP 404. A rendered crawl found 56 links and 14 unique targets with
no broken link; the paid link returned its intended 303 checkout redirect.

Caching is appropriate for an updateable PWA: HTML has 30-second revalidation,
the manifest revalidates immediately, the worker is `no-store`, and static
artwork is immutable for one year. Conditional requests returned 304 for the
shell, manifest, hero, and worker.

Evidence: [`response-identity.json`](evidence-verification-9/response-identity.json),
[`cache-validation.json`](evidence-verification-9/cache-validation.json), and
[`link-crawl.json`](evidence-verification-9/link-crawl.json).

## PWA and offline/update behavior

The live manifest uses `display: standalone`, start URL `/app?v=10`, the
product palette, and responsive maskable 192 px and 512 px icons that return
200 as PNG. The active service worker controls scope `/` with cache
`done-here-v10`. After the first visit, an offline `/demo` reload retained all
four sample chores and showed **“Offline. Your calendar still works here.”**

An isolated local worker-version change showed **“A new version is ready”**
and **Update now**. Activating it replaced the cache and preserved the demo
banner and all four sample chores.

Evidence: [`pwa-live.json`](evidence-verification-9/pwa-live.json) and
[`service-worker-update.json`](evidence-verification-9/service-worker-update.json).

## Accessibility, keyboard, responsive behavior, and performance

Fresh local and live matrices checked `/`, `/app`, `/demo`, `/privacy`,
`/terms`, `/404`, and an unknown 404 at desktop and 390 px:

- zero serious or critical axe findings and zero application console/page
  errors across 28 route/viewport checks;
- `lang="en"`, one `h1`, one `main`, complete image alternatives, unique route
  titles, and no horizontal overflow;
- all 63 visible mobile controls were at least 44 × 44 CSS px;
- skip-link focus, dialog focus trap/return, route focus, and arrow/Enter
  calendar navigation worked with the keyboard;
- the focused skip link exposed a 3 px solid outline with 6.22:1 contrast
  against its surrounding page; Enter moved focus to the `h1`;
- reduced motion changed transitions to 0.01 ms and scrolling to `auto`;
- a 200%-zoom equivalent reflow retained the primary and export actions with
  no horizontal overflow.

The supplied `verify-url.sh` passed live `/demo` in 631 ms with the correct
title/language, one `h1`, a main landmark, no missing image alternatives, no
unlabelled buttons, and no browser errors. Playwright Axe integration covered
all routes because it uses the installed Chromium directly.

Fresh mobile Lighthouse 13.0.1 scores: Performance **92**, Accessibility
**100**, Best Practices **100**, SEO **100**; FCP 0.96 s, LCP 1.22 s, CLS 0,
and total transfer 81,238 bytes. A live Mark-done interaction recorded a 48 ms
maximum Event Timing duration and 1.6 ms maximum input delay.

Bundle measurements are 11,856 bytes gzip inline JavaScript, 4,081 bytes gzip
inline CSS, no fonts, and a 53,244-byte mobile hero. These are below the 200 KB
JS, 50 KB CSS, 120 KB font, and 300 KB hero budgets.

Evidence: [`browser-matrix-live.json`](evidence-verification-9/browser-matrix-live.json),
[`browser-matrix-local.json`](evidence-verification-9/browser-matrix-local.json),
[`focus.json`](evidence-verification-9/focus.json),
[`lighthouse-live.json`](evidence-verification-9/lighthouse-live.json),
[`interaction-timing.json`](evidence-verification-9/interaction-timing.json),
[`bundle-budget.json`](evidence-verification-9/bundle-budget.json), and
[`verify-url-live/verify.json`](evidence-verification-9/verify-url-live/verify.json).

## Defects by severity

- P0: none.
- P1: none.
- P2: none.
- P3: none observed.

## Applicability and remaining gaps

This is a browser-only offline PWA, not a library, CLI, or product-owned
backend. Package-consumer, backend concurrency/health/build-identity, and
sign-in checks do not apply. The Sociobot unlock endpoint is the sole server
endpoint used by the product and its allowance was verified above. No
remaining gap was observed within the acceptance contract.
