# Question prompt-audit P2 · from orchestrator

| Field | Value |
|---|---|
| Blocks | prompt-audit pre-land P2 (Expected `stale total: 0`), and the same check on anchor-gaps pre-land |
| Finding | `sh .sdlc/checks/baseline-agrees-check.sh` on main prints `STALE time test: baseline 167 to 268 s, adapter 80 to 89 s` and `stale total: 1`. Inherited from main, not from either plan's diff. Both unit builders (pa-U9, ag-U2) saw the same line. |
| Question | Who reconciles the `time test` row with adapter §1 before pre-land? |
| Options | A a one-row records fix on main by the Conductor, both plans merge main before pre-land (recommended: the row is main's, not a plan's) · B fold the fix into prompt-audit as a plan revision · C the Verifier grades P2 on the ui.html leg only and names the time row as inherited |
| Default if unanswered | A |

## Answer

| Field | Value |
|---|---|
| Chosen | A, "Fix on main" |
| By | owner via AskUserQuestion (R71) |
| Date | 2026-09-29 |
| Written back by | Conductor |
| Fix | adapter §1 test row now cites the baseline's row of record (167 to 268 s, under load); the quiet-host 50-file set stays as history in the same cell. Both plans merge main before pre-land. |
