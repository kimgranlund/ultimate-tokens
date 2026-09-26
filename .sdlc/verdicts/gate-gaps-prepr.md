---
kind: verdict
plan: gate-gaps
seat: verifier
pass: 3
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

## Pass 2 · 2026-09-26 · `ef8afdd9` (revision 8)

`39142e49` to `ef8afdd9` is one commit that changes only `.sdlc/plans/gate-gaps.md` (`3 insertions(+), 2 deletions(-)`),
so pass 1's code rows carry on custody. In a clone at `ef8afdd9` I reran every row a plan edit can move. The
reviewer's round 2 is appended to `/tmp/v13/gg-prepr-review.md` and still ends `verdict: 🟡 FIX-FIRST`.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P2 | the baseline agrees by line, as the plan now writes it | 🔴 | mine: the row's two greps print `1` and `1` (the one line is `STALE time test: baseline 151 to 1058 s, adapter 80 to 89 s`), but the row's Expected still opens ```0`, then `0```, and U2-7 still reads ``P2's two figures `0`, `0```. Revision 8's prose admits the R53 line, and its figures do not; a later reader of this row would call the landed head red | the baseline's test figure planted `50`: `stale total: 2` and a `STALE tests` line, so the greps do move |
| F2 | U2-2's figures | 🟢 | re-pinned to `2.1736`, `4.3631`, `0.4290`, which pass 1's verification leg read at the head; the reviewer checked the cause sentence against the `src/` commits since `26940c07` | pass 1 read `2.60` as stale |
| RL | the pre-land review leg | 🔴 | round 2: `verdict: 🟡 FIX-FIRST`, on the same two tokens as P2 | a PASS round would end `verdict: 🟢 PASS` |
| C | the other checks | 🟢 | `verdicts 149 graded 149 bad 0`, `stale total: 0`, `range mismatches: 0`; `branding: clean (739 files scanned)`; added em dashes outside backticks `0` | pass 1's plants |
| M | clean merge into today's main | 🟢 | `git merge-tree --write-tree origin/main ef8afdd9` exit `0` at main `1c61ecbc`; board lines removed `0` | the worker's conflicting `TESTS` plant: exit `1` |
| CI | CI at the full sha | 🟢 | run `36239931577` at `ef8afdd9`: `success`, every job `success` but `deploy` `skipped` | run `35785765215` failed at `Run npm run smoke` |

K (#755, DD9), EN (the four en dashes) and PR1 (the title) stand as in pass 1. The review also notes the
revision 8 row has a third cell in a two-column table, which is cosmetic.

What unblocks: P2's Expected and U2-7's figures set to what the greps print under R53 (`1`, then `1`,
that one line only). Then the next pass rereads P2 and the review round.

verdict: 🔴
sha: ef8afdd90be9a2956c122026177ce6dc6f53474f

## Pass 3 · 2026-09-26 · `5e23cebb`

`ef8afdd9` to `5e23cebb` is one commit that changes only `.sdlc/plans/gate-gaps.md` (`3 insertions(+), 3 deletions(-)`).
I reran P2 in a clone at `5e23cebb`. The reviewer's round 3 is appended to `/tmp/v13/gg-prepr-review.md` and ends
`verdict: 🟡 FIX-FIRST`.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P2 | Expected and U2-7 agree with the head | 🟢 | mine: the row's two greps print `1` and `1`, the one line `STALE time test: baseline 151 to 1058 s, adapter 80 to 89 s`; P2 now reads ```1`, then `1` under owner ruling R53`` and U2-7 ``P2's two figures `1`, `1``` | the baseline's test figure planted `50`: `2` and `2` |
| P2c | P2's written control can tell pass from fail | 🔴 | the control cell still reads `` the first figure prints `1` and so does the second ``, the same as the pass reading; my run of that control prints `2` and `2`. A control whose written result equals the pass result cannot fail the row | the run above: `2`, `2` |
| RL | the review leg | 🔴 | round 3: `verdict: 🟡 FIX-FIRST`, on P2c alone plus the cosmetic third cell in the revision 8 row | a PASS round ends `verdict: 🟢 PASS` |
| C | checks, merge, CI | 🟢 | `verdicts 149 graded 149 bad 0`; `branding: clean (739 files scanned)`; added em dashes `0`; `git merge-tree` exit `0`, board lines removed `0`; CI run `36240323582` at `5e23cebb` `success`, `deploy` `skipped` | pass 1's plants; run `35785765215` red at `Run npm run smoke` |

What unblocks: P2's control cell set to `2` and `2` under R53 (and the revision 8 row's stray third cell
dropped, which is cosmetic). The next pass rereads that row and the review round.

verdict: 🔴
sha: 5e23cebbf08e60399578d63df15c52d12e79219e
