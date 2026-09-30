# Question docs-stale-batch U1 · from orchestrator

| Field | Value |
|---|---|
| Blocks | docs-stale-batch U1 (#774) |
| Finding | Both approved plans edit `figma/README.md`. gates-batch U3 (#772) adds the `renameparity` gate to `DECLARED` in `test/figma/binder.mjs` and names it in the README. docs-stale-batch U1-2 pins the README's stated gate count to the `DECLARED` length, measured as 19. Whichever lands second breaks the other's count and conflicts in the same paragraph. |
| Question | How are the two ordered? |
| Options | A (recommended): docs-stale-batch U1 builds after gates-batch lands, rebased on that `main`, so its count reads 20 and names `renameparity`. The rest of docs-stale-batch runs now. · B: move #774 into gates-batch U3 (a plan revision on both plans). · C: build both now and let the second lander repair the count at merge. |
| Default if unanswered | A: it needs no plan revision, and U1-2 already reads `DECLARED` live, so only the timing moves. |

## Answer

| Field | Value |
|---|---|
| Date | 2026-09-30 |
| Asked | gates-batch and docs-stale-batch both change the gate count in figma/README.md. How should they be ordered? |
| Options | Docs U1 after gates (Recommended) · Fold #774 into gates U3 · Build both, fix at merge |
| Chosen | Docs U1 after gates (Recommended), option A (R81) |
