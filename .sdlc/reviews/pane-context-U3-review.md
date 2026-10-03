PASS

# Review pane-context U3 (#785), pass 2

Reviewer grade l3. Pass 2 reviews `8170246f..fd1cae1d` (fix `4dbd409c`, handoff `fd1cae1d`) against C3.1 to C3.4, the U3 line of `plan/pane-context:.sdlc/plans/pane-context.md`, and the pass 1 findings. Pass 1 (`8170246f`) was FAIL on finding 1.

## Findings

PASS: all three pass 1 findings are fixed, and the new assertions fail on the mutants that survived pass 1.

| # | Severity | Where | Finding | Fix |
|---|---|---|---|---|
| 1 | ⚪ Info | `test/ui/headless-boot.mjs:493`, `:516` | `(i-all)` now runs with `Tertiary` off, so the shim checks `15` tables, `795` role rows, `810` `.rrow`, not C3.1's literal default-kit `16` / `848` / `864`. The assertions compare against `enabledN` derived from `app.doc`, which is what C3.1's text asks for ("equal in count to the enabled palette count"); the all-on numbers are the pass 1 probe in the handoff. The Verifier should read C3.1's parentheticals as the all-on example, not as a needle. | None required. |
| 2 | ⚪ Info | `test/ui/headless-boot.mjs:493`, `:516` | The off and on toggles go through `app.commit`, so the undo stack ends the block two entries longer than it started. Later groups pass. `app.undo()` twice would leave history as it was. | Optional. |

Pass 1 findings, closed:

| Pass 1 # | Evidence (fix at `4dbd409c`) | Control | State |
|---|---|---|---|
| 1 enabled filter unguarded | `app.commit` sets `d.palettes[3].on = false` before `_deselect()`; a setup assert pins exactly one palette off; a new assert says `Tertiary` has no table | `view.palettes.filter((p) => p.on)` replaced by `view.palettes` in a scratch copy: `HEADLESS BOOT FAIL`, exit 1, 6 fails, first `(got 16 of 15)`, last `the disabled palette "Tertiary" has no table` | 🟢 |
| 2 swatch order unasserted | each role pair's two children must carry `title` starting `light ref ` then `dark ref ` | `lightHex` and `darkHex` `swatch(...)` lines swapped in a scratch copy: exit 1, 1 fail, `(i-all) each role pair holds two swatches, light then dark` | 🟢 |
| 3 `doc.selected` leak | `keepDocSel` saved and restored with `sel` and `segment`; `on` restored by a second `commit` | code read: the restore line sets `app.doc.selected = keepDocSel`; deleting it brings back pass 1's `doc.selected 2` probe result | 🟢 |
| 4 dead fallback | `\|\| view.palettes[0]` removed (`color.js:2246`); `.filter(Boolean)` still covers an empty doc | `grep -c 'selectedIndex()] \|\| view.palettes\[0\]' src/ui/sections/color.js` prints `0` at `fd1cae1d` and `1` at `8170246f` | 🟢 |

R98: none found. The one pass 1 item (the unreachable `|| view.palettes[0]`) is removed; no compatibility shim, dead-key fallback, special-case override or legacy layer remains in the diff.

## Checks run

| Check | Evidence | Control | State |
|---|---|---|---|
| Shim at head | Scratch copy of `fd1cae1d`, `unset NODE_OPTIONS; FORCE_COLOR=0 node test/ui/headless-boot.mjs`: `HEADLESS BOOT PASS`, exit 0; the existing `(i)` lines and every other group still hold | the two mutants in the table above red it | 🟢 |
| C3.4 | Detached git worktree at `fd1cae1d`: `bash -c 'set -o pipefail; npm test 2>&1 \| tail -2'` prints `all 54 test files passed`, exit 0; `git status --short` empty, so the committed `figma/plugin/ui.html` matches the regenerated one | a stale `ui.html` would show as `M figma/plugin/ui.html` | 🟢 |
| Lane | `git diff --stat 8170246f..fd1cae1d`: `src/ui/sections/color.js` (1 line), `test/ui/headless-boot.mjs`, `figma/plugin/ui.html`, the handoff | a file outside the U3 lane would appear in the stat | 🟢 |
| Both modes, unchanged since pass 1 | the pass 2 `color.js` hunk only drops the fallback; the `sel.kind` branch, the `p.on` filter and `_rolesTable` are as reviewed at pass 1 | handoff C3.1 and C3.2 controls (selected-only, dropped branch, dropped `h4`) target lines this pass did not touch | 🟢 |
| U1 arrow-step bounce (#786, owner ruled keep) | `src/ui/app.js` is not in `383d3b21..fd1cae1d`; `selectPalette` still sets `segment = "palette"` | `git diff 383d3b21..fd1cae1d -- src/ui/app.js \| wc -l` prints `0` | 🟢 |
| Safari/WebKit | no CSS change in pass 2; pass 1's three rules (`styles.css:1037-1039`) carry no `font-family` and no SVG | `git diff 8170246f..fd1cae1d -- src/ui/styles.css \| wc -l` prints `0` | 🟢 |

## Next

Verifier (l2) on `unit/pc-U3` at the commit that adds this file.
