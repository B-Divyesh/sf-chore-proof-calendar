# Polish 2 — zero-finding closure

- Base review: `990229fbb097e8039d725f82dc2520eb175a23b4`
- Repair commit: `385de6d`
- Deployment: `999990ef-1798-4f6f-8f24-3b06fa020f2a`
- Live: <https://chore-proof-calendar.sociobot.in>

Shared live evidence: [desktop first read](evidence-polish-2-live/first-read-desktop.png),
[mobile demo](evidence-polish-2-live/first-read-demo-mobile.png),
[`browser-matrix.json`](evidence-polish-2-live/browser-matrix.json),
[`response-identity.json`](evidence-polish-2-live/response-identity.json), and
[`finding-check.json`](evidence-polish-2-live/finding-check.json).

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Retained the full static 404 shell: metadata, navigation, legal footer, and return action. | `release configuration > gives the direct HTTP 404…`; `first-read-desktop.png`; cold <https://chore-proof-calendar.sociobot.in/missing-route> is HTTP 404. |
| F-1-2 | Kept “Recurring chore completion history” as the landing section label. | `release configuration > keeps the reviewed…`; `first-read-desktop.png`; <https://chore-proof-calendar.sociobot.in/>. |
| F-1-3 | Kept “Calendar preview” as the preview label. | `release configuration > keeps the reviewed…`; `first-read-desktop.png`; <https://chore-proof-calendar.sociobot.in/>. |
| F-1-4 | Kept “How it works” as the how-to label. | `release configuration > keeps the reviewed…`; `first-read-desktop.png`; <https://chore-proof-calendar.sociobot.in/>. |
| F-1-5 | Kept “What Done Here does not do” as the boundary label. | `release configuration > keeps the reviewed…`; `first-read-desktop.png`; <https://chore-proof-calendar.sociobot.in/>. |
| F-1-6 | Kept public artwork-provenance copy removed; provenance remains in `design.md`. | `release configuration > keeps the reviewed…`; `first-read-desktop.png`; <https://chore-proof-calendar.sociobot.in/> footer check. |
| F-1-7 | Kept the plain README recurrence sentence. | `@claim:recurrence-bounds`; `first-read-desktop.png`; source at `385de6d`. |
| F-1-8 | Kept the plain README completion/due explanation. | `@claim:one-tap-completion`, `@claim:due-status`; `first-read-desktop.png`; <https://chore-proof-calendar.sociobot.in/demo>. |
| F-1-9 | Kept the outcome-based offline/install README wording. | `@claim:offline-reload`, `@claim:installable-pwa`; `first-read-demo-mobile.png`; <https://chore-proof-calendar.sociobot.in/demo>. |
| F-1-10 | Kept the plain Sociobot checkout README wording. | `@claim:paid-photo-cap`; `first-read-desktop.png`; live checkout resolves from <https://chore-proof-calendar.sociobot.in/>. |
| F-1-11 | Kept browser-local storage wording. | `@claim:local-data`; `first-read-demo-mobile.png`; <https://chore-proof-calendar.sociobot.in/privacy>. |
| F-1-12 | Kept the plain demo-isolation README wording. | `@claim:demo-sandbox`; `first-read-demo-mobile.png`; <https://chore-proof-calendar.sociobot.in/?demo=1>. |
| F-1-13 | Kept the plain host-settings README wording. | `release configuration > serves known SPA routes…`; `first-read-desktop.png`; <https://chore-proof-calendar.sociobot.in/missing-route>. |
| F-2-1 | Replaced the inaccurate overdue-badge contrast with “For households that need a clear record of when recurring work was finished.” Rewrote README as “visible history without scores.” | `release configuration > keeps the reviewed…`; `first-read-desktop.png`; `finding-check.json` reports correct copy and zero old-copy matches at <https://chore-proof-calendar.sociobot.in/>. |
| F-2-2 | Replaced “consent-aware photos” with “Optional notes and photos, with a checkbox to confirm consent.” Updated the claim registry and proof claim to assert that a photo is blocked until the checkbox is checked. | `@claim:completion-proof`; `first-read-demo-mobile.png`; <https://chore-proof-calendar.sociobot.in/demo>. |
| F-2-3 | Renamed the disclosure control to “Enter a license”; “Verify license” remains the form action. | `@claim:license-token-only`; `first-read-desktop.png`; `finding-check.json` reports one correctly named control at <https://chore-proof-calendar.sociobot.in/>. |

## Cumulative acceptance checks

- The first-screen sample action opens `?demo=1`; the cold live check records
  four sample chores, the persistent banner, Reset demo, and Start for real.
- The demo is isolated from production storage. The clean-clone
  `@claim:demo-sandbox` test and live demo-exit check cover mutation, reset,
  exit, and reload.
- The PWA cache changed to `done-here-v10` and manifest start URL to `?v=10`,
  so existing installs receive the repaired copy. `verify-update.mjs` passed.
- Live `browser-matrix.json` records 14 desktop/mobile route scans with zero
  serious/critical Axe findings, console errors, missing alt text, overflow,
  or undersized visible targets. It also records keyboard focus, offline,
  privacy-request, reduced-motion, and 200%-zoom checks.
