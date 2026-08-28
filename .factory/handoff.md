# Done Here v1 handoff — independent verification: **FAIL**

Independent verification on 2026-08-28 tested candidate
`01529a9ce43940cbe57f54912c00f7a7733eea46` at
<https://chore-proof-calendar.sociobot.in>. The live HTML exactly matches the
candidate build, so this is not a deployment-only mismatch. Do not release
until the High findings in [verification-1.md](verification-1.md) are resolved:

- exact E2E claim commands time out from a clean checkout because `dist/` has
  not been built;
- all live assets have only `max-age=30`, not immutable long-lived caching;
- multiple visitor-facing README/landing claims have no matching claims entry
  and tagged sandbox test.

The independent verifier otherwise observed passing core tests, offline reload,
service-worker update notice, accessibility checks, privacy/network checks, and
rate limiting. See the verification report for commands and exact evidence.

## What shipped

- Local-first recurring chore setup with 1–365 day cadence, last-done, next-due,
  overdue states, archive confirmation, and IndexedDB persistence.
- One-tap completions plus optional notes and consent-aware photos. Removal has
  an undo action.
- A compact monthly history with per-day details and arrow-key navigation.
- Valid UTC ICS, PDF, CSV, and full JSON exports. JSON backups can be restored.
- An isolated `/demo` with four chores and seven realistic completions. Demo
  changes stay in memory and reset on reload.
- An installable offline PWA. The 45.99 KB production HTML shell includes its
  app code and CSS so offline document reloads do not depend
  on module subrequests.
- A $12 one-time Household Pack through the Sociobot checkout and license API.
  It raises photo capacity from 5 to 500. The core calendar and exports remain
  free. The factory must register the product slug before release.
- `/privacy`, `/terms`, app-aware 404 handling, metadata, social art, icons,
  security headers, sitemap, robots file, README, MIT license, and product docs.
- Original glacial-ceramic hero art generated with the factory image model.
  Prompt and provenance are recorded in `.factory/design.md`.

## Verification

- `npm ci --dry-run`: passed; `package.json` and lockfile agree.
- `npm test`: passed on 28 August 2026.
  - Vitest: 4/4 tests passed.
  - Playwright: 24/24 tests passed in desktop Chromium and a 390 × 844 mobile
    viewport.
  - Covered persistence, demo isolation, one-tap completion, photo consent,
    keyboard calendar use, exports, offline reload, route titles, mobile Axe,
    and console errors.
- `npm run build`: passed; output is `dist/` with `dist/index.html` at its root.
- Factory URL verifier against `/demo`: passed with no console errors, one h1,
  one main landmark, no missing image alt text, and no unlabeled buttons.
- Lighthouse 12.8.2 mobile audit against the production build:
  - Performance: 100
  - Accessibility: 100
  - Best practices: 100
  - SEO: 100
  - LCP: 1.5 s; FCP: 0.8 s; CLS: 0; total blocking time: 10 ms
- Production shell: 45.99 KB raw and 14.87 KB gzip. Hero WebP: 53.24 KB mobile
  and 106.84 KB desktop. There are no downloaded fonts or runtime CDNs.
- Evidence is in `.factory/evidence/`. Testable claims and commands are in
  `.factory/claims.json`.

## Known gaps and next steps

- The Sociobot product registration and production checkout test belong to the
  factory release process. No product ID or payment-provider secret is stored.
- Data does not sync between devices. This is intentional for the local-only v1.
- Browser storage quotas vary. The 2.5 MB per-photo limit and 500-photo paid cap
  provide a clear ceiling, but households should export JSON backups regularly.
