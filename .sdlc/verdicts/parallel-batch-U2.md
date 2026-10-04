---
kind: verdict
plan: parallel-batch
unit: U2
seat: verifier
pass: 1
ticket: "#786"
written: 2026-10-04
---

# parallel-batch U2 · pass 1 · 🟢 at `b34ba577`

verdict: 🟢
sha: b34ba5772b478438703e5018ab135f3eda80504d

Unit `unit/pb-U2` at `b34ba577` (code `1d2f65c1`, adapter rework `f2f2e299`), base `61bcd123`, against C2.1 to C2.5 of plan revision 5 and the request `.sdlc/handoffs/parallel-batch-U2-verify.md`. Builders were sonnet (builder-l2 pass 1, builder-l3 pass 2); the checker is this seat on opus (verifier-l2 grade, run in-seat under R86/R92), so the check is independent across families. Preflight: `verdict.py check` exits 0 on the request. Every run is in fresh clones under this seat's job dir: `h` at `b34ba577` (`git rev-parse HEAD` printed the full head sha) and `b` at `61bcd123` (`rev-parse --short=8` printed `61bcd123`). `NODE_OPTIONS` was unset and the process probe read `0` before each gate. The 1-minute load was 45, so no row is a timing row.

## Rows

| Criterion | State | Evidence | Negative control |
|---|---|---|---|
| C2.1 fourth copy gone, nothing needed it | 🟢 | head: `grep -rn GEOMETRY_FIELD_RENAME_MAP figma/binder/mode-apply-plan.mjs` prints nothing; `git grep -n "GEOMETRY_FIELD_RENAME_MAP.*mode-apply-plan"` exit 1; operative `git grep -nP "\b(MAP\|A)\.GEOMETRY_FIELD_RENAME_MAP"` exit 1. Only importers of the name are `test/figma/binder.mjs:15` and `test/figma/plugin.mjs:17`, both from `migrations.mjs`; `code.js:91` is the sandbox's own parity-gated const. `npm test` green (below) | base clone: the first grep prints `2` lines. Planted `x = MAP.GEOMETRY_FIELD_RENAME_MAP;` in `test/figma/binder.mjs`: the `-P` grep prints it (exit 0) while the plan's `-E` form still exits 1, re-proving the reviewer's finding that `-E` is vacuous here; restored, porcelain `0` |
| C2.2 E1 pinned on a single-quoted heading | 🟢 | head: `node test/repo/em-dash.mjs \| head -1` prints `self-test: PASS`; `grep -c "single-quoted heading\|singleQuote"` is `1` (base `0`) | `"'"` dropped from `:346` (`enclosingStringContent`): `self-test: FAIL 1 case(s)`, `✗ E1 single-quoted heading: matched R8, expected R2s`, exit 1. The same drop at `:229` (`insideStringAt`) alone: `self-test: PASS`, confirming `:346` is the only feeding list. Restored, porcelain `0` |
| C2.3 `ds-export.js:769 to 770` clean under the line-local fix | 🟢 | base clone: `node test/repo/em-dash.mjs --fix` prints `R8 0`, `git diff --stat -- src/engine/ds-export.js` is empty, whole-tree porcelain `0`, the gate prints `em-dash: clean (1171 files scanned)`. No hand edit was needed, as the handoff states | U+2014 planted before `primary text` on `:769`: the gate prints `✗ src/engine/ds-export.js:769`, exit 1; restored |
| C2.4 four pitfalls in adapter §1 | 🟢 | head: the `awk '/^## 1/,/^## 2/'` slice count is `5` (per needle `1`, `2`, `1`, `1`); base `0`. `baseline-agrees` `ok    head:` count `1` at head and `1` at base | the bullet moved under `## 2. Branch and PR`: the slice count reads `0`; restored |
| C2.4 pitfalls true, not only present | 🟢 | (1) `.gitattributes:11` is `code.js linguist-generated -diff`, `git check-attr` reads `diff: unset`, and `git diff 30c3a7aa^ 30c3a7aa -- code.js` prints `Binary files ... differ` with `0` changed lines, against `7` with `--text`. (2) Fixture labels that also sit in comment prose in the same file: `font/headline` (2 comment lines) in `test/figma/plugin.mjs`, `generate_kit` in three `test/mcp/*` files. (3) The handoff's scratch repo, rerun here: fork-point list `2`, unit-base list `1`; live, `git merge-base origin/main origin/plan/parallel-batch` is `8d07d532`, the plan fork point. (4) Rerun: rewrap under strip `1`, strip plus blank drop `0`, a code edit `2`; `"http://a"` against `"http://b"` strips to the same text (`0` against `2` raw) | each pitfall's reading has its own contrast: `--text` `7` against `0`; label count against `name: "` count; unit-base `1` against fork-point `2`; rewrap `0` against code edit `2` |
| C2.5 scope and claims ledger | 🟢 | `git diff --name-only 61bcd123 b34ba577`: `.sdlc/adapter.md`, the handoff, the two review records, `mode-apply-plan.mjs`, `figma/plugin/ui.html`, `test/repo/em-dash.mjs`. Ledger needles at head: `diff: unset` `1`, `Binary files` `1`, `name: "` `2`, `unit base` `1`, `comment rewrap` `1`, `E1 single-quoted heading` present, `export const GEOMETRY_FIELD_RENAME_MAP` `0` in `mode-apply-plan.mjs` (absent row). The handoff `ran` block rerun (scratch path swapped to this seat's) differs from `out` only by the head sha on line 1, `1174` against `1173` files scanned and the added `-review-p2.md` line, all from the later review commit | an absent needle reads `0` (the `export const` row), so the counter separates present from absent; the C2.1 base grep reads `2` for the same name |
| `npm test` | 🟢 | clone `h`: rc `0`, `✓ all 54 test files passed`, `▶ repo/em-dash.mjs pass`, porcelain `0` after, so the committed `ui.html` equals its regeneration | the C2.2 `:346` mutation makes `node test/repo/em-dash.mjs` exit `1`, and that file is the `repo/em-dash.mjs` leg in `test/run.mjs` TESTS (count `1`); the full suite was not rerun under the mutation |
| Merge | 🟢 | `git merge-tree --write-tree origin/plan/parallel-batch b34ba577` rc `0`, clean; against `origin/plan/pane-context` the only conflict is `.sdlc/board.md`, and `ui.html` auto-merges | `.sdlc/board.md` shows the tool reports a real conflict |

## Findings

- 🟡 C2.1's plan text still carries the vacuous `-E` grep (`\b` is ignored on macOS `git grep -E`). Graded with the `-P` form per the request. The wording fix waits on the owner's answer about the revision cap.
- 🟡 Pitfall 2's advice holds, but `name: "<label>` without the closing quote still counts prefix collisions. In `em-dash.mjs`, `R2 heading label` and `E1 two strings on one line` each read `2` for one fixture. A follow-up could add "close the quote" to the bullet. Not a criterion.
- 🟡 The `npm test` control is indirect: the mutation reds the em-dash leg on its own, and the full suite was not rerun under it.
- `npm run build` and smoke were not run. The diff touches no `src/` or `scripts/` file, and `npm test` regenerates `ui.html` to the committed bytes.
