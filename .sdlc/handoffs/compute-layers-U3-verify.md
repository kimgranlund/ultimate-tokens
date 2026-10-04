# Handoff cl-U3 · orchestrator to verifier

| Field | Value |
|---|---|
| Plan | compute-layers, `### U3: one evaluator`, C3.1 to C3.3, plan revision 6 (C3.3 control reworded, owner rule R3): `.worktrees/plan-compute-layers/.sdlc/plans/compute-layers.md` |
| Ticket | #788 |
| Branch | unit/cl-U3 @ 9d4e10f2 (builder code 470a0877, review commit on top), base plan/compute-layers @ 6e47c6c8 |
| Worktree | .worktrees/cl-U3 |
| Lane | `src/engine/layers.mjs`, `src/engine/exports.js`, `src/ui/model.mjs`, `test/engine/layers.mjs`, `test/run.mjs` TESTS line; out of lane and judged necessary by the reviewer: `test/engine/anchor.mjs`, one citation line in `docs/reference/reviews/2026-08-20-reactivity/02-sections-and-resolvers.md`, a `scripts/bundle.mjs` comment, a CHANGELOG bullet |
| Builder | cl-U3-builder-l5-p1 (opus) · handoff `.sdlc/handoffs/compute-layers-U3.md` in the worktree |
| Review | PASS, `.sdlc/reviews/compute-layers-U3-review.md` (reviewer-l3, sonnet-family stand-in per R86/R92; follow-ups only, listed there) |
| Checker grade | verifier-l2 (R86/R92 stand-in for fable; the record header names the shared family) |
| Record | `.sdlc/verdicts/compute-layers-U3.md` with the head sha |

Notes: the C3.3 control is `0.95 *` (880 cells), since `1.05 *` is hidden by the cap at 100; IDENT does not reach `compute`, so the builder's and the reviewer's base-vs-HEAD `projectView` byte comparison over 349 to 353 docs is the behavior proof: re-derive it yourself. Owner ceremony (`.sdlc/questions/ceremony-policy.md`, R1, R6): only code or behavior defects or an unmet criterion block; wording and the reviewer's follow-ups (IDENT blind to compute, prime inputs under-declared, type and geometry not walked, C2.1 text) are one batched follow-up issue, not rework. Host is heavily loaded: no timing rows.
