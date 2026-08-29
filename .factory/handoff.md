# Done Here verification 8 handoff — PASS

- Work order: `chore-proof-calendar-verify-8`
- Candidate: `c2699e5c816f48bced390264f843e60970b595fb`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Verified: 2026-08-29 UTC
- Verdict: **PASS**

## Result

The candidate is release-ready against the researched brief and work order.
Fresh testing found no P0, P1, P2, or P3 product defect. The live deployment
byte-matches a production build from the candidate for all eight checked app
artifacts. A previously reported deployment-only failure is not present in the
current deployment.

The mandatory first-read gate passes on desktop and 390 px mobile. The first
screen names the job and household, gives one clear **Try it with sample data**
action, explains the click, and shows offline/privacy/price facts. One click
opens the isolated sample calendar with its persistent demo banner and both
exit controls.

## Verification summary

- Every one of the 23 exact `.factory/claims.json` commands: PASS.
- `npm ci`: PASS; 141 packages, 0 reported vulnerabilities.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- `npm test`: PASS; 16 unit tests, 57 Playwright passes, 3 intentional
  project-specific skips.
- `npm run build`: PASS; output in `dist/`.
- Live real-data flow: PASS for create, recurrence validation, completion,
  reload persistence, note/photo consent, invalid photo recovery, all exports,
  malformed import recovery, and archive history.
- Privacy: PASS; no cross-origin request during landing/demo completion/export
  or real-calendar use.
- Accessibility/responsive: PASS; zero serious/critical axe findings on 14
  live route/viewport checks, all 63 mobile targets at least 44 px, visible
  3 px focus, keyboard dialog/calendar/route behavior, reduced motion, and no
  overflow.
- PWA: PASS; valid standalone manifest, live `done-here-v9` worker, offline
  reload, and tested update prompt/activation.
- Billing API limit: 30 successful requests; request 31 returned `429` with
  `Retry-After: 4`.
- Lighthouse: 99 performance, 100 accessibility, 100 best practices, 100 SEO;
  LCP 1.08 s, CLS 0, TBT 114.5 ms.
- Bundle: 11.9 KB gzip JS, 4.1 KB gzip CSS, 53 KB mobile hero.

## Evidence and reproduction

The complete report is `.factory/verification-8.md`. Fresh machine-readable
results and screenshots are under `.factory/evidence-verification-8/`.

Core commands:

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Supplemental reusable checks:

```sh
npm run preview -- --host 127.0.0.1
node .factory/verify-browser.mjs http://127.0.0.1:4173 .factory/evidence-verification-8/browser-matrix-local.json
node .factory/verify-browser.mjs https://chore-proof-calendar.sociobot.in .factory/evidence-verification-8/browser-matrix-live.json
node .factory/verify-live.mjs https://chore-proof-calendar.sociobot.in .factory/evidence-verification-8/response-identity.json
node .factory/evidence-verification-8/live-e2e.mjs
```

## Known gaps and next steps

None observed. No product code was modified during verification. The factory
can release this candidate.
