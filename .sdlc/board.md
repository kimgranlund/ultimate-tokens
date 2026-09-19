# Board

Orchestrator-only. Rows edited in place. adopt-hygiene landed as PR #653 (squash `180eca0`); its plan is archived at `.sdlc/plans/archive/adopt-hygiene.md` and the root checkout is back on `main`.

| Unit | Ticket | Size | State | Pass | Owner | Worker | Branch | Worktree | Doc | Next |
|---|---|---|---|---|---|---|---|---|---|---|
| adopt-hygiene U1 records, plans, stubs, moved docs | #643 | M | 🟢 | 2 | verifier | sdlc-verifier (L1 seat ran it; grade l3 asked) | unit/hygiene-U1 @ 89c9538 merged 044df08 | removed | .sdlc/verdicts/adopt-hygiene-U1.md | landed in PR #653, squash 180eca0 |
| adopt-hygiene U2 harness, config, ignores, workflows, CLAUDE.md | #643 | M | 🟢 | 2 | verifier | sdlc-verifier (L1 seat ran it; grade l3 asked) | unit/hygiene-U2 @ 0ad0faa merged b320385 | removed | .sdlc/verdicts/adopt-hygiene-U2.md | landed in PR #653, squash 180eca0 |
| adopt-hygiene U3 repo settings, git index, local branches | #643 | S | 🟢 | 1 | verifier | sdlc-verifier (verifier-l1) | unit/hygiene-U3 @ d731a9e merged 6b57378 | removed | .sdlc/verdicts/adopt-hygiene-U3.md | landed in PR #653, squash 180eca0 |
| adopt-hygiene U4 pre-land fixes | #643 | S | 🟢 | 1 | verifier | sdlc-verifier (verifier-l1) | unit/hygiene-U4 @ 8ebf172 merged a91af16 | removed | .sdlc/verdicts/adopt-hygiene-U4.md | landed in PR #653, squash 180eca0 |
| adopt-hygiene U5 drop drill-only bgIsolation | #643 | S | 🟢 | 1 | verifier | sdlc-verifier (verifier-l1) | unit/hygiene-U5 @ ed565dd merged a66aef4 | removed | .sdlc/verdicts/adopt-hygiene-U5.md | landed in PR #653, squash 180eca0 |
| adopt-hygiene U6 pre-land fixes round 2 | #643 | S | 🟢 | 1 | verifier | sdlc-verifier (verifier-l2) | unit/hygiene-U6 @ e26d023 merged 2617a50 | removed | .sdlc/verdicts/adopt-hygiene-U6.md | landed in PR #653, squash 180eca0 |
| adopt-hygiene U7 declare nonoun marketplace | #643 | S | 🟢 | 2 | verifier | sdlc-verifier (verifier-l3) | unit/hygiene-U7 @ 3fbeb5c merged ffcb9e0 | removed | .sdlc/verdicts/adopt-hygiene-U7.md | landed in PR #653, squash 180eca0 |
| adopt-hygiene U8 staleness and wording sweep | #643 | S | 🟢 | 2 | verifier | sdlc-verifier (verifier-l3) | unit/hygiene-U8 @ 266d13e merged a9ffe6e | removed | .sdlc/verdicts/adopt-hygiene-U8.md | landed in PR #653, squash 180eca0 |
| adopt-hygiene U9 pre-land fixes round 4 | #643 | S | 🟢 | 1 | verifier | sdlc-verifier (verifier-l3) | unit/hygiene-U9 @ 10072b4 merged 1ee2a40 | removed | .sdlc/verdicts/adopt-hygiene-U9.md | landed in PR #653, squash 180eca0 |
| adopt-hygiene U10 card and index lineage | #643 | S | 🟢 | 1 | verifier | sdlc-verifier (verifier-l3) | unit/hygiene-U10 @ a6e32b2 merged d79360e | removed | .sdlc/verdicts/adopt-hygiene-U10.md | landed in PR #653, squash 180eca0 |
| preset-intent-fidelity U1 anchor field, prime.DEFAULT byte-exact | #681 | M | 🟢 | 2 | verifier | pif-U1-builder-l3-p1 | unit/pif-u1-anchor @ ab9eaa6 | .git-worktrees/pif-u1-anchor | .sdlc/verdicts/pif-u1.md | hold for U4 integration |
| preset-intent-fidelity U2 ramp passes through the anchor at stop 500, Reset action | #681 | L | 🔁 | 5 | builder | pif-U2-builder-l4-p1 | unit/pif-u2-ramp @ 4c2831ab | .git-worktrees/pif-u2-ramp | .sdlc/handoffs/pif-u2.md; .sdlc/questions/pif-u2.md | perf and memo-safety pass (npm test 200 s against 77 s baseline), then review 6; the notch list diff (76 ruled, 78 now) goes to the conductor |
| preset-intent-fidelity U3 anchor-centred chroma envelope | #681 | M | 🟢 | 7 | verifier | pif-U3-builder-l4-p2 | unit/pif-u3-envelope @ 78a9018f | .git-worktrees/pif-u3-envelope | .sdlc/verdicts/pif-u3.md | hold for U4 integration; lands after the owner accepts the C6 iv movement table |
| preset-intent-fidelity U4 integration U1, U2, U3, U6 and blast-radius report | #681 | M | ⚪ | 0 | orchestrator | none | none | none | .sdlc/plans/preset-intent-fidelity.md | starts when U2 is verified |
| preset-intent-fidelity U5 records | #681 | S | ⚪ | 0 | orchestrator | none | none | none | .sdlc/plans/preset-intent-fidelity.md | after U4; includes the Panda spec (Q-U2-4) and C10 wording |
| preset-intent-fidelity U6 prime ladder steps equally in perceived lightness | #681 | M | 🟢 | 3 | verifier | pif-U6-builder-l4-p3 | unit/pif-u6-ladder @ 3df582d | .git-worktrees/pif-u6-ladder | .sdlc/verdicts/pif-u6.md | hold for U4 integration; #686 closes when the plan PR lands |
