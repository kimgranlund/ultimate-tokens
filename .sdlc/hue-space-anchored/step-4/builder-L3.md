<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/hue-space-anchored/docs/reports/2026-10-07-hue-space-anchored.md: new report with these sections: `## Command` (commands, base `10352b1a`, the drift script, sweep leg times), `## Movement`, `## Hue-space bounds`, `## Re-pinned gates`, `## Follow-ups`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/hue-space-anchored/docs/references/decision-records.md:
  - New ADR-031, "The hue space is hue constancy through the anchor", placed before the Quick map.
  - ADR-026's #725 amendment now reads "made structural (superseded by ADR-031 on 2026-10-07: ...)".
  - New Quick map row for ADR-031, and the amendment appended to ADR-026's Quick map row.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/hue-space-anchored/docs/references/knowledge-02-tonal-scale.md: the `hueSpace` controls row and a new §9 paragraph state the new rule; one comment on the §8.3 pseudocode hue line says it is the cam16 case.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/hue-space-anchored/.claude/skills/color-math/SKILL.md: new bullet in the hue-model list for anchored palettes.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/hue-space-anchored/docs/specs/spec-muted-base-key-spikes.md: REQ-053 rewritten.
  - The cusp-identity path keeps no per-rung re-solve.
  - The stored-anchor path holds the anchor's CAM16 hue under cam16 and solves per rung under oklch.
  - The sentence "there is NO hue re-solve in the prime system" is gone.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/hue-space-anchored/docs/specs/lld-muted-base-key-spikes.md: item 5 gains a 2026-10-07 re-statement.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/hue-space-anchored/docs/references/component-inventory.md: moved the `sections/color.js` line citations to their current lines (step 3 had shifted them).
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/hue-space-anchored/docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md: one citation moved, `color.js:2009` to `:2001`, for the same reason.

## Checks
- Criterion 1, the report headings and command string: exit 0. Run again after the last edit to the report.
- Criterion 2, report command: `node scripts/report-preset-fidelity.mjs --identity-control --migrate --authored --base "$(git merge-base HEAD main)"`
  - Exit 0 in 2:28, run once on HEAD 77d9230d. No engine or UI file changed after that run.
  - The criterion's greps were applied to the saved output and returned exit 0.
  - Output: `ramp perceptual|peak|even: 0 of 94900 cells differ`, `prime: 3147 of 3796 strips moved`, `key: 0 of 3796 tiles moved`.
- Criterion 3, the ADR heading, Quick map row and ADR count (base 30, head 31) with `SDLC_BASE_SHA` from `step-4/base-sha`: exit 0.
- Criterion 4, the Q-D supersession regex: exit 0.
- Criterion 5, the spec sentence is gone and all four files contain the required fragment: exit 0.
- `node test/engine/anchor.mjs --full`, run directly: exit 0 in 7:47.
  - `prime-huespace`: default kit 16 of 16, corpus 3131 of 3380, max dE 0.0307.
  - `anchor-f4 hueSpace`: even 0.0281, perceptual 0.0164, peak 0.0169; bound control 0.0474.
- Default-kit ladder drift, measured with the drift script on head and on a throwaway worktree at base `10352b1a` (since removed): before 0.41 to 7.97 degrees, after 0.12 to 0.65.
- (guard) `gate_lock.py run --name npm-test -- npm test`: exit 0, 348 s, "all 54 test files passed".
- (guard) `gate_lock.py run --name build -- npm run build`: exit 0, about 6 s. The output shows the generators, `tsc`, `vite build`, bundle and gen:figma-ui all ran.
- (guard) sweeps: run as 8 legs, each `gate_lock.py run --name sweeps-<leg> -- npm run gate:<leg>` with `SDLC_GATE_WORKERS=10`, not as the single `--name sweeps -- npm run gate:sweeps` command. Every leg exited 0, 1,804 s in total:

| Leg | Seconds |
|---|---|
| corpus-tonal | 332 |
| corpus-anchor | 360 |
| sweep-prime | 173 |
| corpus-reset | 412 |
| corpus-contrast | 165 |
| mode-isolation | 65 |
| even-dips | 180 |
| chroma-envelope | 117 |

- `node test/repo/citations.mjs`: green (STALE 0). `em-dash.mjs` and `branding.mjs`: clean.
- `node_modules` was present, so `npm ci` was not run.

## Notes
- The sweeps guard was split into 8 legs because the full chain takes about 30 min, over the 600 s limit on one foreground Bash call. This follows the T-0014 precedent.
- The Bash call running corpus-reset, even-dips and chroma-envelope went past 600 s and the harness moved it to the background. I did not choose that. I waited for it to finish and read its output (all three exit 0) before going on.
- `docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md` is a finished dated record. It got a one-line citation move because `test/repo/citations.mjs` scans it and was red after step 3's line removals. The planner may want to rule on touching a finished record this way.
- The report credits numbers this step did not measure to their sources:
  - The cap-ruling figures (0.0202 against 0.0166) are step 2's plan-time prototype.
  - The shadcn and radix move counts are from step 2's builder.
  - The old EX-1 and `SPAN_PX_EXPECTED` values come from the inline re-pin notes.
  - 0.037 and 3,128 are the architect's scratch estimates.
- `test/ui/shell.mjs`'s oklch-native bar did not need the re-pin the architect predicted.
- Follow-ups recorded in the report:
  - `docs/specs/spec-panda-park-ui-exports.md:481` still quotes the old EX-1 literals.
  - Nothing reads the `capped` row flag any more.
- No commit.
