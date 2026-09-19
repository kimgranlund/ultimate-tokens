# Approval: survey claim verdict of 2026-09-18, and what to refresh after it

date: 2026-09-18
asked by: conductor (sdlc-ultimate-tokens-conductor)
answered by: human (Kim Granlund)
refers to: .sdlc/survey.md (cf8e61a, corrected 33ee3b1), .sdlc/verdicts/survey.md (c1c0a32: 11 🟢, 3 🟡 C11 C13 C15, 1 🔴 C9)

## Q0 (asked earlier the same session)
Question: I found an already-approved plan, preset-intent-fidelity (#681, 6 units), that was never mobilized. Your approval said it runs after #662, #674 and #668 land, and all three are still open (#662 has PR #682). What should 'proceed' cover?
Options:
- Refresh survey, hold #681 (Recommended)
- Land the three fixes first
- Mobilize #681 now
Chosen: Refresh survey, hold #681 (Recommended)
Note: #662 landed as 1ea2f80 (PR #682) while the survey was being graded; #674 and #668 were still open.

## Q1
Question: The verifier graded the refreshed survey: 11 green, 3 yellow, 1 red. All three gates pass on cf8e61a (npm test 46/46, build, smoke). The red was a count error in my survey (test/ tracks 52 files and run.mjs registers 46, not 49 and 44), already corrected. Approve the claim verdict?
Options:
- Approve (Recommended)
- Show me the yellows first
- Hold
Chosen: Approve (Recommended)

## Q2
Question: The verdict shows other adoption records went stale: adapter.md and baseline.md still say 44 tests (now 46), baseline's bundle size and CI run are old, and 16 commits touched paths that architecture.md and debt.md cite. Also the two local-secret ignore rules live only on this machine, not in the repo. How much do I refresh?
Options:
- Small records unit (Recommended): one S plan, rerun the baseline, fix the 44 to 46 lines, add the two ignore rules to .gitignore, land with the survey as one PR; architecture and debt get re-checked per plan, where a plan touches them
- Full re-adoption A2 to A6
- Survey only
Chosen: Small records unit (Recommended)

## Q3
Question: There is no .sdlc/roadmap.md, so nothing ranks the open work (#681 P1 held, plus the other open issues). Have a planner draft one from the open issues for you to rank?
Options:
- Yes, draft it (Recommended)
- Not now
Chosen: Yes, draft it (Recommended)

## Q4
Question: Another session (most likely ultimate-tokens-4b, the one that took your #681 approval) is building #681 U1 right now: it just committed 7a317e0 on unit/pif-u1-anchor (26 files, Sonnet builder), outside this SDLC's orchestrator and before #674 and #668 landed. It also drives the 638, 668 and 674 worktrees. Who owns #681 and those fixes?
Options:
- That session owns them (Recommended): the sdlc seats keep hands off #681, #638, #668, #674 and list them as in flight outside sdlc on the roadmap
- Move #681 to these seats
- I will sort it out myself
Chosen: That session owns them (Recommended)

## Q5
Question: The verifier found the records-refresh plan fully checkable (14/14 criteria, 0 returned to the planner). Approve it for mobilization? It reruns the baseline, fixes the stale 44-to-46 test count in adapter.md and baseline.md, and moves two local-only ignore rules into the repo's .gitignore.
Options:
- Approve (Recommended)
- Show me the plan first
- Hold
Chosen: Approve (Recommended)

## Q6
Question: While assembling the roadmap for your approval, I found the other session had also fully built #673 (unpushed commit) and was mid-edit on #672, both of which the planner had drafted as "ours to take next." I withdrew that recommendation. With #681, #674, #638, #668, #673 and #672 all in flight elsewhere, and records-refresh the only thing left for our seats, what should our seats do once records-refresh lands?
Options:
- Stand by (Recommended): no new plan, watch the board, report when a lane frees up or something new needs planning
- Take an owner-tracked item (#602, #519, #514, #496)
- Something else
Chosen: Stand by (Recommended)

## Q7
Question: The sdlc-orchestration conductor is waiting on a C31 unit from this repo: the A2 map gains a Doc drift section and the A2 verdict grades all 18 conventions one row each, landed by PR. That instruction was lost when the seats churned; nothing here has started it. How do I take it?
Options:
- Add as U2 of records-refresh (Recommended)
- Separate S plan after records-refresh
- Not now
Chosen: Add as U2 of records-refresh (Recommended)

## Q8
Question: U2 is drafted (criteria U2-1 to U2-8). One shape question is yours: the other repo's C31 check counts graded rows across the whole verdict file, and appending a pass 5 with 18 rows leaves the old passes 1 to 4 in the file too, so the literal count is higher than 18 and passes only with a recorded substitution. How should the A2 verdict be shaped?
Options:
- Append pass 5, record the substitution (Recommended)
- One live table, move passes 1 to 4 out
Chosen: Append pass 5, record the substitution (Recommended)

## Q9
Question: U2's eight criteria passed the checkability review (8/8). In short: 1 Doc drift section present and last; 2 map, note and baseline name the same head; 3 every drift row quotes its doc line at HEAD, with a check script; 4 the script matches the plan text; 5 U1's note untouched, zero deletions; 6 builder's 18-convention evidence table; 7 verifier's pass 5 with 18 graded rows; 8 the drill's own C31 block passes with the recorded substitution. Approve U2 for dispatch after U1 verifies?
Options:
- Approve (Recommended)
- Hold
Chosen: Approve (Recommended)

## Q10
Date: 2026-09-19
Question: Approve the records-refresh amendment U3 (0e85638, M, l2), re-measure at 20298cc after #706: #706 changed the toolchain the baseline describes (Node 24, vite 8.3), so every figure measured at d814500 is stale on arrival. U3 reruns the three gate triples with loads recorded, re-checks §8 row by row and redoes the Counts bullet at the head, re-derives the adapter's time ranges, reruns the 18 controls, corrects K17's exception list (pass 5's one red), and keeps the d814500 figures as a labelled prior set. Checkability review 10/0/0 at 0e85638.
Options:
- Approve (Recommended)
- Skip U3, land with d814500 figures labelled
- Send back
Chosen: Approve (Recommended)

## Q11 (2026-09-19)
Question: Heads-up from the plugin repo: a pre-commit check landing in a few hours will refuse any commit touching a file that defines criterion ids outside their owning plan. Our .sdlc/adapter.md defines C1 to C13 (its conflict table), and records-refresh U1 already edits that file. Once the check is live, pre-land fixes to adapter.md would be blocked until those ids are renamed. When do we do the rename?
Options:
- Add as U3 of records-refresh (Recommended)
- Separate S plan later
- Not now
Chosen: Add as U3 of records-refresh (Recommended)
Note: the unit landed as U4 of records-refresh because U3 (re-measure at 20298cc, Q10) already held that slot; renumbered at 265b8706.
