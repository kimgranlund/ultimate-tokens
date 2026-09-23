# Verdict vb-U3 · 🟢

verdict: 🟢

| Field | Value |
|---|---|
| Unit | U3 of `.sdlc/plans/verdict-backfill.md` (#734), the list and pin retire, owner ruling Q1 retire |
| Head | `unit/bf-U3` @ `a4d52e87` (also `origin/unit/bf-U3`), parent plan tip `4fecc97d` |
| Base | `B=3e99fdca` (`git merge-base origin/main HEAD`; `origin/main` is `f9837f4d`) |
| Where | detached worktree `scratchpad/vb-u3-wt` at `a4d52e87`, plus a `--shared` clone and a `--depth 1` clone for plants; worktree removed by exact name (`git worktree remove` exit `0`) |
| Load | start `load averages: 3.58 4.26 4.79`, end `load averages: 6.87 4.94 4.93` |
| Counts | 🟢 24 · 🟡 0 · 🔴 0 |

## U3 rows

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U3-1 | list gone, script carries no list/pin/grandfather code outside its header | 🟢 | `test -e "$L"; echo $?` printed `1`; the seven-needle `grep -c` over non-comment lines printed `0` | the same grep on the U2 head's script (`4fecc97d`) prints `15`, and `git cat-file -e 4fecc97d:$L` exits `0` (list existed) |
| U3-2 | clean run prints the new summary, exits 0, no `grandfathered` word | 🟢 | `verdicts 84 graded 84 bad 0`, `exit 0`, then `0`; `ls .sdlc/verdicts/*.md \| wc -l` printed `84` (83 plus the U3 review record) | U3-3 plants below each flip it to `bad 1`; the U2-head script prints `grandfathered 1` in the same clone |
| U3-3a | `MISSING` bites on a new field-less file | 🟢 | `MISSING zz-control-U1.md: no verdict: line`, `verdicts 85 graded 85 bad 1`, `exit 1` | the clean tree without the plant prints `bad 0`, `exit 0` (U3-2) |
| U3-3b | `VALUE` bites on a prose value | 🟢 | `VALUE zz-control-U1.md: last verdict: pass is not 🟢, 🟡 or 🔴`, `bad 1`, `exit 1` | a legal token in the same file is graded clean (see R1b) |
| U3-3c | N1 attack: a backfilled file rewritten field-less reds | 🟢 | `survey.md` rewritten `# x / body`: `MISSING survey.md: no verdict: line`, `verdicts 84 graded 84 bad 1`, `exit 1` | the U2-head script with `survey.md` re-listed and the same rewrite printed `verdicts 84 graded 83 grandfathered 1 bad 0` (the hole N1 named) |
| U3-4 | runs in a shallow clone | 🟢 | `git clone --depth 1`: head `a4d52e8`, `rev-list --count` `1`, `verdicts 84 graded 84 bad 0`, `exit 0` | the U2-head script in that same clone: `PIN unreadable: cannot read commit f685529f (no git, no repo, or shallow clone)`, `exit 1` |
| U3-5 | adapter amendment additive and accurate | 🟢 | `--numstat` deletions `0`; §6 counts `1` (`#734`), `1` (`shallow clone`/`no git`), `1` (`diff-filter`) | the U2-head adapter §6 prints `0`, `0`, `0` on the three greps; an in-place reword of the #723 paragraph would make the deletions column non-zero |
| U3-6 | no em dash in the script | 🟢 | `perl` sweep printed `0` | one glyph appended to line 1 in the clone printed `1` |
| U3-7 | N1 to N6 answered in the handoff, N1 and N3 run | 🟢 | handoff `grep -c -E '^\| N[1-6] \|'` printed `6`; N3 run in clone: `git rm survey.md` gives `verdicts 83 graded 83 bad 0`, `exit 0`, then `--diff-filter=D` count `1`; handoff states the check does not catch deletion | a handoff claiming the check catches N3 would contradict the run's `bad 0`; the review's F3 (N2 row wrong) is closed at `a4d52e87` (`git diff 5d33bcfd a4d52e87 --stat` is `1 insertion(+), 1 deletion(-)` on the handoff only) |

## Conductor rulings and follow-ups

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| R1a | the LAST `verdict:` line is read: legal first, prose last reds | 🟢 | file with `verdict: 🟢` then `verdict: pass`: `VALUE zz-last.md: last verdict: pass ...`, `bad 1`, `exit 1` | the reversed order is green (R1b), so the red comes from position, not presence |
| R1b | prose first, legal last passes | 🟢 | `verdict: pass` then `verdict: 🔴`: `verdicts 85 graded 85 bad 0`, `exit 0` | R1a: swap the two lines and it reds; a first-match reader would red R1b and pass R1a |
| R2 | after retirement a new verdict with no line reds | 🟢 | `zz-n2.md` field-less: `MISSING zz-n2.md: no verdict: line`, `bad 1` (also U3-3a, `exit 1`) | the U2-head script with both pins moved to the planting commit and the name listed: `verdicts 85 graded 84 grandfathered 1 bad 0` |
| R3 | an old file with its line deleted reds | 🟢 | `sed '/^verdict:/d'` on `adopt-hygiene-U1.md` (`1 deletion(-)`): `MISSING adopt-hygiene-U1.md: no verdict: line`, `bad 1`, `exit 1` | the unedited file is graded clean in U3-2's `bad 0` |
| N1 | pinned name could carry field-less content | 🟢 closed by removal | U3-3c: `bad 1` on `survey.md` rewritten | U2-head script, same plant re-listed: `bad 0` |
| N2 | moving both pins together passed | 🟢 closed by removal | `grep -c 'PIN='` on the new script `0`; the N2 attack (commit a field-less file, move header pin and `PIN=` to that commit, list it) against the new script: `MISSING zz-n2.md`, `bad 1` | same attack against the U2-head script: `grandfathered 1 bad 0` |
| N3 | file deleted with its name passed | 🟢 closed by ruling, guard named | check prints `bad 0` on a deletion; `--diff-filter=D` scope command prints `1`; adapter sentence names `--diff-filter=DR` as the guard | P3's second command at the head prints `0`; any deleted verdict makes it non-zero |
| N4 | re-pin recipe missed the script constant | 🟢 closed by removal | new script `grep -c -e rerun -e 'PIN='` printed `0`; list file absent | U2-head list header `grep -c rerun` `1`, U2-head script `grep -c 'PIN='` `1` |
| N5 | adapter named the wrong pin authority | 🟢 closed by supersession | #734 amendment matches `PIN MISMATCH` and `is history from this date`; #723 paragraph unchanged (deletions `0`) | dropping the #734 paragraph returns U3-5's `#734` count to `0`, leaving the #723 text live |
| N6 | header grep could not go red | 🟢 closed by removal | `grep -rl 'grandfather.txt' .sdlc/checks/` count `0`; no `grep -c '#[0-9]'` in checks or adapter (`0`) | U2-head script `grep -c 'grandfather.txt'` printed `2` |

## Plan rows at the U3 head (U3-8)

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| P1 | `npm test` green, N by command, tree clean (regression guard: nothing on the test path changed) | 🟢 | `exit 0`, `✓ all 48 test files passed`, TESTS `48`, `git status --short \| wc -l` `0` | clone with `"scrim` to `"scrimX` in `role-table.json`: `exit 1`, `✗ 1/48 test file(s) failed` |
| P2 | branding clean, no added em dash | 🟢 | `branding: clean (576 files scanned)`, `0`, `0` | clone: `decision-records.md` copied into `.sdlc/verdicts/x.md` gave `FAIL: 3 branding violation(s) across 577 files`, `exit 1`; one added adapter line with the glyph made the raw count `1` |
| P3 | scope wall | 🟢 | `0`, `0`, `0`; U3's own diff `M adapter.md`, `M verdict-frontmatter-check.sh`, `D verdict-frontmatter-grandfather.txt`, `A` handoff, `A` U3 review | the plan's three-name fixture through the first filter printed `2` |
| P4 | check green, list gone (U3 form) | 🟢 | `verdicts 84 graded 84 bad 0`, `exit 0`, `test -e "$L"` `1` | U3-3 plants red it; the list present again would print `0` on the second command |
| P5 | backfilled files changed by their line only | 🟢 | `added 53 deleted 3 files 47`: `42` at `1 0`, `2` at `2 0`, `1` at `1 1` (`records-followup-U8.md`), `2` at `3 1` (`U13-review`, `U14-review`) | any other per-file figure, or a total other than `53`/`3`/`47`, reds the row |
| P6 | the last line carries a legal token | 🟢 | the 47 last tokens under `LC_ALL=C`: `39 🟢`, `5 🟡`, `3 🔴` (a default-locale `uniq -c` collapses the emoji into one bucket, so the C locale is required to read this) | a prose last value reds `VALUE` (U3-3b) |
| P7 | every `.sdlc/checks/*.sh` exits as at `$B` | 🟢 | head and `$B` (temp worktree at `3e99fdca`, removed) both print five lines, all `exit 0` | clone: `56 to 60 s` changed to `56 to 61 s` in the adapter made `baseline-agrees-check.sh` print `exit 1` |
| U1-1 | 31 title-token files still match | 🟢 | the plan's loop with the 16 U2 names read from the plan table printed `31 ok`, no `MISMATCH` | clone: `2s/🟢/🟡/` on `adopt-hygiene-U1.md` gives `title=🟢 line=🟡`, a `MISMATCH` |
| U2-1 | 16 derived tokens still equal the plan table (mechanical recheck; the reading stands from the U2 verdict) | 🟢 | the plan's Token column against each file's last token: `16 ok`, no `DIFF` | changing any one file's last token prints a `DIFF` line for it |
| G1 | no record on `plan/preset-intent-fidelity` touched | 🟢 | branch tip `65b3bf27` (the plan's read-only input, reflog top unchanged); none of the six U3 commits is on it (`0` each); `git diff --name-only 4fecc97d a4d52e87 \| grep -c pif-` `0` | a U3 commit reachable from that branch, or a `pif-*` path in the diff, reds this row |

## Notes

| Item | Detail |
|---|---|
| Scratch | `vb-u3-clone` and `vb-u3-shallow` under the scratchpad could not be removed (the `rm -rf` call was denied); both were reset to `a4d52e87` and hold no plants |
| Figure drift | `verdicts 84` against the handoff's `83` is the U3 review record, added after the handoff's run |
