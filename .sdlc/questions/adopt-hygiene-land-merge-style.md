# Question adopt-hygiene landing · from orchestrator
| Field | Value |
|---|---|
| Blocks | the merge of PR #653, so the whole landing and close-out |
| State | pre-land 🟢 on 48a69ae, CI green on 48a69ae (build-test, panda-smoke), land gate accepted the record; only the merge call fails |
| Question | `adapter.py` hardcodes `gh pr merge --merge` (scripts/adapter.py:500), but this repo is squash-only since U3 (`allow_merge_commit false`), and `.claude/workflow.json` and `.sdlc/adapter.md` both say the style is squash. GitHub refuses: "Merge commits are not allowed on this repository". Who fixes the adapter? |
| Options | A the plugin-author seat adds a squash style to `adapter.py` from `.sdlc/config.json` or `.claude/workflow.json`, then I rerun `land --gate` (recommended: the plugin is the defect, and this is the drill's finding) · B a human runs the squash merge on #653 by hand and I resume at close-out, with the adapter gap filed as debt · C reopen `allow_merge_commit` on the repo so the adapter's call works, which undoes U3 criterion 3 |
| Default if unanswered | none; the plan holds one call short of landing |
