# Independent verification 7 — PASS

- Candidate commit: `f70dbb5` (`fix: show hydrated history after demo exit`)
- Live URL: https://chore-proof-calendar.sociobot.in
- Verified: 2026-08-29 UTC
- Verifier checkout: `ce847db8a7d209e019a572b06cd2c74faa6cb0e8`; its only
  difference from `f70dbb5` is factory evidence and handoff documentation.
  Product source is identical.

## Verdict

**PASS.** The live application is the candidate product: a fresh production
build byte-matched its deployed `index.html`, manifest, worker, icons,
illustrations, robots, sitemap, favicon, and 404 artifact. The candidate
repair's demo-to-real state transition is also exercised by the complete local
Playwright suite, including the 390 px regression test.

## First-read and demo

Cold-opening `/` at 1440 px returned 200 with no console/page errors. The
first screen says **“See when each chore was done”**, says it is **“For
households that need a clear history”**, and makes **“Try it with sample data”**
the primary action, with “See a filled calendar in one click.” The action links
directly to `/demo`. The demo has the persistent “Demo — sample data, nothing
is saved” banner plus Reset demo and Start for real. This passes the plain-
words and one-click sandbox acceptance checks.

## Claims (release gate)

`npm ci` completed from the clean checkout (141 packages, 0 reported audit
vulnerabilities). I then executed every one of the 23 exact `test` commands in
`.factory/claims.json`, individually, using the declared demo entry point where
applicable. All passed; Playwright's final result file was
`{"status":"passed","failedTests":[]}`.

The claims covered demo storage isolation, one-tap completion, offline reload,
PWA metadata, local-only requests, runtime privacy, license-token minimization
and revocation, ICS/PDF/CSV/JSON exports, JSON restore, recurrence bounds, due
status, note/photo consent, free core, calendar keyboard operation, pricing,
and mobile axe. There is a declared test for every listed claim.

## Local build and regression coverage

- `npm run lint` — pass.
- `npm run typecheck` — pass.
- `npm test` — pass: 15 Vitest tests and 60 Playwright tests (including normal
  persistence, demo exit/hydration, malformed-backup recovery, invalid photo
  recovery, export/import, desktop and mobile checks).
- `npm run build` — pass; generated `dist/` with `index.html` 50,275 B
  (16,240 B gzip), well below the 200 KB initial-JS budget (the app is inline
  and has no downloaded JS bundle).

The freshly built output and live files had identical bytes for all deployed
application artifacts. `staticwebapp.config.json` is intentionally not a
public static file (the host returns the 404 artifact at that path), so it was
not treated as a content mismatch.

## Independent live behavior

On `/demo`, a completion records in one tap; export produced 4 chores and 8
completion records after the new mark. A recurrence of 0 is rejected by native
range validation and 1 is accepted. On `/app`, a malformed JSON backup showed
“Backup was not imported. This backup has an invalid chore or completion. Your
current calendar was not changed,” and preserved the existing chore.

The request log for a complete live demo mark and JSON export contained only
the product origin; cold `/` needed only the document and self-hosted hero
image. There are no remote fonts, analytics, or third-party runtime scripts.
The optional license verification correctly targets `api.sociobot.in`; a
single-client invalid-token probe received 29 successful responses followed by
request 30 returning `429` with `Retry-After: 1`. The observed allowance is
therefore 30 requests in the active rate-limit window.

Response headers include a restrictive CSP (`default-src 'self'`, explicit
Sociobot `connect-src`, `frame-ancestors 'none'`), HSTS, `nosniff`, and strict
origin referrer policy. HTML uses 30-second revalidation, the service worker is
`no-store`, and static images/icons are immutable for one year.

## PWA, accessibility, responsive, and performance

- The live manifest is standalone with `/app?v=8`; the controlled service
  worker has scope `/`, active cache `done-here-v8`, calls `skipWaiting` and
  `clients.claim`, and `registration.update()` completes successfully.
- After first visit, setting the browser offline and reloading `/demo` retained
  the app heading and showed “Offline. Your calendar still works here.”
- Axe WCAG 2 A/AA scans of `/`, `/app`, `/demo`, `/privacy`, `/terms`, `/404`,
  and an unknown 404 route at both 1440 px and 390 px found **zero
  serious/critical violations**. Every route has `lang=en`, one h1, and main;
  no horizontal overflow occurred. The expected HTTP-404 network console line
  on 404 routes was the only console entry; there were no application errors.
- Keyboard-only checks confirmed a visible 3 px `rgb(11, 101, 117)` focus ring,
  the skip link moves focus to h1, Add a chore opens a dialog, Escape restores
  focus, and ArrowRight moves the selected calendar day. Reduced-motion
  emulation changes transition duration to 0.01 ms.
- Independent mobile Lighthouse: performance **99**, accessibility **100**,
  LCP **1.20 s**, CLS **0**, total transfer **81,262 B**.

## Defects by severity

- P0/P1/P2: none.
- P3: none observed.

No account or sign-in flow is present, so Entra tenant validation is not
applicable. The product has no product-owned backend or persistence boundary;
the documented Sociobot license endpoint was the only server-side endpoint and
its rate limit was verified above.
