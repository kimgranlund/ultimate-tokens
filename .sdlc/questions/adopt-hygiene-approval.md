# Approval: plan adopt-hygiene

date: 2026-09-16
asked by: sdlc-conductor
answered by: human (Kim Granlund)
refers to: .sdlc/plans/adopt-hygiene.md, .sdlc/verdicts/adopt-hygiene-plan.md

Question: Approve the adopt-hygiene plan (3 units, 34 verifier-checkable criteria) for mobilization? Approval commits the whole .sdlc/ adoption record to sdlc/adopt and hands the plan to the orchestrator.
Options:
- Approve, mobilize (Recommended)
- Approve without U3
- Changes first
Chosen: Approve, mobilize (Recommended)

## Addendum (2026-09-17, conductor): U8 sweep approved
| Field | Value |
|---|---|
| Question | Pre-land red a third time on a new stale record. Run one sweep unit U8 over every fact the plan changed, with mechanical checks, instead of one finding per unit? |
| Options | Run the U8 sweep (recommended) · fix only index.md and rerun · stop here, land nothing |
| Chosen | Run the U8 sweep |

## Addendum (2026-09-17, conductor): pre-land cap
| Field | Value |
|---|---|
| Question | Pre-land red a fifth time, each on a new class of stale record; U10 already building with a committed check script. How to cap? |
| Options | Let U10 finish, cap at one more red (recommended) · stop U10, re-plan the records layer · stop here, land nothing |
| Chosen | Let U10 finish, cap at one more red: pre-land 6 runs the committed checks; a sixth 🔴 stops the plan, no U11, re-diagnosis goes to the human |
