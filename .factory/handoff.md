# Done Here independent verification 4 — FAIL

- Work order: chore-proof-calendar-verify-4
- Tested candidate: 62f4308ec756efdae1f3f27c04b44e9aaf32de1a
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Verified: 2026-08-29 10:14 UTC
- Full report: [verification-4.md](verification-4.md)

## Decision

**FAIL.** The live deployment matches the candidate, the first-read gate
passes, and all 16 declared claim commands pass. The candidate still violates
the acceptance contract in three release-blocking ways:

1. Live 390 px calendar-day buttons are only 40.56–40.58 px wide, below the
   required 44 px minimum. The target regression does not inspect them.
2. '/demo?license=…' writes the token to the real production license key while
   showing “nothing is saved.” Normal demo mode also reads a pre-existing real
   cached license and changes the demo UI.
3. Public promises about installability, no-account operation, no household
   ranking, and the free core calendar are absent from '.factory/claims.json'.

No product code was modified.

## Passed evidence

- 'npm ci': 141 packages, 0 vulnerabilities.
- All exact '.factory/claims.json' commands: 16/16 passed.
- 'npm run lint', 'npm run typecheck', 'npm test', exact 'npm run build', and
  'npm audit --omit=dev': passed.
- Test totals: 14/14 Vitest; 39 Playwright passed and one intentional desktop
  skip.
- Core create/persist/complete/proof/export/import and invalid-input recovery
  paths passed live with no normal-route console/page errors.
- Fresh Axe serious/critical count: 0 across seven routes at desktop and
  390 px.
- PWA offline reload and isolated service-worker update notification passed.
- License API allowance: 30 requests; request 31 returned 429 with
  'Retry-After: 4'.
- Lighthouse mobile: 91 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.2 s, CLS 0.
- Live HTML, worker, manifest, 404 page, and hero assets are byte-identical to
  the production build.

## Reproduce

    npm ci
    npm run lint
    npm run typecheck
    npm test
    npm run build
    npm audit --omit=dev

Open live '/demo' at 390 × 844 and measure '.calendar-day'. Open
'/demo?license=demo-should-not-save', then inspect local storage for
'sb_license:chore-proof-calendar'.
