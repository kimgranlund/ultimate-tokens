# Verdict U1 · 🟢

Plan `.sdlc/plans/records-followup.md` on `plan/records-followup` @ `cca4d0b8`. Head verified: `unit/rf-U1` @ `78f1c3e5fcda58073871145b396275484d7fc318`.
`BASE` = `$(git merge-base origin/main HEAD)` = `d34b4fb1beefff11c9be53ec039d4265c925da4a`. `UB` = `$(git merge-base plan/records-followup HEAD)` = `5bf48fa5d20bf3ad017b65db181be5162c3808f2`.
Rows run: U1-1 to U1-6 plus the plan-level rows the section applies per unit, P1, P4, P5, P6, P7. P2 and P3 are marked pre-land only in the plan and were not run here.
Every run in an own detached scratch worktree at `78f1c3e5`; every file-editing control in an own throwaway `git clone -q --shared` clone. Host load recorded per `npm test` run; no timing is a baseline figure.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U1-1 | F1: the number in debt K17 equals what the K17 listing finds in the tree | 🟢 | listing prints `7`; file prints `filters 7 files by name`. The row reads `the control filters 7 files by name (at 20298cc; the list is the exception cell of architecture K17, which is the copy to trust)` | base blob `d34b4fb1:.sdlc/debt.md` prints `filters 3 files by name` against the same `7`, the defect the row repairs |
| U1-2 | F2: the sha the map names for pass 5 is the sha pass 5's own header names | 🟢 | both lines print `` `d46ae48` `` | at `d34b4fb1` the two lines differ: `` `d814500` `` then `` `d46ae48` `` |
| U1-3 | F3: the adapter states what the control reproduces, and the verifier's own run agrees | 🟢 | `grep -c 'expect 17 FAIL'` = `0`; adapter says `printed 3 for this corruption`; my own corrupted-clone run printed `exit 1`, `grep -c FAIL` = `3`, `engine/semantic.mjs *FAIL` = `1`, `FAIL  refs-canonical` = `1`. The three FAIL lines verbatim: `▶ engine/semantic.mjs      FAIL`, `  FAIL  refs-canonical  — ordered key set != canonical`, `FAIL: 1 gate failure(s)`; tail `✗ 1/48 test file(s) failed`. Load 28.73 at start, 62.58 at end | the same clone uncorrupted is my P1 run in the unit worktree: `grep -c FAIL` = `0`, so the count is the corruption's and not noise. At `d34b4fb1` the adapter's first line is `1` and its second is empty |
| U1-4 | F6: the baseline credits the test file to the commit that added it | 🟢 | `(#699) (#702)`, then `0`, then `1` | at `d34b4fb1`: `1` then `0`, the reversed pair |
| U1-5 | F10: every sha the baseline cites is in `origin/main`'s history | 🟢 | `0` | base blob prints `1`, the line being `NOT b50a4b9b` |
| U1-6 | the unit changed five lines and nothing else, and the check script still agrees | 🟢 | run as corrected at `cca4d0b8`: `5`, `5`, `.sdlc/adapter.md,.sdlc/architecture.md,.sdlc/baseline.md,.sdlc/debt.md,.sdlc/handoffs/records-followup-U1.md`, `stale total: 0` | in the clone, a sixth reworded line plus a fifth file committed: `6`, `6`, and the list gains `.sdlc/questions/records-followup-approval.md`, so both halves of the row bite |
| P1 | `npm test` green with no `node_modules`, tree byte-stable | 🟢 | `exit 0`, `✓ all 48 test files passed`, `TESTS` length `48`, `git status --short \| wc -l` = `0`. Load 26.80 at start, 59.75 at end | the corrupted clone of U1-3: `exit 1`, `grep -c FAIL` = `3` |
| P4 | branding gate clean | 🟢 | `branding: clean (464 files scanned)`, `exit 0` | in the clone with `decision-records.md` copied to `.sdlc/verdicts/x.md`: `FAIL: 3 branding violation(s) across 465 files`. The planner measured 462 files at `d34b4fb1`; the scanned total grew with this plan's own files and the violation count is the same 3 |
| P5 | scope wall: nothing outside `.sdlc/` differs from `BASE`, the roadmap does not differ, `.claude/CLAUDE.md` untouched before U3 | 🟢 | `0`, `0`, and the third line prints nothing | in the clone: `echo "// probe" >> src/engine/motion.mjs` makes line one `1`; `echo >> .sdlc/roadmap.md` makes line two `1`; two edited `CLAUDE.md` lines make line three `2	2` |
| P6 | no em dash added in prose, by the measure U4 writes down | 🟢 | `0` over `git diff -U0 $BASE -- .sdlc` | fixture of two `+` lines: with the backtick strip `1`, without it `2`, and the backticked line alone `0`, so the strip is what makes the row discriminate |
| P7 | the baseline's test-file figure equals `TESTS.length`, checked by script | 🟢 | seven `ok` lines, `stale total: 0`, `exit 0`. First line `ok    tests: baseline 48, test/run.mjs TESTS 48` | the plants records-refresh measured: a baseline figure of 47 against 48 prints `STALE tests:` and exits 1. Not replanted here; the live script's seven `ok` lines and `stale total: 0` come from the unit head |

## Texts

All five edits match the plan's §Texts wording. One line changed per finding, four files, no other line moved: `.sdlc/debt.md` K17 row, `.sdlc/architecture.md` rerun note, `.sdlc/adapter.md` §1 second rule bullet, `.sdlc/baseline.md` intro sentence and prior-set paragraph. F6's sentence was kept grammatical as §Texts instructs, reading `They changed the toolchain the live table describes, so these are history to compare against, not a range to grade against`.

## Records

| Item | Note |
|---|---|
| Handoff `.sdlc/handoffs/records-followup-U1.md` | its Branch row reads `unit/rf-U1 @ (see commit below)` with no sha anywhere in the file. The known nit, reported here, not graded |
| The handoff's Criterion 6 caveat | the builder reports the removed-line count as `4, not 5` and attributes it to a `grep -c '^-[^-]'` pattern. That is not the command the plan carries at `cca4d0b8`, which drops the file headers with `grep -v '^--- '` and then counts `^-`. Run as written, the row prints `5` and `5`. The builder's caveat describes an earlier form of the command and needs no repair to the unit |
| Host load | 26.80 to 59.75 across the P1 run, 28.73 to 62.58 across the control run, on 10 cores. No wall time is recorded as a figure |
