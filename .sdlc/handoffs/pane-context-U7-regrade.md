# Handoff U7 · orchestrator to verifier

| Field | Value |
|---|---|
| Plan | pane-context, `### U7` and its criteria C7.1 to C7.4, revision 16 (`.worktrees/plan-pane-context/.sdlc/plans/pane-context.md`) |
| Ticket | #785 |
| Branch | unit/pc-U7 @ 9f43f3fe (pass 2 code dbd7519b, pass 1 code d2311bef), base is the plan head at U7 activation |
| Worktree | .worktrees/pc-U7 |
| Lane | `src/engine/tonal.js` (comments only), the LLD `:62` snippet, the reactivity review `:27`, the two knowledge and spec docs, `test/ui/headless-boot.mjs` (the `:4245` comment only, widened on the plan branch), regenerated `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js`, handoff and review records |
| Builder | pc-U7-builder-l4-p1, pc-U7-builder-l4-p2 (pass 2 never below pass 1); handoff `.sdlc/handoffs/pane-context-U7.md` in the worktree (Pass 2 section has the re-judged sweep tables) |
| Review | pass 1 FAIL (`.sdlc/reviews/pane-context-U7-review.md`: F1 to F3), pass 2 PASS (`.sdlc/reviews/pane-context-U7-review-p2.md`, reviewer-l3) |
| Checker grade | verifier-l2 (opus high); R86 and R92, no fable; a sonnet builder, so opus checkers are outside its family |
| Record | `.sdlc/verdicts/pane-context-U7.md` with the head sha |

Pass 1 classed sweep hits true by name; pass 2 re-judged every hit against the code. Re-open a real sample of both sweeps yourself and judge against the code (the group value reaches the resolver at `tonal.js:946` and below), not against the builder's table. Re-measure the AC-006 claim against `test/engine/tonal.mjs` group-chroma-damper (v). Diff scope: comments and records only, so the comment-strip diff over src, test, scripts must be empty (drop whitespace-only lines). Three out-of-lane finds are listed in the handoff (`test/engine/anchor.mjs:505`, `.sdlc/records/cards/SPEC-muted-base.md` line 4, spec REQ-007 banner): they go to a follow-up, do not grade them. Unset NODE_OPTIONS; heavy-load count 5 or fewer is fine, poll in turn. U7 is the last unit: after your record, I request the pane-context pre-land pass 4.
