# Question anchor-gaps revision cap · from orchestrator

| Field | Value |
|---|---|
| Plan | .sdlc/plans/anchor-gaps.md (#740, #744), plan branch head 9f5a4bac |
| Date | 2026-09-29 |
| Asked by | Orchestrator; the Conductor asks the owner through AskUserQuestion and writes the answer below |
| Trigger | revision-cap hook: 6 revision rows after the draft row (cap 5), on the main copy of the U2 merge row |
| Blocks | the main-side board and plan copy commit for the U2 merge, then the anchor-gaps pre-land request; U2 is already merged on plan/anchor-gaps |
| Default if unanswered | A, continue to landing |

## Question
anchor-gaps has 6 revisions. Both units are merged on the plan branch (U1 🟢, U2 cleared 🟡 on pass 2). Revision 6 was the U2 pass 2 re-diagnosis (plan text and the P4 wall only, no new scope); the sixth row is the U2 merge itself. What remains is pre-land. How should it continue?

Options: A continue to landing, revisions allowed for pre-land findings only, no new scope (Recommended) · B continue, cap at 2 more · C re-plan

Chosen:

## Answer
Chosen: A, "Continue to landing (Recommended)", owner via AskUserQuestion, 2026-09-29 (R72). Pre-land runs next; fixes come only from its findings.
