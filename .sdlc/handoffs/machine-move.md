# Handoff · machine move · conductor to the next session

Written 2026-10-04 when the repo was wound down to move to another computer. Everything below is pushed to origin; nothing lives only in a local worktree.

## Resume

| Step | Command |
|---|---|
| 1 | Clone or copy the repo, then `npm ci` |
| 2 | Copy `.claude/docs/other/` by hand (local only, never in git) |
| 3 | `session.sh up` to start the conductor, orchestrator and verifier seats |
| 4 | Seats resume from `.sdlc/board.md` on main (fc4fe06b), not from chat history |
| 5 | Recreate unit worktrees from the pushed branches below with `worktrees.py add <unit> --plan <slug>` |

## In flight

| Unit | Branch @ sha | State | Next |
|---|---|---|---|
| parallel-batch U6 · #787 | unit/pb-U6 @ ba101172 | built, gates green | reviewer-l1 (trivial lane), then merge into plan/parallel-batch |
| parallel-batch U8 · #784 | unit/pb-U8 @ 5c3a1be2 | review pass 1 FAIL (R98: rotated-ceiling cap still live on the non-anchored path) | pass 2 builder-l7 per `.sdlc/handoffs/parallel-batch-U8-rework.md`, then reviewer-l3, verifier-l2 |
| compute-layers U4 · #788 | unit/cl-U4 @ a2f82a32 | built | reviewer-l3, verifier-l2; lane exceptions in `.sdlc/questions/compute-layers-U4.md` |

## Plans

| Plan | Branch @ sha | Done | Remaining |
|---|---|---|---|
| parallel-batch #786 | plan/parallel-batch @ 6537465d | U1 U2 U3 U4 U5 U7 | U6, U8, then one pre-land pass, PR, land |
| compute-layers #788 | plan/compute-layers @ 1a99d5ad | U1 U2 U3 | U4, then U5 last; U5's ramp@1 freeze (C4.4) waits on pb-U8 landing on main (owner Q3 B) |
| pane-context #785 | landed, PR #797, squash 75724c45 | all | closed and archived |

## Standing owner rules

| Record | Rule |
|---|---|
| `.sdlc/questions/ceremony-policy.md` | R1 to R8: only code or behavior defects block; docs and wording go to one follow-up issue per plan; one checkability pass and one pre-land pass; trivial lane for small and docs units; lowest grade that fits; land as soon as green |
| `.sdlc/questions/parallel-batch-U3-pass3.md` | collision refusal covers the 10 formats plus 3 bundles |
| `.sdlc/questions/parallel-batch-approval.md` | Q2 refuse a colliding name with a badge; Q3 U8 lands before compute-layers freezes ramp@1 |

## Held for the owner

#778 (big, needs its own plan) · #377 (blocked) · PR #158 (held for go-live).

## Landing gates (conductor)

At the exact PR head: pre-land record 🟢 at that sha, every non-skipped check green, a fresh reviewer-l3 posts `ACCEPT <sha>`, PR MERGEABLE and CLEAN. Then `gh pr ready`, `gh pr merge N --squash --match-head-commit <sha>`, delete the remote `plan/<slug>` branch, and ask the orchestrator for close-out.
