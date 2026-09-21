---
kind: census
plan: records-followup-roadmap
branch: plan/records-followup-roadmap
head: ee854932e2b03da92c17f666a63c60a5d3fc89b5
merge-base: 1f991877
seat: verifier
date: 2026-09-20
---

# Citation census, plan/records-followup-roadmap @ `ee854932`

> **Model-independence label, owner ruling R17.** Every seat that produced evidence in this census ran
> `verifier-l2`, which is opus at high effort: the same model and effort as the verifier seat that
> commissioned it and wrote this record. The cross-model independence a fable-graded seat would have
> supplied is absent here. The fable allowance was spent partway through, and the one leg dispatched at
> `verifier-l3` returned nothing but the limit message; it was re-dispatched at l2 in two halves. Read
> every row below as opus checking opus. The existence half is unaffected, being command output rather
> than judgment, and I re-derived each failure below myself before recording it.


Asked for by the Orchestrator before U13 commits: bound the set rather than add another increment.
The branch changes five files, not four. `.sdlc/questions/roadmap-2026-09-20.md` is the fifth and it
carries citations too.

## The shape, stated first

696 citation-shaped tokens, which deduplicate to 132 distinct targets. Those split into two halves
that cost very different amounts to check, and only one of them is where the failures live.

| half | size | what it asks | cost | state |
| --- | --- | --- | --- | --- |
| existence | 132 distinct targets | does the thing cited exist and resolve | one script, minutes | complete, below |
| attribution | 102 sentences | does the cited thing say what the sentence attributes to it | read both sides of each | in flight, three seats |

The reason passes 1 to 3 each dug deeper is visible in that split. Of the seven failures found so far,
existence catches exactly one. The other six cite a target that exists and is perfectly resolvable,
and say something about it that is not true. No sweep over identifiers can find those; each one costs
a read of the source next to the sentence.

## Existence half, complete

| class | distinct | resolve | fail | note |
| --- | --- | --- | --- | --- |
| commit shas | 50 | 49 | 0 | 49 are real objects. The 50th, `688f1a9b5631`, is a content checksum, not a sha, and it is exact for the rulings file at `5f2c3787`, `712e63db` and `ee854932`. |
| issue and PR ids | 38 | 38 | 0 | 17 open issues, 11 closed issues, 10 merged PRs. Existence only; the state each row asserts is an attribution claim and is in the other half. |
| `R<n>` ids | 13 | 12 | 1 | the failure is `roadmap.md:117` `owner ruling R5`, already recorded as A11. |
| file paths | 31 | 29 | 1 | 1 template (`.sdlc/verdicts/<plan>-<unit>.md`). The failure is new, below. |
| TOTAL | 132 | 128 | 2 | plus 1 template and 1 checksum |

### New in this census

`.sdlc/handoffs/records-followup-U11.md` cites `.sdlc/runtime/rf-U11-review.md` twice, in the
`review:` front matter at `:11` and in prose at `:434`. That path exists on no ref, in no commit in
any history, and on no disk. The record it means is real and tracked: it is
`.sdlc/verdicts/records-followup-U11-review.md`. Worse than a typo, `.sdlc/runtime/` is gitignored,
so a path under it could never resolve for any reader of the repository even if a file were sitting
there locally. Call it A16.

### A structural risk the census surfaced

`R<n>` is an overloaded identifier on this branch. It means a standing ruling in
`.sdlc/questions/standing-rulings-2026-09-20.md` and it means a debt row in `.sdlc/debt.md`, and both
namespaces appear in `roadmap.md`, twice on the same line at `:83`. My first sweep graded `R5` and
`R6` as failures because it resolved both against the rulings file. `R6` and the `:60`, `:83`, `:107`
uses of `R5` are debt rows and all twelve debt ids resolve; only `:117`'s `owner ruling R5` is a real
failure. An identifier that needs its prose context to say which register it belongs to cannot be
checked mechanically, by me or by anything `#723` builds.

## Attribution half, in flight

102 sentences, split three ways by file, each seat reading both sides of every claim and returning
holds, fails and unresolvable with the command that decided each:

| seat | file | claims |
| --- | --- | --- |
| `census-roadmap` (l3) | `.sdlc/roadmap.md` | 46 |
| `census-u11` (l2) | `.sdlc/handoffs/records-followup-U11.md` | 27 |
| `census-u12` (l2) | `.sdlc/handoffs/records-followup-U12.md` plus `.sdlc/questions/roadmap-2026-09-20.md` | 22 |
| mine | `.sdlc/handoffs/records-followup-U5.md` | 7 |

Each was given the known failures in its file so it confirms rather than rediscovers them, the live
facts rule with the branch head's commit time, the `R<n>` namespace split, and the two measurement
traps that cost me three wrong calls in pass 3: `git log -1 -- <path>` does not answer when a line
entered a file, and a commit count is traversal-sensitive and must be capped at the claiming
document's own commit time before it is called wrong.

Totals land in this file when all four legs are in.

## Leg 4 of 4, mine: `.sdlc/handoffs/records-followup-U5.md`

10 claims followed, 8 hold, 1 fails, 1 unresolvable.

| line | claim | target | state | decided by |
| --- | --- | --- | --- | --- |
| :5 | cut from `origin/main` @ `1f991877` | the branch point | HOLDS | `git merge-base plan/records-followup-roadmap main` returns `1f991877` |
| :6 | commit 1 touches `.sdlc/roadmap.md` alone | `7dde8cb1` | HOLDS | `git show --stat` shows 1 file, 54 insertions, 52 deletions |
| :7, :9 | commit 2 touches the handoff and the questions file | `ee28fff6` | HOLDS | `git show --stat` shows exactly those two |
| :40 | after commit 2 `git diff --name-only $BASE` reads those two paths | itself | HOLDS | the same stat; the self-describing claim matches its own commit |
| :53 | `#673` closed `2026-09-18T22:32:34Z`, `#676` `2026-09-19T00:26:06Z`, `#672` `2026-09-19T15:15:22Z` | three issues | HOLDS | `gh issue view` returns all three to the second |
| :57 | eight tickets from the 09-18/19 roadmap closed since, five with PR and squash sha, three closed as completed | 8 issues, 5 PRs, 5 shas | HOLDS | all 8 appear in `git show 1f991877:.sdlc/roadmap.md`; all 8 CLOSED; the 5 squash shas exist and are ancestors of main; `#602`, `#519`, `#514` are `stateReason COMPLETED` with no PR |
| :58a | `per standing ruling R4: the other conductor session no longer touches this repo's plans` | rulings file | FAILS | R4 is `Conductor session mode` on every ref; the sentence sits under `## Earlier today, same channel`. This is A3. |
| :58b | `#713` has its own approved plan `gate-split`, gated on `#681` landing | `gate-split.md` | HOLDS | `status: approved`, `ticket: #713`, and `:10` `depends: #681 landed on origin/main`. This is A6. |
| :59 | `#496` parked: `plan/lane-b-tickets` unpushed, `au-U1` and `au-U3` built but `[!]`, commit message `#496 parked by the owner` | that branch | HOLDS | no `origin/plan/lane-b-tickets`; commit `a483151d` carries that subject exactly; `lane-b-tickets.md:19` and `:20` are the only two `[!]` rows on the branch and they are the adia U1 and U3 units the board maps to `unit/au-U1` and `unit/au-U3` |
| :61 | the `pif-u5-records` worktree carries 4 uncommitted paths, the other six are clean | seven working trees | UNRESOLVABLE | working-tree state at write time is not recorded anywhere and cannot be recovered. All seven read 0 changed now, so the claim is neither confirmable nor refutable. Not counted as a failure. |

Note on `:61`. Uncommitted-path counts are the one citation class on this branch that is structurally
uncheckable after the fact: nothing in git preserves what a working tree looked like an hour ago.
`roadmap.md:73` states the same kind of figure. Any future check of this class has to be made at the
moment of writing or not at all, which is worth carrying into `#723` as a constraint rather than a
defect.

## Leg 3, `census-u12`: one new failure, confirmed by me

`.sdlc/handoffs/records-followup-U12.md:27` states that for criterion 2 the `git diff --stat` reads
`1 file changed, 2 insertions(+), 2 deletions(-)` and `the word diff shows eight spans, all inside the
two sentences`. The stat half holds exactly. The span count does not.

`git diff --word-diff 712e63db 15cd3121` gives 6 removal spans and 5 addition spans, 11 in all, across
2 hunks. `--word-diff=porcelain` gives 11 word lines and `--word-diff-regex=.` gives 13. Nothing
counts to eight. The other half of the sentence, that every span sits inside the two repaired
sentences, holds: all 11 fall inside `roadmap.md:90` and inside the ownership sentence at `:116`.
Call it A17.

The mechanism is visible in the row itself. The same table row's control cell reads `the same pipeline
over 20298cca~1 20298cca printed 8`. That 8 is a count of non-`.sdlc` paths in an unrelated commit, and
it appears to have been carried across into the claim cell as a span count. A number lifted from the
adjacent control is a failure mode worth naming in `#723`: the control is supposed to be the thing that
catches a wrong claim, so a claim that borrows the control's figure defeats the control by construction
and will read as internally consistent to anyone checking the row against itself.

Everything else the seat graded in that file holds, including the two citation repairs U12 claims to
have made, which it verified are present at `ee854932` and actually resolve rather than merely being
asserted. One row is unresolvable: `:19` says everything was measured in `.worktrees/rf-U12`, and that
worktree was removed at `40de66b4`, so nothing readable attests where the commands ran. Totals for this
leg and the questions file are pending the seat's remainder; its report exceeded one message.

### Leg 3 totals, and my spot-checks of it

60 claims followed across the two files, 53 hold, 1 fails (A17), 6 unresolvable.

| file | followed | holds | fails | unresolvable |
| --- | --- | --- | --- | --- |
| `.sdlc/handoffs/records-followup-U12.md` | 50 | 44 | 1 | 5 |
| `.sdlc/questions/roadmap-2026-09-20.md` | 10 | 9 | 0 | 1 |
| both | 60 | 53 | 1 | 6 |

The six unresolvable are honest rather than evasive, and four of them are the same shape as my own
`:61` in leg 4: a claim about something git does not record. Two `npm test` runs with the exit code
read twice, a host load average during the unit, a harness timeout ceiling, the working tree of a
worktree since removed, and the option wording of an `AskUserQuestion` exchange. None of these has a
readable artifact anywhere, so none can be graded either way, and the seat reproduced the one leg of
them that was reproducible (a single `npm test` in a scratch clone, exit 0).

I spot-checked three of its holds against my own runs and all three reproduce exactly: `0eba2eee` was
main's head at `19:59:26-07:00` with the handoff written at `20:00:57-07:00` and main's next commit at
`20:01:38-07:00`, so it was current at the instant claimed; `Who owns what` names those four files on
main and exactly three lines on the branch, all inside the handoff; and the `:32` control does read 17
by line and 18 by occurrence.

That last one is the seat's own finding and it is worth keeping. The cell states a figure without
saying which metric produced it, and the two metrics disagree. It grades as holding only because the
positive side reads `0` under either metric, so the row never had to disambiguate. An unlabelled metric
in a control is a latent version of A17: it is a number that cannot be checked against anything until
the day the two metrics diverge on the positive side too.

The seat also swept its whole range for the A17 bleed pattern specifically and found no second
instance.

## Leg 1, `census-roadmap-a`: `.sdlc/roadmap.md` lines 1 to 75

94 claims followed, 74 hold, 18 fail, 2 unresolvable. The 18 failures collapse to 16 root causes,
because the `:7` inputs figure, the `:25` total and the `:25` unranked count are the single omission of
`#724` wearing three faces. Six of the sixteen were already known. Seven are new, and one of them
resolves a 🟡 I could not decide.

I re-derived every new failure myself before recording it. All seven reproduce.

| id | line | defect | my confirmation |
| --- | --- | --- | --- |
| A18 | :38 | the `#496` plan `adia-library-uplift` is cited as living on `plan/lane-b-tickets`, which does not carry it | the file exists only on `plan/adia-library-uplift`, `unit/au-U1` and `unit/au-U3`; `plan/lane-b-tickets` has zero adia plan files and its own plan says at `:19` and `:20` that those units use their own separate plan |
| A19 | :39 | `#701` is marked ready and `planned in parallel with #681 per standing ruling R3`, with the derived mark `(d)` | R3's text holds, but no `#701` plan exists on `main`, `plan/preset-intent-fidelity`, `plan/gate-split`, `plan/lane-b-tickets` or the branch. A ruling authorising a plan is not a plan, and `(d)` claims a git or gh fact that does not exist |
| A20 | :40 | the `#718` Title cell carries corrected wording, not the ticket's title | `gh issue view 718` still reads `cannot fail`; the legend treats Title as read from the ticket |
| A21 | :40 | `#718` `filed this session by the U5 verifier's rerun of P7` | the body ends `Found during #681 pre-land sync recon`, filed `21:45:38Z`; the U5 verifier's P7 rerun produced only the correction comment at `21:59:32Z`, 14 minutes later, and that comment signs off `Filed by the sdlc orchestrator seat`. This is my pass 3 A15, which I graded 🟡 for want of authorship evidence. The evidence exists and it is 🔴. |
| A22 | :42 | `#721` Kind reads `chore`, unmarked | its labels are `kind:feature,size:small`. Under the legend's own mapping a plain cell is read from a label, and no label says chore |
| A23 | :29-43 | the legend's marking contract is not applied across the table | six plain cells cite labels that do not exist (`#377` Size and Lane, and Lane on `#718`, `#719`, `#721`, `#722`), and fifteen legacy-label reads go unmarked while only `#496` and `#701` carry `(legacy)` |
| A24 | :31, :49 | the roadmap describes itself one unit behind its own head | `ee854932` is the `unit/rf-U12` merge, yet both cells call U11 `this unit` and name U11 as the only pre-land-fix unit on PR 2. U11 merged earlier at `539f0435` |

### The self-pin, which holds and still matters

`head: 5f2c3787 (origin/main)` at `:6`, `:12` and `:64` was true at the writing commit `7dde8cb1`
(14:36:16) and false by 14:38:06, two minutes later and 25 branch commits before `ee854932`. It grades
as holding because it is a dated statement of what was read. But every `ahead of main` figure in the
worktree table is measured against a ref that stopped being main almost immediately, which is the
mechanism behind A4 rather than a separate defect. Two further citations, standing ruling R14 at `:35`
and the rediagnosis plan at `:35`, resolve only at `origin/main` and not at the branch the roadmap
itself sits on. A document that pins itself to a ref and then cites things absent from that ref is
telling the reader to look in a place where the answer is not.

### A23 is the one that changes the shape of `#723`

Every other defect in this census is one false sentence. A23 is a contract the document states about
itself in its own legend and then does not keep, across roughly twenty cells. It is checkable
mechanically, unlike the attribution class, because the legend defines the mapping from label to cell.
That makes it the first defect here that `#723` could actually gate, and it argues the ticket wants a
legend-conformance check and not only a citation-following one.

## Leg 5, `census-u11`: `.sdlc/handoffs/records-followup-U11.md`

123 claims followed, 94 hold, 22 fail, 6 unresolvable. The largest and worst file on the branch.

### The instant correction, and what it was worth

The seat first graded this handoff against the branch head. It was last committed at `698e8916`,
`2026-09-20T16:28:12-07:00`, three and a half hours earlier. I sent it that instant and asked it to
regrade everything. **Fifteen rows moved from FAILS to HOLDS and not one moved the other way.**

That is the single most useful number in this census. Graded against the wrong clock this file would
have carried 37 failures instead of 22, and U13 would have been sent to repair fifteen sentences that
were true when written. The live-facts rule is not a leniency; it is the difference between a defect
list and a list of things that changed afterwards.

### A correction to my own A14

My pass 3 A14 said the handoff's `roadmap-commits:` front matter and its `Nine commits` prose were
both wrong, measured 14 and 7. I measured against the branch head. Measured against the handoff's own
last commit the front matter is exactly right: `1fe53f5a, 354c2d7f, 1405ee77, 66d40f70` are precisely
the four roadmap commits that existed at `698e8916`. The prose still fails, at 11 commits and 7
handoff commits rather than nine and five, and its `four of them roadmap-only` half holds. A14 narrows
to one wrong sentence and my figures for it were wrong too. This is the fourth time in this plan that
I have used the branch head where the artifact's own commit was the right clock.

### The 22, by kind

**Never true at any instant, 7.** Errors in the document's reasoning, not staleness:

| line | defect |
| --- | --- |
| :135 | quotes the retired line with the marker inside the quote span, which is the exact form the section is retiring |
| :146-148 | calls the `Count:` line untouched context directly above three rows; at `--unified=0` there is no context, `Count:` is git's section heading, and it sits 14 lines away |
| :347-349 | credits the `strictly narrower` correction to `b0003592`, whose message repeats the retired claim; the correction is `089e0e44`'s, which the handoff never names |
| :351-352 | says `#722`'s row shifted the revision log down by two lines; the numstat is `6 5`, net one |
| :356-357 | says the inline form is `not written anywhere in this repo` while the repo's only two instances are this handoff's own lines 135 and 340 |
| :434-435 | says the review is at a gitignored path and so enters no commit; it is tracked in `.sdlc/verdicts/` since `3f6f1ebf`, before this handoff's last commit. Both halves false |
| :111-112 | asserts both roadmap rows read `ten of eleven` and name U11 in progress, which the same file contradicts three paragraphs later |

**Stale before its own last commit, 12.** True when written, falsified by a commit that landed before
`698e8916` and never re-measured: the four R2 header figures at `:91` to `:98`, overtaken by
`66d40f70` 26 minutes earlier; leg A's `green=9` and its tally-agreement claim at `:276` and `:284-286`,
overtaken by U11's own pass-1 verdict reaching main 20 minutes earlier; the board self-contradiction at
`:123-125` and `:443`, disambiguated 20 minutes earlier; the roadmap-commit enumeration at `:382-385`
(six, not four); and the `Nine commits` prose at `:431-433`.

**The narrowest, `:376`.** Criterion U5-4's open-issue diff is reported clean. `#723` was minted at
`16:24:11-07:00`, four minutes before the handoff's last commit, and the cutoff roadmap has no row for
it. Four minutes is inside the line, so it fails, and I record the margin because a rule that convicts
at four minutes has to be applied the same way when it acquits at twenty-four.

**Two self-contradictions independent of any clock.** `:409` reports `git status --short` printed `0`
and `:444` reports it printed `1`, same gate and same worktree. And the two incompatible tallies above.

### What this file says about the class

Six of the seven never-true defects are statements the handoff makes about its own evidence: what a
diff contained, which commit carried a correction, whether a form appears in the repo, where its own
review record lives. The document is least reliable exactly where it describes itself, which is the
same pattern I recorded across U11 passes 3 to 6 and the two landing refreshes. `#723` should treat
self-description as the highest-risk category rather than an incidental one.

## Leg 2, `census-roadmap-b`: `.sdlc/roadmap.md` lines 76 to 134

97 claims followed, 89 hold, 7 fail, 1 unresolvable.

### A11 is withdrawn. The seat was right and I was wrong.

I graded `roadmap.md:117`'s `owner ruling R5` a 🔴 in pass 3 and put it in the Orchestrator's repair
list. It resolves. `.sdlc/questions/records-followup-U5-refresh.md` reads `Asked of the owner by the
Conductor on 2026-09-20, ruling R5 ... Chosen: U5-6 counts roadmap-only commits`, which is word for
word what `:117` attributes to it. And the standing-rulings file says why its own numbering skips R5
to R7: `Renumbered the same day from R5 to R7: the background seats had already recorded an owner
ruling as R5 for the roadmap PR`. The id was ceded deliberately. The standing-rulings namespace lacks
an R5 because this ruling holds it, not because the id is dead.

My error was structural, not careless. I found the second `R<n>` namespace (debt) after my first sweep
produced two false failures, corrected for it, and then stopped looking. There is a third: per-question
ruling files. `roadmap.md` uses all three, and `:107` and `:117` use two of them within ten lines.
Having been burned once by assuming one namespace, I assumed two.

That makes five self-corrections in this plan. The pattern across them is the same: I reach for the
nearest register that would resolve a citation, and stop when it does not.

### The five failures in this range, and one I grade differently

| line | defect | state |
| --- | --- | --- |
| :94 | the label repairs are routed through `adapter.py`, which has no verb that adds a `size:` or `P<n>` label to an existing ticket; its only label mutation is `--add-label status:*` inside `set-status`. The stated route cannot execute the table it introduces | 🔴 |
| :100 | `#496 needs a size: label added`; it has carried `size:big` since `2026-09-03T12:46:15Z`, seventeen days before the head. An earlier draft asked for `size:L` and the reword to a bare prefix made a true cell false | 🔴 |
| :118 | `Four assertion repairs, no ranked row added or dropped`, inside a revision that `66d40f70` shows adding `#722`'s ranked row, and contradicted by the row's own later clause | 🔴 |
| :118 | credits the assertions criterion with catching an arithmetic slip that the handoff and the review both credit to review finding 7; the criterion's R1 leg is a presence counter that cannot see the distinction | 🔴 |
| :107 | `go-live ... has no priority anywhere` is false of `#377`, which carries `P3` and is ranked `P3` in this file's own table | 🟡 |

`:107` I grade 🟡 rather than 🔴, against the seat's own 🔴, because the sentence is a verbatim carry of
the owner's still-open question and the seat established that itself. Transcribing a question
faithfully is not a citation defect; the false predicate belongs to the question. It should be
repaired where the question lives, and the roadmap cell should not be edited to disagree with the
question it quotes.

### The finding that outlives this plan

Four citations in this range resolve only off the branch: the U5 handoff, the U11 handoff, the U5
refresh question, and the pre-land record, the last of which is untracked everywhere and exists only
in a working copy. A reader who checks out `plan/records-followup-roadmap` and nothing else cannot
follow any of them. That is not a false claim and it is not on the repair list, but it is the reason
this whole class is expensive to check: the evidence for a branch's records is not on the branch.

## A17 re-checked under the anchor rule, and it stands

The builder raised, against its own work, that A17 might have been measured over a range the U12
handoff's own commit could not see. Correct question, and the answer is that it can.

`:27`'s claim column quotes no range; it quotes a stat, `1 file changed, 2 insertions(+), 2
deletions(-)`, and that stat pins the range uniquely. Every U12-era anchor gives the same stat and the
same span count: `15cd3121`, `0a30f287`, `52341dcc`, `4d054892` and `ee854932^2` all read 11 spans
over `.sdlc/roadmap.md`, 6 removals and 5 additions across 2 hunks. `15cd3121` is an ancestor of the
handoff's own commit, so the range is visible to it. No anchor in the unit's history produces eight.

A17 stands. Worth noting that this is the first time in the plan the anchor rule has been raised by
the seat whose own work it would have excused, and it is the right instinct even though it did not
change the grade.

## Census closed

383 claims followed across five files. 318 hold, 48 fail, 16 unresolvable, 1 withdrawn by me.

| leg | file | followed | hold | fail | unresolvable |
| --- | --- | --- | --- | --- | --- |
| 1 | `roadmap.md` :1-75 | 94 | 74 | 18 | 2 |
| 2 | `roadmap.md` :76-134 | 97 | 89 | 7 | 1 |
| 3 | `records-followup-U12.md` + `roadmap-2026-09-20.md` | 60 | 53 | 1 | 6 |
| 4 | `records-followup-U5.md` (mine) | 10 | 8 | 1 | 1 |
| 5 | `records-followup-U11.md` | 122 | 94 | 22 | 6 |

The 48 failures collapse to **45 🔴 and 1 🟡** distinct defects, because leg 1's eighteen include the
three faces of the `#724` omission.

### What the census settles

The set is bounded. It stopped growing because the method changed, not because the readers got tired:
every identifier was enumerated and resolved mechanically, then every attribution-shaped sentence was
read against its source by a seat that had to name the command that decided it. Passes 1 to 3 sampled;
this enumerated.

Three things the increments never would have found, and one they invented:

- **The existence half is nearly clean.** 128 of 132 identifiers resolve. The defects are almost
  entirely in what the documents say about targets that exist, which is why no identifier-level gate
  would have caught them.
- **Completeness claims are a separate class.** `:86` and `:87` assert a set of open debt rows and
  silently omit members. Every citation in those cells resolves; the defect is what is absent.
- **Self-description is the worst category.** Six of leg 5's seven never-true failures are the handoff
  describing its own evidence.
- **And the clock invents defects.** Fifteen of leg 5's rows were failures against the branch head and
  hold against the artifact's own commit. Grading a record against anything but the moment it was
  written manufactures work.

### My own five corrections, collected

A14 measured against the branch head, not the artifact's commit. A15 graded 🟡 for want of evidence
that existed. A11 graded 🔴 against two namespaces when there are three. Pass 2's `pif-u5-records`
yellow rested on figures that were internally consistent and jointly stale. Pass 3's tally argument
used `git log -1 -- <path>` where only `git log -S` answers the question.

Four of the five are the same error: I chose the measurement that was easy to run over the one the
sentence actually names. The fifth, A11, is its sibling: I stopped at the first register that failed
to resolve a citation rather than asking which register the citation belongs to.

## Correction 6, to leg 5's `:434-435` row and to A16's framing

Raised by the builder against its own work and checked by the Orchestrator. I re-derived it and it is
right.

My leg 5 row said the U11 handoff's `:434-435` was false in both halves: that the review sits at a
gitignored path and therefore enters no commit and no diff leg. I justified that with
`.sdlc/verdicts/records-followup-U11-review.md` being tracked since `3f6f1ebf` at `15:48:31-07:00`,
forty minutes before the handoff's last commit.

Forty minutes earlier by wall clock, and not reachable. `git merge-base --is-ancestor 3f6f1ebf
698e8916` returns false. `3f6f1ebf` is on `main`, `plan/preset-intent-fidelity` and two sync
scratches, and on none of the unit branch. `git cat-file -e 698e8916:.sdlc/verdicts/records-followup-U11-review.md`
fails, and so does the same read at `ee854932`.

So from its own anchor the handoff was right: that review entered no commit and no diff leg of the
branch it was describing. That half holds. What stays false is the path, `.sdlc/runtime/rf-U11-review.md`,
which no commit on any ref has ever carried, and the implication that the report exists nowhere.

| was | now |
| --- | --- |
| `:434-435` both halves false | one half false: the path. The no-commit half holds |
| A16: the real record is at `.sdlc/verdicts/records-followup-U11-review.md` | still the real record, and also unreachable from this branch. A reader on `plan/records-followup-roadmap` can follow neither path |

A16 survives and its point sharpens. The citation cannot be followed from the branch, and neither can
the correction I offered for it. That is leg 2's closing note arriving from the other direction: the
evidence for a branch's records is not on the branch.

### What I actually got wrong

I applied my own anchor rule to time and not to reachability. Having spent this census insisting that
a record be graded at the commit that wrote it, I then reached for a fact that was earlier in wall
clock and assumed the document could see it. Earlier is not reachable. Reachability is the test, and
on a repo with concurrent unit branches the two come apart constantly.

That is six corrections. Five of them were reaching for the easy measurement over the named one. This
sixth is the same reflex wearing the disguise of the rule I had just finished enforcing on everyone
else, which is the version worth remembering: a rule you are confident about is one you stop checking
yourself against.

## Corrections 7 to 9, surfaced by verifying U13

Grading U13 against this census exposed three defects in it. All three are mine.

**7. Leg 5's enumeration omits `:6` and `:30`.** The census seat reported both in its pre-`:55` rows
and I confirmed both in a message to it, but neither made it into leg 5's written enumeration above.
U13 repaired against that enumeration, so it could not repair what the enumeration dropped. Both stay
false in the U11 handoff. `:30` is false at every anchor: `1405ee77` touched only the roadmap and
`b0003592` only the handoff, and both are ancestors of `698e8916`. `:6` needs care. I confirmed it by
wall clock, revision 19 landing four minutes before the handoff, which is the error correction 6
names. Under reachability it is undecidable, because the plan is a main-only artifact and the plan
reachable from `698e8916` stops at revision 13. It stands on a different ground: the file's own body
applies R14, which is revision 19, while its front matter says 17. The conclusion survives; the
reasoning I gave for it did not.

**8. The `Stale before its own last commit, 12` headline does not reconstruct.** The sites that
bucket names do not add to twelve under any grouping I can find. U13's handoff recorded this plainly.
A headline count that its own enumeration cannot produce is the defect this census convicted in the
U11 handoff's `Nine commits`, and I wrote one.

**9. Leg 5 and leg 2 graded the same claim in opposite directions.** Leg 5 held the U11 handoff's `No
ranked row was added or dropped by U11`. Leg 2 failed the roadmap's identical claim at `:118`. Leg 2 was
right: `66d40f70`, a U11 commit and an ancestor of `698e8916`, added `#722`'s ranked row. I accepted
both legs without checking them against each other. U13's builder removed the false sentence, which I
graded correct in V7 of its verdict.

Nine corrections to my own work in this plan. Correction 9 adds a new kind: two seats disagreeing on
one claim, and me recording both verdicts without noticing. Parallel legs over overlapping claims need
a reconciliation pass, and this census did not have one.
