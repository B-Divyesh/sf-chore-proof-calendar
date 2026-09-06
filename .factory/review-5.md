# Review recurring chore completion history — FAIL

- Work order: `chore-proof-calendar-review-5`
- Reviewed: 2026-09-06 UTC
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Candidate implementation: `da9493593009fcf702410ab246b5f6ab04f54706`
- Documentation commit reviewed: `a790a57b4e4a2fb351c279c1355bee0c0df4e92b`
- Product class: offline PWA

## Verdict

**FAIL — 3 findings and 5 untested public claims.**

The live product works end to end, all 24 declared claim commands pass, and
the deployment byte-matches the implementation candidate. The strict claims
gate still fails. Public archive, backup, photo, and deletion promises are
absent from the registry or only partly tested. No product code was changed.

## Findings

### F-5-1 — High — Archive retention has no declared claim

The archive confirmation says **“Its completion history will remain in
exports.”** This is a result a household can rely on before a destructive
action (`src/main.ts:235`).

There is no archive-retention entry in `.factory/claims.json`. A search of the
tests finds `archive` only in the mobile spacing test. No test completes a
chore, archives it, and checks an export. Verification 10's statement that the
suite covered archive retention is not supported by the current tests.

A fresh live check confirmed that the current behavior is correct: the
archived chore left the active list, while JSON retained one archived chore
and both completions. A one-off review check does not replace the required
repeatable claim command.

Required repair: register the promise and add one tagged test that completes,
archives, exports, and checks the retained chore and history.

Evidence: [live core paths](evidence-review-5/live-core.json) and
[claim audit](evidence-review-5/claim-audit.json).

### F-5-2 — High — Full JSON tests only count records

The registry promises **“Exports a full JSON backup”** and **“Restores a full
JSON backup.”** The export test checks only four chores and seven completions
(`tests/e2e/claims.spec.ts:281-283`). The restore test checks the same two
counts after a round trip (`tests/e2e/claims.spec.ts:319-326`).

Both commands would pass if names, recurrence values, timestamps, notes,
photos, or archived state were removed or changed. The sample has notes, but
neither tagged test inspects one. It has no photo or archived chore. Full field
fidelity is therefore untested for both claims.

A fresh live check exported a note and PNG correctly. That proves the current
runtime, not the declared regression coverage.

Required repair: make export compare every field from a fixture with a note,
photo, recurrence, and archived chore. Make restore round-trip that fixture
and deep-compare the result. Keep one tagged test for each claim.

Evidence: [live core paths](evidence-review-5/live-core.json),
[clean-checkout results](evidence-review-5/claims-clean-clone.json), and
[claim audit](evidence-review-5/claim-audit.json).

### F-5-3 — High — Two data promises lack direct claim coverage

The app says:

- **“Photos stay in this browser and appear in exported JSON.”**
  (`src/main.ts:177`)
- **“Removing site data removes the local calendar.”**
  (`src/main.ts:209`)

The `local-data` test records requests while saving a completion without a
photo. The `json-export` test uses sample data with no photo and checks only
record counts. No declared command clears browser site data and checks that
the calendar is gone. These privacy and data-ownership results are not fully
mapped to observable sandbox tests.

Fresh disposable live contexts made no external request, retained the photo
in JSON, and showed zero stored rows after clearing site data. The behavior is
correct, but the claims contract requires these results in declared tests.

Required repair: register each retained promise and test it directly, or
remove the promise. The photo test must record requests and inspect exported
photo data. The deletion test must clear origin storage, reload, and assert an
empty real calendar.

Evidence: [live core paths](evidence-review-5/live-core.json) and
[claim audit](evidence-review-5/claim-audit.json).

## First screen and sample data

Fresh 1440 × 900 desktop and 390 × 844 phone browsers answered the required
questions before scrolling:

- Job: **See when each chore was done.**
- Audience: households that need a clear record of recurring work.
- First action: **Try it with sample data.**
- Result: **See a filled calendar in one click.**

The action opened four realistic chores and all seven August completions
across six days. The label **Demo — sample data, nothing is saved** remained
visible. After a September completion, **Reset demo** returned to August,
selected 27 August, and restored all seven completions. Seeded real IndexedDB
data was unchanged on phone and desktop.

A separate context seeded real license values before opening a license-bearing
demo URL. The values did not change, no verification request occurred, paid
state stayed hidden, and the sample label remained visible. Both demo exits
loaded existing real history before a new save. Old and new records survived
reload.

Evidence: [phone first screen](evidence-review-5/first-read-phone.png),
[desktop first screen](evidence-review-5/first-read-desktop.png),
[sample result](evidence-review-5/sample-calendar-live.json), and
[demo exits](evidence-review-5/demo-exit-live.json).

## Declared claims and clean checkout

I cloned pushed `main` into a new directory. It was clean at documentation SHA
`a790a57`, with implementation SHA `da94935`. After `npm ci`, every `test`
value in `.factory/claims.json` ran separately and exactly as written.

All 24 commands returned zero, and every registered ID occurs in one tagged
test. This does not override F-5-1 through F-5-3 because the registry and two
test bodies do not cover every public result.

The same clean checkout passed:

- `npm run lint`;
- `npm run typecheck`;
- `npm test`: 17 unit and 59 browser tests passed, with three intentional
  responsive-project skips;
- `npm run build`: produced `dist/index.html`;
- `npm audit --omit=dev`: zero vulnerabilities.

Evidence: [clean-checkout results](evidence-review-5/claims-clean-clone.json).

## Live normal, invalid, boundary, and recovery paths

A fresh real-calendar context passed these checks:

- the empty state led to adding a chore;
- an empty name, 0 days, and 366 days were rejected; 1 day was accepted;
- before completion, the chore showed **Due today** and **next Sep 6, 2026**;
- after one tap, it showed **Due in 1 day**, **Last done Sep 6, 2026**, and
  **next Sep 7, 2026**;
- missing consent and invalid PNG bytes produced specific errors while keeping
  the proof dialog open;
- a valid PNG and note appeared in dated history;
- ICS contained two UTC events, PDF had a valid header and terminator, CSV had
  one header and two records, and JSON retained the note and photo;
- a malformed backup was announced and rejected without changing current
  data; the calendar survived reload;
- archiving hid the chore and retained its two exported completions;
- clearing disposable origin data left zero stored rows and an empty app.

There were no browser errors, unexpected external requests, localStorage
keys, or sessionStorage keys in the unlicensed real-data flow.

Evidence: [live core paths](evidence-review-5/live-core.json).

## Accessibility, keyboard, routes, and links

Fresh desktop and phone checks covered `/`, `/app`, `/demo`, `/privacy`,
`/terms`, `/404`, and an unknown route:

- 14 route scans found zero serious or critical Axe findings and zero browser
  errors;
- every route had `lang="en"`, one h1, one main, complete image alternatives,
  a route-specific title, and no horizontal overflow;
- all 63 visible phone controls measured at least 44 × 44 CSS pixels;
- skip-link focus, dialog containment and return, route focus, calendar Arrow
  and Enter controls, reduced motion, and 200% reflow passed;
- the supplied URL verifier passed `/demo` with no console error;
- 65 rendered links across seven routes resolved to ten unique targets with
  no broken target.

Direct `/404` and the unknown route deliberately return HTTP 404. Both render
the designed page with title **Page not found — Done Here**, shared header and
footer, legal links, and **Return home**. Their status is expected, not a
defect.

Evidence: [browser matrix](evidence-review-5/browser-matrix-live.json),
[link crawl](evidence-review-5/link-crawl.json), and
[URL verifier](evidence-review-5/verify-url-live/verify.json).

## Privacy, offline use, updates, and billing

The live manifest is a standalone PWA with `/app?v=11`, working 192 and 512
pixel maskable icons, an activated worker, and cache `done-here-v11`. Offline
`/demo` reload retained four chores and showed the offline notice. An isolated
update displayed **A new version is ready** and **Update now**, activated the
replacement cache, and retained the sample label and four chores.

The document sends CSP, HSTS, `nosniff`, a strict-origin referrer policy, and
a restrictive permissions policy. `frame-ancestors 'none'` is a response
header. The worker is `no-store`; the hero is immutable for one year.

Checkout returned 303 to `checkout.dodopayments.com`. Invalid verification
returned a no-store result with the live origin allowed by CORS. A fresh
allowance check returned 200 for requests 1–30 and 429 with `Retry-After: 4`
on request 31.

Done Here has no product backend, accounts, tenants, health endpoint,
server-side state, or restart path. Backend tenant, SQLite restart, and health
checks do not apply. The product-scoped Sociobot license endpoint is the only
optional server path used by the PWA.

Evidence: [deployment and headers](evidence-review-5/response-identity-live.json),
[worker update](evidence-review-5/service-worker-update.json), and
[rate limit](evidence-review-5/rate-limit.json).

## Performance and deployment identity

The clean build contains 11,841 bytes gzip of JavaScript, 4,081 bytes gzip of
CSS, no fonts, and a 53,244 byte mobile hero. All budgets pass.

Fresh mobile Lighthouse scored Performance **100**, Accessibility **100**,
Best Practices **100**, and SEO **100**. FCP was 0.99 s, LCP 1.22 s, TBT 38
ms, CLS 0, and transfer size 72,416 bytes.

The live shell, worker, manifest, 404 document, hero images, and app icons
byte-match the clean build. Commits after `da94935` contain reports and
evidence only, so `da94935` is the implementation reviewed and `a790a57` is
the documentation SHA.

Evidence: [bundle budget](evidence-review-5/bundle-budget.json),
[Lighthouse](evidence-review-5/lighthouse-live.json), and
[deployment identity](evidence-review-5/response-identity-live.json).

## Earlier finding disposition

Every earlier review, polish, verification, and handoff file was inspected.

| Earlier finding | Current disposition |
| --- | --- |
| F-1-1 incomplete 404 | Fixed. Fresh 404s have shared structure, metadata, legal links, a return action, and HTTP 404. |
| F-1-2 to F-1-5 mood or metaphor headings | Fixed. Current headings name the page content plainly. |
| F-1-6 public art provenance claim | Fixed. It is absent from public copy and remains in the design record. |
| F-1-7 to F-1-13 README wording | Fixed. Current README uses plain result-based wording. |
| F-2-1 overdue comparison | Fixed. Audience copy no longer contradicts due states. |
| F-2-2 vague consent wording | Fixed. Copy names the checkbox and the live flow enforces it. |
| F-2-3 vague license action | Fixed. Controls say **Enter a license** and **Verify license**. |
| Verification 1 clean claim commands | Fixed. All 24 exact commands run after `npm ci`. |
| Verification 1 static caching | Fixed. The worker revalidates and artwork is immutable. |
| Verification 1/2/4 general claim coverage | Reopened. F-5-1 to F-5-3 identify five retained results without complete declared coverage. |
| Verification 2 due labels | Fixed. Live relative labels and dates agree. |
| Verification 2 malformed backup loss | Fixed. Invalid data is rejected before replacement. |
| Verification 2 checkout failure | Fixed. The endpoint reaches hosted checkout. |
| Verification 2 narrow paid and PDF tests | Fixed for the results named there. |
| Verification 2 Unicode PDF loss | Fixed. The Unicode fixture passes. |
| Verification 2 404 loop/status | Fixed. Direct and unknown routes show the designed 404. |
| Verification 2 undersized controls | Fixed. All measured controls meet 44 × 44. |
| Verification 2 invalid photo acceptance | Fixed. Invalid type and bytes are rejected. |
| Verification 2 dead factory link | Fixed. The current factory link resolves. |
| Verification 3 narrow Terms target | Fixed. It meets the minimum target. |
| Verification 4 demo license leakage | Fixed. Demo does not read, change, or verify seeded real license state. |
| Verification 4 narrow calendar days | Fixed. The phone grid meets the target rule. |
| Verification 4 named missing claims | Fixed for install, account, ranking, and free-core claims. |
| Verification 5 named missing claims | Fixed for runtime privacy, token-only verification, and refund behavior. |
| Verification 5 4 px action gap | Fixed. Current gaps are 8 px. |
| Verification 6 demo exit data loss | Fixed. Both exits preserve old and new real records. |
| Review 4 empty sample calendar | Fixed. Entry and reset show all seven completions. |
| Review 4 filled-calendar claim | Fixed. It is registered once and passes. |

Reviews 3 and verifications 7–9 recorded no remaining findings. Verification
10's product checks reproduce, but its zero-untested-claims conclusion and
archive-coverage statement do not survive this source-to-test audit.

## Missed leverage

No AI feature is warranted. JSON restore and the calendar, ICS, PDF, CSV, and
JSON exports cover useful portability. Cloud sync would conflict with the
local-first scope. This check adds no finding.

## Result counts

- Critical findings: 0
- High findings: 3
- Medium findings: 0
- Low findings: 0
- Total findings: 3
- Untested public claims: 5
- Verdict: **FAIL**
