<!-- role=verifier level=L2 model=sonnet effort=high -->
## Verdict
pass

## Criteria
- Criterion 1 (scaleLinear, runs): pass. Evidence: the handoff command, run verbatim with SDLC_BASE_SHA exported, exit 0. It can go red: the files do not exist at base 3f240a1e.
- Criterion 2 (ribbon, band, polar): pass. Evidence: exit 0. The ribbon thickness assertion bites (ys span equals stroke), and the builder's mutation of scaleLinear failed 7 assertions in `test/ui/charts.mjs`.
- Criterion 3 (resolveChart, sourceRows): pass. Evidence: exit 0. It checks 2 ribbons, 4 dots, all numbers finite, no "NaN" text, 5 rows, and a blank "" cell (not "0") for the missing value.
- Criterion 4 (renderChart under the document stub): pass. Evidence: exit 0. It checks an-chart, aspect-ratio, a table.vh, a ribbon with a clip-path polygon, 2 dots, percent styles on rule/rect/circle/label, and the label text node.
- Criterion 5 (files exist, core has no import/document/innerHTML/svg, render has no innerHTML/html:/svg): pass. Evidence: exit 0.
- Criterion 6 (`node test/ui/charts.mjs` plus the run.mjs registration): pass. Evidence: exit 0, output "charts: core (scaleLinear, runs, ribbon, band, polar, resolveChart, sourceRows) and renderChart pass". `test/run.mjs` diff shows "ui/charts.mjs" right after "ui/poster-strip.mjs".
- Criterion 7 (gate renamed, pass line): pass. Evidence: exit 0. `node test/repo/dom-charts.mjs` prints "dom-charts: 12 html: attributes in 12 allowlisted chart functions (color 6, geometry 3, typography 3), 6 line classes qualified with fill: none". `git status` shows `RM test/repo/svg-rules.mjs -> test/repo/dom-charts.mjs`, and run.mjs has "repo/dom-charts.mjs" in place.
- Criterion 8 (planted `html:` in color.js via a readFileSync stub): pass. Evidence: exit 0, so the gate exited non-zero and its output names src/ui/sections/color.js. It is red-capable: the file is absent at base, and the builder's removed-ALLOW-name, stale-name and renamed-method controls all exited 1.
- Criterion 9 (CLAUDE.md greps): pass. Evidence: exit 0. The diff replaces the old "12 live attributes" bullet with one naming `src/ui/charts/render.mjs` and `test/repo/dom-charts.mjs`, and the fill: none bullet is kept.
- (guard) `node test/repo/em-dash.mjs`: pass. Evidence: "em-dash: clean (1553 files scanned)", exit 0.
- (guard) scope diff against SDLC_BASE_SHA: pass. Evidence: exit 0 with SDLC_BASE_SHA exported (it was unset in my shell, so I set it to 3f240a1e5088e6c78a9d5170905bc9bff88ae514). `git status` outside .sdlc lists only .claude/CLAUDE.md, test/repo/dom-charts.mjs (renamed), test/run.mjs, src/ui/charts/ and test/ui/charts.mjs.
- `npm test` floor: pass. Evidence: "all 55 test files passed", including `ui/charts.mjs` and `repo/dom-charts.mjs`. `git status` afterwards shows no `figma/plugin/ui.html` change.

## Out of scope changes
None.

## For the next attempt
None
