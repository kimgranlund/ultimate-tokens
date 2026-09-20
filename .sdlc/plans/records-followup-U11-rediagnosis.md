---
kind: rediagnosis
plan: records-followup
unit: U11
ticket: "#709"
seat: planner
grade: planner-l1
pass: 3 (re-diagnosis, no build)
written: 2026-09-20
read: .sdlc/plans/records-followup.md (revisions 14 to 18, the U5 and U11 rows); .sdlc/verdicts/records-followup-U11.md (pass 1, on main); .worktrees/rf-U11/.sdlc/verdicts/records-followup-U11.md (pass 2, read only); .sdlc/verdicts/records-followup-U11-review.md (findings 1 to 7); .worktrees/rf-U11/.sdlc/handoffs/records-followup-U11.md (read only)
---

# U11 re-diagnosis: the four repairs are done, the criterion is the wrong instrument

## Verdict

| Item | State | One line |
|---|---|---|
| The four roadmap repairs R1 to R4 | 🟢 | re-derived by the reviewer and by two verifier passes; nothing in `roadmap.md` at `ddfedb70` is measurably false |
| Criterion U5-8 as an instrument | 🔴 | one design fault, three expressions; a fourth pass patches the reader again and meets a fourth expression |
| The Orchestrator's read (design fault, not slips) | 🟢 | agreed, with a sharper statement of which design fault below |
| The builder's alternative (a typed kind field on revision rows) | 🟡 | right direction, covers one of the four claim classes |
| Recommendation | split | land the repairs as U11; retire U5-8 from this plan; carry the class as a ticket with the shape stated in §4 |

Next action for the Orchestrator: rule on the split in §5, then land U11 with the criterion text removed from the unit's Ask.

## 1. Root cause: one design fault

The Orchestrator's read is right. It is one fault, and it is more specific than "the criterion is badly built": U5-8 tries to machine-verify prose assertions whose subjects have no machine-readable ground truth in this repo. Every pass moved the reader one source closer to a truth that is not written down anywhere in a single shape, and every move exposed the next gap in that truth, not a slip in the previous reader.

The evidence, per claim class the criterion covers:

| Claim class in the roadmap | What the criterion reads it against | Does that source exist in one machine shape? | Where the pass failed |
|---|---|---|---|
| R2 counts (`13 issues`, `total 13`) | the file's own ranked table | 🟢 yes, one table, one row shape | never failed; NC1, NC2, NC5 bite |
| R1 readiness of another plan | `plan/<x>` checklist ticks plus a needle list for "refuses to start" | 🟡 the ticks exist; the claim shape is prose, so a four-phrase allowlist stands in for it (review 3) | reviewer, finding 3 |
| R3 unit tally `N of M units 🟢` | pass 1: `[x]` ticks; pass 2: verdict files | 🔴 no. A tick means merged (the plugin's own `board.py` renders `[x]` as 🟢, so the plugin itself conflates merge with grade). Verdict state lives in three shapes plus one prose word; 38 of the 55 files under `.sdlc/verdicts/` carry no `verdict:` field | verifier pass 1 (ticks), verifier pass 2 (title parsed before field, 🟢 tested first) |
| R4 method claim (`Read at one instant`) | a needle list, then diff reach of the commit that added the line | 🔴 no. "Read" is not recorded anywhere; `reach` is deleted lines over file lines, which scores the file's own creation `0%` (review 5) | reviewer, findings 2, 5, 6; `cited:` exemption, finding 1 |

Two measurements this seat ran on main today, reproducing pass 2's fault without a checkout:

| Run | Printed |
|---|---|
| the handoff's classifier on `.sdlc/verdicts/records-followup-U11.md` (pass 1, `verdict: 🔴`) | `GREEN` |
| the same on `.sdlc/verdicts/k17-rerun-U1.md` (title `🟡 5 🟢, 2 🟡, 0 🔴`, a file U11 never touched) | `GREEN` |
| the same on `.sdlc/verdicts/records-followup-U5.md` (`verdict: 🟡` in front matter, title later) | `YELLOW` |

So the pass 2 reader is wrong on a pre-existing record too, not only on the verdict written against it. The fault is not "the builder tested 🟢 first". The plugin's own `verdict.py` already carries the rule that would have fixed the ordering (`leading_state`: the first marker in a cell wins), and applying it would still leave the reader guessing which of four headline shapes holds the state. There is no positional field to read, so any reader is a heuristic, and a heuristic over records written by different seats in different shapes will always have a next counterexample.

Why the three failures escalate rather than repeat. Pass 1 read a source that exists but means something else (merge, not grade). Pass 2 read the right source and found it has no shape. A pass 3 would either standardise the verdict shape (out of U11's scope wall, which is `.sdlc/roadmap.md` alone) or add a fourth heuristic. That is the signature of a design fault: each fix is forced out of the unit's scope to be a real fix, and each in-scope fix is a narrower heuristic.

Two further faults in the design, both stated by the reviewer and neither addressed by a pass:

| Fault | Why it is design, not slip |
|---|---|
| Neither leg asserts (review 4) | both legs print numbers for a human to compare. A check that cannot exit nonzero is a report; the "criterion" is the verifier's reading of the report, which is what U5-1 to U5-7 already are. U5-8 adds reading load, not a gate |
| No pinned instant (verdict pass 2, consequence 1) | the roadmap is a snapshot with one `head:` sha (U5-1). Leg A reads `origin/main`, `HEAD` and local plan branches at verify time. The verifier's own pass 1 verdict landing on main between the builder's run and the verifier's run changed the answer. The criterion compares a snapshot to a moving target, so it reds on drift by construction, and the plan's live-facts rule (a 🟡 note) then has to absorb what the criterion reds. Local-only plan branches cannot be pinned by anyone else at all |

Is my read of the Orchestrator's read wrong anywhere? One nuance. Revision 18 says the artifact is clean and the check is the defect; agreed. But "design fault in U5-8" undersells it: the fault is upstream of U5-8, in what the records let a machine read. U5-8 is a symptom of the plan's own root-cause paragraph (`records-followup.md:24`): a record holds a second copy of something and nothing compares it with the source. records-refresh and this plan fixed that shape for numbers a program prints by making the program print them and a script compare. U5-8 tried to fix the same shape for numbers a human derives by parsing the human's prose. That is a different, weaker mechanism than the one the plan already ratified, and it is why it does not bite.

## 2. Can a criterion of this shape bite here?

Not in this shape. It can bite when the shape changes from "parse the assertion" to "generate the assertion". The test, per `checks-that-bite`: the second derivation must be independent of the first and must be able to go red. Parsing prose fails independence (the needle list is fitted to the prose) and fails red (no assert).

The builder's alternative, judged:

| Proposal | Covers | Verdict |
|---|---|---|
| a required `kind:` field on every revision row (`patch` or `regeneration`), read positionally | R4 only: a stated method becomes a typed field checkable against the diff (`regeneration` implies a reach floor, `patch` implies none) | 🟡 right principle, wrong scope. It closes the needle-list hole (review 3) and the `commit none` hole (review 6) for one claim class. It does nothing for R1 or R3, and `reach` stays a proxy (review 5): a `regeneration` row on a create or pure-append commit still scores `0%` |

The principle it embodies is the one to keep: a claim that a machine will check is written as a typed field or generated text, never as a sentence. Applied to all four classes:

| Class | Durable shape that bites | Cost |
|---|---|---|
| R2 counts | already bites (leg A's arithmetic); keep it, add an assert (exit 1 on mismatch) | one line |
| R3 unit tallies | do not restate them in prose. The roadmap cites `verdict <plan>-<unit> @ <sha>` per unit or prints the output of one plugin command. Prerequisite: `verdict:` front matter mandatory on every verdict file and enforced by `verdict.py check` (today 38 of 55 lack it; `U8` writes a prose word). Then a tally reader is positional and trivial | a plugin/adapter change plus a sweep of 38 records, its own unit, not a roadmap criterion |
| R1 readiness of other plans | do not assert readiness. Cite the other plan's checklist line and board row at the sha they were read at (`plan/gate-split @ ebddc55d: [~] U2`). The check is then "does the cited sha hold the cited line", which git answers at any later time and which is pinned | rewrite of two cells; the check is `git show <sha>:<path> \| grep -F` |
| R4 method claims | the builder's `kind:` field, plus: the row names the command that produced the regeneration, and a regeneration row is admitted only when the commit's diff touches every generated section (a section list, not a reach ratio) | a small script, and the roadmap's sections must be marked generated or hand-ranked, which U5's Texts already imply |

The shortest version of the whole answer: make the roadmap's asserted facts into what a script prints, with the script named beside them, and grade byte-equality against a rerun at the roadmap's `head:` sha. That is `baseline-agrees-check.sh`'s shape, ratified twice in this repo, applied to the roadmap. What cannot be printed by a script (a ranking, a readiness judgement) is not asserted; it is cited by sha.

## 3. Split the two things U11 couples

Yes, split. The repairs and the criterion have different states, different owners and different scope walls.

| Piece | State | Where it goes |
|---|---|---|
| R1 to R4 repairs in `roadmap.md` at `ddfedb70` | 🟢 verified twice | land as U11. The unit's Ask line loses the sentence that adds a criterion; the handoff's `## The assertions criterion` section is left in the handoff as a record of what was tried, with a one-line note pointing here |
| U5-8 text, both legs, NC1 to NC8, the strip probe table | 🔴 not landable | not folded into the plan. Recorded as a finding: what it caught (all four reds at `3ee3c72b`, a real control), what it cannot do (§1 table), and why |
| The class of defect (record asserts what nothing re-derives) | 🟡 still open | one ticket, kind:chore, size:small, lane:docs, carrying §2's per-class shape and the `verdict:` field prerequisite. Not a unit of #709: it changes plugin scripts and 38 verdict files, both outside this plan's scope wall |
| `.sdlc/board.md` U5 row 🟢 with a 🟡 verdict | 🟡 | already the Orchestrator's, disambiguated in prose at pass 2; the ticket above is where the mark stops needing prose |

Why not carry U5-8 as "known limits recorded beside it", the reviewer's carry option for findings 4 and 5: because a criterion whose known limits include "reds true tallies and passes false ones" is not a criterion with limits, it is a report that the verifier must re-verify by hand. U5-1 to U5-7 already give the verifier that work with less code to distrust.

## 4. If the Orchestrator continues anyway

Not recommended. If ruled otherwise, the shape that would not be a fourth failure:

| Field | Value |
|---|---|
| Unit | new unit, not U11 pass 3; own branch off `plan/<new-slug>`, own ticket, since its files are `scripts/`-adjacent and `.sdlc/verdicts/*` |
| Scope | (a) `verdict:` field mandatory, `verdict.py check` refuses a verdict file without one, sweep the 38 files; (b) roadmap tally and readiness cells become cited shas or script output; (c) one check script that asserts, with a negative control per class |
| Grade | builder-l5, reviewer-l2, verifier-l2: the same pair as U11, because the failure mode is a plausible heuristic nobody measured, which is the l5 reason U8 to U10 gave |
| Preconditions before dispatch, all must hold | every asserted fact the check reads has one positional source (field or script output), written down in the unit brief before the builder starts; the check exits nonzero on its own; every leg is run at the roadmap's `head:` sha, not at verify time, and any subject that cannot be read at a pinned sha is not asserted; a negative control per class that reproduces a defect that actually shipped (`3ee3c72b` for R1, R2, R4; `089e0e44` for R3); the `cited:` exemption is gone, because a cited retired claim is a quoted span and the reader skips backtick spans, as P6 already does |
| What makes a fourth pass a fourth failure | any leg that reads a title, a needle list or a `[x]` tick as a state; any leg that prints for a human instead of exiting |

## 5. For the Orchestrator

| Item | Ask |
|---|---|
| Split | rule §3: land the repairs as U11 now, retire U5-8, mint one ticket for the class |
| U11 Ask line | strike the criterion sentence and the `R3` provenance claim that the criterion surfaced the contradiction independently (the handoff already withdraws it) |
| Plan revision 19 | records this document, the split, and that U5-8 was proposed and not adopted, with the reason in §1's one sentence: the assertions have no machine-readable source |
| Board | U11 row `Next` reads "land", `Doc` points here beside the pass 2 verdict |
| Prerequisite ticket | `verdict:` front matter mandatory and enforced; that alone would have made pass 2 impossible |

Branding gate, run in the root checkout after this file was written, exit code read directly from `node test/repo/branding.mjs`: `branding: clean (581 files scanned)`, `exit 0`. Em dashes in this file: `0`. The file is untracked; nothing else in the tree moved.

## 6. Second re-diagnosis: pass 3 reds R2 and R4 at `698e8916`

Read: the Pass 3 section of `.sdlc/verdicts/records-followup-U11.md` on local `main` at `27ec4606`; the roadmap at `7dde8cb1`, `3ee3c72b`, `66d40f70` and the worktree head; `gh pr list` and `gh issue view 723` live; the commit times of `66d40f70..698e8916`.

### Verdict

| Item | State | One line |
|---|---|---|
| One fault or two slips | 🔴 one fault, the same fault as §1, now on the verifier's side and on the plan's rule | both reds are claims about the world that only the world can check, and until pass 3 every seat checked the file against itself |
| Another builder pass | 🔴 not the right move | the edit is four lines and mechanical; the mechanism that reds it is still running, so a pass 4 lands into the same drift |
| The Orchestrator's own action redding R2 | 🟡 true, and it is the rule's fault more than the action's | the rule anchors on "the unit's commit time"; the only commit after #723 is handoff-only, and the roadmap was last written twenty minutes before the ticket |

### 6.1 What the two reds are made of

| Red | Clause | Since when false | Who checked it before pass 3 | Nature |
|---|---|---|---|---|
| R2 | `gh pr list --state open (1 PR)` | `7dde8cb1`, U5's own regeneration. `#158` has been open since 2026-06-30. Same text at `3ee3c72b` and `66d40f70` | U5 verifier (🟡 verdict), roadmap pre-land review, U11 reviewer, U11 verifier passes 1 and 2: five seats, none ran the command the line names | a stale copy of program output, the plan's own root-cause shape at `records-followup.md:24` |
| R2 | `gh issue list --state open (14 issues)`, no row for `#723` | `23:24:11Z`, when the Orchestrator minted #723. The roadmap's last commit `66d40f70` is at `23:04:32Z`; the one later commit `698e8916` at `23:28:12Z` changes the handoff only | nobody could have: it was true when the roadmap was last written | live drift; red only under the anchor "unit's last commit" rather than "roadmap's last commit" |
| R4 | `Count:` line "as untouched context directly above the three rows" | `354c2d7f`, when the line was written | reviewer and both verifier passes graded R4 🟢 on the three headline figures | a loose description of a diff nobody re-read at `--unified=0` |
| R4 | "all of them repaired by U11 at `1fe53f5a`" | `66d40f70` or earlier; the tally repair the clause credits to `1fe53f5a` was made at `66d40f70`, after pass 1 graded `1fe53f5a`'s text 🔴 | pass 2 graded R4 🟢 with the clause present | a provenance claim about this unit's own history, checked by nobody |

Four clauses, four ages, one shape: each is a sentence that names something outside the file (a command's output, a diff's shape, a commit's content), and the check that graded it 🟢 read the file's arithmetic or its headline figures instead of the thing named. Pass 3's own correction paragraph says so for R2 in the verifier's words. That is §1's fault (assertions with no re-derivation) with the seat swapped: at passes 1 and 2 the criterion certified the file against itself, at pass 3 the verifier admits doing the same for R2 and R4 while grading the unit that exists to stop it.

Two slips it is not. A slip is a builder writing a wrong number once. Here the PR count outlived five graded reads and three plan revisions, the provenance clause outlived two verifier passes, and the drift red comes from the Orchestrator running the process (minting the ticket this document's §3 asked for) while the process's rule counts that as the unit's failure. Nothing here is a builder error that a better builder avoids.

### 6.2 The rule that turned the Orchestrator's action into a red

`records-followup.md:292`: a difference is 🔴 unless the issue was created after the unit's commit time. Written for U5, where the unit had one roadmap commit and "the unit's commit" and "the roadmap's commit" were the same instant. U11 has four roadmap commits and five handoff commits; the two readings diverge, and pass 1 and pass 3 each chose a different one (pass 1 the roadmap's, pass 3 the unit's). The verifier says the unit's is what the plan says; on the letter that is right. On the mechanics it is wrong, because a roadmap is a snapshot and the honest instant of a snapshot is the commit that wrote it. Anchoring on a handoff-only commit makes the roadmap answerable for tickets minted while the builder was writing prose about it.

Whichever anchor is chosen, the structural point stands: the roadmap is a hand-written copy of `gh` output, `gh` moves while the copy is graded, and the Orchestrator is one of the things moving it. Every refresh is itself a patch of the kind R4 exists to describe. There is no anchor under which this converges while tickets are minted during the unit, unless the mint and the refresh are the same act.

### 6.3 Is another build pass the right move at all

No, and not because of the grade rule. The four edits are: rank `#723` (one row plus the count moves 14 to 15), `(1 PR)` to `(2 PRs)`, strike the "context directly above" clause, and re-attribute the tally repair to `66d40f70`. A builder-l1 writes that in one commit. What a pass 4 cannot do is stop the next mint from redding R2 again, or stop the next verifier from grading R4's restated provenance against the file instead of `git log -S`. The reds would be honest and the pass would be the fifth time the same fault is met one clause further along.

Three options, with the recommendation first:

| Option | What happens | Why, or why not |
|---|---|---|
| A, recommended: Orchestrator's landing refresh, verifier-only pass 4 | the Orchestrator makes the four edits as one roadmap-only commit under revision 14's rule (a landing refresh is admitted, not exempted), with a revision row that states its kind (patch), its instant, and the two commands it re-ran with their output. Freeze: no ticket is minted between that commit and the squash. Pass 4 is the verifier alone, grading R2 by running both commands and R4 by `git log -S` against every sha the line names, nothing else regraded | it is what `3ee3c72b` should have been. The Orchestrator already owns landing refreshes; the U5-6 rule was reworded at revision 14 to admit them; the anchor question dissolves because the refresh commit is both the roadmap's and the unit's last commit. The freeze is the only thing that makes R2 stable, and it is a ruling, not a check |
| B: builder pass 4 at l1 | same four edits by a builder, reviewer skipped, verifier pass 4 | breaks the Orchestrator's own grade rule for a four-line patch, and any mint during the pass reds it again. Only if the Orchestrator may not touch a unit branch by adapter rule |
| C: land as is, note the four clauses in the pre-land record | the roadmap lands with `(1 PR)` and the false attribution, listed as known-false with the true values beside them | not acceptable. It lands the exact shape this plan exists to remove (a record asserting something nothing re-derived), one PR after landing nine repairs of it |

### 6.4 What has to change so this stops recurring, none of it in U11

| Change | Owner | Ticket |
|---|---|---|
| The live-facts rule names its anchor: the last commit that touches the roadmap, and states that a landing refresh resets it | plan revision, Orchestrator | #709, revision 20 |
| R2's criterion text says "re-run the commands the `inputs:` line names and compare", not "recompute from the table" (`records-followup.md:86` says the latter, and pass 2 graded the letter of it) | plan revision | #709 |
| The `inputs:` line stops carrying counts in prose and carries the commands with the instant they were run; the counts are what the verifier re-runs | roadmap Texts, U5's | #723 |
| Verdict pass sections are graded against the world by construction: every criterion that names a command has the command's rerun in its Evidence cell, which `verdict.py check` could refuse when absent | plugin | #723 |
| Records are read from local `main`, not `origin/main`, while records are committed unpushed; pass 3's own trap | adapter note | #723 |

### 6.5 For the Orchestrator

| Item | Ask |
|---|---|
| Rule on §6.3 | option A is the recommendation: your landing refresh, the freeze, a verifier-only pass 4 on R2 and R4 |
| If A | the refresh commit's revision row states kind, instant, and the two command outputs; then mint nothing until the squash |
| Plan revision 20 | the anchor of the live-facts rule, and R2's criterion text |
| #723 | add §6.4's three rows that are the ticket's |

Branding gate rerun after this section, exit code read directly from `node test/repo/branding.mjs`: `branding: clean (581 files scanned)`, `exit 0`. Em dashes in this file: `0`.

## 7. Addendum input: the stated head ages

Read: the pass 3 addendum at `5ac38205`; the roadmap front matter (`head: 5f2c3787 (origin/main)`), its revision line ("regenerated from live facts at `origin/main` @ 5f2c3787"), and `git rev-list --count 5f2c3787..main`, which prints `25` on local `main` at `ba7f398c`.

| Question | Answer | One line |
|---|---|---|
| Is an ageing head the same fault as R2 | 🟢 no, a different thing, and mostly not a fault | R2 is a figure that was false at its own head. An ageing head is a true statement of when the snapshot was taken; it is the pin that makes every other claim gradeable |
| Where it becomes a fault | 🟡 in the four patches since, none of which states its own instant | the head says "regenerated at 5f2c3787"; `3ee3c72b`, `1fe53f5a`, `354c2d7f` and `66d40f70` each read the world later and wrote cells under that same head. That is R4's shape (a patch carried under a regeneration's claim), not R2's |

Why it is not R2. R2's clause named a command and a figure the command never returned. The head names a commit that exists, is an ancestor of `main`, and is the instant U5 read at; `git show 5f2c3787` still lets anyone re-derive every regenerated cell. A snapshot that says when it was taken is the opposite of the fault this plan repairs: it is the one claim in the file that carries its own re-derivation. Ageing is what a snapshot does. The verifier's pass 3 trap (grading from `origin/main` rather than `main`) and §6.2's anchor confusion both come from the head being the only pinned instant in the file while the checks ignore it and read live state instead.

Why it is a little of R4. Since `5f2c3787` the file has been patched four times and each patch read something (the open-issue list, `plan/gate-split`, the verdict files) at a later instant it does not record. The front matter still reads as if every cell were read at `5f2c3787`. So a reader cannot tell which cells hold at the head and which hold at some later, unstated instant. That is the same defect R4 named on `3ee3c72b`, one level up: the file-level claim of one read instant is now a claim about four.

What follows, and what does not:

| Do | Do not |
|---|---|
| keep `head:` as the regeneration's instant and never move it on a patch; moving it would make the "regenerated at" line false | do not add a staleness rule to U5-1 (an age in commits is not a defect; the owner decides when a roadmap is regenerated) |
| every revision row that patches states the instant and the sha it read at, which option A's refresh row does by construction (§6.3) | do not treat the 25-commit gap as a finding against U11; U11 patched four cells and was asked to, under revision 14 |
| the checks read at the instant a row states, not at verify time; a claim with no stated instant is graded at `head:` | do not regenerate to refresh the head; a regeneration now is a fifth roadmap commit that reopens R1 to R4 and lands into the same drift |

For #723: the roadmap's contract should say that `head:` is the regeneration instant, that a patch row carries its own read instant, and that a cell is graded at the newest instant that touched it. That is the whole rule, and it is what would have made pass 1's and pass 3's anchor choice the same.

Branding gate rerun after this section, exit code read directly from `node test/repo/branding.mjs`: `branding: clean (581 files scanned)`, `exit 0`. Em dashes in this file: `0`.
