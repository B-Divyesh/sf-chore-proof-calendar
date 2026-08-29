# Independent verification 6 — FAIL

- Work order: `chore-proof-calendar-verify-6`
- Candidate: `9a544d31d3455033b4f180d193aa648e832a7ca5`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Verified: 2026-08-29 13:02 UTC
- Scope: clean-clone claims, repository gates, exact production build, first
  read and demo, live normal/boundary/error/recovery flows, desktop and 390 px
  mobile, keyboard, accessibility, privacy/network, billing rate limiting,
  response headers, caching, bundle budgets, PWA offline/update behavior, and
  candidate/deployment identity

## Release decision

**FAIL.** The live deployment is byte-identical to the candidate, all 23
declared claim commands pass, and the main chore-recording workflow works.
However, the required demo-to-real path can permanently erase a returning
user's stored calendar. This is a release-blocking local-data defect.

No product code was changed during verification.

## Release-blocking finding

### Critical — “Start for real” can overwrite an existing real calendar

The documented `/demo` entry point starts in a new document without opening
the real IndexedDB database. Clicking **Start for real** uses SPA navigation to
render `/app`, but it does not load the user's real data first. The app shows a
false empty state. The next save clears the real object store and writes only
the new in-memory record.

Fresh live reproduction:

1. Open `/app`, create **Existing real calendar record**, reload, and confirm it
   persists.
2. Open `/demo` directly, then click **Start for real**.
3. `/app` shows **0 active** and **No chores yet**. The existing record is
   absent. Evidence: `evidence-verification-6/defect-start-for-real-empty.png`.
4. Without saving, a hard reload restores the existing record, proving it was
   still in IndexedDB and only omitted from the in-memory state.
5. Repeat steps 2–3, then add **New record from false-empty view**.
6. Reload `/app`: exactly one chore remains, the new record. The original is
   gone. Evidence:
   `evidence-verification-6/defect-existing-data-overwritten.png`.

The source confirms the failure path. `data` begins empty at
`src/main.ts:12`. Leaving demo at `src/main.ts:308-318` initializes only the
license and renders immediately; `loadData()` is called only during a
non-demo document boot at `src/main.ts:332-341`. The next mutation calls
`saveData(data)`, whose transaction clears the object store at
`src/storage.ts:73-79`.

Impact: a normal action after using the mandatory catalog/demo URL can erase
all locally stored chores and completion history without warning. This breaks
the local-first product contract and the real job-to-be-done.

Required remediation:

- make every demo-to-real transition await `loadData()` before rendering or
  enabling mutations;
- prevent persistence while real data is unhydrated; and
- add a browser regression that seeds real IndexedDB data, boots directly at
  `/demo`, clicks **Start for real**, saves another chore, and proves both old
  and new records survive reload. The same check should cover the Calendar
  link from a direct demo boot.

## First-read and one-click demo gate — PASS

A cold live load at 1440 × 900 answered all three questions in the first
screen:

- what it does: **“See when each chore was done”**;
- who it serves: **“For households that need a clear history, not another
  overdue badge”**; and
- what to click: **“Try it with sample data”**, with **“See a filled calendar
  in one click.”** beside it.

The action is also above the fold at 390 px and opens `/demo` in one click.
The destination immediately shows four named chores, seven completions, the
persistent **Demo — sample data, nothing is saved** banner, **Reset demo**, and
**Start for real**. `/?demo=1` redirects into the demo and **Reset demo**
restores the seven-completion sample. The release-blocking exit defect above
means the overall demo contract does not pass.

## Mandatory declared-claims gate — PASS

`.factory/claims.json` exists. After `npm ci`, every listed `test` command was
run independently and verbatim against the product's demo entry point. All 23
returned zero:

| Claim | Result |
| --- | --- |
| demo-sandbox | PASS |
| one-tap-completion | PASS |
| offline-reload | PASS |
| installable-pwa | PASS |
| no-account | PASS |
| local-data | PASS |
| runtime-privacy | PASS |
| license-token-only | PASS |
| refunded-license | PASS |
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

The aggregate was **23 passed, 0 failed**. The public landing, application,
privacy, terms, and README promises were cross-checked against the registry;
no additional unlisted claim was found. The existing demo test does not seed
real IndexedDB data or exercise **Start for real**, so it misses the critical
transition defect.

## Clean repository gates and production build

| Gate | Result |
| --- | --- |
| `npm ci` | PASS — 141 packages; 0 vulnerabilities |
| 23 exact claim commands | PASS — 23/23 |
| `npm run lint` | PASS — zero warnings |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 15 unit tests; 54 browser tests passed; 2 intentional desktop skips |
| `npm run build` | PASS — exact production build produced `dist/index.html` |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |

The checkout was exactly the requested candidate before verification. The
candidate differs from the repaired product commit only by repair evidence and
handoff documentation.

## Live functional evidence

In a fresh real-data context, these independent checks passed:

- empty state and first-chore action;
- required-name rejection;
- recurrence 0 and 366 rejection, with 1 and 365 accepted;
- IndexedDB persistence across reload;
- one-tap completion with dated history;
- removal cancellation, confirmed removal, and Undo recovery;
- photo rejection without consent;
- invalid image-byte and 2.5 MB size rejection with recovery text;
- valid PNG and Unicode note storage with meaningful photo alt text;
- two-event UTC ICS, valid PDF signature/terminator, CSV header plus two rows,
  and full JSON backup;
- malformed linked backup rejection with data unchanged after reload;
- archive cancellation, confirmation, and persistence; and
- free photo 5 / paid photo 500 acceptance, followed by 6 / 501 rejection
  without changing stored counts.

The complete real-data flow made four same-origin requests, no cross-origin
request, no failed request, and no console or page error.

## Accessibility, keyboard, responsive behavior, and routing

- Axe serious/critical findings: **0** on `/`, `/app`, `/demo`, `/privacy`,
  `/terms`, `/404`, and a missing route at both 1280 px and 390 px.
- All 14 route/viewport combinations had `lang="en"`, exactly one `h1`, one
  `main`, a route-specific title, image alternatives, labeled buttons, and no
  page-level horizontal overflow.
- The real `/404` and unknown URL returned the designed page with HTTP 404.
- At 390 px, all 63 visible operable targets were at least 44 × 44 CSS px. The
  four **Add note or photo** / **Archive** pairs measured exactly 8 px apart.
  The clipped 1 px native file input is represented by its visible 44 px label
  and was excluded from visible-target geometry.
- First Tab exposed a 198.58 × 48.80 px skip link with a visible 3 px outline;
  Enter focused the page `h1`.
- Modal keyboard cycling reached no outside interactive control; Escape
  returned focus to **Add a chore**.
- Keyboard month change, arrow-key day movement, Enter selection, SPA route
  heading focus, and browser Back focus restoration passed.
- At a 200% desktop-zoom equivalent, the page reflowed without page overflow
  or lost actions. Reduced-motion media matched, smooth scrolling became
  `auto`, and transition/animation durations became `0.00001s`.
- All 13 unique links returned their intended 200, 303 checkout, or designed
  404 status.
- `/opt/fleet/lib/verify-url.sh` passed live `/demo`: 700 ms network-idle
  load, no browser errors, correct title/language, one `h1`, one `main`, no
  missing image alternatives, and no unlabeled buttons.

Screenshots and machine-readable reports are in
`.factory/evidence-verification-6/`.

## Privacy, billing, and request allowance

- Cold and complete real-data flows loaded no analytics, remote fonts,
  third-party scripts, trackers, or raw Azure/OpenAI endpoints.
- The only cross-origin runtime request exercised was explicit license
  verification. The incoming token was stripped from the address bar, stored
  under `sb_license:chore-proof-calendar`, and sent in exactly one bodyless
  `GET` query parameter to
  `https://api.sociobot.in/api/v1/products/chore-proof-calendar/verify`.
- The verification response used `Cache-Control: no-store` and allowed the
  product origin through CORS.
- The checkout endpoint returned 303 to
  `https://checkout.dodopayments.com/...`.
- Observed allowance: requests 1–30 returned 200; request 31 returned 429 with
  `Retry-After: 4` and
  `Access-Control-Allow-Origin: https://chore-proof-calendar.sociobot.in`.
  Requests 32–33 also returned 429.
- The product has no sign-in flow, so the Microsoft Entra authority check is
  not applicable.

## PWA, headers, caching, and performance

- The live manifest has standalone display, `/app?v=6` start URL, valid
  192/512 maskable PNG icons, and no browser manifest errors.
- The live worker controlled the site, used cache `done-here-v6`, and cached
  `/index.html` plus `/demo`.
- With the browser offline, `/demo` reloaded with four sample chores and the
  visible **Offline. Your calendar still works here.** state.
- A fresh isolated server changed the candidate worker version. The app showed
  **A new version is ready** and **Update now**; activation reloaded the demo,
  kept all four sample chores, replaced the old cache, and emitted no browser
  error.
- Live HTML includes response-header CSP with `frame-ancestors 'none'`, HSTS,
  `nosniff`, strict-origin referrer policy, and restrictive camera/microphone/
  geolocation permissions.
- HTML revalidates after 30 seconds, `sw.js` is no-store, the manifest
  revalidates, and assets use one-year immutable caching. Conditional requests
  for the shell, manifest, and mobile hero returned 304.

Bundle measurements:

| Resource | Raw | Gzip |
| --- | ---: | ---: |
| Inline JavaScript | 32,554 B | 11,616 B |
| Inline CSS | 15,033 B | 4,081 B |
| Full HTML shell | 49,212 B | 15,962 B |
| Mobile hero WebP | 53,244 B | n/a |
| Desktop hero WebP | 106,836 B | n/a |
| Fonts | 0 B | 0 B |

All are below the supplied 200 KB JavaScript, 50 KB CSS, 120 KB font, and
300 KB mobile-hero budgets. Fresh Lighthouse 12.8.2 mobile scores were
Performance **100**, Accessibility **100**, Best Practices **100**, and SEO
**100**; FCP 1.1 s, LCP 1.3 s, TBT 90 ms, CLS 0, and Speed Index 1.1 s. A live
Mark-done interaction produced 16 ms Event Timing entries.

## Candidate/live identity

The exact production build and live deployment are byte-identical for all
critical files checked:

| File | SHA-256 |
| --- | --- |
| `index.html` | `e70092530aa02faf9463c4ee69b9a2bd848290685d00a1877dbb515cac00e18c` |
| `sw.js` | `1dc988c604aff5162206ca15ffe816923c13721b5dcedfb986beeb33c09605df` |
| `manifest.webmanifest` | `5b8d7717d6bc4b72ee83a0adf91eed09449c2ef0033cf7b4c11205cc68616c66` |
| `not-found.html` | `c98fbfc3132230487c548bb48aefea67d359efca546b7ac28b95c97148171e16` |
| Mobile hero | `408852842ee58788231824855cb783bc76346f74485775f79f2c1dcc6bbe7648` |
| Desktop hero | `1998424b8887cb688cf65da67b1fa1fb4b764613ccf2cd586fc2c86a246cef31` |
| 192 px icon | `d855772336804f147efda6bdc2f2d7e669b3afabeea0493c59dae1e898c02585` |
| 512 px icon | `0bf25cb2aab9ca38970baff4f6b047e42fdd057ddef1f1a4494db0100470f6d5` |

Library/CLI consumer packaging and backend concurrency/persistence checks are
not applicable to this static local-first PWA. The only server endpoint in
product scope is the Sociobot purchase/license API, whose request allowance
was verified above.
