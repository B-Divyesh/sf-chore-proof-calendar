# Done Here — visual thesis

## Direction

**Glacial minimal ceramics.** Done Here treats each completion like a small,
durable mark pressed into clay. The interface uses cool mineral whites, deep
ink, rounded ceramic forms, and thin hand-cut rules. It feels calm enough for
a shared kitchen wall and exact enough to settle “when was that done?” without
turning household work into a score.

The layout is intentionally asymmetric. A narrow “kiln stamp” rail carries
dates while large, quiet surfaces hold the record. Dense dashboard chrome,
leaderboards, avatars, confetti, and generic gradient hero panels are excluded.

## Tokens

| Role | Token | Value | Use |
| --- | --- | --- | --- |
| Frost background | `--ice-50` | `#F4F7F5` | page field |
| Porcelain surface | `--clay-0` | `#FFFEF9` | cards and sheets |
| Glaze blue | `--glaze-600` | `#356B78` | primary actions and focus |
| Deep glaze | `--glaze-800` | `#173F49` | action hover and dark surface |
| Kiln ink | `--ink-900` | `#172B2D` | primary text |
| Slate | `--slate-600` | `#54666A` | secondary text |
| Celadon | `--celadon-200` | `#CFE2DC` | completed state |
| Ochre | `--ochre-600` | `#8A5A13` | due-soon state |
| Brick | `--brick-700` | `#8B3A32` | errors and overdue state |
| Hairline | `--line` | `#CDD8D6` | separators |

All body-text combinations meet 4.5:1. Status never relies on color: labels,
dates, and shapes repeat the meaning. The product is deliberately light-mode
only: its thesis is a physical porcelain record, so the background is always
painted explicitly.

## Typography

- Display: Georgia with a local serif fallback. Its carved terminals suggest
  ceramic maker’s marks without adding a font download.
- Interface and body: system sans (`Inter`-like platform stack). It remains
  clear at 16px on a busy phone.
- Dates and counts use tabular figures and restrained letter spacing.
- Scale: 14, 16, 18, 24, 36, 56px. Reading measure never exceeds 68 characters.

## Spacing and shape

- Base unit: 8px; half-step 4px only for tight label groups.
- Section rhythm: 64px mobile, 96px desktop.
- Content max: 1180px. Reading copy max: 68ch.
- Buttons and inputs are at least 48px tall.
- At 390px, the calendar runs edge to edge inside its ceramic panel. Its seven
  day targets remain at least 44px wide with 8px between them. Narrower screens
  scroll the calendar grid without widening the page.
- Main sheets use uneven `28px 12px 30px 14px` radii, like hand-finished ware.
- Completion marks are circular glaze impressions. Due markers are squared
  stamps. Photos have a clipped archival-corner treatment.

## Interaction grammar

- “Mark done” presses a circular glaze seal into the current day. The event
  appears beside its originating chore, preserving spatial continuity.
- Editing uses a native dialog with focus return. Destructive actions require
  the named item and offer an undo where practical.
- Calendar days use buttons. Arrow keys move between days; Enter opens that
  day’s completions.
- Offline and demo state appear as quiet clay labels, never blocking work.

## Motion policy

The signature motion is a 220ms **glaze press**: the new completion scales from
0.92 to 1 while its shadow settles upward. Page changes use a 160ms opacity
transition. No motion loops. With `prefers-reduced-motion: reduce`, movement is
removed and state changes are immediate.

## Asset plan and provenance

The hero uses one original generated still life: five cool porcelain date
tiles, one bearing a teal glaze impression, on a pale mineral surface. It
explains the product’s compact record without depicting capabilities the app
does not have. The same crop supplies the 1200×630 social preview. App icons
and interface marks are hand-authored SVG geometric forms.

### Prompt sheet

- Subject: five small handmade porcelain date tiles arranged as a calm weekly
  record; one tile has a teal circular glaze thumbprint; a folded linen chore
  note sits partly outside the composition.
- World: quiet domestic workbench, no people.
- Materials: matte porcelain, translucent celadon glaze, pale limestone,
  natural linen.
- Light and lens: cool northern window light, soft long shadows, editorial
  still-life photography, 50mm lens, shallow but readable focus.
- Palette words: frost, porcelain, deep teal, celadon, kiln ink.
- Composition: wide landscape with negative space on the left; useful detail
  on the right; no interface mockup.
- Negative list: no text, letters, numbers, logos, watermark, hands, brands,
  screens, gradients, clutter, glossy plastic, perfect CGI symmetry.

Generation command: `/opt/fleet/lib/gen-image.sh`, deployment
`factory-image`, 2026-08-28. Generated imagery is original to Done Here and is
used under the repository’s MIT license. The exact prompt is stored beside the
source image in `assets/src/hero-ceramics.json`.
