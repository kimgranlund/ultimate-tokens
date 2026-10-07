<!-- role=builder level=L2 model=opus effort=low -->
## Status
blocked

## Changes
None

## Checks
- `cd /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/docs-reconcile`: failed with "no such file or directory". The worktree does not exist.
- The builder ran with cwd `/Users/kimgranlund/Projects/nonoun/ultimate-tokens`, the main checkout, not W.

## Notes
stale lane: the conductor precondition is not done. `.worktrees/docs-reconcile` on branch `plan/docs-reconcile` from `main` does not exist, and this builder was launched in the main checkout instead of W. A builder cannot create it, because the hook denies new branches and worktrees outside `$SDLC_TMP_WORKTREES`. Every acceptance criterion `cd`s into W.

Before rerunning the conductor must:
1. Create the worktree (`git worktree add -b plan/docs-reconcile .worktrees/docs-reconcile main`).
2. Relaunch the builder with W as cwd.

A second issue to settle first: Do item 6 asks for a local commit. Builder rule 4 forbids commits on a step that is not a merge step unless the brief asks for WIP commits. The criteria compare the working tree to the merge-base and pass without a commit. So either the brief allows the commit explicitly, or the conductor makes the commit after verification.
