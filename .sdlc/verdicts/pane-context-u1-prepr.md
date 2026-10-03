---
kind: verdict
plan: pane-context-u1
seat: verifier
pass: 2
ticket: "#785"
written: 2026-10-03
---

# Pre-PR · pane-context-u1 · pass 2 · 🟢 at `a5e0bf2d`: baseline figure repaired, smoke green

Current state: pass 2 🟢 at `a5e0bf2d`. The only change since pass 1 is the `.sdlc/baseline.md` figure and its Correction; `baseline-agrees-check.sh` now reads `stale total: 0`, and `npm run smoke` passes on the head. Pass 1 (🔴 at `b1579ec2`) follows as history.

verdict: 🟢
sha: a5e0bf2dd49b50157efc34e45c4b50b33b3b9bdc
version: n/a (a plan landing, no release)

Pass 1 lines: `verdict: 🔴` at `b1579ec27a1da2d02f7e6b8c3eff6967e5cf27c5`.

## Pass 1 · 🔴 at `b1579ec2`

`plan/pane-context-u1` at `b1579ec2` (PR #790, U1 of #785 landed alone for the owner preview; U2 to U4 stay on `plan/pane-context`). Diff against `origin/main`: `src/ui/app.js` +1, `src/ui/sections/color.js` +1, `test/ui/headless-boot.mjs` +7, regenerated `figma/plugin/ui.html`. Checkers in fresh context, both dispatched by this seat: reviewer-l3 (opus) on the whole diff (PASS, two 🟡) and verifier-l2 (opus) on C1.1 to C1.5, the baseline gates, `.sdlc/checks/` and CI. Substitution per R86/R92: fable is capped, so reviewer-l3 and verifier-l2 stand in for reviewer-l4 and verifier-l3. The U1 builder was grade l2 (sonnet), so both checkers sit outside the builder's family. The seat reproduced the red row itself in the verifier's clone at `b1579ec2`. The Orchestrator's own reviewer report was not used as evidence.

### Rows

| Check | State | Evidence | Negative control |
|---|---|---|---|
| `baseline-agrees-check.sh` | 🔴 | Seat rerun in the clone at `b1579ec2`: `STALE ui.html: baseline 4160.0 KB, tree 4160.2 KB`, `stale total: 1`, exit 1. `git cat-file -s` on `figma/plugin/ui.html`: `4286822` on origin/main, `4287020` at the head (+198 bytes). `.sdlc/baseline.md` still reads `wrote figma/plugin/ui.html 4160.0 KB`. The same script on origin/main `e6661522` and on the PR base `a6eed831` exits 0 | Verifier set the baseline figure to `4160.2 KB` at the head: `stale total: 0`; set it to `4159.0 KB` on main: exit 1 naming it. So the check reads the figure, and the repair is that one figure |
| C1.1 `(j6-seg)` | 🟢 | `FORCE_COLOR=0 node test/ui/headless-boot.mjs` exit 0, `HEADLESS BOOT PASS`; `grep -cF '(j6-seg)'` `1` at head, `0` on main | Deleted `this.segment = "global"` in `_deselect`: exit 1, `✗ (j6-seg) ... (got palette)` and `✗ (b2) ...`. Restored, porcelain empty |
| C1.2 `(j7b)` | 🟢 | Same run exit 0; `grep -cF '(j7b)'` `1` | Deleted `this.segment = "palette"` in `selectPalette`: exit 1, only `✗ (j7b) ... (got global)`. Restored |
| C1.3 `(b2)` | 🟢 | Same run exit 0; both `(b2)` assertions present (`grep -cF '(b2)'` `3`) and silent-pass | Plan control (render resets `segment` from `sel`) crashes the full shim at `tensionInput.value` before fails print; a probe of shim lines 1 to 291 plus the report tail exits 1 with `✗ (b2) setSegment("roles") ... survives a second render (got palette)`, Esc half green. Probe deleted, restored |
| C1.4 keys stay | 🟢 | `grep -c 'case "1":\|case "2":\|case "3":' src/ui/app.js` = `3` | Deleted `case "3":`: prints `2`. Restored |
| `npm test` | 🟢 | `npm test` exit 0, `✓ all 54 test files passed`, 296 s under load 16 to 24; `git status --short` empty after | `"scrim` to `"scrimX` in `role-table.json`: `▶ engine/semantic.mjs FAIL`, `✗ 1/54 test file(s) failed`. Restored, porcelain empty |
| `npm ci && npm run build` | 🟢 | Both exit 0, `wrote figma/plugin/ui.html 4160.2 KB`; `shasum -a 256` of `ui.html` `7978c41dede3b371` before and after, porcelain empty | Appended a type error to `src/main.ts`: build exit 1, `TS2322`. Restored |
| other `.sdlc/checks/` | 🟢 | `card-amendment` `stale total: 0`; `doc-drift-rows` `bad 0`; `verdict-frontmatter` `verdicts 262 graded 262 bad 0`; `ceiling-counts` `clean` | Each reds under an injected edit (`stale total: 6`, `bad 1`, `VALUE ... maybe`, `FAIL adapter note max`), restored |
| `card-source-range-check.sh` | 🟡 | Exit 1, `range mismatches: 3` (ADR-026, ADR-027 line ranges). Output byte-identical on origin/main `e6661522` and `a6eed831`; this PR touches no record or ADR file | The identical red on main is the control: the PR neither causes nor fixes it. A red on main for its own owner, named here, not absorbed |
| Whole-diff review | 🟢 | reviewer-l3 `PASS`: both added lines traced through every caller; `claims.py` `unresolved 0`; `git merge-tree --write-tree` against origin/main clean; no dependency, secret, `node_modules` or private-docs change; PR body says `Part of #785` | Deleting either added line reds its test (above), so the review's correctness claim is backed by a failing run |
| CI on the head | 🟡 | `gh pr checks 790`: build-test, panda-smoke, corpus-contrast and 8 sweeps `pass`; run `37135551791` on headSha `b1579ec2`. Stated, not certified | `gh run list` names the headSha, so the green run is this sha, not an older one |
| `npm run smoke` | 🟡 | Not run in this pass; the unit touches `src/ui/`, so the adapter gives smoke to the verifier. CI's `panda-smoke` leg is green on the head | Owed with pass 2 |

### Findings

- 🔴 Update `.sdlc/baseline.md`'s `npm run build` figure for `figma/plugin/ui.html` from `4160.0 KB` to `4160.2 KB` (with its Correction line) in this PR. Any change outside the record and `.sdlc/questions/` moves the head, so pass 2 grades the new sha.
- 🟡 For the owner preview (reviewer, not blocking): `selectPalette` sets `segment = "palette"` on every call, so arrowing through palettes, re-clicking the selected row, add, duplicate and delete all move a user on Roles or Story back to Palette. This matches the plan's decision line; C1.3's "tabs still win while the selection is unchanged" covers re-renders, not re-selection. A guard on the none-to-palette transition would keep the tab.
- 🟡 Escape in Typography or Geometry also runs `_deselect`, so Color reopens on Global.
- 🟡 Stale comment at `src/ui/app.js:1926` ("default is Palette"); no CHANGELOG entry in this PR (the plan gives it to U2 and U4); `figma/plugin/ui.html` will conflict when `plan/pane-context` next syncs with main: regenerate, never pick a side.

## Pass 2 · 🟢 at `a5e0bf2d`

`git diff --stat b1579ec2 a5e0bf2d` is `.sdlc/baseline.md` only (3 insertions, 1 deletion): the `npm run build` cell reads `4160.2 KB` and a Correction names the cause (U1's two lines inlined into `ui.html`, 4286822 to 4287020 bytes). No file outside `.sdlc/` moved, so pass 1's code, test, build and review rows stand for this sha. The seat ran both new rows itself in the pass 1 verifier clone, checked out at `a5e0bf2d` with an empty porcelain. Checkers as pass 1 (reviewer-l3 and verifier-l2, opus, standing in for fable per R86/R92; builder grade l2, sonnet).

### Rows

| Check | State | Evidence | Negative control |
|---|---|---|---|
| `baseline-agrees-check.sh` | 🟢 | At `a5e0bf2d`: `ok    ui.html: baseline 4160.2 KB, tree 4160.2 KB`, `stale total: 0` | Pass 1's run at `b1579ec2` (same tree, old figure) read `STALE ui.html: baseline 4160.0 KB, tree 4160.2 KB`, exit 1. The figure is what the check reads |
| `npm run smoke` | 🟢 | `npm run smoke` (runs `npm run build` first) exit 0, last line `SMOKE PASS, gallery · category · editor · export dialog all render in a real browser`, 42 s under load 19 to 24; porcelain empty after | Set the New-Palette color input's `type: "color"` to `type: "text"` in `src/ui/sections/color.js`: exit 1, `✗ Custom tab has a native color picker seeded from the proposed color`, `SMOKE FAIL (1)`. Restored with `git checkout -- .`, porcelain empty |
| CI on the head | 🟡 | `gh pr view 790` headRefOid `a5e0bf2d`; run `37136737134` on `a5e0bf2d` `in_progress` at grading time; the prior run `37135551791` on `b1579ec2` (same tree outside `.sdlc/`) is `success`. Stated, not certified: landing needs the required legs green on the landed sha | `gh run list` names each run's headSha, so the green run is named as the older sha, not this one |

### Findings

- 🟢 Pass 1 red closed by the one-figure repair, with its Correction line.
- 🟡 Owner-preview notes from pass 1 stand as notes (re-selection resets the tab to Palette; Escape in Typography or Geometry lands Color on Global; stale comment at `src/ui/app.js:1926`; `ui.html` will conflict on the next `plan/pane-context` sync, so regenerate it).
- 🟡 `card-source-range-check.sh` stays red on main (ADR-026, ADR-027 ranges), not this PR's.
