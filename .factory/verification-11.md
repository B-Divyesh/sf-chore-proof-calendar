# Verify recurring chore completion history — PASS

- Work order: `chore-proof-calendar-verify-11`
- Verified: 2026-09-06 UTC
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Runtime implementation: `da9493593009fcf702410ab246b5f6ab04f54706`
- Claims repair: `0dbc219f3f79b47991c9f216ef52ea4dfb04580f`
- Documentation baseline: `e5db22164f045009939c271df6c5083a458fc970`
- Product class: offline PWA

## Verdict

**PASS.** There are zero findings at every severity and zero untested public
claims. The live product byte-matches the rebuilt runtime artifacts. The
household chore-recording job works on fresh desktop and phone browsers,
including the isolated sample, local persistence, recovery, exports, offline
reload, and legal routes.

## First screen and sample

Before scrolling in separate fresh 1440 × 900 desktop and 390 × 844 phone
contexts, the page stated:

- Job: **See when each chore was done.**
- Audience: households that need a clear record of recurring work.
- First action: **Try it with sample data.**
- Expected result: **See a filled calendar in one click.**

The action opened four realistic chores and seven August completions across
six calendar days. The persistent label said **Demo — sample data, nothing is
saved** and showed **Reset demo** and **Start for real**. After adding a
September completion, reset returned to August, selected 27 August, and
restored all seven sample completions. A real-data sentinel in the disposable
browser profile was unchanged on both viewports. There were no browser errors
or cross-origin requests.

Evidence: [sample results](evidence-verification-11/sample-calendar-live.json),
[desktop first screen](evidence-verification-11/first-read-desktop.png),
[phone first screen](evidence-verification-11/first-read-phone.png), and
[demo exits](evidence-verification-11/demo-exit-live.json).

## Declared claims

A fresh clone of pushed `main` at `e5db221` received `npm ci`. Every `test`
value in `.factory/claims.json` then ran separately and exactly as declared.

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
| `photo-json-local` | PASS |
| `archive-retention` | PASS |
| `site-data-deletion` | PASS |
| `free-core` | PASS |
| `keyboard-calendar` | PASS |
| `photo-tier` | PASS |
| `paid-photo-cap` | PASS |
| `accessible-baseline` | PASS |

Result: **27 passed, 0 failed, 0 untested.** All 27 IDs are unique and each
occurs in exactly one tagged test. The claims audit and an independent reread
of the landing page, app, archive confirmation, privacy, terms, metadata, and
README found no missing public claim. The five outcomes raised in review 5
now have direct outcome coverage: archive retention; complete JSON export and
restore fidelity; local photo persistence and JSON inclusion; and site-data
deletion.

Evidence: [clean-checkout results](evidence-verification-11/claims-clean-clone.json).

## Clean-checkout quality gates

- `npm ci`: PASS; 141 packages installed and zero vulnerabilities reported.
- `npm run lint`: PASS with zero warnings.
- `npm run typecheck`: PASS.
- `npm audit --omit=dev`: PASS with zero vulnerabilities.
- `npm test`: PASS; 17 unit tests and 65 browser tests passed. Three expected
  project-specific responsive skips were reported; no test failed.
- `npm run build`: PASS; `dist/index.html` is 50,348 bytes raw and 16,180
  bytes gzip.

The rebuilt page contains 11,841 bytes gzip of JavaScript and 4,081 bytes gzip
of CSS. It loads no fonts; the mobile hero is 53,244 bytes. All stated static
budgets pass.

Evidence: [clean-checkout results](evidence-verification-11/claims-clean-clone.json)
and [bundle sizes](evidence-verification-11/bundle-budget.json).

## Live normal, invalid, boundary, and recovery paths

A fresh real-calendar browser profile passed the complete job:

- the empty state led directly to creating a chore;
- empty names and intervals of 0 and 366 were rejected, while 1 was accepted;
- before completion the daily chore showed **Due today** and 6 September;
- one tap recorded it and showed **Due in 1 day**, its last-done date, and 7
  September as the next due date;
- missing photo consent and invalid PNG bytes produced specific errors while
  keeping the dialog open;
- a valid PNG and note appeared in dated history;
- ICS contained two UTC events, PDF had a valid header and terminator, CSV had
  a header and two records, and JSON retained the note and exact photo data;
- malformed JSON was announced and rejected without changing saved data, and
  the current calendar survived reload;
- archiving hid the chore while JSON retained the archived chore and both
  completion records;
- clearing site data left zero stored records and an empty calendar.

The flow produced no console error, unexpected external request, or stray
storage key. A separate demo context preserved seeded real license values,
made no verification request, and did not expose paid state. Both **Start for
real** and the **Calendar** link loaded existing real history before accepting
a new record; old and new records survived reload.

Evidence: [core paths](evidence-verification-11/live-core.json) and
[demo exits](evidence-verification-11/demo-exit-live.json).

## Accessibility, keyboard, routes, and links

Fresh desktop and phone checks covered `/`, `/app`, `/demo`, `/privacy`,
`/terms`, `/404`, and an unknown route:

- 14 route scans found zero serious or critical Axe issues and zero console
  or page errors;
- every route had `lang="en"`, one `h1`, one `main`, complete image
  alternatives, a route-specific title, and no horizontal overflow;
- all 63 visible phone controls were at least 44 × 44 CSS pixels; adjacent
  chore actions had 8 px gaps and calendar days measured at least 44 × 48;
- skip-link focus, dialog containment and focus return, route-change focus,
  calendar arrow and Enter controls, reduced motion, and 200% reflow passed;
- the supplied URL verifier passed live `/demo` in 544 ms with no errors;
- 65 rendered links across seven routes resolved to ten unique targets with
  no broken target.

Direct `/404` and the unknown route deliberately returned HTTP 404 and the
designed **Page not found — Done Here** page. These expected responses are not
defects. Privacy and terms returned 200 with the shared page structure.

Evidence: [browser matrix](evidence-verification-11/browser-matrix-live.json),
[mobile spacing](evidence-verification-11/mobile-spacing.json),
[link crawl](evidence-verification-11/link-crawl.json), and
[URL verifier](evidence-verification-11/verify-url-live/verify.json).

## PWA, privacy, billing, and performance

The live standalone manifest, worker, 192/512 icons, and versioned cache match
the clean build. A fresh controlled `/demo` reloaded offline with all four
sample chores and the offline notice. An isolated changed worker showed **A
new version is ready** and **Update now**, activated the new cache, and kept
the sample label and chores.

The document sends CSP, HSTS, `nosniff`, strict-origin referrer policy, and a
restrictive permissions policy. `frame-ancestors 'none'` is a response header.
The worker is `no-store`; artwork is immutable for one year. The live checkout
returned 303 to the hosted Dodo checkout. Invalid license verification
returned a no-store response with the product origin allowed by CORS. A fresh
allowance check returned 200 for requests 1–30 and then 429 with
`Retry-After: 4` on request 31.

Fresh mobile Lighthouse scores were Performance 100, Accessibility 100, Best
Practices 100, and SEO 100. FCP was 0.98 s, LCP 1.22 s, total blocking time
67.5 ms, CLS 0, and transferred bytes 72,350.

Evidence: [deployment identity and headers](evidence-verification-11/response-identity.json),
[worker update](evidence-verification-11/service-worker-update.json),
[rate limit](evidence-verification-11/rate-limit.json), and
[Lighthouse](evidence-verification-11/lighthouse-live.json).

Done Here has no product backend, accounts, tenants, server-side state,
health endpoint, or restart path. Backend tenant isolation, SQLite restart,
and health checks do not apply. The product-scoped Sociobot billing endpoints
are the only optional server paths used by the static PWA.

## Deployment identity

The live `index.html`, service worker, manifest, not-found document, both hero
images, and both app icons byte-match the clean build. Known routes, robots,
and sitemap return 200. Unknown routes return the expected 404. The runtime
candidate is `da949359`; `0dbc219` changes claims and tests, and `e5db221`
adds verification documentation and evidence. Neither later commit changes
the shipped product runtime.

Evidence: [response identity](evidence-verification-11/response-identity.json).

## Earlier finding disposition

Every earlier review, verification, polish, and handoff report was inspected,
including minor findings.

| Earlier finding | Current disposition and fresh proof |
| --- | --- |
| F-1-1 incomplete direct 404 | Fixed. Both 404 addresses return the designed 404 with metadata, navigation, legal links, and a return action. |
| F-1-2 to F-1-5 mood or metaphor headings | Fixed. Current headings plainly name the calendar preview, instructions, and product limits. |
| F-1-6 untested artwork provenance copy | Fixed. It is absent from public copy and remains only in the design record. |
| F-1-7 to F-1-13 README jargon | Fixed. Current README uses plain household and deployment wording; the copy audit passes. |
| F-2-1 inaccurate overdue comparison | Fixed. The first screen now names the audience accurately; fresh due dates and labels agree. |
| F-2-2 vague consent wording | Fixed. Copy names the consent checkbox and the live validation enforces it. |
| F-2-3 vague license action | Fixed. Controls say **Enter a license** and **Verify license**. |
| Verification 1 clean claim commands | Fixed. All 27 exact commands pass after `npm ci` in a fresh clone. |
| Verification 1 static caching | Fixed. Worker responses are no-store and artwork is immutable for one year. |
| Verification 1/2/4 general claim coverage | Fixed. The registry has 27 unique claims, one tagged test each, and no unlisted public promise. |
| Verification 2 incorrect due labels | Fixed. Fresh daily relative and calendar dates agree before and after completion. |
| Verification 2 malformed backup data loss | Fixed. Invalid records are rejected without changing current data; reload succeeds. |
| Verification 2 unavailable checkout | Fixed. The live endpoint returns 303 to hosted checkout. |
| Verification 2 weak PDF and paid tests | Fixed. Export content, Unicode, exact price, and the checkout response are asserted. |
| Verification 2 Unicode PDF loss | Fixed. The unit claim preserves accented and CJK fixture text. |
| Verification 2 404 loop or wrong status | Fixed. Direct and unknown routes render the designed HTTP 404. |
| Verification 2 undersized mobile controls and Verification 3 Terms target | Fixed. All 63 measured targets meet 44 × 44 pixels. |
| Verification 2 invalid photo acceptance | Fixed. Unsupported type or bytes are rejected with a recoverable error. |
| Verification 2 dead factory link | Fixed. The factory link returned 200 in the fresh crawl. |
| Verification 4 demo license leakage | Fixed. Seeded license state remains unchanged and no verifier request occurs in demo. |
| Verification 4 narrow calendar days | Fixed. The mobile matrix reports no undersized target. |
| Verification 4 missing install, account, ranking, and free claims | Fixed. Each has one passing declared claim. |
| Verification 5 missing privacy and refund claims | Fixed. Runtime privacy, token-only verification, and revoked-license claims pass. |
| Verification 5 4 px chore-action gap | Fixed. Fresh live measurement is 8 px for every sample chore. |
| Verification 6 demo exit data loss | Fixed. Both exits preserve existing and newly added real records after reload. |
| Review 4 empty one-click/reset calendar | Fixed. Both viewports show all seven records after entry and reset. |
| Review 4 untested filled-calendar promise | Fixed. `filled-sample-calendar` is declared once and passes. |
| Review 5 archive retention | Fixed. The declared test and fresh live flow retain the archived chore and two completion records in JSON. |
| Review 5 incomplete JSON export/restore tests | Fixed. Both tests deep-compare every supported field using active and archived records, recurrence, timestamps, notes, and photo data. |
| Review 5 local-photo and site-data deletion coverage | Fixed. Both have direct declared tests; fresh live checks also pass. |

Reviews 3 and verifications 7–10 recorded no remaining product findings. No
previously closed issue regressed.

## Findings

- Critical: 0
- High: 0
- Medium: 0
- Low: 0
- Untested public claims: 0
- Known product gaps: none observed
