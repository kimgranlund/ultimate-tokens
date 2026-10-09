## Task goal
User ruling 2026-10-08: "for charts and graphs, you can learn how to do them properly here /Users/kimgranlund/Projects/nonoun/native-dom-charts", and, asked what to do with its rules, they chose "Rebuild charts as native DOM". Replace the app's analysis charts, today hand-built SVG strings set through `h("div", { class: "an-svg", html: svg })` (the ratified `html:` exception, 12 live uses: `src/ui/sections/color.js` :62 `graphLC`, :90 `graphTone`, :118 `graphChroma`, :208 `graphContrast`/`graphDamping`, :242 `graphHueWheel`, :633 hue/chroma disc; `geometry.js` :482 centering-law cell diagram, :517 icon and text vs height, :548 tier ladders; `typography.js` :54 type scale, :85 letter-spacing, :111 line-height ratio; classes in `src/ui/styles.css` ~:464-501, 836-839, 1389, 1526-1531), with native DOM charts: marks are HTML elements styled with CSS, no SVG and no Canvas, built with `h()` hyperscript.

## Step 1: Chart core, renderer, unit test and the allowlisted chart gate
level: L3
### Do
Depends on: none. This step touches only new files plus `test/run.mjs`, `test/repo/` and `.claude/CLAUDE.md`. T-0025 and T-0027 list none of these, so the step can run while those tickets are still in progress (handoff Intent, Sequencing). Design source: `.sdlc/native-dom-charts/architect-L1.md` (Approach, Interfaces, Carry forward). The source project's ribbon is `strokeRibbon` in `/Users/kimgranlund/Projects/nonoun/native-dom-charts/src/lib/core/geometry.js`.

1. New `src/ui/charts/core.mjs`. It is pure: no `import` line at all, no `document`, no `h`. Exports:
   - `STROKE = { line: 1.5, ref: 1 }` (px). A clip-path polygon fixes its thickness when the chart is resolved, so stroke width is a core constant per series and not a CSS token.
   - `scaleLinear([d0, d1], [r0, r1])` returns `(v) => number`. Any input that is not a finite number (NaN, null, undefined, a string, Infinity) returns NaN, never 0. A degenerate domain (`d0 === d1`) maps to the range midpoint.
   - `runs(points)`: arrays of consecutive points whose `x` and `y` are both finite numbers. A missing point ends the run and is dropped. A lone point is a run of length 1.
   - `ribbon(run, W, H, stroke = STROKE.line)`: returns `""` for fewer than 2 points. Otherwise it returns `polygon(...)` with 2n vertices written `<x>% <y>%` to 3 decimals. Port `strokeRibbon` on px points (per-vertex normal sum divided by `max(0.25, 1 + a.b)`, offset by plus or minus stroke/2), then convert each vertex to percent (x / W * 100, y / H * 100).
   - `band(run, W, H, base)`: `polygon(...)` with n + 2 vertices, the run followed by the closing pair on the base line. `base` is `{ x: px }` for a vertical base (`graphLC`'s gamut ceiling closes to `X(0)`) or `{ y: px }` for a horizontal one.
   - `polar(angleDeg, r, cx, cy)`: `{ x: cx + r * sin(a), y: cy - r * cos(a) }`, 0 degrees at top, clockwise, in the units of the inputs. Both hue plots compute this today: `graphHueWheel` through `hue - 90` with cos/sin, and `_hueCircle` through sin/-cos.
   - `resolveChart(spec)` and `sourceRows(spec)`, described below.
2. The spec. Coordinates are nominal px inside the chart's own W x H box (the constants each section function already has). Sections compute them with `scaleLinear` in place of their local `X`/`Y` lambdas, so today's geometry carries over.
   - Top-level keys: `W`, `H`, optional `cls` (extra root class), `title` (table caption) and `columns` (three table headers, default series, x, y).
   - `series`: `label`, `cls`, `kind` ("line" by default, or "band"), `stroke`, `points` of `{ x, y, v }` where `v` is the `[xValue, yValue]` pair for the source table, `base` for bands, and `dot` (radius in px).
   - `rules`: `cls`, `x1`, `y1`, `x2`, `y2`, axis-aligned.
   - `labels`: `text`, `x`, `y`, `anchor` (start, middle or end), `cls`.
   - `rects`: `cls`, `x`, `y`, `w`, `h`.
   - `circles`: `cls`, `cx`, `cy`, `r`.
   - `dots` (free dots): `cls`, `x`, `y`, `r`, `fill`, `ring`, `label`, `v`.
   - `resolveChart(spec)` returns percent primitives: `{ W, H, ribbons: [{ cls, clip }], bands: [{ cls, clip }], dots: [{ cls, left, top, r, fill, ring }], rules: [{ cls, orient: "h" | "v", left, top, len }], labels: [{ text, left, top, anchor, cls }], rects: [{ cls, left, top, width, height }], circles: [{ cls, left, top, width, height }] }`.
     - There is one ribbon per run of 2 or more points, or one band per run for `kind: "band"`.
     - A series with `dot` gets one dot per finite point.
     - A mark with any non-finite coordinate is dropped, never placed at 0.
     - Every number in the result is finite, and no string contains `NaN`.
   - `sourceRows(spec)` returns one `[label, x, y]` string triple for every series point and every free dot that carries `v`. The label is the series label, or the dot's own label. A finite number prints with at most 3 decimals and a string passes through. A non-finite or missing value prints `""`, never `"0"`.
3. New `src/ui/charts/render.mjs`. It imports `h` from `../app-helpers.mjs` and the core. `renderChart(spec)` returns `div.an-chart` (plus `spec.cls`) with style `aspect-ratio: <W> / <H>; max-width: <W>px`.
   - Inside it, `div.ch-marks` (`aria-hidden="true"`) holds the marks in this paint order:
     - `.ch-band` and `.ch-ribbon`, with style `clip-path: polygon(...)`.
     - `.ch-rule` plus `ch-h` or `ch-v`, with `left`, `top`, and `width` or `height`, all in percent.
     - `.ch-rect` and `.ch-circle`.
     - `.ch-dot`, with style `left`, `top`, `--r: <r>px`, plus `background: <fill>` when set. `ring` adds class `ch-ring`.
     - `.ch-label` plus `ch-a-start`, `ch-a-middle` or `ch-a-end`, with `left` and `top` in percent.
   - Every mark also carries its spec `cls`.
   - After the marks comes `table.vh`: an optional `<caption>`, one header row from `columns` and one row per `sourceRows` entry. The table is omitted when there are no rows.
   - No `innerHTML`, no `html:` attribute, no SVG.
4. New `test/ui/charts.mjs`:
   - Numeric tests of every core export: NaN, null and undefined never become 0; a gap splits a ribbon; ribbon thickness across a horizontal run equals stroke / H * 100; a band closes to its base; polar at 0 and 90 degrees; `sourceRows` blanks a missing value.
   - Renderer tests under the file's own minimal `document` stub. The stub's `createElement` objects need `className`, `setAttribute`, `append` and `addEventListener`, plus a `createTextNode`, which is all that `h()` in `src/ui/app-helpers.mjs` calls.
   - Register `"ui/charts.mjs"` in `test/run.mjs` `TESTS` right after `"ui/poster-strip.mjs"`.
5. Gate swap:
   - Run `git mv test/repo/svg-rules.mjs test/repo/dom-charts.mjs`. It is a move, so no delete prompt can stall a headless run. Rename the `TESTS` entry `"repo/svg-rules.mjs"` to `"repo/dom-charts.mjs"` in place.
   - Rewrite check (a) as an `ALLOW` map of the functions still on SVG, per section file. These are the twelve sites from `architect-L1.md` Carry forward, each name written as a double-quoted string literal:
     - `src/ui/sections/color.js`: graphLC, graphTone, graphChroma, graphDamping, graphHueWheel, _hueCircle.
     - `src/ui/sections/geometry.js`: graphGeomCentering, graphGeomPower, graphGeomBands.
     - `src/ui/sections/typography.js`: graphTypeScale, graphTypeTracking, graphTypeLeading.
   - Per file, the gate checks three things:
     - The `/\bhtml:\s*\w/g` count and the `<svg` count each equal the file's ALLOW length.
     - Every `html:` hit sits inside a method whose name is in ALLOW. The method is the nearest preceding two-space-indented `name(...) {` header.
     - Every ALLOW name still has such a header.
   - Every FAIL line names the section file path.
   - Keep check (b) (`fill: none` per `<path class=`) unchanged. It shrinks to nothing as the ports remove the paths.
   - Read every file with `readFileSync` imported from `node:fs`, as today; the planted-attribute criterion below stubs it. The gate no longer reads `.claude/CLAUDE.md`.
   - Pass line: `dom-charts: <n> html: attributes in <n> allowlisted chart functions (color <a>, geometry <b>, typography <c>), <k> line classes qualified with fill: none`.
   - Update the header comment. Prove the gate catches a removed ALLOW name in a scratch copy and report the result.
6. `.claude/CLAUDE.md`: replace the three-line bullet "The `html:` SVG-chart exception: 12 live attributes." with an interim bullet. It says:
   - Analysis charts are native DOM, built with `renderChart(spec)` from `src/ui/charts/render.mjs` over the pure `src/ui/charts/core.mjs`.
   - The section functions still on SVG strings are the `ALLOW` list in `test/repo/dom-charts.mjs`. The list only shrinks; never add a name.

   Keep the "SVG line charts set `fill: none`" bullet until step 5, because it still governs the ALLOW functions.
7. Not in this step: `src/ui/styles.css` (the chart CSS lands with the first port, step 2) and the section files.

Focused checks: `node test/ui/charts.mjs`, `node test/repo/dom-charts.mjs` and `node test/repo/em-dash.mjs`, then the `npm test` floor.
### Acceptance criteria
- (red) `node --input-type=module -e 'import { scaleLinear, runs } from "./src/ui/charts/core.mjs"; const s = scaleLinear([0, 10], [20, 120]); const r = runs([{ x: 0, y: 1 }, { x: 1, y: NaN }, { x: 2, y: 3 }, { x: 3, y: 4 }]); process.exit(s(5) === 70 && [NaN, null, undefined, Infinity].every((v) => Number.isNaN(s(v))) && r.length === 2 && r[0].length === 1 && r[1].length === 2 ? 0 : 1)'`
- (red) `node --input-type=module -e 'import { ribbon, band, polar } from "./src/ui/charts/core.mjs"; const n = (s) => (s.match(/-?[0-9]+([.][0-9]+)?%/g) ?? []).map(parseFloat); const r = n(ribbon([{ x: 0, y: 50 }, { x: 100, y: 50 }], 200, 100, 2)); const ys = r.filter((_, i) => i % 2); const b = n(band([{ x: 20, y: 10 }, { x: 60, y: 40 }], 100, 100, { y: 90 })); const p0 = polar(0, 40, 50, 50), p9 = polar(90, 40, 50, 50); const near = (a, c) => Math.abs(a - c) < 1e-6; process.exit(r.length === 8 && near(Math.max(...ys) - Math.min(...ys), 2) && ribbon([{ x: 1, y: 1 }], 10, 10, 1) === "" && b.length === 8 && near(b[5], 90) && near(b[7], 90) && near(p0.x, 50) && near(p0.y, 10) && near(p9.x, 90) && near(p9.y, 50) ? 0 : 1)'`
- (red) `node --input-type=module -e 'import { resolveChart, sourceRows } from "./src/ui/charts/core.mjs"; const spec = { W: 200, H: 100, series: [{ label: "s", cls: "x", dot: 2, points: [{ x: 10, y: 10, v: [0, 1] }, { x: 50, y: 20, v: [1, 2] }, { x: NaN, y: 30, v: [2, NaN] }, { x: 120, y: 40, v: [3, 4] }, { x: 190, y: 90, v: [4, 5] }] }] }; const o = resolveChart(spec); const nums = []; const txt = JSON.stringify(o, (k, v) => { if (typeof v === "number") nums.push(v); return v; }); const rows = sourceRows(spec); process.exit(o.ribbons.length === 2 && o.dots.length === 4 && nums.every(Number.isFinite) && !txt.includes("NaN") && rows.length === 5 && rows[2][2] === "" && !rows.some((q) => q[2] === "0") ? 0 : 1)'`
- (red) `node --input-type=module -e 'const mk = (t) => ({ tagName: t.toUpperCase(), className: "", attrs: {}, children: [], nodeType: 1, setAttribute(k, v) { this.attrs[k] = String(v); }, append(...k) { this.children.push(...k); }, addEventListener() {} }); globalThis.document = { createElement: mk, createTextNode: (s) => ({ nodeType: 3, textContent: String(s) }) }; const { renderChart } = await import("./src/ui/charts/render.mjs"); const el = renderChart({ W: 200, H: 100, series: [{ label: "a", cls: "lc-applied", dot: 2, points: [{ x: 10, y: 10, v: [0, 1] }, { x: 190, y: 90, v: [1, 2] }] }], rules: [{ cls: "lc-axis", x1: 20, y1: 90, x2: 190, y2: 90 }], rects: [{ cls: "gc-cell", x: 60, y: 20, w: 80, h: 60 }], circles: [{ cls: "hw-circle", cx: 100, cy: 50, r: 40 }], labels: [{ text: "px", x: 2, y: 14, anchor: "start" }] }); const all = (n, o = []) => { o.push(n); (n.children ?? []).forEach((c) => all(c, o)); return o; }; const a = all(el); const has = (n, c) => String(n.className ?? "").split(/ +/).includes(c); process.exit(has(el, "an-chart") && /aspect-ratio/.test(el.attrs.style ?? "") && a.some((n) => n.tagName === "TABLE" && has(n, "vh")) && a.some((n) => has(n, "ch-ribbon") && /clip-path: ?polygon[(]/.test(n.attrs.style ?? "")) && a.filter((n) => has(n, "ch-dot")).length === 2 && ["ch-rule", "ch-rect", "ch-circle", "ch-label"].every((c) => a.some((n) => has(n, c) && /%/.test(n.attrs.style ?? ""))) && a.some((n) => has(n, "ch-label") && (n.children ?? []).some((k) => k.textContent === "px")) ? 0 : 1)'`
- (red) `test -f src/ui/charts/core.mjs && test -f src/ui/charts/render.mjs && node --input-type=module -e 'await import("./src/ui/charts/core.mjs")' && ! grep -qE '^import|document|innerHTML|<svg' src/ui/charts/core.mjs && ! grep -qE 'innerHTML|html:|<svg' src/ui/charts/render.mjs`
- (red) `node test/ui/charts.mjs && grep -qF '"ui/charts.mjs"' test/run.mjs`
- (red) `test -f test/repo/dom-charts.mjs && test ! -e test/repo/svg-rules.mjs && grep -qF '"repo/dom-charts.mjs"' test/run.mjs && ! grep -qF 'svg-rules' test/run.mjs && node test/repo/dom-charts.mjs | grep -qE '^dom-charts: 12 html: attributes in 12 allowlisted chart functions'`
- (red) `test -f test/repo/dom-charts.mjs && ! out=$(node --input-type=module -e 'import fs from "node:fs"; import { syncBuiltinESMExports } from "node:module"; const r = fs.readFileSync; fs.readFileSync = (p, ...a) => { const s = r(p, ...a); return String(p).endsWith("src/ui/sections/color.js") ? s + "\nconst zz = h(\"div\", { html: svg });\n" : s; }; syncBuiltinESMExports(); await import("./test/repo/dom-charts.mjs");' 2>&1) && printf '%s\n' "$out" | grep -qF 'src/ui/sections/color.js'`
- (red) `! grep -qF 'SVG-chart exception: 12 live attributes' .claude/CLAUDE.md && grep -qF 'src/ui/charts/render.mjs' .claude/CLAUDE.md && grep -qF 'test/repo/dom-charts.mjs' .claude/CLAUDE.md`
- (guard) `node test/repo/em-dash.mjs`
- (guard) `test -n "$SDLC_BASE_SHA" && test -z "$( { git diff --name-only "$SDLC_BASE_SHA" -- . ":(exclude).sdlc"; git ls-files --others --exclude-standard -- . ":(exclude).sdlc"; } | grep -vxF -e src/ui/charts/core.mjs -e src/ui/charts/render.mjs -e test/ui/charts.mjs -e test/repo/dom-charts.mjs -e test/repo/svg-rules.mjs -e test/run.mjs -e .claude/CLAUDE.md -e figma/plugin/ui.html)"`
