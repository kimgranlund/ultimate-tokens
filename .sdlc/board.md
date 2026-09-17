# Board

Orchestrator-only. Rows edited in place. Plan branch for adopt-hygiene is `sdlc/adopt` (checked out in the root checkout by design of the plan's X1 landing).

| Unit | Ticket | Size | State | Pass | Owner | Worker | Branch | Worktree | Doc | Next |
|---|---|---|---|---|---|---|---|---|---|---|
| adopt-hygiene U1 records, plans, stubs, moved docs | T-0001 | M | 🟢 | 2 | verifier | sdlc-verifier (L1 seat ran it; grade l3 asked) | unit/hygiene-U1 @ 89c9538 merged 044df08 | removed | .sdlc/verdicts/adopt-hygiene-U1.md | merged; pre-land review next (prepr-reviewer-l3 + verifier-l3) |
| adopt-hygiene U2 harness, config, ignores, workflows, CLAUDE.md | T-0001 | M | 🟢 | 2 | verifier | sdlc-verifier (L1 seat ran it; grade l3 asked) | unit/hygiene-U2 @ 0ad0faa merged b320385 | removed | .sdlc/verdicts/adopt-hygiene-U2.md | merged; 🟡 U2-9 key at job-level env, follow-up; pre-land needs fresh verifier-l3 |
| adopt-hygiene U3 repo settings, git index, local branches | T-0001 | S | 🟢 | 1 | verifier | sdlc-verifier (verifier-l1) | unit/hygiene-U3 @ d731a9e merged 6b57378 | removed | .sdlc/verdicts/adopt-hygiene-U3.md | merged; 2 🟡 non-blocking (branch counts, external) |
| adopt-hygiene U4 pre-land fixes | T-0001 | S | 🔵 | 1 | builder | U4-builder-l2-p1 | unit/hygiene-U4 | .worktrees/hygiene-U4 | .sdlc/verdicts/adopt-hygiene-prepr.md | build, then reviewer-l1, verifier-l1, pre-land rerun |
