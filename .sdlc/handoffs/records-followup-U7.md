# Handoff U7 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/rf-U7 @ 8611ea98ed70bcbb01b094c8c66b50416bf46c54 |
| Files | .sdlc/debt.md, .sdlc/adapter.md, .sdlc/handoffs/records-followup-U7.md |
| Ran | criteria 1-6 below, host load recorded |
| Left out | none |

## Host

`uptime` before the one `npm test` run: load averages 82.93 40.97 30.37 (12 cores worth of contention from many unrelated dev processes on this shared machine, confirmed via `pgrep`). This is docs-only (`.sdlc/` only) but the plan-level P1 gate still applies, so `npm test` was run once in this worktree; it is not fast under this load and its number is reported as-is, not treated as timing evidence.

## Criteria

| # | Criterion | Command | Printed | Match |
|---|---|---|---|---|
| 1 | no P id in two live records (U2-1's sweep) | `for f in adapter architecture baseline debt survey roadmap board; do perl -ne 'print "$1 $ARGV\n" if /^[|] ([A-Z]{1,3}-?\d+[a-z]?) [|]/' .sdlc/$f.md; done \| sort -u \| awk '{n[$1]++} END{for(i in n) if(n[i]>1) print i}' \| sort -V \| paste -sd, -` | `C1,C2,C3,C4,C5,C6,C7,K9,K11,K14,K17,K18` | matches plan exactly, no P ids present |
| 2 | new prefix unowned before this unit | `git grep -P '(?<![A-Za-z0-9-])DP[0-9]+(?![0-9A-Za-z])' d34b4fb1 -- .sdlc .claude README.md \| wc -l \| tr -d ' '` | `0` | matches. Negative control with `PR` for `DP` at the same base prints `2` (measured), matching the plan's stated control |
| 3 | mapping DP back to P reproduces the unit's base debt.md except the note | `UB=$(git merge-base plan/records-followup HEAD); diff <(git show $UB:.sdlc/debt.md) <(perl -pe 's/(?<![A-Za-z0-9-])DP([1-4])(?![0-9a-z])/P$1/g' .sdlc/debt.md) \| grep '^[<>]' \| grep -vc '^> Renamed 20\|^> $'` | `0` | matches |
| 4 | every cite moved, no bare debt P left | `git grep -cP '(?<![A-Za-z0-9-])DP[1-4](?![0-9a-z])' -- .sdlc/adapter.md .sdlc/debt.md; perl -ne 'print if /(?<![A-Za-z0-9-])P[1-4](?![0-9a-z])/' .sdlc/debt.md \| grep -vcE 'P3 (wall\|forbids)\|^Renamed 20'; perl -ne 'print "$.," if /(?<![A-Za-z0-9-])P[1-7](?![0-9a-z])/' .sdlc/adapter.md` | `.sdlc/adapter.md:2`, `.sdlc/debt.md:5`, `0`, `22,52,91,` | matches exactly |
| 5 | four rows and the note present, no P-headed row, U1/U2 edits survived | `awk '/^## Process/,0' .sdlc/debt.md \| grep -oE '^[|] DP[0-9]+ [|]' \| tr -d '\| ' \| paste -sd, -; awk '/^## Process/,0' .sdlc/debt.md \| grep -cE '^[|] P[0-9]+ [|]'; grep -c '^Renamed 20[0-9-]* (plan records-followup U7, #709)' .sdlc/debt.md; grep -c 'filters 7 files by name' .sdlc/debt.md; grep -c 'renamed those rows XC1 to XC6' .sdlc/debt.md` | `DP1,DP2,DP3,DP4`, `0`, `1`, `1`, `2` | matches exactly |
| 6 | scope: three files, plugin id check accepts the tree, history untouched | see Notes below | `.sdlc/adapter.md,.sdlc/debt.md,.sdlc/handoffs/records-followup-U7.md`; `exit 0`; `0` | matches once handoff was written; see Notes for `PLUGIN` substitution |

## Both rename sweeps

Forward (old debt `P<n>` cites still standing, must be zero outside the note and the archived-plan exceptions): `perl -ne 'print if /(?<![A-Za-z0-9-])P[1-4](?![0-9a-z])/' .sdlc/debt.md | grep -vcE 'P3 (wall|forbids)|^Renamed 20'` prints `0`. `.sdlc/adapter.md` lines 52 and 91 no longer read `ruling P1)` / `squash-merge only (P1).`; both now carry `DP1, debt P1 until records-followup U7`, confirmed by the criterion 4 output above.

Backward (architecture's own P1-P7 series must be untouched): `git diff --stat $(git merge-base plan/records-followup HEAD) -- .sdlc/architecture.md` prints nothing (empty diff, file untouched). `grep -cE '(^|[^A-Za-z0-9-])P[1-7]([^0-9a-z]|$)' .sdlc/architecture.md` still prints `7` (its P1-P7 series intact). Line 22 of `.sdlc/adapter.md` (`architecture P7`) was left unchanged, confirmed above.

## Counts I measured myself (not copied from the plan)

- Criterion 2 base commit: the plan's `$BASE` for this check is `d34b4fb1` (pristine main before ticket #709's records-followup plan existed), not `UB` (the unit's cut-point `e748f0ba`, which already contains this plan's own prose describing `DP`, a false positive if used here). Confirmed `d34b4fb1` predates the plan file: `git cat-file -e d34b4fb1:.sdlc/plans/records-followup.md` fails ("exists on disk, but not in 'd34b4fb1'"). Using `d34b4fb1` as `$BASE` for row 2 gives `0`, matching the plan's stated expectation, and the `PR` negative control at the same base gives `2` (the plan says the negative control "prints 2", which I reproduced independently rather than trusting).
- Row count sentence in debt.md (`Row count: ... Process 4 · total 45`) was left untouched: renaming the id column does not change the row count, and the plan's Texts section does not ask for that line to move.

## PLUGIN substitution for criterion 6 (finding)

`core.hooksPath` resolves to `/Users/kimba/Projects/nonoun/sdlc-orchestration/plugins/sdlc/githooks`, so `PLUGIN=/Users/kimba/Projects/nonoun/sdlc-orchestration`, matching U2-6's convention. The plan's criterion 6 command names `plan/drill-findings` as the ref to read `board.py` from. That branch label does not exist in `PLUGIN` any more: `git branch -a` and `git for-each-ref` show no such ref. `git log --all --oneline | grep drill` shows the merge commit `0242462` has two parents (a real merge, not a squash), and the commit the plan cites, `08f3e1b`, is still reachable and an ancestor of `main`, with `board.py` byte-identical to `main`'s. Only the branch label was deleted; nothing was lost. I substituted `main` for `plan/drill-findings` and ran the check: `python3 "$F/board.py" ids .sdlc` printed nothing and `exit 0`. I could have run the check against `08f3e1b` directly instead of substituting `main`, since that commit is still reachable and would have proved the check against the literal ref the plan cites; I did not think to look for it before writing this file.

## Scratch clones

None created (no plant/simulation clone was needed for this unit's checks beyond reading historical shas already reachable in this worktree's object store; the `board.py` copy was written to the session scratchpad, not a git clone, and nothing was created under `.worktrees/`).

## Ran

`npm test` once in this worktree. Load before: 82.93 40.97 30.37 (`uptime`, at dispatch). By the time the run actually started, load had climbed to 185.10 125.76 70.30 (two other concurrent builders' own `npm test` runs visible via `pgrep -fl 'test/run.mjs'`); load after: 248.66 175.41 101.33. Result: `all 48 test files passed`, exit 0, `3:02.07 total` wall (157.06s user), `git status --short` clean of anything but this unit's three files after the run. The wall time is not usable as gate timing evidence (host far over its quiet-host threshold throughout), but the pass/fail result and the clean-tree check both hold under load, so the P1 gate is satisfied.
