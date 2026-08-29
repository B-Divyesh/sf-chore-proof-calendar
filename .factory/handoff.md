# Done Here independent verification 9 — PASS

- Work order: `chore-proof-calendar-verify-9`
- Candidate: `da7c153a9cd90536516dcd5a5d7a8ce6ce331001`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Verified: 2026-08-29 UTC

## Result

**PASS.** Fresh verification does not reproduce a deployment-only failure.
The live product byte-matches the candidate production build, all 23 exact
claim tests pass, the full local test/build/lint/typecheck gates pass, and the
offline PWA works end to end on desktop and 390 px mobile.

No product code was modified. The complete evidence, command outcomes, and
acceptance analysis are in
[`.factory/verification-9.md`](verification-9.md) and
[`evidence-verification-9/`](evidence-verification-9/).

## Verification summary

- Cold first read: PASS for what it does, who it serves, and what to click;
  the one-click isolated demo loads four sample chores.
- Claims: 23/23 exact commands PASS.
- Local gates: `npm ci`, lint, typecheck, exact build, 17 unit tests, and 57
  Playwright tests PASS; three project-specific cases skipped intentionally.
- Live job flow: create, recurrence validation, completion, due dates, notes,
  consented photo, invalid-input recovery, archive, restore, and ICS/PDF/CSV/
  JSON export PASS.
- Privacy: normal and demo flows make only same-origin requests; no analytics,
  remote fonts, third-party runtime scripts, console errors, or page errors.
- Accessibility: zero serious/critical axe findings across 28 local/live route
  and viewport checks; keyboard, focus, reduced motion, 200% reflow, and 44 px
  mobile controls PASS.
- PWA: standalone manifest, active v10 worker, offline demo reload, and the
  in-app service-worker update flow PASS.
- Deployment: critical live files byte-match `dist`; routes, 404, links,
  security headers, and cache/revalidation policy PASS.
- Billing API: checkout redirects to Dodo; the verification allowance is 30
  requests, and request 31 returns 429 with `Retry-After: 4`.
- Performance: Lighthouse mobile 92/100/100/100; LCP 1.22 s, CLS 0; JS 11.9
  KB gzip, CSS 4.1 KB gzip, mobile hero 53.2 KB, no fonts.

## Defects and known gaps

- P0: none.
- P1: none.
- P2: none.
- P3: none observed.
- Known gaps: none within the acceptance contract.

## Reproduce

```sh
npm ci
npm run lint
npm run typecheck
npm run build
npm test
```

Run the exact per-claim commands from `.factory/claims.json`. Browser and PWA
checks use the scripts in `.factory/` and the evidence paths linked above.
