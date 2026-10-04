# Rework brief U7 pass 2 · orchestrator to builder-l4

| Field | Value |
|---|---|
| Unit | pane-context U7 (#785), worktree `.worktrees/pc-U7`, branch `unit/pc-U7` @ 99565566 (code d2311bef, review p1 FAIL) |
| Review | `.sdlc/reviews/pane-context-U7-review.md` (on main; also in the worktree): F1, F2, F3 and the nit 1a |
| Lane | widened on the plan branch (revision 16 note): `test/ui/headless-boot.mjs` (the `:4245` comment only) joins the U7 lane |

## Fix
1. F1 (blocking): `docs/spec/spec-muted-base-key-spikes.md` AC-006 (about `:441`): reword "tones equal within 1e-9 across group targets" to what the code does and `test/engine/tonal.mjs` `group-chroma-damper` (v) asserts: the damped stop keeps its at-100 L* within the two pixels' rounding floors on perceptual and peak, exactly on even. Re-measure with your own probe before writing a number; write no figure you did not measure.
2. F2: `docs/reference/references/knowledge-02-tonal-scale.md:259` drop `/okhslStops` (module-private, below the re-entry).
3. F3: `test/ui/headless-boot.mjs:4245` comment: the chroma reaches the render through `dampStops`, not `groupTarget`. Comment only.
4. Nit 1a (optional, do it): `src/engine/tonal.js` comment keeps one clause that a direct `hueAnchorFrac` call uses the palette's own chroma, without adding a line (line numbers must not move).

## The real defect: classification by name
Pass 1 classed hits "true" because the variable or function still exists. Re-open EVERY hit in both sweep tables and re-judge each against the code (does the group value reach there at `:946` and below? is the tolerance a real gate?). The handoff gets a corrected table whose total sums, with the three reviewer finds shown as reclassified, and a statement of what you re-read.

## Rules
As the pass 1 brief. Regenerate assets if a comment moves them. `npm test` only when the load check prints 3 or fewer (wait and retry, say if you could not). Commit on `unit/pc-U7`, trailer `Seat: builder`; append a "Pass 2" section to `.sdlc/handoffs/pane-context-U7.md`; return the sha. Scratch only under `/Users/kimba/.claude/jobs/8c58a81c/tmp/pc-U7/`.
