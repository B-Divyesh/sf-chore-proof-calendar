# Done Here repair handoff

- Repair work order: `chore-proof-calendar-repair-1`
- Verifier report: `62a51b5a302c54d9f545865f80477e988d498340`
- Candidate repaired: `01529a9ce43940cbe57f54912c00f7a7733eea46`

## What was repaired

- Playwright now starts `npm run serve:test`, which type-checks and builds the
  production bundle before preview. Every declared claim command works without
  a pre-existing `dist/` directory.
- Static Web Apps now serves `/assets/*` with
  `public, max-age=31536000, immutable`. HTML, the manifest, and `sw.js` retain
  explicit revalidation policies so app updates are discovered.
- Four previously unregistered promises now have entries in
  `.factory/claims.json` and one exact tagged browser test each:
  - JSON backup restore;
  - named chore recurrence bounds, including rejection at 0 and 366 days;
  - optional note and consent-aware photo storage;
  - monthly calendar month changes, arrow movement, and day selection by
    keyboard.
- `tests/unit/release-config.test.ts` guards the self-building test server,
  response cache policy, required claim entries, and unique claim tags.

The researched brief, artifact class, visual system, product behavior, billing
path, and offline storage model are unchanged.

## Verification evidence

Run from `/work/repo` on 28 August 2026:

- `npm ci`: passed; 59 packages installed, 0 vulnerabilities.
- `npm test`: passed.
  - Vitest: 7/7 passed.
  - Playwright: 32/32 passed across desktop Chromium and the 390 × 844 mobile
    project.
- Every command in `.factory/claims.json` was executed verbatim: 15/15 passed.
- Fresh-clone regression: cloned the committed tree with no `dist/`, ran
  `npm ci`, then ran the formerly failing `@claim:demo-sandbox` command; it
  built its own bundle and passed in 6.2 seconds.
- `npm run build`: passed; `dist/index.html` exists at the static root.
- Type checking: passed as part of `npm run build`; no separate lint script is
  defined for this TypeScript/Vite product.
- Factory `verify-url.sh` on `/demo`: 200; title and `lang` present; one `h1`;
  one `main`; 0 missing image alternatives; 0 unnamed buttons; 0 console or
  page errors.
- Axe serious/critical scan: 0 findings on desktop and 390 px mobile, exercised
  by the full Playwright run.
- Keyboard: recurrence form, month control, arrow-key day movement, Enter day
  selection, dialogs, and the existing tab path passed browser coverage.
- Privacy: the demo completion/export flow made no cross-origin requests.
- Offline: a controlled `/demo` reloaded successfully with the browser network
  disabled. A forced service-worker version change displayed “A new version is
  ready. Update now”.
- Lighthouse 13.4.1 mobile on the live production URL: Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.0 s, CLS 0,
  total blocking time 20 ms.
- Production shell: 45.99 KB raw / 14.87 KB gzip, below the 200 KB JavaScript
  budget because the application code and CSS are inlined into the shell.

## How to run

```sh
npm ci
npm test
npm run build
```

Use `npm run test:e2e -- --grep @claim:<id> --project=chromium` for an
individual browser claim. It now creates the production bundle itself.

## Deployment and live checks

Static deployment uses `/opt/fleet/lib/deploy-static.sh chore-proof-calendar
dist`. The deployed URL is <https://chore-proof-calendar.sociobot.in>.

Deployment `59f2fbb6-0be7-43f1-b066-af00351573c3` succeeded. The custom domain
returned HTTPS 200. Post-deployment evidence is stored in `.factory/evidence/`.

- Live `/`, `/demo`, and the manifest return
  `public, max-age=0, must-revalidate`.
- Live `sw.js` returns `no-cache, no-store, must-revalidate`.
- Live `/assets/hero-ceramics-960.webp` returns
  `public, max-age=31536000, immutable`.
- CSP, HSTS, `nosniff`, strict-origin referrer policy, and Permissions Policy
  are present on the checked responses.
- Downloaded live HTML and `dist/index.html` are byte-identical. Both have
  SHA-256 `ccb99bb8dc0e6d3be610ad4665c6dbacbc99ace5c5299093b8bfd8606fc891c9`.
- A live desktop/390 px browser smoke passed Axe, keyboard month/day use,
  same-origin-only network checks, and offline reload.
- The license verifier returned 200 with an invalid verdict for a synthetic
  token and did not expose data.

## Known gaps

- The live Sociobot checkout endpoint currently returns 404 because this slug
  is not registered. Product registration is a factory billing action outside
  this repository repair; no payment-provider secret is stored here.
- Data intentionally does not sync between devices. JSON export and restore is
  the device-transfer path.
