---
kind: verdict
plan: rule-gates
unit: U5
ticket: "#730"
branch: unit/rg-U5
base: plan/rule-gates @ 047b2951, main merged in at c2b58d50
grade: verifier-l2, the evidence run dispatched by the Verifier seat, which re-read the rows marked mine
contract: U5-1, U5-2, P1 and P7 of .sdlc/plans/rule-gates.md at f5421ad0, revision 15, under the load ruling (.sdlc/questions/rule-gates-U5-load.md) and R53; plus the requester's two checks, the merge and the runs
pass: 1
written: 2026-09-26
---

# Verdict rule-gates U5 · 🔴 · U5-1, U5-2, P1, P7 met; main's merge undid one of U4's hand rewrites

verdict: 🔴
sha: 4df34cc87f71b92f6f679a0cc6b46ce47eb4b04a

`unit/rg-U5` at `4df34cc8`, merged into `plan/rule-gates` at `f5421ad0`; the plan head is now `6d4c9773`,
which adds records only. The evidence run's report is at `/tmp/v13/rg-U5-verify.md`, and its clone is at
`/Users/kimba/.claude/jobs/05defd58/tmp/rg5v-1790408829` (its delete was refused). The review record is
now committed on the plan branch (`6d4c9773`), and it passes the shape check: Round 2 PASS at `4df34cc8`,
last line `verdict: 🟢 PASS`.

## The red

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| M | main's merge `c2b58d50` loses nothing of this plan's (the requester's check) | 🔴 | mine, `decision-records.md:7` across the commits: U4's hand rewrite `a9cec2ef` and the plan at `047b2951` read `**OVERRIDE**: t`; main `db33b460` and the merge `c2b58d50` read `**OVERRIDE**` then a spaced em dash (main's side taken); the head `4df34cc8` reads `**OVERRIDE**, t`, which the re-sweep's `--fix` wrote. So U4's colon is gone, replaced by a mechanical comma. The run checked everything else: the 348 plan-only paths are byte-equal to `047b2951`, the 138 main-only paths are byte-equal to `db33b460`, and the other 22 missing plan lines are lines main rewrote, or regenerated mirrors. The review counted this line among main's rewrites, which it is not | the same trace at `047b2951` shows the colon, so the check can see a loss |

What unblocks: restore U4's colon on that one line, or record a decision that the comma stands. Then P1
and the em dash gate are read again at the new head.

## Green

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| U5-1 / P7 | the baseline agrees, with R53's one carried line | 🟢 | `STALE time test: baseline 106 to 317 s, adapter 80 to 89 s`, `stale total: 1`; tests `52` = `52`; ui.html `4120.9` KB; the same at `f5421ad0` | tests `51`: `stale total: 2`; ui.html `4121.9`: `2`; figures `80 · 85 · 89`: `stale total: 0`, exit `0` |
| U5-2 | three counted runs, under load, marked | 🟢 | `3/3   151 · 106 · 317`, `✓ all 52 test files passed`, rows marked under load | a two-run row prints `2/3` |
| R | the three runs are disjoint and on one tree (the requester's check) | 🟢 | run 3's log (`bdqhxae4t.output`) was created `07:10:20Z` and last written `07:15:38Z`, `317` s. Runs 1 and 2 left no log file, so the run timed them from the harness transcript's own call and result stamps, not the builder's text: `06:17:20.261Z` to `06:19:51.638Z` (`151.4` s), and `06:21:23.791Z` to `06:23:09.945Z` (`106.2` s). The spans are disjoint. All three ran on `f489852a`: no edit or git call falls between them, and the next commit `72efa36a` came at `07:20:07Z` | the `stat` method checked on a run of known span: the run's own P1, `493` s by `date` |
| P1 | `npm test`, no `node_modules` | 🟢 | `✓ all 52 test files passed`, TESTS `52`, tree `0`, at `4df34cc8` and at `f5421ad0` | `scrim` to `scrimX`: `✗ 1/52 test file(s) failed`, exit `1` |
| S | the em dash re-sweep `e8a56d7e` | 🟢 | `c2b58d50`: `FAIL: 6469 em dashes outside inline code spans in 11 files`; `e8a56d7e`: `em-dash: clean (762 files scanned)`; head `clean (763 files scanned)`; no swept file changed its line count | the gate is red at `c2b58d50` |
| B | branding, no added prose dash | 🟢 | `branding: clean (755 files scanned)` at both; the unit's own commits add `0` | a copied `decision-records.md`: `FAIL: 3`; a planted line: `1` |
| RV | the review's finding (the wrong ruling cited) | 🟢 | `R47` cited `11` times at `236e9535`, `1` at the head (the quiet-window heading, correct); `rule-gates-U5-load.md` cited `5` times | the same grep at `236e9535` |

## Notes

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| RV15 | revision 15 | 🟡 | written after the evidence (`c64609b0`, `00:37:14` PDT, after run 3 ended at `00:15:37`), recording rulings that came first (`2305413c` at `21:33:42` PDT Sep 25, relayed to the builder before run 1). It does weaken the rows, but by owner ruling: the load-under-5 red is gone, and the carried STALE line would hide a further timing change. The U5-1, U5-2 and Landing cells still say `stale total: 0` and load under 5, so at pre-land P7 should be pinned to the exact `STALE time test` line plus `stale total: 1` | the planted `80 · 85 · 89` shows the check still reads the figures |
| H | records | 🟡 | the cited `.sdlc/questions/rule-gates-U5-load.md` is on `origin/main` only, not on the branch (it resolves at the next main merge); the handoff header still names `72efa36a` and still says the adapter was updated; its recorded `exit 0` is `tail`'s exit, not `npm test`'s | `git show f5421ad0:.sdlc/questions/rule-gates-U5-load.md`: `fatal` |
| K | the other checks | 🟡 | `ceiling-counts: 1 failure(s)` (#755) and `doc-drift-rows` `bad 1` (DD9) are main's, identical at `db33b460`; `verdict-frontmatter` read `bad 16` at `4df34cc8` (main's 11 plus this plan's 5), and the plan branch has since added the 5 lines (`6d4c9773`) | identical figures at `db33b460` |

verdict: 🔴
sha: 4df34cc87f71b92f6f679a0cc6b46ce47eb4b04a
