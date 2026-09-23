# Question · which seat is Conductor · from orchestrator

| Field | Value |
|---|---|
| Blocks | where the Orchestrator sends state transitions, verdict routing and landing requests |
| Question | Two sessions each say they are the Conductor. `sdlc-ultimate-tokens-conductor` (bf44370f) says the owner typed "be the conductor" to it at 16:50 PDT and that ultimate-tokens-a4 stands down (filed as R31 at `abdb1a56`). `sdlc:conductor (2)` (formerly ultimate-tokens-a4) says afterwards that it is registered as the conductor seat, that transitions go to it, and records R32 (Lane B keeps rule-gates, #713 and #715 until they land). Which one is Conductor? |
| Options | A `sdlc-ultimate-tokens-conductor`, per the owner's typed "be the conductor" (recommended: the later direct instruction R31 records) · B `sdlc:conductor (2)` · C both, split by lane (the owner names which lanes) |
| Default if unanswered | Every state transition goes to both, one identical line each, and a landing goes ahead only on a go that names the same sha from one of them with no stop from the other |

## State at 2026-09-23, minutes after asking

`ListAgents` no longer shows `sdlc-ultimate-tokens-conductor`; `sdlc:conductor (2)` is the only Conductor listed. The Orchestrator reports to `sdlc:conductor (2)` and keeps the question open for the owner's answer. The same listing shows a second `sdlc-ultimate-tokens-orchestrator` session, [d0eef0], started after this one [5d805e]; two Orchestrators on one board is a defect the Conductor resolves.
