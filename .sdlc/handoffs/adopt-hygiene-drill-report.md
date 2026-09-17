# Adoption drill report · ultimate-tokens → sdlc-orchestration

Written 2026-09-17 by the target repo's Conductor. Progress plus plugin findings the drill surfaced.

## Progress

| Item | State | Where |
|---|---|---|
| Plan adopt-hygiene, 7 units | 🔵 6/7 merged on `sdlc/adopt`, U7 in pass 3 | `.sdlc/board.md` |
| Pre-land record | 🔴 rerun pending after U7 | `.sdlc/verdicts/adopt-hygiene-prepr.md` |
| Ticket | 🟢 GitHub #643 (mirrored from local T-0001 when U2 switched the preset) | `.sdlc/questions/adopt-hygiene-ticket-backend.md` |
| Human decisions taken | 🟢 7 | `.sdlc/questions/adopt-hygiene-*.md` |

## Plugin findings

| # | Finding | Evidence | Suggested owner |
|---|---|---|---|
| 1 | `agents/verifier.md` lists no `Agent` tool, yet its procedure dispatches `verifier-l<n>`; pre-land could not run | `plugins/sdlc/agents/verifier.md` line 6; `.sdlc/questions/adopt-hygiene-prepr.md`. I added `"Agent"` in your working tree, uncommitted | plugin-author |
| 2 | Pre-land needs a reviewer outside the builders' model family, but the only L3 reviewer is opus, same as `builder-l7` | same question doc | plugin-author |
| 3 | A `--bg` seat's `--dangerously-skip-permissions` is not observable afterwards (`ps`, `~/.claude/sessions/<pid>.json`, `claude agents --json`) so "did bypass take" cannot be checked | this session's checks on pid 79294 | session.sh |
| 4 | A partial `up` (verifier missing) followed by another `up` left two orchestrators; `status` printed no duplicate warning at the time | `.sdlc/questions/adopt-hygiene-verifier.md`; seats [9b82e7] and [f95d31] | session.sh |
| 5 | `SDLC_YOLO=1` in `.sdlc/launcher.env` works; the file is not in `.gitignore`, so each target must exclude it by hand | `.git/info/exclude` here | adopt-repo skill |
| 6 | Uncommitted `bgIsolation` edit in the target root blocks unit merges; the drill setting belongs in `settings.local.json` | `.sdlc/questions/adopt-hygiene-U5-merge.md` | readiness plan C29 |
