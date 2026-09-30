# Question chroma-envelope U2 · from orchestrator

| Field | Value |
|---|---|
| Blocks | chroma-envelope U2 merge, then U3, U4 and pre-land (#725, draft PR #777) |
| Evidence | `.sdlc/verdicts/chroma-envelope-U2.md` (🔴 at `0627f874`), `.sdlc/reviews/chroma-envelope-U2-review-p2.md` (PASS), `.sdlc/plans/chroma-envelope-U2-rediagnosis.md` |
| Finding | Pass 2 is 🔴 on one row. Every engine and gate row (C2.1, C2.2, C2.4 to C2.8, scope) is 🟢 with biting controls. C2.3's gate is right (72 excluded, 0/3692), but the comment the unit wrote at `test/engine/tonal.mjs:1850` still says 15 and 3,749. The 🟡s are records only: the `.sdlc/baseline.md` ui.html row (4141.3 to 4148.2 KB), 31 undeclared FLOORS cell moves (none crosses a pin), and a vacuous control at `test/ui/shell.mjs:286`. The plan text also needs fixes: C2.3's counts, C2.5's `--authored`, C2.7's 8.2782 (the even figure; peak was 8.2001), the lane paths, and C3.7's 120 s, which `anchor.mjs --full` now exceeds (122 s against a 93 to 97 s base). The protocol never dispatches Pass 3 without a ruling, and the plan is past its revision cap. |
| Question 1 | How does U2 close? |
| Options | A (recommended): a narrow pass 3 by builder-l7. Touch only test comments, the shell control, the FLOORS declarations and `.sdlc/baseline.md`, with no engine or gate change. The verifier re-checks the changed rows and carries the rest, as its finding 6 allows. · B: return U2 to the planner for a fresh diagnosis. Nothing in the evidence points at a wrong model. |
| Question 2 | May the plan take revision 6 (a seventh revision row) for the plan-text fixes above? It would also move U3's engine cap flag into U3's criteria so it recovers C3.7's time, or re-time C3.7 if it cannot. |
| Options | Yes (recommended) · No, keep revision 5 and let U3 read C3.7 red as a declared deviation |
| Default if unanswered | none: the protocol reserves pass 3 and a revision past the cap for the owner |

## Answer (R75)

| Question | Chosen |
|---|---|
| 1 | A, narrow pass 3 by builder-l7: comments, shell control, FLOORS declarations, baseline row; no engine or gate change (owner via AskUserQuestion, 2026-09-29, R75) |
| 2 | Yes, revision 6 for the plan-text fixes; U3 recovers C3.7's time or re-times it (owner via AskUserQuestion, 2026-09-29, R75) |
