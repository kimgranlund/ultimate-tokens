<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/src/ui/sections/geometry.js: added the `renderChart` and `STROKE` imports. Ported `graphGeomCentering` (2 rects, 2 `gc-pad` rules), `graphGeomPower` (3 series, axes, labels, columns, legend kept) and `graphGeomBands` (one series per tier; the kit tier is `gp-font` with dots, the rest are `gp-ref`; returns `renderChart(spec)` alone) to `renderChart` specs. Updated the `.an-svg` comment to `.an-chart` and dropped the two "fill:none on the lines." comments.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/src/ui/styles.css: deleted `.an-svg`, `.an-svg svg`, `.an-svg text`, the "shared analysis-graph SVG styles" comment and `.gp-dot`/`.gp-dot-icon`/`.gp-dot-font`. Rewrote `.gp-ref`/`.gp-icon`/`.gp-font`/`.gc-cell`/`.gc-glyph`/`.gc-pad` as one-line DOM rules. Cut `.lc-axis` and `.dg-unity` down to their `--series`/`--rule-style` custom properties. No `an-svg` or `stroke` is left in the file.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/test/repo/dom-charts.mjs: the geometry.js ALLOW entry is now `[]`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/docs/references/component-inventory.md: shifted cites to the new line numbers (39 into styles.css, 5 into geometry.js).
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/docs/specs/app-shell.md: shifted 1 styles.css cite (564 to 562).
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/docs/reports/2026-08-20-reactivity/00-synthesis.md: shifted 2 geometry.js cites.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md: shifted 7 geometry.js cites.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/figma/plugin/ui.html: `npm test` regenerated it from the changed sources. It is in the scope allow list.

## Checks
All commands ran with SDLC_BASE_SHA=c1d10091bf17528e4551ca3e953af391890c7f24 exported.
- Criterion 1, the section-file grep for `html:`/`<svg`/`an-svg`/`fill: none` plus the renderChart import grep: exit 0.
- Criterion 2, the node shim check of the geomAnalysisCards structure: exit 0.
- Criterion 3, dom-charts.mjs: exit 0. It prints `dom-charts: 0 html: attributes in 0 allowlisted chart functions (color 0, geometry 0, typography 0), 0 line classes qualified with fill: none`.
- Criterion 4, the styles.css greps (no `an-svg`/`stroke`; `.gp-ref` has `--dash`; `.gc-cell` has `border`): exit 0.
- `node test/ui/headless-boot.mjs`: exit 0, "HEADLESS BOOT PASS". The `app.graphGeomPower({ cells: {} })` grep: exit 0.
- (guard) `node scripts/bundle.mjs`: exit 0, wrote dist/ultimate-tokens.html.
- (guard) `node test/ui/charts.mjs`: pass.
- (guard) `node test/repo/citations.mjs`: 3 STALE failures before the cite repair, exit 0 after ("STALE 0 across 12 discovered docs").
- (guard) `node test/repo/em-dash.mjs`: clean (1642 files).
- (guard) scope diff against the base sha: exit 0.
- `npm test`: exit 0, "all 56 test files passed".

## Notes
- The cite repair is a mechanical line-number shift: a script applied the `git diff -U0` hunk offsets of geometry.js and styles.css to 54 cites. None pointed into a changed or deleted line. The citations gate confirms the result, so the diff in component-inventory.md is line numbers only, with no content edits.
- The port exposed no renderer or core defect. Rects and the 3px rule resolve and render cleanly, so I added no `test/ui/charts.mjs` case and left core.mjs, render.mjs and bundle.mjs untouched.
- No real browser ran; the criteria did not require one. The criterion 2 shim checks structure and clip-path sanity, not pixels. Rects and the thick `gc-pad` rule are the first real use of those marks, so a smoke or Safari look is still open.
- Stale text left for step 5, both outside this step's scope:
  - The "SVG line charts set `fill: none`" convention bullet in `.claude/CLAUDE.md`.
  - The check (b) header prose and `findRule` in `test/repo/dom-charts.mjs`. Check (b) now reports 0 line classes.
- `docs/archive/tickets/tkt-0004.md` also cites styles.css and geometry.js by line. It is archived, the citations gate does not scan it, and it is out of scope, so I left it unchanged.
