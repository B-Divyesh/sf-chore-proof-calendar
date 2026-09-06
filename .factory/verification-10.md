# Verify recurring chore completion history — PASS

- Work order: `chore-proof-calendar-verify-10`
- Candidate implementation: `da9493593009fcf702410ab246b5f6ab04f54706`
- Documentation commit reviewed: `54a9f41ec497ae90b84e7c8286f4496f0bc5f1dc`
- Deployment: `c56c8446-e65d-4f71-962f-92f68709f593`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Verified: 2026-09-06 UTC
- Product class: offline PWA

## Verdict

**PASS.** There are zero findings at every severity and zero untested public
claims. The live product byte-matches a clean production build containing the
candidate implementation. No product code was changed during verification.

## First screen and sample calendar

Fresh 1440 × 900 desktop and 390 × 844 phone browsers answered the required
questions before scrolling:

- Job: **See when each chore was done.**
- Audience: households that need a clear record of recurring work.
- First action: **Try it with sample data.**

The first action opened the sample in one click. It showed four realistic
chores and all seven August completions across six marked days. The label
**Demo — sample data, nothing is saved** remained visible. A new September
completion moved the calendar to September. **Reset demo** returned to August,
restored all seven completions, selected 27 August, and showed its reset
message. A seeded real IndexedDB record was unchanged on desktop and phone.

A separate live check preloaded real license and verdict values, then opened a
license-bearing demo URL. The values were unchanged, no verification request
was made, and paid state did not enter the demo. Both **Start for real** on a
phone and **Calendar** on desktop loaded existing real history before allowing
a new save. Old and new records survived reload.

Evidence: [sample calendar](evidence-verification-10/sample-calendar-live.json),
[demo license isolation](evidence-verification-10/demo-license-isolation-live.json),
and [demo exits](evidence-verification-10/demo-exit-live.json).

## Public claims and clean checkout

I cloned the pushed `main` branch into a new directory. It was clean at
documentation SHA `54a9f41`, with implementation SHA `da94935`. After the
documented `npm ci`, I ran every `test` value in `.factory/claims.json`
separately and exactly as written.

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `filled-sample-calendar` | PASS |
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

Result: **24 passed, 0 failed, 0 untested**. Every claim ID occurs in exactly
one tagged test. A fresh copy review found no public promise missing from the
registry. Exact command results are in
[claims-clean-clone.json](evidence-verification-10/claims-clean-clone.json).

The same clean checkout passed:

- `npm run lint` and `npm run typecheck`;
- `npm test`: 17 unit tests and 59 browser tests passed, with three intentional
  responsive-project skips;
- `npm run build`: produced `dist/index.html`;
- `npm audit --omit=dev`: zero vulnerabilities.

## Live normal, invalid, boundary, and recovery paths

A fresh real-calendar context passed the end-to-end job:

- the empty state led to chore creation;
- recurrence 0 and 366 were rejected, while the supported 1-day boundary was
  accepted;
- before completion, the daily chore said **Due today** and **next Sep 6**;
  after one tap it said **Due in 1 day**, **Last done Sep 6**, and **next Sep 7**;
- the completion and chore survived reload;
- a photo required consent, and a valid PNG plus note appeared in dated
  history;
- invalid PNG bytes produced a specific error and kept the dialog open;
- ICS contained two UTC events, PDF began `%PDF-`, CSV contained one header and
  two records, and JSON retained the chore, note, photo, and two completions;
- a malformed backup was rejected with an announced message and left the
  current calendar usable.

The complete repository suite also covered empty names, supported recurrence
limits 1 and 365, oversize photos, archive retention, completion undo, revoked
licenses, free and paid photo limits, and valid backup restore.

Evidence: [core live paths](evidence-verification-10/core-paths-live.json).

## Accessibility, keyboard, routes, and links

Live desktop and phone checks covered `/`, `/app`, `/demo`, `/privacy`,
`/terms`, `/404`, and an unknown route:

- zero serious or critical Axe findings and zero browser errors;
- `lang="en"`, one h1, one main, complete image alternatives, correct route
  titles, and no horizontal overflow on all 14 checks;
- all 63 visible phone controls were at least 44 × 44 CSS pixels;
- calendar days measured at least 44 × 48, the Terms link measured 44 × 44,
  and each adjacent chore-action gap measured 8 pixels;
- skip-link focus, dialog containment and return, route focus, and calendar
  Arrow/Enter controls passed;
- reduced motion used 0.01 ms transitions and automatic scrolling;
- the 200% reflow equivalent kept primary and export actions available without
  overflow.

The privacy and terms pages use the common site structure. An unknown address
returns a designed HTTP 404 with the title **Page not found — Done Here**, one
h1, the common header and footer, legal links, and **Return home**. The 404
status is deliberate, not a broken link. A crawl checked 56 rendered links and
14 unique targets with no broken target; the purchase link's 303 redirect and
the 404 page's own skip-link status were classified as expected.

The supplied URL verifier passed live `/demo` with no console errors. Evidence:
[browser matrix](evidence-verification-10/browser-matrix-live.json),
[mobile spacing](evidence-verification-10/mobile-spacing.json),
[link crawl](evidence-verification-10/link-crawl.json), and
[URL verifier](evidence-verification-10/verify-url-live/verify.json).

## Privacy, offline use, updates, and billing

With service workers blocked, a cold landing visit, one-click sample entry,
completion, and JSON export requested only the live document and same-origin
hero image. There were no external requests, browser errors, localStorage
keys, or sessionStorage keys. Demo changes remained separate from real
IndexedDB data.

The live manifest is standalone with start URL `/app?v=11`, working 192 and
512 pixel maskable icons, an activated worker, and cache `done-here-v11`.
Offline `/demo` reload retained four sample chores and displayed its offline
status. An isolated worker update showed **A new version is ready** and
**Update now**, activated `done-here-v11-update-check`, and retained the sample
banner and all four chores.

The document sends CSP, HSTS, `nosniff`, strict-origin referrer policy, and a
restrictive permissions policy. `frame-ancestors 'none'` is a response header.
The worker is `no-store`; the hero is immutable for one year. Checkout returns
303 to `checkout.dodopayments.com`. Invalid verification returns a bodyless,
no-store verdict with the live origin allowed by CORS. A fresh allowance check
returned 200 for requests 1–30 and 429 with `Retry-After: 4` on request 31.

Done Here is a static PWA with no product backend, accounts, tenants, health
endpoint, or server-side product state. Backend tenant, restart, and health
checks therefore do not apply. The rate-limited Sociobot license endpoint is
the only optional server path used by the product.

Evidence: [request log](evidence-verification-10/request-log-live.json),
[PWA check](evidence-verification-10/pwa-live.json),
[worker update](evidence-verification-10/service-worker-update.json),
[response identity](evidence-verification-10/response-identity.json), and
[rate limit](evidence-verification-10/rate-limit.json).

## Performance and deployment identity

The clean build contains 11,841 bytes gzip of JavaScript, 4,081 bytes gzip of
CSS, no font files, and a 53,244 byte mobile hero. These are below all product
budgets. A live Mark-done interaction measured 16 ms maximum Event Timing
duration and 1.9 ms maximum input delay.

Fresh mobile Lighthouse output scored Performance **99**, Accessibility
**100**, Best Practices **100**, and SEO **100**. FCP was 0.96 s, LCP 1.22 s,
TBT 121.5 ms, CLS 0, and transfer 81,283 bytes. The report was fully written
before Chromium emitted its known post-report tab-crash teardown message. The
previous 100 performance score is normal lab variation; the fresh result is
well above the required threshold and is not a public product claim.

The live `index.html`, worker, manifest, 404 document, both hero images, and
both app icons byte-match the clean build. Known product routes, robots, and
sitemap return 200. The unknown route returns the expected HTTP 404. Later
commit `54a9f41` contains documentation only, so the reviewed implementation
remains `da94935`.

Evidence: [bundle budget](evidence-verification-10/bundle-budget.json),
[interaction timing](evidence-verification-10/interaction-timing.json),
[Lighthouse](evidence-verification-10/lighthouse-live.json), and
[response identity](evidence-verification-10/response-identity.json).

## Earlier finding disposition

Every earlier review, polish, verification, and handoff file was inspected.
The following table records fresh proof for each earlier finding class,
including the minor copy findings.

| Earlier finding | Current disposition |
| --- | --- |
| F-1-1 incomplete direct 404 | Fixed. The designed 404 has route metadata, common navigation/footer, legal links, and HTTP 404. |
| F-1-2 to F-1-5 mood or metaphor headings | Fixed. Current labels name recurring chore history, calendar preview, how it works, and what the product does not do. |
| F-1-6 untested artwork provenance copy | Fixed. The public assertion is absent; provenance remains in the design record. |
| F-1-7 to F-1-13 README jargon | Fixed. The current README uses the reviewed plain household wording. |
| F-2-1 inaccurate overdue-badge contrast | Fixed. The first screen now states the audience without contradicting due states; the due-state claim passes. |
| F-2-2 vague consent wording | Fixed. Copy names the consent checkbox and the behavior passes live. |
| F-2-3 license disclosure label | Fixed. The control says **Enter a license** and submission says **Verify license**. |
| Verification 1 clean claim commands | Fixed. All 24 exact commands pass from a clean clone after `npm ci`. |
| Verification 1 static caching | Fixed. The worker is no-store and static artwork is immutable for one year. |
| Verification 1 incomplete claims | Fixed. There are 24 unique claims and zero unlisted or untested promises. |
| Verification 2 due labels | Fixed. Live daily dates and relative labels agree before and after completion. |
| Verification 2 malformed backup data loss | Fixed. The malformed backup is rejected before replacing current data. |
| Verification 2 unavailable checkout | Fixed. The live product endpoint returns the expected hosted-checkout redirect. |
| Verification 2 narrow claim tests | Fixed. Due status, checkout response, PDF rows, and Unicode PDF text are asserted. |
| Verification 2 Unicode PDF loss | Fixed. The exact claim test preserves accented and CJK fixture text. |
| Verification 2 404 loop/status | Fixed. Direct and unknown routes render the designed HTTP 404. |
| Verification 2 undersized mobile controls | Fixed. All measured controls meet 44 × 44. |
| Verification 2 invalid photo acceptance | Fixed. Invalid type and invalid image bytes are rejected with recovery. |
| Verification 2 dead factory link | Fixed. `hello-factory.sociobot.in` returned 200 in the live crawl. |
| Verification 3 narrow Terms target | Fixed. Terms measures 44 × 44. |
| Verification 4 demo license leakage | Fixed. Live demo state neither reads, writes, nor verifies the seeded license. |
| Verification 4 narrow calendar days | Fixed. All 31 visible phone days are at least 44 × 48. |
| Verification 4 missing install, account, ranking, and free claims | Fixed. Each is registered once and passes. |
| Verification 5 missing privacy and refund claims | Fixed. Runtime privacy, token-only verification, and revoked-license claims pass. |
| Verification 5 4 px chore-action gap | Fixed. Every measured gap is 8 pixels. |
| Verification 6 demo exit overwrote real data | Fixed. Both exit controls hydrate and preserve old and new real records. |
| Review 4 R4-1 empty one-click/reset calendar | Fixed. Entry and reset show all seven August completions on phone and desktop. |
| Review 4 untested filled-calendar promise | Fixed. `filled-sample-calendar` is declared once and passes its exact command. |

Reviews 3 and verifications 7–9 recorded no remaining findings. No previously
closed issue regressed in this fresh run.

## Findings

- P0: none.
- P1: none.
- P2: none.
- P3: none.
- Untested public claims: 0.
- Known product gaps: none observed.

