# Question gates-batch pre-land · from orchestrator

| Field | Value |
|---|---|
| Blocks | gates-batch (#776) pre-land pass 2; `set-status verified` |
| Evidence | `.sdlc/verdicts/gates-batch-prepr.md` (🔴 at 8bcf5312), findings 1 and 2. Every plan and unit row holds and CI is green |
| Finding 1 | `baseline-agrees-check.sh` reads `STALE ui.html: baseline 4141.3 KB, tree 4141.8 KB`. U2's and U3's comment edits are inlined into `figma/plugin/ui.html`. Plan C3 forbids any `.sdlc/baseline.md` diff, so fixing the row breaks C3. Prior plans record a dated Correction in `.sdlc/baseline.md` |
| Question 1 | May the plan take revision 5 (its sixth revision row) so C3 admits the `ui.html` size row and one dated Correction, as revision 4 admitted generated assets? |
| Options | A Yes (recommended): orchestrator writes revision 5, a builder-l1 updates the row plus Correction on the plan branch, main merged in, pre-land pass 2 · B No: plan returns to a planner |
| Finding 2 | Draft PR #781's title is not the plan's Landing title. `adapter.py land` does not edit an existing PR's title, and seats never call `gh` directly. The squash commit subject comes from the PR title |
| Question 2 | Who sets the title to: `test(gates): citations count-phrase and bare-filename legs, fact-pin literal guard, binder renameparity, em-dash string-bound E1/E2 (#776 #775 #769 #772 #764)`? |
| Options | A The owner's terminal runs `gh pr edit 781 --title "<title above>"` (recommended) · B The Conductor sets it at the held land |
| Default if unanswered | none: Q1 re-rules a plan criterion, Q2 needs an action outside the adapter |

## Answer

| Field | Value |
|---|---|
| Date | 2026-09-30 |
| Q1 options | Yes, revision 5 (Recommended) · No, back to planner |
| Q1 chosen | Yes, revision 5 (Recommended), option A (R83) |
| Q2 options | Conductor, at merge (Recommended) · You, from your terminal |
| Q2 chosen | Conductor, at merge (Recommended), option B (R83): the Conductor runs gh pr edit 781 --title before the squash |
