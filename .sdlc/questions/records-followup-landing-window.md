# Question · records-followup (#709) · how PR #720 lands without a fifth stale pass

date: 2026-09-21
from: orchestrator
about: PR #720, `plan/records-followup-roadmap`, pre-land record pass 3 🔴 at `ee854932`
status: open

## What happened

Pre-land pass 3 is 🔴 on four rows. Gates and CI are green, and both citation repairs from pass 2 hold. The four are:

| Row | Defect | Repairable by a unit |
|---|---|---|
| A1 | the tally `ten of eleven units 🟢` went stale when the plan gained its twelfth unit at `0d042c0f`, 23m before U12's first commit | yes, one predicate |
| A2 | `#724` is open and unranked; the live open set is 16, the table carries 15 | yes, one row and two counts |
| A3 | `.sdlc/handoffs/records-followup-U5.md:58` attributes to standing ruling R4 a sentence R4 does not carry, the same false attribution U12 repaired in the roadmap | yes, one citation |
| A4 | the `pif-u5-records` worktree row at `roadmap.md:73` names a head the branch had already left 19m before the regeneration instant | yes, one row |

## The part a unit cannot fix

A1 and A2 are counts of a world that moves while the PR is graded. Every pass so far has repaired the counts and then been redded by a change that arrived during the repair:

- `#722` arrived during U11 and redded U5-4.
- `#723`, which I minted, arrived four minutes before U11's last commit and redded R2.
- U12, which I added to repair pass 2, moved the plan to twelve units and redded the tally the same unit had just written.
- `#724`, minted by another seat at `01:37:38Z`, redded A2. My own mint freeze binds me alone and cannot bind other seats.

The second re-diagnosis (`.sdlc/plans/records-followup-U11-rediagnosis.md` §6.2) already states the mechanics: there is no anchor under which this converges while tickets are minted during the unit, unless the mint and the refresh are the same act. Four passes of evidence now say the same thing.

## The decision

How does #720 land?

1. **Atomic landing window (recommended).** The owner approves the squash in advance, conditional on the record being 🟢 at the moment of the refresh. Then, in one continuous turn and with no other seat minting tickets in that window: the four repairs land as a unit, I re-read `gh` and write the counts, the verifier re-checks only the counts and the four rows, and the squash follows immediately. No pass is graded against a world that moved after it.
2. **Another ordinary pass.** Dispatch the unit, verify, request pre-land pass 4, ask the owner. Honest, and the same shape that has been redded four times; a ticket minted by any seat during the pass reds it again.
3. **Drop the live counts from the roadmap.** The `inputs:` line stops carrying figures and names the commands with the instant they were run; the counts become what the verifier re-runs. This is already the recommended shape in the re-diagnosis §6.4 and belongs to ticket #723, so it means holding #720 until #723 is built.

Default if unanswered: none taken. #720 does not land, and the four repairs are dispatched as a unit either way.

## What is needed from the owner for option 1

Only two things: approval to squash conditional on the 🟢, and a word to the other seats to mint nothing against this repo until #720 is squashed. The Conductor asks; I do not.
