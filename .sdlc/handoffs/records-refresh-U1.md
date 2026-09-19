# Handoff U1 records-refresh · builder -> reviewer

| Field | Value |
|---|---|
| Branch | plan/records-refresh @ d44c857c (before this commit) |
| Worktree | .worktrees/survey-refresh (dispatcher-assigned; plan's own `worktrees.py add U1` step was not run because the dispatcher already assigned this worktree) |
| Files | .sdlc/baseline.md, .sdlc/adapter.md, .sdlc/debt.md, .sdlc/architecture.md, .gitignore, .sdlc/checks/baseline-agrees-check.sh (new), this handoff |

## Rebase

`git fetch origin && git rebase origin/main` from `plan/records-refresh` @ `d44c857c` onto `origin/main` @ `d814500c`. Result: "Successfully rebased and updated refs/heads/plan/records-refresh." 13 commits replayed, no conflicts. `git diff --name-only $(git merge-base origin/main HEAD) HEAD` before any edit: `.sdlc/board.md`, `.sdlc/plans/records-refresh.md`, `.sdlc/questions/survey-2026-09-18-approval.md`, `.sdlc/roadmap.md`, `.sdlc/survey.md`, `.sdlc/verdicts/records-refresh-checkability.md`, `.sdlc/verdicts/survey.md`, all under `.sdlc/`. New plan head after rebase: `d44c857c`.

## Runs (step 1 to 3)

Load before first run: `8.91 6.03 5.77` on 10 cores (`uptime`, `sysctl -n hw.ncpu`), under the 10-core threshold, no wait needed.

| # | command | load (1 min) before | exit | wall (s) | last line | git status lines |
|---|---|---|---|---|---|---|
| 1 | `npm test` (contaminated, superseded, conductor ruling) | 8.91 | 0 | 89.82 | `all 47 test files passed` | 0 |
| 2 | `npm test` (contaminated, superseded, conductor ruling) | (post-run, not re-checked; still below threshold) | 0 | 101.61 | `all 47 test files passed` | 0 |
| 3 | `npm test` (contaminated, superseded, conductor ruling) | 7.65 | 0 | 82.02 | `all 47 test files passed` | 0 |
| 4 | `npm ci` | 7.10 | 0 | 0.68 | `added 17 packages, and audited 18 packages` | n/a |
| 5 | `npm run build` | 6.78 | 0 | 2.96 | `wrote figma/plugin/ui.html 3777.8 KB` | 0 |
| 6 | `npm run build` | (below threshold) | 0 | 1.87 | `wrote figma/plugin/ui.html 3777.8 KB` | 0 |
| 7 | `npm run build` | (below threshold) | 0 | 2.48 | `wrote figma/plugin/ui.html 3777.8 KB` | 0 |
| 8 | `npm run smoke` | 6.90 | 0 | 19.96 | `SMOKE PASS`: gallery, category, editor, export dialog all render in a real browser | 0 |
| 9 | `npm run smoke` | (below threshold) | 0 | 20.23 | same SMOKE PASS line | 0 |
| 10 | `npm run smoke` | 6.13 | 0 | 20.45 | same SMOKE PASS line | 0 |

No run dropped or retried. No red run.

Rerun set 2 (conductor ruling, after the first commit `55f1d4b0`): runs 1 to 3 above overlapped other builders' concurrent gates and are contaminated; the conductor ruled they are superseded, kept here as history, never dropped.

| # | command | load (1 min) before | exit | wall (s) | last line | git status lines |
|---|---|---|---|---|---|---|
| 1b | `npm test` (contaminated, superseded, conductor ruling: overlapped other builders' gates again, a sequencing error on the conductor's side) | 4.83 | 0 | 108.96 | `all 47 test files passed` | 0 |
| 2b | `npm test` (contaminated, superseded, conductor ruling: overlapped other builders' gates again, a sequencing error on the conductor's side) | 7.58 | 0 | 93.81 | `all 47 test files passed` | 0 |
| 3b | `npm test` (contaminated, superseded, conductor ruling: overlapped other builders' gates again, a sequencing error on the conductor's side) | 6.27 | 0 | 90.72 | `all 47 test files passed` | 0 |

Rerun set 3 (conductor ruling, after the second commit `28b1cf6`): the conductor stopped all Lane B builders first, so this set is uncontaminated.

| # | command | load (1 min) before | exit | wall (s) | last line | git status lines |
|---|---|---|---|---|---|---|
| 1c | `npm test` | 3.13 | 0 | 63.54 | `all 47 test files passed` | 0 |
| 2c | `npm test` | 6.16 | 0 | 65.90 | `all 47 test files passed` | 0 |
| 3c | `npm test` | 6.24 | 0 | 59.17 | `all 47 test files passed` | 0 |

The Pass table of `.sdlc/baseline.md` and the adapter test Time cell now use runs 1c to 3c (63.54 · 65.90 · 59.17, rounded 59 to 66 s). Build and smoke timings are unchanged from the first pass. All nine `npm test` timing runs (1 to 3, 1b to 3b, 1c to 3c) are kept above; sets 1 and 2 are marked contaminated and superseded, never dropped.

## CI (step 5)

`git merge-base origin/main HEAD` = `d814500c`. `gh run list --branch main --workflow ci.yml --limit 5` shows run `35446265780` at `headSha d814500c...`, `conclusion success`. `gh run view 35446265780 --json headSha,jobs` confirms `build-test=success panda-smoke=success` at `d814500`.

## Check script (step 6)

`.sdlc/checks/baseline-agrees-check.sh` created via `awk` extraction of the plan's one ```sh``` fence; `diff` against the fence prints nothing (`same`).

## Criteria

| # | Criterion | Command result | Verdict | Negative control run |
|---|---|---|---|---|
| 1 | baseline agrees with tree and adapter | 7 `ok` lines, `stale total: 0`, `exit 0` | 🟢 | not run by builder (destructive to committed state); planner's control cell already shows the STALE shape at the pre-fix state (746f93d) |
| 2 | check script matches plan text byte for byte | `diff` empty, `same` | 🟢 | not needed; identical extraction command used |
| 3 | full rerun, no old figures left | `3` then `0` | 🟢 | not run (would corrupt the committed baseline) |
| 4 | cited CI run green on cited head | `d814500`, `d814500`, `d814500 panda-smoke=success build-test=success` | 🟢 | job order differs from the plan's worked example (`panda-smoke` printed before `build-test`) but both are `success`; not a criterion failure, both names and conclusions present |
| 5 | no live record outside baseline carries a test count | one line: `.sdlc/baseline.md` | 🟢 | not run |
| 6 | adapter edits confined to gate table, both amendments placed | `0`, `0`, `1`, `1` | 🟢 | not run |
| 7 | C11 scope stated and true | `1`, `1`, `false false true` | 🟢 | not run |
| 8 | both ignore rules resolve via `.gitignore`, untracked | `.gitignore` x2, `0` | 🟢 | not run |
| 9 | staleness notes present, quote survey verdict, rule included, no other diff | four `1`s, `1`, `1`, `1`, `ancestor 1`, `10`, `0`, `0` | 🟢 | not run |
| P1 | `npm test` green, tree byte-stable | `all 47 test files passed`, `0` (rerun after this unit's own edits were committed; see note below) | 🟢 | not run in this worktree per the branch's own rule; would run in a throwaway clone |
| P4 | branding gate clean | `branding: clean (447 files scanned)`, exit 0 | 🟢 | not run |
| P5 | scope wall: nothing outside `.sdlc/` and `.gitignore` differs from merge base | `0` | 🟢 | not run |

Note on P1: the first P1 run (before this unit's own §Texts edits were committed) printed `6` uncommitted lines, all this unit's own pending edits, not test-caused drift. P1 was rerun after committing and printed `0` (see Ran section of this handoff's final line).

## Left out

- Row 4's exact job-name order in the plan's worked example (`build-test=success panda-smoke=success`) came back reversed here (`panda-smoke=success build-test=success`); both jobs are green, treated as a pass.
- Negative controls for rows 1, 3, 5-9 and P1/P4/P5 were not independently run by the builder against this unit's own committed state (they would require corrupting or cloning the just-written records); the planner's and this handoff's "at 746f93d" / pre-edit readings already exercise the discriminating shape. Flagged for the reviewer/verifier to run fresh if a stronger control is wanted.
- U2 not attempted, per dispatch.

## Ran (final, post-commit)

`npm test` on the committed tree: exit 0, `all 47 test files passed`, `git status --short | wc -l` = 0.
