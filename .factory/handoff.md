# Done Here repair 10 handoff

- Work order: `chore-proof-calendar-repair-10`
- Runtime implementation: `da9493593009fcf702410ab246b5f6ab04f54706`
- Base documentation review: `9ad751f6f1a7b02d0161b2ecf40db94255eaf763`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Product class: offline PWA

## Result

The strict claims repair is complete. The product's runtime behavior was
already correct; this repair adds the missing public-claim declarations and
outcome-based regression tests that prove it stays correct.

| Review finding | Repair and regression proof |
| --- | --- |
| F-5-1 archive retention | `archive-retention` creates a real chore, records two completions, confirms archive, and verifies JSON retains the archived chore and both records. |
| F-5-2 full JSON export | `json-export` imports a fixture containing active and archived chores, recurrence values, timestamps, notes, and a PNG data URL; the downloaded backup is deep-compared field for field. |
| F-5-2 full JSON restore | `json-restore` imports the same complete fixture through the real UI and deep-compares the subsequent JSON export, including the archived state and photo data. |
| F-5-3 photo promise | `photo-json-local` saves a consented PNG in a real calendar, reloads it, verifies the exact data URL in JSON, and records no cross-origin request. |
| F-5-3 site-data deletion | `site-data-deletion` saves a real chore and completion, clears all browser site data for the origin through the browser protocol, reloads, and proves the calendar and IndexedDB records are empty. |

The claim-audit unit test now maps each of these retained public promises to
its registered claim, while the browser tests independently prove outcomes.

## Verification

From the documented clean setup, `npm ci` installed 141 packages with zero
reported audit vulnerabilities. All 27 declared claim commands were run
separately from `.factory/claims.json`; each completed with a passing
Playwright or Vitest result.

The following also passed:

- `npm run lint`
- `npm run typecheck`
- `npm test` — 17 unit tests and the complete 68-case desktop/mobile browser suite
- `npm run build` — produced `dist/index.html` at 50.35 kB raw / 16.18 kB gzip
- `npm audit --omit=dev` — zero vulnerabilities

Local browser evidence is in `.factory/evidence-repair-10-local/`:

- `browser-matrix.json`: 14 desktop/phone route scans, zero serious/critical
  Axe findings or console errors, 63 mobile targets with none below 44 px,
  keyboard/focus/privacy/offline/reduced-motion/200% reflow all passing.
- `verify-url/verify.json`: `/demo` has a title, `lang=en`, one `h1`, one
  main landmark, image alternatives, labelled controls, and no browser error.
- `sample-calendar.json`: desktop and phone first reads identify the job,
  household audience, and sample action before scrolling; one click and reset
  each show the seven bundled completions with the persistent sample label and
  unchanged real storage.
- `update.json`: an isolated worker update displays its update action and
  retains the sample banner and four chores.

Fresh HTTPS evidence is in `.factory/evidence-repair-10-live/`:

- `response-identity.json`: the live shell, worker, manifest, 404 artifact,
  heroes, and icons byte-match this rebuilt `dist/`; required routes return
  200 and the designed missing route returns its expected 404. The active
  checkout still returns its hosted 303 redirect.
- `browser-matrix.json`: the same 14 fresh live desktop/phone route scans pass
  with zero serious/critical Axe findings, zero console errors, no undersized
  mobile target, and passing keyboard, privacy, offline, reduced-motion, and
  reflow checks.
- `sample-calendar.json` and `verify-url/verify.json`: fresh phone and desktop
  first reads name the job, audience, and first action before scrolling; one
  click and reset retain the populated sample label and seven completions.

The plain verb-first catalog description remains in
`.factory/catalog-description.txt` and is copied to
`/work/.evidence/catalog-description.txt`.

## Deployment and remaining work

No runtime source or static asset changed in this repair, so the runtime
implementation remains `da94935`. The claims-contract repair commit
`0dbc219f3f79b47991c9f216ef52ea4dfb04580f` was pushed through the normal
static-product path. Its rebuilt static output byte-matches the cold HTTPS
product, including fresh desktop and phone `/` and `/demo` checks. No product
behavior, billing offer, stored data format, or privacy boundary is
intentionally changed.

Known product gaps: none observed. This remains a browser-only PWA with no
product-owned backend, accounts, tenant state, or server-side persistence; the
Sociobot checkout and license endpoint remain the named external dependency.
