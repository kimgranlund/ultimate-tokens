---
status: draft
ticket: none yet (to mint per adapter X3 at approval: `kind:feature`, `size:L`, `lane:editor-ui`; U2 is a `kind:defect` finding carried inside this plan, not a second issue)
priority: P2
lane: editor-ui (`src/ui/app.js`, `src/ui/sections/color.js`, `src/ui/sections/typography.js`, `src/ui/sections/geometry.js`, `src/ui/overlays/settings.js`, `src/ui/styles.css`, `src/ui/persist.js`, `test/ui/headless-boot.mjs`, `test/smoke/smoke.mjs`, `docs/lld/app-shell.md`, `docs/reference/references/component-inventory.md`, `CHANGELOG.md`; U2 alone reaches `src/engine/tonal.js`, `test/engine/`, `scripts/report-preset-fidelity.mjs`; the regenerated bundles `dist/`, `figma/plugin/ui.html` on every UI unit)
size: S+M+S+L (U1 S = 1, U2 M = 2, U3 S = 1, U4 L = 4; 8 points)
labels: kind:feature · status:backlog · size:L · P2 · lane:editor-ui (to mint per adapter X3)
written: 2026-10-01
head: 38b0e8b1 (`main`, the #766 revision 4 copy)
depends: nothing landed. U2's engine change depends on the owner's answer to `.sdlc/questions/pane-context-group-chroma.md` (R69 governs today's behaviour); U2's measurement half does not. R86 (2026-10-01, `.sdlc/runtime/owner-rulings-2026-09-22.md`): no Fable seats until Friday, so every unit and the pre-land pair run reviewer-l3 and verifier-l2
inputs: the owner's four asks of 2026-10-01 (relayed by the Conductor, below, section 1), `src/ui/app.js` (`sel`, `segment`, `setSegment`, `_deselect`, `selectedIndex`, `renderRightPane`, `exampleArtifacts`, `_exampleRoles`, `themeBtn`, `canvasThemeBtn`, `resolvedCanvasScheme`, `canvasBg`, `colorMode`, `canvasTheme`, `_appPrefsKey`, the `1`/`2`/`3` key cases), `src/ui/sections/color.js` (`selectPalette`, `setSegment`, `renderCanvasHeader`, `colorSchemeBtn`, `colorCompareBtn`, `renderRampsScene`, `renderMappingScene`, `renderPaletteInspector`, `renderGlobalInspector`, `setGroupField`, `renderRolesInspector`), `src/ui/sections/typography.js` and `geometry.js` (`canvasThemeBtn` call, `compare-col` scene), `src/ui/overlays/settings.js` (the "App theme" and "Canvas preview" rows), `src/ui/model.mjs` (`paletteGroup`, `resolvePaletteGroups`, `rampChromaOf`, `projectView`, `defaultDocument`), `src/engine/resolve.mjs` (`rampChromaOf`, `primeChromaOf`), `src/engine/tonal.js` (`anchorChromaBasis`, `paletteStops`, `paletteStopsAnchored`), `src/ui/persist.js` (`GROUP_DEFAULTS`), `test/ui/headless-boot.mjs` (groups (b), (i), (j6), (j7), (k), (aa), (cm), (cm-toggle), (set), (pref), (pref-cm), (pst), (gid1) to (gid4)), `test/smoke/smoke.mjs`, `scripts/report-preset-fidelity.mjs` (`--identity-control`, the `--base`/`--base-dir` shape), `.sdlc/plans/floorref-hue.md` (format, R79 grade pattern), `.sdlc/adapter.md` §1 gates, §4 X2 (reviewer floor for `test/ui/headless-boot.mjs`), §6 with the #768 Claims amendment
measurements: read-only, planner, 2026-10-01, on `main` at 38b0e8b1, two throwaway probes under `$CLAUDE_JOB_DIR/tmp/` (`probe-group-chroma.mjs`, `probe-up.mjs`; recipe in section 2 so U2 can rebuild them as a committed report mode). Both render `defaultDocument()` through `projectView` with one group's `paletteGroups[g].baseChroma` set to 100, 70, 40, 10 (brand, system) or 30, 60, 100 (material), once with each palette's `anchor` kept and once with `delete p.anchor`, under `toneMode` `perceptual` and `even`, and compare the group's palettes stop by stop on `hex` and CAM16 `chroma`
---

# The right pane follows the canvas selection (palette selected, global deselected), the per-group base chroma slider is measured and ruled, the Roles pane shows the selected palette or every palette, and light and dark render side by side everywhere with the scheme toggles removed

## 1. The four asks and what this plan decides

The owner's asks of 2026-10-01, verbatim:

1. "Context and panes: clicking a palette such as Neutral on the canvas makes the pane show Palette options. Clicking outside a palette (deselecting) makes the pane show Global options."
2. "In the global pane, the `* base chroma` slider does not seem to apply uniformly to the group." Treat as a bug: root cause and measurement before any fix.
3. "Roles show the selected palette, or every palette's roles when nothing is selected." (ruling)
4. "Light and dark always show side by side everywhere (canvas, roles, previews), and the light/dark toggle is removed app-wide." (ruling)

Today: `HctApp.sel` is `{kind:"palette", id}` or `{kind:"none"}` (`src/ui/app.js`); a ramp-row click calls `selectPalette(id)` and an empty-canvas click or Escape calls `_deselect()`, and neither touches `this.segment`, the right-pane tab (`palette` | `global` | `roles` | `story`), which only the tabs and the `1`/`2`/`3` keys move. After a deselect `selectedIndex()` falls back to `doc.selected` or 0, so the Palette inspector keeps rendering a palette nothing on the canvas shows as selected. `renderRolesInspector` renders one palette's 53 roles with an `L` then `D` swatch pair per row. The Color canvas header carries a scheme-cycle button (`aria-label` starting `Color value mode:`) and a Compare toggle; `colorMode` is `system | light | dark | both` and `both` renders two `.compare-col` columns (light then dark); Typography and Geometry carry `canvasThemeBtn()` and their own `compare-col` scene; Settings has an "App theme" row and a "Canvas preview" row; both prefs persist under `ultimate-tokens-app-prefs-v1`.

Decisions:

- U1 (ask 1): `selectPalette` sets `segment` to `palette`; `_deselect` sets it to `global`. The tabs and the `1`/`2`/`3` keys stay (a user may still open Roles or Global with a palette selected). Nothing else moves: `sel` keeps its shape, `selectedIndex()` keeps its fallback for the left-pane analysis cards.
- U2 (ask 2): the slider is not broken in the UI. The root cause is in the engine's anchored ramp path, by design under R69, and the "fix" is a ruled-behaviour change. U2 ships the measurement as a committed report mode and an owner question first (section 2 and `.sdlc/questions/pane-context-group-chroma.md`); the engine change half is written against the recommended option and is gated on the ruling. If the owner picks the option that keeps today's engine, U2 shrinks to the report mode plus the UI reading of the effective ceiling (option C below) and the plan is revised.
- U3 (ask 3): with `sel.kind === "palette"` the Roles pane renders that palette's table as today; with `sel.kind === "none"` it renders one `.roles-table` per enabled palette, in canvas order, each under its palette name. Rows keep the `L` then `D` pair, so U3 does not wait for U4.
- U4 (ask 4): the plain reading. Every canvas-scheme control goes: the Color scheme-cycle and Compare buttons, Typography's and Geometry's `canvasThemeBtn`, the Settings "Canvas preview" row, the `colorMode` and `canvasTheme` state and their persisted keys. Every scene renders the two-column light-then-dark layout the `both` mode renders today, in all three sections; the right-pane example card and the Roles swatches show both schemes (the example card renders two previews, light then dark). The app chrome theme (`themeBtn`, `[data-theme]`, Settings "App theme") is a different control, the owner's words name the light/dark *preview* toggle, so chrome theme is out of scope (section Not in scope). `resolvedCanvasScheme()` survives only as the per-column override a `.compare-col` sets while it builds; every other branch is deleted.

Order: U1, then U3, then U4, serial, each unit's worktree cut from `plan/pane-context` after the prior unit merges (all three edit `src/ui/app.js`, `src/ui/sections/color.js`, `test/ui/headless-boot.mjs`). U2 runs in parallel with any of them (its lane is the engine, the report script and `test/engine/`; its only UI touch, the Global inspector's per-group readout under option C, lands after U4 if that option is ruled).

## 2. Ask 2 measured: what the `<group> base chroma` slider does (planner, read-only, 38b0e8b1)

Path: `renderGlobalInspector` renders one `div.field-group[data-group-row=g]` per group with a slider labelled `${paletteGroupLabel(g)} base chroma` writing `doc.paletteGroups[g].baseChroma` through `setGroupField`. `projectView` (`src/ui/model.mjs`) resolves each palette's ramp chroma through `rampChromaOf`, which returns `paletteGroups[group].baseChroma ?? controls.baseChroma`, an absolute target that replaces `p.chroma` for the ramp, and passes it to `paletteStops({ hue, chroma, ..., anchor })`. The UI side is uniform: every palette in the group receives the same number.

The engine side is not. Every palette in the default kit (16/16) and 3380 of 3780 curated palettes carry an `anchor` (floorref-hue section 2 census). On the anchored perceptual and peak path `anchorChromaBasis(stop, 500, lift, anchorValue, groupValue, climb=false)` (`src/engine/tonal.js`) blends from the anchor's own OKHSL saturation at stop 500 (weight 0, the anchor is byte-exact) toward `min(groupValue, anchorValue)` at the ramp ends. So the group value is a ceiling that bites only toward the ends, never a target: raising it above the anchor's own saturation is a no-op, lowering it moves the mid and outer stops by an amount that depends on each palette's own anchor saturation. That is the non-uniformity the owner saw. R69 (2026-09-29, #725 U2) chose this on purpose, reversing Q-U2-5 so a muted sample in a vivid group no longer climbs toward the group's chroma; `(gid3)` in `test/ui/headless-boot.mjs` ratifies it ("a fresh doc's Neutral ramp equals the chroma-100 ramp: R69 caps an anchored ramp at the anchor's own s, so group chroma above it is ignored"). The even path passes `climb=true` and keeps the pre-R69 blend (#701's).

Figures (default kit, 19 display stops per ramp, CAM16 C):

| Group, move | Anchors | Palette | hex moved | dC@500 | max dC |
|---|---|---|---|---|---|
| brand 100 to 40, perceptual | kept | Primary / Secondary / Tertiary | 17 / 19 / 19 | 0.00 / 0.00 / 0.00 | 9.34 / 13.26 / 13.83 |
| brand 100 to 40, perceptual | stripped | Primary / Secondary / Tertiary | 19 / 19 / 19 | -42.49 / -18.67 / -51.25 | at 500 |
| brand 100 to 10, perceptual | kept | Primary / Secondary / Tertiary | 19 / 19 / 19 | 0.00 | 15.46 / 19.55 / 21.36 |
| system 100 to 40, perceptual | kept | Info / Success / Warning / Danger | 19 each | 0.00 | 10.13 / 14.55 / 11.34 / 15.10 |
| material 30 to 60, and 30 to 100, perceptual | kept | Neutral (C@500 24.77) | 0 / 19 | 0.00 | 0.00 |
| material 30 to 60, and 30 to 100, perceptual | stripped | Neutral | 18 / 19 | +24.2, +57.1 | at 500 |
| brand 100 to 40, even | kept | Primary / Secondary / Tertiary | 8 to 12 / 19 | 0.00 | about 5 |

Reading: with anchors kept, stop 500 never moves (the anchor pin), raising never moves anything (Neutral 30 to 100: 0 of 19 hexes), and lowering moves the ends by a per-palette amount (9 to 21 C across three brand palettes for the same slider move). With anchors stripped the slider is the uniform absolute target the UI promises. The default kit the owner opens is all anchored, so the slider reads as a ceiling-only control with a dead upper range.

Recipe, so U2 can commit it (`scripts/report-preset-fidelity.mjs --group-chroma`, the `--identity-control` shape): import `defaultDocument`, `projectView`, `paletteGroup` from `src/ui/model.mjs`; for each `(group, value)` set `doc.paletteGroups[group].baseChroma = value`, optionally `delete p.anchor` on every palette, set `doc.toneMode`, render `projectView(doc)`, keep `view.palettes.filter(p => paletteGroup(p) === group)`, compare `ramp[k].hex` and `ramp[k].chroma` to the group's render at its default value. Print per palette: hexes moved, dC at stop 500, max |dC|. The planner's two probes do exactly this and nothing else.

Options for the owner (`.sdlc/questions/pane-context-group-chroma.md`, written by this plan, default A):

- A (recommended): the group value scales the anchor's own saturation, 100 meaning "the anchor as sampled". `anchorChromaBasis` keeps its shape and its pin (stop 500 stays byte-exact), and the group target becomes `anchorValue * groupValue / 100` on the perceptual and peak path, so the slider moves every palette in the group by the same ratio, never above its own anchor at 100, and R69's "no climb" survives (a muted sample never climbs toward a vivid group at 100). Lowering reads uniform in ratio; raising above 100 is a visible move for the first time. `(gid3)` keeps passing (100 equals the anchor's own ramp), `(gid3b)` keeps passing.
- B: restore the pre-R69 climb on the perceptual and peak path (`climb=true` everywhere). Uniform in absolute terms, but it brings back the #725 finding R69 removed (stop 300 at a 94% median of stop 500) and flips `(gid3)`. Not recommended.
- C: engine untouched; the Global inspector shows, under each `<group> base chroma` slider, the effective ceiling per palette (the anchor's own saturation as a percentage) and greys the dead range. Honest, and it leaves the slider non-uniform.

U2's engine criteria below are written against A. Under C they are replaced by one UI criterion (noted inline) in a plan revision; under B the plan is revised and re-approved, since it reopens R69.

## 3. Constraints

- `h()` hyperscript, light DOM, no framework, no runtime dependency (`.claude/CLAUDE.md`). Engines stay DOM-free.
- Stop 500 of an anchored ramp stays byte-exact to the anchor in every U2 option (`anchorChromaBasis` weight 0 at the pivot).
- `src/engine/semantic.js`, the role table and the Figma `code.js` mirror do not move; no role-count change.
- The headless shim is not jsdom (`building-editor-sections` skill): assertions walk the tree with `walk`, `findFk` and attribute reads; no `getComputedStyle`, no layout.
- `test/ui/headless-boot.mjs` runs top-to-bottom, one file, no per-group runner; a criterion names the `(xx)` label and the file's exit code.
- Prose rules for every line this plan or its units add: no em dash (`test/repo/em-dash.mjs`, inside `npm test`, scans `.sdlc/`), the retired maker brand paraphrased (`test/repo/branding.mjs`), criterion needles are labels, ids, class names, function names and counts, never line numbers or exact prose (R10). The shell is zsh; a command that needs a pipe's exit code runs under `bash -c 'set -o pipefail; ...'`. Node probes run with `FORCE_COLOR=0`.
- The `html:` SVG-chart exception stays at 12 live attributes in `src/ui/sections/{color,geometry,typography}.js` (`.claude/CLAUDE.md`); U4 adds none.
- Gates per `.sdlc/adapter.md` §1 in the unit worktree: `npm test` (no `node_modules`, tree clean after), `npm run build` after `npm ci` (U1, U3, U4 touch the UI, so the bundle regenerates), `npm run smoke` (U4 only, the canvas layout changes), `ramp-identity` for U2 (it touches `src/engine/tonal.js`).

## 4. Criteria

### U1: the right pane follows the selection

| # | Command | Expected | Negative control | Today |
|---|---|---|---|---|
| C1.1 | `FORCE_COLOR=0 node test/ui/headless-boot.mjs`, look for the `(j6)` lines | `(j6) clicking empty canvas clears the palette selection (kind:none)` passes as today and a new `(j6b)` line passes: after the empty-canvas click `app.segment === "global"` and the right pane carries a `[data-group-row]` element (the Global inspector's group rows); exit 0 | In a scratch clone revert `_deselect`'s `segment` write (one line); `(j6b)` reds, exit 1 | `_deselect` leaves `segment` unchanged; `(j6b)` does not exist |
| C1.2 | same run, the `(j7)` lines | a new `(j7b)` line passes: after `selectPalette(0)` from a deselected state `app.segment === "palette"` and the right pane carries the palette `Chroma` slider (`findFk("slider:Chroma")` truthy); exit 0 | Revert `selectPalette`'s `segment` write; `(j7b)` reds | `selectPalette` leaves `segment` unchanged |
| C1.3 | same run, the `(b)` lines | the Escape-key deselect assertion passes as today and a new `(b2)` line passes: Escape with a palette selected lands on `segment === "global"`; after `setSegment("roles")` with a palette still selected a second render keeps `segment === "roles"` (tabs still win while the selection is unchanged) | Make `render` reset `segment` from `sel` on every pass; `(b2)`'s second half reds | `(b2)` does not exist |
| C1.4 | `grep -c 'case "1":\|case "2":\|case "3":' src/ui/app.js` | `3` (the keys stay) | n/a, a count pin | `3` |
| C1.5 | `bash -c 'set -o pipefail; npm test 2>&1 \| tail -3'`; then `git status --short` | the last lines carry `all 56 test files passed` and exit 0; the status is empty | adapter §1's row for `npm test`: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json` in a throwaway clone makes `engine/semantic.mjs` fail, exit 1 | `all 56 test files passed` |

### U2: the group base chroma, measured then ruled

| # | Command | Expected | Negative control | Today |
|---|---|---|---|---|
| C2.1 | `FORCE_COLOR=0 node scripts/report-preset-fidelity.mjs --group-chroma --group brand --values 100,40` | Prints one row per brand palette of the default kit with columns `hex moved`, `dC@500`, `max dC`, under `anchors kept` and `anchors stripped`, and exits 0; the kept rows print `dC@500` `0.00` for all three and the stripped rows print `dC@500` below `-10.00` for all three (the section 2 figures at 38b0e8b1 before any engine change: `-42.49`, `-18.67`, `-51.25`) | Run with `--values 100,100`: every column prints `0` / `0.00` | Mode does not exist; `--identity-control` is the nearest |
| C2.2 | the same with `--group material --values 30,100` | at 38b0e8b1 (before the engine change) the kept Neutral row prints `hex moved 0/19`; after the option A change it prints `hex moved` above `0` with `dC@500` `0.00` | `--values 30,30` prints `0/19` either way | the kept row is `0/19` (the dead upper range) |
| C2.3 | `.sdlc/questions/pane-context-group-chroma.md` exists with the fields `Blocks`, `Finding`, `Question`, `Options`, `Default if unanswered`, and an `## Answer` section; `grep -c '^| Chosen | pending' .sdlc/questions/pane-context-group-chroma.md` | `0` once the owner has ruled (the `Chosen` cell names A, B or C); U2's engine commits are not merged while it prints `1` | n/a, a record | the file does not exist (this plan writes it) |
| C2.4 (option A) | `FORCE_COLOR=0 node test/engine/tonal.mjs` | passes with a new `group-chroma-ratio` case: for an anchored perceptual palette with `anchor.okhsl.s` = s0, rendering at group value 100 equals rendering with no group override byte for byte, rendering at 50 yields stops 100 and 900 whose OKHSL `s` is within 0.02 of `0.5 * s0`-blended value the pre-change basis gives at weight 1, and stop 500 is byte-identical at 100, 50 and 10 | In a scratch clone set the ratio target back to `Math.min(groupValue, anchorValue)`; the 50-row reds, the 500-row stays green (it is the pin, which the control must not break) | case does not exist |
| C2.5 (option A) | `FORCE_COLOR=0 node test/ui/headless-boot.mjs`, the `(gid` lines | `(gid3)` and `(gid3b)` pass unchanged (100 equals the anchor's own ramp; 10 differs from 30); a new `(gid5)` passes: material 30 to 60 moves more than 0 Neutral hexes and leaves stop 500 byte-identical | Revert the engine change; `(gid5)` reds | `(gid5)` does not exist; the 30 to 60 move is 0 of 19 |
| C2.6 (option A) | `FORCE_COLOR=0 node test/engine/even-dips-gate.mjs; FORCE_COLOR=0 node test/engine/chroma-envelope-gate.mjs; FORCE_COLOR=0 node test/engine/mode-isolation-gate.mjs` | each exits 0; the even path (`climb=true`) renders byte-identical to 38b0e8b1 on the ratchet fixture (`chroma-envelope.json` even cells unchanged, `git diff --stat` on the fixture prints no even-cell change) | the FLOOR_TARGET data-URL control already in `even-dips-gate.mjs` reds the gate when the floor is scaled | all exit 0 |
| C2.7 (option A) | `FORCE_COLOR=0 node scripts/report-preset-fidelity.mjs --identity-control --authored --base 38b0e8b1` | identity control prints 0 moved cells for the non-anchored path and for every anchored palette whose group value equals its `GROUP_DEFAULTS` (a kit at defaults renders as before); the report's max dC over the curated corpus at default group values is `0.00` | `--base` a tree with option B applied prints moved cells on anchored ramps | `--identity-control` exists, prints 0 moved on itself |
| C2.8 (option C, replaces C2.4 to C2.7 if ruled) | `FORCE_COLOR=0 node test/ui/headless-boot.mjs`, the `(gid4)` lines | each `[data-group-row]` carries one `.group-ceiling` readout per anchored palette in the group, text ending in `%`; a new `(gid4b)` passes | remove the readout; `(gid4b)` reds | none |
| C2.9 | `bash -c 'set -o pipefail; npm test 2>&1 \| tail -3'`, the `ramp-identity` row of adapter §1 (`node scripts/report-preset-fidelity.mjs --identity-control --base $(git merge-base origin/main HEAD)`, with `--authored` since the anchored construction moves), `git status --short` | green, exit 0, status empty | adapter §1 controls | green |

### U3: Roles shows the selected palette or every palette

| # | Command | Expected | Negative control | Today |
|---|---|---|---|---|
| C3.1 | `FORCE_COLOR=0 node test/ui/headless-boot.mjs`, the `(i)` lines | the existing one-palette `(i)` assertions pass with a palette selected; a new `(i-all)` passes: after `_deselect()` and `setSegment("roles")` the right pane holds `.roles-table` elements equal in count to the enabled palette count of `app.doc` (default kit: `16`) and `.rrow` elements equal to `53` times that count (`848`) | Make the all-palettes branch render only `doc.selected`; the count row reds (`1` table, `53` rows) | one `.roles-table`, `53` rows regardless of `sel` |
| C3.2 | same run | a new `(i-one)` passes: `selectPalette(2)` then Roles renders exactly one `.roles-table` whose heading text equals `app.doc.palettes[2].name` | Drop the `sel.kind` branch; `(i-one)` renders `16` tables, reds | n/a |
| C3.3 | same run | each `.rrow` still carries one `.sw-pair` with two swatch children (light then dark), in both modes; `(i-all)` asserts `querySelectorAll(".rrow .sw-pair").length === 848` | drop the dark swatch; count halves | `53` pairs |
| C3.4 | `bash -c 'set -o pipefail; npm test 2>&1 \| tail -3'`; `git status --short` | green, exit 0, status empty | adapter §1 controls | green |

### U4: light and dark side by side everywhere, toggles removed

| # | Command | Expected | Negative control | Today |
|---|---|---|---|---|
| C4.1 | `grep -c 'Color value mode:' src/ui/sections/color.js; grep -c 'colorCompareBtn\|colorSchemeBtn' src/ui/sections/color.js; grep -c 'canvasThemeBtn' src/ui/app.js src/ui/sections/typography.js src/ui/sections/geometry.js` | `0`, `0`, and `0` for each of the three files (the buttons and their builders are gone) | n/a, count pins | `2`, `7`, and `1`/`1`/`1` (the definition in `app.js`, one call each in Typography and Geometry) |
| C4.2 | `grep -c 'colorMode\|canvasTheme' src/ui/app.js src/ui/sections/color.js src/ui/sections/typography.js src/ui/sections/geometry.js src/ui/overlays/settings.js src/ui/persist.js` | `0` for every file | n/a | `app.js` 21, `color.js` 10, `typography.js` 1, `geometry.js` 1, `settings.js` 2, `persist.js` 0 |
| C4.3 | `FORCE_COLOR=0 node test/ui/headless-boot.mjs`, the `(cm)` lines | the `(cm)` group is rewritten: no scheme button and no Compare button in the Color header (`0` and `0`); the Color scene holds exactly `2` `.compare-col` children, the first with class `canvas-scheme-light` and the second `canvas-scheme-dark`, each with its own `--canvas-bg` and the two differing; the same `2`-column assertion holds after `app.section = "typography"` and after `app.section = "geometry"`; `(cm-toggle)` is deleted (the toggle it tested is gone) | Render one column only in the Geometry scene; the geometry `2`-column row reds | Color renders `2` columns only when `colorMode === "both"`; typography and geometry render one |
| C4.4 | same run, the `(k)` lines | the `.seg-example` pane renders `2` `.example-scheme` wrappers (light then dark, each carrying its own `--canvas-bg`), each holding the `.example-card` set; `_exampleRoles` no longer reads `resolvedCanvasScheme()`, and `grep -c 'resolvedCanvasScheme' src/ui/app.js` prints no more than `2` (the definition and the `.compare-col` override) | drop the dark wrapper; the `2` count reds | one set of `.example-card` following the scheme; `resolvedCanvasScheme` appears 7 times in `app.js` |
| C4.5 | same run, the `(set)`, `(pref)`, `(pref-cm)`, `(pst)` lines | Settings renders an `App theme` row and no `Canvas preview` row (`0`); `(pref-cm)` is deleted and `(pref)` asserts the persisted prefs JSON under `ultimate-tokens-app-prefs-v1` carries no `colorMode` and no `canvasTheme` key after a save, and a stored blob that carries them loads without a throw (old blobs stay loadable) | plant `{"colorMode":"dark"}` in the store, boot, assert no throw: a loader that rejects unknown keys reds | `(pref-cm)` asserts the key persists |
| C4.6 | `grep -c 'canvas-scheme-light\|canvas-scheme-dark' src/ui/styles.css; grep -c '\[data-theme=' src/ui/styles.css` | the first at least `2` (the column rules stay); the second `3`, unchanged (the chrome theme is untouched) | n/a | `4` and `3` |
| C4.7 | `bash -c 'set -o pipefail; npm run smoke 2>&1 \| tail -3'` (after `npm ci`) | `SMOKE PASS`; the smoke script's two assertions that currently flip `colorMode` or click Compare are replaced by one that counts `2` `.compare-col` per section; screenshots in `smoke-out/` show two columns in all three sections | remove the geometry second column; smoke reds on the count | smoke sets `colorMode` |
| C4.8 | `docs/lld/app-shell.md` and `docs/reference/references/component-inventory.md` | the scheme-cycle and Compare controls, `canvasThemeBtn` and the Settings "Canvas preview" row are removed from the inventory and the shell doc names the two-column scene as the only canvas layout; `grep -c 'colorMode\|canvasTheme\|Compare' docs/lld/app-shell.md docs/reference/references/component-inventory.md` prints `0` for both; U4's handoff carries the `## Claims` ledger and the `~~~sh ran` / `~~~out ran` blocks for these two files (adapter §6, #768) | n/a | `app-shell.md` carries 8 such lines (`this.colorMode`, `canvasTheme`, Compare); the inventory 0 |
| C4.9 | `bash -c 'set -o pipefail; npm test 2>&1 \| tail -3'`; `npm run build`; `git status --short` | green, exit 0, build exits 0, status empty | adapter §1 controls | green |

## Units

Grades per R86: reviewer-l3 and verifier-l2 for every unit and for the pre-land pair (no Fable until Friday). Reviewer dispatches name the `change-reviewer-agent` checklist (adapter §4 X2); every UI unit touches `test/ui/headless-boot.mjs`, so the X2 floor of reviewer-l2 is met.

- [ ] U1 (S) `selectPalette` sets `segment` to `palette`, `_deselect` to `global`; tabs and the `1`/`2`/`3` keys stay; `(j6b)`, `(j7b)`, `(b2)` added to `test/ui/headless-boot.mjs`; bundles regenerated (C1.1 to C1.5). Lane: `src/ui/app.js`, `src/ui/sections/color.js`, `test/ui/headless-boot.mjs`, `dist/`, `figma/plugin/ui.html` · grade l2 · reviewer-l3 · verifier-l2
- [ ] U2 (M) `--group-chroma` report mode in `scripts/report-preset-fidelity.mjs` (the section 2 recipe, C2.1, C2.2), the owner question `.sdlc/questions/pane-context-group-chroma.md` answered (C2.3), then, under option A, the ratio target in `anchorChromaBasis` on the perceptual and peak path with the even path byte-identical, the `group-chroma-ratio` case in `test/engine/tonal.mjs`, `(gid5)` in the shim, gates and identity control (C2.4 to C2.7, C2.9); under option C, C2.8 instead and the plan revised. Lane: `scripts/report-preset-fidelity.mjs`, `src/engine/tonal.js`, `test/engine/tonal.mjs`, `test/ui/headless-boot.mjs` (the `(gid` block only), `.sdlc/questions/`, `CHANGELOG.md` · grade l6 · reviewer-l3 · verifier-l2
- [ ] U3 (S) `renderRolesInspector` renders every enabled palette's table when `sel.kind === "none"`, one when a palette is selected; `(i-all)`, `(i-one)` added; bundles regenerated (C3.1 to C3.4). Lane: `src/ui/sections/color.js`, `src/ui/styles.css` (table heading spacing), `test/ui/headless-boot.mjs`, `dist/`, `figma/plugin/ui.html` · grade l2 · reviewer-l3 · verifier-l2
- [ ] U4 (L) remove `colorSchemeBtn`, `colorCompareBtn`, `canvasThemeBtn`, the Settings "Canvas preview" row, `colorMode`, `canvasTheme` and their persisted keys; every section's scene renders the two `compare-col` columns always; the example card and Roles swatches show both schemes; `resolvedCanvasScheme` reduced to the column override; `(cm)` rewritten, `(cm-toggle)` and `(pref-cm)` deleted, `(pref)` and `(set)` adjusted, the 41 `colorMode` writes in the shim removed; smoke updated; `docs/lld/app-shell.md` and the component inventory updated with a Claims ledger; CHANGELOG; bundles regenerated (C4.1 to C4.9). Lane: `src/ui/app.js`, `src/ui/sections/{color,typography,geometry}.js`, `src/ui/overlays/settings.js`, `src/ui/styles.css`, `src/ui/persist.js`, `test/ui/headless-boot.mjs`, `test/smoke/smoke.mjs`, `docs/lld/app-shell.md`, `docs/reference/references/component-inventory.md`, `CHANGELOG.md`, `dist/`, `figma/plugin/ui.html` · grade l6 · reviewer-l3 · verifier-l2

Pre-land: reviewer-l3 plus verifier-l2 on `plan/pane-context` (R86), record at `.sdlc/verdicts/pane-context-prepr.md`; CI `build-test`, `panda-smoke`, `corpus-contrast`, `sweeps` green; then the `shipping-changes` squash and sync.

## Blast radius

- `test/ui/headless-boot.mjs`: 41 `colorMode` writes and 3 `canvasTheme` reads across (j), (cm), (cm-toggle), (set), (pref), (pref-cm), (pst) and the backdrop tests go in U4; each test that set `colorMode = "light"` to read one scheme must instead read the first `.compare-col`. The `(gid3)`/`(gid3b)` assertions flip under U2 option B only.
- `test/smoke/smoke.mjs`: 4 lines touch `colorMode`, `canvasTheme` or Compare; U4 rewrites them.
- `dist/` and `figma/plugin/ui.html` regenerate on U1, U3, U4 (`npm test` regenerates them; the tree must be clean after).
- `src/engine/tonal.js` (U2 option A): anchored perceptual and peak ramps whose group value differs from their anchor's own saturation render differently; at `GROUP_DEFAULTS` (material 30, brand/system/data 100) a palette whose anchor saturation is at or below the default renders as before under A only where `anchorValue * 100/100 === anchorValue`, i.e. always for brand/system/data at 100; material at 30 moves every default-kit material palette whose anchor s exceeds 0.30, so C2.7 pins the corpus-at-defaults movement and U2 reports it before the ruling. If the owner wants the kit's Neutral unchanged at defaults, option A ships with material's default moved to 100 in `GROUP_DEFAULTS` and a persist migration; U2's question states this.
- Persisted prefs `ultimate-tokens-app-prefs-v1`: old blobs carrying `colorMode`/`canvasTheme` must still load (C4.5).
- `docs/lld/app-shell.md`, `docs/reference/references/component-inventory.md`: four control entries retire (C4.8).
- Marketing corpus (`docs/marketing/`): if the fact sheet names a light/dark toggle or Compare mode, the `marketing-manager-agent` services the drift after U4 lands (checked by `grep -ril 'compare\|light/dark toggle' docs/marketing/` in U4's handoff; not a criterion of this plan).

## Not in scope

- The app chrome theme (`themeBtn`, `[data-theme=…]`, Settings "App theme", the footer theme text, the OS `prefers-color-scheme` listener). The owner's words name the preview toggle; chrome stays. One line to confirm at approval.
- Any change to `src/engine/semantic.js`, the role table, the Figma binder or the MCP server.
- The even path's chroma blend (`climb=true`, #701) and the even-mode floor (#766).
- Removing the `palette`/`global`/`roles` tabs or the `1`/`2`/`3` keys.
- The left analysis pane's selection fallback (`selectedIndex()`), which keeps rendering the last palette's cards after a deselect.
- A curated-corpus re-render or fixture re-capture under U2 unless option A moves a fixture, in which case C2.6 and C2.7 say what may move.

## Risks

- U2 is gated on a ruling; if the owner is slow the other three units land first and U2 ships as the report mode plus question only, with a plan revision moving the engine half to a follow-up ticket. Mitigation: the question file is written with this plan, default A.
- U4 deletes 41 shim lines of test state; a builder who keeps `colorMode` as a hidden seam for tests defeats ask 4. C4.2 pins zero occurrences in `src/ui`.
- The example card rendering two previews doubles the right-pane height on narrow viewports; smoke screenshots show the layout, the verifier reads them.
- Lane overlap U1/U3/U4 on the same three files; serial order and worktrees cut after each merge, stated in section 1.
- `(gid3)` encodes R69 in words that option A keeps true but option B falsifies; the question names it so the ruling is made with the assertion in view.

## Revisions

| Rev | Date | Change |
|---|---|---|
| 0 | 2026-10-01 | Draft written by the planner at 38b0e8b1 on `main`; ask 2 measured on two throwaway probes (section 2) and routed to an owner question before any engine change |
