# Independent verification 1 — FAIL

- Candidate: `01529a9ce43940cbe57f54912c00f7a7733eea46`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Verified: 2026-08-28
- Scope: clean-checkout claims, production build and tests, live product/PWA,
  desktop and 390 px mobile, privacy/network, accessibility, response policy,
  performance, and purchase-verification rate limiting.

## Release decision

**FAIL.** The deployed site is exactly the candidate build, and the core
experience works, but the candidate does not meet the claims-test and caching
acceptance requirements.

## First-read result — pass

Fresh desktop and 390 px browser contexts showed: “See when each chore was
done”; “For households that need a clear history, not another overdue badge”;
and the visible “Try it with sample data” action with “See a filled calendar in
one click.” It plainly identifies what it does, who it is for, and what to
click first. `/demo` immediately shows four realistic chores and its persistent
“Demo — sample data, nothing is saved” banner, Reset demo, and Start for real.

## Blockers

### High — declared E2E claim commands cannot run from a clean clone

After `npm ci`, and before any build output existed, the exact declared command
for `@claim:demo-sandbox` waited for the configured preview URL and failed:

```text
npm run test:e2e -- --grep @claim:demo-sandbox --project=chromium
Error: Timed out waiting 60000ms from config.webServer.
```

`playwright.config.ts` starts `npm run preview`, but that command requires
`dist/`, which a clean checkout does not contain. The other E2E claim commands
have the same prerequisite. The claims contract explicitly makes a failing
claim test release-blocking. Building first makes all claim tests pass, but it
does not satisfy the stipulated clean-clone command.

### High — static assets lack immutable cache policy

The live deployment sends the following for `/`, `/demo`, `/sw.js`,
`/manifest.webmanifest`, and `/assets/hero-ceramics-960.webp`:

```text
cache-control: public, must-revalidate, max-age=30
```

This fails the PWA/static performance requirement for long-lived immutable
asset caching. The checked source configuration contains no asset cache override
and the live document is byte-for-byte the candidate `dist/index.html`, so this
is a candidate/deployment configuration failure, not a stale deployment.

### High — claim coverage is incomplete

The landing page and README make visitor-relevant promises absent from
`.factory/claims.json`, including JSON backup restore, named chores with a
1–365-day recurrence, optional notes/photos, and monthly keyboard calendar
navigation. The claims contract requires every relied-on claim to be listed and
tested from the demo sandbox. Existing general E2E coverage does not replace a
tagged claim entry for those promises.

## Passed evidence

| Area | Evidence |
| --- | --- |
| Candidate/live identity | SHA-256 of downloaded live HTML and `dist/index.html`: `ccb99bb8dc0e6d3be610ad4665c6dbacbc99ace5c5299093b8bfd8606fc891c9`; `cmp` returned 0. |
| Claims after required bundle prerequisite | All 11 declared commands passed: demo sandbox, one-tap completion, offline reload, local data, ICS/PDF/CSV/JSON exports, photo limits, paid copy/link, and mobile accessible baseline. |
| Repository quality | `npm ci` passed with 0 vulnerabilities; `npm test` passed (Vitest 4/4, Playwright 24/24); `npm run build` passed. No separate lint script exists; TypeScript checking is part of build. |
| Functional exercise | Automated full suite covered create/persist/reload, one-tap completion, photo consent rejection, date arrow keys, route titles, exports, offline reload, console errors, desktop/mobile. Manual live exercise confirmed HTML validation rejects empty, 0-day, and 366-day chores; a 2,500,001-byte photo produces the specific recovery message. |
| PWA | Fresh demo claim passed offline reload. Live worker controls `/demo`; isolated production-worker version change showed “A new version is ready. Update now”, then offline reload retained the app and offline notice. |
| Privacy/network | Cold live load requested only same-origin document and hero image; no analytics, CDN fonts, or third-party runtime requests. The demo local-data claim passed. CSP, HSTS, `nosniff`, strict-origin referrer policy, Permissions-Policy, and HTTPS were present. |
| Accessibility | Live Axe serious/critical findings: 0 on desktop and 390 px mobile. One h1/main, lang/title, image alt, visible 3 px focus outline, skip link, logical tab reachability, no console/page errors, and reduced-motion transition/scroll overrides were observed. |
| Performance | Production shell is 45.99 KB raw / 14.87 KB gzip; mobile hero is 53.24 KB. Lighthouse mobile generated Performance 99 and Accessibility 100 (FCP 1.0 s, LCP 1.2 s, CLS 0, TBT 140 ms). Lighthouse reported a final screenshot target crash after generating the result; it does not invalidate the manual/browser checks. |
| License API rate limit | After cooldown, sequential invalid-token requests returned 200 for requests 1–30 and `429` with `Retry-After: 4` on request 31. A prior 40-way concurrent burst yielded 30×200 and 10×429. No sign-in is used. |

## Required remediation

1. Make each E2E claim command self-contained from a clean checkout (for
   example, have the Playwright web server build before previewing, or use a
   suitable development server) and keep the exact claim commands passing.
2. Set immutable, long-lived cache headers for hashed/static assets while
   keeping HTML and `sw.js` revalidated for updates.
3. Add a uniquely tagged sandbox test for every remaining user-facing claim,
   or remove/reword unsupported promises. At minimum cover JSON restore,
   recurrence bounds, optional note/photo handling, and keyboard calendar
   navigation.

