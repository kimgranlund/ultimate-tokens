---
kind: verdict
plan: bold-labels
unit: U1
ticket: "#752"
branch: unit/bl-U1
base: e3a114d6
grade: verifier-l1, the evidence run dispatched by the Verifier seat
pass: 1
written: 2026-09-28
---

# Verdict bold-labels U1 · 🔴 · every sweep row is met; the handoff states false figures and omits a departure, records-only

verdict: 🔴
sha: fa0b11dddf896a8d9064227d68f8db11916388ca

`unit/bl-U1` at `fa0b11dd` (code commit `b18c76cb`), with `B` = `git merge-base origin/main HEAD` = `e3a114d6`. Graded
against plan revision 4 (`b50c4f10`). The evidence run (`$CLAUDE_JOB_DIR/tmp/blU1/report.md`) used throwaway clones at
`fa0b11dd`. I reran U1-1, U1-2, P2, P3 and P4 in the worktree, and read the handoff and the `mcp/README.md` diff myself.
`verdict.py check` passes on the handoff and review r1 (which ends `verdict: 🟢`).

## The red

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| H1 | the handoff's figures are true of the head, and it names every row that departs from the table (plan step 4) | 🔴 | mine: handoff line 14 reads ``| U1-2 | `18` rows, `11` distinct files | `18`, `12` | 🟡 |``; the list reads `18` and `11`, and the handoff's own line 26 counts 11 files, so the `12` and its 🟡 are false. The `mcp/README.md` Prompt line changes twice: `**Prompt**, `` `apply_brand` ``: how` becomes `**Prompt**: `` `apply_brand` ``, how`, so the inner colon became a comma. A grep for `apply_brand` in the handoff prints `0`, so the departure is not named. The handoff gives no P3 added/removed counts (the run's P3 counts are `30` added and `31` removed), no rows for P1's `diff`, P4, P6's tree count or P7, and its base is `0b551835`, not `e3a114d6` (the diffs outside `.sdlc/` are equal). Its P2/P3 file counts (`805`, `798`) are stale against `808`, `800` | at `fa0b11dd`, `wc -l` and `cut -f1 \| sort -u \| wc -l` on the kept list print `18`, `11`; a K17-dropped copy prints `17`, `10` |

What unblocks it is records only: the handoff's U1-2 row reads `18`, `11` and 🟢; it names the Prompt inner-colon
change; it states P3's added and removed counts and the P1 diff, P4, P6 and P7 figures at the head it names, with that
head's sha and `B`. No code change is asked, so the next pass rereads H1 and the rows carry.

## Met

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| U1-1 | the swept `**label**, ` lines leave, three ruled rewrites stay | 🟢 | mine: removed `31`, added `3` | the run restored `storage-and-sync-spec.md` to `B`: `30`, `2` |
| U1-2 | the kept list is 18 rows over 11 files | 🟢 | mine: `18`, `11` | the K17 row dropped: `17`, `10` |
| U1-3 | the twelve labels in `02-sections-and-resolvers.md` take the colon | 🟢 | the run: `12` | the same grep on `B`'s copy: `0` |
| U1-4 | the three plugin references gain 10 colon labels | 🟢 | the run: `10` over a base sum of `0` | `controls.md` restored to `B`: `7` |
| U1-5 | the three plugin parity tests pass | 🟢 | the run: `3` `▶ plugin/...-tokens.mjs pass` lines | a targeted plant (`53 semantic roles` to 54 in `color-tokens/SKILL.md`) through the per-file loop: `2`, `▶ plugin/color-tokens.mjs  FAIL`. The plan's control (P6's scrim) leaves `3`, so it cannot fail this row; the plan should name the targeted plant |
| P1 | every hit is on the kept list or walled to U2/U3 | 🟢 | the run: `57` hits, `0` kept rows missing, `39` extra (store-copy 32, ui-plan 2, five walled skill files), exactly U2's 32 plus U3's 7 | `**Probe**, a planted line` in `README.md`: `58`, and the `diff` names it |
| P2 | em dash clean | 🟢 | mine: `em-dash: clean (808 files scanned)`; the run's added-glyph count `0` | a glyph line in `mcp/README.md`: `FAIL: 1 em dashes`, exit 1; count `1` |
| P3 | branding clean; added equals removed minus the one `run ` line | 🟢 | mine: `branding: clean (800 files scanned)`; the run: added `30`, removed `31` | a planted `**Planted**: text` line: `31`, `31` |
| P4 | scope wall | 🟡 | mine: the second count lists `figma/plugin/ui.html` and `src/ui/mcp-assets.js`, `2`; revision 4 expects `1`. Its `src` pathspec catches `src/ui/mcp-assets.js`, which revision 3 admits, so the unit is inside the wall and the plan's `1` is a plan miscount. The first count is `0` | an intent-to-add `docs/spec/planted.md` makes the first count `1` |
| P5 | line-for-line numstat | 🟢 | the run: `line-for-line`, 31 lines over 12 files | a split `**KV**:` line: `UNEQUAL 2 1`, exit 1 |
| P6 | `npm test` green, the tree clean | 🟢 | the run: `✓ all 53 test files passed`, exit 0, `0` lines after | `scrimX` in `role-table.json`: `✗ 1/53 test file(s) failed`, exit 1 |
| P7 | the three README greps | 🟢 | the run: `1`, `1`, `1` | the same greps at `B`: `0`, `0`, `0` |
| P8 | the site URL stays | 🟢 | the run: `3` and `3` | the URL dropped from line 6: `2` |
| G | the generated files are generator output only | 🟢 | the run: the tree is `0` after `npm test`'s generators; the only word changes in `mcp-assets.js` and `ui.html` are the two `mcp/README.md` edits | a source change leaves 3 generated paths dirty |

## For the Orchestrator (plan text, not U1's)

- P4's second expected count is `1` in revision 4; it reads `2` because `src` catches the admitted `src/ui/mcp-assets.js`.
- U1-5's named control cannot fail the row; the targeted SKILL.md plant can.
