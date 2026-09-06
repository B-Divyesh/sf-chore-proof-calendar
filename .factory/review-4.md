# Review recurring chore completion history — FAIL

- Work order: `chore-proof-calendar-review-4`
- Reviewed: 2026-09-06 UTC
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Implementation candidate: `385de6d2e8c9316557e1a08c42bccbc86b07ed09`
- Documentation base: `819a62cf11e7ef0ed2f045c39dd0b60e12ea471f`

## Verdict

**FAIL — one high-severity finding and one untested public claim.**

The main app, exports, local storage, offline behavior, accessibility checks,
legal routes, and declared claim commands pass. The required one-click sample
path no longer shows the promised filled calendar after the month changed.

## First screen before scrolling

Fresh 390 × 844 phone and 1440 × 900 desktop contexts showed all required
answers above the fold:

- Job: **See when each chore was done.**
- Audience: households that need a clear record of recurring work.
- First action: **Try it with sample data.**
- Stated result: **See a filled calendar in one click.**

The title was **Done Here — See when each chore was done**. Both contexts began
at scroll position zero. Evidence: [`cold-phone.png`](evidence-review-4/cold-phone.png),
[`cold-desktop.png`](evidence-review-4/cold-desktop.png), and
[`review-live.json`](evidence-review-4/review-live.json).

## Finding

### R4-1 — High — The one-click sample and reset show an empty calendar

On 2026-09-06, a fresh phone session followed the visible first action from
`/` to `/?demo=1`. The result had four realistic chore cards and its JSON
export contained seven sample completions. However, the completion calendar
opened on **September 2026** with **zero marked completions**. All seven bundled
sample completions are dated 18–27 August 2026.

A fresh direct load of `/demo` selected August and showed all seven marks. I
then marked one chore done on 6 September. The app moved to September and
showed that new mark. **Reset demo** restored the bundled seven records, but
left the view on September with zero marks. Reloading finally selected August
and showed the seven restored marks.

This contradicts the first-screen promise **“See a filled calendar in one
click.”** It also makes the visible reset result look empty even though the
sample records were restored. The issue appeared after the calendar crossed
from the sample month into September.

The promise has no matching entry in `.factory/claims.json`. The existing
`@claim:demo-sandbox` test clicks the landing action but checks only the URL and
demo banner after that click. It does not assert a populated calendar or the
reset view. Therefore this review records one untested public claim.

The source and live identity evidence explain the behavior. Direct demo boot
selects the latest sample completion. The SPA transition into demo and the
Reset demo handler do not update the selected date or calendar month. The live
shell byte-matches the candidate build.

Required repair: whenever demo mode starts or resets, select the latest sample
completion and its month. Add one tagged claim that starts at `/`, clicks the
first action, asserts all seven calendar marks, marks a chore in another month,
resets, and asserts the original seven marks are visible again.

Evidence: [`review-live.json`](evidence-review-4/review-live.json),
[`demo-first-phone.png`](evidence-review-4/demo-first-phone.png),
[`one-click-empty-calendar-phone.png`](evidence-review-4/one-click-empty-calendar-phone.png),
[`reset-empty-calendar-phone.png`](evidence-review-4/reset-empty-calendar-phone.png), and
[`response-identity-live.json`](evidence-review-4/response-identity-live.json).

## Demo isolation and real data

The demo isolation boundary itself passed.

- The banner, **Reset demo**, and **Start for real** remained present.
- A demo mutation raised the stored sample count from seven to eight.
- Reset and reload restored the stored count to seven.
- A real IndexedDB sentinel remained byte-for-byte unchanged.
- Real localStorage and sessionStorage values remained unchanged.
- A license-bearing demo URL neither activated the paid state nor changed the
  stored real license values.
- The demo flow made no cross-origin request.
- Fresh mobile and desktop demo exits hydrated existing real history before a
  new save. Old and new chores remained after reload.

No real household data was read or changed. All checks used fresh disposable
browser contexts and artificial records.

## Declared claims

After `npm ci` in clean clone `/tmp/chore-proof-review4.QPo1IX` at documentation
SHA `819a62c…`, I ran every `test` command from `.factory/claims.json`
separately and exactly as written. All 23 declared commands passed:

`demo-sandbox`, `one-tap-completion`, `offline-reload`, `installable-pwa`,
`no-account`, `local-data`, `runtime-privacy`, `license-token-only`,
`refunded-license`, `ics-export`, `pdf-export`, `csv-export`, `json-export`,
`no-household-ranking`, `json-restore`, `recurrence-bounds`, `due-status`,
`completion-proof`, `free-core`, `keyboard-calendar`, `photo-tier`,
`paid-photo-cap`, and `accessible-baseline`.

Each declared ID has one tagged test. R4-1 is still release-blocking because
the filled-calendar promise is absent from the registry and is false in the
primary entry path. Exact command results are in
[`claims-clean-clone.json`](evidence-review-4/claims-clean-clone.json).

## Normal, invalid, boundary, and recovery paths

Fresh live checks passed for:

- empty real calendar, chore creation, persistence, and one-tap completion;
- matching last-done, next-due, and dated history output;
- recurrence values 0 and 366 rejected, with 21 accepted; declared tests also
  cover the supported boundaries 1 and 365;
- missing photo consent, invalid file type, and invalid image bytes rejected
  with the proof dialog left open for recovery;
- valid PNG and note saved and shown in history;
- malformed backup rejected with an announced message while current data
  remained usable after reload;
- ICS with UTC events, PDF, CSV rows, and JSON with notes and image data;
- archive hiding the active chore while retaining its exported history;
- existing real records surviving both demo exit actions before and after a
  new save.

Evidence: [`live-e2e.json`](evidence-review-4/live-e2e.json) and
[`demo-exit-live.json`](evidence-review-4/demo-exit-live.json).

## Accessibility, routes, privacy, PWA, and links

- Fourteen desktop/mobile route scans found zero serious or critical Axe
  issues, console errors, missing image alternatives, or horizontal overflow.
- Every visible mobile control was at least 44 × 44 CSS px. The four previously
  cramped chore action pairs each had an 8 px gap.
- Skip-link focus, dialog trapping and return, arrow and Enter calendar use,
  History API route focus, reduced motion, and 200% reflow passed.
- `/`, `/app`, `/demo`, `/privacy`, and `/terms` returned 200 with distinct
  titles, one h1, one main, and `lang="en"`.
- `/missing-route` returned an intentional HTTP 404 and rendered the designed
  page with its return action and legal links.
- All discovered site and factory links returned 200. Checkout returned the
  expected 303 redirect to Dodo.
- With service workers blocked, the live real-calendar and demo flows made no
  unexpected cross-origin request. No analytics, remote font, or third-party
  runtime script loaded.
- The worker controlled the demo, offline reload kept four chores and showed
  the offline notice, and an isolated worker update displayed **Update now**,
  replaced the cache, and kept the demo state.
- The license endpoint allowed 30 requests, then returned 429 with
  `Retry-After: 4` on request 31.

This product has no product-owned backend, accounts, tenants, server database,
or process restart path. Backend tenant and restart checks do not apply. The
product-scoped Sociobot billing endpoint was checked as described above.

Evidence: [`browser-matrix-live.json`](evidence-review-4/browser-matrix-live.json),
[`verify-url/verify.json`](evidence-review-4/verify-url/verify.json),
[`mobile-action-gaps.json`](evidence-review-4/mobile-action-gaps.json),
[`service-worker-update.json`](evidence-review-4/service-worker-update.json),
and [`rate-limit.json`](evidence-review-4/rate-limit.json).

## Earlier finding disposition

Every earlier review and verification report was read. The following results
were checked again against the live product and current source.

| Earlier finding | Current disposition |
| --- | --- |
| F-1-1, incomplete 404 skeleton | Fixed: unknown URLs return HTTP 404 with the shared structure, metadata, legal links, and return action. |
| F-1-2 through F-1-5, mood and metaphor labels | Fixed: the landing labels plainly name completion history, calendar preview, how it works, and product limits. |
| F-1-6, untested public art provenance | Fixed: that assertion is absent from public copy; provenance remains in the design record. |
| F-1-7 through F-1-13, README jargon and incomplete outcomes | Fixed: recurrence, completion, offline use, checkout, browser storage, demo isolation, and host behavior use plain result-based wording. |
| F-2-1, overdue-state contradiction | Fixed: the copy no longer denies an overdue state. |
| F-2-2, vague photo-consent wording | Fixed: the copy names the checkbox and the live flow enforces it. |
| F-2-3, vague license disclosure action | Fixed: **Enter a license** names the result. |
| V1 clean-checkout claim commands | Fixed: all 23 exact commands run after `npm ci` without a prior manual build. |
| V1 immutable asset caching | Fixed: artwork returns one-year immutable caching; HTML, manifest, and worker remain revalidated. |
| V1/V2/V4 general claim coverage | Incomplete: all promises named in those reports gained tests, but R4-1 proves the filled-calendar promise remains unlisted and untested. |
| V2 wrong due labels | Fixed: the live 21-day chore showed **Due in 21 days** and the matching 27 September date. |
| V2 malformed backup data loss | Fixed: the invalid record is rejected before writing and the existing calendar survives reload. |
| V2 checkout 404 | Fixed: checkout returns 303 to `checkout.dodopayments.com`. |
| V2 weak PDF and paid tests | Fixed for the named outcomes: tests inspect completion content and follow live checkout. |
| V2 Unicode PDF loss | Fixed: the unit fixture passes and PDF export remains valid. |
| V2 404 loop and wrong status | Fixed: `/404` and unknown URLs render the designed page; unknown URLs return HTTP 404. |
| V2/V3/V4 mobile target sizes | Fixed: all 63 visible controls, including calendar days and Terms, meet 44 × 44 px. |
| V2 invalid photo acceptance | Fixed: MIME type and file signatures are checked with a recoverable error. |
| V2 dead factory link | Fixed: the current factory link returns 200. |
| V4 demo license leakage | Fixed: seeded real license and preference values remain unchanged and paid state is hidden in demo. |
| V5 untested privacy and license promises | Fixed: runtime privacy, token-only verification, and refunded-license claims have passing tagged tests. |
| V5 4 px mobile action gap | Fixed: every measured gap is 8 px. |
| V6 demo exit data loss | Fixed: both exits hydrate before render and preserve old plus new records after reload. |

## Quality and performance results

- `npm ci`: PASS, 141 packages, zero audit vulnerabilities.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm test`: PASS, 17 unit tests and 57 browser tests; three intentional
  project-specific skips.
- `npm run build`: PASS and produced `dist/index.html`.
- Worker URL verification: PASS.
- Live and built HTML, worker, manifest, 404 file, hero images, and PWA icons
  match by SHA-256.
- Inline JavaScript: 11,856 bytes gzip; inline CSS: 4,081 bytes gzip; fonts:
  zero; mobile hero: 53,244 bytes.
- Fresh mobile Lighthouse: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 956 ms, LCP 1,211 ms, CLS 0, TBT 73.5 ms, transfer 81,274
  bytes.

Evidence: [`lighthouse-live.json`](evidence-review-4/lighthouse-live.json) and
[`response-identity-live.json`](evidence-review-4/response-identity-live.json).

## Missed leverage

No extra AI, sync, import, or export feature is implied strongly enough to add.
The existing portability formats cover the useful next step. Cloud sync would
change the local-only contract. The only required work is to make the existing
sample action and reset show their populated calendar and test that promise.
