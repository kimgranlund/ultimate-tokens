# records-refresh pre-land review, reviewer-l3, graded at 0dabfd1a

Verdict: FIX-FIRST. Three live records under `.sdlc/` are untrue at the head the plan names, and
two of them were made untrue by this branch. The plan's central claim, that no record carries a
number nobody measured at the head it names, does not hold yet.

Gates all green at 0dabfd1a: P1 48 files and tree clean, P4 branding clean 460 files, P5 scope
wall 0, baseline-agrees-check seven ok with stale total 0, doc-drift-rows-check 56 rows 11
drifted 45 holds 0 undetermined 0 bad, U4 rows 1 and 2 reproduced with their controls biting.
P2 and P3 were not run: the host was at load 11.46 on 10 cores. The pre-land verifier still owes
both. The citation audit passes but is vacuous here, because it scans `docs/` and never `.sdlc/`.

## Findings

F1. `.sdlc/debt.md:92` was orphaned by U3's own K17 change and never repaired. It still says the
control filters 3 files while U3 widened the filter to 7. Whoever takes debt K17's fix sizes the
allowlist from that number and re-reds K17 on the first run. This branch's own damage.

F2. `.sdlc/architecture.md:18` says pass 5 stays graded at `d814500`. Pass 5's own header says it
was graded at `d46ae48` with merge base `20298cc`; `d814500` is where U2's handoff measured. The
plan carries the same error in two places, so U3 transcribed it faithfully and its shape-only
criteria passed it. This branch's own damage.

F3. `.sdlc/adapter.md:35` tells every verifier to expect 17 FAIL from the P1 negative control.
The repo recorded that as 3 one plan ago, and every records-refresh verdict measured 3. U1-5's
sweep regex cannot see the phrase, so the sweep that exists to prove no copied number survives
missed a live contradicted one in a file U1 edited.

F4. U4 traded one id collision for another: `.sdlc/architecture.md:75-80` already defines claims
X1 to X6, so X1 to X6 now name two different things in two live records. The plan's collision
check omitted architecture.md, the only live record that already owned an X series. Two debt
notes now claim the shared-prefix hazard is gone, which is false twice.

F5. `.sdlc/roadmap.md` lands in this PR although the plan's own Not-in-scope table says it is
separate work, and it is stale at the head it ships against: a head line naming a different sha
than its own table, "Nine worktrees" over eight rows, four rows naming worktrees that no longer
exist, two live ones unlisted, and an unanswered owner question with a "Your move" line.

F6. `.sdlc/baseline.md:42` attributes the added test file to #706. It came from #699. #706 never
touched the runner.

F7. The baseline is not the one home for all five gates: adapter §1 lists five, baseline measures
three, and `corpus-contrast` appears nowhere in the baseline or the check script while adapter
carries a time figure for it. That is the exact defect shape this plan set out to kill. Same row
also carries arithmetic that does not hold (343 x 3 is 1029, not 22680; the real chain is 343 docs
to 3780 palettes to 7560 cells per tone mode), and the baseline says one CI run reports two jobs
green when it reports four, one of which is a real gate #674 added.

F8. Two criterion texts go red at pre-land, as criterion defects rather than record defects. P2's
grep now matches the live row and the prior-set row, so as written it cannot pass. U2-7's last
sub-check expects 1 and gets 3, because pass 5 names the head three times. Related: pass 5's
closing observation still reads as an open finding that U3 has since resolved.

F9. Board and plan disagreed on U4's grade and the board said 7/7 over a 🟡. Resolved by a
parallel commit; I reran the 🟡's sub-check at pre-land and it prints 0.

F10. `.sdlc/baseline.md:12` cites a branch sha the squash will drop, which is the one place the
plan said it would not do that.

## The four deferred notes, one ruling each

1. P2's KB grep: fix the criterion, not the record. Scope it to the live table.
2. Smoke's glyph: accept, and write the rule down, because the branch currently applies two
   opposite rules to the same case and one of them falsified a quotation of real program output.
   Quote generated output verbatim; if a glyph must change, say so in the cell.
3. The #706 shorthand: fix one clause now, the one that attributes #699's work to #706.
4. DD19 and DD33: accept the rows, they cite #699 correctly. Only the baseline prose misattributes.

## Two questions for the Conductor

Q1, how much blocks the squash: (a) fix F1, F2, F3 only and ticket the rest, recommended, because
F1 and F2 are this branch's own damage and each is a one-cell edit and F3 is one word; (b) add F4
and F6; (c) everything including F5 and F7; (d) land as is and ticket all ten.

Q2, does `.sdlc/roadmap.md` belong in this PR: (a) keep it and amend the plan's scope wall and
Landing to name it, recommended; (b) drop it and land it separately; (c) keep it and record the
exception in the pre-land verdict.

## One coordination fact

The branch head moved during the pass. This review graded `0dabfd1a`; the worktree is now at
`e60a4286`, three `.sdlc`-only commits from a parallel pre-land pass. They resolve F9, partly
resolve F5, and introduce the falsified quotation named in ruling 2. None of them touches F1, F2,
F3, F4, F6, F7 or F8.
