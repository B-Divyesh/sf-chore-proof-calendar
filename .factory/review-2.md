# Adversarial first-read review 2 — FAIL

- Reviewed: 2026-08-29 UTC
- Target: https://chore-proof-calendar.sociobot.in
- Candidate: `0ae4f57351ccf978d54608716f8c99d08e1b4a51`
- Viewports: fresh 390 × 844 mobile and 1440 × 900 desktop contexts
- Verdict: **FAIL — 3 minor findings remain.** This review requires zero findings.

## Cold first read

Before scrolling, both viewports showed **“See when each chore was done”**,
**“For households that need a clear history, not another overdue badge.”**, and
**“Try it with sample data”** beside **“See a filled calendar in one click.”**

Cold interpretation:

- What it does: records when recurring household chores were completed.
- For whom: households that need a shared completion history.
- First click: **Try it with sample data** to open a filled calendar.

The first-read clarity gate passes. The misleading overdue-badge contrast is a
separate finding below.

## Findings

### F-2-1 — Minor — The first-screen contrast contradicts an app state

Exact quote/location: Landing hero: **“For households that need a clear
history, not another overdue badge.”** README introduction: **“It is for homes
that need a visible history instead of scores or overdue badges.”**

Why: Done Here does display overdue badges. On the live `/demo` route with the
browser date advanced to 15 September 2026, the four status badges read **“16
days overdue”**, **“15 days overdue”**, **“15 days overdue”**, and **“14 days
overdue”**. The source also renders an `overdue` due stamp. A first-time visitor
can reasonably read the landing and README copy as promising that this product
does not use overdue badges.

Concrete fix: Replace the landing line with **“For households that need a
clear record of when recurring work was finished.”** Replace the README line
with **“It is for homes that need a visible history without scores.”**

### F-2-2 — Minor — README uses vague privacy jargon

Exact quote/location: README Features: **“Optional notes and consent-aware
photos”.**

Why: “Consent-aware” does not tell a reader what the product checks. The real
behavior is a checkbox confirming that anyone shown agreed to storage.

Concrete fix: Replace it with **“Optional notes and photos, with a checkbox to
confirm consent”.**

### F-2-3 — Minor — The license disclosure button does not name its result

Exact quote/location: Landing Household Pack button: **“Have a license? Paste
it”.**

Why: Clicking the button does not paste or restore anything; it reveals and
focuses a license field. The label describes a later user action rather than
the click result.

Concrete fix: Rename the disclosure **“Enter a license”**. Keep **“Verify
license”** on the form submission button.

## Copy audit

Counts use whitespace-separated words. The inventory includes reader-facing
sentences, headings, actions, labels, alt text, and README list fragments so
the requested heading and button checks are explicit. Repeated navigation and
footer labels are listed once. No item exceeds 22 words and no banned
marketing adjective appears.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | pass |
| Done Here | 2 | pass |
| Calendar | 1 | pass |
| Demo | 1 | pass |
| Privacy | 1 | pass |
| Recurring chore completion history | 4 | pass |
| See when each chore was done | 6 | pass |
| For households that need a clear history, not another overdue badge. | 11 | F-2-1 |
| Try it with sample data | 5 | pass |
| See a filled calendar in one click. | 7 | pass |
| Create your first chore | 4 | pass |
| Works after the first visit without internet. | 7 | pass |
| Chore records stay in this browser. | 6 | pass |
| $12 once raises photo storage from 5 to 500. | 9 | pass |
| The calendar is free. | 4 | pass |
| Five handmade ceramic tiles form a weekly record with one teal completion mark. | 13 | pass |
| Each completion leaves a dated mark you can return to. | 10 | pass |
| Calendar preview | 2 | pass |
| Last done stays visible | 4 | pass |
| Each chore shows its latest completion and next due date. | 10 | pass |
| Water the houseplants | 3 | pass |
| Last done Aug 26, 2026 | 5 | pass |
| Change the bed sheets | 4 | pass |
| Last done Aug 24, 2026 | 5 | pass |
| Clear the fridge shelf | 4 | pass |
| Last done Aug 18, 2026 | 5 | pass |
| How it works | 3 | pass |
| Build a clear chore record | 5 | pass |
| Name the chore | 3 | pass |
| Choose how many days pass before it is due again. | 10 | pass |
| Mark it done | 3 | pass |
| Save the time in one tap. | 6 | pass |
| Add a note or photo when useful. | 7 | pass |
| Read the history | 3 | pass |
| Use the calendar or export the record as ICS, PDF, CSV, or JSON. | 13 | pass |
| What Done Here does not do | 6 | pass |
| Proof without household scoring | 4 | pass |
| Done Here does not rank people, assign points, or watch children. | 11 | pass |
| It records the chore, time, note, and optional photo you choose. | 11 | pass |
| Household Pack | 2 | pass |
| Keep up to 500 photo proofs | 6 | pass |
| Pay $12 once to store up to 500 photos. | 9 | pass |
| Chores, notes, and every export stay free. | 7 | pass |
| Buy Household Pack — $12 | 5 | pass |
| Have a license? Paste it | 5 | F-2-3 |
| Visible chore history for shared homes. | 6 | pass |
| Terms | 1 | pass |
| Built by Param Factory (external) | 5 | pass |
| v1.0.5 | 1 | pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Done Here | 2 | pass |
| Done Here records when recurring household chores were completed. | 9 | pass |
| It is for homes that need a visible history instead of scores or overdue badges. | 15 | F-2-1 |
| Chores, notes, and optional photos live in browser storage. | 9 | pass |
| The app works after the first visit without internet. | 9 | pass |
| It exports timezone-aware ICS, PDF, CSV, and a full JSON backup. | 11 | pass |
| Live site | 2 | pass |
| Try the isolated demo | 4 | pass |
| Features | 1 | pass |
| Name chores and repeat each one every 1 to 365 days | 11 | pass |
| Mark a chore done once and see when it was last completed and next due | 15 | pass |
| Optional notes and consent-aware photos | 5 | F-2-2 |
| Monthly completion calendar with keyboard navigation | 6 | pass |
| ICS, PDF, CSV, and JSON export, plus JSON restore | 9 | pass |
| Works without internet after the first visit and can be installed as an app | 14 | pass |
| Separate sample-data demo that does not read or write real calendar or license data | 14 | pass |
| Free core calendar with five photos | 6 | pass |
| $12 one-time Household Pack with storage for 500 photos | 9 | pass |
| The $12 purchase opens Sociobot checkout. | 6 | pass |
| Run locally | 2 | pass |
| Requires Node.js 20.19 or newer. | 5 | pass |
| Open http://localhost:5173. | 2 | pass |
| Use /demo for the sample-data sandbox. | 6 | pass |
| Test and build | 3 | pass |
| Playwright 1.58.2 is pinned because the factory image provides that browser. | 11 | pass |
| The exact production build command is npm run build. | 9 | pass |
| Static output lands in dist/, with dist/index.html at its root. | 10 | pass |
| Individual claim tests are listed in .factory/claims.json. | 7 | pass |
| Deploy | 1 | pass |
| Upload the contents of dist/ to the static host. | 9 | pass |
| The included host settings keep direct links working, show a 404 page for missing addresses, and set security headers. | 19 | pass |
| The factory owns DNS, product registration, and deployment. | 8 | pass |
| Data and privacy | 3 | pass |
| Your real calendar is stored only in this browser. | 9 | pass |
| Demo changes disappear when you reload and never change your real calendar. | 12 | pass |
| No analytics, remote fonts, or third-party runtime scripts are included. | 10 | pass |
| License verification sends only the pasted token to Sociobot. | 9 | pass |
| Read the in-app /privacy and /terms pages before sharing a device or buying the Household Pack. | 16 | pass |
| License | 1 | pass |
| MIT. | 1 | pass |
| See LICENSE. | 2 | pass |

Terminology is otherwise consistent: **chore**, **completion**, **history**,
**note**, **photo**, **due**, and **Household Pack** each have one meaning.

## Demo and sandbox behavior

The demo gate passes.

- One click on **Try it with sample data** opened `/?demo=1` with four named
  chores, seven historical completions, latest-completion dates, due dates,
  and a populated calendar.
- **“Demo — sample data, nothing is saved”**, **Reset demo**, and **Start for
  real** were present.
- Marking a sample chore changed the demo. **Reset demo** restored four sample
  chores and removed that mutation.
- A real chore created before entering the demo had byte-for-byte identical
  IndexedDB data after demo mutation, reset, and **Start for real**.
- The full landing/demo completion/export flow made zero cross-origin
  requests. Offline reload retained all four sample chores and showed the
  offline status.

## Claims

All 23 commands from `.factory/claims.json` were run separately from clean
clone `/tmp/done-here-review-2.AFW6T5`. Every command passed.

| Claim id | Result |
| --- | --- |
| demo-sandbox | PASS |
| one-tap-completion | PASS |
| offline-reload | PASS |
| installable-pwa | PASS |
| no-account | PASS |
| local-data | PASS |
| runtime-privacy | PASS |
| license-token-only | PASS |
| refunded-license | PASS |
| ics-export | PASS |
| pdf-export | PASS |
| csv-export | PASS |
| json-export | PASS |
| no-household-ranking | PASS |
| json-restore | PASS |
| recurrence-bounds | PASS |
| due-status | PASS |
| completion-proof | PASS |
| free-core | PASS |
| keyboard-calendar | PASS |
| photo-tier | PASS |
| paid-photo-cap | PASS |
| accessible-baseline | PASS |

Each id occurs on exactly one test. Landing and README product promises map to
the registry entries for offline use, local data, completion, due status,
exports/restore, recurrence, proof, free and paid limits, checkout, install,
and ranking boundaries. No untested product claim was found. F-2-1 is an
internal copy contradiction, not an unlisted capability claim.

## Earlier finding confirmation

Every earlier review, polish record, and the current handoff were read. Each
review-1 finding was rechecked on the live site and in source.

| Earlier id | Current confirmation |
| --- | --- |
| F-1-1 | Fixed: a cold unknown URL returns HTTP 404 with title, description, canonical, favicon, shared nav/footer, Privacy, Terms, and a return action. |
| F-1-2 | Fixed: “A household record, kept here” is absent; “Recurring chore completion history” is live and in source. |
| F-1-3 | Fixed: “Today’s shelf” is absent; the section is “Calendar preview”. |
| F-1-4 | Fixed: “Three small moves” is absent; “How it works” names the section. |
| F-1-5 | Fixed: “A calmer boundary” is absent; “What Done Here does not do” names the boundary. |
| F-1-6 | Fixed: the public artwork-provenance assertion is absent; provenance remains only in the design record. |
| F-1-7 | Fixed: README now says chores repeat every 1 to 365 days. |
| F-1-8 | Fixed: README now explains mark-done, last-completed, and next-due results in plain words. |
| F-1-9 | Fixed: README states the offline/install outcome without app-shell or manifest jargon. |
| F-1-10 | Fixed: README says the $12 purchase opens Sociobot checkout. |
| F-1-11 | Fixed: README describes browser-local storage without naming IndexedDB. |
| F-1-12 | Fixed: README says demo changes disappear on reload and do not change the real calendar. |
| F-1-13 | Fixed: README describes direct-link, missing-address, and security behavior without host-config jargon. |

No earlier finding is unfixed, half-fixed, or regressed, so no F-1 id is
reopened.

## Structure, accessibility, and links

- `/`, `/app`, `/demo`, `/privacy`, and `/terms` return 200. A cold unknown
  URL returns a designed 404.
- Every checked route has one h1, one main, a route title, description,
  canonical, OG/Twitter metadata, favicon, consistent header/footer, Privacy,
  and Terms.
- History navigation restored the route and focused its h1. The skip link,
  dialog focus trap/return, and keyboard calendar passed.
- All discovered links resolved. The checkout ended on Dodo with 200; the
  deliberate missing route was the only 404.
- Fourteen desktop/mobile route scans produced zero serious/critical Axe
  findings, zero console errors, zero missing alt attributes, and no 390 px
  overflow. All 63 visible demo controls were at least 44 px.
- Reduced motion removed effective transitions. The first-load app document
  is 16.25 KB gzip; the mobile hero is 53.2 KB.
- The live deployment byte-matches the candidate build for the app shell,
  worker, manifest, 404, images, and icons.
- The asymmetric ceramic record, teal completion seals, carved serif type,
  irregular shapes, and original still-life art are recognizably product
  specific. It is not a generic gradient SaaS template.

`npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` passed.
The full test run contained 16 unit passes and 57 Playwright passes with three
intentional project-specific skips. The worker URL verifier reported title,
`lang=en`, one h1, main, complete image alt text, labeled buttons, and no
console errors.

## Missed leverage

No additional AI feature is justified. This is a private, offline completion
record; model use would add cost and disclosure without improving the core
one-tap job. JSON import/restore and ICS, PDF, CSV, and JSON export already
cover the obvious portability need. Multi-device sync would conflict with the
current local-only contract and is not implied by the smallest useful product.

## What would make this perfect

Remove the inaccurate overdue-badge contrast, state the photo consent check
plainly, and rename the license disclosure for the result it produces. Then
rerun the full claims and first-read checks. Nothing else was found.
