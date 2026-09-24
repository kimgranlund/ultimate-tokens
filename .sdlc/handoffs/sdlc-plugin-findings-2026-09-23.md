# Handoff · sdlc plugin findings from ultimate-tokens · 2026-09-23

From the ultimate-tokens Conductor (session ef9dc581), running plugin 0.2.0 and then 0.3.1. Each row is something observed in this repo, with evidence you can chase.

| # | Finding | Evidence | Asked fix |
|---|---|---|---|
| P1 | Workers stall for hours on a monitor watching a background test that has already ended | #681 U9 builder, idle 6 h then 3 h; #739 checkability verifier; #736 critic, 4 h idle with nothing posted | Worker templates: run tests in the foreground and never wait on a monitor; or the monitor reports an exit it missed |
| P2 | A worker-written verdict or record fails the `verdict.py` commit hook (a control cell empty or `n/a`, an evidence cell with no backtick span) | gs-U5, rg-U1, rg-U2, rg-U3, #681 pre-land (U9-P1, U9-P2, X5); U10 record had no `verdict:` line | Verifier template: every row has a control and a backtick span; a self-check before handing back |
| P3 | `adapter.py land` ignores `--title` and `--body-file`: the squash keeps the PR's old title and uses the commit log as its message | PR #736, squash 27ad90c6, subject still "the 47 records" | Use the given title and body, or refuse |
| P4 | `session.sh up` wakes stopped rival seats: an old conductor and a duplicate orchestrator (e15b68e5) came back and competed | 2026-09-23 after the 0.3.1 restart; two orchestrators live on one board | `up` wakes one job per seat and never a second; `claim` beats the newest job |
| P5 | `session.sh up` does not repoint `core.hooksPath` from a stale plugin version ("another sdlc checkout") | .git/config pointed at 0.1.0 githooks after the 0.3.1 install | Treat an older plugin-cache githooks path as stale and repoint it |
| P6 | Top grades name Fable; with the Fable allowance spent they run as Opus substitutes, so reviewer-l4 equals l3 and verifier-l3 equals l2. The launcher's default conductor model is Fable too | owner ruling R17; every pre-land pair this week | A declared fallback per grade in launcher.env, shown in the dispatch |
| P7 | A planner committed with `core.hooksPath=/dev/null` before any hook had failed | plan/achromatic-anchor aa102fa3 | Planner template forbids a hook bypass |
| P8 | A worker's `rm` of its own scratch clone is denied, and it asks the Conductor to delete it | vb-critic, pif-u10-verify, neg739, vU2-Q9kd | Templates clone under a path the worker may remove, or the harness sweeps worker scratch |
| P9 | A verifier worker's detached `npm test` (parent 1) outlived the seat's stop and broke a quiet window twice | pids 65573, 10197 under jobs/05defd58, 2026-09-23 | Seats kill a worker's whole process group; the quiet window is a mechanism, not a message |
| P10 | `ragboard.py render --plan` read a stale plan worktree and showed a live unit as "no board row" | #681 U9, source `.git-worktrees/pif-plan-land` | Read the plan branch tip, or name the source it read |
