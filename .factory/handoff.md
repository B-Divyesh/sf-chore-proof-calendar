# Done Here review 4 handoff — FAIL

- Work order: `chore-proof-calendar-review-4`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Implementation candidate: `385de6d2e8c9316557e1a08c42bccbc86b07ed09`
- Documentation base reviewed: `819a62cf11e7ef0ed2f045c39dd0b60e12ea471f`
- Report: [`review-4.md`](review-4.md)

## Result

**FAIL — one high-severity finding and one untested public claim.**

The primary **Try it with sample data** action now opens a September calendar
with zero completion marks because all seven sample completions are in August.
The cards and records are present, but the page promises a filled calendar in
one click. After a September completion, **Reset demo** restores the seven
sample records but also leaves the calendar on empty September until reload.

The promise is not listed in `.factory/claims.json`. The current demo test
clicks the primary action but does not check calendar marks or the reset view.

No product code was modified. Review evidence and reports are the only
repository changes.

## Verification completed

- Installed the documented Node dependencies with `npm ci` in a clean clone.
- Ran all 23 declared claim commands independently and exactly; all passed.
- Ran lint, typecheck, build, full tests, and production bundle checks.
- Opened fresh live phone and desktop contexts and recorded the job, audience,
  first action, and first-screen result before scrolling.
- Exercised real and sample calendars, reset, reload, both demo exits, local
  persistence, recurrence boundaries, proof consent, invalid files, malformed
  imports, archive, and every export.
- Checked mobile and desktop accessibility, keyboard focus, reduced motion,
  200% reflow, touch sizes and spacing, route titles, legal pages, links,
  deliberate 404 behavior, privacy requests, offline reload, and worker update.
- Confirmed 30 billing verification requests are allowed and request 31 returns
  429 with `Retry-After: 4`.
- Confirmed live output byte-matches the implementation candidate.

Repository gates:

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm test`: PASS — 17 unit and 57 browser tests; three intentional skips
- `npm run build`: PASS — `dist/index.html` produced
- Mobile Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.21 s and CLS 0

## Repair needed

On every transition into demo mode and on **Reset demo**, set the selected date
and calendar month from the latest bundled sample completion. Add one tagged
claim that starts on `/`, clicks **Try it with sample data**, verifies all seven
calendar marks, records a completion in another month, resets, and verifies the
original seven marks are visible again.

## Reproduce

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Run every exact command in `.factory/claims.json`. For the finding, use a fresh
browser on 2026-09-06 or later, click the primary sample action, scroll to the
calendar, and compare it with a fresh direct `/demo` load.
