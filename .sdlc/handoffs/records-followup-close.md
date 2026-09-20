---
kind: handoff
plan: records-followup
unit: close
branch: sdlc/rf-close
written: 2026-09-20
pass: 1
---

# Handoff close records-followup - builder -> orchestrator

| Field | Value |
|---|---|
| Branch | sdlc/rf-close, at `1f991877`, equal to `origin/main` when the unit started |
| Worktree | .worktrees/rf-close |
| Files | this handoff, and nothing else |
| Ran | eighteen timed gate runs across two dispatches, all exit 0, tree clean after every one. None of them is a figure of record |
| Outcome | the baseline re-point is out of scope. The runs are dropped, the quiet-host rule tightens to load under 5, and gate-split U6b does the one re-measure and the `ref` re-point |
| Left out | `.sdlc/baseline.md` and `.sdlc/adapter.md` are untouched. `ref` stays `20298cc` and the check script keeps printing its uncounted `note  head:` line |

## What this handoff is

The close-out of plan records-followup was to re-point `.sdlc/baseline.md`'s `ref` from `20298cc` to `e9850935`, the squash of PR #716, after re-running the five gates of record under the quiet-host rule. That work was dispatched twice and completed neither time.

The first dispatch stood down after an hour above load 10. The second took fourteen usable runs, could not get a fifteenth, and surfaced a defect in the quiet-host rule itself. The owner ruled on that defect at `.sdlc/questions/records-followup-repoint-threshold.md` (main `1ef4f74f`): the fourteen runs are dropped, the rule tightens from load under 10 to load under 5, and gate-split U6b inherits both the re-measure and the re-point. Nothing waits on this unit.

The earlier ruling this unit was executing is at `git show plan/gate-split:.sdlc/questions/gate-split-approval.md`, follow-up question 6 and plan row U6-9. It is not withdrawn; it moved to U6b.

## Runs

Eighteen runs across the two dispatches. `sysctl -n hw.ncpu` prints `10`. The load columns are the 1-minute figure from `uptime` immediately before and after each run. The repo-busy column is the count of processes matching `pgrep -f 'test/run.mjs|curated-contrast|[v]ite|headless'` that resolve to a path under this repository and sit above 1.0% cpu, taken immediately before the run; no idle dev server of this repo was running at any point in this unit, so a zero there means no repo process at all rather than an idle one discounted. The status column is `git status --short | wc -l` after the run. Last lines are quoted byte for byte per `.sdlc/adapter.md` §3.

**Not one row below is a figure of record.** All eighteen are dropped by the ruling.

| # | command | load before | load after | repo busy | exit | seconds | last line | status | used |
|---|---|---|---|---|---|---|---|---|---|
| 0 | `npm test` | 10.21 | not recorded | not recorded | 0 | 138.02 | `✓ all 48 test files passed` | 0 | no, started at load 10.21, at or above the then-threshold of 10 |
| 1 | `npm test` | 6.89 | 7.01 | 0 | 0 | 109.73 | `✓ all 48 test files passed` | 0 | dropped by the ruling |
| 2 | `npm test` | 7.09 | 6.95 | 0 | 0 | 106.32 | `✓ all 48 test files passed` | 0 | dropped by the ruling |
| 3 | `npm test` | 6.95 | 10.47 | 0 | 0 | 112.89 | `✓ all 48 test files passed` | 0 | dropped by the ruling |
| 4 | `npm run gate:corpus-contrast` | 7.42 | 7.17 | 0 | 0 | 30.93 | `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color` | 0 | dropped by the ruling |
| 5 | `npm run gate:corpus-contrast` | 6.92 | 11.39 | 0 | 0 | 35.57 | `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color` | 0 | dropped by the ruling |
| 6 | `npm run gate:corpus-contrast` | 7.76 | 7.30 | 0 | 0 | 25.92 | `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color` | 0 | dropped by the ruling |
| 7 | `npm run gen:type-fonts` | 6.96 | 6.96 | 0 | 0 | 0.88 | `wrote src/ui/type-fonts.js  (229 KB · fonts 171 KB woff2)` | 0 | dropped by the ruling |
| 8 | `npm run gen:type-fonts` | 6.96 | 6.72 | 0 | 0 | 0.87 | `wrote src/ui/type-fonts.js  (229 KB · fonts 171 KB woff2)` | 0 | dropped by the ruling |
| 9 | `npm run gen:type-fonts` | 6.72 | 6.72 | 1 | 0 | 0.85 | `wrote src/ui/type-fonts.js  (229 KB · fonts 171 KB woff2)` | 0 | no, the probe caught a repo process; replaced by run 9b |
| 9b | `npm run gen:type-fonts` | 6.31 | 6.31 | 0 | 0 | 0.91 | `wrote src/ui/type-fonts.js  (229 KB · fonts 171 KB woff2)` | 0 | dropped by the ruling |
| 10 | `npm run build` | 6.41 | 6.94 | 1 | 0 | 5.61 | `wrote figma/plugin/ui.html 3780.5 KB` | 0 | no, sibling worktree at about 100% cpu; replaced by run 10b |
| 11 | `npm run build` | 6.94 | 7.18 | 1 | 0 | 3.30 | `wrote figma/plugin/ui.html 3780.5 KB` | 0 | no, sibling worktree at about 100% cpu; replaced by run 11b |
| 12 | `npm run build` | 7.18 | 7.17 | 1 | 0 | 3.23 | `wrote figma/plugin/ui.html 3780.5 KB` | 0 | no, sibling worktree at about 100% cpu; replaced by run 12b |
| 10b | `npm run build` | 7.30 | 7.19 | 0 | 0 | 3.04 | `wrote figma/plugin/ui.html 3780.5 KB` | 0 | dropped by the ruling |
| 11b | `npm run build` | 7.19 | 7.19 | 0 | 0 | 2.38 | `wrote figma/plugin/ui.html 3780.5 KB` | 0 | dropped by the ruling |
| 12b | `npm run build` | 7.19 | 6.94 | 0 | 0 | 2.50 | `wrote figma/plugin/ui.html 3780.5 KB` | 0 | dropped by the ruling |
| 13 | `npm run smoke` | 6.78 | 6.82 | 0 | 0 | 30.22 | `SMOKE PASS — gallery · category · editor · export dialog all render in a real browser` | 0 | dropped by the ruling |
| 14 | `npm run smoke` | 6.67 | 22.76 | 0 | 0 | 25.87 | `SMOKE PASS — gallery · category · editor · export dialog all render in a real browser` | 0 | dropped by the ruling |
| 15 | `npm run smoke` | never started | n/a | n/a | n/a | n/a | n/a | n/a | no, never started, see below |
| 15b | `npm run smoke` | never started | n/a | n/a | n/a | n/a | n/a | n/a | no, never started, see below |

One `npm ci` ran between run 9b and run 10, exit 0, 0.81 s, resolving typescript 7.0.2 and vite 8.3.0 (`npm ls --depth=0`). Runs 1 to 9b were taken with no `node_modules` present; runs 10 onward after it.

### The two runs that never started

Run 15 held 120 times from 13:25:13 to 14:06:04, 41 minutes, waiting for a 1-minute load under 8 with a quiet repo, then gave up. Its abort line, byte for byte:

- `ABORT load1 54.21 repo_busy 1`

Only 7 of those 120 samples were even under 10. Run 15b was a second guard, armed at the tighter threshold of load under 5 plus a quiet repo plus a free CDP port 9333, so the set would be complete whichever way the ruling went. It held 6 times and was killed on stand-down without ever finding a window.

### Runs 10 to 12, the sibling worktree

Runs 10, 11 and 12 were taken while pid 589, `node /Users/kimba/Projects/nonoun/ultimate-tokens/.git-worktrees/pif-u5-records/test/ui/headless-boot.mjs`, ran for about two minutes at 95.9% to 120.6% cpu. That path is a different worktree of this same repository, so it is a repo process, and at about 100% cpu it is not the idle dev server the quiet-host rule discounts. The three runs were re-taken as 10b to 12b under a guard extended to wait on a quiet repo as well as a quiet host. The contaminated figures ran 5.61, 3.30 and 3.23 s against the clean 3.04, 2.38 and 2.50 s, so the contamination was real and cost about half the gate's wall time on the first run.

## The finding

The quiet-host rule did not buy a quiet host, and the fourteen runs are what proved it.

`npm test` roughly doubled. The figures of record in `.sdlc/baseline.md` read:

```
| `npm test` | 3/3 | 0 | 56.27 · 56.43 · 59.83 | `✓ all 48 test files passed` |
```

Runs 1 to 3 of this unit measured 109.73, 106.32 and 112.89 s for the same command. The tree is not the cause. `git diff --name-only 20298cc e9850935` lists 68 files: 66 under `.sdlc/`, and the other two `.claude/CLAUDE.md` and `.gitignore`. No source file, test file, script or dependency moved between the two refs, and `TESTS` in `test/run.mjs` was 48 at both.

The cause is the rule's threshold. `.sdlc/baseline.md`'s host line records what the figures of record were actually taken at:

```
host: local macOS, Node 24.18, local Chrome for smoke; load 3.97 3.87 4.58 on 10 cores at run start (the test timings' own set, the uncontaminated rerun)
```

The rule permitted any start under load 10 on those same 10 cores. So a rerun was allowed to start at more than twice the load of the set it would replace, and the `A to B s` cells it produced would have encoded a loaded host as the repo's gate budget. Written into `.sdlc/adapter.md` §1, `106 to 113 s` would then have become the number every future builder and verifier grades a run against.

This is why the ruling dropped the runs rather than accepting them: the figures are not wrong about what this host did, they are wrong about what the gate costs.

## Port 9333

Between the `20298cc` set and this unit, 73 orphaned headless Chrome processes squatting the CDP port 9333 were reaped by the Orchestrator on the owner's earlier ruling (`.sdlc/questions/records-followup-repoint.md`, Answer section). The leak itself is filed as #717.

`lsof -nP -iTCP:9333 -sTCP:LISTEN` printed nothing before both smoke runs that happened, runs 13 and 14, so neither attached to a squatter's browser. Those two are therefore the first smoke runs since the `20298cc` set to have started their own browser, and they are not comparable with the `20298cc` smoke pair for that reason alone, independently of the load question. U6b's smoke figures inherit the same discontinuity and should carry the same note.

## What U6b inherits

Parked artifacts, both outside the repository and neither of them applied:

- `/private/tmp/claude-501/-Users-kimba-Projects-nonoun-ultimate-tokens/b2e196e7-c1fa-4f1c-8d62-80e1dfd367c7/scratchpad/close/adapter-4cells.patch` - an 18 line diff against `.sdlc/adapter.md` §1 carrying four time cells. Reverted out of the tree, kept only as a worked example of the edit's shape.
- `/private/tmp/claude-501/-Users-kimba-Projects-nonoun-ultimate-tokens/b2e196e7-c1fa-4f1c-8d62-80e1dfd367c7/scratchpad/close/baseline-draft.md` - a complete rewrite of `.sdlc/baseline.md` at `ref: origin/main @ e9850935`, with the live Pass table, the `20298cc` set moved down into its own labelled prior set, the `d814500` set kept below it, the smoke comparability sentence, and the CI sentence. One cell reads `SMOKE3` where the third smoke figure never arrived. Its prose and structure are reusable; every number in it is dropped.

The four cells that were measured, all of them **not figures of record**, with the loads they were taken at:

| gate | cell as measured | start loads |
|---|---|---|
| test | `106 to 113 s` | 6.89, 7.09, 6.95 |
| build | `2 to 3 s warm` | 7.30, 7.19, 7.19 |
| corpus-contrast | `26 to 36 s` | 7.42, 6.92, 7.76 |
| fonts | `1 to 1 s` | 6.96, 6.96, 6.31 |

The smoke cell was never computable: two runs, and the check script requires exactly three figures in the seconds cell, which is why no partial table was written.

Facts about the re-point target that U6b does not need to re-derive, all verified in this worktree at `1f991877`:

- CI run 35532594743 on `e9850935` reports four jobs, all `success`: `build-test`, `panda-smoke`, `corpus-contrast`, `deploy`.
- `git merge-base --is-ancestor e9850935 origin/main` succeeds, and `git diff --quiet e9850935 HEAD -- . ':(exclude).sdlc' ':(exclude).gitignore'` succeeds. Both head rows of `baseline-agrees-check.sh` would therefore have printed `ok` at this head.

One correction to carry forward. The stand-down brief states that `TESTS` is 50 after #681 and #713 U1. Measured rather than assumed, `TESTS` in `test/run.mjs` is **48** at `1f991877` and **48** on `origin/main` at `1ef4f74f`; neither #681 nor #713 appears in main's last 40 subjects. It is **50** on the local, unlanded `plan/gate-split` branch. So 50 is the right number for U6b, which runs on that branch, and the baseline's `all 48 test files passed` cell is still correct against main. U6b must land the 48 to 50 step together with its re-measure, because `baseline-agrees-check.sh` compares the baseline's N against the `TESTS` length of the tree it runs in and will go STALE the moment gate-split's `test/run.mjs` is the one on disk.

## Scripts left behind

All under `/private/tmp/claude-501/-Users-kimba-Projects-nonoun-ultimate-tokens/b2e196e7-c1fa-4f1c-8d62-80e1dfd367c7/scratchpad/close/`:

- `qh.sh` - the quiet-host probe: load, cores, the pgrep of record split into this repo and others, and the port 9333 listener.
- `grun.sh` - first dispatch's guarded timed run. Waits for a sub-8 load sample, then starts at once, recording load before and after. Its weakness is that it does not check whether the busy processes belong to this repo, which is how runs 10 to 12 were contaminated.
- `grun2.sh` - `grun.sh` plus a quiet-repo wait and a port 9333 reading. This is the one that took runs 10b to 14.
- `grun3.sh` - `grun2.sh` at the tighter threshold, load under 5 plus a quiet repo plus a free port 9333, armed for 3 hours. **This is the guard U6b wants**, since it already implements the rule the owner just ruled.
- `after.sh` - the three after-checks against the committed tree: `baseline-agrees-check.sh`, `node test/repo/branding.mjs`, and the dash count with backtick spans stripped.
- `run.sh`, `wait.sh`, `wait10.sh`, and the `.out` / `.time` / `.holds` / `.result` files for every run above, including `t1.out` and `t1.time` for run 0 and `r15-smoke.holds` for the 120 held samples.

No throwaway clone was made in this unit, so none is left to remove.

## Notes for the Orchestrator

1. `grun3.sh` implements the newly ruled threshold already. U6b should use it rather than re-derive a guard, and should widen the repo-busy probe if it finds other worktree path shapes than `.worktrees/` and `.git-worktrees/`.
2. The sibling-worktree contamination is not specific to this unit. Any seat timing a gate on this host can be silently slowed by another worktree of this same repository running `npm test`, and the `pgrep` of record catches it only if the probe resolves the process path. That is worth a line in `.sdlc/adapter.md` §1 when U6b edits it.
3. The `TESTS` 48 versus 50 discrepancy in the stand-down brief is recorded above rather than copied. If U6b's brief repeats the claim that main is at 50, it should be corrected before the check script is run against it.
