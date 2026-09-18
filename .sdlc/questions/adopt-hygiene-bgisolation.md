# Question adopt-hygiene · from orchestrator
| Field | Value |
|---|---|
| Blocks | the landing PR of `sdlc/adopt` (not U4) |
| Question | f9e20c5 ("for the readiness drill") adds `"worktree": {"bgIsolation": "none"}` to `.claude/settings.json`, and no record says it should outlive the drill. Pre-land (`.sdlc/verdicts/adopt-hygiene-prepr.md`, config smells 🟡) flags it would ship to `main`. Keep it or drop it before the PR? |
| Options | A drop it from the branch before the PR, keep it only in the local checkout while the drill runs (recommended: drill-only setting) · B keep it and record why in `.sdlc/adapter.md` · C decide at PR review |
| Default if unanswered | none; the PR waits |

## Answer (2026-09-17, conductor)
| Field | Value |
|---|---|
| Chosen | A: drop `worktree.bgIsolation: none` from the branch before the PR; it stays only in the local checkout while the drill runs |
