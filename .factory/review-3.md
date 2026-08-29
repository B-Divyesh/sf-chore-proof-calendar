# Adversarial first-read review 3 — PASS

- Reviewed: 2026-08-29 UTC
- Target: <https://chore-proof-calendar.sociobot.in>
- Candidate: `3398527bc17aa0dc844a306f5ad066248a73fa2a`
- Viewports: fresh 390 × 844 mobile and 1440 × 900 desktop contexts
- Verdict: **PASS — zero findings and zero untested product claims.**

## Cold first read

Before scrolling, both viewports showed **“See when each chore was done”**,
**“For households that need a clear record of when recurring work was
finished.”**, and **“Try it with sample data”**. The action was accompanied by
**“See a filled calendar in one click.”** The three short facts about offline
use, browser-local records, and price were also visible.

Cold interpretation, recorded before scrolling:

- What it does: records when recurring household chores were completed.
- For whom: households that need a shared completion history.
- First click: **Try it with sample data** to open a filled calendar.

The first-read gate passes at both widths. Evidence: [mobile screenshot](evidence-review-3/cold-mobile.png),
[desktop screenshot](evidence-review-3/cold-desktop.png), and
[`cold-first-read.json`](evidence-review-3/cold-first-read.json).

## Findings

None.

## Copy audit

Counts use whitespace-separated words. The inventory includes headings,
actions, labels, alt text, captions, and list fragments; repeated navigation
and footer labels are listed once. No item exceeds 22 words. No banned word,
marketing adjective, unexplained metaphor, mood heading, inconsistent product
term, or non-result-naming button was found.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Done Here — See when each chore was done | 9 | pass — title |
| Record recurring household chores with notes, photos, due dates, and a compact calendar history. | 14 | pass — metadata |
| No account needed. | 3 | pass — metadata |
| Skip to main content | 4 | pass |
| Done Here | 2 | pass |
| Calendar | 1 | pass |
| Demo | 1 | pass |
| Privacy | 1 | pass |
| Recurring chore completion history | 4 | pass |
| See when each chore was done | 6 | pass |
| For households that need a clear record of when recurring work was finished. | 13 | pass |
| Try it with sample data | 5 | pass |
| See a filled calendar in one click. | 7 | pass |
| Create your first chore | 4 | pass |
| Works after the first visit without internet. | 7 | pass |
| Chore records stay in this browser. | 6 | pass |
| $12 once raises photo storage from 5 to 500. | 9 | pass |
| The calendar is free. | 4 | pass |
| Five handmade ceramic tiles form a weekly record with one teal completion mark. | 13 | pass — image alt |
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
| No household scoring | 3 | pass |
| Done Here does not rank people, assign points, or watch children. | 11 | pass |
| It records the chore, time, note, and optional photo you choose. | 11 | pass |
| Household Pack | 2 | pass |
| Keep up to 500 photo proofs | 6 | pass |
| Pay $12 once to store up to 500 photos. | 9 | pass |
| Chores, notes, and every export stay free. | 7 | pass |
| Buy Household Pack — $12 | 5 | pass |
| Enter a license | 3 | pass |
| Visible chore history for shared homes. | 6 | pass |
| Terms | 1 | pass |
| Built by Param Factory (external) | 5 | pass |
| v1.0.6 | 1 | pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Done Here | 2 | pass |
| Done Here records when recurring household chores were completed. | 9 | pass |
| It is for homes that need a visible history without scores. | 11 | pass |
| Chores, notes, and optional photos live in browser storage. | 9 | pass |
| The app works after the first visit without internet. | 9 | pass |
| It exports timezone-aware ICS, PDF, CSV, and a full JSON backup. | 11 | pass |
| Live site | 2 | pass |
| Try the isolated demo | 4 | pass |
| Features | 1 | pass |
| Name chores and repeat each one every 1 to 365 days | 11 | pass |
| Mark a chore done once and see when it was last completed and next due | 15 | pass |
| Optional notes and photos, with a checkbox to confirm consent | 10 | pass |
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

Terminology remains consistent: **chore** is the recurring task,
**completion** is the saved event, **history** is the dated record, **note**
and **photo** are optional context, **due** is the repeat date, and
**Household Pack** is the paid license.

## Demo and sandbox behavior

The demo gate passes.

- The first-screen action opens `/?demo=1` in one click.
- The first demo screen already shows four realistic chores, their last-done
  and next-due dates, and a populated calendar with seven completions.
- **“Demo — sample data, nothing is saved”**, **Reset demo**, and **Start for
  real** remain visible. Marking a chore changes the demo; Reset restores the
  original four chores and seven completions.
- A direct demo session with real license/local-preference sentinels left every
  localStorage value byte-for-byte unchanged, created no IndexedDB database,
  and made no cross-origin request.
- A separate live flow created and completed a real chore, mutated and reset
  the demo, then exited. The real IndexedDB rows were byte-for-byte unchanged
  and the real chore remained visible.
- Offline reload retained the four sample chores and displayed **“Offline.
  Your calendar still works here.”**

Evidence: [first demo screen](evidence-review-3/demo-first-screen-mobile.png),
[`demo-direct-isolation.json`](evidence-review-3/demo-direct-isolation.json),
[`demo-real-data-live.json`](evidence-review-3/demo-real-data-live.json),
[`demo-exit-live.json`](evidence-review-3/demo-exit-live.json), and
[`browser-matrix-live.json`](evidence-review-3/browser-matrix-live.json).

## Claims

All 23 exact commands in `.factory/claims.json` were run separately after
`npm ci` in clean clone `/tmp/chore-proof-review3.PUxIUE` at candidate commit
`3398527bc17aa0dc844a306f5ad066248a73fa2a`. Every command passed.

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

Each claim id appears on exactly one tagged test. Landing and README product
statements map to the registry entries for demo isolation, one-tap completion,
offline/install behavior, account-free and local use, runtime privacy, license
handling, every export and restore path, recurrence bounds, due dates, optional
proof, free/paid limits, checkout, keyboard use, and the no-ranking boundary.
No unlisted product claim or untested claim was found. Full command output is
in [`claims-clean-clone.json`](evidence-review-3/claims-clean-clone.json).

## Earlier finding confirmation

Every earlier `.factory/review-*.md`, `.factory/polish-*.md`, and the previous
handoff was read. Each earlier finding was rechecked on the live deployment
and in source, rather than accepted from its closure note.

| Earlier id | Current live and source confirmation |
| --- | --- |
| F-1-1 | Fixed: a cold unknown URL returns HTTP 404 with the full header/footer, legal links, metadata, favicon, and return action. |
| F-1-2 | Fixed: the landing label is “Recurring chore completion history”; the mood slogan is absent. |
| F-1-3 | Fixed: the preview label is “Calendar preview”; “Today’s shelf” is absent. |
| F-1-4 | Fixed: the section label is “How it works”; “Three small moves” is absent. |
| F-1-5 | Fixed: “What Done Here does not do” names the boundary; the mood label is absent. |
| F-1-6 | Fixed: no public generated-art assertion remains; provenance stays in the design record. |
| F-1-7 | Fixed: README says to repeat a chore every 1 to 365 days. |
| F-1-8 | Fixed: README plainly states the mark-done, last-completed, and next-due result. |
| F-1-9 | Fixed: README states the offline/install outcome without PWA implementation jargon. |
| F-1-10 | Fixed: README says the purchase opens Sociobot checkout. |
| F-1-11 | Fixed: README describes browser-local storage without an internal database name. |
| F-1-12 | Fixed: README states the demo reset and real-calendar isolation outcome. |
| F-1-13 | Fixed: README describes the host behavior without configuration jargon. |
| F-2-1 | Fixed: live/source copy no longer denies the overdue state that the app can show. |
| F-2-2 | Fixed: README names the consent checkbox instead of “consent-aware” jargon. |
| F-2-3 | Fixed: “Enter a license” accurately names the disclosure result. |

No earlier finding is unfixed, half-fixed, or regressed. The production shell,
worker, manifest, 404 document, imagery, and icons byte-match the candidate
build; see [`response-identity-live.json`](evidence-review-3/response-identity-live.json).

## Structure, accessibility, and visual identity

- `/`, `/app`, `/demo`, `/privacy`, and `/terms` return 200. A cold unknown
  URL returns a designed HTTP 404.
- Every checked route has the required route-specific title, one h1, one main,
  description, canonical, OG/Twitter metadata, favicon, shared header/footer,
  Privacy, Terms, skip link, and route announcement.
- Direct deep links render the correct route. Forward and Back history
  navigation restore the correct route and focus its h1.
- Every discovered internal link returns 200. The checkout returns the
  expected 303 to Dodo; the external factory link returns 200.
- Fourteen desktop/mobile route scans found zero serious/critical Axe issues,
  console errors, missing alt attributes, or horizontal overflow. All 63
  visible mobile controls measured at least 44 × 44 px. Keyboard calendar,
  dialog trapping/return, skip-link focus, reduced motion, offline state, and
  200% reflow checks pass.
- `robots.txt` and `sitemap.xml` cover all public routes. Response headers put
  `frame-ancestors` in CSP, set the privacy/security headers, and apply the
  expected cache policies.
- The asymmetric porcelain surfaces, teal glaze marks, serif/sans pairing,
  irregular ceramic radii, and original still-life art form a recognizable
  product identity rather than a generic SaaS template.
- The production document is 16.20 KB gzip and contains the app JavaScript,
  comfortably inside the static-product budget.

Evidence: [`structure-live.json`](evidence-review-3/structure-live.json),
[`browser-matrix-live.json`](evidence-review-3/browser-matrix-live.json),
[`verify.json`](evidence-review-3/verify.json), and
[`missing-route-headers.txt`](evidence-review-3/missing-route-headers.txt).

## Quality gates

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm test`: PASS — 17 unit tests and 57 Playwright tests passed; three
  intentional project-specific cases were skipped.
- `npm run build`: PASS — `dist/index.html` produced at 16.20 KB gzip.
- Worker URL verifier: PASS — title, `lang=en`, one h1, main, alt text,
  labeled buttons, and no console errors.

## Missed leverage

No additional feature is implied strongly enough to add. JSON restore and
ICS, PDF, CSV, and JSON exports cover the obvious portability need. Sync would
change the local-only privacy contract and require an explicit product-scope
decision. An AI step would add key handling, cost, and disclosure without
improving the central one-tap completion record, so omitting it is appropriate.

## What would make this perfect

Nothing remains within the brief, attached review skills, or factory product
contract. The first screen is clear, the isolated demo proves the job in one
click, every public product claim is registered and passing, the complete
workflow works locally and live, and no minor copy, routing, accessibility,
privacy, visual, or scope gap was found.
