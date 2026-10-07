<!-- role=builder level=L2 model=opus effort=low -->
## Status
done

## Changes
- Nothing was redone. W already held the full staged result from the blocked attempt: 99 R100 renames per move-map.tsv, `AGENTS.md`, `CLAUDE.md`, `docs/AGENTS.md`, `docs/CLAUDE.md`, `docs/layout.md` with the `reference/` home and the assets row, `docs/assets/docs-reconcile-path-map.tsv`, and the onboard nested entries (`specs/`, `specs/marketing/`, `specs/site/`, `references/` plus `colors/`, `rubrics/`, `typography/`, and `archive/`).
- Committed that staged result in W as `ded55e1f WIP step 1`. The tree is clean after the commit.

## Checks
- c1 (ls-files vs move-map col 2): diff empty, exit 0
- c2 (R100 count = 99): exit 0
- c3 docs_check: `docs_check: 0 errors, 30 warnings (B-2a 12, D-10 8, D-11 10)`, exit 0
- c4 D-1 info line for `docs/reference/` as an assets home: found, exit 0
- c5 `onboard.py check`: exit 0
- c6 path-map diff: empty, exit 0
- guard 7 (data, categories and .sdlc records unchanged): exit 0
- guard 8 (archive/tickets/plan only R100): exit 0
- guard 9 (no `.claude/docs/other` tracked): exit 0

## Notes
- The merge-base is still `73554a18` after the WIP commit.
- `npm test` was not run because this step names no such criterion.
