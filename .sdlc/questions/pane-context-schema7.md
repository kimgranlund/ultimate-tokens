# Question pane-context C2.8 re-pin · from orchestrator

| Field | Value |
|---|---|
| Blocks | pane-context pre-land (the verifier re-runs every criterion at the plan head) |
| Evidence | md-prefix landed (PR #795, `620d0323`) and set `CURRENT_SCHEMA_VERSION` to 7 in `src/ui/persist.js`. C2.8 pins `CURRENT_SCHEMA_VERSION = 6` and `version: 7` count `0`, so it reads `0` and `1` at the merged head. Nothing in pane-context's design changed: it still adds no migration (R98). |
| Question | May the plan take revision 13 (past the cap of 5) to re-pin C2.8 to the merge-base value: `CURRENT_SCHEMA_VERSION = 7` count `1`, and no pane-context `RENAME_MAPS` entry, with the same negative control shifted one version? |
| Options | A (recommended): yes, mechanical re-pin only, same shape as chroma-envelope's relative-schema revision. · B: no, make C2.8 relative (`merge-base value`) and take the same revision. · C: no, a fresh plan |
| Default if unanswered | A, proceeding so the merge and pre-land are not blocked; the revision row names this document |

## Answer

| Field | Value |
|---|---|
| Asked | 2026-10-03, via AskUserQuestion |
| Chosen | A: "Re-pin to 7 (Recommended)" |
| Ruling | revision 13, mechanical re-pin of C2.8 to the merge-base value 7 |
