# Review verdict-frontmatter U3 · pass 1 · reviewer-l2 · FIX-FIRST

Head `bc868dd3` on `unit/vf-U3`, base `plan/verdict-frontmatter` `563ee464`. Every row rerun in `git clone -q --shared` copies of the head (controls in separate clones at the named shas). The worktree was not written except for this file.

## U3 rows

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U3-1 | clean run passes | 🟢 | `verdicts 75 graded 28 grandfathered 47 bad 0` `exit 0` | U3-2's plant on the same head: `bad 1` `exit 1` |
| U3-2 | grown name reds | 🟢 | `GROWN zz-grown-U1.md: not grandfathered at f685529f` `verdicts 76 graded 28 grandfathered 48 bad 1` `exit 1` | same plant at `fbb19aec`: no `GROWN`, `verdicts 74 graded 26 grandfathered 48 bad 0` `exit 0` (critic's control e reproduced) |
| U3-3 | unreadable pin fails loud | 🟢 | pin sed to `0000000f`: `PIN unreadable: 0000000f is not a commit in this repository` `exit 1`, no summary line | unmodified script, same clone: `bad 0` `exit 0` |
| U3-4 | adapter states what the check enforces | 🟡 | `0`, `1` as the row asks; but see F1: the new sentence `a new record cannot be exempted by appending its name after the fact` is false as measured | `fbb19aec` adapter: `1`, `0` |
| U3-5 | earlier rows hold | 🟡 | rows below measure as expected (U1-1 `grandfathered 47 bad 0` `exit 0`, U1-3 `29d0eff2c1bccbc1...`, U2-1 `47`); U1-4's first needle is now vacuous (F2) | per row below |

## U3-5 rerun (U1, U2)

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U1-0 | pin is an ancestor | 🟢 | `git merge-base --is-ancestor f685529f HEAD` prints `0` | same command at `3b1d48b0`: `1` |
| U1-1 | clean exit 0, empty list exit 1 (ruling A) | 🟢 | `grandfathered 47 bad 0` `exit 0`, totals at the instant `verdicts 75 graded 28`; empty list `verdicts 75 graded 75 grandfathered 0 bad 47` `exit 1` | the empty-list run is control F |
| U1-2 | defect classes | 🟢 | A `MISSING zz-control-U1.md: no verdict: line`; C and D `VALUE zz-control-U1.md: last verdict: pass is not 🟢, 🟡 or 🔴`; D2 `bad 0` `exit 0`; E `STALE survey.md: grandfathered but absent` `exit 1` | B (well-formed) `verdicts 76 graded 29 grandfathered 47 bad 0` `exit 0` |
| U1-3 | list hash, header, pin | 🟢 | `29d0eff2c1bccbc1b0dc033a9aba84ca99338869d5c4ef39658be557fc62e3c7`, `#`, `1` | `survey.md` dropped: `115853c498f3de20...` |
| U1-4 | `#` skipped, absent name is `GROWN`, graded on the row text at main `db010e70` (revision 9, answer B) | 🟡 | `grep -c 'STALE # x'` `0`, `grep -c 'GROWN zz-absent.md'` `1`, as the text expects | list path the sed misses: `0` `0`, so the second figure bites; the row's first control does not hold: a reader that does NOT skip `#` prints `GROWN # x: not grandfathered at f685529f`, so `grep -c 'STALE # x'` still reads `0`, not the `1` the row claims (F2) |
| U1-5 | no existing verdict modified | 🟢 | `--diff-filter=MD 563ee464 -- .sdlc/verdicts` `0`, added `0` | field planted on `survey.md`: `1` |
| U1-6 | adapter names mandate, rule, check | 🟢 | `2`, `1`, `1` | `origin/main` `36f463de` adapter: `0`, `0`, `0` |
| U1-7 | adapter edit additive vs `origin/main` | 🟢 | `git diff --numstat origin/main bc868dd3 -- .sdlc/adapter.md` `3 0` | same numstat vs `563ee464` (this unit's in-place reword) prints `1 1`: an in-place change counts |
| U1-8 | no em dash in script | 🟢 | `perl ... \x{2014}` `0` | one glyph prepended: `1` |
| U1-9 | CLEARED until name leaves | 🟢 | `CLEARED survey.md: grandfathered but carries the field` `verdicts 75 graded 28 grandfathered 47 bad 1` `exit 1`; name dropped: `bad 0` `exit 0` | same plant at `8742b0ee`: no `CLEARED`, `bad 0` `exit 0` |
| U2-1 | ticket #734 labels and 47 names | 🟢 | `Backfill verdict: front matter on the 47 grandfathered verdict records (#723 follow-up) P3,kind:chore,lane:docs,size:M,status:backlog`, `47` | body with `survey.md` lines removed: `46` |
| U2-2 | header names ticket, hash unchanged | 🟢 | `1`, `29d0eff2c1bccbc1` | `survey.md` renamed: `84891696f47b0e2c` |

## Gates

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| G1 | `npm test` in a clone of the head | 🟢 | `✓ all 48 test files passed`, no tracked file changed | not a discriminator: nothing U3 touches is on the test path; the check's own reds are U3-2, U3-3 |
| G2 | branding, em dash in the unit diff | 🟢 | `branding: clean (558 files scanned)`; added-line em dash sweep `0` | one planted glyph in the U1-8 run: `1` |

## Beyond the rows

| # | Probe | State | Evidence | Negative control |
|---|---|---|---|---|
| F1 | a name present at the pin but field-bearing there (21 such: `comm -23` at-pin minus list, `LC_ALL=C`). Overwrite `records-tidy-prepr.md` with a new field-less record, append its name | 🔴 | `verdicts 75 graded 27 grandfathered 48 bad 0`, exit 0: the list grew by one and a new record is exempt | same overwrite without the list line: `MISSING records-tidy-prepr.md: no verdict: line` `exit 1` |
| F2 | U1-4 first needle after U3 | 🟡 | non-skipping reader prints `GROWN # x`, so `STALE # x` counts `0` either way; revision 9 moved only the second needle | a skipping reader also prints `0`: the figure no longer tells them apart |
| F3 | header pin vs script pin | 🟡 | nothing compares them: header sed to `deadbeef` still `bad 0` `exit 0`; script holds the value once (`PIN=f685529f`, line 14) | header and script agree today: both print `f685529f` |
| F4 | path variants of a new field-less `zz-new.md`: `./`, case (`ZZ-NEW.md`, `core.ignorecase true`), `../verdicts/`, trailing `/`, leading space, symlink to `survey.md` | 🟢 | each prints `GROWN` and the record stays graded (`MISSING zz-new.md` or `bad 1`); `git cat-file` tree lookup is case sensitive: `SURVEY.md` exits `128` | exemption needs an exact basename match in `nameSet`, shown by the plain-name plant in U3-2 |
| F5 | fails loud without history or git | 🟢 | `--depth 1` clone (`is-shallow true`), PATH without git, and a `git archive` tree each print `PIN unreadable: f685529f ...` `exit 1` | full clone: `bad 0` `exit 0` |
| F6 | message wording when git is missing | 🟡 | `f685529f is not a commit in this repository` is printed when the real cause is no git or no repo; loud, but misleading | with git present and pin valid, no such line |

## Findings

| Sev | Id | Finding | Fix |
|---|---|---|---|
| 🔴 | F1 | The critic's attack rephrases: reuse any of the 21 names that existed at the pin with the field. The adapter's new sentence ("a new record cannot be exempted by appending its name after the fact") and U3's title ("the list cannot grow") are both false as measured | In `existsAtPin`, read the pinned blob (`git show ${pin}:.sdlc/verdicts/<name>`) and require `gradeOne` on it to fail, so the list must be a subset of the failing set at the pin (its own derivation). Add a row with the F1 plant and control. Otherwise narrow the adapter wording to "a name absent from the pin" and put the residual on #734 |
| 🟡 | F2 | U1-4's first needle is vacuous since U3 | Change it to `grep -c '# x'` (any prefix), with the non-skipping reader as control |
| 🟡 | F3 | Plan says header and script pins "must agree"; nothing checks it | Have the check grep the list header for `${PIN}` and red if absent, or strike "must agree" from the plan |
| 🟡 | F6 | Pin failure message blames the pin when git or the repo is missing | Say `PIN unreadable: cannot read commit ${PIN} (no git, no repo, or shallow clone)` |

verdict: 🔴
