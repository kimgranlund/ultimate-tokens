# Shell roles: text, control anatomy, container composition and glyph motion

The editor shell's standard tables (T-0044, ADR-036). The source is `src/ui/shell-roles.mjs`: `UI_ROLES`,
`CONTROL_ANATOMY`, `CONTAINER_COMPOSITION` and `MOTION`, pure and DOM-free, checked by `test/ui/shell-roles.mjs`.
Every px below comes from one Maison ladder cell (the [geometry reference](README.md)); this page copies
the tables with their px at three cells, so a reader needs no node session to see what the chrome draws.

The shell's cell is `shellGeometry` (`src/ui/app.js`), an app preference that is never doc-bound:

| `shellGeometry` | Settings label | The shell's cell |
|---|---|---|
| `null` (fresh install, Reset) | Default | `SHELL_DEFAULT_GEOMETRY`: product tier, sm scale, round, size md (product-sm-md) |
| `"kit"` | Follow kit | the document's `doc.geometry`, else `DEFAULT_GEOMETRY` (the gallery has no doc) |
| `{ tier, scale, radius }` | Custom | a pinned cell on this device |

The three columns used below:

| Cell | Height | Inset | Icon | Text | Part height / inset | Chip height / inset / text | Radius control / inset / card |
|---|---|---|---|---|---|---|---|
| product-sm-md (the default) | 28 | 7 | 14 | 13 | 21 / 3.5 | 20 / 4.5 / 10 | 13 / 9.5 / 16.5 |
| product-md-md (the kit default) | 32 | 8 | 16 | 14 | 24 / 4 | 24 / 5.5 / 12 | 14 / 10 / 18 |
| content-lg-md (the stress cell) | 64 | 16 | 32 | 22 | 48 / 8 | 48 / 12 / 18 | 22 / 14 / 30 |

## UI_ROLES: the nine text roles

A role's size is a ladder row step, not a px: step 0 is the cell's own control text, step -1 the next
shorter ladder row's UI text, and so on (`roleText(cell, step, uiTextAt)`, clamped at the last row);
`badge` is the cell's compact row (`chipText`). The steps are computed in JS because CSS cannot index the
UI_TEXT table and a `calc()` offset would not follow the body-base factor. `shellRolesCSS` writes the
four step sizes per host (`--ui-text-step-0` to `--ui-text-step-3`, with `--ui-badge-icon` and `--ui-edge`)
into the host's head style; the role custom properties live once in the `--sh-*` alias block of
`src/ui/styles.css`.

Each role is four custom properties: `--ui-<role>-font` (a `font` shorthand), `--ui-<role>-tracking`,
`--ui-<role>-case` and `--ui-<role>-ink`. A shell rule reads all four and sets nothing else about text.

| Role | Font var | Step | px at product-sm-md / product-md-md / content-lg-md | Weight | Line-height | Tracking | Case | Ink | Covers |
|---|---|---|---|---|---|---|---|---|---|
| pane-title | `--ui-pane-title-font` | 0 | 13 / 14 / 22 | 600 | 1 | 0 | none | `--ink` | pane headers, drawer and settings page heads, inspector titles |
| element-title | `--ui-element-title-font` | -1 | 12 / 13 / 21 | 600 | 1.2 | 0 | none | `--ink` | titles inside a pane: settings row titles, story names, example artifact titles |
| kicker | `--ui-kicker-font` | -2 | 11 / 12 / 20 | 700 | 1 | .06em | uppercase | `--ink-dim` | group headers and section kickers (`.sub-head`, settings nav groups, the Examples toggle) |
| label | `--ui-label-font` | -1 | 12 / 13 / 21 | 500 | 1.3 | 0 | none | `--ink-dim` | field, checkbox, radio and switch labels |
| control | `--ui-control-font` | 0 | 13 / 14 / 22 | 500 | 1 | 0 | none | `--ink` | buttons, text inputs, selects, segmented parts, interactive chips, settings nav items |
| badge | `--ui-badge-font` | badge | 10 / 12 / 18 | 600 | 1 | .02em | none | `--ink-dim` | badges and tags: the badge `span.chip`, `.acct-badge`, `.radix-badge`, `.tok-sub`, `.geom-chip`, `.key-slot .key-place` |
| helper | `--ui-helper-font` | -2 | 11 / 12 / 20 | 400 | 1.4 | 0 | none | `--ink-dim` | captions, notes, footers, the toast |
| body | `--ui-body-font` | 0 | 13 / 14 / 22 | 400 | 1.5 | 0 | none | `--ink` | running copy: the host's body text, settings prose, dialog ledes |
| code | `--ui-code-font` | -1 | 12 / 13 / 21 | 400, `--mono` | 1.4 | 0 | none | `--ink` | token names and code blocks |

Weights for a rule that only sets a weight: `--ui-weight-regular` 400, `--ui-weight-medium` 500,
`--ui-weight-strong` 600 (the `.on` and `.primary` state weight), `--ui-weight-heavy` 700.

## CONTROL_ANATOMY: one row per control kind

I is the cell's icon, P its inset, H its height. The interactive chip is a control (the user's
2026-10-09 ruling); only the badge uses the compact chip row.

| Kind | Height | Inset | Gap | Glyph box | Caret | Radius | product-sm-md px |
|---|---|---|---|---|---|---|---|
| button | H | P | P/2 | I | none | radiusControl | 28 / 7 / 3.5 / 14 / r13 |
| icon-only | H square, ghost | 0 | none | I, centered | none | radiusControl | 28x28, glyph 14 |
| input | H | P | P/2 | I | none | radiusControl | 28 / 7 / 14 / r13 |
| select | H | P, end lane I + P (`--select-lane`) | none | none | 0.6I wide, the caret-down glyph, static | radiusControl | lane 21, caret 8.4 |
| trigger (button + caret) | H | P | P/2 | I | a `.caret` at I that turns 180deg on `[aria-expanded="true"]` | radiusControl | 28 / 7 / 14, caret 14 |
| chip (interactive, `button.chip`) | H | P | P/2 | I | none | H/2, a pill | 28 / 7 / 3.5 / 14 / r14 |
| badge (`span.chip` and the tags) | chip height | chip inset | chip inset / 2 | chip height - 2 chip inset (`--ui-badge-icon`) | none | chip height / 2 | 20 / 4.5 / 2.25 / 11 / r10 |
| switch | track I tall, 1.75I wide | 0, label gap P | P | thumb I - 2e, e = `--ui-edge` = max(1, round(I/8)) | none | I/2 | track 24.5x14, thumb 10, e 2 |
| range | thumb 1.25I (`--ctl-range-thumb`) | 0 | none | track 0.4I (`--ctl-range-track`) | none | circle thumb, pill track | track 5.6, thumb 17.5 |

The same kinds at product-md-md: button 32 / 8 / 4 / 16 / r14; select lane 24, caret 9.6; badge 24 / 5.5 /
2.75 / 13 / r12; switch track 28x16, thumb 12, e 2. At content-lg-md: button 64 / 16 / 8 / 32 / r22; select
lane 48, caret 19.2; badge 48 / 12 / 6 / 24 / r24; switch track 56x32, thumb 24, e 4.

Which `.chip` uses are which (the `chip()` helper in `src/ui/app-helpers.mjs` emits `button` or `span`):

- Controls, `chip(..., { mode: "interactive" })` and so `button.chip`: the damp presets (`.damp-presets`,
  `src/ui/sections/color.js`), the breakpoint width quick-picks (`.mode-preset`, `src/ui/app.js`), the export
  systems (`.sys-chip`, `src/ui/overlays/drawer.js`).
- Badges, `span.chip`: the mapping drift summary (`.in-sync`/`.has-drift`). `.acct-badge`, `.radix-badge`,
  `.tok-sub`, `.geom-chip` and `.key-slot .key-place` are badges on the same role.
- Not text chips: `.newpal-chip` (a 32px swatch toggle), `.geom-ex-chip` (a specimen), `.tile-tag` (the gallery).

Glyph boxes in code: `icon(name)` (or `size: "control"`) follows `--sh-control-icon`; `icon(name, { size:
"badge" })` follows `--ui-badge-icon`; a numeric size is left only on the gallery (trash 13, plus 22, the
category back caret 13) and on the Geometry specimens painted at a kit cell.

The select caret: a native `<select>` takes no child, so its caret is a background image. `--select-caret`
holds the caret-down path (`icons.js` `ICONS["caret-down"]`, cropped to its 176 by 96 box) as one data-URI
per scheme, filled with the chrome's `--ink-dim` (the default theme's neutral 750 in light, 250 in dark),
because a data-URI cannot read a var. The kit specimen select builds its own from its palette with
`selectCaret(fill)`. `test/repo/ui-polish.mjs` pins the path and both fills.

## CONTAINER_COMPOSITION: one law for a container of parts

The law: container radius = part radius + container padding, so the corners stay concentric (ADR-033).

| Container | Padding | Radius | Part height | Part inset | Part radius | product-sm-md px |
|---|---|---|---|---|---|---|
| segmented (`.segmented`, `.figma-files`, `.radix-files`) | partInset (minus the 1px border) | radiusControl | H - P | partInset | radiusInset | pad 3.5, r13; part 21, r9.5 |
| tab-row | partInset | radiusControl | H - P | partInset | radiusInset | same as segmented |
| menu (`.tools-menu`, listbox, popover) | partInset | radiusCard = radiusControl + partInset | H | P | radiusControl | pad 3.5, r16.5; part 28, r13 |
| input-group (none in the shell yet) | 0 | radiusControl outside | H | P | radiusControl on free corners, 0 at the join | r13 |
| switch-track | e | I/2 | I - 2e | e | half the thumb | pad 2, r7; thumb 10, r5 |

At product-md-md: segmented pad 4, r14, part 24, r10; menu pad 4, r18, part 32, r14. At content-lg-md:
segmented pad 8, r22, part 48, r14; menu pad 8, r30, part 64, r22.

## MOTION: the glyph motion set

| Token | Value | Used by |
|---|---|---|
| `--ui-motion-fast` | 120ms | the disclosure caret turn, the switch track and thumb, the swatch toggle, the toast |
| `--ui-motion-base` | 180ms | the pane collapse (`.editor` `grid-template-columns`) |
| `--ui-motion-ease` | `cubic-bezier(.2, 0, 0, 1)` | every shell transition |

A listbox check mark would take `--ui-motion-fast`; the shell has none yet (its selects are native).
Reduced motion needs no rule of its own: Settings, Appearance, Motion Reduced (`[data-motion="reduced"]`)
and Motion System under `prefers-reduced-motion: reduce` force `transition-duration: 0.01ms !important` on
every descendant of the host. Smoke reads the caret's computed duration under both.

## The gate and its allow-list

`test/repo/shell-text.mjs` fails a shell rule that sets a literal font size, weight, letter-spacing,
text-transform or line-height (other than 1, normal, inherit or 0), or a `font` shorthand with no `var(`;
on the control and container kinds it also fails a literal padding, gap or border-radius (a `50%` circle
and a padding of exactly `calc(var(--role) - 1px)`, the border a compound container sits inside, pass).
Negative controls run first, so the gate cannot pass vacuously. Allowed selectors, with the reasons the
gate prints:

| Needle | Reason |
|---|---|
| `.ex-`, `.geom-ex-`, `.geom-glyph`, `.geom-caret` | a specimen painted at a kit cell |
| `.geom-ctl` | the ramp's live mock control, sized by inline style |
| `.gallery-`, `.masthead`, `.category-`, `.categories-`, `.set-`, `.tile-`, `.new-tile`, `.figma-import-row`, `.preset-vol` | the gallery is a content page, not the editor chrome |
| `.brand` | the wordmark is a logotype |
| `.drag-handle::before`, `.radix-step::after` | a drawn glyph |
| `.ch-`, `.an-svg` | chart marks own their scale (T-0029) |
| `body` (exactly) | the page outside the host, kept as the pre-host fallback; the host rule declares the body role |

Two selectors carry a specimen prefix but are shell chrome and stay gated: `.ex-collapse-toggle` and
`.ex-artifact-title`. Layout `gap` and `padding` on panes and cards are outside the gate; that is the
container tier of the geometry engine, a separate law.
