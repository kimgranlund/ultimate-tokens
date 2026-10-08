<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/docs/reports/2026-10-08-geometry-compound-insets.md`: new run report (untracked). It has the sections Command, Gates, Compound and control text, and Follow-ups.
- No source file changed. No tracked file changed after `npm test`, `npm run build` or `npm run smoke`, so none of them rewrote a stale asset.

## Checks
- Criterion 1, `npm test` inside the asset shasum drift wrapper, through the lock with `SDLC_GATE_WORKERS=10`: exit 0 in 336 s. All 55 test files passed, `repo/control-text.mjs` among them. The shasum was equal before and after.
- Criterion 2, `npm run build` through the lock: exit 0 in 4 s.
- Criterion 3, `npm run smoke` through the lock: exit 0 in 42 s. All six required strings were present: `SMOKE PASS`, the 108-case resolver line with the part roles, `compound at` at product-md and content-lg, and `control text at` at product-md and content-lg (135 controls each). Both `smoke-out/compound-product-md.png` and `smoke-out/compound-content-lg.png` exist and are non-empty.
- Criterion 4 (guard), `gate:corpus-reset` through the lock: exit 0 in 201 s, `HEADLESS BOOT PASS` (FULL: 343 documents, 3780 palettes).
- Criterion 5 (guard), the seven color legs, run one at a time: corpus-tonal 0 in 302 s, corpus-anchor 0 in 393 s, sweep-prime 0 in 319 s, corpus-contrast 0 in 98 s, mode-isolation 0 in 48 s, even-dips 0 in 66 s, chroma-envelope 0 in 97 s; loop rc=0.
  - The harness moved this loop to the background when it hit the 600 s Bash ceiling.
  - I waited in the foreground on its output file until all seven exits and `rc=0` were printed.
  - The task notification said "exit code 1". That came from the trailing `git status | grep -v '^??'` matching nothing, not from a gate.
- Criterion 6 (red), the report section and string checks: rc=0.
- Doc gates on the new report: `test/repo/em-dash.mjs` and `test/repo/citations.mjs` read `git ls-files`, so I ran them with the report intent-added in a throwaway copy of the index (`GIT_INDEX_FILE`). Results: em-dash clean (1597 files), citations STALE 0. The real index was not touched.
- `test/repo/branding.mjs` and `test/repo/doc-mutation-lane.mjs` walk the directory with `readdirSync`: both exit 0.

## Notes
- The canvas header clips its trailing tools at content-lg. In `smoke-out/compound-content-lg.png` the recenter button is cut at the center column's right edge, and the zoom out, zoom level, zoom in and "+ Palette" controls are hidden past it.
  - Steps 1 to 5 did not cause this. "Chrome overflow at larger tiers" was already listed in the PR #813 pixel-review follow-ups in `.sdlc/notes.md` before T-0027 started.
  - Step 4 fixed that item only vertically: the `--hh` and `--ch` bands now grow with the control height.
  - The `.canvas-header` rule in `src/ui/styles.css` is unchanged against merge-base `f60e5d14`.
  - `nowrap` already applied to `.canvas-header button` through the toolbar-only rule that step 4 folded into the base `button` rule.
  - I reported it as a follow-up and did not fix it. The planner needs a decision: wrap the header, scroll it, or collapse the trailing tools. No gate checks horizontal fit.
- The Global inspector's wide buttons ("Add data palettes (8)", "Re-derive data hues") are below the fold in both screenshots, so the pixel check did not see them. Only the `control text at` smoke check covers them, and it passed: one line, at the cell text size.
- What the pixel check did confirm at both geometries:
  - Every segmented control has an even padding ring and concentric corners.
  - Both pane toggles and the undo, redo, theme and settings header buttons are borderless, transparent, control-height squares.
  - Nothing clips at product-md.
- The smoke output prints no measured heights. The report gives the engine `md` cell values that the compound check matched within 0.5 px:
  - product-md: outer 32, part 24, padding 4, radius 14 = 10 + 4.
  - content-lg: outer 64, part 48, padding 8, radius 22 = 14 + 8.
- Base sha for this step is `f1ee41a1`. The report's Command section records `git merge-base HEAD main` as `f60e5d14`, which is what the handoff asks for.
- No commit, push, PR or issue was made.
