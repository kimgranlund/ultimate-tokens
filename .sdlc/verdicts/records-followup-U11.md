---
kind: verdict
plan: records-followup
unit: U11
seat: verifier
grade: verifier-l2
pass: 4
written: 2026-09-20
---

# Verdict records-followup U11 · 🔴 pass 4 · 7 🟢, 0 🟡, 1 🔴 (pass 3: 7 🟢, 2 🔴; pass 2: 17 🟢, 1 🔴; pass 1: 9 🟢, 1 🟡, 2 🔴)

verdict: 🔴
sha: f615f5739ca7acd62e3b4fdb9cb29be0df40cc80

| Graded at | `unit/rf-U11` @ 089e0e44, BASE 1f991877, plan text from `origin/main` at revision 17 |
|---|---|
| Legs | this seat's own runs, at grade l2, which matches this seat's own model and effort |
| Shape check | `scripts/verdict.py check` on the handoff, on the reviewer record and on `roadmap.md --against` its BASE copy: warnings only (`table without a control column`), exit 0 on all three. No file is unchecked evidence |

The unit repairs three of the four pre-land reds and adds a criterion that genuinely catches all four.
Two rows are 🔴. One is a new false assertion of the same class R3 was, which the new criterion
certifies rather than catches. The other is a live-facts exemption claimed against the wrong commit.

## Criteria

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| R1 | the #713 gating claims re-derived from that plan's own state | 🟢 | `roadmap.md:49` now reads `already building, not waiting: six of its seven units are merged or in flight ... only U6b still needs #681 on main`. `git show plan/gate-split:.sdlc/plans/gate-split.md` gives 7 checklist rows, `[x] U1 [~] U2 [~] U3 [~] U4 [~] U5 [x] U6a [ ] U6b`: six started, two merged, U6b alone waiting. The handoff's two corrections to the dispatched times hold on my own `git log`: `50898d58` 19:54:46Z is the U6a merge and `bf82ab11` 19:55:04Z the checklist tick, `7852ff12` 20:52:48Z the G0 waiver, `7d811172` 21:35:09Z the dispatch. My own pre-land record said `U6a merged bf82ab11`; the builder is right and that record was imprecise | the criterion run unmodified at `3ee3c72b` prints `gateclaims 2` beside `plan gate-split ... started=6`; at the fix head `gateclaims 0`. The same read at `ebddc55d`, 65 s before the dispatch, shows all of U2 to U5 unstarted, where the retired claim would have been true |
| R2 | the header counts recomputed from the table | 🟢 | leg A at the fix head prints `rows 13`, `partsum 13 total 13`, `inputs 13`, and `pri (p) 5 / P1 4 / P2 2 / P3 2` summing to 13. `roadmap.md:7` now reads `(13 issues)` | the same leg unmodified at `3ee3c72b` prints `rows 13` against `partsum 10 total 10` and `inputs 10`, the shipped defect |
| R3 | the file agrees with itself about this plan's unit tally, and does not call a unit 🟢 before it was graded 🟢 | 🔴 | the two rows now agree, at `:31` and `:47`, on `ten of eleven units 🟢`. That number counts merge ticks, not verdicts. Of the ten `[x]` units, nine carry a 🟢 verdict and one does not: `.sdlc/verdicts/records-followup-U5.md` reads `verdict: 🟡` and titles itself `🟡 11 🟢, 1 🟡, 0 🔴, 1 ⚪`. So the true tally is nine of eleven 🟢, with U5 🟡. R3's original defect was `:47` counting U5 as 🟢 before U5 was graded 🟢; U5 has since been graded, 🟡, and both rows still call it 🟢. The number changed, the false predicate about the same unit did not | derive the tally from verdict headlines instead of ticks: `[x]` count 10, 🟢-verdict count 9. The two sources disagree by exactly U5. `.sdlc/board.md`'s U5 row does show 🟢, and its own notes cell reads `11 🟢 1 🟡 0 🔴`, so the board contradicts itself and the adapter makes the verdict authoritative, not the board. Reconciling the board is the Orchestrator's, not this unit's |
| R4 | the refresh's stated method re-derived from its own diff | 🟢 | `roadmap.md:115` now states it was not a re-read and was a three-row patch. My own measurement of `3ee3c72b`: `4 0 .sdlc/roadmap.md`, two `@@` hunks at `--unified=0`, committed `2026-09-20T14:59:23-07:00`. The retired instant is quoted with the `cited:` marker in an adjacent span, which is the form `adapter.md` §3 ratifies | leg B unmodified at `3ee3c72b` prints `line 115 commit 3ee3c72b ... added 4 deleted 0 hunks 2 filelines 129 reach 0% instant 2026-09-20T22:00Z`; at the fix head no such line survives, only the regeneration's `reach 41%` with no instant. Diff reach discriminates, so leg B does not always fire |
| U5-8 | the proposed assertions criterion | 🟡 | I extracted both legs verbatim from the handoff's fenced blocks and ran them as scripts. At the fix head they print exactly what the handoff records, span for span. Run unmodified in a throwaway clone at `3ee3c72b` they red all four: R2 on the count triple, R1 on `gateclaims 2`, R3 on two stated tallies matching no derived one, R4 on the `reach 0%` line. That is a control on a defect that actually shipped, which is stronger than a mutation. Two gaps keep it from 🟢. It derives unit tallies from `[x]` ticks, so at the fix head it prints `stated ten of eleven units` matching `merged-tally=ten of eleven units` and certifies R3's new false claim. And without the plan branches fetched it degrades to `noplan` | I ran leg A in a clone with the plan branches absent: `plan gate-split noplan`, losing the `started=6` corroboration, while `gateclaims 2` still fired. So the degradation is partial, not total, but it is silent. The handoff flags the fetch requirement to the Orchestrator; it does not flag the tick-versus-verdict source |
| U5-1 | one head sha, on main | 🟢 | one sha, `5f2c3787`; `git merge-base --is-ancestor` gives `anc 0` | the `d34b4fb1` copy yields two shas and git exits `fatal: --is-ancestor takes exactly two commits` |
| U5-2 | the worktree table is the live set | 🟢 | `diff` prints no lines | against the `d34b4fb1` copy the diff prints the stale entries, `638-dual-radix` and `672-citation-predicate` among them |
| U5-3 | the stated worktree count is the row count | 🟢 | `7`, then `7` | the `d34b4fb1` copy states `8` with no row matching the current format |
| U5-4 | one ranked row per open issue, none for a closed one | 🔴 | `diff` prints `14d13` with `< 722`, exit 1. The handoff grades this 🟡 under the plan's live-facts rule, anchored on the landing refresh `3ee3c72b` at 21:59:23Z. That is the previous unit's commit. The rule reads `created after the unit's commit time`, and #722 was created `2026-09-20T22:12:36Z`, which is before every commit on `unit/rf-U11`: the three roadmap-touching ones are `1fe53f5a` 22:16:57Z, `354c2d7f` 22:28:25Z and `1405ee77` 22:40:32Z, and the head is 22:49:03Z. The handoff's sentence `after every commit on this branch` is false as written. With the right anchor the exemption does not apply and the row is 🔴 | the exemption does apply to the three rows the refresh added: #718 21:45:38Z, #719 21:53:29Z, #721 21:57:04Z all precede those same commits and all have rows. So the rule is not being read as never exempting anything; #722 alone fails it |
| U5-5 | no unanswered prompt is left | 🟢 | `0`, then `0` | the `d34b4fb1` copy prints `1` leftover prompt |
| U5-6 | the alone rule, under bash | 🟢 | `nonempty 0`; five roadmap-touching commits above BASE whose united file list is `.sdlc/roadmap.md` alone; branch file list is the roadmap, the two unit handoffs and the questions file, four paths, all under `.sdlc/` | run in this seat's default zsh the loop dies with an ambiguous-argument error, which is revision 15's recorded case; under bash it prints the single path |
| U5-7 | debt ids as `debt.md` defines them | 🟢 | `0`, then `1` | the `d34b4fb1` copy gives `1`, then `0`, the exact inverse |
| P1 | `npm test`, no `node_modules`, tree byte-stable | 🟢 | clean clone at 089e0e44, foreground, once: `✓ all 48 test files passed`, exit 0, 130 s wall, `TESTS` length 48, `git status --short` 0 after. Load 10.32 before, 15.02 after | the P4 plant below reds this same run, since `repo/branding.mjs` is one of the 48 |
| P4 | branding gate, which scans `.sdlc/` | 🟢 | `branding: clean (508 files scanned)`, exit 0, read unpiped | a records doc copied to `.sdlc/plant.md`: `FAIL: 3 branding violation(s) across 509 files`, exit 1. Planted inside `.sdlc/`, so it proves the gate reaches this branch's own directory |
| P5 | scope wall | 🟢 | zero paths outside `.sdlc/`; four paths total; `git ls-files \| grep -c node_modules` is `0` | U5-6's list is the same measurement from the other direction |
| P6 | no em dash added in prose | 🟢 | `0` | one em dash appended to the roadmap in the clone: `1` |
| P7 | baseline agrees with the tree | 🟢 | `stale total: 0`, exit 0 | the baseline test figure bent to 47: `STALE tests: baseline 47, test/run.mjs TESTS 48`, `stale total: 1`, exit 1 |

## The two 🔴, stated once

R3 is not a wording slip. The unit was asked to stop the roadmap calling a unit 🟢 that no verdict
graded 🟢. It changed `ten of ten` to `ten of eleven`, which fixes the arithmetic and leaves U5 counted
as 🟢 against a verdict file that says 🟡. The new criterion then reports agreement, because it derives
the tally from merge ticks in the plan checklist. A merge tick records that the Orchestrator merged the
unit; a verdict records whether it was graded. U5-8 re-derives the number and not the predicate, so it
converts a visible contradiction into an invisible one. That is worth fixing before U5-8 is folded in,
and it is a different point from the reviewer's findings 1b, 2, 3, 4 and 6, none of which names the
source of the tally.

U5-4 is a rule read against the wrong commit. Anchoring the live-facts exemption on the previous unit's
refresh rather than on this unit's own commits is what turns the row 🟡. Every U11 commit postdates
#722 by between four and thirty seven minutes.

## Not evidenced

Nothing. Every row above has a measurement this seat ran and a control this seat ran. The builder's
handoff and the reviewer's record were read as claims throughout; where they agree with my runs I say
so, and the two places they do not are the two 🔴.

## Pass 2, at `ddfedb70`

Regraded the two 🔴 of pass 1 and everything the three new commits move. Both pass 1 reds are
repaired. One new 🔴 replaces them, in the criterion rather than in the roadmap.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| R3 | the tally reads the verdicts, not the ticks | 🟢 repaired | `:31` and `:48` both read `nine of eleven units 🟢, U5 🟡`, with U11 named in progress. That is the record: nine units carry a 🟢 verdict (U1, U2, U3, U4, U6, U7, U8 as `green-with-one-note`, U9, U10), U5 carries `verdict: 🟡`. I counted both sources myself | deriving from ticks instead gives ten, which is the pass 1 defect. The two sources differ by exactly U5, so the row now names the source that makes it true |
| U5-4 | one ranked row per open issue | 🟢 repaired | `#722` is ranked at row 14; `diff` against live `gh` prints nothing, exit 0. Counts moved together: `inputs 14`, `total 14`, `rows 14`, and the breakdown `0 + 4 + 2 + 2 + 6` sums to 14 | pass 1's run of the same command printed `14d13` with `< 722`, exit 1. The anchor error was the Orchestrator's, not the builder's, and is withdrawn |
| U5-8 | the assertions criterion | 🔴 | the new verdict classifier counts a 🔴 verdict as 🟢. It selects the first line matching either the title or the `verdict:` field, then tests 🟢 before 🟡 and 🔴, so any verdict whose title precedes its `verdict:` field and carries a state breakdown classifies green. My own U11 verdict is exactly that shape: title `# Verdict records-followup U11 · 🔴 9 🟢, 1 🟡, 2 🔴`, selected, matched on the 🟢 inside the breakdown, counted green. So leg A prints `green=10 yellow=1 red=0 ungraded=0` for this plan when the truth is nine green, one yellow, one red | the same file with `verdict:` moved above the title classifies `RED`; unmoved it classifies `GREEN`. Identical content, opposite grade, decided only by line order. Run as an isolated function on two copies, touching no checkout |
| U5-8 consequence 1 | the criterion reds a true statement | 🔴 same row | `green-tally=ten of eleven units` against the roadmap's true `stated nine of eleven units 🟢`. By the row's own Expected every stated tally must equal a derived one, so the criterion fails at its own fix head | the builder measured `green=9 ... ungraded=1` at 16:02 to 16:05, which was correct then: my verdict reached main at 16:08:42, after. The drift is live facts; the misclassification that followed is not |
| U5-8 consequence 2 | NC7, the control named for this pass, stops biting | 🔴 same row | I reverted the tally to `ten of eleven units 🟢`, the exact text U11 shipped at `089e0e44` and that pass 1 graded 🔴, and reran leg A in a clone. It printed `stated ten of eleven units 🟢` against `green-tally=ten of eleven units`: equal, so the control passes the defect it exists to catch | with the classifier correct the same mutation gives `green-tally=nine of eleven units` and bites, which is what the handoff records from its own earlier run |
| U5-1 | one head sha, on main | 🟢 | one sha, `anc 0` | pass 1's `d34b4fb1` fixture gives two shas and a git fatal |
| U5-2 | worktree table is the live set | 🟢 | `diff` prints nothing | the `d34b4fb1` copy diffs with stale entries |
| U5-3 | stated worktree count is the row count | 🟢 | `7`, `7` | the `d34b4fb1` copy states `8` with no matching rows |
| U5-5 | no unanswered prompt | 🟢 | `0` | the `d34b4fb1` copy prints `1` |
| U5-6 | the alone rule, under bash | 🟢 | roadmap-touching commits unite to `.sdlc/roadmap.md` alone; branch is four paths, all under `.sdlc/` | in zsh the loop dies with an ambiguous-argument error, revision 15's case |
| U5-7 | debt ids as `debt.md` defines them | 🟢 | `0`, then `1` | the `d34b4fb1` copy gives the exact inverse |
| leg B | the read claims | 🟢 | two lines, both the regeneration commit, `reach 41%`, no instant. No patch-claiming-a-read survives | at `3ee3c72b` the same leg prints the `reach 0%` line with the 22:00Z instant |
| `ddfedb70` | quoted line numbers re-measured | 🟢 | `114` to `115`, `116` to `117`, `131` to `132`. My own leg B run prints `line 12` and `line 115`, which matches | the pre-#722 numbers no longer resolve, since the row shifted the revision log by two lines |
| housekeeping | the pass 1 verdict is off the branch | 🟢 | only `.sdlc/handoffs/records-followup-U11.md` matches that name on the branch; `.sdlc/verdicts/records-followup-U11.md` is not in the tree at `ddfedb70`. Branch is four files | `git add -A` now cannot pull a main-only record onto the branch |
| housekeeping | the U5 board row | 🟢 | the notes cell now says the row's 🟢 is the checklist state and states `verdict 🟡 overall`. Its claim that the board has no 🟡 mark holds for state cells: I censused them and found only 🟢, 🔵 and the header. The file does carry 🟡 seven times, all in notes | the state cell is still 🟢 where the verdict is 🟡, now disambiguated in prose rather than by the mark. That is the Orchestrator's file and its call |
| P1 | `npm test`, no `node_modules`, tree stable | 🟢 | clean clone at `ddfedb70`: `✓ all 48 test files passed`, exit 0, `TESTS` 48, status 0 after | the P4 plant reds the same run |
| P4 | branding | 🟢 | `branding: clean (508 files scanned)`, exit 0 | plant inside `.sdlc/`: `FAIL: 3 branding violation(s) across 509 files`, exit 1 |
| P5 | scope wall | 🟢 | zero paths outside `.sdlc/`, four total | U5-6 is the same measure from the other side |
| P6 | no em dash added | 🟢 | `0` | one appended: `1` |
| P7 | baseline agrees | 🟢 | `stale total: 0`, exit 0 | figure bent to 47: `STALE tests`, exit 1 |

### The one 🔴, stated once

The unit exists so the roadmap cannot call a unit 🟢 that no verdict graded 🟢. Pass 2 moved the
tally to the verdicts, which is the right source. The reader it added then classifies a 🔴 verdict
as 🟢, on the first record it was handed that has a state breakdown in its title: the verdict on
this very unit. Two things follow and both are worse than the miscount. The criterion now reds the
roadmap's true sentence, and NC7 passes the false one. A check that grades a red as green is the
defect the check was written to prevent, and it is in the check rather than in the artifact.

The artifact is clean. R1, R2, R3 and R4 are all repaired and all four hold under my own runs.
Nothing in `.sdlc/roadmap.md` at `ddfedb70` is false as far as I can measure it.

One last measurement, on this record. Its own title line precedes its `verdict:` field and carries a state breakdown, so the criterion as written at `ddfedb70` classifies this 🔴 verdict as GREEN. I ran it to check. The check cannot read the verdict that fails it.

## Pass 3, at `698e8916`, grade verifier-l3

Scope reduced by owner ruling R14, which I verified rather than took on the message: owner-chosen in
the tracked `.sdlc/questions/standing-rulings-2026-09-20.md` at `13f46583`, recorded as plan revision
19, ticket #723 open. U5-8 is not adopted and is not graded here. Only R1 to R4 and the gates.

Two legs: this seat's own runs, and a `verifier-l3` worker dispatched in fresh context, fable, a
different model family from this seat and from the builder. Its tables are at
`/Users/kimba/.claude/jobs/05defd58/tmp/u11-verifier-p3/verdict.md`. We disagreed on two rows. It was
right on one and I have adopted it; on the other I grade harder than it did and say why.

`698e8916` changes the handoff only. `.sdlc/roadmap.md` is byte-identical to `ddfedb70`.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| R1 | the `#713` gating claims match that plan's own state | 🟢 | `:50` reads `already building, not waiting: six of its seven units are merged or in flight ... only U6b still needs #681 on main`. `plan/gate-split`'s own checklist is `[x] U1 [~] U2 [~] U3 [~] U4 [~] U5 [x] U6a [ ] U6b`: six started, two merged, U6b alone waiting. The `#681` cell on the same table says `six units deep on .git-worktrees/pif-u*`, and six such worktrees are live | at `ebddc55d`, 65 s before the dispatch, the same read gives two of seven started and none in flight, where the retired claim would have held. Both legs agree |
| R2 | every count the file states is true of what it names | 🔴 | the internal arithmetic is sound: `rows 14`, `total 14`, `partsum 14`, `inputs 14` all agree, which is what I checked first and wrongly stopped at. The line does not only state a count, it names the commands it came from: `gh issue list --state open (14 issues), gh pr list --state open (1 PR)`. Both figures are false. Open issues are 15: `#723` has no ranked row, created `23:24:11Z`, four minutes before the unit's last commit `698e8916` at `23:28:12Z`, a commit whose own text cites `#723` three times, so the unit knew of it and did not rank it. Open PRs are 2, `#720` and `#158`; `#158` has been open since `2026-06-30`, so `(1 PR)` was already false when the roadmap was last written at `66d40f70` and at every U11 commit | the worker's run and mine agree on 15 and 2. The exemption is not vacuous: `#718`, `#719`, `#721` and `#722` all have rows, and `#723` is the only open issue without one. The PR half needs no rule at all, since `#158` predates the whole plan |
| R3 | the unit tally is read from the verdicts | 🟢 | `:31` and `:48` read `nine of eleven units 🟢, U5 🟡`, with U11 named in progress and never called green. Derived independently: nine green (U1, U2, U3, U4, U6, U7 by headline, U8 `green-with-one-note`, U9, U10), U5 `verdict: 🟡`, U11 `verdict: 🔴`. Eleven accounted for | deriving from `[x]` ticks instead gives ten of eleven, which is pass 1's graded defect. The two sources differ by exactly U5. Both legs agree, and the worker resolved the six field-less records the same way I did |
| R4 | the revision line states what its commit did | 🔴 | the three headline figures are right and I verified each: `4 0` on `git show --numstat`, two hunks at `--unified=0`, committed `21:59:23Z`. Two further assertions in the same line are false. It says the first hunk carries the stale `Count:` line `as untouched context directly above the three rows`: at `--unified=0` the hunk has zero context lines, and `Count:` is at line 25 while the rows land at 39, with a blank line, the table header, its separator and all ten then existing ranked rows in between, so it is neither context nor directly above; it is git's section-heading text in the `@@` header. It then says the three defects were `all of them repaired by U11 at 1fe53f5a`: the tally was still wrong at `1fe53f5a`, which is the `ten of eleven` text pass 1 graded 🔴, and was not repaired until `66d40f70` | `git log -S'nine of eleven units'` names `66d40f70`, not `1fe53f5a`. The same line's figures fail against `7dde8cb1` (54 added, 52 deleted, 18 hunks), so the check discriminates between commits rather than always passing. The worker graded this 🟡 on the same two findings; I grade it 🔴 because the false clause is a provenance claim, and a line whose whole purpose is to state accurately what a commit did now misstates which commit repaired what, erasing a graded failure from the record |
| P1 | `npm test`, no `node_modules`, tree stable | 🟢 | clean clone at `698e8916`: `✓ all 48 test files passed`, exit 0 captured directly, 105 s wall, TESTS 48, status 0 after. Load 10.53 before, 9.41 after. The worker measured the same at 103 s | the P4 plant reds the same run, since `repo/branding.mjs` is one of the 48 |
| P4 | branding, which scans `.sdlc/` | 🟢 | `branding: clean (508 files scanned)`, exit 0 under pipefail | a records doc planted inside `.sdlc/`: `FAIL: 3 branding violation(s) across 509 files`, exit 1. Both legs planted inside `.sdlc/`, so the gate is shown to reach this branch's own directory |
| P5 | scope wall | 🟢 | zero paths outside `.sdlc/`, four in total, `node_modules` untracked | I planted a file under `src/ui/` and the outside count went to 1. The worker ran three probes, in `motion.mjs`, the roadmap and `CLAUDE.md`, each biting |
| P6 | no em dash added in prose | 🟢 | `0` | one appended to the roadmap in a clone: `1`. The worker also ran a fixture separating the stripped and unstripped counts, `3` against `4` |
| P7 | baseline agrees with the tree | 🟢 | `stale total: 0`, exit 0, with the `note head:` line printed and not counted | the baseline test figure bent to 47: `STALE tests: baseline 47, test/run.mjs TESTS 48`, exit 1 |

### The two 🔴, and a correction to my own grading

R2 is the one I got wrong first. I checked that the file's counts agree with each other, found `14`
four times, and called it repaired. The line does not only state a count, it names the two commands
it came from. Neither figure is what those commands return, and the PR figure was false before U11
began. Testing a file's internal arithmetic instead of the claim it makes about the world is exactly
the shape-not-assertions error this unit exists to repair, and I made it while grading the repair.
The worker caught it. Its anchor is also better than mine: I measured against the roadmap's
last-touched commit, it measured against the unit's last commit, and the plan's rule says the unit's.
That the commit in question cites `#723` itself settles the point.

R4 keeps a true headline and two false details. Both are about provenance, which is the one thing
that line exists to get right. The hunk-shape clause is loose. The repair-attribution clause is not
loose, it is wrong, and it is wrong in the direction that makes the record look cleaner than the
history: it credits `1fe53f5a` with a repair that commit did not make and that a verdict graded 🔴.

R1 and R3 are sound, and the gates are green on both legs with controls that fired on both.

### One trap worth recording

Local `main` is two commits ahead of `origin/main` here (`27ec4606` against `13f46583`), because
these records are committed locally and not pushed. Every derivation above reads `main`. I first read
`origin/main`, where this very verdict file is 9887 bytes and carries pass 1 only, and would have
written pass 3 on top of a copy with pass 2 missing. The unit tally comes out nine either way, so no
row changes, but a seat that grades records from `origin/main` on this machine is reading a stale
tree. That belongs with ticket #723, since it is the same class: a record asserting something about
other work, checked against the wrong source.

### Addendum, after the worker's full table

Three items, none of which moves a grade.

The gap in R4's first false clause is ten ranked rows, not three. I counted the region between the
`Count:` line and the insertion point directly at `3ee3c72b`: a blank line, the table header, its
separator, then rows 1 to 10. The worker's table put it at three untouched rows, which is its own
miscount; the finding it supports is unaffected and stands.

Two observations the worker raised outside this pass's scope, both of which I confirmed and neither
of which R14 puts in front of me. The roadmap's front matter reads `head: 5f2c3787 (origin/main)`;
that commit is still an ancestor of both `origin/main` and `main`, so U5-1 would pass, but `main` is
22 commits past it, and the stated head is U5's read instant rather than a current one. And
`unit/rf-U11` exists only on this machine: `git ls-remote --heads origin` returns no match for it
while `plan/records-followup-roadmap` is on GitHub, so the unit's commits are unpushed and CI cannot
see them.

## Pass 4, at `f615f573`, verifier only under ruling R15

R15 verified as R14 was, not taken from the message: owner-chosen in the tracked
`.sdlc/questions/standing-rulings-2026-09-20.md`, plan revision 21, main `66f05005`. Its Effect makes
this a verifier-only pass on R2 and R4 against live `gh` and `git` rather than against the file, with
the four edits made as one roadmap-only commit. `f615f573` touches `.sdlc/roadmap.md` and nothing
else, and the branch is still four files.

R1 and R3 are not regraded, per the dispatch. Both were 🟢 in pass 3.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| R2 | the figures the `inputs:` line names are what those commands return | 🟢 | the line now reads `gh issue list --state open (15 issues), gh pr list --state open (2 PRs)`. I ran both: 15 and 2. The open-issue set diffs against the ranked rows with exit 0, no difference, so `#723` is ranked and nothing is orphaned. It sits at rank 7 and ranks 7 to 14 shifted to 8 to 15 exactly as claimed, which I checked row by row against `698e8916`. `Count:` reads `total 15` with `P2` 3, and `partsum 15 = total 15 = rows 15` | the same two checks against the previous head `698e8916`: it states `(14 issues)` and `(1 PR)`, and the issue diff exits 1 printing `15d14 < 723`. The check discriminates between the two heads |
| R4 | the revision line describing the landing refresh states what commit `3ee3c72b` did | 🟢 | both clauses pass 3 red are gone and the replacements are right. The `Count:` line is now described as git's section-heading text in the `@@` header and not as content, with the blank line, header, separator and ten ranked rows named as the gap, which is what I measured. The repair credit now reads `across 1fe53f5a to 66d40f70, the tally not until 66d40f70`. `git log -S` confirms it: `ten of eleven units` first appears at `1fe53f5a`, `nine of eleven units` first appears at `66d40f70`, and `1fe53f5a` carries the `ten` text and none of the `nine`. The headline figures still hold: `4 0`, two hunks, `21:59:23Z` | the same figures fail against `7dde8cb1` (54 added, 52 deleted, 18 hunks), so the check distinguishes commits rather than always passing |
| the refresh's own revision row | 🔴 | `f615f573` adds a row describing itself, which is the same kind of claim R4 exists to police, and two of its statements are false. It says the roadmap was last written at `66d40f70` (`23:04:32Z`): `66d40f70` is at `23:02:56Z`, and `23:04:32Z` is `5cac5623`, a commit that does not touch the roadmap. It says `(1 PR)` was false `from the regeneration 7dde8cb1 onward, since #158 has been open since 2026-06-30`: at `7dde8cb1` (`21:36:16Z`) exactly one PR was open, `#158`, so the line was true there. It became false at `21:56:01Z` when `#720` opened, which is refresh 1 `3ee3c72b` onward, not the regeneration. The cited reason is also inverted: `#158` being long open is why the figure was true then, not false | counted open PRs at each of the four roadmap writes, with `#158` forced into the set because it predates a 300-PR window: `7dde8cb1` 1, `3ee3c72b` 2, `66d40f70` 2, `f615f573` 2. The transition is at refresh 1. The row's other claims do hold and were checked the same way: the 15 issue numbers it lists match live exactly, the rank shift is exact, `four edits and no other cell re-read` matches its five hunks, which touch only `:7`, `:25`, the ranked block and the two revision rows, and reach is 11 deleted of 133 lines, 8 percent, consistent with `Kind: patch` |
| P1 | `npm test`, no `node_modules`, tree stable | 🟢 | clean clone at `f615f573`: `✓ all 48 test files passed`, exit 0 captured directly, TESTS 48, status 0 after. Load 13.96 before, 8.77 after | the P4 plant reds the same run |
| P4 | branding, which scans `.sdlc/` | 🟢 | `branding: clean (508 files scanned)`, exit 0 under pipefail | a records doc planted inside `.sdlc/`: `FAIL: 3 branding violation(s) across 509 files`, exit 1 |
| P5 | scope wall | 🟢 | zero paths outside `.sdlc/`, four in total | a planted file under `src/ui/` takes the outside count to 1 |
| P6 | no em dash added in prose | 🟢 | `0` | one appended to the roadmap in the clone: `1` |
| P7 | baseline agrees with the tree | 🟢 | `stale total: 0`, exit 0 | the baseline figure bent to 47: `STALE tests: baseline 47, test/run.mjs TESTS 48`, exit 1 |

### The 🔴, and a correction to my own pass 3 record

R2 and R4 are both repaired and I grade them 🟢. The red is a new claim the repairing commit
introduced about itself. That is the pattern this unit has produced four times now: the edit that
fixes a false assertion adds a fresh one in the sentence describing the fix. It is not a reason to
reopen R2 or R4, and it is one row, but the dispatch said to red anything that reds.

The `(1 PR)` half is also a correction to me. My pass 3 record says `#158 has been open since
2026-06-30, so that half was never true on this branch`. That is wrong in the same direction as the
row I am reding. `(1 PR)` was true at the regeneration `7dde8cb1`, where `#158` was the only open PR,
and became false when `#720` opened at `21:56:01Z`. What pass 3 established stands, since the figure
was false at `66d40f70` and at every U11 commit, but my stated reason was the inverted one and the
Orchestrator's row appears to have inherited it from my record. Both should be read with this
paragraph.
