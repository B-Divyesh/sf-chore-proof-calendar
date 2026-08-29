# Independent verification 4 — FAIL

- Candidate: 62f4308ec756efdae1f3f27c04b44e9aaf32de1a
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Verified: 2026-08-29 10:14 UTC
- Scope: clean-clone claims, repository gates, exact production build, live
  identity, first-read/demo, core and recovery flows, desktop and 390 px
  mobile, keyboard, accessibility, privacy/network, response policy, billing,
  PWA offline/update behavior, caching, and performance

## Release decision

**FAIL.** The declared claim commands, core product flow, build, live identity,
offline behavior, billing endpoint, and performance gates pass. Fresh
independent testing found three release blockers:

1. all 31 calendar-day buttons are narrower than the required mobile touch
   target;
2. demo mode can read and write real license storage while saying nothing is
   saved;
3. several public promises are absent from the claims registry.

No product code was changed during this verification.

## First-read gate — PASS

A cold live load at 1440 × 900 and a separate 390 × 844 context showed in the
first viewport:

- what it does: **“See when each chore was done”**;
- who it is for: **“For households that need a clear history, not another
  overdue badge”**;
- what to click first: **“Try it with sample data”**, followed by **“See a
  filled calendar in one click.”**

The primary action opens '/demo' in one click. The destination immediately
shows four named chores, seven realistic completions, a calendar, and the
persistent **“Demo — sample data, nothing is saved”** banner with **Reset
demo** and **Start for real**.

The cold desktop load requested only the same-origin document and hero image.
The mobile load did the same. Neither produced a console or page error.

## Mandatory declared-claims gate — PASS

'.factory/claims.json' exists. After 'npm ci', every listed command was run
independently and verbatim from the clean candidate. All 16 returned zero:

| Claim | Result | Test evidence |
| --- | --- | --- |
| demo-sandbox | PASS | sample mutation reset on reload |
| one-tap-completion | PASS | one action added a dated completion |
| offline-reload | PASS | controlled demo reloaded offline |
| local-data | PASS | tested demo flow made no remote request |
| ics-export | PASS | UTC event for each sample completion |
| pdf-export | PASS | sample rows and Unicode encoded |
| csv-export | PASS | header and one row per completion |
| json-export | PASS | four chores and seven completions downloaded |
| json-restore | PASS | full sample restored into real storage |
| recurrence-bounds | PASS | 0/366 rejected; 1/365 accepted |
| due-status | PASS | relative and calendar dates agreed |
| completion-proof | PASS | note and consented valid PNG saved |
| keyboard-calendar | PASS | month/day keyboard interaction worked |
| photo-tier | PASS | free 5 and paid 500 limits |
| paid-photo-cap | PASS | $12 copy and live checkout redirect |
| accessible-baseline | PASS | mobile Axe serious/critical count was zero |

'CLAIM_FAILURES=0'. Each ID appears in exactly one tagged test. The independent
counterexamples below show that two tests are too narrow and that public
claims remain unregistered.

## Release-blocking findings

### High — demo mode reads and can write real license storage

The persistent demo banner makes the absolute claim **“Demo — sample data,
nothing is saved.”** The demo contract also requires real data never to be
read or written while that banner is shown.

Fresh live reproduction:

1. Open '/demo?license=demo-should-not-save' in an empty browser context.
2. The app strips the query string and continues to show the demo banner.
3. Inspect local storage.

Observed:

    URL: https://chore-proof-calendar.sociobot.in/demo
    sb_license:chore-proof-calendar = demo-should-not-save

A second fresh check seeded an existing real cached license, then opened
'/demo'. The banner remained visible, but the demo showed **“Household Pack
active”** and removed the buy link. This proves the demo read real license
state.

The declared 'demo-sandbox' test checks only local-storage keys beginning with
'demo:'. It therefore passes while missing writes to the production
'sb_license:' key and reads of the production verdict key.

Required remediation: decide demo mode before license initialization; do not
read, store, or verify any production license while demo mode is active. Make
the claim test preseed real license state and exercise a license-bearing demo
URL while asserting every storage key is unchanged.

### Medium — every mobile calendar-day target is under 44 px wide

At the required 390 × 844 viewport on live '/demo', all 31 visible
'.calendar-day' buttons measured between **40.56 and 40.58 CSS px wide** by
**48 px high**. Examples:

    Aug 1, 2026   40.58 × 48 px
    Aug 10, 2026  40.56 × 48 px
    Aug 27, 2026  40.58 × 48 px
    Aug 31, 2026  40.56 × 48 px

The attached accessibility and design contracts require every touch target to
be at least 44 × 44 CSS px. The mobile rule explicitly resets
'.calendar-day { min-width: 0; }'.

The repair regression named '@regression:mobile-target-size' passes because it
only selects header, demo-banner, and footer controls. It does not measure the
calendar controls that users tap to inspect completion history.

Required remediation: provide calendar days with an effective 44 px target at
390 px without horizontal overflow, and make the regression inspect every
visible interactive control, including all calendar-day buttons.

### High — public promises are missing from '.factory/claims.json'

The claims registry contains 16 entries, but the live copy and README make
additional testable promises with no claim entry and no uniquely tagged test:

- README: **“Offline app shell and installable PWA manifest”** — offline reload
  is registered, installability is not.
- Metadata and privacy page: **“No account needed”** and **“Done Here has no
  account server.”**
- Landing page: **“Done Here does not rank people, assign points, or watch
  children.”**
- Landing page and README: **“The calendar is free”**, **“Chores, notes, and
  every export stay free”**, and **“Free core calendar with five photos.”**

The release-configuration unit test only proves that every existing registry
entry has one tagged test. It does not compare visitor-facing copy and README
promises with the registry.

The attached claims contract states that any unlisted claim fails review.
Required remediation: register each promise with one observable test, or
remove/reword it. Add a copy-to-registry coverage review so this cannot pass
only by checking already-listed IDs.

## Repository and production gates

| Gate | Fresh result |
| --- | --- |
| npm ci | PASS — 141 packages, 0 vulnerabilities |
| all 16 exact claim commands | PASS |
| npm run lint | PASS — zero warnings |
| npm run typecheck | PASS |
| npm test | PASS — 14 Vitest tests; 39 Playwright passed, 1 intentional desktop skip |
| npm run build | PASS — dist/ produced |
| second exact npm run build | PASS |
| npm audit --omit=dev | PASS — 0 vulnerabilities |

Production bundle measurements:

| Resource | Raw | Gzip |
| --- | ---: | ---: |
| Inline JavaScript | 32,005 B | 11,422 B |
| Inline CSS | 14,763 B | 4,016 B |
| Full HTML shell | 48,393 B | 15,712 B |
| Mobile hero WebP | 53,244 B | n/a |
| Desktop hero WebP | 106,836 B | n/a |
| Fonts | 0 B | 0 B |

These are below the 200 KB JavaScript, 50 KB CSS, 120 KB font, and 300 KB
mobile-hero budgets.

## Candidate and live deployment identity

Fresh downloads exactly matched the production build:

| File | SHA-256 |
| --- | --- |
| index.html | d66f5cd9aebd3e18ba691f9aa20771a325839bd3f85fbb2bdb1c8b95b8d25bfc |
| sw.js | dc2be8b41c9804a934648736177a9f125ab5155ad82c8aaf9305088e94241068 |
| manifest.webmanifest | 27dfdb3d50ff468bf4882baa58ba4cc2f63967563ae465924ca9463874c7d021 |
| not-found.html | 1e53c45a3b9631113d4984ed6607fc5fb181e88436276a3da4bc2d33dc081b25 |
| mobile hero | 408852842ee58788231824855cb783bc76346f74485775f79f2c1dcc6bbe7648 |
| desktop hero | 1998424b8887cb688cf65da67b1fa1fb4b764613ccf2cd586fc2c86a246cef31 |

This proves the deployed shell and critical PWA assets match candidate
'62f4308ec756efdae1f3f27c04b44e9aaf32de1a'.

## Functional and recovery evidence

Fresh independent live contexts verified:

- the empty state leads directly to adding a chore;
- empty names and recurrence values 0 and 366 are rejected;
- recurrence values 1 and 365 are accepted;
- a created chore survives reload in IndexedDB;
- last-done, next-due, and calendar-day state agree;
- one-tap completion places the chore in dated history;
- a Unicode note and real PNG save after consent;
- a fake PNG is rejected with a specific message and the dialog stays open;
- the first five free photo proofs save; the sixth is rejected with the stated
  recovery message and leaves the dialog open;
- JSON, CSV, ICS, and PDF downloads have the expected names and signatures;
- a malformed record backup displays the persistent recovery alert, does not
  replace the existing chore, and remains safe after reload.

The live full real-data flow produced no console or page errors. A separate
dialog smoke test kept focus inside the native dialog and returned focus to
the opening button on Escape.

## Accessibility, keyboard, responsive behavior, and routes

- Fresh Axe scans on '/', '/app', '/demo', '/privacy', '/terms', '/404', and a
  missing route found **0 serious/critical findings** at desktop and 390 px.
- Every normal route has 'lang="en"', one h1, one main, route-specific title,
  image alternatives, and no horizontal overflow.
- The supplied 'verify-url.sh' passed live '/demo' in 558 ms with no browser
  errors, one h1/main, and no missing alt text or unlabeled buttons.
- The first Tab exposes the skip link at 198.58 × 48.80 px with a 3 px
  '#0b6575' outline. Its contrast is 6.22:1 on the page background and 4.97:1
  on the darkest relevant light surface. Enter moves focus to the h1.
- Keyboard Enter changed the month; arrow keys moved calendar-day focus.
- SPA navigation and browser Back updated the URL/title and focused the new
  h1.
- Reduced motion computes smooth scrolling as 'auto' and transitions as
  '0.00001s'.
- The calendar touch-target defect remains despite these passes.
- '/', '/app', '/demo', '/privacy', and '/terms' return 200. '/404' and an
  arbitrary missing route render the designed page with HTTP 404.
- Internal links resolve; the factory link returns 200; checkout returns 303
  to 'checkout.dodopayments.com'.

## Privacy, security headers, billing, and sign-in

- Cold home/demo use and a full real-data create, completion, note/photo,
  export, and malformed-import flow made only same-origin requests.
- No analytics, remote fonts, CDN scripts, raw Azure/OpenAI keys, or direct
  payment-provider runtime calls were found.
- License receipt strips the token from the address bar, stores it under
  'sb_license:chore-proof-calendar', and calls only the Sociobot verification
  endpoint. An invalid token was cached as invalid.
- Checkout returned 303 to the Dodo-hosted checkout.
- The license-verification allowance is **30 rapid requests per client**.
  Requests 1–30 returned 200; requests 31–40 returned 429. The first 429
  included 'Retry-After: 4' and the expected CORS origin.
- No sign-in exists, so the Microsoft Entra authority requirement is not
  applicable.
- Live responses include CSP with response-header 'frame-ancestors none',
  HSTS, 'nosniff', strict-origin referrer policy, and a restrictive Permissions
  Policy.

## Caching, PWA, and performance

- HTML revalidates with a 30-second maximum age; the manifest revalidates;
  'sw.js' is no-store; static assets use one-year immutable caching.
- Conditional requests for HTML, worker, manifest, and hero returned 304.
- Chromium reported no manifest errors. Icons are valid 192 × 192 and
  512 × 512 maskable PNGs; the Apple icon is 180 × 180.
- Fresh live cache 'done-here-v4' held '/index.html' and '/demo'. With browser
  networking disabled, '/demo' reloaded four sample chores and showed the
  offline notice.
- Against an isolated production build server, changing the worker response
  and calling 'registration.update()' displayed **“A new version is ready”**
  and **“Update now”**, with no browser errors.
- Lighthouse 12.8.2 mobile: Performance **91**, Accessibility **100**, Best
  Practices **100**, SEO **100**; FCP **0.9 s**, LCP **1.2 s**, CLS **0**,
  TBT **370 ms**, Speed Index **1.6 s**, transferred size **79 KiB**.

## Required before release

1. Fully isolate demo mode from production license storage and strengthen the
   demo claim test to cover pre-existing and incoming licenses.
2. Make every calendar-day target at least 44 × 44 CSS px at 390 px and extend
   the target regression to all visible controls.
3. Register and uniquely test every public promise, or remove the unlisted
   copy.
4. Rerun every declared claim, the complete suite, and independent live QA
   after deployment.
