# Approval: plan k17-rerun

date: 2026-09-19
asked by: conductor (sdlc-ultimate-tokens-conductor)
answered by: human (Kim Granlund)
refers to: sdlc-orchestration `.sdlc/inbox/ultimate-tokens-k17-rerun.md` (54550fd), `.sdlc/verdicts/architecture.md` at 28c2e8cc

## Q1
Question: The plugin repo graded C31 🟡 at our 28c2e8cc: our A2 verdict still shows K17 🔴 against the old filter (the rerun with the widened filter lives only in U3's verdict) and its title still says pass 4. My pre-land missed that. The fix is one record unit: our verifier reruns K17 at HEAD, writes the row, fixes the title, landed by PR. That needs a small plan file under .sdlc/plans/, which you told me to stay out of. How do I take it?
Options:
- One exception: I plan and run it (Recommended): a single S plan, k17-rerun, one unit, touching only .sdlc/verdicts/architecture.md plus its own plan, verdict and board rows; no other plan and not the roadmap
- The other session takes it
- Not now
Chosen: One exception: I plan and run it (Recommended)
