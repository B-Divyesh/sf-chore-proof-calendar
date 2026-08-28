# Done Here repair handoff — PASS

- Work order: `chore-proof-calendar-repair-2`
- Repaired verifier report: `1bbc6b9aff18c02a890f7d4110f7dc859bd566a4`
- Repaired candidate: `6b9632a3cee30240e13c514d68279d20b2cde83f`
- Repair implementation commit: `457f51c`
- Live URL: <https://chore-proof-calendar.sociobot.in>
- Deployment: Azure Static Web Apps, static PWA, deployment `08db22b4-41fc-4e27-99dd-0965944639b4`
- Verified: 2026-08-28 UTC

## Outcome

**PASS.** Every release blocker and secondary product-QA defect in
`.factory/verification-2.md` is repaired. The original local-first PWA,
researched brief, demo sandbox, and previously passing behavior remain intact.

## Repairs

1. Due status now compares local calendar days. At 16:00 UTC a new daily chore
   says `Due today` beside `next Aug 28, 2026`; after completion it says
   `Due in 1 day` beside `next Aug 29, 2026`.
2. JSON imports validate every chore and completion, including dates, bounds,
   IDs, links, notes, and photo data types, before the IndexedDB transaction.
   Invalid imports leave existing data untouched. Loading also filters legacy
   malformed records so an already-damaged database cannot blank the app.
3. The live Sociobot/Dodo product `pdt_0NmNtEPVHwwtaAvgN4sgQ` is registered and
   enabled at $12. The checkout endpoint now returns HTTP 303 to
   `checkout.dodopayments.com`.
4. Claim coverage now includes the observable due labels. The paid claim
   follows the live checkout boundary. The PDF claim asserts every sample row
   plus accented and Chinese text.
5. PDF strings use Unicode CID text. `pdftotext` recovered
   `Nettoyer l’évier 洗碗` and `Fait — très propre` from the generated file.
6. Known SPA routes have explicit host rewrites. `/404` and arbitrary missing
   paths render the designed static page with HTTP 404 and no refresh loop.
7. Header, demo, and footer links now measure at least 44 px on a 390 px
   viewport.
8. Photo proof checks both MIME type and JPEG/PNG/WebP file signatures. Invalid
   files keep the dialog open with a specific recovery message.
9. The dead factory link now points to `https://hello-factory.sociobot.in/`,
   which returned HTTP 200.
10. ESLint and explicit type-check scripts were added to the release gates.

## Clean repository verification

From the pushed repair commit:

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

- `npm ci`: 141 packages installed; 0 vulnerabilities.
- `npm audit --omit=dev`: 0 vulnerabilities.
- ESLint: pass with zero warnings.
- TypeScript: pass.
- Vitest: 14/14 pass.
- Playwright: 39 pass across desktop Chromium and 390 × 844 mobile; one
  expected project skip because the touch-target measurement runs only in the
  mobile project.
- All 16 commands in `.factory/claims.json` were also run verbatim and passed.
- Production build: `dist/index.html` is 48,071 bytes raw and 15,506 bytes
  gzip. No external JavaScript, CSS, font, analytics, or CDN script is loaded.

## Browser, accessibility, privacy, and PWA evidence

- `/opt/fleet/lib/verify-url.sh`: title, `lang`, one h1, main landmark, image
  alternatives, labeled buttons, and console/page errors all pass. Live load
  measured 635 ms in that smoke test.
- Live Axe scans on `/`, `/demo`, `/privacy`, `/terms`, `/404`, and an open
  dialog found 0 serious/critical issues at 1280 px and 390 px.
- Keyboard claim: calendar month change, arrow navigation, selection, skip
  link, native dialog focus, Escape, and focus return pass.
- Live 390 px flow: due labels, malformed-import rejection, reload recovery,
  and eight visible navigation/banner/footer touch targets pass.
- Privacy: a completion plus JSON export on live `/demo` made only same-origin
  requests. Demo state remained separate from IndexedDB/localStorage.
- Offline: the live worker controlled `/demo`; cache `done-here-v3` contained
  the route, and an offline reload retained sample data and showed the offline
  notice.
- Update: changing the served production worker created a new installation and
  displayed `A new version is ready`; the original worker bytes were restored.
- Reduced motion remains enforced by the existing media query.
- Response policy: shell has CSP, HSTS, nosniff, strict-origin referrer policy,
  and Permissions Policy; `sw.js` is no-store; static assets are immutable for
  one year.

## Live identity and routing

Built and deployed SHA-256 values are identical:

| File | SHA-256 |
| --- | --- |
| `index.html` | `9a1803eef7537cf16e5bf731f05acfb636a02bd97a2994f681e19bcde6d2e974` |
| `sw.js` | `39ecc75736d25fc191f8cd51a290cd1445dda77798c3f375da97ebd146a71668` |
| `manifest.webmanifest` | `27dfdb3d50ff468bf4882baa58ba4cc2f63967563ae465924ca9463874c7d021` |
| `not-found.html` | `1e53c45a3b9631113d4984ed6607fc5fb181e88436276a3da4bc2d33dc081b25` |

Live status checks: `/`, `/app`, `/demo`, `/privacy`, and `/terms` return 200;
`/404` and `/missing-release-check` return 404; checkout returns 303 to the
Dodo-hosted session.

## Performance

Lighthouse 12.8.2 mobile against production, with the full-page screenshot
audit skipped because screenshots are captured separately:

- Performance 100
- Accessibility 100
- Best Practices 100
- SEO 100
- FCP 1.1 s; LCP 1.5 s; CLS 0; TBT 10 ms

Evidence is in `.factory/evidence-repair/`: live HTML, desktop/mobile full-page
screenshots, `verify.json`, and `lighthouse.json`.

## Known gaps

No release-blocking gaps remain. Verification created hosted checkout sessions
but did not submit a real charged purchase; webhook/license issuance remains
the Sociobot billing engine’s existing responsibility. Sign-in, backend, and
package-consumer checks are not applicable to this accountless static PWA.
