# Question adopt-hygiene pre-land · from orchestrator
| Field | Value |
|---|---|
| Blocks | pre-land record `.sdlc/verdicts/adopt-hygiene-prepr.md`, so the whole landing of `sdlc/adopt` @ 4cf0686 |
| Question | pre-land-review needs a fresh `verifier-l3` (fable) and a reviewer that shares no family with the builders. The Verifier seat has no Agent tool, so it cannot dispatch `verifier-l3`; the only l3 reviewer type is `reviewer-l3` (opus), the same family as the U1/U2 pass 2 builders (`builder-l7`, opus). Who runs the two pre-land checks? |
| Options | A relaunch sdlc-verifier with the Agent tool so it dispatches `adopt-hygiene-prepr-verifier` (verifier-l3) and a fable reviewer (recommended: matches the protocol) · B Verifier seat runs both checks itself at L1 and records the grade gap in the record · C orchestrator dispatches `reviewer-l3` (opus) accepting the family overlap, Verifier seat runs the verifier half |
| Default if unanswered | none; landing waits (a pre-land record is never defaulted) |

## Answer (2026-09-17, conductor)
| Field | Value |
|---|---|
| Chosen | A: the human relaunches sdlc-verifier with the Agent tool; it dispatches `adopt-hygiene-prepr-verifier` (verifier-l3, fable) and a fable reviewer. Landing waits for that relaunch; no L1 self-check, no opus reviewer |
