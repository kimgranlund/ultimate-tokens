# Wave B brief · parallel-batch · orchestrator to builders

| Field | Value |
|---|---|
| Plan | `.sdlc/plans/parallel-batch.md` (read it from `.worktrees/pb-<U>/.sdlc/plans/parallel-batch.md`) |
| Base | `plan/parallel-batch` @ 7af47a84 (main 95816312 merged in; #785 is on main). One worktree per unit: `.worktrees/pb-U4`, `.worktrees/pb-U8`, branch `unit/pb-<U>` |
| Criteria | your unit's section in plan §3 (design) and §5 (`### U<n> criteria`), plus the plan-level gates in §4 |
| Handoff | write `.sdlc/handoffs/parallel-batch-<U>.md` in your worktree (status-style shape, a Findings section, the criteria rows with commands run and output) |
| Grades | U4 builder-l3, reviewer-l2, verifier-l2. U8 builder-l5, reviewer-l3, verifier-l2 |

## Rules
- Stay inside your lane (the `- [ ] U<n>` line in plan §5). A file outside it is a scope red: ask the Orchestrator, never edit silently. `git diff --name-only <base>..HEAD` lists only the lane plus regenerated bundles plus your handoff.
- No U+2014 anywhere; `node test/repo/em-dash.mjs` and `node test/repo/branding.mjs` green. R98: no override, shim or fallback; one predicate, not a list of exceptions.
- Many gates run at once. Before `npm test`, `npm run build` or any `gate:`: `unset NODE_OPTIONS` and `ps -Ao command | grep -E 'test/run.mjs|gate:|--full' | grep -vc grep` must print 5 or fewer; if not, wait inside your turn and retry. `npm ci` first for units touching `src/`. Poll inside your turn; never end the turn waiting.
- Scratch only under `/Users/kimba/.claude/jobs/8c58a81c/tmp/pb-<U>/`. Never cd outside your worktree; use absolute paths.
- Commit on `unit/pb-<U>` with trailer `Seat: builder` and the Co-Authored-By line; return the sha and a one-line summary. Do not push.

## U4 (#786)
- Line numbers on the head: the write is `src/ui/sections/color.js:258` inside `selectPalette(:255)`; callers at `:349`, `:478`, `:939`, `:990`, `:1149`, `:1950`, `:1960` and `src/ui/app.js:536`. Only the three row click handlers (palette list, ramps scene, mapping scene rows) keep the write.
- Add the `(b3)` assertions named in C4.2 and C4.3 exactly (labels are grepped). Plant the C4.1 negative control in a scratch clone and show it reds.
- Amend `.sdlc/questions/pane-context-U1-f1.md` (dated line under Answer, naming #786 and option B). Do not edit the archived pane-context plan.
- `npm run smoke` is the verifier's leg, but run the headless shim yourself.

## U8 (#784)
- Measure first: land the committed report mode, reproduce the C8.1 figures at the unit base, then diagnose, then fix. The Findings name a quantity with numbers, not "edge rotation".
- Q3 is ruled: U8 lands before compute-layers U4, so edit the current `ramp` path in `src/engine/tonal.js` (compute-layers has not frozen `ramp@1`).
- Copy the six `identity` lines into the handoff and compare to the declaration. Timing (C8.8) needs a quiet host: run it only when the heavy count reads 0, and say so; if load does not allow, report the readings you got and the load.
- Gates are the engine gates in plan §5 C8.1 to C8.8; `npm run build` after `npm ci`.
