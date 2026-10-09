<!-- role=architect level=L1 model=fable effort=high -->
## Approach
Measured inventory first (script over `src/ui/styles.css`, rule-parsed, `var(` values excluded; inline styles in `src/ui/**/*.js` grepped): 591 literal declarations, of which font-size 153, font-weight 69, letter-spacing 19, text-transform 20, line-height 31, padding 99, gap 137, border-radius 49, glyph sizes 13, font shorthand 1. By selector kind: other/text 291, specimens (`.ex-`/`.geom-ex-`) 56, drawer/dialog 44, canvas/ramp 43, tables 28, labels 27, gallery 24, charts 21, pane headers 17, inputs 11, kickers 10, helpers 7, buttons 4, icon-only 4, chips 2, body 1, segmented 1. Buttons, inputs, selects and segments already carry zero literal font-sizes (T-0027), so the debt is in text that is not a control, and in layout gap/padding. The 153 font-size literals cluster at 11px (38), 12px (29), 10.5px (21), 11.5px (19), 13px (12), 12.5px (10), 14px (6), 10px (4), 9.5px (3), 15px (3), then singletons from 16 to 26px in the gallery and settings page heads. Inline JS: 2 literals (`src/ui/sections/geometry.js` gap, `src/ui/sections/typography.js` font-size) plus 16 explicit `icon(name, { size: 12|13 })` calls (`src/ui/sections/color.js:935,974,1159,1248`, `typography.js:476`, and the geometry specimens). Those four clusters are exactly the UI_TEXT rows 28, 24, 22, 20 of the product-sm-md cell (13, 12, 11, 10), which is why the role table below replaces real usage rather than inventing sizes.

The step unit is a UI_TEXT row, not a pixel: role px = `uiText(row(cellHeight) + step, factor)`, where rows run in `LADDER_ROWS` order (`src/engine/geometry.mjs:70-80`) and `uiText` (`src/engine/type.mjs:35`) applies the doc's body-base factor on the half-pixel grid, clamped at the 12px row. For heights 16 to 96 one row is exactly 1px of text at factor 1, so the table reads as "control text minus n px"; below 16 (the 14 and 12 rows, micro cells) rows are 0.5px and the clamp holds. Doing this in JS, not CSS calc, is forced: CSS cannot index the table, and `calc(--sh-control-text - 1px)` would not follow the factor. The engine already does the same for `chipText`/`captionText` (compact row), so this is the established mechanism, applied to the chrome.

Proposed role table (px at product-sm-md / product-md-md / content-lg-md; weight for the `.on`/`.primary` state is `--ui-weight-strong: 600`):

| role | var | step | sm / md / lg px | weight | line-height | tracking | case | ink | covers (today's literal in parentheses) |
|---|---|---|---|---|---|---|---|---|---|
| pane header title | `--ui-pane-title` | 0 | 13 / 14 / 22 | 600 | 1 | 0 | none | `--ink` | `.pane-head .pane-title` (12/600), `.pane-label` (10.5 UPPER 700 faint: both pane bands take this one role), `.drawer-head h3`, `.insp-title`, `.settings-nav-head`, `.type-spec-head b`, `.geom-spec-head b` (14), `.settings-pagehead h3` (21) |
| pane element title | `--ui-element-title` | -1 | 12 / 13 / 21 | 600 | 1.2 | 0 | none | `--ink` | `.newpal-ctx-head b`, `.color-story-name`, `.story-color-name` (12/600), `.settings-row-text b` (13), `.newpal-diagram-title`, `.newpal-pp-label`, `.key-slot .key-role` (11/600), `.ex-artifact-title` (10.5 UPPER) |
| kicker / group header | `--ui-kicker` | -2 | 11 / 12 / 20 | 700 | 1 | .06em | uppercase | `--ink-dim` (was `--ink-faint`, the 1.3:1 heading fix) | `.sub-head` (10), `.ramp-group-header`, `.compare-col-label` (11), `.settings-nav-grouplabel`, `.settings-group-title`, `.ex-collapse-toggle` (10.5), `.typo-cat-head b`, `.type-spec-grouphead b`, `.geom-spec-grouphead b` (11), `.color-role` (9.5, keeps `--accent`) |
| field / check / switch label | `--ui-label` | -1 | 12 / 13 / 21 | 500 (value `b` 600) | 1.3 | 0 | none | `--ink-dim` | `.field > label`, `.tyi-font-role`, `.drawer-systems-label`, `.drawer-format label` (11.5), `.toggle-label`, `.mode-editor-label` (11), `.newpal-rel-label` (13) |
| control content | `--ui-control` | 0 | 13 / 14 / 22 | 500 | 1 | 0 | none | `--ink` | `button`, `input`, `select`, `.segmented button` (550), `.tyi-voice-name` (650), `.tyi-font-input`, `.docname`, `.map-raw-*`, `.settings-nav-item` (13): the existing `--sh-control-text` alias becomes this role's size |
| chip / badge / tag | `--ui-chip` | engine compact row (`--chip-text`) | 10 / 12 / 18 | 600 | 1 | .02em | none | `--ink-dim` | `.chip`, `.acct-badge` (11), `.radix-badge` (12), `.geom-chip`, `.key-slot .key-place` (10.5), `.tok-sub` (11) |
| helper / caption | `--ui-helper` | -2 | 11 / 12 / 20 | 400 | 1.4 | 0 | none | `--ink-dim` | `.insp-sub`, `.settings-note`, `.settings-row-text small`, `.newpal-rel-hint`, `.drawer-foot .meta`, `.canvas-footer`, `.app-footer` (11.5), `.figma-note`, `.radix-note`, `.config-note`, `.an-empty`, `.type-spec-note`, `.geom-spec-note`, `.apply-gate-*`, `.scrim-ctx-note` (11 to 12), `.toast` (12.5) |
| body copy | `--ui-body` | 0 | 13 / 14 / 22 | 400 | 1.5 | 0 | none | `--ink` | `body` (13), `.settings-about p`, `.settings-pagehead p`, `.pro-upsell-msg`, `.apply-gate-lede`, `.settings-meta`, `.newpal-note` (12.5), `.drawer-systems-note` |
| code / token | `--ui-code` | -1 | 12 / 13 / 21 | 400, `--mono` | 1.4 | 0 | none | `--ink` | `.drawer-pre` (11.5), `.tok-input`, `.geom-lad-k/-v` (12), `.type-spec-token`, `.geom-spec-token` (10.5), `.cleanup-item-label code` |

Each role is four custom properties in the `--sh-*` alias block (`src/ui/styles.css:75-90`): `--ui-<role>-font` (a `font` shorthand: weight size/line-height family, size from `var(--ui-text-step-N, <sm fallback>)`), `--ui-<role>-tracking`, `--ui-<role>-case`, `--ui-<role>-ink`. A shell rule then reads `font: var(--ui-kicker-font); letter-spacing: var(--ui-kicker-tracking); text-transform: var(--ui-kicker-case); color: var(--ui-kicker-ink);` and nothing else about text. The step ladder itself (`--ui-text-step-0..3`, `--ui-chip-icon`, `--ui-edge`) is emitted per host by a new pure module `src/ui/shell-roles.mjs` and appended to the head `<style>` that `_applyShellGeometry` already owns (`src/ui/app.js:2522-2538`), computed from the same `geomScale` cells and `typeScale.uiText` table the `--control-*` roles come from, so a body-base change moves both together. The role table lives once, in the module (`UI_ROLES`), and `test/ui/shell-roles.mjs` asserts the alias block binds every role to the step the module says (the same parity shape as `role-table.json` versus `semanticRoles`).

Anatomy table (H = cell height, P = inset, p = partInset = P/2, I = icon, cH/cP = chip height/inset, cI = cH - 2cP the compact row's icon, e = edge = max(1px, round(I/8)); every value is a ratio, the px column is product-sm-md):

| kind | inset | inner gap | glyph box | glyph | caret box | caret | height / radius | product-sm-md px |
|---|---|---|---|---|---|---|---|---|
| button | P | P/2 | I square | I (svg fills the box) | none | none | H / `--radius-control` | 7 / 3.5 / 14 / 28 / r13 |
| icon-only | 0, width = H | none | I centered (the centering law) | I | none | none | H square, ghost, `--radius-control` | 28x28, box 14 |
| input | P (leading glyph: P/2 gap) | P/2 | I | I | none | none | H / `--radius-control` | 7 / 14 / 28 |
| select | start P, end lane = I + P (`--select-lane`, T-0036) | none | none | none | I at inline-end P | two 0.3I triangles (0.6I wide chevron, static: a background image cannot rotate) | H / `--radius-control` | lane 21, caret 4.2 triangles |
| trigger (button + caret) | P | P/2 | I | I | I at the end | caret icon at I, rotates 180deg on `[aria-expanded=true]` | H / `--radius-control` | 7 / 3.5 / 14 |
| chip | cP | cP/2 | cI | cI | none | none | cH / pill = cH/2 | 4.5 / 2.25 / 11 / 20 / r10 |
| switch | 0 (ghost button), label gap P | P | track 1.75I x I, thumb I - 2e | thumb circle | none | none | track I tall, pill I/2 | track 24.5x14, thumb 10, e 2 |
| range slider (`input[type=range]`, T-0036, the eighth kind) | 0 | none | track 0.4I tall (`--ctl-range-track`) | thumb 1.25I (`--ctl-range-thumb`) | none | none | thumb circle, track pill | track 5.6, thumb 17.5 |

Container composition (ADR-033 applied uniformly; the law is container radius = part radius + container padding):

| container | padding | container radius | part height | part inline inset | part radius | product-sm-md px |
|---|---|---|---|---|---|---|
| segmented control (`.segmented`, `.figma-files`, `.radix-files`) | p (minus the 1px border) | `--radius-control` | H - P | p | `--radius-inset` = rC - p | pad 2.5 + 1 border, part 21, r13 / r9.5 |
| tab row (`.pane-head .segmented`, same rule, no fill) | p | `--radius-control` | H - P | p | `--radius-inset` | same |
| menu / listbox / popover wrap (`.tools-menu`) | p | `--radius-card` = rC + p (today written as `calc(radius + part-inset)`, the same number) | H (full) | P | `--radius-control` | pad 3.5, r16.5 / r13 |
| input group (gapless input + button) | 0 | `--radius-control` outside | H | P | `--radius-control` on free corners, 0 at the join | r13 / 0 |
| switch track (one part, the thumb) | e | pill I/2 | I - 2e | e | 50% | 14 tall, thumb 10 |
| chip | a control on the compact row, not a container | cH/2 | | | | r10 |

What falls out at product-sm-md (round): H 28, P 7, I 14, text 13, part 21 / 3.5, chip 20 / 4.5 / 10 with glyph 11, radiusControl 13, radiusInset 9.5, radiusCard 16.5, radiusMark 6.5; role px 13 / 12 / 11 / 10 (and 7.5 / 7 on micro-sm-md, where steps -2 and -3 clamp). The header bands land on their floors: `--hh = max(48, 28 + 16) = 48` and `--ch = max(42, 28 + 10) = 42` (`styles.css:88-89`), so the bands do not shrink with the cell; the design keeps the floors (a 28px control in a 42px band is the right breathing room, and the Figma plugin iframe shares the chrome). The chip glyph box at product-md-md is 13px, which is the literal the enable marks use today (`color.js:935`), so `icon(name, { size: "chip" })` replaces every explicit size without a visible change at md.

Default cell: `shellGeometry` becomes a tri-state. `null` (fresh install, Reset) resolves to `SHELL_DEFAULT_GEOMETRY = { tier: "product", scale: "sm", radius: "round" }`; the string `"kit"` follows `doc.geometry` (today's null); an object pins a custom cell. Settings offers Default / Follow kit / Custom in `_shellGeometryRows` (`src/ui/overlays/settings.js:176`). Pre-T-0044 records with no `shellGeometry` key land on the new default, which is the ruling. Smoke's `shellGeometry = null` resets become "the default", which is where the matrix must be taken anyway. The chrome keeps composing its text with the doc's type factor (`this._geomScaleFor("base")`, `app.js:2535`), unchanged.

Motion: two tokens in the alias block, `--ui-motion-fast: 120ms` (glyphs: caret rotate, disclosure, listbox check) and `--ui-motion-base: 180ms` (pane collapse, the existing `.18s`), one easing `--ui-motion-ease: cubic-bezier(.2, 0, 0, 1)`. Reduced motion needs no new rule: `ultimate-tokens[data-motion="reduced"] *` and the OS-preference block already force `0.01ms !important` on every descendant (`styles.css:99-116`). The test is a stylesheet check (`test/repo/ui-polish.mjs` pattern, with a mutated sample) plus a smoke computed-style read, because the headless shim computes no CSS.

Gate: `test/repo/shell-text.mjs` is `control-text.mjs` widened from control selectors to every rule, for font-size, font-weight, letter-spacing, text-transform, line-height and the `font` shorthand, plus padding and border-radius on the control and container kinds above. Allow-list by prefix, each with a reason string printed on failure: `.ex-`/`.geom-ex-` (specimens painted at a kit cell; `.ex-collapse-toggle` and `.ex-artifact-title` are preview chrome, not specimens, and are named exceptions to the prefix so they stay on roles), `.ch-` (chart marks own their scale, T-0029), the gallery (`.gallery-`, `.masthead`, `.category-`, `.story-`, `.set-`, `.tile-`, `.new-tile`, `.preset-vol`: a content page, not the editor chrome), `.ramp-row .drag-handle::before` and `.radix-step::after` (drawn glyphs). Layout `gap`/`padding` on panes and cards stay out of the gate (the container tier `--space-*` is a separate concern, named under Risks).

## Interfaces
- New `src/ui/shell-roles.mjs` (pure, no DOM): `UI_ROLES` (role -> { step | "chip", weight, lineHeight, tracking, textCase, ink }), `CONTROL_ANATOMY` (kind -> ratios of icon/inset/partInset/chip), `CONTAINER_COMPOSITION` (kind -> padding, radius, part fields), `MOTION` ({ fast: 120, base: 180, ease }), `roleText(cell, step, uiTextAt)` (row-stepped, clamped), `shellRolesCSS(cell, uiTextAt, hostKey)` emitting `--ui-text-step-0..3`, `--ui-chip-icon`, `--ui-edge` scoped to `ultimate-tokens[data-ut-geom=<key>]`.
- `src/ui/styles.css:75-90` alias block gains `--sh-radius-card`, `--sh-radius-mark`, `--sh-control-caption-text`, the nine roles as `--ui-<role>-font/-tracking/-case/-ink`, `--ui-weight-strong`, `--ui-motion-fast/-base/-ease` (the code role's family is the existing `--mono`); `--sh-control-text` stays as the control role's size.
- `src/ui/app.js`: `SHELL_DEFAULT_GEOMETRY` constant; `_effectiveShellGeometry` (`:2508`) tri-state (`null` -> default, `"kit"` -> doc, object -> custom); `_loadAppPrefs` (`:2493`) accepts `"kit"`; `_saveAppPrefs` (`:2502`) writes it; `_applyShellGeometry` (`:2536`) appends `shellRolesCSS(sc.cells[tier-scale-md], sc.uiText, key)`.
- `src/ui/overlays/settings.js:176` `_shellGeometryRows`: options Default / Follow kit / Custom.
- `src/ui/icons.js:47` `icon(name, { size })`: `size` takes `"control"` (default, `--sh-control-icon`) or `"chip"` (`--ui-chip-icon`); numeric sizes remain only for the geometry specimens.
- New `test/repo/shell-text.mjs` replaces `repo/control-text.mjs` in `test/run.mjs:18` (the old file is deleted; its two negative controls move into the new one) and new `test/ui/shell-roles.mjs` (registered next to `ui/shell.mjs`).
- `test/repo/ui-polish.mjs` gains the anatomy, composition and motion checks; `test/ui/headless-boot.mjs:157-200` (shg) asserts the tri-state and the injected step vars; `test/smoke/smoke.mjs:316,361,390,455` matrices move to `["product","sm"]` and `["content","lg"]` with light and dark PNGs.
- Records: ADR-036 in `docs/references/decision-records.md` (ADR-034 is being written in another worktree, ADR-035 is taken); new `docs/references/geometry/shell-roles.md`; `docs/references/component-inventory.md` cards 1, 2, 3, 5; `.claude/skills/geometry-system/SKILL.md` and `building-editor-sections`.

## Constraints and assumptions
- UI_TEXT rows differ by exactly 1px of text for heights 16 to 96 at factor 1 (14 and 12 are the half-px rows): verified by reading `UI_TEXT` at `src/engine/type.mjs:31`.
- The four literal font-size clusters (13, 12, 11, 10 to 10.5) equal UI_TEXT rows 28, 24, 22, 20, so steps 0 to -3 at product-sm-md reproduce today's sizes: verified by `geomScale({tier:"product",scale:"sm"}).cells["product-sm-md"]` (text 13) and the inventory histogram.
- product-sm-md resolves to H 28, P 7, I 14, part 21/3.5, chip 20/4.5/10, rC 13, rI 9.5, rCard 16.5: verified by running `geomScale` in node.
- The per-host head `<style>` is the only place the chrome's resolved roles are written, so appending role vars there needs no new injection path: verified at `src/ui/app.js:2529-2537`.
- `shellGeometry === null` currently means "follow kit" and is persisted only when set, so a tri-state needs a new persisted value: verified at `src/ui/app.js:2500-2515` and `test/ui/headless-boot.mjs:161,180`.
- Reduced motion already zeroes every descendant's durations with `!important`, so glyph motion needs tokens, not new reduced-motion rules: verified at `src/ui/styles.css:99-116`.
- The headless shim computes no CSS, so motion and anatomy assertions must be stylesheet-parsed or smoke-measured: verified by `test/repo/ui-polish.mjs:1-4` stating the same split.
- `control-text.mjs` already walks `@media` blocks and runs negative controls, so widening it is the gate's shape: verified at `test/repo/control-text.mjs:53-116`.
- The default cell's radius is `round`: unverified (the ruling names tier, scale, size only).
- Both pane bands taking one title role (the left `Analysis` eyebrow stops being uppercase faint): unverified, a visible change the user should rule on.
- The gallery is outside "the editor shell" and stays allow-listed: unverified.
- Explicit `icon()` sizes at product-md-md map to the chip glyph box without a visible change (13px today, 13px from the compact row): verified by `cells["product-md-md"]` chipHeight 24, chipInset 5.5.

## Rejected alternatives
- Role sizes as CSS `calc()` offsets from `--sh-control-text`: a row step follows the body-base factor on the half-pixel grid and the table is not linear below 20px, so calc would drift from the engine; the engine already computes `chipText` in JS for the same reason.
- Adding the step texts as engine cell fields (`CELL_FIELDS`): the fields are locked to DTCG, Figma (432 floats) and the consumer skill; the ticket's non-goal is exported tokens, and the chrome is not doc-bound.
- Keeping `null` as "follow kit" and adding a separate `shellDefault` flag: two booleans for one choice; smoke and tests already treat `null` as the reset state, which should be the ruled default.
- A `--ui-<role>-size` plus separate weight/line-height vars instead of a `font` shorthand per role: twice the declarations per rule and the shorthand is what the gate already accepts when it carries a `var(`.
- Rotating the native select chevron: it is a background image by design (T-0036, survives WebKit and Blink); motion applies to element carets only.
- Putting pane and card `padding`/`gap` under the gate now: that is the container tier (`insets`/`gaps` in `geomScale`), a separate law; 236 literals that would double the ticket.

## Risks
- Safari is the preview browser and smoke is Chrome: a `font` shorthand with an unquoted family token is fine, but the shorthand resets `font-variant-numeric` (tabular figures on `.field > label b`), so those rules must re-declare it after the shorthand.
- The role table makes the left pane header and the kicker larger and darker than today (10.5 faint uppercase to 13 `--ink` title, 10 faint to 11 `--ink-dim`); if the user wants the eyebrow look kept on the left band, the kicker role covers it at step -2 and the table needs one line changed before the build.
- Micro cells put kickers and helpers at 7px; the clamp keeps them on-table but not readable. The shell only offers micro through Custom.
- The band floors (48/42) hide the cell change on the header rows at product-sm; if the user expected a shorter header the floors need a ruling.
- `styles.css` is edited by five leaves and `app.js` by two; parallel builders would collide, and every edit shifts doc cites (`scripts/audit-citations.mjs` in the same step).
- The 16 explicit `icon()` sizes include the enable marks on ramp rows; at product-sm they shrink from 13 to 11px, visible in the canvas.

## Carry forward
- Inventory: 591 literal declarations in `src/ui/styles.css` (font-size 153, font-weight 69, letter-spacing 19, text-transform 20, line-height 31, padding 99, gap 137, border-radius 49, glyph sizes 13); produced by a rule parser over the file with `var(` values excluded, selector kinds by prefix regex.
- Font-size literal histogram in `src/ui/styles.css` (same parser): 11px x38, 12px x29, 10.5px x21, 11.5px x19, 13px x12, 12.5px x10, 14px x6, 10px x4, 9.5px x3, 15px x3, 17px x2, singletons 9, 16, 21, 22, 24, 26px.
- Explicit `icon(name, { size: N })` calls: 16 in `src/ui` (`grep -rn "icon([^)]*size" src/ui/{*.js,*.mjs,sections/*.js,overlays/*.js}` excluding `icons.js`), at `sections/color.js:935,974,1159,1248`, `sections/typography.js:476`, the rest in `sections/geometry.js` specimens.
- product-sm-md round: height 28, inset 7, text 13, icon 14, partHeight 21, partInset 3.5, chipHeight 20, chipInset 4.5, chipText 10, radiusControl 13, radiusInset 9.5, radiusCard 16.5 (`geomScale` in `src/engine/geometry.mjs:165`).
- Step px per cell: product-sm-md 13/12/11/10, product-md-md 14/13/12/11, content-lg-md 22/21/20/19, micro-sm-md 7.5/7/7/7 (`UI_TEXT`, `src/engine/type.mjs:31`).
- Alias block to extend: `src/ui/styles.css:75-90`; band floors `--hh`/`--ch` at `:88-89`.
- Head-style injection point: `src/ui/app.js:2522-2538` (`_applyShellGeometry`), effective geometry `:2508-2515`, prefs `:2485-2504`, reset `:2540`.
- Settings rows: `src/ui/overlays/settings.js:176-194` (`_shellGeometryRows`).
- Existing tests that pin product-md as the fresh default: `test/ui/headless-boot.mjs:161` (shg1), `:180` (shg3); smoke matrices at `test/smoke/smoke.mjs:316,361,390,455`.
- Gate to widen: `test/repo/control-text.mjs` (registered `test/run.mjs:18`); stylesheet-check pattern with mutated samples: `test/repo/ui-polish.mjs`.
- Reduced-motion rules already cover descendants: `src/ui/styles.css:99-116`.
- Next free ADR number is ADR-036 (`grep -n "^## ADR-" docs/references/decision-records.md`; ADR-034 is in flight in `.worktrees/adr034`, never run anything there).
- Decomposition manifest: `.sdlc/ui-standardization/decompose/manifest-v1.json` (coverage clean, plan mode) and `decompose/report.md`; the conductor adds `Decomposition: decompose/report.md` under the handoff's Context.
