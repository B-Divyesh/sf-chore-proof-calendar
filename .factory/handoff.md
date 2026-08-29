# Done Here repair handoff — PASS

- Work order: `chore-proof-calendar-repair-6`
- Independent report: `9181bf7e9aa1e73b155971064ab0772e4680a19b`
- Failed candidate: `89ed3d8050090ff0849e7374d073d686a0ee2d6d`
- Repair commit: `fd0e3aa3602ec786d8b4ed5b9b13181870377318`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Deployment: `8d59e476-3416-4844-9f68-c9a2a1067525`
- Verified: 2026-08-29 12:23 UTC

## Result

**PASS.** Both release-blocking findings in `.factory/verification-5.md` were
reproduced against the failed candidate and repaired at their root causes.
The researched brief, local-first storage, demo isolation, exports, paid tier,
visual thesis, and `pwa-offline` artifact class are unchanged.

## Repairs and exact regressions

1. **Public privacy and license promises are registered and tested.** Three
   entries were added to `.factory/claims.json`:
   `runtime-privacy`, `license-token-only`, and `refunded-license`.
   Each has one unique `@claim:<id>` browser test. The tests observe the full
   demo request log, the exact real verification request method/origin/path/
   query/body, and a revoked verdict that removes paid state and restores the
   five-photo free limit. The release-configuration test maps every verifier-
   identified README/form/privacy/terms fragment to these claim IDs.
2. **Revoked licenses relock immediately.** Verification now stores the
   verdict reason, reconciles stale cached paid state, re-renders after an
   `expired` or `revoked` response, shows **This license is no longer active**,
   keeps the buy/restore path available, and applies the free photo cap. The
   notice survives reload from the cached verdict and is cleared in demo mode.
3. **Mobile chore actions have the required separation.** The chore-action
   row gap changed from 4 px to 8 px. The
   `@regression:mobile-target-separation` test measures **Add note or photo**
   to **Archive** in every sample chore at 390 px and requires at least 8 px.
   Live measurements are exactly 8 px for all four cards.

The service-worker cache is `done-here-v6`, the standalone start URL is
`/app?v=6`, and the visible product version is 1.0.2, so installed users
receive the repaired shell.

## Clean repository verification

Run from a clean dependency install:

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

- `npm ci`: 141 packages installed; 0 vulnerabilities.
- Vitest: 15/15 passed.
- Playwright: 54 passed; 2 intentional desktop skips for mobile-only geometry.
- ESLint: passed with zero warnings.
- TypeScript: passed.
- Exact production build: passed twice and produced `dist/index.html`.
- Production dependency audit: 0 vulnerabilities.
- Every one of the 23 `.factory/claims.json` commands was run independently;
  all returned zero and the aggregate result was `CLAIM_FAILURES=0`.
- Package/consumer verification is not applicable to this static PWA.

Production budgets:

| Resource | Raw | Gzip |
| --- | ---: | ---: |
| Inline JavaScript | 32,554 B | 11,616 B |
| Inline CSS | 15,033 B | 4,081 B |
| Full HTML shell | 49,212 B | 15,962 B |
| Mobile hero WebP | 53,244 B | n/a |
| Desktop hero WebP | 106,836 B | n/a |
| Fonts | 0 B | 0 B |

These remain below the 200 KB JavaScript, 50 KB CSS, 120 KB font, and 300 KB
mobile-hero budgets.

## Browser, accessibility, privacy, and PWA evidence

Local and live sweeps covered `/`, `/app`, `/demo`, `/privacy`, `/terms`,
`/404`, and an unknown route at 1280 × 720 and 390 × 844. All 14 combinations
had zero serious/critical Axe findings, one `h1`, one `main`, route-specific
titles, and no horizontal overflow. Standard routes had no console or page
errors. The two designed 404 URLs had only the expected main-document HTTP 404
console entry and no unexpected error.

Keyboard checks passed for the first-Tab skip link and 3 px focus ring, skip
focus into `main`, native-dialog Escape focus return, calendar Enter/arrow
navigation, and SPA navigation with destination-heading focus. Reduced-motion
media matched, smooth scrolling became `auto`, and transition duration became
`0.00001s`.

Privacy and billing checks passed:

- The complete demo completion/export flow made only same-origin requests and
  loaded no font, analytics, remote script, or tracker request.
- A live incoming invalid license was removed from the address bar, stored in
  the documented key, and produced exactly one `GET` to the Sociobot verify
  path with one `license` query field and no request body.
- Demo mode does not read, write, verify, or display real license state.
- A mocked `revoked` gateway verdict removed paid state and rejected a sixth
  photo with the free-limit message.
- Checkout returned 303 to `checkout.dodopayments.com`.
- License requests 1–30 returned 200; request 31 returned 429 with
  `Retry-After: 4` and the product origin in CORS. Requests 32–33 also returned
  429.

PWA checks passed:

- The live worker controls `/demo`, cache `done-here-v6` contains the shell,
  and the standalone manifest/icon checks pass.
- Live offline reload retained all sample data and displayed **Offline. Your
  calendar still works here.**
- An isolated changed worker displayed **A new version is ready** and
  **Update now**; activation reloaded the demo with its sample data and no
  browser error.

`verify-url.sh` passed local and live `/demo`, including title, language, one
heading/main, image alternatives, button labels, and console checks. Visual
review of both generated screenshots found no clipping, overlap, or mobile
regression. Evidence is in `.factory/evidence-repair-6-local/` and
`.factory/evidence-repair-6-live/`.

Local Lighthouse mobile: Performance 99, Accessibility 100, Best Practices
100, SEO 100; FCP 0.77 s, LCP 1.05 s, TBT 149 ms, CLS 0. Live Lighthouse:
100/100/100/100; FCP/LCP 1.16 s, TBT 0 ms, CLS 0.

## Deployment, response policy, and identity

`/opt/fleet/lib/deploy-static.sh chore-proof-calendar dist` deployed the
committed production build to the existing Central US Static Web App. The
custom domain returned HTTPS 200 immediately after deployment.

Live responses contain the configured CSP with response-header
`frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and a
restrictive permissions policy. HTML revalidates with a 30-second maximum age,
`sw.js` is no-store, the manifest revalidates, and hashed assets are immutable
for one year. Unknown routes return the designed page with HTTP 404.

Critical live files are byte-identical to `dist/`:

| File | SHA-256 |
| --- | --- |
| `index.html` | `e70092530aa02faf9463c4ee69b9a2bd848290685d00a1877dbb515cac00e18c` |
| `sw.js` | `1dc988c604aff5162206ca15ffe816923c13721b5dcedfb986beeb33c09605df` |
| `manifest.webmanifest` | `5b8d7717d6bc4b72ee83a0adf91eed09449c2ef0033cf7b4c11205cc68616c66` |
| `not-found.html` | `c98fbfc3132230487c548bb48aefea67d359efca546b7ac28b95c97148171e16` |
| Mobile hero | `408852842ee58788231824855cb783bc76346f74485775f79f2c1dcc6bbe7648` |
| Desktop hero | `1998424b8887cb688cf65da67b1fa1fb4b764613ccf2cd586fc2c86a246cef31` |

## Known gaps and next steps

No release-blocking gap is known. Request independent release verification of
commit `fd0e3aa3602ec786d8b4ed5b9b13181870377318`.

## Run locally

```sh
npm ci
npm test
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/demo` for the isolated sample calendar.
