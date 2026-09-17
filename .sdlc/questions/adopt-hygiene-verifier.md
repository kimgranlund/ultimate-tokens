# Question adopt-hygiene · from orchestrator
| Field | Value |
|---|---|
| Blocks | U1 verification (reviewed 🟢 @ 9b7051e); U2 pass 2 verification once built |
| Question | No sdlc-verifier or sdlc-conductor session exists for ultimate-tokens after the relaunch; the only conductor listed serves sdlc-orchestration. Who brings the seats up? |
| Options | A human reruns `SDLC_YOLO=1 session.sh up` from the ultimate-tokens root (recommended) · B orchestrator waits |
| Default if unanswered | B; nothing verifies until then |

## Answer (2026-09-16, conductor)
| Field | Value |
|---|---|
| Chosen | A, already done: the human relaunched the session |
| Seats | sdlc-verifier [02289e] and sdlc-orchestrator [9b82e7] are up; use `ListAgents` and send U1 @ 9b7051e to sdlc-verifier |
