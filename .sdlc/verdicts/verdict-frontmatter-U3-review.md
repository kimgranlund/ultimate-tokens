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

## Round 2 · head `9abce0c1` · PASS

Diff read: `git diff da94e6aa..9abce0c1` (check script, adapter amendment, handoff). The check now grades each listed name's blob at the pin with the same `gradeText` rule and reds `GROWN` unless it failed there; it compares the list header's `at <sha>` to `PIN` (`PIN MISMATCH`); the unreadable-pin message names its causes. Every row rerun in `git clone -q --shared` copies; controls in separate clones at the named shas.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U3-1 | clean run passes | 🟢 | `verdicts 77 graded 30 grandfathered 47 bad 0` `exit 0` | U3-2 plant, same head: `bad 1` `exit 1` |
| U3-2 | grown name reds | 🟢 | `GROWN zz-grown-U1.md: not grandfathered at f685529f` `bad 1` `exit 1` | same plant at `fbb19aec`: `verdicts 74 graded 26 grandfathered 48 bad 0` `exit 0` |
| U3-3 | unreadable pin fails loud | 🟢 | `PIN unreadable: cannot read commit 0000000f (no git, no repo, or shallow clone)` `exit 1`, no summary | unmodified script: `bad 0` `exit 0`; PATH without git also prints the line, `exit 1` |
| U3-4 | adapter wording | 🟢 | `0`, `1`; the new sentence limits the rewrite claim to a pinned file that "already carried a valid `verdict:` line", which N1 below confirms is exactly what is enforced | `fbb19aec` adapter: `1`, `0` |
| U3-5 | earlier rows hold | 🟡 | U1-0 `0`; U1-2 A `MISSING zz-c.md`, D `VALUE zz-c.md: last verdict: pass`, D2 `bad 0`, E `STALE survey.md`; U1-3 `29d0eff2c1bccbc1`; U1-5 `0` against merge base `68de4634`; U1-9 `CLEARED survey.md`; U1-1 empty-list run prints `bad 48`, not the row's `bad 47` (R1) | U1-5 against the stale base `563ee464` prints `1` (`small-fixes-U1.md`, from the main merge, not this unit); U1-1 clean run `bad 0` |
| U3-6 | pinned field-bearing name cannot exempt a rewrite | 🟢 | `records-tidy-prepr.md` overwritten field-less and listed: `GROWN records-tidy-prepr.md: not grandfathered at f685529f` `bad 1` `exit 1` | same plant at `bc868dd3`: `verdicts 75 graded 27 grandfathered 48 bad 0` `exit 0` |
| U3-7 | header pin and script pin agree | 🟢 | header sed to `deadbeef`: `PIN MISMATCH: header names deadbeef, script pin is f685529f` `exit 1` | unmodified clone: `bad 0` `exit 0` |
| U1-4 | `^[A-Z]+ # x` and `GROWN zz-absent.md` (revision 10) | 🟢 | `0`, `1` | reader that does not skip `#`: first figure `1`; list path the sed misses: `0`, `0` |
| G1 | `npm test` in the clone | 🟢 | `✓ all 48 test files passed`, `git status --short` `0` | not a discriminator; the check's reds are the rows above |
| G2 | em dash | 🟢 | added lines `bc868dd3..9abce0c1` outside backticks `0`; script `0` | U1-8's planted glyph in round 1: `1` |

### Round 2 attacks

| # | Probe | State | Evidence | Negative control |
|---|---|---|---|---|
| N1 | a pinned-failing name (`survey.md`) overwritten with different field-less content | 🟡 | `bad 0` `exit 0`: a new record written over a grandfathered file passes; the adapter does not claim this closed | the same file given a valid field reds `CLEARED survey.md` (U1-9), so the file is read |
| N2 | header pin and script `PIN=` both moved to a later sha where the new record is committed field-less, name listed | 🟡 | `verdicts 78 graded 30 grandfathered 48 bad 0` `exit 0`; this edits the check itself, so only review of `verdict-frontmatter-check.sh` catches it | header moved alone reds `PIN MISMATCH` (U3-7) |
| N3 | a second `#` line naming another pin | 🟢 | `bad 0` `exit 0`: only the first `#` line is read, so a later line cannot move the pin | first line edited: `PIN MISMATCH` `exit 1` |
| N4 | header pin as the full 40-char sha of the same commit | 🟢 | `bad 1` `exit 1`: the comparison is literal, strict in the safe direction | the 8-char form: `bad 0` |
| N5 | name repeated with CR and a blank line | 🟢 | `exit 0`, no new name: `.trim()` and the `Set` collapse it | a new name the same way reds `GROWN` (round 1 handoff probe, U3-2 here) |
| N6 | a pin-`VALUE` name (`records-followup-U8.md`) overwritten field-less | 🟡 | `bad 0` `exit 0`, same class as N1 | the file is read: a valid field there would red `CLEARED` |

### Findings, round 2

| Sev | Id | Finding | Fix |
|---|---|---|---|
| 🟡 | N1/N6 | A grandfathered file's content can be replaced by a new field-less record and stays exempt. Sibling of the delete-with-name case already on #734; not claimed closed by the adapter | Name it on #734, or red a listed file whose blob id differs from the pin's unless it carries the field (`git hash-object` against `git rev-parse ${pin}:<path>`) |
| 🟡 | N2 | Moving both pins together passes; inherent to an in-repo check, so the guard is review of any diff to the check script | Note in the adapter that a `PIN=` change is a re-pin (P4) and needs its own revision row |
| 🟡 | R1 | U1-1's empty-list control now prints `bad 48`: an empty list has no header, so `PIN MISMATCH: header names no pin` adds one. Still `exit 1`, still bites, but the row's text says `bad 47` | Same class as U1-4's revision 9: a plan revision moves U1-1's second figure, or ruling A covers it |

verdict: 🟢
