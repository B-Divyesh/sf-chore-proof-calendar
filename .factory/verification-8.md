# Independent verification 8 — PASS

- Candidate commit: `c2699e5c816f48bced390264f843e60970b595fb`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Verified: 2026-08-29 UTC
- Product class: offline PWA

## Verdict

**PASS.** Fresh evidence does not reproduce a deployment-only failure. The
live product matches a production build from the candidate, the full local
suite passes, every registered claim passes, and the smallest useful product
works on the live deployment. No product source was changed during this
verification.

## Release gates

### First read and one-click demo

A cold browser opened `/` with empty storage at 1280 × 720 and 390 × 844. The
first viewport says:

- what it does: **“See when each chore was done”**;
- who it serves: **“For households that need a clear history, not another
  overdue badge”**;
- what to do first: **“Try it with sample data”**, followed by **“See a filled
  calendar in one click.”**

All three facts—offline use, browser-local records, and the free/$12 photo
limits—also fit in the first mobile viewport. The sample action is visible and
requires one click. It opens `/?demo=1`, immediately shows four realistic
chores and their history, and keeps the banner **“Demo — sample data, nothing
is saved”** with **Reset demo** and **Start for real** controls.

Evidence: `evidence-verification-8/first-read-desktop.png`,
`first-read-mobile.png`, and `first-read-demo-desktop.png`.

### Claims

After `npm ci`, I ran every `test` value in `.factory/claims.json` separately
and exactly as written. All 23 passed. A missing declaration or any failure
would have failed this review.

| Claim ID | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `one-tap-completion` | PASS |
| `offline-reload` | PASS |
| `installable-pwa` | PASS |
| `no-account` | PASS |
| `local-data` | PASS |
| `runtime-privacy` | PASS |
| `license-token-only` | PASS |
| `refunded-license` | PASS |
| `ics-export` | PASS |
| `pdf-export` | PASS |
| `csv-export` | PASS |
| `json-export` | PASS |
| `no-household-ranking` | PASS |
| `json-restore` | PASS |
| `recurrence-bounds` | PASS |
| `due-status` | PASS |
| `completion-proof` | PASS |
| `free-core` | PASS |
| `keyboard-calendar` | PASS |
| `photo-tier` | PASS |
| `paid-photo-cap` | PASS |
| `accessible-baseline` | PASS |

The live landing page and README promises map to these claims. I found no
unlisted customer-facing product promise. The exact command matrix is saved in
`evidence-verification-8/claims-summary.json`.

## Clean install, tests, and production build

The checkout initially had no modified or untracked files and was exactly at
the candidate commit.

- `npm ci` — PASS; 141 packages installed, 0 audit vulnerabilities.
- `npm run lint` — PASS; zero warnings.
- `npm run typecheck` — PASS.
- `npm test` — PASS; 16/16 Vitest tests and 57 Playwright passes out of 60
  cases. The three skips are deliberate project-specific skips: mobile-only
  checks skipped on desktop and the desktop-header demo exit skipped on mobile.
- `npm run build` — PASS; the exact production build produced `dist/`.

The production HTML is 50,426 bytes raw and 16,251 bytes gzip. It contains
11,913 bytes gzip of JavaScript and 4,081 bytes gzip of CSS, with no external
script, stylesheet, or font. The mobile hero is 53,244 bytes. All are well
inside the contract budgets. Evidence:
`evidence-verification-8/bundle-budget.json`.

## Live end-to-end behavior

An independent fresh-context flow on `/app` covered the real, IndexedDB-backed
calendar rather than only the demo:

- The empty state offered **Add your first chore**.
- Recurrences `0` and `366` were rejected; `21` was accepted.
- One tap created a dated completion, updated last-done/next-due text, and
  survived reload.
- A note and valid PNG required explicit consent, then appeared in the dated
  history and JSON backup.
- A fake PNG produced a specific supported-file error and kept the dialog open
  for recovery.
- ICS contained two UTC `DTSTART` events, PDF began `%PDF-`, CSV had one header
  plus two records, and JSON retained the chore, both completions, note, and
  photo.
- A malformed backup was rejected with an announced error, did not replace the
  calendar, and left the existing chore usable.
- Archiving removed the active card while preserving the chore and both
  completions in export.
- Existing real records survived both demo exits—**Start for real** at 390 px
  and the **Calendar** link at desktop—before and after a subsequent save.

Evidence: `evidence-verification-8/live-e2e.json`, `live-e2e.mjs`,
`demo-exit-live.json`, and `demo-exit-local.json`.

## Privacy, network, headers, and billing

With service workers blocked to expose actual outgoing traffic, a cold landing
load, one-click demo entry, completion, and JSON export requested only the live
document and its same-origin hero image. The independent real-calendar flow
also made no cross-origin request. No analytics, tracking, remote font, or
third-party runtime script was loaded. Evidence:
`evidence-verification-8/request-log-live.json`, `live-e2e.json`, and both
browser matrices.

Live response evidence confirms:

- CSP restricts defaults to self, permits only Sociobot for connections, and
  sends `frame-ancestors 'none'` as a header;
- HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and a
  restrictive permissions policy are present;
- HTML revalidates after 30 seconds, the service worker is `no-store`, and
  static artwork is immutable for one year;
- checkout returns 303 to `checkout.dodopayments.com`;
- invalid license verification returns a no-store JSON verdict with the live
  origin allowed by CORS.

A fresh single-client rate-limit run received 30 successful invalid-license
responses. Request 31 returned `429` and `Retry-After: 4`; the observed
allowance is therefore 30 requests in the active window. Evidence:
`evidence-verification-8/rate-limit.json` and `response-identity.json`.

There is no sign-in or account system, so Entra authority validation is not
applicable. There is no product-owned backend; the Sociobot license endpoint
is the only server endpoint used by the product.

## Deployment identity and routes

A candidate production build byte-matched the deployed `index.html`, service
worker, manifest, 404 document, both hero images, and both PWA icons by SHA-256.
Known routes, robots, and sitemap return 200; an unknown route returns the
designed HTTP 404. A crawl of 56 rendered links found no broken link; the paid
link correctly returns a 303 hosted-checkout redirect. Evidence:
`evidence-verification-8/response-identity.json` and `link-crawl.json`.

## PWA and offline behavior

The live manifest is valid and standalone with start URL `/app?v=9`, maskable
192 px and 512 px icons, and an active service worker scoped to `/`. The live
worker controls cache `done-here-v9`; `registration.update()` completes with an
activated worker. After going offline, `/demo` reloads with the correct title,
offline status, and all four sample chores.

A controlled local update changed the worker cache version, showed **“A new
version is ready”** and **Update now**, activated the new worker/cache, and
preserved the demo banner and all four chores. Evidence:
`evidence-verification-8/pwa-live.json` and `service-worker-update.json`.

## Accessibility, responsive layout, and performance

Fresh local and live matrices checked `/`, `/app`, `/demo`, `/privacy`,
`/terms`, `/404`, and an unknown 404 at desktop and 390 px:

- zero serious or critical axe findings;
- zero application console/page errors;
- `lang=en`, one `h1`, one `main`, alt text, unique route titles, and no
  horizontal overflow on every route;
- all 63 visible mobile controls are at least 44 × 44 CSS px;
- the skip link, dialog focus trap/return, route focus, and arrow/Enter calendar
  navigation work with the keyboard;
- the keyboard focus outline is 3 px, with measured 6.22:1 contrast against
  the page;
- reduced-motion emulation reduces transitions to 0.01 ms and uses automatic
  scrolling;
- a 200%-text-size layout equivalent keeps primary and export actions visible
  with no horizontal overflow.

The supplied `/opt/fleet/lib/verify-url.sh` passed `/demo` in 548 ms with no
console errors, correct title/lang/heading/main, no missing alt text, and no
unlabelled buttons.

Fresh mobile Lighthouse 13.4.1 results: performance **99**, accessibility
**100**, best practices **100**, SEO **100**, FCP **0.97 s**, LCP **1.08 s**,
CLS **0**, TBT **114.5 ms**, transfer **27,970 bytes**. Lab navigation has no
INP value; interactive flows were exercised directly without errors.

Evidence: `evidence-verification-8/browser-matrix-live.json`,
`browser-matrix-local.json`, `focus.json`, `verify-url-live/`, and
`lighthouse-live.json`.

## Defects by severity

- P0: none.
- P1: none.
- P2: none.
- P3: none.

## Remaining gaps

None observed within the acceptance contract. This is a browser PWA, not a
library or CLI, so package-consumer checks do not apply.
