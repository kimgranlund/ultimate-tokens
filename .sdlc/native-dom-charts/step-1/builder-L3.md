<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/src/ui/charts/core.mjs (new): pure core, with no imports and no DOM. It exports `STROKE`, `scaleLinear`, `runs`, `ribbon` (a port of `strokeRibbon`), `band`, `polar`, `resolveChart` and `sourceRows`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/src/ui/charts/render.mjs (new): `renderChart(spec)`. It builds `div.an-chart` and `div.ch-marks[aria-hidden]` in the paint order band, ribbon, rule, rect, circle, dot, label, then `table.vh` (caption, header row, data rows). Every node is made with `h()`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/test/ui/charts.mjs (new): numeric tests for every core export, plus renderer tests under the file's own document stub.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/test/repo/dom-charts.mjs: `git mv` rename from `test/repo/svg-rules.mjs`. Check (a) is rewritten as the per-file `ALLOW` map (12 names), the pass line and header comment are new, check (b) is unchanged, and the gate no longer reads `.claude/CLAUDE.md`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/test/run.mjs: `"ui/charts.mjs"` added after `"ui/poster-strip.mjs"`, and `"repo/svg-rules.mjs"` renamed to `"repo/dom-charts.mjs"` in place.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/.claude/CLAUDE.md: the "`html:` SVG-chart exception: 12 live attributes" bullet is replaced by the interim native DOM bullet, which names `render.mjs`, `core.mjs` and the `ALLOW` list in `test/repo/dom-charts.mjs`. The "SVG line charts set `fill: none`" bullet is kept.

## Checks
- Criterion 1 (scaleLinear, runs): exit 0.
- Criterion 2 (ribbon, band, polar): exit 0.
- Criterion 3 (resolveChart, sourceRows): exit 0.
- Criterion 4 (renderChart under the stub): exit 0.
- Criterion 5 (files exist, core has no import, document, innerHTML or `<svg`; render has no innerHTML, `html:` or `<svg`): exit 0.
- Criterion 6: `node test/ui/charts.mjs` passes, and `grep -qF '"ui/charts.mjs"' test/run.mjs` exits 0.
- Criterion 7 (dom-charts move and pass line): exit 0. The output is `dom-charts: 12 html: attributes in 12 allowlisted chart functions (color 6, geometry 3, typography 3), 6 line classes qualified with fill: none`.
- Criterion 8 (planted `html:` in color.js): exit 0. The gate prints `FAIL src/ui/sections/color.js: 7 html: attributes, ALLOW lists 6 chart functions` and `FAIL src/ui/sections/color.js:2150: html: inside renderGlobalInspector(), which is not in ALLOW`, then exits 1.
- Criterion 9 (CLAUDE.md greps): exit 0.
- (guard) `node test/repo/em-dash.mjs`: `em-dash: clean (1553 files scanned)`, exit 0.
- (guard) scope diff: `SDLC_BASE_SHA` was unset in this shell (`echo` printed it blank), so the criterion as written would fail at its `test -n` prefix. I ran the same command with `3f240a1e5088e6c78a9d5170905bc9bff88ae514` in place of the variable, and it exited 0. The verifier should rerun it verbatim with `SDLC_BASE_SHA` set.
- `npm test`: all 55 test files passed, including `ui/charts.mjs` and `repo/dom-charts.mjs`. Afterwards `git status` showed only this step's files, and `figma/plugin/ui.html` was not modified.
- `git grep svg-rules` outside `.sdlc` and `docs/archive`: no hits.

## Notes
- Gate negative controls, as item 5 asks. Each ran in a scratch copy or under a `readFileSync` stub, and every one exited 1:
  - Removed ALLOW name (`graphDamping` dropped from a scratch copy of the gate):
    - `FAIL src/ui/sections/color.js: 6 html: attributes, ALLOW lists 5 chart functions`
    - `FAIL src/ui/sections/color.js: 6 <svg strings, ALLOW lists 5 chart functions`
    - `FAIL src/ui/sections/color.js:208: html: inside graphDamping(), which is not in ALLOW`
  - Stale ALLOW name (`graphGone` added for geometry): the count and `<svg` mismatches fire, plus `ALLOW names graphGone, which has no method header; remove it from ALLOW`.
  - Renamed method (`graphTypeLeading` to `graphTypeLeadingX` in typography.js): both the "not in ALLOW" line and the "no method header" line fire.
  - Stray `<svg` added to geometry.js: `FAIL src/ui/sections/geometry.js: 4 <svg strings, ALLOW lists 3 chart functions`.
- Unit test mutation checks, each run on a temporary edit of core.mjs that I then restored (the restored file passes):
  - `scaleLinear` returning 0 instead of NaN made `test/ui/charts.mjs` fail 7 assertions.
  - Disabling the run split made it fail 5.
- I added one thing to the header detection that the spec text does not mention. On top of the plain two-space `name(...) {` rule, the gate skips a `KEYWORDS` set (`if`, `for`, `while`, `switch`, `catch`, `function`, `return`) so a two-space control statement can never count as a method header.
- `areaClassCount` in check (b) is still computed but no longer printed, because the specified pass line leaves it out. Check (b) logic is otherwise unchanged.
- A `kind: "band"` series gets one band per run, including a run of one point, which gives a zero-area polygon. A line series gets ribbons only for runs of 2 or more points.
- `src/ui/styles.css` has no `.vh`, `.an-chart` or `.ch-*` rules yet, as the handoff says (they land with step 2). Until then a rendered chart's table would be visible, but no section calls `renderChart` yet.
- No throwaway worktree was created and no commit was made.
