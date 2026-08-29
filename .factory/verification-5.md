# Independent verification 5 — FAIL

- Work order: `chore-proof-calendar-verify-5`
- Candidate: `89ed3d8050090ff0849e7374d073d686a0ee2d6d`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Verified: 2026-08-29 11:52 UTC
- Scope: clean-clone claims, repository gates, exact production build, live
  identity, first-read/demo, normal/boundary/error flows, desktop and 390 px
  mobile, keyboard, accessibility, privacy/network, response headers, billing,
  rate limiting, PWA offline/update behavior, caching, and performance

## Release decision

**FAIL.** The deployed product is byte-identical to the candidate, all 20
declared claim commands pass, and the core product works end to end. Two fresh
acceptance-contract defects remain:

1. public privacy and paid-license promises are not listed and tested in
   `.factory/claims.json`;
2. adjacent mobile chore actions are separated by 4 px, below the supplied
   8 px interaction-target baseline.

No product code was changed during this verification.

## First-read and demo gate — PASS

A cold live load at 1440 × 900 showed all three required answers in the first
screen:

- what it does: **“See when each chore was done”**;
- who it is for: **“For households that need a clear history, not another
  overdue badge”**;
- what to click first: **“Try it with sample data”**, followed by **“See a
  filled calendar in one click.”**

The action opens `/demo` in one click. The destination immediately contains
four named chores and seven realistic completions, with the persistent
**“Demo — sample data, nothing is saved”** banner, **Reset demo**, and **Start
for real**. The same first action is visible at 390 px.

## Mandatory declared-claims gate — PASS

`.factory/claims.json` exists. After `npm ci`, every listed command was run
independently and verbatim from the clean candidate. All 20 returned zero:

| Claim | Result |
| --- | --- |
| demo-sandbox | PASS |
| one-tap-completion | PASS |
| offline-reload | PASS |
| installable-pwa | PASS |
| no-account | PASS |
| local-data | PASS |
| ics-export | PASS |
| pdf-export | PASS |
| csv-export | PASS |
| json-export | PASS |
| no-household-ranking | PASS |
| json-restore | PASS |
| recurrence-bounds | PASS |
| due-status | PASS |
| completion-proof | PASS |
| free-core | PASS |
| keyboard-calendar | PASS |
| photo-tier | PASS |
| paid-photo-cap | PASS |
| accessible-baseline | PASS |

The complete command log recorded `CLAIM_RESULT <id> 0` for every entry and
`CLAIM_FAILURES=0` by inspection of all 20 results.

## Release-blocking findings

### High — public privacy/license promises are absent from the claims registry

The claims contract requires every visitor-facing statement a person may rely
on to appear in `.factory/claims.json` with one uniquely tagged observable
test. Fresh cross-checking found at least these unlisted promises:

- `README.md`: **“No analytics, remote fonts, or third-party runtime scripts
  are included.”**
- `README.md` and the license form: **“License verification sends only the
  pasted token to Sociobot.”** / **“Verification sends only this token to
  Sociobot.”**
- `/terms`: **“A refunded license stops working.”**

None of the 20 registry `claim` values states these promises. The
`@claim:local-data` test only completes and exports a demo chore while checking
request origins; it never exercises license verification, its payload, or
revocation. `@claim:paid-photo-cap` checks the price and checkout redirect, not
post-refund locking. The release-configuration unit test compares only a
handwritten seven-item promise list, so it cannot detect these omissions.

Independent live testing found no analytics/remote asset request and observed
that an invalid license request contained only the token, but fresh verifier
evidence does not replace the mandatory registry and repeatable claim tests.

Required remediation: add explicit registry entries and uniquely tagged tests
for each retained promise, including the real license path and revoked verdict,
or remove/reword the promises.

### Medium — adjacent mobile chore actions have only a 4 px gap

At a 390 × 844 live `/demo` viewport, each of the four chore cards places
**Add note or photo** directly above **Archive** with a measured 4 px edge gap.
The attached design baseline requires adjacent targets to be at least 8 px
apart. All individual targets are at least 44 × 44 px, so the existing
`@regression:mobile-target-size` test passes while missing target separation.

Measured counterexample:

```text
Water the houseplants: Add note or photo ↔ Archive = 4 px
Change the bed sheets: Add note or photo ↔ Archive = 4 px
Clear the fridge shelf: Add note or photo ↔ Archive = 4 px
Rinse the coffee filter: Add note or photo ↔ Archive = 4 px
```

Required remediation: increase the row gap to at least 8 px and add a mobile
regression that measures separation as well as target width and height.

## Repository gates and production build

| Gate | Fresh result |
| --- | --- |
| `npm ci` | PASS — 141 packages, 0 vulnerabilities |
| all 20 exact claim commands | PASS |
| `npm run lint` | PASS — zero warnings |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 15 Vitest tests; 47 Playwright tests passed, 1 intentional desktop skip |
| `npm run build` | PASS — exact production command produced `dist/index.html` |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |

Production bundle measurements:

| Resource | Raw | Gzip |
| --- | ---: | ---: |
| Inline JavaScript | 32,246 B | 11,520 B |
| Inline CSS | 14,969 B | 4,066 B |
| Full HTML shell | 48,840 B | 15,856 B |
| Mobile hero WebP | 53,244 B | n/a |
| Desktop hero WebP | 106,836 B | n/a |
| Fonts | 0 B | 0 B |

These are below the 200 KB JavaScript, 50 KB CSS, 120 KB font, and 300 KB
mobile-hero budgets.

## Live functional and recovery evidence

A fresh real-data browser context passed this independent sequence:

- empty state and first-chore action;
- required-name rejection;
- recurrence 0 and 366 rejection, then 1 and 365 acceptance;
- IndexedDB persistence across reload;
- one-tap completion with last-done, next-due, and calendar history;
- completion removal with confirmation and Undo recovery;
- photo rejection without consent;
- fake PNG and 2,500,001-byte image rejection with specific recovery text;
- valid PNG plus Unicode note acceptance;
- timezone-aware ICS with two UTC `VEVENT`s;
- PDF signature/terminator and two completion rows;
- CSV header and two data rows;
- JSON with two chores and two completions;
- malformed backup rejection with unchanged UI and IndexedDB after reload;
- archive cancellation, confirmation, and persisted archived state.

A separate boundary setup stored four free photo proofs and 499 paid proofs.
The fifth free and 500th paid photos were accepted. The sixth and 501st were
rejected with the documented messages, and storage counts remained 5 and 500.

The full normal/error/boundary flow made only same-origin requests and produced
zero console, page, or request errors.

## Accessibility, keyboard, responsive behavior, and routes

- Axe serious/critical findings: **0** on `/`, `/app`, `/demo`, `/privacy`,
  `/terms`, `/404`, and a missing route at desktop and 390 px mobile.
- Every checked route had `lang="en"`, one `h1`, one `main`, a route-specific
  title, and no page-level horizontal overflow.
- Every visible mobile control measured at least 44 × 44 px. The separate
  4 px adjacency defect remains.
- The first Tab exposed the skip link at 198.58 × 48.80 px with a visible 3 px
  focus outline; Enter moved focus into `main` at the `h1`.
- Native-dialog focus never reached an outside interactive control and Escape
  returned focus to **Add a chore**.
- Keyboard Enter changed month, arrow keys moved calendar-day focus, and Enter
  selected the focused date.
- SPA keyboard navigation updated the URL/title, focused the destination `h1`,
  and browser Back restored the prior route.
- Reduced motion matched and computed smooth scrolling as `auto`, with
  transition/animation duration `0.00001s`.
- `/opt/fleet/lib/verify-url.sh` passed live `/demo`: 675 ms network-idle load,
  no browser errors, correct title/lang, one `h1`, `main`, zero missing image
  alternatives, and zero unlabeled buttons.
- A fresh service-worker-blocked request to an unknown route returned the
  designed page with HTTP 404, the correct title/heading, no serious Axe
  findings, and no overflow.

## Privacy, billing, rate limit, and sign-in

- Cold home/demo and the complete real create/photo/export/import flow made
  only `https://chore-proof-calendar.sociobot.in` requests.
- No analytics, CDN fonts, remote scripts, raw Azure/OpenAI keys, or direct
  payment-provider runtime call was observed.
- Preseeded real license and verdict values were byte-for-byte unchanged after
  `/demo?license=must-not-save`; demo made zero verify requests and showed no
  active paid badge.
- A real invalid-license URL stripped the token from the address bar, stored it
  under `sb_license:chore-proof-calendar`, called only the Sociobot endpoint,
  and cached a false verdict without blocking the free calendar.
- Checkout returned 303 to `https://checkout.dodopayments.com/...`.
- The license verification allowance is **30 rapid requests per client**.
  Requests 1–30 returned 200; request 31 returned 429 with `Retry-After: 3` and
  the product origin in `Access-Control-Allow-Origin`. Requests 32–33 also
  returned 429.
- No sign-in exists, so the Microsoft Entra authority requirement is not
  applicable.

## PWA, headers, caching, and performance

- The live worker controlled `/demo` at site scope, used cache
  `done-here-v5`, and contained `/index.html`.
- After going offline, live `/demo` reloaded with four sample chores, the demo
  banner, and **“Offline. Your calendar still works here.”**
- An isolated server changed the candidate worker response. The app displayed
  **“A new version is ready”** and **Update now**; activating it reloaded the
  app with all four sample chores and no browser errors.
- Live responses include CSP with response-header `frame-ancestors 'none'`,
  HSTS, `nosniff`, strict-origin referrer policy, and a restrictive Permissions
  Policy.
- Static assets return `public, max-age=31536000, immutable`; `sw.js` returns
  `no-cache, no-store, must-revalidate`; the manifest revalidates; HTML uses
  `must-revalidate` with a 30-second maximum age. Conditional requests for the
  shell, manifest, and mobile hero returned 304.
- Fresh Lighthouse 12.8.2 mobile, with its unstable full-page screenshot
  disabled, scored Performance **98**, Accessibility **100**, Best Practices
  **100**, and SEO **100**. FCP was 1.0 s, LCP 1.4 s, TBT 150 ms, CLS 0, and
  Speed Index 1.0 s.

## Candidate/live identity

Critical deployed files are byte-identical to the candidate build:

| File | SHA-256 |
| --- | --- |
| `index.html` | `4d2f7e95cac4d7dc1fd0d60cf64d9a2886aa377c17fad903fa3cd7a2ab8c3892` |
| `sw.js` | `7b0fd6d8eaa03264363630181ac397f24b559bb739bd31c6aa570395ca3b7a4e` |
| `manifest.webmanifest` | `81ed56429878cd8753e105b76f09c1b7383eac75a73a381b92cb55c88b991625` |
| `not-found.html` | `1e53c45a3b9631113d4984ed6607fc5fb181e88436276a3da4bc2d33dc081b25` |
| Mobile hero | `408852842ee58788231824855cb783bc76346f74485775f79f2c1dcc6bbe7648` |
| Desktop hero | `1998424b8887cb688cf65da67b1fa1fb4b764613ccf2cd586fc2c86a246cef31` |

Library/CLI consumer packaging and backend persistence/concurrency checks are
not applicable to this static local-first PWA.
