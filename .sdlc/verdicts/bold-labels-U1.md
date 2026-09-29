---
kind: verdict
plan: bold-labels
unit: U1
ticket: "#752"
branch: unit/bl-U1
base: e3a114d6
grade: verifier-l1, the evidence run dispatched by the Verifier seat
pass: 2
written: 2026-09-28
---

# Verdict bold-labels U1 · 🟡 · pass 2: the handoff's figures are now true, but it grades against the unit's old plan copy

verdict: 🟡
sha: cf270b913a778e41c3fc38589725c06a887ee74b

Pass 2, records-only. `unit/bl-U1` at `cf270b91`, with `B` = `e3a114d6`. `git log fa0b11dd..cf270b91` is one commit, and it
changes `.sdlc/handoffs/bold-labels-U1.md` alone (31 insertions, 17 deletions). The sweep rows carry from pass 1 at
`fa0b11dd`. Graded against plan revision 5 (`78ea46ba` on `plan/bold-labels`), which moves P4's second count to `2` and
names the targeted `SKILL.md` plant as U1-5's control. `verdict.py check` on the handoff `--against` its `fa0b11dd`
copy exits 0.

## Pass 2

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| H1 | the handoff's figures are true of the head, and it names every row that departs from the table | 🟡 | mine: the handoff now names `B` = `e3a114d6` and head `fa0b11dd`. U1-2 reads `18`, `11`, 🟢. It names the Prompt inner-colon change word for word, and states P3's `30`/`31` and P1's `57`/`0`/`39`, P6's `0` and P7's `1`, `1`, `1`. Each matches my run. The concern is its frame. It reads the plan copy on the unit branch, which is older than revision 3: that copy's U1-2 expects `18`, `12`, and its P4 wall filter lacks `src/ui/mcp-assets.js` and `figma/plugin/ui.html`. So the handoff's "`18`, `12` in the plan", its P4 "first count `2`" and "Both paths are outside the plan's wall filter" are true of that copy and false of revisions 4 and 5. The handoff does not name which plan copy it read | `git show fa0b11dd:.sdlc/plans/bold-labels.md` P4 row: `grep -c mcp-assets` prints `0`; `b50c4f10` and `78ea46ba` both list both paths |
| P4 | scope wall, at revision 5 | 🟢 | mine, revision 5's exact commands at `cf270b91`: the first count prints `0`, the second `2` (`figma/plugin/ui.html`, `src/ui/mcp-assets.js`), as revision 5 expects | pass 1's intent-to-add `docs/spec/planted.md` made the first count `1` |
| U1-5 | the three plugin parity tests pass; the control is the targeted plant (revision 5) | 🟢 | the run: `3` pass lines | a `54 semantic roles` plant in `color-tokens/SKILL.md` through the per-file loop: `2`, `▶ plugin/color-tokens.mjs  FAIL` |

The P4 conflict is settled: the first count is `0` under revision 4 and revision 5. The builder's `2` comes from the
wall filter in the unit's pre-revision-3 plan copy. The 🟡 needs no rework pass. It is the pre-land record's to read
from revision 5, and the Orchestrator can merge the plan revision into the unit branch or note the frame in the
handoff on the plan branch.

## Met (carried from pass 1 at `fa0b11dd`)

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| U1-1 | the swept `**label**, ` lines leave, three ruled rewrites stay | 🟢 | mine: removed `31`, added `3` | the run restored `storage-and-sync-spec.md` to `B`: `30`, `2` |
| U1-2 | the kept list is 18 rows over 11 files | 🟢 | mine: `18`, `11` | the K17 row dropped: `17`, `10` |
| U1-3 | the twelve labels in `02-sections-and-resolvers.md` take the colon | 🟢 | the run: `12` | the same grep on `B`'s copy: `0` |
| U1-4 | the three plugin references gain 10 colon labels | 🟢 | the run: `10` over a base sum of `0` | `controls.md` restored to `B`: `7` |
| P1 | every hit is on the kept list or walled to U2/U3 | 🟢 | the run: `57` hits, `0` kept rows missing, `39` extra (store-copy 32, ui-plan 2, five walled skill files), exactly U2's 32 plus U3's 7 | `**Probe**, a planted line` in `README.md`: `58`, and the `diff` names it |
| P2 | em dash clean | 🟢 | mine: `em-dash: clean (808 files scanned)`; the run's added-glyph count `0` | a glyph line in `mcp/README.md`: `FAIL: 1 em dashes`, exit 1; count `1` |
| P3 | branding clean; added equals removed minus the one `run ` line | 🟢 | mine: `branding: clean (800 files scanned)`; the run: added `30`, removed `31` | a planted `**Planted**: text` line: `31`, `31` |
| P5 | line-for-line numstat | 🟢 | the run: `line-for-line`, 31 lines over 12 files | a split `**KV**:` line: `UNEQUAL 2 1`, exit 1 |
| P6 | `npm test` green, the tree clean | 🟢 | the run: `✓ all 53 test files passed`, exit 0, `0` lines after | `scrimX` in `role-table.json`: `✗ 1/53 test file(s) failed`, exit 1 |
| P7 | the three README greps | 🟢 | the run: `1`, `1`, `1` | the same greps at `B`: `0`, `0`, `0` |
| P8 | the site URL stays | 🟢 | the run: `3` and `3` | the URL dropped from line 6: `2` |
| G | the generated files are generator output only | 🟢 | the run: the tree is `0` after `npm test`'s generators; the only word changes in `mcp-assets.js` and `ui.html` are the two `mcp/README.md` edits | a source change leaves 3 generated paths dirty |
