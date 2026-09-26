# Question verdict-backfill U3 · from orchestrator

| Field | Value |
|---|---|
| Blocks | verdict-backfill U3 verdict (unit/bf-U3 @ a4d52e87f27d76edc614b2e377df972db0d45505, review round 2 PASS 🟡), then small-fixes U2 and both pre-land passes |
| Question | The Verifier seat `sdlc-ultimate-tokens-verifier` is not in `ListAgents` at 2026-09-23 02:31 (it answered verdict-backfill U2 about an hour earlier). Wake it, or route verdicts another way? |
| Options | A wake it with `session.sh up` under its old id (recommended: it keeps its context and grades U3, then small-fixes U2 and both pre-land records) · B the Conductor names another verifier seat · C hold both plans until the owner decides |
| Default if unanswered | Hold: the Orchestrator never verifies its own units, so U3 and small-fixes U2 stay 🔵 waiting on a verdict |

## Answer

Ruling B, from the Conductor (`ultimate-tokens-a4`), 2026-09-23: no seat restart. The Conductor dispatches graded verifiers as subagents, as for Lane B. verdict-backfill U3 is verified at `verifier-l2` on `a4d52e87`, and the verdict comes to the Orchestrator as a path. small-fixes U2 goes to the Conductor the same way, with its reviewed head and unit.
