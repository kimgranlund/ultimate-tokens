# Verdict U1 · 🟢

Plan `records-refresh` (ticket #691), unit U1, graded at `f31653d` on a detached scratch worktree of my own
(`scratchpad/verify-rr-u1`), never in `.worktrees/survey-refresh`. Every row below is my own run, not the
builder's. All twelve criteria pass. One 🟡 row: the baseline's `host:` load figures belong to the superseded
first run set, not the clean third set whose timings the table carries. One line, fix before the PR.

## My own gate run (P1 timing)

| fact | value |
|---|---|
| load at start (1 · 5 · 15 min, 10 cores) | 4.62 · 6.24 · 6.27 |
| `npm test` wall | 60.16 s |
| recorded range | 59 to 66 s |
| in range | yes |
| last line | `✓ all 47 test files passed` |
| `git status --short` after | 0 lines |

A first attempt ran at 128.13 s, green, with two other suites live in other worktrees
(`.git-worktrees/672-citation-predicate`, `/private/tmp/pr703-review-critic`) and load climbing 7.06 to 9.81.
Contention, not regression: same green last line, and the isolated rerun landed at 60 s. Reported because the
number exists, not dropped.

## Criteria

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 1 | baseline numbers agree with the tree, adapter ranges agree with the baseline | 🟢 | `sh .sdlc/checks/baseline-agrees-check.sh`: seven `ok` lines, `stale total: 0`, exit 0. tests 47 = TESTS 47; `ui.html` 3777.8 KB both sides; test 59 to 66, build 2 to 3, smoke 20 to 20; ref `d814500` tree-equal outside `.sdlc/` and in `origin/main` | all four assertions bite, in a throwaway clone: baseline tests to 44 → `STALE tests: baseline 44, TESTS 47`; size to 3695.6 → `STALE ui.html`; one timing to 99.9 → `STALE time test: baseline 64 to 100 s, adapter 59 to 66 s`; a probe commit on `src/engine/semantic.js` → `STALE head`, exit 1 |
| 2 | the script is the plan's own text | 🟢 | `diff` against the plan's one `sh` fence prints nothing, `same` | one character changed (`let stale = 0` to `1`) → 4-line hunk, `same` absent. Script removed → `diff` exits 2 |
| 3 | full rerun, three runs of three commands, no old figure left | 🟢 | `3` rows matching `3/3 \| 0`, then `0` matches of `7faf3aa\|34804556354\|3695.6`. Also `0` matches of any superseded timing (89.82, 101.61, 82.02, 108.96, 93.81, 90.72) | one row set to `2/3` → count drops to `2`; `3695.6` appended → second grep prints `1` |
| 4 | the cited CI run is green on the `main` commit the branch sits on | 🟢 | merge base `d814500`, baseline `ref` `d814500`, `gh run view 35446265780` → `d814500 panda-smoke=success build-test=success`. Job order is reversed from the plan's worked example; both names present and green, so the criterion holds | `ref` repointed at `origin/main~2` → `d814500` vs `5456fca`, the two lines disagree. The jobs query can report red: run 34660177977 prints `464507f build-test=failure panda-smoke=success`. A bogus run id makes the query error rather than pass |
| 5 | no live record outside the baseline carries a test count | 🟢 | the sweep prints one line, `.sdlc/baseline.md` | `The suite runs 47 test files.` appended to `adapter.md` → two lines, `.sdlc/adapter.md` and `.sdlc/baseline.md` |
| 6 | adapter edits confined to the §1 gate table, no literal N, both amendments placed | 🟢 | `0`, `0`, `1`, `1` | a reworded `## 4.` heading → first value `1`; the §3 amendment deleted → fourth value `0` |
| 7 | C11's scope is stated where byte-stability is claimed, and is true | 🟢 | `1`, `1`, `false false true`. The claim holds against `package.json`: neither the `test` nor the `build` script chain contains `gen:type-fonts`, `gen:categories` is in both, `src/ui/type-fonts.js` is tracked, and adapter row `fonts` is its separate gate, exactly as the sentence says | `gen:type-fonts` stripped from the adapter test row → `0`. `gen:type-fonts` prepended to the `test` script → `true false true`, so both records would become false and the predicate notices |
| 8 | both local-only rules come from the repo's `.gitignore`, neither file tracked | 🟢 | `git check-ignore -v` resolves both to `.gitignore:21` and `.gitignore:22` in a fresh clone whose `info/exclude` is empty; `git ls-files` prints `0`. Both paths are real files on disk in the live repo (`.claude/settings.local.json`, 4949 bytes; `.sdlc/launcher.env`, 12 bytes), so the rules exclude something that exists | rules deleted from `.gitignore`: `.claude/settings.local.json` falls back to one machine's `/Users/kimba/.config/git/ignore`, and `.sdlc/launcher.env` is not ignored at all, which is the fresh-clone hole the rules close. `git check-ignore -v README.md` exits 1 and force-adding `launcher.env` makes `git ls-files` print `1`, so neither command matches everything |
| 9 | each not-re-derived record opens with one dated staleness note, quoted faithfully, with the re-check rule, and nothing else changed except debt row P3 | 🟢 | four `1`s, then `1`, `1`, `1`, `ancestor 1`, `10`, `0`, `0`. Both notes point at real drift: `f9e20c5` is not an ancestor of `origin/main`, `180eca0` is, the ten files between them are all under `src/`, `test/`, `figma/` as the note says, and the verdict's C15 cell does read "18 of the 72 paths cited by `architecture.md` and 16 of the 96 cited by `debt.md`", assigned to the right file in each note | note deleted from `architecture.md` → note count and rule count both `0`; `18 of the 72` altered → quote count `0`; a non-P3 debt row touched → last value `1`; `git merge-base --is-ancestor 180eca0 origin/main` prints `ancestor 0`, so the ancestry test can say yes. The rule's own command discriminates: `git diff --stat f9e20c5 HEAD -- src/engine/tonal.js` prints `121 insertions(+), 23 deletions(-)`, the same on `src/engine/hct.js` prints nothing |
| P1 | `npm test` green with no `node_modules`, tree byte-stable | 🟢 | `✓ all 47 test files passed`, exit 0, `git status --short` 0 lines, no `node_modules` in the worktree at start. 60.16 s, in range | in the clone: `"scrim` to `"scrimX` in `role-table.json` → 3 `FAIL` lines, `▶ engine/semantic.mjs      FAIL`, `FAIL  refs-canonical  — ordered key set != canonical` `altered: two leading spaces dropped`, `✗ 1/47 test file(s) failed` |
| P4 | branding gate clean | 🟢 | `branding: clean (448 files scanned)`, unpiped exit 0. The handoff's 448 is correct at this head | run by me, not by the builder: `cp docs/reference/references/decision-records.md docs/x.md` in the clone → `✗ docs/x.md: names the pre-rename identifier outside the back-compat allowlist`, `FAIL: 3 branding violation(s) across 449 files`, unpiped exit 1; file removed → exit 0. Note the plan's own P4 command pipes to `tail -1`, so its `echo "exit $?"` reads `tail`, not the gate, and printed 0 on a red run. The gate itself is fine; the recorded command's exit check is not |
| P5 | scope wall: nothing outside `.sdlc/` and `.gitignore` differs from the merge base | 🟢 | `0` | `echo "// probe" >> src/engine/semantic.js` in the clone → `1` |

## 🟡 One finding

The baseline's front matter reads `host: ... load 8.91 6.03 5.77 on 10 cores at run start`. Those are the
loads of run set 1, which the conductor ruled contaminated and superseded. The Pass table's timings are set 3's
(63.54 · 65.90 · 59.17), taken at loads 3.13, 6.16, 6.24 per the handoff. So the record states one set's load
beside another set's seconds, which is the copied-number pathology this plan exists to remove: a reader
concludes 59 to 66 s was measured at load 8.91, and it was not. The plan's §Texts says "the load figures from
step 1", which is literally satisfiable either way, so no criterion catches it. Fix is one line: state set 3's
loads, or say which set each figure belongs to. Recommended before the PR, not a blocker for U1.

## Housekeeping

| Check | State | Evidence |
|---|---|---|
| `test/repo/branding.mjs` | 🟢 | `clean (448 files scanned)`, exit 0 |
| em dash in files this unit authored | 🟢 | added lines in all six changed files plus the handoff: 0 matches each |
| tree clean after `npm test` | 🟢 | `git status --short \| wc -l` = 0 |
| scratch worktree removed | 🟢 | removed after grading |

## Missed rows (added 2026-09-19, conductor ruling, no re-verify)

- `.sdlc/baseline.md:6` `host:` says Node 22, but U1's runs were on Node 24.18.0. The verdict graded the load figures on that line and not the Node version. Corrected in U2's fold on `unit/rr-U2`.
- `.sdlc/adapter.md` gate table, test and corpus-contrast rows, name "Node 22" as the prerequisite. True for CI at U1's head, false once #706 moves CI to Node 24. Changed inside #706's own PR, the change that invalidates them.

Correction (2026-09-19, plan records-followup U4, #709): a quotation of program output in this file had been reworded to avoid an em dash. It now reads as the program prints it. Rule: `.sdlc/adapter.md` §3, Verbatim-quote rule.
