# Handoff U3 · orchestrator to verifier

| Field | Value |
|---|---|
| Plan | parallel-batch, `### U3` and `### U3 criteria` (C3.1 to C3.6), revision 7 (owner-approved), plan file `.worktrees/plan-parallel-batch/.sdlc/plans/parallel-batch.md` |
| Ticket | #786 (anchor), issue #787 predicate |
| Branch | unit/pb-U3 @ 4fc91a1c (pass 3 code a7f4897c; passes 1 and 2 at d72d7e5b and fb7f69f1), base is the plan head at U3 activation |
| Worktree | .worktrees/pb-U3 |
| Lane | `src/engine/names.mjs`, `test/engine/names.mjs`, the `TESTS` line of `test/run.mjs`, the builder handoff and review records |
| Builder | pb-U3-builder-l3-p1, l4-p2, l5-p3 (opus on pass 3; its commit trailer reads Sonnet 5.5 as session boilerplate); handoff `.sdlc/handoffs/parallel-batch-U3.md` in the worktree (Pass 3 section) |
| Review | pass 1 FAIL, pass 2 FAIL (same root: a hand-enumerated name set), pass 3 PASS (`.sdlc/reviews/parallel-batch-U3-review-p3.md`, reviewer-l3) |
| Checker grade | verifier-l2 (opus high); R86 and R92 stand-in for the capped fable seat, so the opus builder and opus checkers share a family; the record header says so |
| Record | `.sdlc/verdicts/parallel-batch-U3.md` with the head sha |

Context: `.sdlc/plans/parallel-batch-U3-rediagnosis.md` (read it) and the owner ruling in `.sdlc/questions/parallel-batch-U3-pass3.md`: contract A, the 10 documented formats plus the 3 DS bundles, position-independent superset; reported, not refused: Panda plus Radix in one config, a palette against a kit constant, a single palette duplicating itself. The earlier FAILs were one root cause (names not read from the exporters' output), so attack that: run your own two-palette probe battery over every surface (the pass 2 reviewer used 272 candidate partners) against a direct duplicate scan, look for false negatives and false positives (`x` vs `x-primer`, `x-5000`), plant a new exporter key or bundle file and confirm the completeness check reds, and confirm the memo (C3.6). Re-run every C3 control yourself. Unset NODE_OPTIONS; heavy-load count 5 or fewer is fine, poll in turn. Common rules: `.sdlc/handoffs/parallel-batch-waveA-brief.md`.
