# Polish 1 — review finding closure

- Base reviewed: `f70dbb5`
- Repair: `14daf331bb8f762707638249b1dfe90c513c384b`
- Live: <https://chore-proof-calendar.sociobot.in/?demo=1>
- Deployment: `70639713-e540-4b9d-983c-a0a22a4d4717`

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Rebuilt `not-found.html` with header/nav, shared footer, Privacy/Terms, factory link, favicon, canonical, description, OG/Twitter data, and focusable main. | `release configuration > gives the direct HTTP 404…`; live `browser-matrix.json`; live `404-mobile.png`; cold `https://chore-proof-calendar.sociobot.in/missing-route` returned 404 with the full shell. |
| F-1-2 | Replaced “A household record, kept here” with “Recurring chore completion history.” | `.factory/copy-audit.md`; live `screenshot-desktop.png` and `screenshot-mobile.png`. |
| F-1-3 | Replaced “Today’s shelf” with “Calendar preview.” | `.factory/copy-audit.md`; live browser route check for `/`. |
| F-1-4 | Replaced “Three small moves” with “How it works” and made the section h2 “Build a clear chore record.” | `.factory/copy-audit.md`; live browser route check for `/`. |
| F-1-5 | Replaced “A calmer boundary” with “What Done Here does not do.” | `.factory/copy-audit.md`; live browser route check for `/`. |
| F-1-6 | Removed the public “Ceramic artwork generated for this product” assertion; provenance stays in `.factory/design.md`. | `release configuration > registers every product promise…`; live footer check in `browser-matrix.json`. |
| F-1-7 | Rewrote README recurrence copy as “Name chores and repeat each one every 1 to 365 days.” | `.factory/copy-audit.md`; `@claim:recurrence-bounds`; live README source shipped with repair. |
| F-1-8 | Rewrote README completion copy in plain words. | `.factory/copy-audit.md`; `@claim:one-tap-completion` and `@claim:due-status`. |
| F-1-9 | Rewrote README PWA copy as the user outcome. | `.factory/copy-audit.md`; `@claim:offline-reload` and `@claim:installable-pwa`. |
| F-1-10 | Rewrote checkout copy as “The $12 purchase opens Sociobot checkout.” | `.factory/copy-audit.md`; `@claim:paid-photo-cap`; live response check confirms 303 to Dodo checkout. |
| F-1-11 | Rewrote README storage copy as “Your real calendar is stored only in this browser.” | `.factory/copy-audit.md`; `@claim:local-data`; live `browser-matrix.json` records no external demo requests. |
| F-1-12 | Rewrote README demo copy as the visible privacy outcome. | `.factory/copy-audit.md`; `@claim:demo-sandbox`; live `?demo=1` banner in `screenshot-mobile.png`. |
| F-1-13 | Rewrote README host-settings copy in deployer-facing plain language. | `.factory/copy-audit.md`; `release configuration > serves known SPA routes…`; live `response-identity.json` confirms deep links and HTTP 404. |

## Additional required acceptance coverage

The first-screen action now links to `/?demo=1`. Its one-click flow is covered
inside `@claim:demo-sandbox`: the test starts from `/`, clicks the action,
requires the query URL and persistent demo banner, and separately verifies
storage isolation, reload reset, Reset demo, and Start for real. Route titles,
canonical/OG/Twitter updates, focus-on-navigation, service-worker update cache,
privacy, offline behavior, and mobile controls were rerun locally and live in
the browser matrices named above.
