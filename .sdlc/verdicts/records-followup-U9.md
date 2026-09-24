---
kind: verdict
plan: records-followup
unit: U9
branch: unit/rf-U9
sha: 24c99e580812ecbf41bd19d5a20fd74b1e686a15
verdict: 🟢
written: 2026-09-20
seat: independent verifier
---

# Verdict U9 records-followup · merge of `origin/main` `3ce50daa` into the plan branch

Every row below is this verifier's own run in a detached scratch worktree at
`/tmp/rf-u9-verify/head`, checked out at `24c99e58`. The builder handoff and the
reviewer record were read as claims under test, never as evidence. Negative controls
that edit a file ran in a throwaway shared clone at `/tmp/rf-u9-verify/neg`, removed
after. Host load from `uptime`: `19.05 17.18 15.57` before the `npm test` leg and
`275.73 158.44 76.88` after, on a host running other agents, so no timing in this
record is offered as a measurement.

Verdict: 🟢. 14 of 14 rows green, 0 🔴. Two 🟡 observations are recorded below the
table; neither blocks the unit, and one is the U4-1 finding the brief asked for.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 1 | `origin/main` is an ancestor of the head | 🟢 | `git merge-base --is-ancestor origin/main HEAD` exit `0`. First parents walk back through `6a04e8ba` (plan tip `2c622ad2`) and `6ccfcf4e` (`origin/main` `3ce50daa`), so the merge is real and no commit was rewritten | the reverse direction discriminates: `git merge-base --is-ancestor HEAD origin/main` exit `1` |
| 2 | no conflict markers under `.sdlc` | 🟢 | `git grep -c '^<<<<<<<\|^>>>>>>>' -- .sdlc` printed nothing, exit `1`. `git grep -n '^=======$' -- .sdlc` also printed nothing | markers appended to `.sdlc/debt.md` in the clone: the same grep printed `.sdlc/debt.md:2`, exit `0` |
| 3 | nothing `origin/main` landed is lost | 🟢 | own reading, stronger than the plan's literal command: of the 20 files `git diff --name-only 41b2877e~1 3ce50daa` names, only 5 differ from `origin/main` at the head, and those 5 are exactly the conflicted records this plan owns and edits. The other 15, including every `k17-rerun` and `records-tidy` handoff, plan, question and verdict, are byte-identical to main. Same result over the wider range `d34b4fb1..3ce50daa`. `git diff origin/main HEAD --diff-filter=D --name-only` prints `0` lines | the per-file loop is not vacuous: it printed `DIFFERS` for `.sdlc/adapter.md`, `.sdlc/architecture.md`, `.sdlc/board.md`, `.sdlc/debt.md` and `.sdlc/verdicts/architecture.md`, and stayed silent on the rest |
| 4 | hunk 1, `.sdlc/debt.md` K17, states a fact true at the merged head | 🟢 | own rerun of the map's K17 control at the head: `git ls-files test` filtered against `test/run.mjs` prints `7` unlisted files (`gate-report.mjs`, the three `repo/fixtures/gate-report-*.mjs`, `run.mjs`, `smoke/smoke.mjs`, `ui/counts.mjs`), and `0` after the cell's seven-name filter. `grep -o 'filters [0-9]* files by name'` reads `filters 7 files by name`. `git diff --name-only origin/main -- test` and `git log --oneline 20298cc..3ce50daa -- test` both print `0` lines, so `test/` is byte-identical to `3ce50daa` and unchanged since `20298cc` | at `d34b4fb1` the same grep reads `filters 3 files by name` against the same tree-side `7`, which is the defect U1 repaired |
| 5 | hunk 2, `.sdlc/architecture.md` rerun note, names the sha pass 5's own header names | 🟢 | `grep -o 'pass 5 stays graded at .[0-9a-f]*.'` reads `` `d46ae48` `` and the second cite `pass 5 at` reads `` `d46ae48` ``. Pass 5's own header in `.sdlc/verdicts/architecture.md` reads `Graded 2026-09-19 at `d46ae48``, and main's own pass 6 Result line at `:80` reads `K1 to K16 and K18 read from pass 5 at `d46ae48``. The parenthetical checks out too: `git cat-file -t d46ae48` prints `commit`, `git merge-base --is-ancestor d46ae48 origin/main` exits `1`, and `git merge-base d46ae48 origin/main` prints `20298cca9a152e8ff6041c78573293f48628c10f` | `git show origin/main:.sdlc/architecture.md` reads `pass 5 stays graded at `d814500`` against the same `` `d46ae48` `` header, so main's own note was the wrong side and the merge corrects it. The merge is right; main was wrong |
| 6 | hunk 3, `.sdlc/adapter.md` §2.1 grade line, keeps the landed bytes and appears once | 🟢 | own `cmp -l` of the two sides: `746` bytes each, differing in exactly two, offsets `22` and `23`, which spell `20` against `19`. `git log origin/main -S'Item 1 said `reviewer-l3` until this date'` names `aa197cbe 2026-09-20`, so main's date is the date it landed. `grep -c 'Item 1 said `reviewer-l3` until this date' .sdlc/adapter.md` prints `1` at the head | the plan-side bytes at `2c622ad2` carry `Amendment (2026-09-19)`; had both survived, the count would read `2` |
| 7 | hunk 4, `.sdlc/verdicts/architecture.md`, keeps both appends | 🟢 | `git diff origin/main HEAD -- .sdlc/verdicts/architecture.md` is `+2` lines and `-0`: this branch's dated note of `2026-09-19` closing pass 5's observation, then main's `## Pass 6` of `2026-09-20`, in date order with one blank line between. Nothing reworded, nothing deleted | the diff form is the control: a picked side would show `-` lines against one parent. There are none against either |
| 8 | hunk 5, `.sdlc/board.md`, is the union | 🟢 | `grep -c '^| '` reads `26` rows under one header. The two rows main landed, `k17-rerun U1` (#710) and `records-tidy U1` (#712), sit above this plan's `9` rows, and `git diff origin/main HEAD -- .sdlc/board.md` is `+9` and `-0`, so no landed row's text was edited. Line 3's preamble already names all four landed plans | the same diff against the plan parent would show main's two rows as additions; against main it shows this plan's nine, so neither side was dropped |
| 9 | P1: `npm test` green, `TESTS` agrees, tree clean, no `node_modules` | 🟢 | own single run in the scratch worktree: last line `✓ all 48 test files passed`, `exit 0`. `TESTS` length by the plan's perl one-liner prints `48`. `git status --short` after prints `0` lines. `node_modules` absent before and after | in the clone, `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json` then the one owning gate file: `node test/engine/semantic.mjs` exits `1` with `2` FAIL lines including `FAIL  refs-canonical`; the same file on the clean clone exits `0` with `0` FAIL lines. Run as the single gate rather than the whole runner so the suite ran once, per the brief |
| 10 | P2 and P3 | ⚪ | pre-land only by the plan's own text. P2 needs `npm ci`, which would put `node_modules` in this worktree and falsify P1's own condition; P3 needs real headless Chrome | not run, so no control is claimed |
| 11 | P4: branding gate clean | 🟢 | `node test/repo/branding.mjs \| tail -1` reads `branding: clean (500 files scanned)`, `exit 0` under `set -o pipefail`. No record under `.sdlc/` carries the retired maker name | in the clone, `cp docs/reference/references/decision-records.md .sdlc/verdicts/x.md` then the gate: `FAIL: 3 branding violation(s) across 501 files` |
| 12 | P5: scope wall | 🟢 | `0`, `0`, `1	1`: nothing outside `.sdlc/` differs from `3ce50daa` except the one approved `.claude/CLAUDE.md` line, and `.sdlc/roadmap.md` does not differ | in the clone, `echo "// probe" >> src/engine/type.mjs` makes the first number `1` |
| 13 | P6: no em dash added in prose, against both merge parents | 🟢 | the plan's own measure, `git diff -U0 <parent> -- .sdlc \| grep '^+' \| perl -pe 's/\x60[^\x60]*\x60//g' \| LC_ALL=C grep -o "$EM" \| wc -l`, prints `0` against `3ce50daa`, `0` against the plan parent `2c622ad2`, and `0` against `c130dd13`. Counted as occurrences with `grep -o`, and with `perl` for the strip since this host has no `grep -P` | own fixture of three `+` lines, one prose dash, one inside a backtick span, one line with two prose dashes: the stripped count prints `3` and the raw count `4`, so both the strip and the occurrence counting bite |
| 14 | P7: `baseline-agrees-check.sh` exit 0, `stale total: 0` | 🟢 | own run: nine lines, seven counted `ok` (including `ok    tests: baseline 48, test/run.mjs TESTS 48` and `ok    ui.html: baseline 3780.5 KB, tree 3780.5 KB`), one `note  head:` that states the tree moved, one `ok    head:` for the ref being in main's history; `stale total: 0`; `exit 0`. Main moved no measured figure out from under the baseline | in the clone, the live `npm test` row's figure edited to `all 47 test files passed`: `STALE tests: baseline 47, test/run.mjs TESTS 48`, `stale total: 1`, `exit 1` |
| 15 | U1-1 (F1) re-measured against main's text | 🟢 | `7` from the tree, `filters 7 files by name` from `.sdlc/debt.md` | at `d34b4fb1`: `filters 3 files by name` against the same `7` |
| 16 | U1-2 (F2) re-measured against main's text | 🟢 | `` `d46ae48` `` from the note, `` `d46ae48` `` from pass 5's header | at `origin/main`: `` `d814500` `` against `` `d46ae48` ``, the two lines differ |
| 17 | the carried U3 clause is true as written | 🟢 | `git show ceb471b0:.sdlc/checks/baseline-agrees-check.sh` line 32 builds both head lines from one sentence, switching only the `ok    ` or `note  ` prefix, so on a moved tree it printed exactly the quoted `note  head: baseline ref 20298cc has the same tree as HEAD outside .sdlc/ and .gitignore`. Line 32 at the head selects a whole sentence per branch instead. The appended clause on `.sdlc/handoffs/records-followup-U3.md:98` says that and nothing more | the two versions of line 32 differ in shape, not only in wording, which is what makes the quote unrestatable in U8's new text; had the old line also branched per sentence, the clause would be false |

## The open note: U4-1 at the merged head

Run at `24c99e58`, the row's three lines print:

- `.sdlc/adapter.md,.sdlc/verdicts/records-followup-U3.md`
- `1`
- `1`

So U4-1 prints two paths, not the one its Expected cell states. The second is
`.sdlc/verdicts/records-followup-U3.md:14`, the U3-10 evidence cell, whose own last
clause reads `so U4-1 still counts one`. That clause is false, and it is false because
of itself: the cell quotes the words `Verbatim-quote rule (ticket #709` inside an
inline span while asserting that the clause does not carry them, and the grep that
implements U4-1 cannot tell a citation from a second home of the rule.

Pre-existing, not the merge. The same two paths print at `c130dd13` and at `2c622ad2`,
both before `origin/main` came in, and `origin/main` itself prints an empty line
because U4 has not landed there.

Which fix is right: widen U4-1's exclusion, and correct the verdict cell as well. Not
one or the other.

- The row's predicate is that the rule has one home. Its exclusion list already skips
  `.sdlc/plans` and U4's own handoff for exactly this reason, both named in the row's
  own control cell: a record that names the pattern as the subject of a claim is not a
  second home. The U3 verdict cell is the same class, so the exclusion list is the
  defect and widening it restores the predicate the row was written for. The adapter's
  own cited-quote clause, `§3` amendment of 2026-09-19, already rules this shape: a
  quote cited as the subject of a finding is not a carrier and no sweep reads it as one.
- Correcting only the cell would leave the row tripping on the next record that cites
  the rule by name, and would hide the gap rather than close it. Widening only the
  exclusion would leave a landed verdict asserting a count that its own text falsifies.
- Concretely: add `':!.sdlc/verdicts/records-followup-U3.md'` (or the broader
  `':!.sdlc/verdicts'` with the reason written down) to U4-1's first command, and
  replace the cell's `so U4-1 still counts one` with what the widened row counts and why
  this cell is excluded. Neither edit belongs to U9, which was dispatched for five hunks.

## Two 🟡 observations, neither blocking

1. `.sdlc/board.md`, this plan's U9 row, Branch cell: it reads
   `unit/rf-U9 off plan/records-followup @ 213f5203, plan tip 2e7a4c66 merged in by the
   builder`. The plan branch order is `213f5203`, `2e7a4c66`, `c130dd13`, `2c622ad2`, and
   the head actually carries `c130dd13` by fast-forward and `2c622ad2` by merge, both
   confirmed ancestors of `24c99e58`. The cell is two commits stale against what landed
   in the merge. The row is still `🔵` and Orchestrator-owned, so it is due an in-place
   edit when the unit closes; nothing is lost, and no check reads the cell.
2. `.sdlc/adapter.md:65` keeps main's `2026-09-20` over this branch's `2026-09-19` for
   the same 746 bytes. Correct as a record of when the text landed on `main`, and no
   check reads the date, but it means the plan branch's own dating of that edit is not
   preserved anywhere. Recorded, not a defect.

## What was not run, and why

`npm run build` and `npm run smoke` are pre-land gates by the plan's own text, and the
first would install `node_modules` into the worktree that P1 requires to be without it.
The per-unit line-count and map-back rows (`U1-6`, `U2-3`, `U7-3`, `U4-6`) diff against a
unit's own merge base and are written for a unit that adds a fixed number of lines to a
fixed set of files; a merge commit is not that shape, and the brief did not name them.

Scratch worktree `/tmp/rf-u9-verify/head` and clone `/tmp/rf-u9-verify/neg` removed by
exact name after this record was written.
