<!-- role=builder level=L2 model=opus effort=low -->
## Status
blocked

## Changes
- AGENTS.md, CLAUDE.md, docs/AGENTS.md, docs/CLAUDE.md, docs/layout.md: copied from the main checkout and staged.
- docs/layout.md: added `reference/` as the last item under Homes, and the `reference/` assets row after the `other/` row of Kinds.
- docs/**: 99 `git mv` renames per move-map.tsv, all staged and all R100.
- docs/assets/docs-reconcile-path-map.tsv: new file, 99 lines.
- Nested entry files from `onboard.py setup --yes`, staged: docs/specs/, docs/specs/marketing/, docs/specs/site/, docs/references/ and its colors/, rubrics/, typography/, and docs/archive/ (each AGENTS.md + CLAUDE.md).

## Checks
- Criterion 1 (ls-files vs MAP column 2): ok
- Criterion 2 (R100 count = 99): ok
- Criterion 3 docs_check: `docs_check: 0 errors, 30 warnings (B-2a 12, D-10 8, D-11 10)`: ok
- Criterion 4 (D-1 info line for docs/reference/): ok
- Criterion 5 `onboard.py check`: ok (rc 0)
- Criterion 6 (path map diff): ok
- Guard 7 (data, categories, .sdlc records, CHANGELOG unchanged): ok
- Guard 8 (only R100 under docs/archive, docs/tickets, docs/plan): FAIL, lists `A docs/archive/AGENTS.md` and `A docs/archive/CLAUDE.md`
- Guard 9 (.claude/docs/other untracked): ok
- Probe: with the two archive entry files removed, `onboard.py check` printed `missing docs/archive/AGENTS.md`, `missing docs/archive/CLAUDE.md` and exited 1. I put both files back and re-staged them, and criterion 5 is back to rc 0.

## Notes
plan defect: guard 8 (`git diff -M --name-status <mb> -- docs/archive docs/tickets docs/plan | grep -v '^R100'` must be empty) contradicts Do step 5 and criterion 5. Onboard creates and requires `docs/archive/AGENTS.md` and `docs/archive/CLAUDE.md` (the handoff lists `archive/` among the expected entries), and these show up as `A`, not R100. One possible fix is for guard 8 to exclude `docs/archive/(AGENTS|CLAUDE).md`.
- The work is staged in the worktree on `plan/docs-reconcile`, all as renames or additions.
- I made no commit. Do step 6 asks for one, but builder rule 4 allows commits only on merge steps. Criteria 1 to 6 compare against the working tree, so they pass without a commit. The conductor or planner should make the `docs-reconcile: move docs into the schema homes` commit once guard 8 is resolved.
- `npm test` was not run (no criterion of this step names it).
