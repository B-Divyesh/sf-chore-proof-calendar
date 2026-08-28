# Independent verification 2 — FAIL

- Candidate: `6b9632a3cee30240e13c514d68279d20b2cde83f`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Verified: 2026-08-28 UTC
- Scope: clean-checkout claims, exact production build, live parity, core chore
  flow, invalid and boundary input, desktop and 390 px mobile, keyboard,
  accessibility, privacy/network, HTTP policy, billing rate limits, PWA
  offline/update behavior, and performance.

## Release decision

**FAIL.** The first-read gate and all 15 declared claim commands pass, and the
deployed shell is byte-identical to this candidate. Fresh independent testing
still found four high-severity release blockers: cadence labels are wrong, an
insufficiently validated JSON import can persistently blank the app, the
advertised paid checkout returns 404, and claim coverage misses those outcomes.

## First-read gate — PASS

A cold desktop load and a separate 390 × 844 mobile load both show, above the
fold:

- what it does: “See when each chore was done”;
- who it is for: “For households that need a clear history, not another
  overdue badge”;
- what to click: “Try it with sample data”, beside “See a filled calendar in
  one click.”

The action opens `/demo` in one click. The result already contains four named
chores and seven realistic completions. The persistent banner says “Demo —
sample data, nothing is saved” and provides **Reset demo** and **Start for
real**. A live mutation disappeared on reload; IndexedDB and localStorage
remained empty; Start for real opened an empty `/app`.

## Mandatory claim gate — PASS, with coverage defects below

`.factory/claims.json` exists. Every listed command was run verbatim from the
clean candidate after `npm ci`; all 15 returned zero.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `demo-sandbox` | PASS | sample loaded, mutation reset, no demo storage |
| `one-tap-completion` | PASS | one click added dated history |
| `offline-reload` | PASS | controlled `/demo` reloaded offline |
| `local-data` | PASS | demo completion/export made no remote request |
| `ics-export` | PASS | one UTC event per sample completion |
| `pdf-export` | PASS | declared unit test returned zero |
| `csv-export` | PASS | header plus one row per completion |
| `json-export` | PASS | four chores and seven completions downloaded |
| `json-restore` | PASS | valid sample backup restored all records |
| `recurrence-bounds` | PASS | 0 and 366 rejected; 1 and 365 accepted |
| `completion-proof` | PASS | consented note and photo appeared in history |
| `keyboard-calendar` | PASS | month and day changed by keyboard |
| `photo-tier` | PASS | policy returned limits of 5 and 500 |
| `paid-photo-cap` | PASS | copy and checkout URL matched the test |
| `accessible-baseline` | PASS | mobile demo had no serious/critical Axe issue |

Each claim ID occurs in exactly one tagged test. The passing result does not
remove the release blockers: the paid test only checks the link string, the
PDF test does not assert a completion row, and the visitor-facing next-due
promise has no claim entry.

## Release-blocking defects

### High — due-state labels are wrong for ordinary chores

At `2026-08-28T16:00:45Z` in a fresh live UTC context, creating “Daily sink
wipe” with a one-day interval showed both **“Due in 1 day”** and **“next Aug
28, 2026”**. After marking it done, the same card showed **“Due in 2 days”**
and **“next Aug 29, 2026”**.

The next date is right, but the relative label is always one day too high for
most of the day. `dueInfo` retains the completion time, subtracts today's
midnight, and applies `Math.ceil`. This breaks the brief's at-a-glance cadence
and creates contradictory output in the core workflow.

### High — a malformed backup can persistently blank the app

On live `/app`, importing this syntactically valid JSON was accepted past the
top-level backup check and written to IndexedDB:

```json
{"chores":[{"id":"broken"}],"completions":[]}
```

The current screen reported only “Invalid time value”. After reload, the app
had no heading or rendered content and emitted the page error `Invalid time
value`. The broken record remained in IndexedDB database `done-here:v1`, so the
normal UI offered no way to recover or export existing data. `replaceData`
checks only that the two top-level values are arrays; it does not validate
record fields before clearing and replacing the user's database.

### High — the advertised one-time purchase cannot be bought

The live “Buy Household Pack — $12” link targets the required Sociobot URL,
but a fresh request returned:

```text
HTTP/2 404
{"error":"enabled factory product","status":404}
```

The paid tier, terms, landing page, and README all present this as available.
The `paid-photo-cap` claim test passes because it checks only price text and
the href, not whether checkout works.

### High — claim coverage does not cover all promises or outcomes

- “Each chore shows its latest completion and next due date” and README's
  “immediate last-done and next-due dates” are not listed in claims. That gap
  allowed the incorrect labels above to pass.
- The paid claim says the pack costs $12 once “through Sociobot”, but its test
  stops at the URL string while the endpoint returns 404.
- The PDF claim's sandbox says it asserts content, but the unit test checks
  only `%PDF-1.4`, the generic `Done Here` title, and `%%EOF`. A PDF with no
  completion rows would pass.

The claims contract requires tests of the promised observable outcome, not
only the presence of a link or file wrapper.

## Other defects

### Medium — PDF export destroys non-ASCII household text

`buildPdf` replaces every non-ASCII character with `?`. A direct production
function check with chore `Nettoyer l’évier 洗碗` and note `Fait — très propre`
produced:

```text
(8/28/2026  Nettoyer l??vier ?? ? Fait ? tr?s propre) Tj
```

CSV, ICS, and JSON do not have this loss. The PDF claim test uses only ASCII
sample data and does not detect it.

### Medium — the live `/404` route loops and unknown URLs return 200

`GET /404` returns the 271-byte static `404.html`, whose immediate meta refresh
points back to `/404`; a browser therefore reloads the same page continuously
and never reaches the designed SPA 404. An arbitrary missing path does render
the designed page, but its HTTP response is `200`, not `404`. The local
Playwright test does not reproduce the host's `/404` resolution.

### Medium — several mobile controls are below the 44 px target contract

At 390 px, measured control heights include 23 px for the Demo and Privacy nav
links, 22 px for Start for real, and 34 px for the home wordmark. Core chore
buttons are at least 44 px and there is no horizontal overflow, but these links
do not meet the attached accessibility/design baseline.

### Medium — a non-image file is saved as photo proof

The picker advertises JPEG, PNG, and WebP, but the save path checks only size
and consent. Supplying `not-an-image.txt` with `text/plain` closed the dialog,
showed “Completion saved with proof”, and rendered an `<img>` whose source was
`data:text/plain`. Oversize image recovery works correctly and keeps the
dialog open.

### Low — the footer's factory link did not resolve

`https://param.social` failed DNS resolution on two fresh checks, so the
“Built by Param Factory” footer link was dead from this verifier environment.

## Passing evidence

### Repository gates

- `npm ci`: passed; 59 packages installed; 0 vulnerabilities.
- `npm audit --omit=dev`: passed; 0 vulnerabilities.
- `npm test`: passed — Vitest 7/7 and Playwright 32/32 across desktop Chromium
  and the 390 × 844 mobile project.
- `npm run build`: passed; TypeScript checking is part of this command.
- No lint script is defined.
- Production output exists at `dist/`; `dist/index.html` is 45,991 bytes raw
  and 14.87 KB gzip. No external JavaScript, CSS, or font bundle is loaded.

### Candidate and deployment identity

Fresh live and built files are byte-identical:

| File | SHA-256 |
| --- | --- |
| `index.html` | `ccb99bb8dc0e6d3be610ad4665c6dbacbc99ace5c5299093b8bfd8606fc891c9` |
| `sw.js` | `106c55f6253927c308f9d9a95ccb851d3a4e87228706e2b11403c73af65a4b30` |
| `manifest.webmanifest` | `3c26673795612f9e1f4cbf4ad6ce746936657559f2b0700de72ca655aaf787cd` |

This proves the live deployment matches candidate `6b9632a3` for the app
shell, service worker, and manifest.

### Functional, keyboard, and accessibility

- Valid create, refresh persistence, one-tap completion, note/photo with
  consent, archive confirmation, removal/Undo, valid JSON restore, and all four
  exports worked.
- Empty chore names, intervals 0, 366, and 1.5 were rejected with native,
  specific validation. Intervals 1 and 365 were accepted. A 2,500,001-byte
  image produced a specific recovery message and kept its dialog open.
- Native dialogs trapped focus, Escape closed them, and focus returned to the
  opening button. Calendar arrows and Enter worked. The first stable Tab stop
  exposed the skip link at `top: 16px` with a 3 px visible outline.
- Live Axe scans found 0 serious/critical findings on desktop, 390 px mobile,
  and both open dialogs. Each normal route has one h1, one main, route-specific
  title, `lang="en"`, image alternatives, and no console/page errors.
- Reduced motion computed animation and transition durations as `0.00001s`.

### Privacy, network, and response policy

- Cold home/demo activity and the full demo completion/export flow made only
  same-origin requests. No analytics, remote fonts, CDN scripts, embedded
  Azure keys, or direct payment-provider calls were found.
- License handling strips an incoming token from the URL, stores the token
  under `sb_license:chore-proof-calendar`, and sends it only to the Sociobot
  verifier. A synthetic token returned `{valid:false, reason:"invalid"}`.
- The license verifier is rate limited: requests 1–30 returned 200; request 31
  and the remaining 9 of a rapid 40-request burst returned 429 with
  `Retry-After: 4`.
- `/`, manifest, service worker, and assets returned CSP, HSTS, nosniff,
  strict-origin referrer policy, and Permissions Policy headers. HTML and the
  manifest revalidate; `sw.js` is no-store; `/assets/hero-ceramics-960.webp`
  is `public, max-age=31536000, immutable`.
- No sign-in exists, so the Entra authority requirement is not applicable.

### PWA and performance

- Chromium reported no manifest or installability errors. Icons are valid
  192 × 192 and 512 × 512 PNGs with maskable purpose.
- The live worker controlled `/demo`; cache `done-here-v2` held `/demo` and
  `/index.html`. With browser networking disabled, reload retained the sample
  and displayed the offline notice.
- Against an isolated server returning a changed worker body, the app showed
  “A new version is ready” and created the new cache, proving the update path.
- Lighthouse 12.8.2 mobile: Performance 94, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.0 s, LCP 1.2 s, CLS 0, TBT 280 ms. The current
  Lighthouse 13.4.1 CLI rejected the bundled Chrome 145 as older than its
  required stable version, so the compatible CLI was used.

Evidence artifacts are in `.factory/evidence-2/`.

## Required before release

1. Normalize due calculations to local calendar days and add a claim test that
   asserts both the next date and relative status before and after completion.
2. Validate every imported chore and completion before replacing IndexedDB;
   reject malformed records without changing existing data, and test reload
   recovery.
3. Register/enable the Sociobot product and make the claim test follow the
   checkout response rather than only inspecting the href.
4. Preserve Unicode in PDF rows and assert real sample/Unicode content.
5. Repair hosted 404 behavior, enlarge all mobile targets to 44 × 44 px, reject
   unsupported photo MIME types, and replace or restore the dead footer URL.
