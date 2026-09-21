---
kind: verdict
plan: records-followup-roadmap
seat: verifier
pass: 2
written: 2026-09-20
---

# Pre-PR · records-followup-roadmap · pass 2 · 712e63db277c52c3e1b96dbedb4c4e2b042c615b

verdict: 🔴
sha: 712e63db277c52c3e1b96dbedb4c4e2b042c615b

Graded at `plan/records-followup-roadmap` @ 3ee3c72b, merge base `main` @ 1f991877, draft PR #720,
ticket #709. Legs: this Verifier seat's own runs, a `reviewer-l4` and a `verifier-l3` dispatched in
fresh context per `pre-land-review`, both fable, so neither shares a model family with the sonnet
builder or with this opus seat. The `reviewer-l4` returned 2 🔴 and 7 🟡. The `verifier-l3` returned
11 🟢, 1 🟡 and no 🔴; its tables are at
`/Users/kimba/.claude/jobs/05defd58/tmp/records-followup-roadmap-prepr-verifier.md`. Every row below
is this seat's own run; the worker legs are cited where they agree or disagree, never relied on. The
builder's handoff and the U5 unit verdict were read as claims, never as evidence.

Every gate is green and every U5 acceptance criterion passes, on two independent legs. The plan does
not land, because the artifact those criteria accept states four things that are not true. All four
are falsifiable inside the graded commit, so none is live-facts drift.

## Checks

| Check | State | Evidence | Negative control |
|---|---|---|---|
| R1 the file's gating claims match the state of the work they describe | 🔴 | `:32` and `:49` call #713 `status approved`, `local only`, `gated on #681 landing`, `nothing else is ready to start before then`. On `plan/gate-split` the plan's own checklist reads `[x] U1 [~] U2 [~] U3 [~] U4 [~] U5 [x] U6a [ ] U6b` from `7d811172` (14:35:09-07:00) and still at `9276d4f0` (14:40:03-07:00), 19 minutes before this head. Four units of #713 were in flight and two were done while the file called it not started | the same read at `ebddc55d` (14:33:56-07:00, 65 s earlier) gives `[x] U1 [ ] U2 [ ] U3 [ ] U4 [ ] U5 [x] U6a [ ] U6b`, where the claim agrees. The check distinguishes the two refs, so it can pass |
| R2 the ranked table agrees with the counts the file states for it | 🔴 | at this head the table has 13 data rows, `:25` says `total 10` (P0 0 · P1 4 · P2 2 · P3 2 · unranked 2, internally summing to 10), `:7` says the input was `gh issue list --state open (10 issues)`. Three numbers, one file, one claimed instant | the identical check at the parent `6ee0fd8a` reports rows 10, total 10, header 10, AGREE. The refresh commit is what broke it |
| R3 the file is consistent about #709's own unit states | 🔴 | `:31` reads `nine of ten units 🟢, U5 (this unit) in progress`; `:47` reads `ten of ten units 🟢`. The plan has exactly ten units (U1 U2 U3 U4 U5 U6 U7 U8 U9 U10). Both describe #709 at the file's one claimed instant, so they cannot both hold. `:47` is the false one: it counts U5, the unit writing this file, as 🟢 before U5 was verified, and U5 has never been graded 🟢 | `:31`'s form is the control: the same sentence pattern applied to the same plan at the same instant yields a different number, so the inconsistency is in the file and not in the measure. Upgraded from the reviewer's 🟡 on this evidence |
| R4 the refresh's stated method describes what the refresh did | 🔴 | `:115` claims `Read at one instant, 2026-09-20T22:00Z`. The commit's own diff on the file is 4 added lines, 0 deleted, in two hunks: ranked rows 11 to 13, and that revision line. Nothing else was re-read. The hunk header carries the stale `Count: ... total 10` line as untouched context, directly above the three rows that invalidated it. The commit is dated 21:59:23Z, 37 s before the instant it says it read at | the regeneration commit `7dde8cb1` changed 54 lines and deleted 52 of 125 on the same file. Diff reach separates a whole-file read from a three-row patch, so the check can pass. Upgraded from the reviewer's 🟡: R4 is the mechanism that let R1, R2 and R3 survive the refresh |
| U5-1 to U5-5, U5-7 as graded | 🟢 | graded in `.sdlc/verdicts/records-followup-U5.md`, pass 2 at this head. Ids match, section counts equal row counts, no prompt text left, front matter names its head. The `verifier-l3` leg reran all seven against `origin/main`'s plan text and agrees | each row's control is recorded in that verdict; the `verifier-l3` leg reran every control in a throwaway clone and each bit |
| U5-6 roadmap-only commits, three-file branch | 🟡 | `git diff --name-only 1f991877` is exactly `.sdlc/handoffs/records-followup-U5.md`, `.sdlc/questions/roadmap-2026-09-20.md`, `.sdlc/roadmap.md`. Two roadmap commits, `7dde8cb1` and `3ee3c72b`, each touching that file alone. The criterion's command needs bash: under the seat's default zsh `$C` does not word-split and the loop dies with `fatal: ambiguous argument` | run under `bash -c`, the loop prints `.sdlc/roadmap.md`. Plan revision 15 annotates the row `(bash)`; that revision is on main, not on this branch. The `verifier-l3` leg ran every row under bash and graded U5-6 🟢 |
| P1 `npm test` green, no `node_modules`, tree byte-stable | 🟢 | clean clone at 3ee3c72b with no `node_modules`: `✓ all 48 test files passed`, exit 0, `git status --short` 0 before and after. The `verifier-l3` leg measured the same in its own clone, 146 s, TESTS 48, tree clean | the branding plant below reds this same run, exit 1, because `repo/branding.mjs` is one of the 48. The `verifier-l3` leg withheld its own scrimX control under a run-once instruction and graded P1 🟡 for that reason; this seat's control ran and bit, so P1 is 🟢 here |
| P4 branding gate, which scans `.sdlc/` | 🟢 | `branding: clean (507 files scanned)`, exit 0 | a records doc copied to `.sdlc/plant-check.md`: `FAIL: 3 branding violation(s) across 508 files`, exit 1, naming the planted path. Removing it returns exit 0. The control is planted inside `.sdlc/`, so it proves the gate reaches this branch's own directory |
| P5 scope wall | 🟢 | three paths differ from the merge base, all under `.sdlc/`, nothing under `src/`, `test/` or the build chain | covered by U5-6's own list above |
| P6 no em dash added in prose | 🟢 | `0` | one em dash appended to the roadmap in the clone: `1` |
| P7 baseline agrees with the tree at the pre-land head | 🟢 | exit 0, `stale total: 0`, `ok tests: baseline 48, test/run.mjs TESTS 48`, all five time rows ok. One `note` line, not a failure: the baseline ref `20298cc` predates tree movement outside `.sdlc/` | the baseline test figure bent to 47: `STALE tests: baseline 47, test/run.mjs TESTS 48`, `stale total: 1`, exit 1. Restored, exit 0 |
| baseline `npm run build` | 🟢 not required | the branch changes `.sdlc/` only; nothing in the build chain moved. CI's `build-test` ran the chain at this exact sha and reports success | a build-chain change would appear in P5's three-path list, which it does not |
| baseline `npm run smoke` | 🟢 not required | no path under `src/ui/` changed. Adapter §1 requires smoke only when `src/ui/` moved | CI's `panda-smoke` covers the PR regardless and reports success at this sha |
| CI at this exact sha | 🟢 | run 35540477388, `headSha` 3ee3c72bd61cfd5bc079a4fa4f87bae5b67b6b80: `build-test` success, `panda-smoke` success, `corpus-contrast` success, `deploy` skipped | a red job would print its conclusion here; conclusions are read by hand per the adapter's watch quirk |
| the branch's copy of the plan is stale | 🟡 | `plan/records-followup` revisions 14, 15 and 16 and U5's `[x]` tick are on `main` only. This branch never touched `.sdlc/plans/records-followup.md`, so the merge is a no-op on that path and cannot revert them | the three-path diff is the proof: the plan file is not in it. Grading the branch's plan text instead of main's would have produced a false red, and did not |
| the worktree carried a stray untracked record | 🟢 resolved | `.sdlc/verdicts/records-followup-U5.md` was untracked in `.worktrees/plan-rf-roadmap`. Removed by the Orchestrator after this record's first pass; re-checked here, `git status --short` in the plan worktree now lists only this prepr file, and `git diff --name-only 1f991877` is still the same three paths. The record itself is safe on `main`, 8723 bytes, Correction paragraph present | the deleted copy's own bytes can no longer be compared, so the Orchestrator's account of what it differed by is carried as a claim, not a finding. What is verified is the part that mattered: the record survives on `main` and the branch is unchanged, so no staging accident can now put a main-only record onto this branch |

## Root cause

Not four separate slips. U5's seven criteria check the roadmap's shape: that ids match, that a
section's count equals its row count, that no prompt text is left, that the branch carries three
files. Not one of them reads what the file asserts about work outside itself. R1, R2, R3 and R4 all
live in exactly that gap, which is how two green unit verdicts and a green gate set sit over an
artifact with four false statements.

The `verifier-l3` leg is the demonstration rather than a dissent. Running all seven U5 rows plus five
P rows faithfully, in fresh context, on a different model family, it returned no red. Its U5-4
compares the ranked table's id set against live `gh` output and found 13 equal to 13, which passes,
while the same file's own summary line two rows above says `total 10`. The criterion compares the
table to the world and never the file to itself, so it cannot see R2. The other three reds are
invisible to the criteria for the same reason. A next pass that only patches the four lines leaves
the gap open; what needs a row is the assertions, read against their sources at a named ref.

R4 is the sharpest instance: a refresh that added three rows described itself as a whole-file read at
one instant, and that description is what made R2 and R3 look already handled.

## Not evidenced

Five of the `reviewer-l4`'s seven 🟡 are not re-derived in this record and are carried as claims, not
as findings; two of the seven are re-derived above and upgraded to 🔴. The reviewer wrote no file, so
its findings live only in its returned message. The `verifier-l3` leg's P1 negative control was not
run by that leg; this seat ran its own, which bit.

## Pass 2, at `712e63db`

Graded at `plan/records-followup-roadmap` @ `712e63db`, merge base `main` @ `1f991877`, draft PR #720
pushed, ticket #709. Legs: this seat's own runs, a `reviewer-l4` and a `verifier-l3` dispatched fresh
per `pre-land-review`, both fable. The reviewer returned 2 🔴 and 4 🟡; I re-derived every one of them
myself and adopt both reds. The verifier's gate tables had not returned when this was written, and no
row below depends on them: I ran all five gates and their controls myself.

**Pass 1's four reds are all repaired and verified.** That is the substance of the pass. What blocks
is two citations, both of the same class as the original four: a statement about another record that
the record contradicts.

| # | Check | State | Evidence | Negative control |
|---|---|---|---|---|
| A1 | pass 1's R1, the `#713` gating claims | 🟢 | `:50` reads `six of its seven units are merged or in flight ... only U6b still needs #681 on main` against a checklist of `[x] U1 [~] U2 [~] U3 [~] U4 [~] U5 [x] U6a [ ] U6b`. The `#681` cell's `six units deep` matches six live `pif-u*` worktrees | at `ebddc55d` the same read gives two of seven started, where the retired claim would have held |
| A2 | pass 1's R2, the stated counts | 🟢 | the `inputs:` line names two commands; I ran them and got 15 and 2, exactly as stated. The open-issue set diffs against the 15 ranked rows with exit 0. `Count:` reads `total 15` and its parts sum to 15 | at `698e8916` the same checks give `(14 issues)`, `(1 PR)` and a diff exiting 1 with `< 723` |
| A3 | pass 1's R3, the unit tally | 🟢 | `:31` and `:49` read `ten of eleven units 🟢, U5 🟡 the only one not green`. Derived from the `verdict:` fields on `main`: 10 green, 1 yellow, 0 red of 11. This closes the 🟡 landing note N1 I raised in the U11 verdict before the edit was made | derived from `[x]` merge ticks instead the answer is the same here, so I checked the predicate too: U5 is the single non-green and its record reads `verdict: 🟡` |
| A4 | pass 1's R4, the refresh's stated method | 🟢 | `4 0`, two hunks, `21:59:23Z` on `3ee3c72b`, which is what the row states; both clauses U11 pass 3 and pass 4 red are gone | the same figures fail against `7dde8cb1` (54 added, 52 deleted, 18 hunks) |
| C1 | `roadmap.md:116` cites the ruling behind the lane-ownership move | 🔴 | it says the lanes moved to sdlc `per standing ruling R4 of 2026-09-20` and names the rulings file. R4 in that file is `Conductor session mode`, about restarting a session in bypass. The ownership sentence is an unnumbered bullet under `## Earlier today, same channel`, and the ruling that governs who owns #720 is R11 | not renumbering drift: I read every version of that file and R4 has been `Conductor session mode` in all six, since `e9850935` at 12:31:48, which is two hours before the roadmap first wrote the citation at `7dde8cb1` (14:36:16). False when written |
| C2 | `roadmap.md:90` cites the approval behind the re-check rule | 🔴 | it says `Approval Q2 of records-followup already rules that architecture.md and debt.md get re-checked per plan, where a plan touches them`. That wording is verbatim from `survey-2026-09-18-approval.md` Q2. The `records-followup` approval's Q2 is `How does the roadmap repair (U5) land?`, answered `Two PRs` | I read all four questions of `records-followup-approval.md`: Q1 plan approval, Q2 two PRs, Q3 the debt and architecture id collision, Q4 the CLAUDE.md CI line. None carries the re-check rule. Right question number, wrong file |
| Y1 | the ranked table against GitHub and against other plans | 🟡 | `#721` reads Kind `chore` while its labels are `kind:feature, size:small`. `#701`'s Plan cell names only `rides preset-intent-fidelity's U4 spike fix`, but `plan/chroma-floor` exists, is `status: approved`, names `ticket: "#701"`, and the roadmap never mentions it: `grep -c chroma-floor` is `0`. The file's own convention names a plan and its branch for `#681`, `#713` and `#496` | `plan/chroma-floor`'s head is `eed0825a` at `20:52:49Z`, 43 minutes before the regeneration, so it was there to be read and this is not live facts. `#701`'s Pri cell `(p)` is correct: its labels carry no priority, and the plan file's `priority: P1` is a different field |
| Y2 | the tally and the R15 citations resolve only on local `main` | 🟡 | `origin/main` is `13f46583`, 11 commits behind local `main`. On the pushed tree the U11 verdict reads `verdict: 🔴` and R15 is absent entirely. A reader deriving the tally from what GitHub can see gets nine of eleven, not ten, and cannot resolve R15 at all. The file never says which ref it read them at | on `main` the same derivation gives ten and R15 resolves. This is the stale-ref trap recorded in the U11 verdict's pass 3 addendum, now reaching the artifact |
| Y3 | the `pif-u5-records` worktree row | 🟡 | the row reads `6e4d33f` / `203` / `4 uncommitted paths`; live is `8918342c` / `206` / 3 dirty, and it moved at `17:04:32-07:00`, 18 minutes before the landing commit | `203` is exact at the roadmap's declared read instant `5f2c3787`, and the R4 row discloses that every cell but the open-issue list is the regeneration's carried forward unread. So this is disclosed staleness, not a false claim. `4 uncommitted paths` is not re-derivable at any ref |
| Y4 | the unticketed-debt list | 🟡 | the section is headed `Open rows` and lists `C2, C3, C4, C7` and `DP3, D2` among others, omitting `C6`, `DP1` and `DP2`, which sit in `debt.md` in the same state. `debt.md` has no open or closed column, so the selection is not derivable from its source | the reviewer measured the same and adds that partially closed `R3`, `R8` and `G2` are kept while those three are dropped, so the rule is not consistency either |
| Y5 | the revision log's present tense | 🟡 | my own finding. Row `:118` narrates successive passes each with `now`, and ends `so the green tally is nine of eleven with U5 🟡 and U11 in progress. Both rows now read that`. At this head both rows read ten of eleven, so that sentence is false, while the same row earlier says `both now read ten of eleven`, which is true. One row, two contradictory statements about this plan's tally, which is pass 1's R3 shape | I swept every present-tense claim in the log: five, of which four are true at this head and only this one is not. It sits in the revision log, whose narration of retired claims is the ratified blind spot now owned by ticket #723 |
| G1 | P1 `npm test`, no `node_modules`, tree stable | 🟢 | clean clone at `712e63db`: `✓ all 48 test files passed`, exit 0 captured directly, TESTS 48, `git status --short` 0 after. Host load was 197 at start and it still passed | the P4 plant reds the same run, since `repo/branding.mjs` is one of the 48 |
| G2 | P4 branding, which scans `.sdlc/` | 🟢 | `branding: clean (508 files scanned)`, exit 0 under pipefail | a records doc planted inside `.sdlc/`: `FAIL: 3 branding violation(s) across 509 files`, exit 1 |
| G3 | P5 scope wall, P6 em dashes, P7 baseline | 🟢 | zero paths outside `.sdlc/`, four in total; `0` em dashes; `stale total: 0`, exit 0 | a planted `src/ui/` file takes the outside count to 1; one em dash gives `1`; the baseline figure bent to 47 gives `STALE tests`, exit 1 |
| G4 | build and smoke | 🟢 not required | the branch touches `.sdlc/` only. Adapter §1 requires smoke only when `src/ui/` changed | a build-chain change would appear in P5's four-path list, which it does not |
| G5 | CI at this exact sha | 🟢 | run 35547519448, `headSha` `712e63db277c52c3e1b96dbedb4c4e2b042c615b`: `build-test` success, `panda-smoke` success, `corpus-contrast` success, `deploy` skipped | conclusions read by hand per the adapter's watch quirk |

### What blocks, and what does not

The unit did its work. All four of pass 1's reds are repaired, the counts and the tally are now
derivable from the commands and records they name, and every gate and CI job is green. The two 🔴 are
citations written into the file by the original regeneration and never touched since, so no pass of
U11 was ever looking at them. C1 was false two hours after the ruling it names was written; C2 points
at the right question number in the wrong file.

None of the five 🟡 is a false statement of that kind. Y3 is disclosed by the file, Y5 sits in the
revision log's ratified blind spot, Y2 is a consequence of records being committed locally and not
pushed, and Y1 and Y4 are incompleteness rather than falsehood. They are worth the owner seeing; they
are not what holds the PR.

The pattern across both pre-land passes is one thing: the roadmap's assertions about other records are
the only defects anyone has found in it, and they are found by reading the cited record, never by any
criterion the plan carries. That is ticket #723's class, and this record is the second body of
evidence for it.

### The `verifier-l3` leg, and one correction to it

It returned after this record was drafted: R1 to R4, P1, P4 to P7, build and CI all 🟢, each with a
negative control it ran, tables at `/Users/kimba/.claude/jobs/05defd58/tmp/prepr3-report.md`. Its
numbers agree with mine everywhere they overlap: `npm test` exit 0 with 48 of 48 and a clean tree, 15
issues and 2 PRs matching the `inputs:` line, the ranked set equal to the open set, the tally ten of
eleven with U5 the only non-green, and CI run 35547519448 green on all three jobs. Its R4 sweep is
more thorough than mine and turns up nothing new: every revision-log figure, every squash sha an
ancestor of main, and `git log -S` locating the retired claims entering and leaving.

One statement of its own is wrong and it matters, because it is the same trap as Y2. It reports
`local main = origin/main = 49077c67`. They are not equal: `origin/main` is `13f46583`, eleven
commits behind, and I refetched to be sure. Its clone was made with `--shared` from the local repo,
so inside that clone `origin` points at this machine and `origin/main` resolves to local `main`. A
seat that derives a record's truth from `origin/main` inside such a clone is reading the local tree
while believing it read the pushed one. That is Y2 from the other side, and it is worth #723 carrying
it: the ref a check reads has to be named and resolved, not assumed.

Its two yellow notes reconcile with mine. The `pif-u5-records` cell is my Y3; on its `203 was only
true before 21:16:43Z` I measured further and the figure is exact for the head the row states,
`6e4d33f`, against `5f2c3787`, `origin/main` and local `main` alike, so what moved is the worktree
head and not the count. Its kind-marking note is the part of my Y1 about `#718`, `#719`, `#722`
against `#701`.

With both legs in, nothing changes: the four repairs are verified twice over, the gates and CI are
green on two independent runs, and the two 🔴 are the citations at `:116` and `:90`.

## Pass 3, at `ee854932`

verdict: 🔴
sha: ee854932e2b03da92c17f666a63c60a5d3fc89b5

Pair per `pre-land-review`, both fresh context: `reviewer-l4` and `verifier-l3`. Four 🔴 stand. Three
of them are mine to own: one is a reversal of my pass 2 yellow, one is a reversal of an argument I
made from a 23 second margin, and one red I carried into this pass was wrong and is withdrawn.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| A1 | the tally `ten of eleven units 🟢, U5 🟡` at `:31` and `:49` | 🔴 | the plan on `main` gained its twelfth unit at `0d042c0f`, `2026-09-21T00:41:17Z`, which is 23m34s before U12's first commit `15cd3121` and 18m59s after the tally was last written at `712e63db`. True when written, stale before the unit that carried it began. | `git log -S` on the U12 row returns `0d042c0f` alone; reading the branch's own copy of the plan instead returns 10 units at both `15cd3121` and `ee854932`, because the branch never tracks `.sdlc/plans/records-followup.md` and resolves the merge base copy. That divergence is what hid this. |
| A2 | every open issue is ranked; `inputs:` at `:7` and `total 15` at `:25` | 🔴 | live open set is 16. The ranked table carries 15 rows and the one absent is `#724`, created `2026-09-21T01:37:38Z`, which is 1h23m before the branch head. Not exempt under the live facts rule. | the same reconciliation returns zero ranked-but-closed rows, and `#723`, minted in the same window, is both ranked and mentioned in two files on the branch. The method catches late issues; `#724` alone was missed. |
| A3 | `.sdlc/handoffs/records-followup-U5.md:58` attributes a sentence to standing ruling R4 | 🔴 | R4 at this sha is `Conductor session mode`, about restarting a session in bypass. The sentence quoted, the other conductor session no longer touching this repo's plans, lives under `## Earlier today, same channel`. This is the same false attribution U12 repaired at `roadmap.md:116`, left standing in a record that rides the same PR. | R2 is a citation of identical shape in the same file and it holds: its heading is `#681 U4 rulings by rule` and its body matches what cites it. The read distinguishes the two. |
| A4 | the `pif-u5-records` worktree row at `:73` | 🔴 | the row states `6e4d33f` and `203` ahead. At the regeneration instant `7dde8cb1`, `2026-09-20T14:36:16-07:00`, the branch had been at `a9a36405` and `205` ahead for 19m33s. Stale when written, and it survived two passes. | the same clock and method applied to all seven rows of that table: six match their branch exactly at that instant, only this one diverges. My pass 2 Y3 called the count exact for the head the row names, which is true and beside the point, since the head it names was already wrong. |
| A5 | the U12 handoff's `origin/main reaches six and all refs together reach fifteen` | 🟢 | capped at the handoff's own commit time `4d054892`, `2026-09-20T20:00:57-07:00`, all refs under `--full-history` return exactly 15 and `origin/main` exactly 6. Both figures are exact. | uncapped the same count is 17, and default simplified history on one ref is 6 or 7. My earlier red said every method gives seven; I had counted one ref with simplification and not the count the sentence names. The red is withdrawn. |
| A6 | the same handoff line on `#713`, its approved plan and its gate | 🟢 | `plan/gate-split` exists with a worktree, carries `.sdlc/plans/gate-split.md` with `status: approved` and `ticket: #713`, and line 10 reads `depends: #681 landed on origin/main`. Both clauses hold. | `#681` is open and no commit lands it, so a gate that had already been satisfied would have shown as such. The reviewer's red on this clause is rejected; only the R4 half of its finding survives, as A3. |
| A7 | the two pass 2 citation reds, `:90` and `:116` | 🟢 | both repaired and both now resolve in the cited file at `5f2c3787`. | reverting either hunk and re-reading the cited line returns the pass 2 text and the check reds again. |
| A8 | gates P1, P4, P5, P6, P7 at the head | 🟢 | run in this worktree: `npm test` exit 0, 48 of 48, tree clean after; branding, scope wall, em dash and baseline agreement all clean. | each control fired when planted: a retired brand string inside `.sdlc/` reds branding, an em dash reds P6. |
| A9 | CI required jobs | 🟢 | run `35556075569` on `ee854932`: `build-test`, `panda-smoke`, `corpus-contrast` all success. | the two prior runs on `3ee3c72b` and `712e63db` are separate runs on separate heads, so the green is not a cached verdict. |
| A10 | pass 2 Y2, `origin/main` behind | 🟢 | refetched: local `main` and `origin/main` are both `40de66b4`. | the same command showed an eleven commit gap in pass 2, so it can still show one. |

### What blocks

A1 to A4. None is a shape defect and none is caught by any criterion the plan carries; each is found
only by reading the cited record against the thing it cites. A3 and A4 are the sharper ones: both sit
in records that ride this PR rather than in `roadmap.md`, and both are the exact defect class U11 and
U12 repaired in the roadmap and did not sweep for anywhere else. That is ticket `#723`'s class, and
this is the third body of evidence for it.

### Three corrections to my own record

Pass 2 graded the `pif-u5-records` cell 🟡 on the ground that `203` is exact for `6e4d33f`. It is, and
the row was still false, because the head it names had already moved. A yellow that rests on an
internally consistent pair of figures, without asking whether the pair was current, is the same error
as grading the tally from the roadmap's own arithmetic.

Earlier this pass I argued the tally was exact within 23 seconds. That came from `git log -1 -- <plan>`,
the last commit touching the plan, where the question was when the U12 row entered it. `git log -S`
answers that and puts it 23 minutes the other way. The reviewer was right and I was wrong.

Against that, the red I carried on the U12 handoff's commit counts does not survive my own check, and
A5 withdraws it. Two of my three errors this pass come from choosing a measurement that was easy to
run over the one the sentence actually names.

### One note on the checker my own procedure leans on

`scripts/verdict.py check` at `0.2.0.pre-link.20260921T001353Z` exits 0 on this record, and it also
exits 0 on a copy with a row stripped of its id column, on a copy with the `verdict:` line deleted,
and on a file containing one line of prose. The only input that reds it is a path that does not
exist. So its green here certifies that the file is present and nothing else, and every row above was
re-derived by hand rather than accepted for passing it. Worth carrying into `#723`: a shape check
that cannot see a false claim is the known limit, but one that cannot see a missing `verdict:` line
either is a gap in the shape half as well.

### Pass 3 addendum: the reviewer's yellows, graded

The `reviewer-l4` report at `/Users/kimba/.claude/jobs/05defd58/tmp/rf3-prepr-pass3.md` also carried
four 🟡 and five lower notes that the table above was silent on. Graded here. The verdict and sha
above are unchanged; two of these are the same blocking class as A3.

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| A11 | `roadmap.md:117` cites `owner ruling R5` | 🔴 | no version of the rulings file that any current ref points at carries an `R5`. The roadmap pins itself at `5f2c3787` (`:6`, `:12`, `:64`) and that blob is `db07b39b`, headings `R1` to `R4` only. `R5` exists in exactly one transient version, `db718c18` at `2026-09-20T15:47:43-07:00`, renumbered away before the branch head. A reader following the citation as the document instructs finds nothing. The reviewer filed this under Lower; it is A3's class and it blocks. | the same sweep over all versions returns a hit for `R5` at `db718c18` and none elsewhere, so the search can find an `R5` when one is there. `R3` at `:39` and `R14` at `:35` both resolve, so the citation style is not uniformly broken. |
| A12 | the `#719` row: `the adapter and CLAUDE.md name three PR jobs, the skill names one` | 🔴 | `grep -rn 'build-test\|panda-smoke\|corpus-contrast' .claude/skills/shipping-changes/` returns zero hits. The skill names none of the three, not one. The row's other clause, that the skill never names `panda-smoke` or `corpus-contrast`, is true but is the weaker half of the same sentence. | the identical grep against `.sdlc/adapter.md` and `CLAUDE.md` does return the three job names, so the pattern matches when a file names them. |
| A13 | the `#686` row at `:30` and `:52`: `not itself blocked on #681`, `can start any time` | 🔴 | the record the row cites, `pif-u6.md:283` on `plan/preset-intent-fidelity`, reads `Issue #686 ... is closed by this fold`, naming both call sites and the scope correction. The fix is already written and ships with `#681`. Work that is done on an unlanded branch is neither startable at any time nor independent of `#681`. `#686` is still open on GitHub, which is what makes the roadmap's reading look plausible. | reading `pif-u6.md` for a finding it does not close, S3's siblings, returns open language rather than `is closed by this fold`, so the phrase is not boilerplate in that record. |
| A14 | the U11 handoff's `Nine commits, four of them roadmap-only` and its `roadmap-commits:` front matter | 🔴 | measured on the U11 branch against `3ee3c72b`: 14 commits, 7 of them touching `roadmap.md`. The front matter lists 4 shas. Both figures are wrong in the same direction. The reviewer measured 17 and 7 by a different traversal; our totals differ, our counts of roadmap-touching commits agree, and neither total is nine. | the same two commands run against a range with a known count reproduce it, and the 7 is stable across both our traversals. |
| A15 | the `#718` row's `filed this session by the U5 verifier's rerun of P7` | 🟡 | `#718` opened `21:45:38Z` already carrying the claim that the P7 time check cannot fail; the U5 verifier's rerun produced its correction at `21:59:32Z`, 14 minutes later. So the rerun did not file it, though it did correct it. I am marking this 🟡 rather than 🔴 because the row's verb is doing ambiguous work and I did not establish who opened it. | the two timestamps are from the issue and its comment thread and order the events unambiguously; what is not established is authorship, which is why this is not a red. |

Three of these four reds are citations that fail when followed, which is now six such defects on this
branch: the two U12 repaired, A3, A11, A12 and A13. None of them is reachable by any criterion the
plan carries. `#723` should be read as covering the class across every record a plan touches, not
`roadmap.md` alone, because five of the six sit outside the file the criteria point at.

### Correction to the note on the checker above

The note above says `scripts/verdict.py check` reds only a path that does not exist, and that its
green certifies file presence and nothing else. That is false. Read from its source, `check_file`
tests, for every 🟢 or 🟡 row of every table that has both a `state` column and a control column, that
the evidence cell contains at least one backtick span and that the control cell is not empty or
`none`. A table with a state column but no control column is named on stderr and skipped. It does not
read the `verdict:` line, the headline counts, or any prose.

All three of my controls fell into what it skips. A one-line prose file has no table, so it passes
vacuously. Deleting the `verdict:` line removes something it never reads. Stripping a row's id column
left the evidence and control cells intact, so both tests still passed. None of the three exercised
what the checker actually tests, and I concluded from that that it tests nothing. Every version of it
on this machine reds a green row whose evidence cell has no backtick span; my own U13 verdict's V10
row was exactly that, and the Orchestrator caught it before commit.

So the checker is narrow, not a no-op. What I should have written: its green certifies that every
graded row names a measurement in code formatting and states a control, which is a real property,
and nothing about whether the measurement is right. That is still why every row above was
re-derived by hand. A negative control has to be aimed at what a check tests; a control aimed at what
it skips proves only that it skips it.
