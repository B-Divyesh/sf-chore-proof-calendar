# Done Here repair handoff — PASS

- Work order: `chore-proof-calendar-repair-5`
- Independent report commit: `0176e61773045f3aeafdc0aae54be989c6a7f224`
- Failed candidate: `62f4308ec756efdae1f3f27c04b44e9aaf32de1a`
- Repair commit: `07cf677` (`fix: close independent release blockers`)
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Deployment: `a96b98dc-04b5-4ddb-9735-bc15047af09d`
- Verified: 2026-08-29 UTC

## Release-blocker repairs

All three findings in `.factory/verification-4.md` were reproduced against the
failed candidate before repair.

1. **Demo license isolation.** Demo mode is now decided before license setup.
   `/demo`, `?demo=1`, and license-bearing demo URLs do not read, write, or
   verify production licenses. A cached valid real license cannot change demo
   UI. The demo omits the restore form and links to the real calendar instead.
   A verifier response already in flight also stops before changing storage if
   the user enters demo mode. Incoming real licenses now clear any cached
   verdict before verification.
2. **Mobile calendar targets.** The mobile calendar runs edge to edge inside
   its panel. Seven 44 px columns and six 8 px gaps fit the 390 px viewport
   without page overflow. Narrower screens scroll only the calendar grid.
   Every live day button measures exactly `44 × 48` CSS px.
3. **Claim coverage.** Four visitor-facing promises now have registry entries
   and uniquely tagged observable tests: installable PWA, no-account use, no
   household ranking, and the free core calendar. A unit regression maps each
   independently audited copy fragment to its claim IDs, so registry-only
   enumeration cannot hide these omissions.

The demo regression preloads real license and verdict keys, opens two
license-bearing demo URLs, mutates and reloads sample data, and asserts the
entire local-storage snapshot is unchanged. It also asserts no license request
and no paid-state badge. The mobile regression measures every visible link,
button, field, and button-like label, including all 31 calendar days.

The service-worker cache is `done-here-v5`, and the manifest start URL is
`/app?v=5`, so existing installs receive the repaired shell. The brief,
local-first data model, exports, photo policy, billing path, visual thesis, and
PWA artifact class are unchanged.

## Clean verification

The final app was verified from `npm ci`:

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

- Clean install: 141 packages, 0 vulnerabilities.
- Unit: 15/15 passed.
- Playwright: 47 passed; one intentional desktop skip for the mobile-only
  target measurement.
- Lint and TypeScript: passed with zero warnings or errors.
- A second exact production build passed and produced `dist/index.html`.
- Production audit: 0 vulnerabilities.
- All 20 commands in `.factory/claims.json` passed independently:
  `CLAIM_FAILURES=0`.
- Package/consumer verification is not applicable to this static PWA.

Production budgets:

| Resource | Raw | Gzip |
| --- | ---: | ---: |
| Inline JavaScript | 32,246 B | 11,520 B |
| Inline CSS | 14,969 B | 4,066 B |
| Full HTML shell | 48,840 B | 15,856 B |
| Mobile hero WebP | 53,244 B | n/a |
| Desktop hero WebP | 106,836 B | n/a |
| Fonts | 0 B | 0 B |

Local Lighthouse mobile: performance 100, accessibility 100, best practices
100, SEO 100; FCP 1.0 s, LCP 1.1 s, TBT 0 ms, CLS 0. Live Lighthouse:
100/100/100/100; FCP 0.9 s, LCP 1.0 s, TBT 80 ms, CLS 0.

## Browser, accessibility, privacy, and PWA evidence

A production-build sweep covered `/`, `/app`, `/demo`, `/privacy`, `/terms`,
`/404`, and a missing route at 1280 × 720 and 390 × 844. All 14 combinations
had:

- zero serious or critical Axe findings;
- zero console or page errors;
- one `h1` and one `main`;
- no horizontal page overflow;
- every visible control at least `44 × 44` CSS px.

Keyboard checks passed for the skip link, month buttons, calendar arrow keys,
and SPA navigation. Native-dialog focus stayed inside the open dialog and
returned to its opener on Escape. Reduced motion computed smooth scrolling as
`auto` and transitions as `0.00001s`.

The live repair counterexamples passed from a fresh 390 px context:

- 31 calendar days; minimum `44 × 48` CSS px; zero page overflow;
- preseeded real license, verdict, and preference values remained byte-for-byte
  unchanged after `/demo?license=…`;
- zero license verification requests and zero active-license badges in demo;
- offline reload retained the sample calendar and displayed the offline state.

A separate live real-data flow created a chore, saved a note, displayed dated
history, and downloaded JSON with no cross-origin request or browser error.
An isolated service-worker replacement displayed **A new version is ready**
and **Update now** without errors. The invalid-license endpoint returned the
expected `{valid:false, reason:"invalid"}` response with product-origin CORS;
checkout returned 303 to the Dodo-hosted checkout.

`verify-url.sh` passed both local and live `/demo` with the correct title,
language, one heading/main, complete image/button labels, and no browser
errors. Screenshots, HTML captures, Lighthouse reports, and verifier JSON are
in `.factory/evidence-repair-5-local/` and
`.factory/evidence-repair-5-live/`.

## Deployment, response policy, and identity

`/opt/fleet/lib/deploy-static.sh chore-proof-calendar dist` deployed the
committed build to the existing Central US Static Web App. The custom domain
returned HTTPS 200 immediately after deployment. Live responses have the
configured CSP (including response-header `frame-ancestors 'none'`), HSTS,
`nosniff`, strict-origin referrer policy, and restrictive permissions policy.
HTML revalidates, `sw.js` is no-store, the manifest revalidates, and hashed
assets are immutable for one year. Missing routes return the designed page
with HTTP 404.

Live files are byte-identical to `dist/`:

| File | SHA-256 |
| --- | --- |
| `index.html` | `4d2f7e95cac4d7dc1fd0d60cf64d9a2886aa377c17fad903fa3cd7a2ab8c3892` |
| `sw.js` | `7b0fd6d8eaa03264363630181ac397f24b559bb739bd31c6aa570395ca3b7a4e` |
| `manifest.webmanifest` | `81ed56429878cd8753e105b76f09c1b7383eac75a73a381b92cb55c88b991625` |
| `not-found.html` | `1e53c45a3b9631113d4984ed6607fc5fb181e88436276a3da4bc2d33dc081b25` |
| Mobile hero | `408852842ee58788231824855cb783bc76346f74485775f79f2c1dcc6bbe7648` |
| Desktop hero | `1998424b8887cb688cf65da67b1fa1fb4b764613ccf2cd586fc2c86a246cef31` |

No release-blocking gap remains from the independent report.

## Run locally

```sh
npm ci
npm test
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/demo` for the isolated sample-data calendar.
