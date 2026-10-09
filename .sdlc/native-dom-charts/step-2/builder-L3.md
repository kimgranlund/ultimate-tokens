<!-- role=builder level=L3 model=opus effort=high -->
## Status
blocked

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/src/ui/sections/color.js: two import lines added (`renderChart` from `../charts/render.mjs`; `STROKE, polar, scaleLinear` from `../charts/core.mjs`). `graphLC`, `graphTone`, `graphChroma`, `graphDamping`, `graphHueWheel` and `_hueCircle` now build a spec and return `renderChart(spec)`, with mappings as Do item 1 describes. Names, signatures, legends, W/H/pad, the `.an-empty` "n/a" returns, the `hw` root class and the `newpal-hc` root class are all kept. No `html:` and no `<svg` left.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/src/ui/styles.css: added the chart block (`.an-chart`, `.ch-marks`, `.ch-ribbon`/`.ch-band` with `mask-image` and `-webkit-mask-image`, `.ch-rule.ch-h`/`.ch-v`, `.ch-dot`, `.ch-ring`, `.ch-rect`, `.ch-circle`, `.ch-label` with `ch-a-*` baseline transforms, `.vh`) before the legend rules. Moved `lc-*`, `hw-*` and `hc-*` to `--series`/`--dash`/`--rule-style`. Added `--series` to `lc-axis` and `dg-unity` (plus `--rule-style: dashed` on `dg-unity`) and kept their `stroke`. Deleted `.an-svg.hw`, `.an-svg.hw text`, `.an-svg .lc-toneline`, `.an-svg .lc-applied` and `.newpal-hc svg`. Added `.newpal-hc { max-width: 300px; margin-inline: auto }`, and `.an-chart .ch-marks { forced-color-adjust: none }` inside the existing forced-colors block.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/test/repo/dom-charts.mjs: the color.js ALLOW entry is now `[]`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/test/ui/headless-boot.mjs: `dgBefore` and `dgAfter` now read `app.querySelector(".damp-graph").querySelector(".ch-ribbon").getAttribute("style")`. The assertion text is unchanged.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/test/smoke/smoke.mjs: the query is now `.newpal-hc .ch-dot` instead of `.newpal-hc svg`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/docs/references/component-inventory.md: line numbers only, repaired on every STALE line.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/docs/specs/app-shell.md: line numbers only (lines 87, 131, 132, 298).
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/docs/reports/2026-08-20-reactivity/00-synthesis.md: line numbers only (line 76).
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/docs/reports/2026-08-20-reactivity/01-core-reactivity.md: line numbers only (lines 24, 30).
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/native-dom-charts/docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md: line numbers only (lines 19, 20).

## Checks
- Criterion 2, run before any edit: exit 1, a clean fail with no throw.
- Criterion 1 (no `html:` or `<svg` in color.js, renderChart import line): exit 0.
- Criterion 2 (mock-DOM structure check over all six functions): exit 0.
- Criterion 3 (`node test/repo/dom-charts.mjs` plus the ALLOW-name grep): exit 0. Output: `dom-charts: 6 html: attributes in 6 allowlisted chart functions (color 0, geometry 3, typography 3), 4 line classes qualified with fill: none`.
- Criterion 4 (`.an-chart`, `.vh`, `-webkit-mask-image`, forced-colors): exit 0.
- Criterion 5 (no stroke/fill in lc/hw/hc rules, no deleted SVG selectors): exit 0.
- Criterion 6 (headless q3 query and smoke query greps): exit 0.
- `node test/ui/headless-boot.mjs && grep -qF 'app.graphTone({ palettes: [] }, 0)' ...`: exit 0. Output ends with `HEADLESS BOOT PASS`.
- `node test/ui/charts.mjs`: exit 0.
- (guard) `node test/repo/citations.mjs`: first run had 5 docs with STALE lines. After the line-number repair it passes: `✓ citations: parser self-test + STALE 0 across 12 discovered docs`.
- (guard) `node test/repo/em-dash.mjs`: exit 0, `em-dash: clean (1630 files scanned)`.
- (guard) scope diff with `SDLC_BASE_SHA=7f05eb50d6d33dec5de2557d91c8fcd107e7a2e4` exported: exit 0.
- `npm test` in this tree: exit 1, RED. `scripts/bundle.mjs` preflight throws: `src/ui/sections/color.js: import path "../charts/core.mjs" is not registered in KEY (and its module, if new, is not in MODS)`. The same applies to `../charts/render.mjs`. No generated file was changed in the tree.
- Probe run, separate from the tree: a throwaway worktree with this diff plus the bundle.mjs edit below. There, `npm test` passed all 56 test files, and `npm run smoke` passed (`SMOKE PASS`, including the `.newpal-hc .ch-dot` assertion). The probe worktree is removed.

## Notes
plan defect: (guard) the scope diff excludes `scripts/bundle.mjs`, but the `npm test` floor and Do item 7 (`npm run smoke`, via `npm run build`) both run the bundle.mjs preflight. That preflight rejects color.js's new imports of `../charts/core.mjs` and `../charts/render.mjs` until both are registered in MODS and KEY.

- **The fix, proven in the probe:**
  - In `MODS`, after `["appHelpers", "src/ui/app-helpers.mjs"],` and before `["colorSection", "src/ui/sections/color.js"],`, add `["chartsCore", "src/ui/charts/core.mjs"], ["chartsRender", "src/ui/charts/render.mjs"],`.
  - In `KEY`, add `"core.mjs": "chartsCore", "render.mjs": "chartsRender"`.
  - No other MODS entry shares those basenames; preflight check (b) passed in the probe.
  - The replan needs to add `scripts/bundle.mjs` to the scope guard's allow list and to Do.
- **Why step 1 was green:** preflight scans only MODS-listed files, and nothing imported `src/ui/charts/` until this step. This is a scope omission in the plan, not a step-1 miss.
- **Tree state:** all work is left in the tree, uncommitted, in the 10 files listed under Changes. `scripts/bundle.mjs` is untouched. With the fix above applied, the next builder only needs to rerun `npm test` and the scope guard.
- **Hand-placed citations.** The citation repair maps each old line through a diff of base against the new file. Three cites pointed into replaced regions, so I set them by hand, number only:
  - inventory line 382: `styles.css:544-545` (`.hw-circle`, `.hw-dot`)
  - line 387: `styles.css:881-888` (`.lc-*` rules)
  - line 391: `styles.css:878-879` (`.damp-graph`, `.dg-unity`). This one was already NEAR, 12 lines off, at base.
- **Do item 7, visual check:**
  - I looked at `editor.png`, `scheme-color.png` and `new-palette.png` from the probe smoke. All three are dark theme. Light theme was not inspected, because smoke captures only the dark UI.
  - Confirmed: the rail's L*×C chart (band, dashed tone rule, applied line with dots), the tone curve, the chroma curve (dashed ceiling ribbon) and the new-palette hue×chroma disc (rim, axis labels, colour dots, ringed proposed dot) render correctly.
  - Not seen: the hue wheel and the damping graph are below the fold in those shots, so they were not visually confirmed.
- **Choices the handoff left open:**
  - `columns` is set on every spec, not only the hue wheel: (series, C, L*), (series, stop, L*), (series, stop, C), (series, stop, m), (palette, hue, C).
  - The dark hairline on `.hc-dot` and the panel halo on `.hw-dot` are now `box-shadow`. The `.hc-dot.ch-ring` rule combines the hairline with the ring.
  - Labels sit on their baseline via `translate(…, -80%)` at line-height 1.
