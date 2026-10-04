# Handoff U2 · orchestrator to verifier

| Field | Value |
|---|---|
| Plan | parallel-batch, `### U2` and `### U2 criteria` (C2.1 to C2.5), plan file `.worktrees/plan-parallel-batch/.sdlc/plans/parallel-batch.md` at revision 5 |
| Ticket | #786 (anchor), issue #783 outside citations |
| Branch | unit/pb-U2 @ b34ba577 (code 1d2f65c1, pass 2 adapter rewrite f2f2e299, reviewer records on top), base 61bcd123 |
| Worktree | .worktrees/pb-U2 |
| Lane | `figma/binder/mode-apply-plan.mjs`, `test/repo/em-dash.mjs`, `.sdlc/adapter.md`, regenerated `figma/plugin/ui.html`, the builder handoff and review records |
| Builder | pb-U2-builder-l2-p1 (pass 1), pb-U2-builder-l3-p2 (pass 2, adapter bullet only); handoff `.sdlc/handoffs/parallel-batch-U2.md` in the worktree (`## Claims`, `ran`/`out`) |
| Review | pass 1 FAIL (`.sdlc/reviews/parallel-batch-U2-review.md`: two of four adapter pitfalls wrong), pass 2 PASS (`.sdlc/reviews/parallel-batch-U2-review-p2.md`) |
| Checker grade | verifier-l2 (opus high); R86 and R92, no fable |
| Record | `.sdlc/verdicts/parallel-batch-U2.md` with the head sha |

Plan text: revision 5 replaced C2.1's second grep and named `em-dash.mjs:346` in C2.2. The pass 2 reviewer found the revision 5 third grep is vacuous on macOS (`git grep -E` ignores `\b`); the operative reading is `git grep -nP "\b(MAP|A)\.GEOMETRY_FIELD_RENAME_MAP"`, which the reviewer re-proved. Revision rows are at the cap, so that wording fix waits on an owner answer; grade C2.1 with the `-P` form. Re-measure the four adapter pitfalls against their sources yourself (the ledger needle is not evidence of truth), re-run the C2.2 control at `:346`, and C2.4's slice count. Unset NODE_OPTIONS; heavy-load count 5 or fewer, poll in turn. Common rules: `.sdlc/handoffs/parallel-batch-waveA-brief.md`.
