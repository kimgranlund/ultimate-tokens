---
kind: verdict
plan: rule-gates
seat: verifier
pass: 1
pr: 757
ticket: "#730, #727, #728, #724"
written: 2026-09-26
---

# Pre-PR · rule-gates · pass 1 · 🔴 at `374f7f1d`: main moved under it, and five plan cells lag revision 15

Closes #730, #727, #728, #724

verdict: 🔴
sha: 374f7f1dce912501e3323bd9d06e84a4675b61ad

`plan/rule-gates` at `374f7f1d`, draft PR #757, every unit 🟢 on its own verdict.

The pair:

- **Verification leg:** I dispatched it as `verifier-l3` at `374f7f1d`. Its report is `/tmp/v13/rg-prepr-verify.md`: no 🔴, four 🟡.
  It left P1's control cell open, and I read that control's log myself (row P1).
- **Review leg:** I dispatched it as `reviewer-l4`. Its report is `/tmp/v13/rg-prepr-review.md`, and it ends `verdict: 🟡 FIX-FIRST`.

## The red

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| M | clean merge into today's main | 🔴 | mine: #756 landed after the pair ran (`74859f30`, then `920710e7`). `git merge-tree --write-tree origin/main 374f7f1d` now exits `1` with `CONFLICT (content): Merge conflict in .sdlc/baseline.md` and `CONFLICT (content): Merge conflict in test/engine/anchor.mjs`. At `33b4c610`, the main the branch holds, the worker read exit `0` | the same command at `33b4c610` exits `0`, so it tells the two apart |
| RL | the review leg | 🔴 | `verdict: 🟡 FIX-FIRST`, which reads 🔴 here under the token rule (Q3, #734). Finding 1: five plan cells still expect what revision 15 retired: `rule-gates.md:164` (P7, `stale total: 0`), `:254` (U5 steps, load under 5), `:258` (U5-1, `stale total: 0`), `:259` (U5-2, `three quiet runs`, load under 5), `:290` (Landing, `` must print `stale total: 0` ``). Finding 3: `adapter.md:139` still describes the old branding allow-list | a PASS review would end `verdict: 🟢 PASS` |
| P7 | the baseline agrees, as the plan's cell is written | 🔴 | the head prints `STALE time test: baseline 106 to 317 s, adapter 80 to 89 s`, `stale total: 1`; the P7 cell expects `stale total: 0`, `exit 0`. Revision 15 and R53 admit the line, but the cell does not say so. This is my own U5 verdict's note RV15, still open | the worker's plant: `stale total: 2` |

What unblocks: merge `origin/main` into the plan branch and resolve the two conflicts (the baseline and
`anchor.mjs`, both of which #715 changed on main); set the five plan cells to what revision 15 rules, with P7
pinned to that one `STALE time test` line; bring `adapter.md:139` up to date. The merge moves code, so the next
pass reruns the pair at the new head.

## Green at `374f7f1d`, to be reread at the next head

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P1 | `npm test`, no `node_modules` | 🟢 | `✓ all 52 test files passed`, exit `0`, TESTS `52`, tree `0` (under load, pass/fail only) | mine, from the worker's clone `rgpv-neg` at `374f7f1d` with the `"scrimX` plant: `▶ engine/semantic.mjs      FAIL`, `✗ 1/52 test file(s) failed`, `exit 1` |
| L1 | main's `33b4c610` merge undid no hand rewrite | 🟢 | `decision-records.md:7` reads `**OVERRIDE**: that is exactly`; the worker's integrity rows L1 and L2 are clean | the U5 pass 1 trace at `4df34cc8` read the comma |
| L3 | the gates | 🟢 | `branding: clean (771 files scanned)`; the em dash gate clean at the head | the worker's plants |
| CI | CI at the full sha | 🟢 | run `36240464512` at `374f7f1d`: `success`, smoke included | run `35785765215` red at `Run npm run smoke` |
| PR | PR #757 | 🟢 | title `chore(gates): gate the html: count, the fill: none rule, the em dash and the branding text filter (#730, #727, #728, #724)`, head `374f7f1d` | pass 1 of #754 read a bare branch-name title |

## Notes

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P8 | the plan's per-line dash filter | 🟡 | it prints `4`, and all four sit inside spans that cross a line break or use double backticks, which the gate exempts; the gate reads clean | the gate's own plant |
| K | carried reds | 🟡 | `ceiling-counts` (#755) and `doc-drift-rows` `bad 1` (DD9), identical on main | the worker's plants |
| L | leftovers | 🟡 | the worker's clones `rgpv-head`, `rgpv-w`, `rgpv-neg`, `rgpv-main`, `rgpv-F` stay under the job's tmp dir | `ls` lists them |

verdict: 🔴
sha: 374f7f1dce912501e3323bd9d06e84a4675b61ad
