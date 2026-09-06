# Done Here repair 9 handoff — PASS

- Work order: `chore-proof-calendar-repair-9`
- Failed review commit: `43c45fb69582a6e240df31ded1ccc1c8e235a66f`
- Implementation commit: `da9493593009fcf702410ab246b5f6ab04f54706`
- Deployment: `c56c8446-e65d-4f71-962f-92f68709f593`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Verified: 2026-09-06 UTC

## Result

**PASS.** The one-click sample and **Reset demo** now select the latest bundled
completion and its August 2026 month. A fresh phone or desktop visitor sees six
populated days containing all seven sample completions. After a new completion
moves the calendar to September, reset returns to August and shows the original
seven completions again. The persistent demo label remains visible and the
same flow leaves a seeded real IndexedDB record unchanged.

The root cause was split date-state initialization. Direct `/demo` boot set
`selectedDate` and `calendarMonth`, while client-side entry and reset only
replaced `demoData`. `resetDemoState()` now performs both operations and is used
for direct boot, every transition from real mode into demo mode, and reset.
Reset feedback is rendered after the new shell, so it remains visible.

The retained public sentence **“See a filled calendar in one click”** is now
registered as `@claim:filled-sample-calendar`. Its browser test starts at `/`
on 6 September 2026, seeds real storage, clicks the first action, checks the
exact six marked dates and seven total completions, adds a September
completion, resets, repeats the August assertions, and compares real storage.

## Clean verification

A new clone of pushed implementation `da94935` ran the documented setup and
every claim command independently. All 24 claims passed with
`CLAIM_FAILURES 0`.

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

- Lint and TypeScript: pass.
- Unit tests: 17 passed.
- Browser tests: 59 passed; three intentional responsive-only skips.
- Production build: pass; `dist/index.html` produced.
- Production audit: zero vulnerabilities.
- Output: 33,690 B JavaScript raw / 11,841 B gzip; 15,033 B CSS raw /
  4,081 B gzip; 53,244 B mobile hero; no downloaded font.

The latest committed review evidence script had made clean lint fail because
generated evidence was scanned as maintained source. ESLint now excludes only
`.factory/evidence-*` output folders; maintained `.factory/*.mjs` verifiers
remain checked.

## Browser, accessibility, privacy, and PWA checks

Local and live browser matrices covered `/`, `/app`, `/demo`, `/privacy`,
`/terms`, `/404`, and an unknown route at desktop and 390 × 844. Results:

- 14 route checks per target, zero serious/critical Axe findings, zero app
  console errors, correct route titles, one h1 and one main, and no overflow;
- all 63 visible mobile controls at least 44 × 44 CSS px;
- skip-link focus, dialog containment/return, route focus, and calendar
  Arrow/Enter controls passed;
- reduced motion used 0.01 ms transitions and automatic scrolling;
- 200% reflow retained the main and export actions without overflow;
- demo completion/export made no external request;
- offline demo reload retained four chores and showed its offline status;
- both demo exits hydrated and preserved existing real records;
- an isolated worker update showed **Update now**, activated cache
  `done-here-v11-update-check`, and retained the demo.

The supplied URL verifier passed local and live `/demo`: correct title and
language, one h1 and main, complete image alternatives, labelled buttons, and
no console errors. Live first-read evidence records, before scrolling:

- Job: **See when each chore was done**.
- Audience: households that need a clear record of recurring work.
- First action: **Try it with sample data**.

Fresh live sample checks passed on 1440 × 900 desktop and 390 × 844 phone.
They record the filled August calendar, persistent sample label, cross-month
mutation, reset result, unchanged real storage, zero external requests, and
zero browser errors.

Live Lighthouse wrote a complete report before Chromium emitted its known
post-report tab-crash teardown warning: Performance 100, Accessibility 100,
Best Practices 100, SEO 100, FCP 0.92 s, LCP 1.20 s, TBT 5 ms, CLS 0, and
81,271 transferred bytes. The report is valid and independent browser checks
completed without crashes.

Evidence: [`sample-calendar.json`](evidence-repair-9-live/sample-calendar.json),
[`browser-matrix.json`](evidence-repair-9-live/browser-matrix.json),
[`demo-exit.json`](evidence-repair-9-live/demo-exit.json),
[`response-identity.json`](evidence-repair-9-live/response-identity.json),
[`verify.json`](evidence-repair-9-live/verify-url/verify.json), and
[`lighthouse.json`](evidence-repair-9-live/lighthouse.json).

## Deployment, links, and paid offer

The existing static product resource was reused. The deployed HTML, worker,
manifest, 404 page, mobile hero, and app icon byte-match `dist/`. Known routes,
robots, and sitemap return 200; the deliberately missing route returns the
designed HTTP 404. Security and cache headers remain present.

The advertised $12 one-time Household Pack remains registered. Its Sociobot
checkout returns 303 to the Dodo-hosted checkout, and the tested license path
remains `/api/v1/products/chore-proof-calendar/verify`. No billing metadata file
was needed because this is an active existing offer. The free core remains
available without a license.

`.factory/catalog-description.txt` is a 75-character verb-first description
and its exact contents were copied to `/work/.evidence/catalog-description.txt`.

## Earlier finding disposition

Every earlier review, polish, verification report, and the failed handoff was
read before repair. Current source, the clean suite, and fresh live checks show:

| Earlier finding | Current disposition |
| --- | --- |
| R4-1 empty one-click/reset calendar and untested promise | Fixed by shared sample date selection and the new outcome-based claim; live phone and desktop evidence show all seven completions after entry and reset. |
| F-1-1 incomplete 404 | Fixed; the designed HTTP 404 has shared navigation, metadata, legal links, and a return action. |
| F-1-2–F-1-6 mood labels and untested art copy | Fixed; section names are plain and provenance remains only in design documentation. |
| F-1-7–F-1-13 README jargon | Fixed; current copy names user outcomes in plain words. |
| F-2-1–F-2-3 inaccurate overdue, consent, and license wording | Fixed; current copy matches live behavior and names its actions. |
| V1 clean claim setup and immutable caching | Fixed; all 24 commands pass from a new clone and static assets retain immutable caching. |
| V1/V2/V4 incomplete claim coverage | Fixed; the remaining filled-calendar promise now has a unique browser claim. |
| V2 due labels, malformed restore, checkout, PDF/Unicode, 404, target sizes, invalid photos, and factory link | Fixed; the full suite and fresh route/link checks pass. |
| V3/V4 calendar and footer target sizes | Fixed; all 63 visible mobile controls pass both dimensions. |
| V4 demo license leakage | Fixed; demo storage/privacy claims and fresh request checks pass. |
| V5 privacy/license claims and 4 px action gaps | Fixed; tagged claims pass and measured gaps remain 8 px. |
| V6 demo-exit data loss and hidden selected history | Fixed; both exit paths show real history before a save and preserve old plus new records after reload. |

This is a static local-first PWA with no product-owned backend, account,
tenant, server database, or process restart path. Backend and consumer-package
checks do not apply. No release-blocking or minor product gap remains.
