---
kind: verdict
plan: records-gates
unit: U3
ticket: "#741"
branch: unit/rc-U3
base: 8f5c6dc0
grade: verifier-l1, the evidence run dispatched by the Verifier seat
pass: 2
written: 2026-09-28
---

# Verdict records-gates U3 · 🟡 · pass 2: the Correction names the under-load set; the R53 carry and the plan-branch wall carry

verdict: 🟡
sha: 9de75b4ccbe320784abffdc222a494120d8f5428

Pass 2, records-only. `unit/rc-U3` at `9de75b4c`, with `B` = `8f5c6dc0`. `git log fcf15f73..9de75b4c` is one commit,
and it changes `.sdlc/baseline.md` (one line, 340) and `.sdlc/handoffs/records-gates-U3.md` alone. No test or source
file moved, so U3-1 to U3-3, U3-5, P1 and P2 carry from pass 1 at `fcf15f73`. This pass rereads B1, U3-4 and P3.
`verdict.py check` on both records `--against` their `fcf15f73` copies exits 0. Every `test/repo/*.mjs` gate (the
ones that read records: branding, citations, doc-mutation-lane, em-dash, gate-report, svg-rules,
verdict-frontmatter) exits 0 at `9de75b4c`, and the tree is clean after.

## Pass 2

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| B1 | the `.sdlc/baseline.md` Correction U3 adds is true of the row it corrects | 🟢 | mine: line 340 now names `167.45 · 185.81 · 268.26 s` as "the three under-load figures", the set the `npm test` row (line 25) calls `under load`, under the owner ruling and R53. It says the `git status` read came before `baseline.md` was edited and marks that order as inferred. The handoff's provenance paragraph holds: the three runs sit in the U5b table (lines 329 to 331, 17:24:05 to 17:34:46 UTC), recorded at `99c452a2`, whose parent is `b2287241`; `461.45` first appears at `48897448`, whose parent is `78fdc33f` | `quiet-host-adjacent` greps `1` at `fcf15f73` and `0` at `9de75b4c`; `under-load figures` on line 340 greps `0` then `1` |
| U3-4 | N and the baseline agree, with the correction | 🟡 | mine: `ok    tests: baseline 54, test/run.mjs TESTS 54`, `stale total: 1`, the one line `STALE time test: baseline 167 to 268 s, adapter 80 to 89 s`, the R53 carry that `main` prints identically. The handoff now quotes the total and the line, and it ran the control. The plan's expected `0` is still not literal, so this stays 🟡 on the carry, not on U3 | mine, in a clone at `9de75b4c` with line 25 set to `all 53`: `STALE tests: baseline 53, test/run.mjs TESTS 54`, the same time line, `stale total: 2` |
| P3 | branding and em dash | 🟢 | mine: `branding: clean (791 files scanned)`; the stripped and raw added-line glyph counts `0`, `0`; `em-dash: clean (799 files scanned)`, `exit 0` | pass 1's controls carry (a copied ADR file reds branding with `FAIL: 3`; a glyph line in `baseline.md` gives `FAIL: 1`, exit 1). The records fix adds no new path class |
| H2 | the handoff's evidence table is well formed | 🟡 | mine: `grep -n` for table rows and blank lines shows the provenance paragraph (`Where each figure was measured`) inserted at line 24, between the U3-4 row (line 22) and the U3-5 row (line 25). U3-5 now follows a paragraph with no header, so in rendered Markdown it no longer sits in the table. The text is still there and still true. This is a format concern, not a false figure | lines 16 to 22 still render as one table, with header and delimiter at 16 and 17 |

## Met, and the carried concerns

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| U3-1 | the check is green on the tree, every record graded | 🟢 | `verdicts 163 graded 163 bad 0`, `exit 0`, `163` tracked | the last line of `gate-split-U1.md` deleted prints `bad 1`, `exit 1`, `MISSING gate-split-U1.md: no verdict: line` |
| U3-2 | every record on the G0 list, and no other, carries its token | 🟢 | the list is empty (K = 0): `0`, nothing, `0`, nothing | the token moved to line 2 of `gate-split-U1.md` prints `title 2 47` against `title 47 47`; a `verdict:` line appended to an unlisted record makes the third figure `1` |
| U3-3 | the test is registered, green, and bites in its planted leg | 🟢 | `1`, `exit 0`, `✓ verdict-frontmatter: verdicts 163 graded 163 bad 0, planted 2`, needle count `9` | a planted `zz-planted.md` prints `exit 1` and `MISSING zz-planted.md`; the shell check forced to `process.exit(0)` prints `✗ planted: expected exit 1, got 0` |
| U3-5 | the test resolves the root from its own path and costs under a second | 🟢 | root runs `exit 0` in `.568`, `.552`, `.947` s at load 100.77, 94.13, 136.67; from `test/` the same line, `exit 0`; no temp dirs left | `const ROOT = process.cwd();` from `test/` prints `exit 1`, `expected exit 0, got 127` (the script path is missing, not `readdirSync` as the plan's cell predicts; red either way). The handoff did not plant this control |
| P1 | `npm test` green, N agrees, the tree clean | 🟢 | at `fcf15f73`: `✓ all 54 test files passed`, exit 0, `54`, `ok    tests: baseline 54`, `git status --short` `0` | `scrimX` in `role-table.json` prints `engine/semantic.mjs FAIL`, `✗ 1/54`, exit 1 |
| P2 | no product source changes | 🟢 | `0` | the fixture pair prints `1` |
| P4 | scope wall; no verdict deleted or renamed | 🟡 | mine: the wall filter prints `2`, not `0`: `.sdlc/plans/prompt-audit.md` (e6d545f9, the Orchestrator's checklist sync) and `.sdlc/reviews/records-gates-U1-review.md` (9c276832, U1's review, written to `.sdlc/reviews/` instead of `.sdlc/verdicts/`, so the verdict check does not grade it either). Both came in through `plan/records-gates`; U3's own commit is inside the wall. The rest reads `0`, nothing, `0`. The plan's pre-land reads this row whole and must see `0` | four planted names print `2`; `git mv` of a verdict prints `1`; a changed ADR line prints `1 1`; a modified unlisted verdict prints `1` |

P4 stays 🟡 at the unit: plan revision 5 (`f5b514ec`, on `plan/records-gates`, not an ancestor of `9de75b4c`)
admits `.sdlc/reviews/records-gates` and resets `.sdlc/plans/prompt-audit.md` on the plan branch. On the unit,
`git diff --name-only 8f5c6dc0 9de75b4c` still lists both paths, so the pre-land record must read P4's first count
as `0` after the plan branch integrates `main`.
