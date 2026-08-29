# Adversarial first-read review 1 — FAIL

- Reviewed: 2026-08-29 UTC
- Target: https://chore-proof-calendar.sociobot.in
- Viewports: fresh 390 × 844 mobile and 1280 × 720 desktop browser contexts
- Verdict: **FAIL** — 13 findings remain. This review requires zero findings.

## Cold first read

Before scrolling, both viewports showed **“See when each chore was done”**, **“For households that need a clear history, not another overdue badge.”**, and **“Try it with sample data”** with **“See a filled calendar in one click.”**

Cold interpretation: it records dates recurring household chores were completed; it is for households that need to settle when work was done; click **Try it with sample data** first. This gate passes.

## Findings

### F-1-1 — Minor — Direct 404 lacks the shared site skeleton and route metadata

Exact quote/location: Fresh direct /404 and unknown-url responses are HTTP 404 and have one h1, but their static page has no nav, Privacy, Terms, Built by Param Factory, canonical, description, OG/Twitter metadata, or favicon. Its footer is only “Visible chore history for shared homes. · v1.0.4”.

Why: A visitor arriving through an old link loses the required shared navigation, footer, and route metadata; this differs from the SPA fallback.

Concrete fix: Make not-found.html use the full header/footer and add the route-specific canonical, description, OG/Twitter, and favicon metadata while retaining HTTP 404.

### F-1-2 — Minor — Landing slogan does not name a section

Exact quote/location: Landing eyebrow: “A household record, kept here”.

Why: It is a mood slogan that could appear on many unrelated products.

Concrete fix: Replace with “Recurring chore completion history” or delete it.

### F-1-3 — Minor — Landing metaphor hides the preview purpose

Exact quote/location: Landing preview eyebrow: “Today’s shelf”.

Why: “Shelf” is a product-invented metaphor and does not identify the section out of context.

Concrete fix: Replace with “Calendar preview”.

### F-1-4 — Minor — Landing mood heading does not name the how-to section

Exact quote/location: Landing steps eyebrow: “Three small moves”.

Why: It supplies tone rather than usable information in a heading list.

Concrete fix: Replace with “How it works” and remove the duplicate h2, or remove the eyebrow.

### F-1-5 — Minor — Landing mood heading obscures the product boundary

Exact quote/location: Landing boundary eyebrow: “A calmer boundary”.

Why: It does not say what the boundary is.

Concrete fix: Replace with “What Done Here does not do”.

### F-1-6 — Minor — Public provenance assertion is not a declared claim

Exact quote/location: Landing footer: “Ceramic artwork generated for this product.” No claims registry entry names or tests this visitor-facing provenance assertion.

Why: The design document is useful provenance but not a declared sandbox test.

Concrete fix: Remove it from visitor-facing copy while retaining design provenance, or add a claim and observable provenance test.

### F-1-7 — Minor — README uses unexplained recurrence jargon

Exact quote/location: README Features: “Named chores with a recurrence from 1 to 365 days”.

Why: “Recurrence” is less clear than a plain action.

Concrete fix: Replace with “Name chores and repeat each one every 1 to 365 days.”

### F-1-8 — Minor — README combines awkward internal terms

Exact quote/location: README Features: “One-tap completion with immediate last-done and calendar-day due dates”.

Why: The three terms are hard to parse and “immediate” is an unmeasured promise.

Concrete fix: Replace with “Mark a chore done once and see when it was last completed and next due.”

### F-1-9 — Minor — README uses PWA implementation jargon

Exact quote/location: README Features: “Offline app shell and installable PWA manifest”.

Why: A household visitor needs the outcome, not “app shell” or “manifest”.

Concrete fix: Replace with “Works without internet after the first visit and can be installed as an app.”

### F-1-10 — Minor — README describes checkout with API jargon

Exact quote/location: README: “The paid link uses the Sociobot billing API.”

Why: “Billing API” does not tell a buyer what the link does.

Concrete fix: Replace with “The $12 purchase opens Sociobot checkout.”

### F-1-11 — Minor — README privacy copy exposes storage implementation jargon

Exact quote/location: README: “Real data uses IndexedDB database done-here:v1.”

Why: The database name and IndexedDB are not useful to a first-time household visitor.

Concrete fix: Replace with “Your real calendar is stored only in this browser.” Put the identifier in developer troubleshooting text if needed.

### F-1-12 — Minor — README demo copy uses implementation jargon

Exact quote/location: README: “Demo data stays in memory and resets on reload.”

Why: “Stays in memory” is less clear than the privacy outcome.

Concrete fix: Replace with “Demo changes disappear when you reload and never change your real calendar.”

### F-1-13 — Minor — README deployment instruction is host-config jargon

Exact quote/location: README Deploy: “The included staticwebapp.config.json provides history fallback, a 404 rewrite, and security headers.”

Why: It makes the deployer translate implementation terms instead of stating the result.

Concrete fix: Replace with “The included host settings keep direct links working, show a 404 page for missing addresses, and set security headers.”

## Copy audit

Counts use whitespace-separated words. Headings, buttons, labels, alt text, and feature-list fragments are included so the audit covers all reader-facing landing and README copy. No item exceeds 22 words.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| A household record, kept here | 5 | F-1-2 |
| See when each chore was done | 6 | pass |
| For households that need a clear history, not another overdue badge. | 11 | pass |
| Try it with sample data | 6 | pass |
| See a filled calendar in one click. | 7 | pass |
| Create your first chore | 4 | pass |
| Works after the first visit without internet. | 7 | pass |
| Chore records stay in this browser. | 6 | pass |
| $12 once raises photo storage from 5 to 500. | 9 | pass |
| The calendar is free. | 4 | pass |
| Five handmade ceramic tiles form a weekly record with one teal completion mark. | 13 | pass |
| Each completion leaves a dated mark you can return to. | 10 | pass |
| Today’s shelf | 2 | F-1-3 |
| Last done stays visible | 4 | pass |
| Each chore shows its latest completion and next due date. | 10 | pass |
| Water the houseplants | 3 | pass |
| Last done Aug 26, 2026 | 5 | pass |
| Change the bed sheets | 4 | pass |
| Last done Aug 24, 2026 | 5 | pass |
| Clear the fridge shelf | 4 | pass |
| Last done Aug 18, 2026 | 5 | pass |
| Three small moves | 3 | F-1-4 |
| How the record works | 4 | pass |
| Name the chore | 3 | pass |
| Choose how many days pass before it is due again. | 10 | pass |
| Mark it done | 3 | pass |
| Save the time in one tap. | 7 | pass |
| Add a note or photo when useful. | 7 | pass |
| Read the history | 3 | pass |
| Use the calendar or export the record as ICS, PDF, CSV, or JSON. | 12 | pass |
| A calmer boundary | 3 | F-1-5 |
| Proof without household scoring | 4 | pass |
| Done Here does not rank people, assign points, or watch children. | 11 | pass |
| It records the chore, time, note, and optional photo you choose. | 11 | pass |
| Household Pack | 2 | pass |
| Keep up to 500 photo proofs | 6 | pass |
| Pay $12 once to store up to 500 photos. | 9 | pass |
| Chores, notes, and every export stay free. | 7 | pass |
| Buy Household Pack — $12 | 4 | pass |
| Have a license? | 3 | pass |
| Paste it | 2 | pass |
| Visible chore history for shared homes. | 6 | pass |
| Ceramic artwork generated for this product. | 6 | F-1-6 |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Done Here records when recurring household chores were completed. | 9 | pass |
| It is for homes that need a visible history instead of scores or overdue badges. | 15 | pass |
| Chores, notes, and optional photos live in browser storage. | 9 | pass |
| The app works after the first visit without internet. | 9 | pass |
| It exports timezone-aware ICS, PDF, CSV, and a full JSON backup. | 11 | pass |
| Live site | 2 | pass |
| Try the isolated demo | 4 | pass |
| Named chores with a recurrence from 1 to 365 days | 10 | F-1-7 |
| One-tap completion with immediate last-done and calendar-day due dates | 9 | F-1-8 |
| Optional notes and consent-aware photos | 5 | pass |
| Monthly completion calendar with keyboard navigation | 6 | pass |
| ICS, PDF, CSV, and JSON export, plus JSON restore | 9 | pass |
| Offline app shell and installable PWA manifest | 7 | F-1-9 |
| Separate sample-data demo that does not read or write real calendar or license data | 14 | pass |
| Free core calendar with five photos | 6 | pass |
| $12 one-time Household Pack with storage for 500 photos | 8 | pass |
| The paid link uses the Sociobot billing API. | 7 | F-1-10 |
| Requires Node.js 20.19 or newer. | 5 | pass |
| Open http://localhost:5173. | 2 | pass |
| Use /demo for the sample-data sandbox. | 6 | pass |
| Playwright 1.58.2 is pinned because the factory image provides that browser. | 11 | pass |
| The exact production build command is npm run build. | 9 | pass |
| Static output lands in dist/, with dist/index.html at its root. | 10 | pass |
| Individual claim tests are listed in .factory/claims.json. | 8 | pass |
| Upload the contents of dist/ to the static host. | 9 | pass |
| The included staticwebapp.config.json provides history fallback, a 404 rewrite, and security headers. | 12 | F-1-13 |
| The factory owns DNS, product registration, and deployment. | 8 | pass |
| Real data uses IndexedDB database done-here:v1. | 6 | F-1-11 |
| Demo data stays in memory and resets on reload. | 9 | F-1-12 |
| No analytics, remote fonts, or third-party runtime scripts are included. | 10 | pass |
| License verification sends only the pasted token to Sociobot. | 9 | pass |
| Read the in-app /privacy and /terms pages before sharing a device or buying the Household Pack. | 15 | pass |
| MIT. | 1 | pass |
| See LICENSE. | 2 | pass |

Terminology is otherwise consistent: **chore**, **completion**, **history**, **note**, **photo**, **due**, and **Household Pack**. All observed buttons name a result-bearing action; the sample-data action is clear and primary.

## Demo, privacy, and claims

The demo gate passes. Clicking **Try it with sample data** opened a filled calendar with four realistic chores and seven completion records on the first screen. The persistent banner read **“Demo — sample data, nothing is saved”** and included **Reset demo** and **Start for real**. Marking a demo chore and resetting it did not alter a pre-existing real chore; exiting showed that real chore again. During this flow the request log contained no cross-origin requests, and the real IndexedDB database and local-storage values were unchanged.

Every command in claims.json was invoked separately after npm ci; all 23 passed. npm test, npm run lint, npm run typecheck, and npm run build also passed locally.

## History confirmation

There are no earlier review or polish files. I read the existing handoff and verification history and rechecked its earlier defect classes from scratch.

| Earlier defect class | Current confirmation |
| --- | --- |
| clean-clone claim commands | all 23 exact commands passed after npm ci |
| demo reads/writes real data or loses data on exit | a real chore survived demo mutation, reset, Start for real, and reload |
| mobile target/calendar accessibility regressions | full mobile Playwright suite passed; no 390 px overflow observed |
| malformed backup/export/recurrence/due-date defects | covered by the passing current regression and claim suite |
| checkout, privacy, and third-party runtime requests | checkout link resolves; demo request log had zero cross-origin requests |
| previous HTTP-404/unknown-route failure | direct /404 and an unknown URL now return HTTP 404 and a designed page; F-1-1 records the remaining shell/metadata gap |

## Structure and leverage checks

Home, app, demo, privacy, and terms had route-specific titles, one h1, one main, descriptions, canonicals, no console errors, and no 390 px horizontal overflow. Back navigation restored the home route and placed focus on its h1. Robots, sitemap, favicon, OG/Twitter image metadata, links, and the live checkout path resolved. The visual identity is distinct from a generic SaaS template and follows the ceramic design thesis.

No additional AI feature is expected: the brief is a private offline record, and an AI step would not improve the central job. Export and restore already exist. Sync would conflict with the local-first privacy promise unless it were an explicit optional product expansion.

## What would make this perfect

Use one complete direct 404 skeleton, remove the remaining mood/jargon copy, and either test or remove the public artwork-provenance assertion. Then rerun the full claim suite and this first-read checklist with zero findings.
