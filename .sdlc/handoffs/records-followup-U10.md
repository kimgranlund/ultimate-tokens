---
kind: handoff
plan: records-followup
unit: U10
branch: unit/rf-U10
written: 2026-09-20
pass: 1
---

# Handoff U10 records-followup · builder → reviewer

| Field | Value |
|---|---|
| Branch | `unit/rf-U10`, cut from `plan/records-followup` at `7b5ebd71`; revision 11 (`215351b6`) merged in fast-forward before any edit, so the plan text measured against is the merged one |
| Worktree | `.worktrees/rf-U10` |
| BASE | `git merge-base origin/main HEAD` reads `3ce50daa`. `UB` is `215351b6` after the merge, `7b5ebd71` before it |
| Files | `.sdlc/baseline.md`, `.sdlc/debt.md`, `.sdlc/handoffs/records-followup-U4.md`, `.sdlc/handoffs/records-followup-U7.md`, `.sdlc/handoffs/records-refresh-U3.md`, `.sdlc/plans/archive/records-refresh-corrections.md`, `.sdlc/questions/records-followup-U9-board-seat.md`, `.sdlc/verdicts/records-followup-U4.md`, `.sdlc/verdicts/records-followup-U6.md`, `.sdlc/verdicts/records-followup-checkability.md`, the copied review `.sdlc/verdicts/records-followup-prepr-review.md`, and this handoff |
| Ran | `npm test` green, no `node_modules` · `sh .sdlc/checks/baseline-agrees-check.sh` exit 0 · branding clean · U4-1, U4-3, U4-5, U3-10 · P4, P5, P6, P7 |
| Left out | the prior-set rows and a set of legacy cut quotes outside what the review named; see Judged and left |

## The review copy

`cp` of the Lane B scratchpad file into `.sdlc/verdicts/records-followup-prepr-review.md`, byte for byte. `shasum -a 256` printed `e30720eb197f324c739cb2536d2de91f8d6037c4aad2a5ac877a80de9040c3b2`, the sha the brief states. Not reflowed, not corrected.

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
| 19 | ten appended `Correction (2026-09-20, plan records-followup U10, #709):` lines | one per edited record, in the shape the other corrected records on this plan use: `.sdlc/baseline.md:60`, `.sdlc/debt.md:131`, `.sdlc/handoffs/records-followup-U4.md:55`, `.sdlc/handoffs/records-followup-U7.md:48`, `.sdlc/handoffs/records-refresh-U3.md:170`, `.sdlc/plans/archive/records-refresh-corrections.md:37`, `.sdlc/questions/records-followup-U9-board-seat.md:42`, `.sdlc/verdicts/records-followup-U4.md:47`, `.sdlc/verdicts/records-followup-U6.md:79`, `.sdlc/verdicts/records-followup-checkability.md:177` | n/a |

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
| `.sdlc/baseline.md:56-58`, the prior set's three summary cells | they record a `d814500` run this unit cannot reproduce. Spanning them would mean copying a glyph from another record or re-deriving it from a source line at a sha `origin/main` no longer carries, both of which the rule forbids or weakens. The review named `:19` and `:20` and wrote that rows 21 to 23 are already spanned, so its own scope is the live table |
| legacy cut quotes of the runner's pass line in other touched records (`.sdlc/handoffs/records-refresh-U3.md:49` and `:57`, `.sdlc/verdicts/architecture.md:41`, `.sdlc/handoffs/records-refresh-U1.md` rows, `.sdlc/verdicts/survey.md:9` and `:23`) | pre-2026-09-19 lines the review did not name and no U10 criterion reaches. Restoring them moves figures inside criteria other units own (records-refresh U3-8 reads the handoff's run rows), so it is a finding for a later unit, not a silent widening here |
| `.sdlc/plans/records-followup.md` lines 42, 181, 185, 194, 195, 217, 218, 234, which quote defective spans unmarked | the plan file is the Conductor's, and the review's finding 3 routes plan text there. Revision 9 and revision 11 already work this ground |
| the plan's §Texts copy of the rule at `:175-177` | it is the pre-amendment wording of the expected-dash sentence, which `.sdlc/adapter.md:101` no longer reads. Reported, not edited: plan text |

## Criteria, measured against the committed tree

Filled in by the measurement commit that follows this one. Every command was run from a script file in the scratchpad, never nested one-line quoting.

| # | Criterion | Printed | Expected | Match |
|---|---|---|---|---|
| 1 | the handoff enumerates every edited line with a reprint command | the table above, 19 rows | same | pending |
| 2 | the fence sweep prints 0 at the head, the review's count before | pending | `0`, and `2` or `3` before | pending |
| 3 | U4-1, U4-3, U4-5, U3-10 re-run green | pending | pending | pending |
| 4 | `baseline-agrees-check.sh` exit 0, branding clean, `npm test` green | pending | pending | pending |
| 5 | no file outside `.sdlc/` moves | pending | `0` | pending |

## Scope

`git diff --name-only $UB` is eleven paths under `.sdlc/` plus this handoff. No file outside `.sdlc/` is touched. `.claude/docs/other/` is absent from the worktree and from every commit; `git ls-files | grep -c node_modules` prints `0`. The board was never staged.
