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
