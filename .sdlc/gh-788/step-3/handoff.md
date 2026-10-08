## Task goal
GitHub #788. Land the compute-layers plan (`.sdlc/plans/compute-layers.md`, status approved, written 2026-10-03 under the old Orchestrator workflow) on today's main. The plan's U1, U2 and U3 are already built and merged on branch `plan/compute-layers` (head `1a99d5ad`); U4 is built on branch `unit/cl-U4` (`3b2749b5`, `a2f82a32`) but was reviewed against the old base; U5 is unbuilt. Main has since landed T-0013 (chroma envelope presets, ADR-029), T-0014 (per-palette Base chroma, global k factors, persist schema 8, ADR-030), T-0015 (hue space applies to anchored palettes, ADR-031), T-0017 (Maison geometry ladder, persist schema 9, ADR-032) and T-0018/#809 (UI changes), so `plan/compute-layers` has conflicts and several of its assumptions are stale.

## Step 3: Gates green
level: L3
guard timeout: 1200
### Do
Run every gate in the branch worktree, each through `gate_lock.py run` with `SDLC_GATE_WORKERS=10` (the user's rule):
- `npm test`
- `npm run build`, which needs the `node_modules` that step 1's `npm ci` created
- the eight `gate:*` legs, one at a time, which is how the user wants `gate:sweeps` run
- the pre-land identity check against the branch point
- the neutrality report against the branch point

Fix any red that steps 1 and 2 introduced, in the file that owns it. A gate that was already red at the build-start HEAD is `inherited red`. If Chrome is present, also run `npm run smoke` under `gate_lock.py` and report the result; it is not a criterion because the plan cannot probe it.

Depends on: step 2.
### Acceptance criteria
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm test`
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm run build`
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm run gate:corpus-tonal`
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm run gate:corpus-anchor`
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm run gate:sweep-prime`
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm run gate:corpus-reset`
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm run gate:corpus-contrast`
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm run gate:mode-isolation`
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm run gate:even-dips`
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm run gate:chroma-envelope`
- (guard) `out=$(node scripts/report-preset-fidelity.mjs --identity-control --migrate --base "$(git merge-base origin/main HEAD)" --authored) && printf '%s\n' "$out" | tail -1 | grep -qx "0 differing cells"`
- `out=$(node scripts/report-compute-neutral.mjs --base "$(git merge-base origin/main HEAD)") && printf '%s\n' "$out" | tail -1 | grep -qx "0 differing cells"`
