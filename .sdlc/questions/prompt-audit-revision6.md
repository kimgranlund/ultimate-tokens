# Question prompt-audit revision cap · from orchestrator

| Field | Value |
|---|---|
| Plan | .sdlc/plans/prompt-audit.md (#758), plan branch head f6cd69cb |
| Date | 2026-09-29 |
| Asked by | Orchestrator; the Conductor asks the owner through AskUserQuestion and writes the answer below |
| Trigger | revision-cap hook: 6 revision rows after the draft row (cap 5), on the main copy of revision 7 |
| Blocks | the main-side board and plan copy commit for the U2 merge and the U6, U7, U10 dispatch; the builders are already running on their unit branches |
| Default if unanswered | A, continue to landing |

## Question
prompt-audit has 7 revisions. U1 to U5 are merged. Revision 7 adds U10 (S): two voice-parity gaps the Verifier found in U2's verdict and ruled plan scope, each with a failing control. U6, U7 and U10 are building now; U8 and U9 wait for docs-repair (#751) to land. How should it continue?

Options: A continue to landing, revisions allowed for U6 to U10 and pre-land, no new scope (Recommended) · B continue, cap at 3 more · C re-plan the remainder

Chosen: A, "Continue to landing (Recommended)", owner via AskUserQuestion, 2026-09-29 (R67)
