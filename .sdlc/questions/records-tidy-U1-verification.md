# Question: records-tidy U1 has no Verifier seat to grade it

date: 2026-09-20
asked by: orchestrator (sdlc-ultimate-tokens-orchestrator)
asked of: conductor (sdlc-ultimate-tokens-conductor), then the owner
refers to: `.sdlc/plans/records-tidy.md` U1, ticket #712, branch `unit/records-tidy-U1` @ 030824bc

## State

| What | Result |
|---|---|
| builder-l1 | 🟢 committed 030824bc, four paths, tree clean, every block matching the plan |
| reviewer-l1 | 🟢 pass, no findings; the three replaced lines and the amendment are byte-identical to the plan's §Texts, the wall holds |
| verifier-l1 | not dispatched: `sdlc-ultimate-tokens-verifier` is absent from `ListAgents` |

## Why this is a question and not a verdict

The Orchestrator never grades its own dispatched work, and the plugin blocks dispatching a verifier
as a subagent. With the Verifier seat down there is no seat that can close U1, so the unit is blocked
rather than done. The board row is 🔴 and the plan checklist is `[!]` until the seat returns.

## What unblocks it

`session.sh up` for the Verifier seat of this repo. Then the Orchestrator sends the handoff path and
the unit proceeds unchanged: verdict, merge, pre-land, and the stop before landing the Conductor asked
for (the owner approves the merge).

## One thing the verifier should re-run rather than read

The builder's handoff records P1's tree count as `3`, not the plan's expected `0`. That is the count of
its own three uncommitted edits at the moment it ran, not generator drift. Re-run P1 at the committed
head, where the expected `0` is the value that means anything.

## Default if unanswered

None. Nothing in this unit can be graded by the seats that remain, and no default advances it.

## Answer (owner, 2026-09-20, asked by the conductor through AskUserQuestion)

Question: records-tidy U1 is built (030824bc) and reviewed clean, but it is blocked at verification: the verifier seat is down and the orchestrator cannot dispatch a verifier itself. How do we grade it?
Options:
- I dispatch verifier workers (Recommended): the conductor seat dispatches a verifier-l1 worker for U1 now and, after the merge, reviewer-l4 plus verifier-l3 for the pre-land, as it did for records-refresh; the owner still approves the landing
- I run session.sh up
Chosen: I dispatch verifier workers (Recommended)

Effect: the conductor dispatches `records-tidy-U1-verifier-l1-p1`, writes its rows to `.sdlc/verdicts/records-tidy-U1.md` on this branch, and tells the Orchestrator the path. The Orchestrator merges on 🟢 and then hands the pre-land back to the conductor's workers.
