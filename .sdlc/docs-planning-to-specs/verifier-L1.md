<!-- role=verifier level=L1 model=sonnet effort=medium -->
## Verdict
pass

## Criteria
- Both files in docs/specs with history: pass. Evidence: `git diff fbf27987 HEAD --stat -M` shows `docs/{planning => specs}/ui-plan.md` and `decomposition.md` as renames with 0 changes. `git log --follow` reaches `37e7ca24` and earlier for both files.
- docs/planning gone: pass. Evidence: `ls docs/planning` returns "No such file or directory". The solo also deleted `docs/planning/AGENTS.md` and `CLAUDE.md`.
- No live reference to the old paths: pass. Evidence: `git grep -nE 'planning/(ui-plan|decomposition)|docs/planning'` outside `.sdlc` and `docs/archive` returns nothing. The remaining `planning/` hits are generic and all intended. `docs/AGENTS.md:9,25` and `docs/layout.md:8,22,23,38` describe the `planning/` home as a category, and `docs/layout.md` is the schema file.
- Fact pins in `test/repo/citations.mjs`: pass. Evidence: lines 87 and 89 now say `doc: "docs/specs/ui-plan.md"`, and `repo/citations.mjs` passes inside `npm test`. `node scripts/audit-citations.mjs` exits 0.
- `docs-reconcile-path-map.tsv` column 2: pass. Evidence: line 29 is `docs/reference/references/decomposition.md	docs/specs/decomposition.md` and line 40 is `docs/reference/references/ui-plan.md	docs/specs/ui-plan.md`. `sh .sdlc/checks/card-amendment-check.sh` prints `stale total: 0`.
- docs/AGENTS.md has no dead links: pass. Evidence: `docs_check.py --root .` prints `0 errors, 24 warnings (B-2a 14, D-11 10)`. All of the warnings I saw are D-11 line-count warnings on files this change doesn't touch. I did not run the check at base, so I can't say whether any warning is new. The diff removes the `planning/` link from the Contents list.
- `npm test`: pass. Evidence: ran via `gate_lock.py run -- npm test` and got "all 59 test files passed". The tree stayed clean apart from the verifier's own `.sdlc/docs-planning-to-specs/` files.
- `(red)` criteria: none in the handoff, and `process-deviations.md` is absent.

## Out of scope changes
- `README.md` and the `adding-semantic-roles/references/best-practices.md` skill file are one-line cite repoints, so they are in scope.
- `docs/specs/app-shell.md` and `docs/specs/spec-cell.md` are cite repoints, also in scope.
- Nothing else changed.

## For the next attempt
None. Two notes for the Conductor:
- **`docs/specs/AGENTS.md` is stale.** `onboard.py check` reports `stale docs/specs/AGENTS.md`. Its managed block does not list `ui-plan.md` or `decomposition.md`. At the base commit `fbf27987` the same check reported it `current`, so the move caused this. It blocks no gate: `npm test` is green and `docs_check` shows 0 errors. It needs an `onboard.py setup` refresh at the next sync.
- **`docs/AGENTS.md` managed block hand-edited.** The solo removed the `[planning/]` link from the Contents list, which is inside the managed block (lines 1 to 48). `onboard.py check` now reports `edited docs/AGENTS.md: the managed block was edited by hand; left unchanged (--force replaces it)`. At base it was `current`. This breaks the handoff constraint against hand-editing managed blocks, though the removal avoided a dead link. `onboard.py setup --force` should regenerate that block, and `docs/AGENTS.md` must be re-checked after it runs. The root `AGENTS.md` also shows `stale`, but that edit was already in the working tree before this task.
