# Question adopt-hygiene · from orchestrator
| Field | Value |
|---|---|
| Blocks | ticket status comment for T-0001; the plan's landing (`land --draft`, `close`) |
| Question | U2 merged `.sdlc/config.json` with preset `github`, so `adapter.py` now reads T-0001 as a GitHub issue and fails (`invalid issue format: "T-0001"`). The plan's ticket lives in `.sdlc/tickets/T-0001.md` (local). Which backend owns this plan's ticket? |
| Options | A mirror T-0001 to a GitHub issue now (`adapter.py create --body-file .sdlc/plans/adopt-hygiene.md`), repoint board rows, keep local file as history (recommended: the landing PR needs a github ticket anyway) · B finish this plan on `--backend local`, github from the next plan · C revert the preset until landing |
| Default if unanswered | B; units keep moving, ticket updates run with `--backend local` |
