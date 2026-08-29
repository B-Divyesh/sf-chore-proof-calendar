# Done Here verification handoff — FAIL

- Work order: `chore-proof-calendar-verify-6`
- Tested candidate: `9a544d31d3455033b4f180d193aa648e832a7ca5`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Verified: 2026-08-29 13:02 UTC
- Full report: [verification-6.md](verification-6.md)

## Result

**FAIL. Do not release this candidate.** The deployed files match the
candidate and the normal workflow works, but the mandatory demo exit can
permanently erase a returning user's local calendar.

## Release blocker

**Critical — Start for real can overwrite existing IndexedDB data.**

Fresh live reproduction:

1. Create a real chore at `/app` and reload to prove persistence.
2. Load `/demo` directly and click **Start for real**.
3. `/app` incorrectly shows **0 active** and **No chores yet**.
4. Add a chore from that false empty state and reload.
5. Only the new chore remains; the previously stored chore has been erased.

Evidence:

- `.factory/evidence-verification-6/defect-start-for-real-empty.png`
- `.factory/evidence-verification-6/defect-existing-data-overwritten.png`

Root cause: `data` starts empty. A demo-to-real SPA route calls only
`initLicense()` before rendering (`src/main.ts:308-318`), while `loadData()` is
only called during non-demo boot (`src/main.ts:332-341`). The next mutation
calls `saveData()`, which clears the IndexedDB object store before writing the
empty in-memory calendar plus the new record (`src/storage.ts:73-79`).

Required repair: hydrate real data before rendering or enabling mutations on
every demo-to-real transition, guard against writes before hydration, and add
a regression that seeds real IndexedDB data and proves **Start for real** plus
a subsequent save preserves it.

## Verification summary

- All 23 exact `.factory/claims.json` commands passed.
- `npm ci`, lint, typecheck, exact production build, and production audit
  passed.
- `npm test`: 15 unit tests passed; 54 browser tests passed; 2 intentional
  desktop skips.
- The first-read screen and one-click sample-data entry passed.
- Normal, boundary, invalid-input, recovery, export, photo-limit, and
  persistence tests otherwise passed live.
- Axe found 0 serious/critical issues across seven routes at desktop and
  390 px mobile. Keyboard, focus, reduced motion, and visible target checks
  passed.
- Full real-data request logging showed only same-origin traffic and no
  console, page, or request errors.
- License verification sent only the token to Sociobot. The observed allowance
  was 30 requests; request 31 returned 429 with `Retry-After: 4`.
- Live offline reload and an isolated service-worker update passed.
- Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 1.3 s, TBT 90 ms, CLS 0.
- JS 32,554 B raw / 11,616 B gzip; CSS 15,033 B raw / 4,081 B gzip; mobile
  hero 53,244 B. All supplied budgets pass.
- Live `index.html`, worker, manifest, 404, hero files, and icons are
  byte-identical to the candidate build.
- No product source was modified by verification.

## Re-run

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

After repair, repeat the complete independent verification, with the new
demo-to-real IndexedDB regression treated as mandatory.
