# Review pane-context U3 (#785), pass 1

Reviewer grade l3, fresh context. Diff `383d3b21..unit/pc-U3` (code `2ce764b1`, handoff `5b9b5c90`) against C3.1 to C3.4 and the U3 line of `plan/pane-context:.sdlc/plans/pane-context.md`.

## Findings

FAIL: one required fix. The behaviour is correct; one assertion half does not bite.

| # | Severity | Where | Finding | Fix |
|---|---|---|---|---|
| 1 | 🔴 Major | `test/ui/headless-boot.mjs:492-502`, `src/ui/sections/color.js:2246` | `(i-all)` cannot tell "enabled palettes" from "all palettes". The default kit has 16 palettes and all 16 are on, so `enabledN === app.doc.palettes.length` and every count and name assertion holds whether or not `renderRolesInspector` filters on `p.on`. Mutant run: `view.palettes.filter((p) => p.on)` replaced by `view.palettes` gives `HEADLESS BOOT PASS`, exit 0. "Per enabled palette" is the plan's U3 wording and C3.1's count; the filter is one of the two new logic lines in the unit and nothing guards it. | Inside the `(i-all)` block, turn one palette off (`app.doc.palettes[3].on = false`), re-render with nothing selected, assert `15` tables and that its name is absent from `names()`, then restore `on = true`. Re-run the mutant above as the negative control and record it in the handoff. |
| 2 | 🟡 Minor | `test/ui/headless-boot.mjs:505` | The message says "two swatches (light then dark)" but the predicate only counts children. Mutant run: the `lightHex` and `darkHex` `swatch(...)` calls swapped in `_rolesTable` gives `HEADLESS BOOT PASS`. C3.3 names the order. The swatch code is moved verbatim, so no regression today; the message overclaims. | Assert order, e.g. the first child's `title` starts with `light ref ` and the second's with `dark ref `, or drop "(light then dark)" from the message. |
| 3 | 🟡 Minor | `test/ui/headless-boot.mjs:491`, `:506`, `:511` | Test state leak. `selectPalette(2)` sets `app.doc.selected = 2` and calls `save()`; the restore puts back `app.sel` and `app.segment` but not `doc.selected`. Probe after the block: `keepSel {"kind":"palette","id":0}`, `doc.selected 2`. Later groups still pass, so nothing reds; it is a hidden dependency for whoever edits the shim next. | Save and restore `app.doc.selected` alongside `keepSel`. |
| 4 | ⚪ Info | `src/ui/sections/color.js:2246` | `view.palettes[this.selectedIndex()] \|\| view.palettes[0]` keeps the pre-existing fallback. `selectedIndex()` clamps into `doc.palettes`, and `projectView` emits one view palette per doc palette, so the right side is reached only when the list is empty, where it is also `undefined`. The `.filter(Boolean)` on the next line already covers the empty doc. Dead but harmless; see R98. | Optional: `[view.palettes[this.selectedIndex()]]` and keep the `.filter(Boolean)`. |

R98: one dead-key fallback found, finding 4 (`|| view.palettes[0]`, carried over from the old line, unreachable). No compatibility shim, special-case override or legacy layer.

## Checks run

| Check | Evidence | Control | State |
|---|---|---|---|
| Both modes correct | Code read: `one = sel.kind === "palette"`; `sel.kind` takes only `"palette"` and `"none"` (`app.js:93,209,414,538`, `color.js:257,1637`). Nothing selected: `view.palettes.filter(p => p.on)` in `projectView` order, which is `doc.palettes` order (canvas order); `view.on` is `p.on !== false` (`model.mjs`), the same predicate the test uses. Each `_rolesTable` emits `.roles-group` > `h4.roles-table-name` + `.roles-table` with its own `.rrow.rhead` and a `.sw-pair` per row. Probe with palette 3 off: `15` tables, headings `["Secondary","Info","Success"]` around the gap | palette 3 turned off in a scratch copy: 15 tables, Tertiary absent | 🟢 |
| Shim at head | `unset NODE_OPTIONS; FORCE_COLOR=0 node test/ui/headless-boot.mjs`: `HEADLESS BOOT PASS`; the existing `(i)` lines and every other group still hold | handoff mutants below red it | 🟢 |
| Handoff controls | Handoff C3.1 to C3.3 controls (selected-only in the all branch; drop the `sel.kind` branch; drop the `h4`) match the code paths they claim to break; the asserts they name are the ones that red | the three handoff mutants, each exit 1 | 🟢 |
| Extra mutants | drop the `p.on` filter: survives (finding 1); swap light and dark swatches: survives (finding 2) | the mutants themselves | 🔴 |
| C3.4 | Detached git worktree at `5b9b5c90`: `bash -c 'set -o pipefail; npm test 2>&1 \| tail -3'` prints `all 54 test files passed`, exit 0, `git status --short` empty. The committed `figma/plugin/ui.html` is byte-identical to the one `npm test` regenerates | adapter §1 `"scrim` control not re-run (role table untouched) | 🟢 |
| Lane | `git diff --stat 383d3b21..unit/pc-U3`: `src/ui/sections/color.js`, `src/ui/styles.css`, `test/ui/headless-boot.mjs`, `figma/plugin/ui.html`, plus the handoff. Nothing outside the lane; `.sdlc/board.md` and the plan untouched | `git diff --name-only 383d3b21..unit/pc-U3 \| grep -v -E '^(src/ui/sections/color\.js\|src/ui/styles\.css\|test/ui/headless-boot\.mjs\|figma/plugin/ui\.html\|\.sdlc/)' \| wc -l` prints `0`; a file outside the lane would count `1` or more | 🟢 |
| Safari/WebKit | Three new rules at `styles.css:1037-1039`: plain margins, `font-size`, `font-weight`, `color: var(--ink)`. No interpolated `font-family`, no SVG, no new selector WebKit treats differently. No global `h4` rule in `styles.css` competes with `.roles-table-name` | `git diff 383d3b21..unit/pc-U3 -- src/ui/styles.css \| grep -c font-family` prints `0`; an interpolated family in the new rules would count `1` | 🟢 |
| U1 arrow-step bounce (#786, owner ruled keep) | `src/ui/app.js` is not in the diff; `_selectRelative` (`app.js:525`) and `selectPalette` (`color.js:254-261`, still sets `segment = "palette"`) are unchanged, so arrow-stepping on Roles still bounces to Palette as ruled | `git diff 383d3b21..unit/pc-U3 -- src/ui/app.js \| wc -l` prints `0` and `grep -c 'this.segment = "palette"; // the right pane follows' src/ui/sections/color.js` prints `1`; a unit that touched the bounce would print a nonzero diff or `0` | 🟢 |
| Stale records | `docs/lld/app-shell.md` and `component-inventory.md` carry no Roles-panel description the change invalidates; the `.insp-sub` text change is asserted nowhere outside the shim | `grep -rn 'insp-sub\|semantic roles' test/ docs/lld docs/reference/references/component-inventory.md` outside the shim: no Roles hit | 🟢 |

## Next

Builder pass 2: findings 1 to 3 in `test/ui/headless-boot.mjs` only (finding 4 optional), shim and `npm test` green, the `p.on` mutant recorded as the new negative control.
