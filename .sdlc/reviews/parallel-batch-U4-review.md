PASS

# Review: parallel-batch U4 (#786) · reviewer

| Field | Value |
|---|---|
| Unit | U4, only a row click moves the inspector to Palette; `unit/pb-U4` @ 2fb3d39f, base `plan/parallel-batch` @ 7af47a84 |
| Verdict | 🟢 PASS. Every criterion holds and every planted control bites. One minor finding (F1): two of the three changed row handlers have no test that bites them. Fix it before the verifier if cheap, else carry it forward |
| Criteria | C4.1 🟢 · C4.2 🟢 · C4.3 🟢 · C4.4 🟢 shim, 🟡 smoke is the verifier's leg · C4.5 🟢 · C3 🟢 · C4 scope 🟢 |
| Gates | shim `HEADLESS BOOT PASS` in a clean clone at 2fb3d39f. `npm test`: exit 0, `all 54 test files passed`, tree clean after (0 lines) in the clone. `NODE_OPTIONS` unset; heavy-gate count read 2 before the run; load average 65 to 170 |
| Scope | `git diff --name-only 7af47a84..HEAD`: the handoff, `.sdlc/questions/pane-context-U1-f1.md`, `figma/plugin/ui.html`, `src/ui/sections/color.js`, `test/ui/headless-boot.mjs`. Lane plus bundle plus handoff. The archived pane-context plan is untouched. `docs/lld/app-shell.md` correctly left alone: it names `this.segment` (`:202`) but states no selection rule |

## Criteria, re-run

| # | Command (clone at 2fb3d39f unless noted) | Output | |
|---|---|---|---|
| C4.1 | `grep -n 'segment = "palette"' src/ui/sections/color.js src/ui/app.js` | `color.js:939`, `:991`, `:1151` (row `onclick`s), `app.js:94`, `:208` (constructor, reset). None in `selectPalette` (`:255` to `:262`) | 🟢 |
| C4.2 | shim `tail -1`; `grep -c "(b3)"` | `HEADLESS BOOT PASS ...`; `6`, both required labels present | 🟢 |
| C4.3 | `grep -c "(b3) .*keeps roles"` | `3`; run PASS | 🟢 |
| C4.4 | `✗ (b2)/(j7b)/(i-all)/(i-one)` count | `0`; shim PASS. Smoke not run here | 🟢 / 🟡 |
| C4.5 | `grep -n "#786"` on the question file and the archived plan | question `:21`, a dated 2026-10-04 line naming #786 and option B; archive 0 hits, `git diff` on it empty | 🟢 |
| C3 | `em-dash.mjs`, `branding.mjs`, `verdict-frontmatter-check.sh` in the worktree | `clean (1205 files)`, `clean (1197 files)`, `bad 0`; tree clean | 🟢 |

## Negative controls (scratch clones under `$CLAUDE_JOB_DIR/tmp/pb-U4-rev/`)

| Clone | Plant | Shim result | |
|---|---|---|---|
| nc1 | `this.segment = "palette"` re-added inside `selectPalette` | FAIL: the four `(b3)` ArrowDown/add/duplicate/delete lines plus `(j7b) selectPalette(0) from deselected leaves the tab alone` | 🟢 bites (C4.1 to C4.3) |
| nc2 | `_deselect`'s `global` write removed (`app.js:545`) | FAIL: `(b2)`, `(j6-seg)`, `(j7b)` | 🟢 bites (C4.4) |
| nc3 | the ramps-scene row write removed (`color.js:939`) | FAIL: `(b3) row click lands on palette`, `(j7b) a row click from deselected ...` | 🟢 bites |
| nc4 | the ramps-scene off-row write removed (`color.js:991`) | PASS | 🔴 no bite (F1) |
| nc5 | the scrims-scene row write removed (`color.js:1151`) | PASS | 🔴 no bite (F1) |

Segment-state drift: both base and head shims were instrumented to log `app.segment` and `app.sel.kind` at every `ok()` call, then the logs were diffed. Only these labels changed state: `(b3)` (new), `(j7)` and `(j7b)` (the intended split), and `(lr-cols)`, `(ty-ex2)`, `(geo-ex2)`. Those three now run with the Color segment on `roles` instead of `palette`, because `(scheme-ctx)` ends on Roles and `(lr-cols)`'s `selectPalette(0)` no longer flips the tab. None of them reads the Color right pane. `(lr-cols)` checks `.compare-col` canvas nodes, and `(ty-ex2)`/`(geo-ex2)` use `typeSegment`/`geomSegment`. No existing assertion went vacuous.

## Points the lead asked about

| # | Point | Judgment |
|---|---|---|
| 1 | The `(j7b)` rewrite | Faithful. The old line asserted that a direct `selectPalette(0)` lands on `palette`, which is the behaviour #786 removes, so leaving it unchanged would have made the unit fail its own ticket. The split keeps the original intent: from the deselected state, re-picking a palette gets the user back to the Palette inspector with the Chroma slider. It now asserts this through the only path that is meant to do it (a row click), and separately asserts that the direct call leaves `global`. Both lines keep the `(j7b)` prefix, so C4.4's `✗ .*(j7b)` grep still reads them, and nc1 and nc2 each red the first one. The guard reset before the click is correct test hygiene (F3 covers the comment) |
| 2 | Handler coverage, non-click callers | Code: all three row `onclick`s that call `selectPalette` write the segment (`:939`, `:991`, `:1151`). Searching `src/` for `selectPalette(` finds exactly five other callers, `_selectRelative` (`app.js:536`), `addPalette` (`:349`), the new-palette commit (`:478`), `duplicatePalette` (`:1953`) and `deletePalette` (`:1963`), and none of them writes `segment`. The other `sel` writers (`app.js:420` clamp, `color.js:1571` reorder end) never touched the tab. Tests: ArrowDown, add, duplicate and delete are bitten by nc1. The new-palette commit (`:478`) is not driven by `(b3)`, but it shares the same `selectPalette` line nc1 plants, so it is covered by construction. Only the ramps-scene row is test-bitten (F1) |
| 3 | Scope wall C4 | 🟢, see Scope above. `plan/parallel-batch` has since moved to 4afc05cc (U3 merged), which touches `names.mjs`, `test/engine/names.mjs`, `test/run.mjs` and `.sdlc/` records only, so U4's merge has no file overlap |
| 4 | R98, one place that means a click | Met in substance. The rule has no special cases: the selection function no longer decides the tab, no caller carries an exception, and the only writers of `segment` are the three click handlers, the two init sites, `setSegment` and `_deselect`. In form, the write appears three times (F2), and the plan's own section 4 asks for exactly that shape ("into the three row `onclick` handlers") |

## Findings, by severity

### F1 · minor · two of the three changed handlers have no test that bites them

nc4 (off row, `color.js:991`) and nc5 (scrims row, `color.js:1151`) each delete the new write and the shim still passes. No shim group clicks a `.ramp-row.off` or a `.scrim-row`. So a later edit, such as U6 on the same file, could drop either line silently. Fix: in `(b3)`, after the ramps-row click, set the tab to `global`, click one `.scrim-row[data-pi]` under `canvasView = "scrims"`, and click one `.ramp-row.off` (disable a palette first, then restore it). Assert `segment === "palette"` after each click, then re-run nc4 and nc5 to confirm both now red. C4.2 as written asks only for "a row click", so this is not a criterion failure.

### F2 · nit · the click rule is written three times

Each handler repeats the same pair, `this.segment = "palette"; this.selectPalette(i);`, after its drag guard. One `_clickPalette(i)` helper would make "the one place that means a click" literal and would shrink F1 to one test. The plan prescribed the three-handler shape, so this is an observation, not a defect. The off row's guard checks only `_reordering`, not `_didDrag`. That asymmetry predates this unit and is out of scope.

### F3 · nit · record wording

- The handoff names the handlers "palette list, ramps scene off row, mapping scene row", and plan line 67 also says "the mapping scene". The actual handlers are the ramps-scene row (`:939`, inside `renderRampsScene`), the ramps-scene off row (`:991`) and the scrims-scene row (`:1151`, inside `renderScrimsScene`). No Mapping-scene element calls `selectPalette`.
- The `(j7b)` reset comment says the reorder block "leaves its one-shot post-drag click guard armed". In the real app, `color.js:1574` clears `_reordering` with `setTimeout(..., 0)`. The shim runs synchronously and never yields to that timer, so the reset stands in for the browser's next tick. The test is correct; only the comment could say why the guard is still set.

### F4 · info · a visible behaviour change beyond Roles

Option B also means that ArrowUp/ArrowDown after an Esc deselect now stays on Global, where it used to jump to Palette. Add, duplicate and delete also stay on whatever tab is open, Global included. This is what "arrow-step, add, duplicate, delete leave the tab alone" means, and the U1-f1 Answer line says so. The verifier's Safari/smoke pass should see it as intended, not as a regression.
