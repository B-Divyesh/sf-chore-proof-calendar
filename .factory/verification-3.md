# Independent verification 3 — FAIL

- Candidate: `5d86342da0019048f7af69d9bb94b84862f96786`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Verified: 2026-08-28 UTC
- Scope: clean-clone claims, repository gates, exact production build, live
  identity, desktop and 390 px mobile, normal/boundary/recovery flows,
  accessibility, privacy/network, billing, response policy, PWA
  offline/update behavior, caching, and performance

## Release decision

**FAIL.** The first-read and mandatory claim gates pass. The deployed product
is byte-identical to the candidate and its core workflow works end to end.
However, the 390 px footer **Terms** link has a `38.30 × 44 px` hit area. The
acceptance contract requires every touch target to be at least `44 × 44 px`.
The repository's touch-target regression checks height only, so it reports a
pass while missing this width failure.

No product code was changed during this verification.

## First-read gate — PASS

A cold browser context showed, on both desktop and 390 × 844 mobile and within
the initial mobile viewport:

- what it does: **“See when each chore was done”**;
- who it is for: **“For households that need a clear history, not another
  overdue badge”**;
- what to click: **“Try it with sample data”**, beside **“See a filled calendar
  in one click.”**

The action opens `/demo` in one click. Four named chores and seven realistic
completions are already present. The persistent banner says **“Demo — sample
data, nothing is saved”** and exposes **Reset demo** and **Start for real**.
Reload restores the sample, and Start for real opens the separate real
calendar.

## Mandatory claims gate — PASS

`.factory/claims.json` exists. After `npm ci`, every listed command was run
verbatim from candidate `5d86342`; all 16 returned zero. Every claim ID occurs
in exactly one tagged test.

| Claim | Result | Evidence |
| --- | --- | --- |
| `demo-sandbox` | PASS | sample mutation reset on reload; demo banner remained |
| `one-tap-completion` | PASS | one click added a dated history event |
| `offline-reload` | PASS | controlled demo reloaded with browser networking disabled |
| `local-data` | PASS | completion and JSON export produced no remote request |
| `ics-export` | PASS | one UTC `VEVENT` per bundled completion |
| `pdf-export` | PASS | every sample row and Unicode fixture were encoded |
| `csv-export` | PASS | header plus one row per completion |
| `json-export` | PASS | four chores and seven completions downloaded |
| `json-restore` | PASS | full sample restored into the real calendar |
| `recurrence-bounds` | PASS | 0/366 rejected; 1/365 accepted |
| `due-status` | PASS | relative label and calendar date agreed before/after completion |
| `completion-proof` | PASS | consented note and valid PNG appeared in history |
| `keyboard-calendar` | PASS | keyboard changed month, moved day focus, and selected a day |
| `photo-tier` | PASS | policy returned limits 5 and 500 |
| `paid-photo-cap` | PASS | exact $12 copy and live checkout redirect verified |
| `accessible-baseline` | PASS | mobile demo Axe found no serious/critical issue |

The independent live flow also verified the free sixth photo is rejected after
five stored photos. The one target-size defect below is outside Axe's coverage
and is missed by the existing height-only regression.

## Release-blocking defect

### Medium — the mobile Terms link is narrower than the required touch target

At a `390 × 844` viewport on live `/demo`, the rendered footer controls
measured:

```text
Privacy                  47.08 × 44 px
Terms                    38.30 × 44 px  <-- fails
Built by Param Factory  146.52 × 44 px
```

The attached accessibility and design contracts require touch targets of at
least `44 × 44` CSS pixels. `src/styles.css` gives anchors `min-height: 44px`
but no minimum width. The regression named `mobile navigation, demo, and
footer controls meet the 44px target` asserts only `box.height >= 44`, so the
suite cannot catch this failure.

This is a release blocker because the repository definition of done makes the
44 px touch-target baseline mandatory, even though the affected link is not a
core workflow control.

## Repository and production build

- `npm ci`: pass; 141 packages installed; 0 vulnerabilities.
- `npm run lint`: pass with zero warnings.
- `npm run typecheck`: pass.
- `npm test`: pass; Vitest `14/14`, Playwright `39` passed and one intentional
  desktop skip for a mobile-only measurement.
- `npm run build`: pass; `dist/` produced.
- `npm audit --omit=dev`: pass; 0 vulnerabilities.
- Production shell: `48,378` bytes raw / `15,564` bytes gzip.
- Mobile hero: `53,244` bytes; desktop hero: `106,836` bytes.
- No separate JS, CSS, font, analytics, or third-party runtime bundle loads.

These are comfortably inside the 200 KB JS, 50 KB CSS, 120 KB font, and
300 KB mobile-hero budgets.

## Functional and recovery evidence

Independent live-browser checks passed for:

- empty state and adding a real chore;
- required name, 0-day, and 366-day rejection;
- 1-day and 365-day acceptance;
- IndexedDB persistence across reload;
- matching last-done, next-due, and calendar-day state;
- one-tap completion;
- optional note and valid PNG after explicit photo consent;
- rejection of missing consent and unsupported/invalid image bytes;
- free five-photo enforcement and sixth-photo recovery message;
- valid JSON restore and JSON, CSV, ICS, and PDF downloads;
- malformed JSON-record rejection with a persistent `role="alert"`, unchanged
  in-memory data, unchanged IndexedDB data, and successful reload;
- keyboard month/day navigation, dialog Escape/focus return, completion
  removal with Undo, and chore archive confirmation.

No console or uncaught page errors occurred.

## Accessibility, responsive behavior, and routes

- Live Axe serious/critical findings: `0` on `/demo`, `/privacy`, `/terms`, and
  an unknown route at desktop and 390 px mobile sizes.
- Worker `verify-url.sh`: HTTP 200, 954 ms network-idle load, correct title and
  `lang`, one h1, main landmark, no missing image alt, no unlabeled button, and
  no browser errors.
- The first stable Tab stop is the skip link with a visible 3 px outline.
- Native dialogs keep keyboard focus inside and return it to the opener on
  Escape.
- Reduced motion computes animation/transition duration as `0.00001s` and
  disables smooth scrolling.
- No horizontal overflow occurred at 390 px.
- `/`, `/app`, `/demo`, `/privacy`, and `/terms` return 200. `/404` and an
  arbitrary missing route return a designed page with HTTP 404.
- All rendered links resolved: internal routes and factory link returned 200;
  checkout returned 303 to `checkout.dodopayments.com`.

## Privacy, billing, and response policy

- Cold landing, demo use, real completion, note/photo, malformed import, and
  exports made same-origin requests only.
- No analytics, CDN font, remote script, Azure key, or direct payment-provider
  runtime call exists.
- An incoming license was stored as
  `sb_license:chore-proof-calendar`, removed from the address bar, and sent
  only to `api.sociobot.in`; an invalid token was cached as invalid.
- Checkout returned HTTP 303 to the live Dodo-hosted checkout.
- The license verification allowance is **30 rapid requests per client**.
  Requests 1–30 returned 200; request 31 returned 429 with
  `Retry-After: 3`.
- No sign-in exists, so the Microsoft Entra authority requirement is not
  applicable.
- CSP, HSTS, `nosniff`, strict-origin referrer policy, and Permissions Policy
  were present.

## Deployment identity, caching, and PWA

Live files exactly match the candidate build:

| File | SHA-256 |
| --- | --- |
| `index.html` | `a7b460c224d039c961b8b4cca24fcc2d9ed0b649c340ace9ab9ddce4776bd25c` |
| `sw.js` | `39ecc75736d25fc191f8cd51a290cd1445dda77798c3f375da97ebd146a71668` |
| `manifest.webmanifest` | `27dfdb3d50ff468bf4882baa58ba4cc2f63967563ae465924ca9463874c7d021` |
| mobile hero | `408852842ee58788231824855cb783bc76346f74485775f79f2c1dcc6bbe7648` |
| `not-found.html` | `1e53c45a3b9631113d4984ed6607fc5fb181e88436276a3da4bc2d33dc081b25` |

- Assets return `public, max-age=31536000, immutable` and validate to 304.
- `sw.js` returns `no-cache, no-store, must-revalidate`.
- HTML and the manifest revalidate; conditional requests returned 304.
- Manifest icons are valid 192 × 192 and 512 × 512 PNGs with maskable
  purpose; the Apple icon is 180 × 180.
- Live worker `done-here-v3` controlled `/demo`, cached the shell, and reloaded
  four sample chores offline with the offline notice.
- An isolated server changed the worker response, `registration.update()`
  produced **“A new version is ready”** and the **Update now** action.

## Performance

Lighthouse 12.8.2 mobile generated a complete report before its final browser
tab crashed:

- Performance `96`
- Accessibility `100`
- Best Practices `100`
- SEO `100`
- FCP `1.0 s`; LCP `1.2 s`; CLS `0`; TBT `210 ms`

The post-report tab crash is a Lighthouse/Chrome harness issue; the browser,
Playwright, console, and functional checks above remained clean.

## Required before release

1. Give every mobile link a `44 × 44 px` minimum hit area, including the short
   footer **Terms** link.
2. Change the target-size regression to assert both width and height for every
   visible control, then rerun all claims and the complete suite.
