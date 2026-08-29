# Done Here adversarial review 2 handoff — FAIL

- Work order: `chore-proof-calendar-review-2`
- Candidate: `0ae4f57351ccf978d54608716f8c99d08e1b4a51`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Reviewed: 2026-08-29 UTC
- Verdict: **FAIL — three minor copy findings remain**

## What was done

Completed a cold 390 px and desktop first read, exhaustive landing/README copy
audit, one-click demo mutation/reset/isolation check, clean-clone execution of
all 23 claim commands, prior-finding regression audit, route/metadata/link
crawl, direct 404 check, accessibility and mobile checks, offline/privacy
request logging, deployment identity comparison, and missed-leverage review.

No product code was modified. The complete review is
`.factory/review-2.md`.

## Verification

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
node .factory/verify-browser.mjs https://chore-proof-calendar.sociobot.in /tmp/review-2-browser.json
node .factory/verify-live.mjs https://chore-proof-calendar.sociobot.in /tmp/review-2-live.json
node .factory/verify-demo-exit.mjs https://chore-proof-calendar.sociobot.in /tmp/review-2-demo-exit.json
```

- All 23 exact `.factory/claims.json` commands passed separately from a clean
  clone.
- `npm test`: 16 unit passes; 57 Playwright passes; 3 intentional skips.
- Live route matrix: zero serious/critical Axe findings, console errors,
  undersized mobile controls, external demo requests, or offline failures.
- Live artifacts byte-match the candidate production build.

## Known gaps and next steps

Resolve F-2-1 through F-2-3 in `.factory/review-2.md`: remove the
overdue-badge copy contradiction, explain the photo consent check plainly, and
rename the license disclosure button for its actual result. Re-run the copy
audit and full claim suite after repair.
