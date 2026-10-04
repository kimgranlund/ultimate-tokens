# Wave A brief · parallel-batch (#786 anchor) · orchestrator to builders

| Field | Value |
|---|---|
| Plan | `.sdlc/plans/parallel-batch.md` (approved 4ffd0aca; read it from `.worktrees/pb-<U>/.sdlc/plans/parallel-batch.md`) |
| Base | `plan/parallel-batch` @ 61bcd123, one worktree per unit: `.worktrees/pb-U1` `pb-U2` `pb-U3` `pb-U5` `pb-U7`, branch `unit/pb-<U>` |
| Criteria | your unit's section in plan §3 (design) and §4/§5 (`### U<n> criteria`), plus the plan-level gates in §2 |
| Handoff | write `.sdlc/handoffs/parallel-batch-<U>.md` in your worktree (shape per status-style; doc-shaped units U1 and U2's adapter paragraph also carry a `## Claims` ledger and a `~~~sh ran` / `~~~out ran` pair) |

## Rules for every wave A unit
- Stay inside your lane (the `- [ ] U<n>` line in plan §5). A file outside it, or a file in plan §1's in-flight lists, is a scope red: ask the Orchestrator, never edit silently. `git diff --name-only <base>..HEAD` lists only the lane plus your handoff.
- U5 and U7 are hunk-level: pane-context (#785) edits `typography.js` at `:137`, `:325-387`, `:607` and `test/repo/citations.mjs` at `:61` and `:84-85`. Re-check at dispatch with `git diff -U0 origin/main...origin/plan/pane-context -- <file>`, and keep every hunk of yours clear of those ranges. Say so in the handoff.
- No U+2014 anywhere; `node test/repo/em-dash.mjs` and `node test/repo/branding.mjs` green. R98 applies: no override, shim or fallback.
- Many gates run at once on this machine. Before `npm test` or `npm run build`: `unset NODE_OPTIONS` and `ps -Ao command | grep -E 'test/run.mjs|gate:|--full' | grep -vc grep` must print 3 or fewer; if not, wait and retry, and say in the handoff if you could not. `npm ci` first for units touching `src/`, `scripts/`, `figma/binder/`.
- Scratch only under `/Users/kimba/.claude/jobs/8c58a81c/tmp/pb-<U>/`. Never cd outside your worktree; use absolute paths.
- Commit on `unit/pb-<U>` with trailer `Seat: builder`; return the sha and a one-line summary. Do not push.
