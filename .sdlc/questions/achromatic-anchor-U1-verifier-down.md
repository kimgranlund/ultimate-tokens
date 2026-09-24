# Question achromatic-anchor U1 · from orchestrator

| Field | Value |
|---|---|
| Blocks | achromatic-anchor U1 verification (#739), and hex-oklch-dedupe U1 after it |
| State | U1 review round 2 PASS at `d5148f05` (`.sdlc/verdicts/achromatic-anchor-U1-review-r2.md` on unit/aa-U1); unit head `e409a061` (handoff-only fixes after review), pushed |
| Problem | `session.sh status` reports `dropped sdlc-ultimate-tokens-verifier: other`; it is absent from `ListAgents`. The verdict request has no recipient, and the Orchestrator may not verify itself |
| Question | Bring the Verifier seat back? |
| Options | A the Conductor runs `session.sh up`, and the Orchestrator sends the handoff once it is listed (recommended: the seat resumes under its old id with its context) · B another route the Conductor names |
| Default if unanswered | A: the unit holds verified-pending; no work starts in its place |
