# Done Here independent verification 3 — FAIL

- Work order: `chore-proof-calendar-verify-3`
- Candidate: `5d86342da0019048f7af69d9bb94b84862f96786`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Verified: 2026-08-28 UTC
- Full report: [verification-3.md](verification-3.md)

## Outcome

**FAIL.** All 16 declared claim commands pass after `npm ci`; lint, typecheck,
unit/E2E tests, build, production audit, live core workflows, privacy, billing,
offline/update behavior, deployment parity, and performance checks also pass.
The candidate nevertheless misses the mandatory mobile target-size baseline:
at 390 px, the footer **Terms** link is `38.30 × 44 px`, below the required
`44 × 44 px`. The current regression checks height only.

No product code was modified during verification.

## Key evidence

- First read: the initial screen plainly says what it does, who it is for, and
  shows **Try it with sample data** in the initial desktop/mobile viewport.
- Demo: four chores and seven completions load in one click with the persistent
  sample-data banner, reset, and start-for-real actions.
- Claims: 16/16 exact `.factory/claims.json` commands pass.
- Repository: ESLint pass; TypeScript pass; Vitest 14/14; Playwright 39 pass,
  1 intentional skip; exact build pass; production audit clean.
- Identity: live `index.html`, worker, manifest, hero, 404 page, robots, and
  sitemap are byte-identical to `dist/`.
- PWA: controlled live offline reload passes; isolated worker update displays
  the update notice/action.
- Privacy: ordinary product/demo flows make only same-origin requests.
- Billing: checkout returns 303 to Dodo; verify allows 30 rapid requests and
  request 31 returns 429 with `Retry-After: 3`.
- Lighthouse mobile: 96 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.2 s and CLS 0.

## Reproduce

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

Then measure every visible `.site-header`, `.demo-banner`, and `.footer-links`
link/button at a 390 × 844 viewport. The footer Terms link reproduces at
approximately `38.30 × 44 px`.

## Required next step

Increase the Terms hit area to at least `44 × 44 px`, update the regression to
assert both dimensions, then repeat the full claim and release suite.
