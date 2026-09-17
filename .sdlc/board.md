# Board

Orchestrator-only. Rows edited in place. Plan branch for adopt-hygiene is `sdlc/adopt` (checked out in the root checkout by design of the plan's X1 landing).

| Unit | Ticket | Size | State | Pass | Owner | Worker | Branch | Worktree | Doc | Next |
|---|---|---|---|---|---|---|---|---|---|---|
| adopt-hygiene U1 records, plans, stubs, moved docs | #643 | M | 🟢 | 2 | verifier | sdlc-verifier (L1 seat ran it; grade l3 asked) | unit/hygiene-U1 @ 89c9538 merged 044df08 | removed | .sdlc/verdicts/adopt-hygiene-U1.md | merged; pre-land review next (prepr-reviewer-l3 + verifier-l3) |
| adopt-hygiene U2 harness, config, ignores, workflows, CLAUDE.md | #643 | M | 🟢 | 2 | verifier | sdlc-verifier (L1 seat ran it; grade l3 asked) | unit/hygiene-U2 @ 0ad0faa merged b320385 | removed | .sdlc/verdicts/adopt-hygiene-U2.md | merged; 🟡 U2-9 key at job-level env, follow-up; pre-land needs fresh verifier-l3 |
| adopt-hygiene U3 repo settings, git index, local branches | #643 | S | 🟢 | 1 | verifier | sdlc-verifier (verifier-l1) | unit/hygiene-U3 @ d731a9e merged 6b57378 | removed | .sdlc/verdicts/adopt-hygiene-U3.md | merged; 2 🟡 non-blocking (branch counts, external) |
| adopt-hygiene U4 pre-land fixes | #643 | S | 🟢 | 1 | verifier | sdlc-verifier (verifier-l1) | unit/hygiene-U4 @ 8ebf172 merged a91af16 | removed | .sdlc/verdicts/adopt-hygiene-U4.md | merged; 🟡 U4-2 exclusion came from 39b78dc, confirmed only |
| adopt-hygiene U5 drop drill-only bgIsolation | #643 | S | 🟢 | 1 | verifier | sdlc-verifier (verifier-l1) | unit/hygiene-U5 @ ed565dd merged a66aef4 | removed | .sdlc/verdicts/adopt-hygiene-U5.md | merged; pre-land rerun next |
| adopt-hygiene U6 pre-land fixes round 2 | #643 | S | 🔵 | 1 | builder | U6-builder-l3-p1 | unit/hygiene-U6 | .worktrees/hygiene-U6 | .sdlc/verdicts/adopt-hygiene-prepr.md | build, reviewer-l2, verifier-l2, pre-land rerun |
