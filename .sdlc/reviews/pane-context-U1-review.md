PASS

# Review pane-context U1 · reviewer-l3 · pass 1

Checker family: reviewer-l3 (opus) checks a builder-l2 (sonnet) unit, so the family is independent.

Target: unit/pc-U1 @ bf605767 (code 76e750d5), cut from plan/pane-context at e062eb42, ticket #785. Criteria from `plan/pane-context:.sdlc/plans/pane-context.md`: section 1 Decisions (U1), section 4 C1.1 to C1.5, the U1 line under Units, Not in scope. Fresh context. Scratch trees under the job tmp dir `pcU1r/` (base = `git archive HEAD`; one copy per control; `c15` = base committed in a scratch git repo for the clean-tree check). The unit worktree was not written except this record.

## Verdict: PASS

Every criterion replays green on the head and every new assertion reds under its control, including the two controls the builder did not re-run (C1.4, C1.5) and the plan-literal broad form of the `(b2)` control. The diff is the handoff's file list and nothing more. Findings are advisory.

## Scope

| Check | Evidence | State | Control |
|---|---|---|---|
| Diff limited to the handoff | `git diff --stat e062eb42..HEAD`: `src/ui/app.js` +1, `src/ui/sections/color.js` +1, `test/ui/headless-boot.mjs` +7, `figma/plugin/ui.html` (bundle), the handoff. No `src/engine/`, no role table, no `.sdlc/board.md`, no plan edit | 🟢 | `npm test` in `c15` regenerates `ui.html` and `git status --short` stays empty, so the committed bundle is exactly the generated one |
| Only `selectPalette` and `_deselect` write `segment` | The two added source lines are `this.segment = "palette"` in `selectPalette` and `this.segment = "global"` in `_deselect`; `sel` shape, `selectedIndex()` and `setSegment` untouched | 🟢 | `grep -n 'this.segment\s*='` over `src/` lists only the constructor, `_loadRecord`, `setSegment` and these two |
| Tabs and `1`/`2`/`3` keys stay | `renderRightPane` tabs unchanged; key cases unchanged | 🟢 | C1.4 below |
| Private-docs guard, Safari traps, `html:` count | No `.claude/docs/other` path in the diff (`grep -c` 0); no CSS, font-family or SVG change; no `html:` attribute added | 🟢 | `git diff e062eb42..HEAD -- src \| grep -cE 'font-family\|fill:\|html:'` prints 0; the same needle on `src/ui/sections/color.js` prints 8, so it matches when the surface is present |

## Criteria

| Id | Evidence on head | State | Control (replayed here) |
|---|---|---|---|
| C1.1 | `FORCE_COLOR=0 node test/ui/headless-boot.mjs`: `HEADLESS BOOT PASS`, exit 0 (the only stack trace is the `(acct)` block's intentional `Error: network`). `(j6)`, `(j6b)` hold; `(j6-seg)` holds | 🟢 | `nc1`: `_deselect`'s `segment` line deleted, exit 1, exactly 2 fails: `(b2) Esc deselect ... (got palette)` and `(j6-seg) ... (got palette)`. DOM half probed separately: right pane carries `[data-group-row]` on head (`global true`), not on `nc1` (`palette false`), so the second conjunct is not vacuous |
| C1.2 | `(j7b)` holds: `segment === "palette"` and `slider:Chroma` in `.right-pane` after `selectPalette(0)` from deselected | 🟢 | `nc2`: `selectPalette`'s `segment` line deleted, exit 1, exactly 1 fail: `(j7b) ... (got global)`. DOM half probed: `slider:Chroma` present on head (`palette true`), absent on `nc2` (`global false`) |
| C1.3 | `(b2)` both halves hold: Esc lands on `global`; `setSegment("roles")` with palette 2 selected survives a second `render()` | 🟢 | `nc3b` (builder's narrow mutant, replayed): exit 1, 1 fail, `(b2) setSegment("roles") ... survives a second render (got palette)`. `nc3` (the plan's literal control, `render()` resets `segment` from `sel` on every pass): a `B2PROBE` line inserted after `(b2)` prints that same fail as recorded, then the shim crashes at an unrelated later step, exit 1. See F2 |
| C1.4 | `grep -c 'case "1":\|case "2":\|case "3":' src/ui/app.js` prints `3` (run here, not by the builder) | 🟢 | `nc4`: `case "3":` deleted, the grep prints `2` |
| C1.5 | In `c15`: `bash -c 'set -o pipefail; npm test 2>&1 \| tail -3'` ends `all 54 test files passed`, exit 0; `git status --short` empty after | 🟢 | `nc5`: `sed 's/"scrim/"scrimX/'` on `docs/reference/data/role-table.json` (`scrimWeakest` to `scrimXWeakest`); `node test/engine/semantic.mjs` prints `FAIL: 1 gate failure(s)`, exit 1; the same file on head exits 0 |

## Findings, ranked

| # | Severity | Item | Evidence | State | Control |
|---|---|---|---|---|---|
| F1 | Low | `selectPalette` has five non-click callers, and each now moves the pane to Palette | `_selectRelative` (ArrowUp/ArrowDown), `addPalette`, the new-palette commit, `duplicatePalette`, `deletePalette` all call `selectPalette`. A user on the Roles tab stepping palettes with the arrow keys is bounced to Palette on the first press. This follows the plan's Decision as written ("`selectPalette` sets `segment` to `palette`"), so it is not a builder defect; it does sit awkwardly with U3, where Roles shows the selected palette and arrow-stepping on Roles is the natural flow. No shim assertion pins arrow-key behaviour on Roles either way | 🟡 planner and Orchestrator: confirm the arrow keys should leave Roles, or move the write into the row `onclick` handlers in U3 | `grep -n 'selectPalette(' src/ui` lists the callers; `(b2)` covers only an explicit `setSegment` then `render` with no selection change |
| F2 | Info | The builder's narrow `(b2)` control is honest | The narrow mutant only fires on the exact `(b2)` state, so on its own it proves little more than that the assertion reads `segment` after `render()`. The handoff discloses the scoping and the reason. The plan-literal broad mutant does reach `(b2)` and records its fail; the run then dies on a null element later because every Roles and Global test loses its pane (here at shim line 452, `Cannot set properties of null (setting 'value')`; the builder reported line 502 for a different broad variant). Either way the assertion bites under the control the plan names | 🟢 | `nc3` `B2PROBE` output: `["(b2) setSegment(\"roles\") with a palette selected survives a second render (got palette)"]` |
| F3 | Info | `(j6-seg)` reads `"group-row" in e.dataset` | The shim stores `dataset` under the raw hyphenated key (`setAttribute` slices `data-`), so this matches the shim's existing idiom (`"pi" in e.dataset`); a real DOM would key it `groupRow`. Test-only, shim-only, correct for this harness | 🟢 | DOM-half probe in C1.1's control |
| F4 | Info | `npm run build` not run | No `node_modules` in the worktree or here; the bundle chain via `npm test` is proven clean. The Verifier runs the build per plan section 3 | 🟡 Verifier | `ls -d node_modules` in the worktree: `No such file or directory`, so the build cannot run here; it is noted, not failed |
