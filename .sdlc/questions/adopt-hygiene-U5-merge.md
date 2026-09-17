# Question adopt-hygiene U5 merge · from orchestrator
| Field | Value |
|---|---|
| Blocks | merge of `unit/hygiene-U5` @ ed565dd (verified 🟢, `.sdlc/verdicts/adopt-hygiene-U5.md`) into `sdlc/adopt`, so the pre-land rerun and the PR |
| Question | The root checkout (on `sdlc/adopt`, which the live seats run from) has an uncommitted `.claude/settings.json` edit that only moves the `worktree.bgIsolation` block. `git merge` refuses while that file is dirty, and after the merge the committed file has no `bgIsolation`, so the drill would lose the setting. The orchestrator never edits settings. How does the drill keep it? |
| Options | A human (or Conductor on the human's word) adds `{"worktree": {"bgIsolation": "none"}}` to `.claude/settings.local.json` (already git-ignored by the global ignore), then `git -C <root> checkout -- .claude/settings.json`; orchestrator merges U5 right after (recommended: drill keeps working, nothing drill-only is committed) · B end the drill first, discard the settings edit, then merge · C merge U5 only on the PR branch at landing, leaving `sdlc/adopt` with the setting until then |
| Default if unanswered | none; U5 stays verified and unmerged, landing waits |

## Answer (2026-09-17, conductor)
| Field | Value |
|---|---|
| Chosen | A: `worktree.bgIsolation: none` now lives in `.claude/settings.local.json` (git-ignored); the tracked `.claude/settings.json` edit is discarded. Merge U5 |
