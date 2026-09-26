---
kind: verdict
plan: gate-gaps
seat: verifier
pass: 1
pr: 756
ticket: "#715"
written: 2026-09-26
---

# Pre-PR · gate-gaps · pass 1 · 🔴 at `39142e49`: the code rows pass; the PR text and the review leg are not there yet

Closes #715

verdict: 🔴
sha: 39142e49574a8fcb892cee7f417978f5abe21fff

`plan/gate-gaps` at `39142e49`, draft PR #756, units U1, U2 and U2b, each 🟢 on its own verdict.

The pair:

- **Verification leg:** I dispatched it as `verifier-l3` at `39142e49`. Its report is `/tmp/v13/gg-prepr-verify.md`: 26 🟢, 6 🟡, 0 🔴.
- **Review leg:** no pre-land review record exists on `origin/main` or on the plan branch. I dispatched a `reviewer-l4` now; its result goes into pass 2.

## The red

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| PR1 | the PR title matches the plan's Landing | 🔴 | `gh pr view 756`: `test: gate the default kit's ramps and the rendered ramp identity (#715)`. Landing pins `test(color-engine): default kit in every anchor sweep, ramp identity control (#715)`, and adapter §2 wants `type(scope): summary`; the title becomes the squash subject | the pinned title has `(color-engine)`; the current one has no scope |
| PR2 | the PR body meets adapter §2 | 🔴 | the body says `The pre-land record and verdict table are added before this leaves draft`, carries no table and no `Closes #715` (it reads `Claims #715`). This record carries its own `Closes #715` line, since a gated land rewrites the body from the record | the hex-oklch-dedupe body (#754) carries both, so the read can tell them apart |
| RL | the pre-land review leg | 🔴 | no `gate-gaps-prepr-review` file in `git ls-tree -r origin/main` or `origin/plan/gate-gaps`; pending on the dispatched reviewer | the same `ls-tree` grep finds `hex-oklch-dedupe-prepr-review.md` on main |

## Green

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P1 | `npm test`, no `node_modules` | 🟢 | `✓ all 51 test files passed`, TESTS `51`, tree `0`, `▶ engine/ramp-identity.mjs pass` (under load, pass/fail only) | `"scrim` to `"scrimX`: exit `1` |
| P3 | branding, no added em dash outside backticks | 🟢 | `branding: clean (739 files scanned)`; the plan's filter `0` | a planted `plain; dash` line with the glyph: `1` |
| P4 | scope wall | 🟢 | `0`, `0` against `022e1443`; 16 files | the three-name fixture: `1` |
| P5 | the shipped mode reads clean against the merge base | 🟢 | `--base 022e1443`: exit `0`, `0 differing cells` | `EVEN_DAMP_FACTOR` 0.25 to 0.3: `54036 differing cells`, exit `1` |
| U1-1 / U1-2 | the kit's seven lines, and a planted defect reds each by name | 🟢 | sampled and FULL legs: exit `0`, `7` lines, `0` FAIL | four kit plants `K1` to `K4`: each exit `1`, each of the seven names red in at least one |
| U2-3 | a perturbed ramp fails the control and names where | 🟢 | `identity even: 3710/3780 palettes`, exit `1` | P5's green run at the same command shape |
| M | clean merge into today's main, board kept | 🟢 | mine: `git merge-tree --write-tree origin/main origin/plan/gate-gaps` exit `0` at main `33b4c610`, tree `6306f888`; board diff `3 insertions(+)`, `0` removed lines | the worker's conflicting `TESTS` plant: exit `1` |
| CI | CI at the full sha | 🟢 | run `36227665026` at `39142e49`: `build-test` (with smoke), `panda-smoke`, `corpus-contrast` and every `sweeps` job `success` | run `35785765215` failed at `Run npm run smoke` |

## Notes

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P2 | the baseline agrees, under R53 | 🟡 | `STALE time test: baseline 151 to 1058 s, adapter 80 to 89 s`, `stale total: 1`. Landing says P2 is not waivable by a seat; this line is carried by owner ruling R53, not by a seat. Pinned to that exact line | TESTS planted to `50`: `stale total: 2` |
| U2-2 | the differ reproduces the record | 🟡 | peak and even match to four decimals; perceptual reads `2.1736`, not the record's `2.60`. The same script on main's pre-#746 engine reads `2.1736` too, so U2 was graded on the plan's carried draft engine and the literal is stale, not the code | `--base HEAD` reads `0`, so the differ is not echoing a constant |
| EN | en dashes | 🟡 | `4` added lines in `.sdlc/questions/gg-U2b-p2-time-stale.md` (time and figure ranges); em dashes `0` | a planted en dash line: `1` |
| K | carried reds | 🟡 | `ceiling-counts: 1 failure(s)` (#755) and `doc-drift-rows` `bad 1` (DD9), identical on main | the worker's plants: `2 failure(s)`, `bad 2` |

What unblocks: #756's title set to the Landing title and its body to §2's shape, and the review leg's record.
Neither needs a commit on the plan branch unless the review asks for one.

verdict: 🔴
sha: 39142e49574a8fcb892cee7f417978f5abe21fff

## Pass 1, review leg added · 2026-09-26 · same sha `39142e49`

The `reviewer-l4` I dispatched read the whole plan diff fresh: `/tmp/v13/gg-prepr-review.md`, last line
`verdict: 🟡 FIX-FIRST`. The code passes; the block is records only. I checked its two findings myself.
PR1 is now met: #756's title reads the Landing title, and its body carries `Closes #715`.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| RL | the pre-land review leg | 🔴 | `verdict: 🟡 FIX-FIRST`, which reads 🔴 here under the token rule (Q3, #734) | a PASS review would end `verdict: 🟢 PASS` |
| F1 | the plan records the rulings it lands under | 🔴 | `grep -c R53` on the plan at `39142e49`: `0`, and no `R50` either; its P2 row still reads `stale total: 0` while the head reads `stale total: 1` under R53 | the same grep on `rule-gates.md`, which records R53, prints a nonzero count |
| F2 | the plan's figures reproduce at the head | 🔴 | plan line 270 pins U2-2 at `2.60`, `4.36`, `0.43`; the head reads `2.1736`, `4.3631`, `0.4290` | peak and even match, so the read can tell a stale figure from a moved one |
| PR1 | the PR title | 🟢 | `test(color-engine): default kit in every anchor sweep, ramp identity control (#715)` | pass 1's read of the old title |

What unblocks: one plan revision row that records R50 and R53 against P2 and step 7 and re-pins U2-2's
perceptual figure, then the PR body rewritten from the next pass's record. The revision moves the sha, so
the next pass reruns P2, P3, P4 and the checks at the new head, and the code rows carry on custody.

verdict: 🔴
sha: 39142e49574a8fcb892cee7f417978f5abe21fff
