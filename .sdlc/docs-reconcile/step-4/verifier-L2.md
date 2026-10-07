<!-- role=verifier level=L2 model=sonnet effort=high -->
## Verdict
pass

## Criteria
- AC1, no old-path hits in `.claude`, `AGENTS.md`, `CLAUDE.md`: pass. Evidence: the negated `git grep` exited 0 with no hits. At the base `HEAD` (`ded55e1f`) the same pattern, in a shortened form, hit 26 files, so the check can go red.
- AC2, every `docs/` path in `.claude/CLAUDE.md` exists: pass. Evidence: the loop exited 0. Lines 9, 42-50, 64 and 119 name `docs/reference/data`, `docs/reference/colors/categories`, `docs/references/`, `docs/specs/` and `docs/reports/`.
- AC3, no old-path hits in the live `.sdlc` contracts: pass. Evidence: exit 0 with no hits. At base, `adapter.md` and `debt.md` alone matched in 2 files.
- AC4, `adapter.md` §5 steps 1 and 3 name `.sdlc/plans/archive/` and no `docs/`: pass. Evidence: exit 0. Step 1 reads "`active` to `done` for an `.sdlc/plans/` plan, with a revision row ...". Step 3 reads "Move the file to `.sdlc/plans/archive/`; the roadmap row and the ticket keep the link." The diff also covers X10 (closed plans before 2026-10-06 are read-only in `docs/archive/plans/`), lines 244-245, `.claude/CLAUDE.md` line 103, and `project-docs/SKILL.md` line 27.
- AC5, card-amendment check runs and the awk path-map translation is used: pass. Evidence: `stale total: 0` with exit 0. `sh -x ... | grep -c 'awk.*docs/references/decision-records.md'` printed 27. At base `HEAD` the same count is 0, so the second clause bites and the check is not passing vacuously. The diff sets `DR=docs/references/decision-records.md` and adds the awk line before the `[ -n "$src" ] && [ -e "$src" ] || continue` line.
- AC6, ADR-028 sits before `## Quick map`: pass. Evidence: the awk exit was 0.
- AC7, ADR-028 cites the four required paths: pass. Evidence: exit 0 for `docs/layout.md`, `docs/reference/data`, `docs/assets/docs-reconcile-path-map.tsv` and `.sdlc/plans/archive/`. The diff shows the Context, Decision, Rationale, Consequences and Status fields and the `docs/assets/` alternative as rejected. It adds one Quick map row saying not to move the two data paths.
- Guard, `decision-records.md` has no removed lines against the merge-base: pass. Evidence: exit 0. The diff has only `+` lines.
- Guard, frozen paths unchanged against the merge-base: pass. Evidence: `git diff --quiet` exit 0.
- Guard, `.claude/docs/other` untracked: pass. Evidence: `git ls-files` is empty.
- Extra checks:
  - `node test/repo/em-dash.mjs` and `node test/repo/branding.mjs` are clean. No U+2014 appears in the added lines of the diff.
  - `docs_check.py` reports 0 errors and 24 warnings.
  - `npm test` exited 0 with all 54 test files passed, and the tree stayed at 91 changed entries before and after.

## Out of scope changes
None found for this step. The changed files outside `.claude` and `.sdlc` belong to steps 1 to 3, because HEAD is still the step 1 WIP commit. `.sdlc/architecture.md`, `.sdlc/baseline.md`, `.sdlc/survey.md`, `.sdlc/debt.md` and `.sdlc/checks/card-amendment-check.sh` are all named in the Do. Frozen paths are untouched (guard above).

## For the next attempt
None.
