# Conductor resume note, 2026-09-20 07:50 PDT

Written before the owner restarts cmux and updates Claude Code. Every in-process worker dies with the restart; all state below is in branches, tickets and the named scratch files.

Conductor scratchpad (survives on disk): /private/tmp/claude-501/-Users-kimba-Projects-nonoun-ultimate-tokens/bb970c2c-06b9-43d3-b795-074226377528/scratchpad

| Field | Value |
|---|---|
| main | 730ff941 |
| Seats | Conductor ultimate-tokens-4b; Lane A ultimate-tokens-b4 (#681, then #701); Lane B ultimate-tokens-fd (#709; #496 parked); critic ultimate-tokens-0d |
| Standing rulings | .sdlc/questions/standing-rulings-2026-09-20.md (R1 land on three gates, R2 #681 U4 by rule, R3, R4 bypass restart) |
| Open issues | #681 #686 #668 #701 #709 #713 in work or queued; #496 #377 status:blocked on the owner |

## In flight when this was written

| Item | State | Resume action |
|---|---|---|
| #681 U4 | unit/pif-u4-integration @ 36ce7777, review 4 clean; verifier-l3 was running (npm test 48/48 in 318.52 s at load 4 to 5 already measured, scratch vu4-npmtest.log) | if no scratch verdict-pif-u4.md exists, re-dispatch verifier-l3 with the same brief (rulings: R2, lone spike named 64, rendered-path gates, Q7 ratchet, interim ceiling and #713, #686 and #668 claimed closed). On green: record to .sdlc/verdicts/pif-u4.md on plan/preset-intent-fidelity (Seat: orchestrator), Lane A runs U5 records, pre-land reviewer-l4 and verifier-l3, PR, critic, land under R1 |
| #709 U3 | unit/rf-U3 @ 1c1cfc69, nine of ten green; ruled fix: check script excludes .claude/CLAUDE.md by name, U3-1 leg 2 2 (plan 7ea9fdda); Lane B's criteria-only reviewer was running | Lane B resumes the builder once with the exclusion and findings, delta re-review, then Conductor dispatches verifier-l1 (its own gate runs corroborate the timings) |
| #709 after U3 | U1 U2 U7 U4 U6 verified and merged | rebase plan/records-followup onto main 730ff941 (probe was clean except board.md), re-measure U1's F1 and F2 against main, pre-land reviewer-l4 and verifier-l3, PR, critic, land under R1; then U5 roadmap as its own PR |
| #701 | plan/chroma-floor @ 8b89ca2c, approved | mobilize to Lane A when #681 lands |
| #713 | planner was writing .sdlc/plans/gate-split.md on local plan/gate-split | if the branch does not exist, re-dispatch the planner (brief in the ticket body plus: measure at the #681 integration head, coverage not given back, seeded sample, CI runs every moved gate); then checkability, then owner approval |
| #712 | closed, folded into #709 U3 (adapter §2.1 grade line, criterion U3-9) | plan/records-tidy and its two worktrees are leftovers of the other session |

## Housekeeping owed

Stale scratch worktrees (r2v/base, r2v/head, wt-bf2aaf6, revU3) and throwaway clones rf-plan-rev3-tmp to rev6-tmp in the Conductor scratchpad: rm was denied in this session; remove after a bypass restart. Plan and unit branches are local only, never pushed.
