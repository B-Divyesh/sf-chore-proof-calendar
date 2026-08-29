# Done Here independent verification handoff — FAIL

- Work order: `chore-proof-calendar-verify-5`
- Candidate: `89ed3d8050090ff0849e7374d073d686a0ee2d6d`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Verified: 2026-08-29 11:52 UTC
- Full evidence: `.factory/verification-5.md`

## Result

**FAIL.** The deployed product exactly matches the candidate, all 20 declared
claim commands pass, and the core chore calendar works end to end. Release is
blocked by two acceptance-contract defects:

1. **High — unlisted public claims.** The README/form promise that verification
   sends only the license token, the README promise of no analytics/remote
   fonts/third-party runtime scripts, and the Terms refund/revocation promise
   have no entries and uniquely tagged observable tests in
   `.factory/claims.json`.
2. **Medium — mobile action spacing.** At 390 px, **Add note or photo** and
   **Archive** are 4 px apart in every chore card. The supplied interaction
   baseline requires at least 8 px between adjacent targets.

No product code was modified during verification.

## What passed

- First-read gate: the first screen plainly states the job, audience, and
  **Try it with sample data** first action. `/demo` is one click away, filled,
  isolated, resettable, and clearly labeled.
- Claims: all 20 exact `.factory/claims.json` commands passed after `npm ci`.
- Repository: lint, TypeScript, `npm test`, exact production build, and
  production dependency audit passed. Vitest passed 15/15; Playwright passed
  47 tests with one intentional desktop skip.
- Live core flow: empty state; required/0/366 rejection; 1/365 acceptance;
  persistence; completion/remove/undo; consent and invalid/oversized photo
  recovery; valid note/photo; ICS/PDF/CSV/JSON; malformed-import preservation;
  archive cancel/confirm; free 5/6 and paid 500/501 photo boundaries.
- Privacy: the full ordinary flow made only same-origin requests and no browser
  errors. Demo did not read/write/verify preseeded real license state.
- Accessibility: zero serious/critical Axe findings across all routes at
  desktop and 390 px; correct structure; visible skip/focus; dialog focus
  return; keyboard calendar/navigation; reduced motion; no overflow; all
  controls individually at least 44 × 44 px.
- PWA: valid manifest/worker, live offline reload, and isolated update-notice
  plus **Update now** flow passed.
- Billing: checkout returned 303 to Dodo. License verification allowed 30 rapid
  requests; request 31 returned 429 with `Retry-After: 3`.
- Performance: 11.5 KB gzip JS, 4.1 KB gzip CSS, 53 KB mobile hero, zero font
  bytes. Fresh live Lighthouse scored 98 performance and 100 for accessibility,
  best practices, and SEO; LCP 1.4 s, TBT 150 ms, CLS 0.
- Deployment identity: live HTML, worker, manifest, 404 page, and both hero
  images are byte-identical to `dist/` from the candidate.

## Required next steps

1. Register and uniquely test every retained privacy/license promise identified
   in `.factory/verification-5.md`, including the real verification payload and
   revoked-license behavior, or remove/reword the promises.
2. Increase the mobile gap between the secondary chore actions to at least
   8 px and add a target-separation regression.
3. Rerun all 20 claim commands, `npm test`, the exact build, the live route/Axe
   sweep, and the two counterexamples before requesting release review again.

## Reproduce the standard gates

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

Open `https://chore-proof-calendar.sociobot.in/demo` for the isolated sample
calendar. See `.factory/verification-5.md` for hashes, measurements, and exact
live behavior.
