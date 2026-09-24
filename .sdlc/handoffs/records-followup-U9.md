---
kind: handoff
plan: records-followup
unit: U9
branch: unit/rf-U9
written: 2026-09-20
pass: 1
---

# Handoff U9 records-followup · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/rf-U9. Two merges: `6ccfcf4e`, parents `c130dd13` (plan tip) and `3ce50daa` (`origin/main`), then `6a04e8ba`, which brings in plan tip `2c622ad2` and the Conductor's repair of its own U8 verdict |
| Worktree | .worktrees/rf-U9 |
| Files | the five conflicted records, plus `.sdlc/handoffs/records-followup-U3.md` (the carried correction), this handoff, and two question documents |
| Ran | `npm test` 🟢 · branding 🟢 · `baseline-agrees-check.sh` exit 0 🟢 · `doc-drift-rows-check.sh` 🟢 · P5 P6 P7 🟢 · U1-1 U1-2 U1-4 U1-5 U3-9 U3-10 U4-3 🟢 · U4-1 🟡 |
| Left out | the U8 verdict's own repair, which the Orchestrator held and the Conductor made on the plan branch. This unit merged it in and re-measured, and never edited that file |
| Merge, not rebase | `plan/records-followup` was fast-forwarded into this branch first (`213f5203` to `c130dd13`), then `origin/main` merged in. No commit on this branch was rewritten, so every sha the board, the verdicts and the handoffs cite still resolves |
| Who committed it | the Orchestrator, under `Seat: orchestrator`. The `commit-msg` hook refuses a board-staging commit from a builder, so the builder resolved and staged and the Orchestrator committed. See the board-seat question document |

## The five hunks

Each was settled by running the thing the sentence describes at the merged tree, never by picking a side.

| Hunk | This branch said | `origin/main` said | Command and what it printed | What was written |
|---|---|---|---|---|
| `.sdlc/debt.md` K17 | `filters 7 files by name (at 20298cc; the list is the exception cell of architecture K17, which is the copy to trust)` | `filters 7 files by name`, then the map's filter spelled out as of `28c2e8cc`, `(3 names until that commit)`, and a closing sentence that pass 6 grades the seven-name control 🟢 at `3600ad6e` | the map's own K17 control, both halves, at the merged tree: framework half `0`; registration half `7` before the exception filter (`gate-report.mjs`, `repo/fixtures/gate-report-clean.mjs`, `repo/fixtures/gate-report-mismatch.mjs`, `repo/fixtures/gate-report-singlequote.mjs`, `run.mjs`, `smoke/smoke.mjs`, `ui/counts.mjs`) and `0` after. `git diff --name-only origin/main -- test` printed nothing and `git log --oneline 20298cc..3ce50daa -- test` printed nothing, so `test/` is byte-identical to `3ce50daa` and unchanged since `20298cc`. `git show 28c2e8cc^:.sdlc/architecture.md` carries the three-name filter and `git show 28c2e8cc:` carries the seven-name one, so main's `(3 names until that commit)` is true | both sides kept. Main's spelled-out filter and its dating, this branch's pointer to the map cell as the copy to trust, main's pass 6 sentence, and the number with the head it was read at: `7` before the filter, `0` after, at the merge of `c130dd13` with `3ce50daa` |
| `.sdlc/architecture.md` rerun note | pass 5 stays graded at `d46ae48`, with the parenthetical that it is a plan-branch sha the squash dropped | the same note, but `d814500` in both places it names pass 5's grading head, plus the whole pass 6 accounting and the newest-pass rule | pass 5's own header, read at the merged tree: `sed -n '/^## Pass 5/,$p' .sdlc/verdicts/architecture.md \| grep -m1 -o '^Graded [0-9-]* at \`[0-9a-f]*\`'` printed `` Graded 2026-09-19 at `d46ae48` ``. Main's own pass 6 Result line says the same: `K1 to K16 and K18 read from pass 5 at d46ae48`. So main's note contradicted the file it points at. `git cat-file -t d46ae48` prints `commit` and `git merge-base --is-ancestor d46ae48 origin/main` exits non-zero, which is what the parenthetical claims | main's text, which alone accounts for pass 6 superseding pass 5 on K17 and carries the rule, with both `d814500` readings of pass 5's grading head corrected to `d46ae48` and this branch's parenthetical kept. The first clause, that U2 ran the controls at `d814500`, is a different fact and stays |
| `.sdlc/adapter.md` §2.1 | the amendment dated `2026-09-19` | the same amendment dated `2026-09-20` | `cmp -l` on the two sides: 746 bytes each, differing in exactly two, offsets 22 and 23, `71`→`60` and `61`→`62` octal, which is `19` to `20`. Normalising the date makes them identical | main's bytes, since main is what landed. U3-9 still prints `0`, `1`, `1`; the amendment appears once |
| `.sdlc/verdicts/architecture.md` | appended a dated note (2026-09-19) closing pass 5's open observation | appended `## Pass 6` (2026-09-20) | nothing to measure: a history file where both sides appended different things | both appends kept, in date order, the note first and pass 6 after, separated by one blank line. Nothing reworded, nothing deleted |
| `.sdlc/board.md` | this plan's nine rows, U1 through U9 and U5 | the two landed rows `k17-rerun U1` (#710) and `records-tidy U1` (#712) | nothing to measure: the union is the instruction | eleven rows, main's two first, then this plan's nine, no row's text edited, one header. Line 3's preamble merged with no conflict and already names both plans as landed, so landed-first matches the order that line reads in. The Orchestrator judged the union right as staged |

## The carried correction

`.sdlc/handoffs/records-followup-U3.md`, the Correction line U8 appended, gains one clause and nothing else in that file moves. The clause says that the U3-1 evidence cell's quoted `note  head: baseline ref 20298cc has the same tree as HEAD outside .sdlc/ and .gitignore` is what the script printed at the graded head `ceb471b0`, and is kept verbatim as the record of that run rather than restated in U8's new wording.

Measured, not assumed: `git show ceb471b0:.sdlc/checks/baseline-agrees-check.sh` line 32 reads `console.log((same ? "ok    " : "note  ") + \`head: baseline ref ${ref || "none"} has the same tree as HEAD outside .sdlc/ and .gitignore\`);`, one sentence with only the prefix switched, so on a moved tree it printed exactly the quoted line. The same line at the merged tree selects a whole sentence per branch and the script now prints `note  head: baseline ref 20298cc, the tree moved outside .sdlc/ and .gitignore since the baseline ran, so the numbers are unproven at this head`.

## Criteria, measured at `6a04e8ba` and again at the head this handoff commits to

Every row below was run twice: once at the second merge `6a04e8ba`, and once against the committed tree of the records commit on top of it, which adds only this unit's own handoff and question documents. No figure differs between the two runs except the branding gate's scanned-file count, which rises with those records and is not a figure any row asserts.

| # | Criterion | Expected | Measured | State |
|---|---|---|---|---|
| U9-1 | main is an ancestor, no conflict markers | exit 0, no output | `git merge-base --is-ancestor origin/main HEAD` exit `0`; `git grep -c '^<<<<<<<\|^>>>>>>>' -- .sdlc` printed nothing, exit `1` | 🟢 |
| U9-2 | nothing main landed is lost | empty for files this plan does not own | `git diff origin/main HEAD --name-only -- .sdlc/plans/archive/ '.sdlc/verdicts/k17-rerun*.md'` names two paths, `.sdlc/plans/archive/records-refresh-corrections.md` and `.sdlc/plans/archive/records-refresh.md`, both of which this plan owns and U6 wrote. No `k17-rerun` or `records-tidy` path appears. `git diff origin/main HEAD --diff-filter=D --name-only` prints `0` lines, so this head deletes nothing main has | 🟢 |
| U9-3 | the plan-level rows and the named unit rows re-run green, F1 and F2 re-measured | see the two tables below | every runnable row green, one 🟡 on U4-1 that is pre-existing and reproduced at `c130dd13` | 🟢 |
| U9-4 | `baseline-agrees-check.sh` exits 0 with `stale total: 0` | exit 0 | exit `0`, `stale total: 0`, seven `ok` counted lines, one `note  head:` and one `ok    head:` | 🟢 |
| U9-5 | `npm test` green, tree clean after | pass line, exit 0 | `✓ all 48 test files passed`, exit `0`, 125 s at load 10.41 before and 11.86 after on 10 cores, no `node_modules`. `TESTS` is `48`. `git status --short` after: this unit's own four files and nothing else | 🟢 |

### Plan-level rows

`BASE` is `$(git merge-base origin/main HEAD)`, which after this merge resolves to `3ce50daa`, not the `d34b4fb1` earlier units read. That is the right reading for a head that has main in it: it measures what this branch adds over main.

| # | Expected | Measured | State |
|---|---|---|---|
| P1 | the runner's pass line, `48`, `0` | `✓ all 48 test files passed`, exit `0`, 125 s; `TESTS` is `48`; `git status --short` is this unit's own four files and nothing else. No `node_modules` in the worktree | 🟢 |
| P2 | not run | pre-land only, and it needs `npm ci`, which would put `node_modules` in this worktree and break P1's own condition | ⚪ |
| P3 | not run | pre-land only, and it needs real headless Chrome | ⚪ |
| P4 | `branding: clean (N files scanned)`, `exit 0` | `branding: clean (500 files scanned)`, `exit 0` | 🟢 |
| P5 | `0`, `0`, `1	1` | `0`, `0`, `1	1` | 🟢 |
| P6 | `0` | `0` against `3ce50daa` | 🟢 |
| P7 | every counted line `ok`, `stale total: 0`, `exit 0` | nine lines: seven counted `ok`, one `note  head:` (printed, never counted) and one `ok    head:`; `stale total: 0`; `exit 0`. No row went STALE, and the `tests` and `ui.html` rows both read `ok`, so main moved no measured figure out from under the baseline | 🟢 |

The two figures worth naming, because main moved and the brief asked for them: `ok    tests: baseline 48, test/run.mjs TESTS 48` and `ok    ui.html: baseline 3780.5 KB, tree 3780.5 KB`. Neither is STALE. The `note  head:` line is the expected one for a tree that moved outside `.sdlc/`, and it is what U8 reworded.

`sh .sdlc/checks/doc-drift-rows-check.sh | tail -1` printed `rows 56 drifted 11 holds 45 undetermined 0 bad 0`, the same figures U3 recorded.

### Unit rows named in the brief

| # | Expected | Measured | State |
|---|---|---|---|
| U1-1 (F1) | `7`, `filters 7 files by name` | `7`, `filters 7 files by name` | 🟢 |
| U1-2 (F2) | the same backticked sha twice, `d46ae48` | `` `d46ae48` ``, `` `d46ae48` `` | 🟢 |
| U1-4 (F6) | `(#699) (#702)`, `0`, `1` | `(#699) (#702)`, `0`, `1` | 🟢 |
| U1-5 (F10) | `0` | `0`: every sha the baseline cites is in `origin/main`'s history, including after main moved to `3ce50daa` | 🟢 |
| U3-9 | `0`, `1`, `1` | `0`, `1`, `1` | 🟢 |
| U3-10 | `1`, `1`, `1` | `1`, `1`, `1` | 🟢 |
| U4-1 | `.sdlc/adapter.md`, `1`, `1` | `.sdlc/adapter.md,.sdlc/verdicts/records-followup-U3.md`, `1`, `1`. The second file is `.sdlc/verdicts/records-followup-U3.md:14`, the U3-10 evidence cell, which names the rule in passing. Pre-existing, not the merge: the same command at `c130dd13` prints the same two paths | 🟡 |
| U4-3 | `1`, the five file counts, `0` | `1`; `.sdlc/baseline.md:1`, `.sdlc/handoffs/records-refresh-U1.md:1`, `.sdlc/handoffs/records-refresh-U3.md:4`, `.sdlc/verdicts/records-refresh-U3.md:1`, `.sdlc/verdicts/survey.md:1`; `0` | 🟢 |

## The red this unit found, and how it was cleared

Kept as history, because it is how the red was found and it is the only reason this unit has two merges.

At the first merge `6ccfcf4e`, `npm test` and P4 were both red on one cause. `.sdlc/verdicts/records-followup-U8.md` line 27 wrote the branding gate's first banned string literally, twice, in the negative-control cell of the row that grades the branding gate. `test/repo/branding.mjs:41` skips only `.git`, `node_modules`, `dist`, `other` and the worktree directories, so `.sdlc/verdicts/` is in scope and no quote is exempt there, which adapter row X12 rules on purpose.

Measured in a throwaway shared clone under this builder's own scratch directory, removed after:

| Head | What the gate printed |
|---|---|
| `3ce50daa` (`origin/main`) | `branding: clean (476 files scanned)`, exit 0 |
| `eac3d9fb` (the commit that added the U8 verdict) | `FAIL: 1 branding violation(s) across 481 files` |
| `fd3d110a` (the U8 merge after it) | `FAIL: 1 branding violation(s) across 482 files` |
| `c130dd13` (the plan tip this unit branched from) | `FAIL: 1 branding violation(s) across 482 files`, same one file, exit 1 |
| `6ccfcf4e` (this merge) | `FAIL: 1 branding violation(s) across 498 files`, same one file |

So the gate had been red on `plan/records-followup` since `eac3d9fb`. The merge changed only the scanned-file count, 482 to 498, because main brought seventeen more records. `origin/main` is clean, so nothing this merge pulled in was at fault.

The repair was already ruled: `.sdlc/adapter.md` §3, the verbatim-quote rule, says a quote that would carry one of the gate's three banned strings is cut before that string and marked `altered:`. This builder began applying it and the Orchestrator held it mid-flight, on the ground that a verdict is the Verifier seat's record and a builder is the wrong owner even for a mechanical cut. The edit was reverted before anything was committed, and `.sdlc/verdicts/records-followup-U8.md` was byte-identical to `6ccfcf4e` when this unit stopped touching it.

The repair came from the plan tip, not from here. The Conductor repaired its own U8 verdict on `plan/records-followup` at `2c622ad2`, which also corrects this unit's checklist row from `P1 to P9` to `P1 to P7`. This unit merged that tip in at `6a04e8ba` and re-measured. `.sdlc/questions/records-followup-U9-branding-red.md` carries the question, the five-head evidence and the ruling.

### A second instance, in this unit's own file

The re-measure after `6a04e8ba` was still red, at 500 files, and the named file had changed: `.sdlc/questions/records-followup-U9-branding-red.md`, this builder's own question document, which had quoted the gate's `✗` line whole inside a fenced block and so reproduced the exact defect it was reporting. Same root cause, same rule, and this file is the builder's own, so the builder repaired it: both gate lines are now inline spans, one per line of output, the first cut where the gate repeats the banned string back and marked `altered: retired name removed`.

Worth naming for whoever writes the next record about this gate: quoting a gate's failure output verbatim is the failure. `.sdlc/adapter.md` §3 already says so, and two seats in a row wrote the string anyway, which suggests the rule needs a louder home than one sentence in an amendment. That is a finding for the Orchestrator, not a change this unit made.

After that repair, `node test/repo/branding.mjs` prints `branding: clean (500 files scanned)`, exit `0`, and `npm test` prints `✓ all 48 test files passed`, exit `0`.

## Questions

| # | Question | Options | Default |
|---|---|---|---|
| 1 | Who repairs the U8 verdict's banned-string quote, which redded `npm test` and P4? | the question document's A, B, C | answered: the Conductor repaired its own verdict at `2c622ad2`, merged in here |
| 2 | The U9 checklist row asked for `P1 to P9`; the plan defines `P1` to `P7`. | renumber · add two rows | answered: renumbered at `2c622ad2` |
| 3 | U4-1 prints two paths because a U3 verdict evidence cell names the rule in passing. Widen U4-1's exclusion list, or leave the row 🟡? | widen the exclusion as U4-1 already does for `plans/` and U4's own handoff · leave it | leave it and record it; it is pre-existing, reproduced at `c130dd13`, and not this unit's to settle |
| 5 | Two seats in a row wrote the branding gate's banned string verbatim into a `.sdlc/` record, each time while documenting that gate. Does §3's one sentence need a louder home, a check, or both? | a line in `.claude/CLAUDE.md` beside the existing branding sentence · a grep row in one of the `.sdlc/checks/` scripts so the gate's own name flags it before commit · leave it to the gate | the check, since the gate already catches it but only after the record is written and only as a whole-suite red. Not this unit's to build |
| 4 | `.sdlc/debt.md` K17's `where` cell reads `` `test/run.mjs:12-21` (33 commits) ``. `git log --oneline -- test/run.mjs \| wc -l` prints `37` at this head, and printed `37` at `20298cc` too, so the figure was already stale before this merge. Both sides of the conflict carried it identically, so it was not a disputed clause | correct it in a later unit · leave it | leave it; correcting an undisputed clause would widen this unit past the five hunks it was dispatched for |

## Not done, and why

- The U8 verdict's repair. Held by the Orchestrator, made by the Conductor at `2c622ad2`, merged in here. This unit never committed an edit to that file.
- `P2` and `P3`, pre-land only by the plan's own text.
- `U1-6`, `U2-3`, `U7-3` and the other per-unit line-count and map-back rows. They diff against a unit's own `BASE` or `UB` and are written for a unit that adds a fixed number of lines to a fixed set of files. A merge commit is not that shape, and the brief did not name them.
