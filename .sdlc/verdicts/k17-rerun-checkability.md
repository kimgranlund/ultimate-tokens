# Criteria review k17-rerun · 🔴 not mobilizable (9 of 10 checkable, P5 🔴)

| Field | Value |
|---|---|
| Plan | `.sdlc/plans/k17-rerun.md` (draft) |
| Branch | `plan/k17-rerun` @ 648bd267, merge base d34b4fb1 |
| Asked by | conductor, 2026-09-19 |
| Grade | L1 seat, ran the blocks itself |
| Where measured | the plan worktree read-only, plus a throwaway shared clone of it for every writing control |
| Amended | 2026-09-20, G8 added and the C31 table given its unfolded exception row, after reading the plugin's pass 2 evidence cell |

Checkable means a command or observation exists now that prints one value before the unit and a different
value after it. Every row below was run in both states: at the plan head, and on a fixture of the A2
verdict carrying the new title plus a one-row pass 6.

## Criteria

| # | State | Check I ran | Measured before | Measured after / negative |
|---|---|---|---|---|
| P1 | 🟢 | block P1 in the clone, no `node_modules` | `✓ all 48 test files passed`, `0` | role-table key renamed in the clone: `✗ 1/48 test file(s) failed`; tree back to `0` after `git checkout` |
| P4 | 🟢 | block P4 in the plan worktree | `branding: clean (463 files scanned)`, `exit 0` | records doc copied to `docs/x.md`: `FAIL: 3 branding violation(s) across 464 files`, `exit 1` |
| P5 | 🔴 | block P5 in the plan worktree and in the clone | `0` at the plan head; wall list is exactly the plan doc and the approval doc | the gap, not the control: see P5 below |
| U1-1 | 🟢 | block U1-1 | `0`, nothing, `0`, `0` | fixture: `1`, nothing, `1`, `1`, `0`. Fixture with the pass 6 row set 🔴: fourth line `0` |
| U1-2 | 🟢 | block U1-2 | `0` (newest K17 row is pass 5's, which quotes the three-name filter) | fixture: `1`. Fixture with `ui/counts.mjs` dropped from the map cell and the verdict unchanged: `0`, so either file moving alone fails |
| U1-3 | 🟢 | block U1-3, plus block K17 and the plant run by me | sha empty; `7 before the filter, 0 after` `0`; `own plant` `1` | my own block K17 at the clone head: no output from the three grep legs, then `7`, and the seven names are exactly the plan's list. My own plant: framework half 2 hits (`test/engine/hct.mjs`, `test/engine/zzz.mjs`), registration half 1 (`engine/zzz.mjs`), clone `git status --short` `0` after reset |
| U1-4 | 🟢 | block U1-4 | `0`, `5 17` | fixture: `1`, `6 18`. Fixture with the pass 6 row 🔴: `0`, `6 17` |
| U1-5 | 🟢 | block U1-5, then the plugin repo's own C31 block | `18`, `18`, `18`, `30`, `1` | fixture: `18`, `18`, `19`, `31`, `1`. Fixture with one pass 5 K row deleted: first line `17` |
| U1-6 | 🟢 | block U1-6 | `0`, `0` | fixture: `1`, `0` |
| U1-7 | 🟢 | block U1-7 | file absent, `grep` errors, no number printed | cannot run before the handoff exists; the plan states this and it is the honest control for a file-presence claim. Caveat below |

## P5, the one 🔴

The wall regex does not list `.sdlc/verdicts/k17-rerun-checkability.md`, which is this record, which the
Conductor asked to be committed on this branch. Measured in the clone with that path present, block P5
prints `1` and names it. So P5 as written fails at the branch head for a file that is in scope by the
Conductor's own instruction, and a verifier following the plan literally would block the plan for it.

The wall's own negative controls do fire: one byte appended to the map prints `1`, a new untracked
`.sdlc/checks/new.sh` prints `1`. The gate discriminates. Its allow-list is short by one path.
Whether the fix is the allow-list or the record's location is the Orchestrator's call, not mine.

## The count the ask named: 19 raw K rows after pass 6

Confirmed by measurement, and cross-checked against the plugin repo's C31 block as that block is
actually written (`sdlc-orchestration` `.sdlc/plans/readiness.md` lines 629 to 632), not as paraphrased.

| Count | Block it comes from | At the plan head | After a one-row pass 6 |
|---|---|---|---|
| raw K rows from `## Pass 5` to end of file | plan U1-5 line 3 | `18` | `19` |
| K rows bounded to the pass 5 table | plan U1-5 line 1 | `18` | `18` |
| unique K ids from `## Pass 5` to end of file | plan U1-5 line 2 | `18` | `18` |
| whole-file verdict rows, `vr-1` | C31 block line 3 | `30` | `31` |
| `grep -c 'exception'` folded | C31 block line 4 | `1` | `1` |
| `grep -c 'exception'` unfolded, the `7 exceptions` the pass 2 evidence reports | C31 block line 4 before the fold | `7` | `7` with the plan's own §Texts wording, `8` if the pass 6 author uses the word once |
| seven-section loop | C31 block line 1 | `6` | `6` |
| convention rows and control commands | C31 block line 2 | `18 18` | `18 18` |

So U1-5's five pins are correct in both states, and the plan's reading of which count this edit can move
is correct: the from-pass-5-to-end-of-file raw count, and the whole-file row count.

## Gaps in the criteria set, measured, none of them a 🔴 row

G8 first, because it is the one a reader of the plan would not guess.

| # | What no criterion covers | What I measured |
|---|---|---|
| G8 | the pass 2 evidence cell reports `7 exceptions`. That is `grep -c 'exception'` on the whole file before the fold. U1-5 pins only the folded form, which is blind to 7 against 8, so it cannot see this drift at all | `7` at the plan head and `7` on my fixture, because the plan's §Texts wording happens not to use the word. A fixture whose pass 6 says `before the exception filter` once prints `8`, and the folded pin still prints `1`. The plan's own prose says `exception filter` repeatedly, and §Texts leaves that sentence to the author's free wording, so this is one word away |
| G1 | the plugin's pass 2 evidence also counts K rows naming an own run and K rows naming a plant, from `## Pass 5` to end of file. Those are the pass 2 worker's own formulas, not in the C31 block, and U1-5 does not pin them | `18` and `18` at the plan head, `19` and `19` after a one-row pass 6. The regrade will read 19 twice. Worth one more line in U1-5 so the reply can quote it |
| G2 | U1-3's `own plant` leg does not discriminate: pass 5's K17 row already carries the phrase, so the leg prints `1` before the unit exists. The discriminating legs are the intro sha and the `7 before the filter, 0 after` phrase, both measured `0` before | measured `1` at the plan head |
| G3 | U1-3's second leg runs `git diff --name-only "$S" HEAD` with `$S` empty when no pass 6 exists. It errors rather than printing a count, so a grader reading only stdout sees nothing, not a `0` | reproduced |
| G4 | U1-7 folds `grep -ci 'plant'` to `1`, so a handoff containing the word once passes. It checks mention, not that hits were recorded | reproduced on the plan's own wording |
| G5 | U1-3's expected `its plant prints 2 hits` does not say which half. My run gives 2 hits on the framework half and 1 on the registration half; the planner's table quotes one from each | reproduced |
| G6 | the plan's Q-A reads as though `.sdlc/checks/` would be a new thing. The directory already exists with four tracked scripts, and no criterion runs them | all four run green at the plan head and unchanged on the fixture: `stale total: 0`, `stale total: 0`, `range mismatches: 0`, `rows 56 drifted 11 holds 45 undetermined 0 bad 0`. The unit moves none of them |
| G7 | P4's expected value carries `N was 461 at d34b4fb1` | on this branch it is `463`, because the branch adds the plan doc and the approval doc. The criterion reads `clean`, not a fixed N, so this is a stale lead, not a defect |

## Verdict

9 of 10 criteria are checkable with a measured value in each direction. P5 is 🔴 on its allow-list, so by
the mobilization rule this plan is not mobilized until that row is repaired. Everything else in the plan
reproduced exactly as the planner measured it, including every negative control I reran.
