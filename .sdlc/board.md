# Board

Orchestrator-only. Rows edited in place. Plan branch for adopt-hygiene is `sdlc/adopt` (checked out in the root checkout by design of the plan's X1 landing).

| Unit | Ticket | Size | State | Pass | Owner | Worker | Branch | Worktree | Doc | Next |
|---|---|---|---|---|---|---|---|---|---|---|
| adopt-hygiene U1 records, plans, stubs, moved docs | T-0001 | M | 🔵 | 1 | builder | hygiene-U1-builder-l1-p1 | unit/hygiene-U1 | .worktrees/hygiene-U1 | .sdlc/plans/adopt-hygiene.md | build, then reviewer-l1 |
| adopt-hygiene U2 harness, config, ignores, workflows, CLAUDE.md | T-0001 | M | 🔵 | 1 | verifier | sdlc-verifier (verifier-l1) | unit/hygiene-U2 @ 04b93f0 | .worktrees/hygiene-U2 | .sdlc/handoffs/adopt-hygiene-U2.md | verdict pending, then merge |
| adopt-hygiene U3 repo settings, git index, local branches | T-0001 | S | 🟢 | 1 | verifier | sdlc-verifier (verifier-l1) | unit/hygiene-U3 @ d731a9e merged 6b57378 | removed | .sdlc/verdicts/adopt-hygiene-U3.md | merged; 2 🟡 non-blocking (branch counts, external) |
