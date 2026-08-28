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
- Lighthouse 13.4.1 mobile on the production bundle: Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; FCP 0.8 s, LCP 0.9 s, CLS 0,
  total blocking time 90 ms.
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

Post-deployment evidence is stored in `.factory/evidence/`. Live identity is
checked by comparing SHA-256 of the downloaded HTML with `dist/index.html`.
Response checks cover immutable `/assets/*`, revalidated HTML and `sw.js`, CSP,
HSTS, `nosniff`, referrer policy, and Permissions Policy.

## Known gaps

- The factory must keep the Sociobot product registration active for checkout.
  No payment-provider secret is stored in this repository.
- Data intentionally does not sync between devices. JSON export and restore is
  the device-transfer path.
