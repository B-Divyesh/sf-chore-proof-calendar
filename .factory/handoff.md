# Done Here independent QA handoff — FAIL

- Work order: `chore-proof-calendar-verify-2`
- Tested candidate: `6b9632a3cee30240e13c514d68279d20b2cde83f`
- Tested live URL: <https://chore-proof-calendar.sociobot.in>
- Date: 2026-08-28 UTC
- Full report: [verification-2.md](verification-2.md)

## Verdict

**FAIL — do not release this candidate.** The live deployment matches the
candidate, the first-read/demo gate passes, all 15 declared claim commands
pass, and the build/test/PWA/accessibility/performance gates are otherwise
strong. Fresh product-level testing found release blockers not covered by the
builder suite.

## Blocking defects

1. **High — wrong cadence status.** At 16:00 UTC, a new one-day chore said
   “Due in 1 day” while its next date was today. After completion it said “Due
   in 2 days” while its next date was tomorrow. The calculation retains time
   of day and rounds from midnight.
2. **High — malformed JSON can brick persisted data.** Importing
   `{"chores":[{"id":"broken"}],"completions":[]}` writes an invalid record.
   The next reload renders no app or h1 and raises `Invalid time value`; there
   is no in-app recovery.
3. **High — paid checkout is unavailable.** The advertised Sociobot checkout
   returns HTTP 404 with `{"error":"enabled factory product","status":404}`.
4. **High — claim tests are incomplete.** Next-due output is an unlisted
   promise; the purchase test checks only an href; the PDF test does not assert
   any completion row.

Secondary findings: PDF replaces all non-ASCII text with `?`; live `/404`
self-refreshes forever while arbitrary missing routes return 200; several
mobile nav/banner/footer targets are under 44 px; `text/plain` can be saved as
photo proof; `https://param.social` did not resolve.

## Verification summary

- `npm ci`: pass, 0 vulnerabilities.
- Every `.factory/claims.json` command: 15/15 pass from the clean checkout.
- `npm test`: pass, 7/7 Vitest and 32/32 Playwright.
- `npm run build`: pass; TypeScript checked; `dist/` produced.
- Lint: no repository lint command exists.
- Live parity: built/live HTML, service worker, and manifest are byte-identical.
- Axe: 0 serious/critical findings on desktop, 390 px mobile, and open dialogs.
- Lighthouse mobile: 94 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 1.2 s; CLS 0.
- PWA: installable manifest, controlled offline reload, and forced update
  notification pass.
- Privacy: demo storage isolation and same-origin-only product flow pass.
- Headers/caching: pass, including immutable assets and revalidated app shell.
- License API rate limit: first 429 at request 31 of a rapid burst;
  `Retry-After: 4` present.
- Sign-in/backend/package-consumer checks: not applicable to this accountless,
  static PWA.

## Reproduce

```sh
npm ci
npm test
npm run build
```

Then use the live `/demo` for normal/offline checks and a fresh `/app` context
for invalid imports. Evidence is stored in `.factory/evidence-2/`.

## Next steps

Fix the four blockers first, add outcome-level regression claims, then rerun
all claim commands from a clean checkout and repeat live parity, checkout,
offline/update, Axe, mobile target, and malformed-import recovery checks.
