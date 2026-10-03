---
kind: verdict
plan: pane-context-u1
seat: verifier
pass: 1
ticket: "#785"
written: 2026-10-03
---

# Pre-PR · pane-context-u1 · pass 1 · 🔴 at `b1579ec2`: U1 is correct and every gate is green, but the PR grows `ui.html` and leaves the baseline figure stale

Current state: pass 1 🔴 at `b1579ec2`. One red, `baseline-agrees-check.sh`, introduced by this PR; a one-line `.sdlc/baseline.md` repair clears it.

verdict: 🔴
sha: b1579ec27a1da2d02f7e6b8c3eff6967e5cf27c5
version: n/a (a plan landing, no release)

`plan/pane-context-u1` at `b1579ec2` (PR #790, U1 of #785 landed alone for the owner preview; U2 to U4 stay on `plan/pane-context`). Diff against `origin/main`: `src/ui/app.js` +1, `src/ui/sections/color.js` +1, `test/ui/headless-boot.mjs` +7, regenerated `figma/plugin/ui.html`. Checkers in fresh context, both dispatched by this seat: reviewer-l3 (opus) on the whole diff (PASS, two 🟡) and verifier-l2 (opus) on C1.1 to C1.5, the baseline gates, `.sdlc/checks/` and CI. Substitution per R86/R92: fable is capped, so reviewer-l3 and verifier-l2 stand in for reviewer-l4 and verifier-l3. The U1 builder was grade l2 (sonnet), so both checkers sit outside the builder's family. The seat reproduced the red row itself in the verifier's clone at `b1579ec2`. The Orchestrator's own reviewer report was not used as evidence.

## Rows

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

## Findings

- 🔴 Update `.sdlc/baseline.md`'s `npm run build` figure for `figma/plugin/ui.html` from `4160.0 KB` to `4160.2 KB` (with its Correction line) in this PR. Any change outside the record and `.sdlc/questions/` moves the head, so pass 2 grades the new sha.
- 🟡 For the owner preview (reviewer, not blocking): `selectPalette` sets `segment = "palette"` on every call, so arrowing through palettes, re-clicking the selected row, add, duplicate and delete all move a user on Roles or Story back to Palette. This matches the plan's decision line; C1.3's "tabs still win while the selection is unchanged" covers re-renders, not re-selection. A guard on the none-to-palette transition would keep the tab.
- 🟡 Escape in Typography or Geometry also runs `_deselect`, so Color reopens on Global.
- 🟡 Stale comment at `src/ui/app.js:1926` ("default is Palette"); no CHANGELOG entry in this PR (the plan gives it to U2 and U4); `figma/plugin/ui.html` will conflict when `plan/pane-context` next syncs with main: regenerate, never pick a side.
