---
kind: handoff
plan: records-followup
unit: U10
branch: unit/rf-U10
written: 2026-09-20
pass: 2
---

# Handoff U10 records-followup · builder → reviewer

| Field | Value |
|---|---|
| Branch | `unit/rf-U10`, cut from `plan/records-followup` at `7b5ebd71`. Revision 11 (`215351b6`) merged fast-forward before any edit; revision 12 (`17f344a2`) merged at the start of pass 2, so the plan text measured against is the revision 12 one |
| Worktree | `.worktrees/rf-U10` |
| BASE | `git merge-base origin/main HEAD` reads `3ce50daa`. `UB` is `17f344a2` |
| Files | `.sdlc/adapter.md`, `.sdlc/baseline.md`, `.sdlc/debt.md`, `.sdlc/handoffs/records-followup-U4.md`, `.sdlc/handoffs/records-followup-U7.md`, `.sdlc/handoffs/records-refresh-U3.md`, `.sdlc/plans/archive/records-refresh-corrections.md`, `.sdlc/questions/records-followup-U9-board-seat.md`, `.sdlc/verdicts/records-followup-U4.md`, `.sdlc/verdicts/records-followup-U6.md`, `.sdlc/verdicts/records-followup-checkability.md`, the copied review `.sdlc/verdicts/records-followup-prepr-review.md`, and this handoff |
| Ran | `npm test` green, no `node_modules` · `sh .sdlc/checks/baseline-agrees-check.sh` exit 0 · branding clean · U4-1, U4-3, U4-5, U3-10 · P4, P5, P6, P7 |
| Left out | a set of legacy cut quotes outside what the review named; see Judged and left |
| Pass 2 | rework 1's three record fixes, plus revision 12's two additions: the §3 byte-pinned sentence and the copied review's header |

## The review copy and its hash

Pass 1 `cp`d the Lane B scratchpad file into `.sdlc/verdicts/records-followup-prepr-review.md` byte for byte; `shasum -a 256` printed `e30720eb197f324c739cb2536d2de91f8d6037c4aad2a5ac877a80de9040c3b2`, the sha the brief states.

Pass 2 put a header above it, as revision 12's U10 row asks. The header states `body-sha256: e30720eb197f324c739cb2536d2de91f8d6037c4aad2a5ac877a80de9040c3b2` and says in prose which bytes the hash covers: everything from the marker line `<!-- body begins, byte-pinned -->` to the end of the file. The body is untouched.

The row does not say whether the verifier recomputes over the whole file or over the body, and this settles it by mechanics rather than preference: a whole-file hash cannot be stated inside the file it describes, since writing it changes the bytes it is a hash of. So the stated hash is necessarily the body's, which is also the source's, which is also the one the brief states. The recompute command is written into the header and was run:

- `awk 'f{print} /^<!-- body begins, byte-pinned -->$/{f=1}' .sdlc/verdicts/records-followup-prepr-review.md | shasum -a 256` prints `e30720eb197f324c739cb2536d2de91f8d6037c4aad2a5ac877a80de9040c3b2  -`

File and stated hash agree.

The header also carries `source: reviewer-l4, graded at 887e3eb2`, which is what the rework 2 clause of the `.sdlc/adapter.md` §3 sentence requires: the seat whose record it is and the head that seat graded at, beside the hash. It satisfies the new wording as it stands, so nothing in the header moved for it. See Questions if the Conductor wants the pin taken differently.

## Every edited line

Line numbers are the committed ones. Each quoted program line names the command that reprints it byte for byte.

| # | File and line | What changed | Reprint command |
|---|---|---|---|
| 1 | `.sdlc/verdicts/records-followup-U6.md:34-37` | the fenced `od -c` dump became four inline spans, one per line of output, bytes unchanged (a fence to spans move, not a requote) | `perl -CS -e 'printf "\x{25B6} %-24s FAIL\n", "engine/semantic.mjs"' \| od -c` |
| 2 | `.sdlc/questions/records-followup-U9-board-seat.md:22` | the fenced hook refusal line became one inline span, bytes unchanged | the hook's own refusal: a `git commit` whose staged set holds `.sdlc/board.md` without a `Seat: orchestrator` trailer |
| 3 | `.sdlc/handoffs/records-refresh-U3.md:27-29` | the fenced `npm ls typescript vite --depth=0` output became three inline spans, one per line of output, bytes unchanged. Not named by the review; found by the sweep | `npm ls typescript vite --depth=0` after `npm ci` |
| 4 | `.sdlc/baseline.md:19` | the `npm test` summary cell now sits in a span and carries the check mark the runner prints | `npm test 2>&1 \| tail -1` |
| 5 | `.sdlc/baseline.md:20` | the `npm run build` summary cell now sits in a span, bytes unchanged | `npm test 2>&1 \| grep '^wrote figma/plugin/ui.html'` (the same generator line `npm run build` prints) |
| 6 | `.sdlc/handoffs/records-followup-U7.md:46` | the §Ran quote of the pass line was cut before the check mark; restored from this unit's own run | `npm test 2>&1 \| tail -1` |
| 7 | `.sdlc/plans/archive/records-refresh-corrections.md:29` | N1's `As written` span carries `cited:` | n/a, a cited span |
| 8 | `.sdlc/plans/archive/records-refresh-corrections.md:30` | N2's two `As written` spans each carry `cited:` | n/a, a cited span |
| 9 | `.sdlc/verdicts/records-followup-U4.md:29` | note 1's row title and its `Why` cell: the defective span it names carries `cited:` (two spans on the line; the control's own printed line beside them is untouched) | n/a, a cited span |
| 10 | `.sdlc/verdicts/records-followup-U4.md:30` | note 2's row title: the truncated span it names carries `cited:` | n/a, a cited span |
| 11 | `.sdlc/verdicts/records-followup-checkability.md:62` | the U4 row 2 `Why` cell's span carries `cited:` | n/a, a cited span |
| 12 | `.sdlc/handoffs/records-followup-U4.md:13` | the enumerated hyphen-minus smoke form carries `cited:` | n/a, a cited span |
| 13 | `.sdlc/handoffs/records-followup-U4.md:39` | criterion row 2's grep whose pattern is the defective span carries `cited:` | n/a, a cited span |
| 14 | `.sdlc/handoffs/records-followup-U4.md:40` | criterion row 3's grep whose patterns are the defective forms carries `cited:` | n/a, a cited span |
| 15 | `.sdlc/debt.md:92` | K17's `c130dd13` annotated as a sha on this plan's own branch, which the squash drops, with its merge base with `origin/main`, the way the `architecture.md` rerun note annotates `d46ae48`. The measured figures in the row are untouched | `git merge-base c130dd13 origin/main \| cut -c1-8` printed `d34b4fb1`; `git merge-base --is-ancestor c130dd13 origin/main` exits non-zero |
| 16 | `.sdlc/baseline.md:13` | re-measured: only the three live-table rows ran three times in sequence in records-refresh's U3 worktree. The two `extended:` rows are six runs in `.worktrees/rf-U3`, the U3 worktree of plan records-followup on branch `unit/rf-U3`, the two gates alternating | `.sdlc/handoffs/records-followup-U3.md` §Runs, rows 1 to 6, and its `| Worktree | .worktrees/rf-U3 |` field |
| 17 | `.sdlc/baseline.md:32` | re-measured: the sentence still says what the two chains do not cover, and now says what the fonts row does cover, three runs each followed by an empty status | `.sdlc/handoffs/records-followup-U3.md` §Runs, rows 2, 4, 6, status column `0` |
| 18 | `.sdlc/baseline.md:52` | re-measured: #706 (PR #707, `20298cca`) moved the toolchain and touched no file under `test/`; #699 (PR #702, `9a44f685`) touched only files under `test/` and no toolchain file. The re-attribution finding F6 removed is gone | `git show --stat 20298cca` and `git show --stat 9a44f685`; `git show 9a44f685 -- test/run.mjs` shows the one added `TESTS` entry |
| 19 | `.sdlc/adapter.md:103` | revision 12's exemption, one sentence appended to the cited-quote amendment: a byte-pinned verbatim copy of another seat's record, pinned by a hash its own header states and covers, is exempt from the sweep and from every restoration and marking. Rework 2, Conductor ruling: the same sentence now also requires the header to name the seat whose record it is and the head that seat graded at, so a pin is traceable to its author and self-certifying is closed off | n/a |
| 20 | `.sdlc/verdicts/records-followup-prepr-review.md:1-19` | the byte-pinned header, above an untouched body; see §The review copy and its hash | `awk 'f{print} /^<!-- body begins, byte-pinned -->$/{f=1}' .sdlc/verdicts/records-followup-prepr-review.md \| shasum -a 256` |
| 21 | `.sdlc/baseline.md:56` | rework 1 fix 1: the prior-set `npm test` summary cell now sits in a span as it stands, with `altered: leading check mark dropped` next to it. The glyph itself needs a `d814500` run and was not invented | n/a, wrapping bytes already in the file changes none of them |
| 22 | `.sdlc/baseline.md:57` | rework 1 fix 1: the prior-set `npm run build` summary cell now sits in a span as it stands | n/a, same |
| 23 | `.sdlc/baseline.md:58` | rework 1 fix 1: the prior-set `npm run smoke` summary cell now sits in a span as it stands, with `altered: cut before the dash and the clause after it` next to it. Measured, not assumed: `git show d814500:test/smoke/smoke.mjs` line 293 prints the dash and the clause, so the cell is cut | `git show d814500:test/smoke/smoke.mjs \| grep -n 'SMOKE PASS'` |
| 24 | `.sdlc/baseline.md:52` | rework 1 fix 2: the enumeration read as a closed list of six and the commit touches ten. It now names all ten and keeps the load-bearing claim, none under `test/` | `git show --name-only --format= 20298cca` lists ten; `git show --name-only --format= 20298cca \| grep -c '^test/'` prints `0` |
| 25 | `.sdlc/handoffs/records-followup-U4.md:55` | rework 1 fix 3: the Correction line now names which quoted form each of the three markers governs, and records the measured span structure of criteria row 3 | n/a |
| 26 | ten appended `Correction (2026-09-20, plan records-followup U10, #709):` lines | one per edited record, in the shape the other corrected records on this plan use: `.sdlc/baseline.md:60`, `.sdlc/debt.md:131`, `.sdlc/handoffs/records-followup-U4.md:55`, `.sdlc/handoffs/records-followup-U7.md:48`, `.sdlc/handoffs/records-refresh-U3.md:170`, `.sdlc/plans/archive/records-refresh-corrections.md:37`, `.sdlc/questions/records-followup-U9-board-seat.md:42`, `.sdlc/verdicts/records-followup-U4.md:47`, `.sdlc/verdicts/records-followup-U6.md:79`, `.sdlc/verdicts/records-followup-checkability.md:177` | n/a |

The three verdicts (`records-followup-U4.md`, `records-followup-U6.md`, `records-followup-checkability.md`) took only the mechanical change the rule dictates. No grade moved and no finding's wording moved: `git diff` on those three files is three marker insertions, one fence-to-spans move, and one appended Correction line each.

## The fence sweep

The lister walks every `.md` file in `git diff --name-only origin/main...HEAD` plus the copied review and prints one line per fenced block. At `7b5ebd71` it prints `fences 28`; at the committed head, `fences 25`.

Of the 28, three held program output and are edits 1, 2 and 3 above. The other 25 are judged not program output, and the count of those is 0 at both heads. Judged one by one:

| Fences | Reason judged not program output |
|---|---|
| `.sdlc/adapter.md:71-73`, `:156-180` | a proposed file's contents: the `.sdlc/config.json` body and the `## SDLC` block for `.claude/CLAUDE.md` |
| `.sdlc/architecture.md:22-31` | a hand-drawn dependency diagram, nothing printed it |
| `.sdlc/architecture.md:125-130`, `:134-137`, `:140-144`, `:147-150` | the four K-control scripts, commands to run |
| `.sdlc/handoffs/records-followup-U8.md:26-28` | a source line of `.sdlc/checks/baseline-agrees-check.sh`, a file's own contents |
| `.sdlc/plans/archive/records-refresh.md:77-114`, `:267-295` | two check scripts the plan prescribes, commands to run |
| `.sdlc/plans/archive/records-refresh.md:120-122`, `:132-134`, `:140-142`, `:146-148`, `:152-157`, `:163-165`, `:214-216`, `:222-230`, `:238-246`, `:325-335`, `:341-343`, `:406-408`, `:412-416` | §Texts blocks: the exact prose, table or `.gitignore` lines a unit was told to write into another file. Plan text, including `:325-335`, which prescribes the prior-set rows rather than reporting a run of its own |
| `.sdlc/plans/records-followup.md:101-103`, `:175-177` | plan text: the P1 control note and the §Texts block of the rule paragraph |

`.sdlc/verdicts/records-followup-prepr-review.md` carries no fence at all.

🟡 One delta from the review. The review's finding 1 names two fences; the sweep finds three, the third being edit 3 above, an `npm ls` dump in a file this PR touches. So criterion 2's "the review's count" reads `2` at the pre-fix head if it means what the reviewer wrote, and `3` if it means what the sweep finds. Both numbers are stated here; the fixed count is `0` either way.

## Judged and left

| Item | Why left |
|---|---|
| legacy cut quotes of the runner's pass line in other touched records (`.sdlc/handoffs/records-refresh-U3.md:49` and `:57`, `.sdlc/verdicts/architecture.md:41`, `.sdlc/handoffs/records-refresh-U1.md` rows, `.sdlc/verdicts/survey.md:9` and `:23`) | pre-2026-09-19 lines the review did not name and no U10 criterion reaches. Restoring them moves figures inside criteria other units own (records-refresh U3-8 reads the handoff's run rows), so it is a finding for a later unit, not a silent widening here |
| `.sdlc/plans/records-followup.md` lines 42, 181, 185, 194, 195, 217, 218, 234, which quote defective spans unmarked | the plan file is the Conductor's, and the review's finding 3 routes plan text there. Revision 9 and revision 11 already work this ground |
| the plan's §Texts copy of the rule at `:175-177` | it is the pre-amendment wording of the expected-dash sentence, which `.sdlc/adapter.md:101` no longer reads. Reported, not edited: plan text |
| the copied review's own unmarked quotations of defective forms | ruled out of scope by plan revision 12 and by the `.sdlc/adapter.md` §3 sentence this unit writes. Not swept, not restored, not marked |

## Rework 1, one finding measured rather than applied

Rework 2 (delta review at `a0faa7bc`): the span counts below stand, but the Correction line this unit wrote into `.sdlc/handoffs/records-followup-U4.md:55` restated them wrongly, as twelve spans with the marker thirteenth. Twelve spans is right and the marker is the fifth of them; thirteen is row 2 above it. A permanent Correction line must not carry a measurement that does not reproduce, so the clause now names both rows, recounted: `perl -ne 'printf "line %d: %d backticks, %d spans\n", $., scalar(()=/\x60/g), scalar(()=/\x60/g)/2 if $. == 39 || $. == 40' .sdlc/handoffs/records-followup-U4.md` prints `line 39: 26 backticks, 13 spans` and `line 40: 24 backticks, 12 spans`. Nothing else was touched.

🟡 Rework 1 fix 3 asked for two `cited:` markers to be moved beside the span they govern. Measured, both already are. The premise was that `\|` ends a backtick span inside a table cell; it does not, it is an escaped pipe within the span. `node` over the two lines prints the spans in order:

- line 39: thirteen spans, span 6 is `grep -c 'refs-canonical, ordered'` `cited:` and span 7 is the marker, directly after it
- line 40: twelve spans, span 4 is the whole `git grep -c -e ... \| wc -l` command, which carries all four altered smoke forms, and span 5 is the marker, directly after it

Moving a marker into the middle of span 4 would mean splitting a recorded command into two spans, which changes its spelling in the record. So the markers stayed where they are and the Correction line now names the form each one governs, per the second half of the same instruction. The scan script is in the scratchpad; the same reading is reproducible with `perl -ne 'print scalar(() = /\x60/g), "\n" if $. == 39 || $. == 40' .sdlc/handoffs/records-followup-U4.md`, which prints `26` and `24`, both even, so no span is left open across a `\|`.

## Criteria, measured against the committed tree

Pass 2, measured against the committed tree, with every command run from a script file in the scratchpad, never nested one-line quoting. Filled by the measurement commit that follows the pass 2 edits. Pass 1's readings at `6b5e20be` are superseded by these.

| # | Criterion | Printed | Expected | Match |
|---|---|---|---|---|
| 1 | except for byte-pinned copies, the handoff enumerates every edited line, and for each quoted program line gives the command that reprints it | §Every edited line, 26 rows, with a reprint command on each quoted program line. The one byte-pinned copy is row 20, whose reprint command is the hash recompute; its body is under the §3 exemption and is not enumerated line by line | same | yes |
| 2 | the fence sweep prints 0 at the head, the review's count before | `fences 25` at the head and `fences 28` at `7b5ebd71`, of which the program-output ones are `0` and `3` | `0` at the head; `2` by the review's own naming, `3` by the sweep | yes, with the count delta stated above |
| 3 | U4-1, U4-3, U4-5, U3-10 re-run green | U4-1 `.sdlc/adapter.md`, `1`, `1`. U3-10 `1`, `1`, `1`. U4-3 `1`, then `.sdlc/baseline.md:1`, `.sdlc/handoffs/records-refresh-U1.md:1`, `.sdlc/handoffs/records-refresh-U3.md:4`, `.sdlc/verdicts/records-refresh-U3.md:1`, `.sdlc/verdicts/survey.md:1`, then `0`. U4-5 `0`, then `9` occurrences on `9` lines over the frozen span `07ecb44c b9e70950`, then `branding: clean (502 files scanned)`, `exit 0` | exactly these | yes, all four. U4-5's second leg reads `9` again now that revision 12 freezes it at U4's graded span |
| 4 | `baseline-agrees-check.sh` exit 0, branding clean, `npm test` green | seven counted `ok` lines, one `note  head:`, one `ok    head:`, `stale total: 0`, `exit 0`, with the three prior-set rows now spanned; `branding: clean (502 files scanned)`, `exit 0`; `npm test` `exit 0`, `✓ all 48 test files passed`, `TESTS` `48`, `git status --short` `0` lines, no `node_modules` in the worktree, at load `7.93 14.94 31.34` on 10 cores | same | yes |
| 5 | no file outside `.sdlc/` moves | `0` files outside `.sdlc/` in `git diff --name-only 17f344a2`, and the thirteen-path list is all `.sdlc/`. P5 against `BASE` prints `0`, `0`, `1	1` | `0`; P5 as the plan states it | yes |

🟡 Criterion 3, U4-5's second leg. The command counts every dash added to `.sdlc` since `07ecb44c`, U4's own merge base, so its value grows with every unit that has landed on the branch since: it covers U6, U3, U8, U9 and U10 now, not U4 alone. Measured at this head it is `15` occurrences on `14` lines. This unit adds none of them: `git diff -U0 215351b6 -- .sdlc | grep '^+' | LC_ALL=C grep -o "$EM" | wc -l` prints `0`, with and without this handoff excluded. The `9` in U4's own handoff is the reading at U4's own head and is not restated anywhere. Reported per the brief, not repaired.

## Questions

| # | Question | Options | Default taken |
|---|---|---|---|
| 1 | The U10 row says the copy's header states the source's hash and that the verifier recomputes it, but not over which bytes | A the hash covers the body below the marker line, which is the source's own bytes and the brief's `e30720eb` value · B the hash covers the whole file, which then cannot be the source's and must be restated every time the header changes | A, and not merely as a preference: a whole-file hash cannot be stated inside the file it describes. If the Conductor wants B, the header needs a different mechanism than a stated value, and this is a one-line change |
| 2 | The marker line `<!-- body begins, byte-pinned -->` is this builder's choice of boundary, not the row's | A keep it, since the recompute command in the header anchors on it exactly · B a fixed line count · C a second frontmatter fence | A, because a line count goes stale the moment the header is reworded |

## Scope

`git diff --name-only 215351b6` is twelve paths, every one under `.sdlc/`, this handoff among them. No file outside `.sdlc/` is touched. `.claude/docs/other/` is absent from the worktree and from every commit; `git ls-files | grep -c node_modules` prints `0`. The board was never staged.
