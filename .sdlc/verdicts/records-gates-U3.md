---
kind: verdict
plan: records-gates
unit: U3
ticket: "#741"
branch: unit/rc-U3
base: 8f5c6dc0
grade: verifier-l1, the evidence run dispatched by the Verifier seat
pass: 1
written: 2026-09-28
---

# Verdict records-gates U3 · 🔴 · the check is in `npm test` and bites; the baseline Correction mislabels the figures it carries

verdict: 🔴
sha: fcf15f73ccd86c5ba00dc1c886b205458a2e7cd3

`unit/rc-U3` at `fcf15f73`, with `B` = `git merge-base origin/main HEAD` = `8f5c6dc0`, where the base's N is `53`. The
G0 list is empty (`verdicts 162 graded 162 bad 0` over B's verdicts), so U3 stays S. The evidence run
(`$CLAUDE_JOB_DIR/tmp/rcU3/report.md`) used throwaway clones at `fcf15f73`. I reran P4, U3-4 and the baseline
diff in the unit worktree, and those figures are mine. `verdict.py check` passes on the handoff and the review;
it warns that the review's table has no control column.

## The red

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| B1 | the `.sdlc/baseline.md` Correction U3 adds is true of the row it corrects | 🔴 | mine: `.sdlc/baseline.md:340` calls `167.45 · 185.81 · 268.26` "the three quiet-host-adjacent figures". The `npm test` row they come from says they were measured `under load`, under the owner ruling "accept runs under load" and R53 ("keep quiet figure, carry STALE"). A durable record landing on `main` states the opposite of its own row. The same sentence says `git status --short` showed "only this unit's own two touched files" and does not say whether that was before `baseline.md` itself was edited | the row's own cell, one diff hunk above, reads `under load` |

What unblocks it is records only: the Correction names the carried figures as the under-load set that the row
and R53 describe, and says when its `git status` line was read. The next pass rereads B1 and P3; the other rows
carry, since no code changes.

## Met, and the carried concerns

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| U3-1 | the check is green on the tree, every record graded | 🟢 | `verdicts 163 graded 163 bad 0`, `exit 0`, `163` tracked | the last line of `gate-split-U1.md` deleted prints `bad 1`, `exit 1`, `MISSING gate-split-U1.md: no verdict: line` |
| U3-2 | every record on the G0 list, and no other, carries its token | 🟢 | the list is empty (K = 0): `0`, nothing, `0`, nothing | the token moved to line 2 of `gate-split-U1.md` prints `title 2 47` against `title 47 47`; a `verdict:` line appended to an unlisted record makes the third figure `1` |
| U3-3 | the test is registered, green, and bites in its planted leg | 🟢 | `1`, `exit 0`, `✓ verdict-frontmatter: verdicts 163 graded 163 bad 0, planted 2`, needle count `9` | a planted `zz-planted.md` prints `exit 1` and `MISSING zz-planted.md`; the shell check forced to `process.exit(0)` prints `✗ planted: expected exit 1, got 0` |
| U3-4 | N and the baseline agree, with the correction | 🟡 | mine: `ok    tests: baseline 54, test/run.mjs TESTS 54`, `stale total: 1` (the plan expects `0`), `#741` count `2`. The one stale line is `STALE time test: baseline 167 to 268 s, adapter 80 to 89 s`, which the root checkout on `main` prints identically: the R53 carry, not U3's. The handoff marks the row met without quoting the stale total and did not run its control | the baseline row set back to 53 prints `STALE tests: baseline 53, test/run.mjs TESTS 54`, `stale total: 2` |
| U3-5 | the test resolves the root from its own path and costs under a second | 🟢 | root runs `exit 0` in `.568`, `.552`, `.947` s at load 100.77, 94.13, 136.67; from `test/` the same line, `exit 0`; no temp dirs left | `const ROOT = process.cwd();` from `test/` prints `exit 1`, `expected exit 0, got 127` (the script path is missing, not `readdirSync` as the plan's cell predicts; red either way). The handoff did not plant this control |
| P1 | `npm test` green, N agrees, the tree clean | 🟢 | at `fcf15f73`: `✓ all 54 test files passed`, exit 0, `54`, `ok    tests: baseline 54`, `git status --short` `0` | `scrimX` in `role-table.json` prints `engine/semantic.mjs FAIL`, `✗ 1/54`, exit 1 |
| P2 | no product source changes | 🟢 | `0` | the fixture pair prints `1` |
| P3 | branding and em dash | 🟢 | `branding: clean (791 files scanned)`, `0`, `0`, `em-dash: clean (799 files scanned)`, `exit 0` | a copied ADR file reds branding (`FAIL: 3`); a glyph line in `baseline.md` makes the count `1` and the gate `FAIL: 1`, exit 1 |
| P4 | scope wall; no verdict deleted or renamed | 🟡 | mine: the wall filter prints `2`, not `0`: `.sdlc/plans/prompt-audit.md` (e6d545f9, the Orchestrator's checklist sync) and `.sdlc/reviews/records-gates-U1-review.md` (9c276832, U1's review, written to `.sdlc/reviews/` instead of `.sdlc/verdicts/`, so the verdict check does not grade it either). Both came in through `plan/records-gates`; U3's own commit is inside the wall. The rest reads `0`, nothing, `0`. The plan's pre-land reads this row whole and must see `0` | four planted names print `2`; `git mv` of a verdict prints `1`; a changed ADR line prints `1 1`; a modified unlisted verdict prints `1` |

P4's two paths belong to the Orchestrator: the U1 review moved to where the verdict check reads it, and
`prompt-audit.md` reconciled with `main`, or a revision that widens the wall.
