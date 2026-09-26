---
kind: verdict
plan: rule-gates
seat: verifier
pass: 3
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

## Pass 2 · 2026-09-26 · `240c2e5a`: 🔴 on one false sentence in the baseline

Since `374f7f1d`: revision 16 (`5795ac4e`), the main sync `718b685b` (origin/main `276bc3ba`, #715 landed), the dash
sweep `b2287241`, the figures of record `99c452a2`, and unit U5b (`2b389130`). The verification leg ran again at
`240c2e5a` (`/tmp/v13/rg-prepr-verify-p2.md`: no 🔴, three 🟡). The review's round 2 is appended to
`/tmp/v13/rg-prepr-review.md` and ends `verdict: 🟢 PASS`. I checked the red below myself.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| N1 | the records this plan ships state what happened | 🔴 | mine: `.sdlc/baseline.md:302` says the heavy-run count `` was `0` immediately before each of the three runs ``, and the same entry's table (lines 308 to 310) reads hot before `1`, `0`, `3`. The same entry, and the `npm test` row at line 23, cite R53 at `.sdlc/runtime/owner-rulings-2026-09-22.md`, and `git ls-files .sdlc/runtime` prints `0` files, so the citation resolves for no reader; the tracked home is `.sdlc/questions/gg-U2b-p2-time-stale.md`. The runs count under the load ruling either way, so the figures stand; the sentence and the citation do not | the U5b paragraph says `1 or below` against a table of `1`, `1`, `1`, so the read can tell a true sentence from a false one |
| M | clean merge into today's main | 🟢 | `git merge-tree --write-tree origin/main 240c2e5a` exit `0`; main is an ancestor of the head; #757's `mergeStateStatus` reads `CLEAN` | pass 1: exit `1` with two conflicts at `374f7f1d` |
| MR | the merge resolutions | 🟢 | `test/engine/anchor.mjs` equals main's but for the dash sweep (`b2287241`, one file, two lines); main's #715 content whole in `.sdlc/baseline.md`; `decision-records.md:7` still reads `**OVERRIDE**: that is exactly` | the review's round 1 and the worker's main-only byte-equality check |
| P7 | the baseline agrees, under R53 | 🟢 | `ok    tests: baseline 53, test/run.mjs TESTS 53`, `ok    ui.html: baseline 4118.0 KB, tree 4118.0 KB`, one line `STALE time test: baseline 167 to 268 s, adapter 80 to 89 s`, `stale total: 1`; the range is the script's own rounding of the row's `167.45 · 185.81 · 268.26` | `all 53` planted as `all 52`: `stale total: 2` |
| R16 | the plan cells agree with R53 and the head | 🟢 | P7, U5 step 2, U5-1, U5-2 and Landing now expect `stale total: 1` with the one R53 line; revision 16 relaxes nothing revision 15 had not ruled | pass 1 read the five cells as `stale total: 0` |
| P1 | `npm test`, no `node_modules` | 🟢 | `✓ all 53 test files passed`, tree clean | the `"scrimX` clone: exit `1` |
| P2 | `npm run build` | 🟢 | exit `0`, `wrote figma/plugin/ui.html 4118.0 KB` | pass 1's control |
| U5-2 | three runs, disjoint | 🟢 | `3/3`, `167.45 · 185.81 · 268.26`; spans `17:24:05` to `17:26:52`, `17:27:01` to `17:30:07`, `17:30:18` to `17:34:46` UTC, each within `0.5` s of its wall figure | an overlapping span would share a clock second; none does |
| RL | the review leg | 🟢 | round 2: `verdict: 🟢 PASS` | round 1 ended `verdict: 🟡 FIX-FIRST` |
| CI | CI at the full sha | 🟢 | run `36259809510` at `240c2e5a`: `success` on every job | run `35785765215` red at `Run npm run smoke` |

Still 🟡, none a gate: P8 (the plan's per-line filter prints `5`, every hit in a span the gate exempts, gate
clean), K (DD9 and #755, main's), and the review's low note that `.sdlc/baseline.md:33` and `:45` still point
"above" at the 51-file row and that U6c-8 has two Superseded headings (`:41`, `:47`).

What unblocks: line 302 made true to its table (`1`, `0`, `3`), and R53 cited at its tracked home in both
places. The review's pointers can go in the same edit. The change is a record only, so the next pass rereads the
baseline, the checks and CI at the new head, and the code rows carry.

verdict: 🔴
sha: 240c2e5a2a8da8a1d8f00c6ecc183558620becba

## Pass 3 · 2026-09-26 · `1436563c`: 🟢

`240c2e5a` to `1436563c` is one records commit (`.sdlc/baseline.md`, `.sdlc/board.md`, `8 insertions(+), 8 deletions(-)`),
so pass 2's code rows carry on custody. I reread the baseline and the checks in a clone at `1436563c`. The review's
round 3 is appended to `/tmp/v13/rg-prepr-review.md` and ends `verdict: 🟢 PASS`.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| N1 | the records this plan ships state what happened | 🟢 | mine: the U5 sentence now reads `` read `1`, `` then ``` `0` and `3` immediately before the three runs ```, as its table's hot-before column; `grep -c owner-rulings-2026-09-22` on the baseline prints `0`; the new citation `.sdlc/questions/gg-U2b-p2-time-stale.md` holds `Chosen: "Keep quiet figure, carry STALE (Recommended)", 2026-09-25, owner ruling R53` at line 47 | pass 2 read `` was `0` `` against a table of `1`, `0`, `3` |
| P7 | the baseline agrees, under R53 | 🟢 | `STALE time test: baseline 167 to 268 s, adapter 80 to 89 s`, `stale total: 1`, the only STALE line | `all 53` planted as `all 52`: `stale total: 2` |
| C | checks and gates | 🟢 | `verdicts 162 graded 162 bad 0`, `stale total: 0`, `range mismatches: 0`; `branding: clean (784 files scanned)`; `em-dash: clean (792 files scanned)`; added dashes in the commit `0` | pass 1's plants |
| M | clean merge into today's main | 🟢 | `git merge-tree --write-tree origin/main 1436563c` exit `0` at main `68e90c52`; #757 `mergeStateStatus` `CLEAN`, body carries `Closes #730, #727, #728, #724` | pass 1: exit `1` at `374f7f1d` |
| RL | the review leg | 🟢 | round 3: `verdict: 🟢 PASS` | round 1 ended `verdict: 🟡 FIX-FIRST` |
| CI | CI at the full sha | 🟢 | run `36261285755` at `1436563c`: `success` on every job, `deploy` `skipped` | run `35785765215` red at `Run npm run smoke` |

Still 🟡, none a gate:
- P10 wants a head that contains main. Main has moved past the head by the verifier's own record commits, which
  are `.sdlc/verdicts/` only, so the final sync before the squash is the Orchestrator's; the merge above is clean.
- The review's two low leftovers: a duplicate U6c-8 Superseded heading (`baseline.md:41`, `:47`), and
  `.sdlc/handoffs/rule-gates-U5.md:101` still cites the `.sdlc/runtime/` path. That handoff is a pass record of its own sha.
- P8 (the per-line filter's `5` exempt hits), and K (DD9, #755), both main's or gate-exempt.

verdict: 🟢
sha: 1436563cbb50e46ac5d249386f5fcab1e267a68c
