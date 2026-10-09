<!-- role=planner level=L3 model=opus effort=xhigh -->
## Goal
Replace the twelve `html:` SVG-string charts in the analysis rail and the new-palette dialog with native DOM charts (HTML elements styled by CSS, built with `h()` over a pure, headless-tested chart core), retire the `html:` path and the SVG chart CSS, and update the records, with `npm test`, `npm run build`, `npm run smoke` and the eight sweep legs green.

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

## Step 2: Port the Color charts and land the chart CSS
level: L3
### Read first
- `docs/references/AGENTS.md`
- `docs/specs/AGENTS.md`
- `docs/AGENTS.md`
### Do
Depends on: step 1.

Precondition, held by the conductor: T-0025 and T-0027 are merged into main and synced into this lane before this step starts (handoff Intent, Sequencing). Both edit `src/ui/styles.css`. T-0025 also edits `color.js`, `app.js` and `test/ui/headless-boot.mjs`.

1. `src/ui/sections/color.js`: `graphLC`, `graphTone`, `graphChroma`, `graphDamping`, `graphHueWheel` and `_hueCircle` each build a spec and return `renderChart(spec)`.
   - Imports: `renderChart` from `../charts/render.mjs`, and `scaleLinear`, `polar` and `STROKE` from `../charts/core.mjs`. Write each as one `import { ... } from "...";` line.
   - Keep these:
     - the names, signatures and legends, the W/H/pad constants, and today's domain-to-px mappings;
     - the `.an-empty` "n/a" returns, because headless `(na)` calls `app.graphTone({ palettes: [] }, 0)`;
     - the root class `hw` on the hue wheel and `newpal-hc` on the disc, because headless `(np3c)` finds `.newpal-hc`.
   - Mapping:
     - Axes become two `lc-axis` rules. Each SVG `<text>` becomes a label with its `text-anchor`.
     - `graphLC`: an `lc-ceiling` band series (`base: { x: X(0) }`, `v: [ceiling, tone]`); an `lc-toneline` vertical rule at `X(0)` from the first tone to the last; an `lc-applied` line series with `dot: 2` and `v: [applied, tone]`.
     - `graphTone`: an `lc-applied` series with `dot: 1.8` and `v: [stop, tone]`.
     - `graphChroma`: an `lc-toneline` series for the gamut ceiling (stroke `STROKE.ref`, dashed by CSS) and an `lc-applied` series with `dot: 1.6`.
     - `graphDamping`: a `dg-unity` horizontal rule at `Y(1)`, an `lc-applied` series with `dot: 1.6`, and the labels `1x`, light and dark as today.
     - `graphHueWheel`: an `hw-circle` circle (cx, cy, R), the four tick labels, and one free dot per enabled palette at `polar(p.hue, R, cx, cy)`. Each dot has `fill` set to the mid-stop hex, `r` 5 (7 with `ring` for the selected palette), `label` set to the palette name and `v: [hue, mid-stop chroma]`. Set `columns` to palette, hue, C.
     - `_hueCircle`: an `hc-rim` circle, four `hc-axis` labels, and one dot per context palette at `polar(H, rr, cx, cy)` (`fill`, `r` 6). The proposed colour gets `r` 8 and `ring`. `v: [H, C]`.
2. `src/ui/styles.css`: add the chart block next to the analysis-card rules.
   - `.an-chart`: position relative, width 100%, margin-inline auto. Tokens `--chart-ref: 1px` and `--chart-label: 9px`, and a default `--series: var(--ink-faint)`.
   - `.ch-marks`: position absolute, inset 0.
   - `.ch-ribbon` and `.ch-band`: position absolute, inset 0, `background: var(--series)`. Ribbons also get `mask-image: var(--dash, none)` and `-webkit-mask-image: var(--dash, none)`; Safari before 15.4 needs the prefix.
   - `.ch-rule.ch-h`: `border-top: var(--chart-ref) var(--rule-style, solid) var(--series)`. `.ch-rule.ch-v` uses `border-left` the same way. Dashed classes set `--rule-style: dashed`.
   - `.ch-dot`: position absolute, `width` and `height` of `calc(var(--r) * 2)`, centred on its point with `transform: translate(-50%, -50%)`, `border-radius: 50%`, `background: var(--series)`. `.ch-ring` adds a `box-shadow` ring in `var(--accent)` with a `var(--panel)` gap.
   - `.ch-rect`. `.ch-circle`: a border and `border-radius: 50%`.
   - `.ch-label`: `font: var(--chart-label)/1 var(--sans)`, `color: var(--ink-dim)`, nowrap, tabular-nums. The label's point is its baseline, as it was in SVG, with a transform per `ch-a-*`.
   - `.vh`, the visually hidden utility: position absolute, 1px by 1px, `clip-path: inset(50%)`, overflow hidden, nowrap. None exists today.
   - `forced-color-adjust: none` for `.an-chart .ch-marks`, inside the existing `@media (forced-colors: active)` block.
   - Series paint:
     - The native marks read `--series` and `--dash`. `--dash` is `repeating-linear-gradient(90deg, #000 0 3px, transparent 3px 6px)`.
     - These colour-only classes move from `stroke`/`fill` to `--series`: `lc-ceiling` (keeps `color-mix(in srgb, var(--accent) 16%, transparent)`), `lc-toneline` (with `--dash` and `--rule-style: dashed`), `lc-applied`, `lc-dot`, `hw-*` and `hc-*`.
     - `lc-axis` and `dg-unity` are shared with the typography and geometry SVG charts until steps 3 and 4. Add `--series` to both (and `--rule-style: dashed` to `dg-unity`), and keep their `stroke` declarations.
   - Delete the SVG-only rules that no element reads after this step: `.an-svg.hw`, `.an-svg.hw text`, `.an-svg .lc-toneline`, `.an-svg .lc-applied` and `.newpal-hc svg`.
   - Keep `.an-svg`, `.an-svg svg` and `.an-svg text` for steps 3 and 4. The disc keeps its 300px cap: `.newpal-hc { max-width: 300px; margin-inline: auto }`.
3. `test/repo/dom-charts.mjs`: the color.js ALLOW entry becomes empty.
4. `test/ui/headless-boot.mjs`, the q3 `dgBefore`/`dgAfter` pair:
   - Read `app.querySelector(".damp-graph").querySelector(".ch-ribbon").getAttribute("style")` before and after `liveRefresh`.
   - Scope the query from the `.damp-graph` element. The shim's `querySelector` matches only the last class token over the whole subtree, so `app.querySelector(".damp-graph .ch-ribbon")` would return the rail's first ribbon.
   - Keep the assertion text and its `.length > 50` floor.
5. `test/smoke/smoke.mjs`: the new-palette assertion queries `.newpal-hc .ch-dot` instead of `.newpal-hc svg`, which would go red as soon as the disc is ported.
6. Citations: line shifts in `color.js` and `styles.css` make cites in `docs/` stale. There are 39 cites into `sections/color.js`, 14 more written `color.js:N`, and 51 into `styles.css`, mostly in `docs/references/component-inventory.md`. Run `node test/repo/citations.mjs` and repair each STALE line by number only; step 5 rewrites the inventory's chart prose.
7. Rendering is not proven headlessly. Run `npm run smoke` once (Chrome is on this host) and look at the color rail and the new-palette dialog in light and dark. The smoke assertions for charts land in step 5.
8. `scripts/bundle.mjs`, added by the conductor's scope decision (`## Plan review`, `scope widened: step 2`): `MODS` gets `["chartsCore", "src/ui/charts/core.mjs"]` and `["chartsRender", "src/ui/charts/render.mjs"]` after `appHelpers` and before `colorSection`, and `KEY` gets `"core.mjs": "chartsCore"` and `"render.mjs": "chartsRender"`. Without them the bundle preflight rejects color.js's new imports and `npm test` goes red (`step-2/builder-L3.md`).

Focused checks: the criteria below, then the `npm test` floor.
### Acceptance criteria
- (red) `test "$(grep -cE 'html:[[:space:]]*[A-Za-z_]|<svg' src/ui/sections/color.js)" -eq 0 && grep -qE '^import [{][^}]*renderChart[^}]*[}] from "[.][.]/charts/render[.]mjs";' src/ui/sections/color.js`
- (red) `node --input-type=module -e 'const mk = (t) => ({ tagName: t.toUpperCase(), className: "", attrs: {}, children: [], nodeType: 1, setAttribute(k, v) { this.attrs[k] = String(v); }, append(...k) { this.children.push(...k); }, addEventListener() {} }); globalThis.document = { createElement: mk, createTextNode: (s) => ({ nodeType: 3, textContent: String(s) }) }; const all = (n, o = []) => { o.push(n); (n.children ?? []).forEach((c) => all(c, o)); return o; }; const has = (n, c) => String(n.className ?? "").split(/ +/).includes(c); const M = await import("./src/ui/model.mjs"); const { ColorSectionImpl: C } = await import("./src/ui/sections/color.js"); const doc = M.defaultDocument(); const view = M.projectView(doc); const self = { doc, selectedIndex: () => 0, legend: () => null, newPalCtx: new Set([0, 1]) }; const P = C.prototype; const good = (e, min) => { const a = all(e); const rb = a.filter((n) => has(n, "ch-ribbon")); return a.some((n) => has(n, "an-chart")) && !a.some((n) => has(n, "an-svg")) && !a.some((n) => n.innerHTML) && rb.length >= min && rb.every((n) => /clip-path: ?polygon[(]/.test(n.attrs.style ?? "") && !/NaN/.test(n.attrs.style)); }; const lc = P.graphLC.call(self, view, 0); const wheel = all(P.graphHueWheel.call(self, view)); const disc = all(P._hueCircle.call(self, view, { pos: { H: 30, C: 0.1 }, hex: "#ff0000" })); const dots = (a) => a.filter((n) => has(n, "ch-dot")).length; process.exit(good(lc, 1) && all(lc).some((n) => has(n, "ch-band")) && good(P.graphTone.call(self, view, 0), 1) && good(P.graphChroma.call(self, view, 0), 2) && good(P.graphDamping.call(self, doc), 1) && wheel.some((n) => has(n, "an-chart")) && dots(wheel) === view.palettes.filter((p) => p.on).length && disc.some((n) => has(n, "newpal-hc")) && dots(disc) === 3 ? 0 : 1)'`
- (red) `test -f test/repo/dom-charts.mjs && node test/repo/dom-charts.mjs && ! grep -qE '"(graphLC|graphTone|graphChroma|graphDamping|graphHueWheel|_hueCircle)"' test/repo/dom-charts.mjs`
- (red) `grep -qE '^[.]an-chart[ ,{]' src/ui/styles.css && grep -qE '^[.]vh[ ,{]' src/ui/styles.css && grep -qF -- '-webkit-mask-image' src/ui/styles.css && awk '/@media [(]forced-colors: active[)]/{f=1} f && /forced-color-adjust: none/{ok=1} END{exit !ok}' src/ui/styles.css`
- (red) `! grep -qE '^[.](lc-(ceiling|toneline|applied|dot)|hw-[a-z]+|hc-[a-z]+)[^{]*[{][^}]*(stroke|fill)[[:space:]]*:' src/ui/styles.css && ! grep -qE 'an-svg [.]lc-|[.]an-svg[.]hw|newpal-hc svg' src/ui/styles.css`
- (red) `grep -qF '.querySelector(".damp-graph").querySelector(".ch-ribbon")' test/ui/headless-boot.mjs && ! grep -qF 'children[0]?.innerHTML' test/ui/headless-boot.mjs && ! grep -qF '.newpal-hc svg' test/smoke/smoke.mjs && grep -qF '.newpal-hc .ch-dot' test/smoke/smoke.mjs`
- `node test/ui/headless-boot.mjs && grep -qF 'app.graphTone({ palettes: [] }, 0)' test/ui/headless-boot.mjs`
- `node test/ui/charts.mjs`
- (guard) `node test/repo/citations.mjs`
- (guard) `node test/repo/em-dash.mjs`
- (guard) `test -n "$SDLC_BASE_SHA" && test -z "$( { git diff --name-only "$SDLC_BASE_SHA" -- . ":(exclude).sdlc"; git ls-files --others --exclude-standard -- . ":(exclude).sdlc"; } | grep -vxF -e src/ui/sections/color.js -e src/ui/styles.css -e src/ui/charts/core.mjs -e src/ui/charts/render.mjs -e test/ui/charts.mjs -e test/repo/dom-charts.mjs -e test/ui/headless-boot.mjs -e test/smoke/smoke.mjs -e figma/plugin/ui.html -e docs/references/component-inventory.md -e docs/specs/app-shell.md -e docs/reports/2026-07-17-cto-app.md -e docs/reports/2026-08-20-reactivity/00-synthesis.md -e docs/reports/2026-08-20-reactivity/01-core-reactivity.md -e docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md -e docs/reports/2026-08-20-reactivity/03-stores-and-persistence.md -e docs/reports/2026-08-20-reactivity/04-context-and-messaging.md -e scripts/bundle.mjs)"`

## Step 3: Port the Typography charts
level: L2
### Read first
- `docs/references/AGENTS.md`
- `docs/specs/AGENTS.md`
- `docs/AGENTS.md`
### Do
Depends on: step 2 (committed as 6445ea08). Follow the shape of step 2's ported charts in `src/ui/sections/color.js` (`graphTone`, `graphChroma`, `graphDamping`): build a spec in nominal px and return it through `renderChart(spec)`.

1. `src/ui/sections/typography.js`: `graphTypeScale`, `graphTypeTracking` and `graphTypeLeading` each return `h("div", {}, renderChart(spec), this.legend(...))`, with the legend call unchanged.
   - Import: add `import { renderChart } from "../charts/render.mjs";` as one line after the `../app-helpers.mjs` import. Nothing from `../charts/core.mjs` is needed.
   - Keep the local `X`/`Y` lambdas, the W/H/pad constants and today's mappings. Do not route the per-voice step index through `scaleLinear`: it maps a degenerate domain to the range midpoint (`src/ui/charts/core.mjs`, `scaleLinear`), while today's `X(i, n)` puts a one-step voice (UI-control, UI-widget) at `pad`.
   - Series: one per voice, in `series` order (index `gi`).
     - `label: g.short || g.cat`, `dot: 1.6`.
     - `cls: "ty-s" + gi`, plus ` ty-mono` when `g.cat` ends in `-mono`.
     - Points are today's: `graphTypeTracking` sorts by size first. `v` is `[s.name, s.size]` for the scale chart, `[s.size, s.letterSpacing]` for tracking, and `[s.name, s.lineHeight / s.size]` for leading.
   - Rules: the two SVG `<line class="lc-axis">` become two `lc-axis` rules at the same coordinates. `graphTypeTracking` adds a `dg-unity` rule from `(pad, Y(0))` to `(W - 6, Y(0))`.
   - Labels: each SVG `<text>` becomes a label at the same x and y, anchor start (`px`, `SM→LG`, `0`, `size→`, `×`).
   - `columns`: `["voice", "step", "px"]` for scale, `["voice", "size px", "tracking px"]` for tracking, `["voice", "step", "line-height ÷ size"]` for leading.
   - Keep the `.an-empty` "n/a" returns; headless `(na)` calls `app.graphTypeScale([])`.
   - The comment above `typeAnalysisCards` says "Reuses .an-card / .an-svg / legend()". Change it to name `.an-chart`. Criterion 1 rejects any `an-svg` left in the file, comments included.
2. `src/ui/styles.css`, the typography block (`.an-svg .ty-line` through `.ty-s14`). Write every rule on one line, as the file does; criterion 4 greps single lines.
   - `.ty-s0` to `.ty-s14`: each sets only `--series` to today's `stroke` colour. Drop `stroke`, `fill` and `stroke-dasharray`.
   - Add `.ty-mono { --dash: repeating-linear-gradient(90deg, #000 0 3px, transparent 3px 6px); }`.
   - Why dash by voice name: today the dashes sit on `.ty-s3`, `.ty-s9`, `.ty-s10` and `.ty-s12`, whose comments say mono. The live voice order, from `typeScaleFor(defaultDocument(), "base")`, is Display, Headline, Sub-heading, Title, Sub-title, Lead, Body, Body-mono, Label, Label-mono, Kicker, Tiny, Tiny-mono, UI-control, UI-widget. So Title (3) and Kicker (10) are dashed and Body-mono (7) is not. Dashing by voice name fixes that drift and survives a voice reorder.
   - Rewrite the block comment ("by index in the 11-voice order") and the per-class comments to that live 15-voice order.
   - Delete `.an-svg .ty-line`, `.ty-dot` and the comment above them.
   - Leave `.lc-axis`, `.dg-unity`, `.an-svg`, `.an-svg svg`, `.an-svg text`, `.gp-*` and `.gc-*` as they are, because geometry's SVG charts read them until step 4. The legend marks `.an-leg-mark.ty.sN` stay.
3. `test/repo/dom-charts.mjs`: the typography.js ALLOW entry becomes `[]`. Check (b) still finds geometry's `<path>` classes; leave it.
4. `scripts/bundle.mjs` stays untouched. Its `KEY` resolves imports by basename, and `"core.mjs": "chartsCore"` and `"render.mjs": "chartsRender"` are registered (step 2). `MODS` lists `chartsCore` and `chartsRender` before `typeSection`, which the preflight's order check requires. So the new import resolves with no edit, and the bundle guard below runs that preflight.
   - If this port exposes a renderer or core defect, fix it in `src/ui/charts/core.mjs` or `src/ui/charts/render.mjs` and add a `test/ui/charts.mjs` case. Dashed ribbons get their first multi-series use here.
   - Add no new module under `src/ui/charts/`. A new file needs `MODS` and `KEY` entries and passes the basename-collision check, and the scope guard leaves `scripts/bundle.mjs` out on purpose, so such an edit shows up red.
5. Citations: repair by number any cite the line shifts made stale (`node test/repo/citations.mjs`). Cites into `typography.js`: 5 in `docs/references/component-inventory.md`, 1 in `docs/reports/2026-08-20-reactivity/01-core-reactivity.md`, 7 in `02-sections-and-resolvers.md`, 5 in `04-context-and-messaging.md`. Cites into `styles.css`: 53 in the inventory and 2 in `docs/specs/app-shell.md`.

Focused checks: the criteria below, then the `npm test` floor. `npm test` rewrites `figma/plugin/ui.html`; keep the regenerated bytes.
### Acceptance criteria
- (red) `test "$(grep -cE 'html:[[:space:]]*[A-Za-z_]|<svg|an-svg' src/ui/sections/typography.js)" -eq 0 && grep -qE '^import [{][^}]*renderChart[^}]*[}] from "[.][.]/charts/render[.]mjs";' src/ui/sections/typography.js`
- (red) `node --input-type=module -e 'const mk = (t) => ({ tagName: t.toUpperCase(), className: "", attrs: {}, children: [], nodeType: 1, setAttribute(k, v) { this.attrs[k] = String(v); }, append(...k) { this.children.push(...k); }, addEventListener() {} }); globalThis.document = { createElement: mk, createTextNode: (s) => ({ nodeType: 3, textContent: String(s) }) }; const all = (n, o = []) => { o.push(n); (n.children ?? []).forEach((c) => all(c, o)); return o; }; const has = (n, c) => String(n.className ?? "").split(/ +/).includes(c); const M = await import("./src/ui/model.mjs"); const { TypeSectionImpl: T } = await import("./src/ui/sections/typography.js"); const doc = M.defaultDocument(); const sc = M.typeScaleFor(doc, "base"); const t = Object.assign(Object.create(T.prototype), { doc, legend: () => null, _activeTypeScale: () => sc }); const cards = t.typeAnalysisCards({}).slice(0, 3).map((c) => all(c)); const cats = Object.entries(sc.categories).map(([k, v]) => [k, Object.keys(v ?? {}).length]); const steps = cats.reduce((s, c) => s + c[1], 0); const multi = cats.filter((c) => c[1] > 1).length; const mono = cats.filter((c) => c[1] > 1 && c[0].endsWith("-mono")).length; const good = (a) => { const rb = a.filter((n) => has(n, "ch-ribbon")); return a.some((n) => has(n, "an-chart")) && !a.some((n) => has(n, "an-svg")) && !a.some((n) => n.innerHTML) && rb.length === multi && a.filter((n) => has(n, "ch-dot")).length === steps && rb.filter((n) => has(n, "ty-mono")).length === mono && rb.every((n) => /clip-path: ?polygon[(]/.test(n.attrs.style ?? "") && !/NaN/.test(n.attrs.style)); }; process.exit(mono > 0 && cards.every(good) && cards[1].some((n) => has(n, "ch-rule") && has(n, "dg-unity")) ? 0 : 1)'`
- (red) `test -f test/repo/dom-charts.mjs && node test/repo/dom-charts.mjs && ! grep -qE '"(graphTypeScale|graphTypeTracking|graphTypeLeading)"' test/repo/dom-charts.mjs`
- (red) `grep -qE '^[.]ty-mono[ ,{][^}]*--dash' src/ui/styles.css && ! grep -qE '^[.]ty-s[0-9]+[^{]*[{][^}]*(stroke|fill)[[:space:]]*:' src/ui/styles.css && ! grep -qE 'ty-line|ty-dot' src/ui/styles.css`
- `node test/ui/headless-boot.mjs && grep -qF 'app.graphTypeScale([])' test/ui/headless-boot.mjs`
- (guard) `node scripts/bundle.mjs`
- (guard) `node test/ui/charts.mjs`
- (guard) `node test/repo/citations.mjs`
- (guard) `node test/repo/em-dash.mjs`
- (guard) `test -n "$SDLC_BASE_SHA" && test -z "$( { git diff --name-only "$SDLC_BASE_SHA" -- . ":(exclude).sdlc"; git ls-files --others --exclude-standard -- . ":(exclude).sdlc"; } | grep -vxF -e src/ui/sections/typography.js -e src/ui/styles.css -e src/ui/charts/core.mjs -e src/ui/charts/render.mjs -e test/ui/charts.mjs -e test/repo/dom-charts.mjs -e figma/plugin/ui.html -e docs/references/component-inventory.md -e docs/specs/app-shell.md -e docs/reports/2026-08-20-reactivity/00-synthesis.md -e docs/reports/2026-08-20-reactivity/01-core-reactivity.md -e docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md -e docs/reports/2026-08-20-reactivity/03-stores-and-persistence.md -e docs/reports/2026-08-20-reactivity/04-context-and-messaging.md)"`

## Step 4: Port the Geometry charts and delete the SVG chart CSS
level: L3
### Read first
- `docs/references/AGENTS.md`
- `docs/specs/AGENTS.md`
- `docs/AGENTS.md`
### Do
Depends on: step 3, which leaves geometry's three functions as the last SVG charts. T-0027 (compound insets) is merged into this lane. These charts read `mdAnchor(scale)`, `orderedSizeNames(scale)`, `TIERS`, and the `height`, `icon`, `text` and `inset` fields of `scale.cells[n]`, all from `src/engine/geometry.mjs`.

1. `src/ui/sections/geometry.js`:
   - Imports: add `import { renderChart } from "../charts/render.mjs";` and `import { STROKE } from "../charts/core.mjs";`, one line each, after the `../app-helpers.mjs` import.
   - Keep the local `X`/`Y` lambdas, the W/H/pad constants, today's mappings, and the `.an-empty` returns; headless `(na)` calls `app.graphGeomPower({ cells: {} })`.
   - `graphGeomCentering`: a spec with only `rects` and `rules`. It has no series, labels or table; the `.geom-an-cap` caption under it states the numbers, so keep the caption and the `mdAnchor` empty check.
     - Rects: `gc-cell` at `(x0, y0)`, `side` by `side`; `gc-glyph` at `(gx, gy)`, `g` by `g`.
     - Two horizontal `gc-pad` rules: `(x0, gy)` to `(gx, gy)`, and `(gx + g, gy + g)` to `(x0 + side, gy + g)`.
   - `graphGeomPower`: three series over `rows`. Each point is `{ x: X(s.height), y: Y(s[key]), v: [s.height, s[key]] }`.
     - `gp-ref`: key `height`, label "height", `stroke: STROKE.ref`, no dots.
     - `gp-icon`: key `icon`, label "icon", `dot: 1.8`.
     - `gp-font`: key `text`, label "text", `dot: 1.8`.
     - Two `lc-axis` rules; labels `px` and `height→` at today's x and y. `columns: ["series", "height px", "px"]`. Keep the legend.
   - `graphGeomBands`: one series per tier in today's `tiers` list (tiers with more than one cell).
     - The kit tier (`t === scale.tier`) is `cls: "gp-font"` with `dot: 1.9`. The other tiers are `cls: "gp-ref"` with `stroke: STROKE.ref` and no dots. Each label is the tier name.
     - Each point is `{ x: X(i, ns.length), y: Y(scale.cells[n].height), v: [n, scale.cells[n].height] }`.
     - Two `lc-axis` rules; labels `px` and `sm-sm→lg-lg`. `columns: ["tier", "cell", "height px"]`. It returns `renderChart(spec)` alone, as today it returns the chart with no legend.
   - Criterion 1 rejects `an-svg` and `fill:none` in every section file, comments included. So change these comments:
     - the `geomAnalysisCards` comment, "Reuses .an-card / .an-svg / legend()", now names `.an-chart`;
     - "fill:none on the lines." goes from the comments above `graphGeomPower` and `graphGeomBands`.
2. `src/ui/styles.css`. Write every rule on one line, as the file does; criterion 4 greps single lines.
   - `.gp-ref { --series: var(--ink-faint); --dash: repeating-linear-gradient(90deg, #000 0 3px, transparent 3px 6px); }`.
   - `.gp-icon { --series: var(--accent); }` and `.gp-font { --series: color-mix(in srgb, var(--ink) 55%, var(--accent)); }`.
   - Delete `.gp-dot`, `.gp-dot-icon` and `.gp-dot-font`. `resolveChart` (`src/ui/charts/core.mjs`) gives every series dot its series `cls`, so no element carries `gp-dot*` after the port. The `.an-leg-mark.gp.*` legend rules stay.
   - `.gc-cell { border: 1.5px solid var(--line); border-radius: 2px; }`.
   - `.gc-glyph { background: color-mix(in srgb, var(--accent) 24%, transparent); border: 1.5px solid var(--accent); border-radius: 2px; }`. The global `* { box-sizing: border-box; }` keeps the border inside the rect's box.
   - `.gc-pad { --series: var(--ink-faint); --chart-ref: 3px; }`. The ends are square; a 3px pad reads the same at this size.
   - `.lc-axis` keeps only `--series: var(--line)`. `.dg-unity` keeps only `--series: var(--ink-faint); --rule-style: dashed`.
   - This step ports the last SVG chart. Delete `.an-svg`, `.an-svg svg`, `.an-svg text` and the comment "shared analysis-graph SVG styles (left-pane graphs)".
   - After this step, `src/ui/styles.css` contains no `an-svg` and no `stroke` anywhere, comments included.
3. `test/repo/dom-charts.mjs`: the geometry.js ALLOW entry becomes `[]`, and the pass line reads `dom-charts: 0 html: attributes in 0 allowlisted chart functions ...`. Check (b) then finds no `<path>` and reports 0 line classes; step 5 removes it.
4. `scripts/bundle.mjs` stays untouched, for the same reason as step 3: `MODS` lists `chartsCore` and `chartsRender` before `geomSection`, and `KEY` holds both basenames.
   - If this port exposes a renderer or core defect, fix it in `src/ui/charts/core.mjs` or `src/ui/charts/render.mjs` and add a `test/ui/charts.mjs` case. Rects and thick rules get their first real use here.
   - Add no new module under `src/ui/charts/`; the reason is in step 3.
5. Citations: repair by number any cite the line shifts made stale (`node test/repo/citations.mjs`). Cites into `geometry.js`: 5 in `docs/references/component-inventory.md`, 2 in `docs/reports/2026-08-20-reactivity/00-synthesis.md`, 7 in `02-sections-and-resolvers.md`. Cites into `styles.css`: 53 in the inventory and 2 in `docs/specs/app-shell.md`.

Focused checks: the criteria below, then the `npm test` floor.
### Acceptance criteria
- (red) `for f in src/ui/sections/*.js; do ! grep -qE 'html:[[:space:]]*[A-Za-z_]|<svg|an-svg|fill: ?none' "$f" || exit 1; done && grep -qE '^import [{][^}]*renderChart[^}]*[}] from "[.][.]/charts/render[.]mjs";' src/ui/sections/geometry.js`
- (red) `node --input-type=module -e 'const mk = (t) => ({ tagName: t.toUpperCase(), className: "", attrs: {}, children: [], nodeType: 1, setAttribute(k, v) { this.attrs[k] = String(v); }, append(...k) { this.children.push(...k); }, addEventListener() {} }); globalThis.document = { createElement: mk, createTextNode: (s) => ({ nodeType: 3, textContent: String(s) }) }; const all = (n, o = []) => { o.push(n); (n.children ?? []).forEach((c) => all(c, o)); return o; }; const has = (n, c) => String(n.className ?? "").split(/ +/).includes(c); const M = await import("./src/ui/model.mjs"); const E = await import("./src/engine/geometry.mjs"); const { GeomSectionImpl: G } = await import("./src/ui/sections/geometry.js"); const doc = M.defaultDocument(); const sc = M.geomScaleFor(doc, "base"); const g = Object.assign(Object.create(G.prototype), { doc, legend: () => null, _activeGeomScale: () => sc }); const [c0, c1, c2] = g.geomAnalysisCards({}).slice(0, 3).map((c) => all(c)); const n = (a, c) => a.filter((x) => has(x, c)).length; const clean = (a) => a.some((x) => has(x, "an-chart")) && !a.some((x) => has(x, "an-svg")) && !a.some((x) => x.innerHTML) && a.filter((x) => has(x, "ch-ribbon")).every((x) => /clip-path: ?polygon[(]/.test(x.attrs.style ?? "") && !/NaN/.test(x.attrs.style)); const names = E.orderedSizeNames(sc); const hs = new Set(names.map((k) => sc.cells[k].height)).size; const tiers = Object.keys(E.TIERS).filter((t) => names.filter((k) => k.startsWith(t + "-")).length > 1); const kitCells = names.filter((k) => k.startsWith(sc.tier + "-")).length; const rb2 = c2.filter((x) => has(x, "ch-ribbon")); process.exit(tiers.length > 1 && tiers.includes(sc.tier) && [c0, c1, c2].every(clean) && n(c0, "ch-rect") === 2 && c0.filter((x) => has(x, "ch-rule") && has(x, "gc-pad")).length === 2 && n(c1, "ch-ribbon") === 3 && n(c1, "ch-dot") === 2 * hs && rb2.length === tiers.length && rb2.filter((x) => has(x, "gp-font")).length === 1 && n(c2, "ch-dot") === kitCells ? 0 : 1)'`
- (red) `test -f test/repo/dom-charts.mjs && out=$(node test/repo/dom-charts.mjs) && printf '%s\n' "$out" | grep -qE '^dom-charts: 0 html: attributes' && ! grep -qE '"(graphGeomCentering|graphGeomPower|graphGeomBands)"' test/repo/dom-charts.mjs`
- (red) `! grep -qE 'an-svg|stroke' src/ui/styles.css && grep -qE '^[.]gp-ref[ ,{][^}]*--dash' src/ui/styles.css && grep -qE '^[.]gc-cell[ ,{][^}]*border' src/ui/styles.css`
- `node test/ui/headless-boot.mjs && grep -qF 'app.graphGeomPower({ cells: {} })' test/ui/headless-boot.mjs`
- (guard) `node scripts/bundle.mjs`
- (guard) `node test/ui/charts.mjs`
- (guard) `node test/repo/citations.mjs`
- (guard) `node test/repo/em-dash.mjs`
- (guard) `test -n "$SDLC_BASE_SHA" && test -z "$( { git diff --name-only "$SDLC_BASE_SHA" -- . ":(exclude).sdlc"; git ls-files --others --exclude-standard -- . ":(exclude).sdlc"; } | grep -vxF -e src/ui/sections/geometry.js -e src/ui/styles.css -e src/ui/charts/core.mjs -e src/ui/charts/render.mjs -e test/ui/charts.mjs -e test/repo/dom-charts.mjs -e figma/plugin/ui.html -e docs/references/component-inventory.md -e docs/specs/app-shell.md -e docs/reports/2026-08-20-reactivity/00-synthesis.md -e docs/reports/2026-08-20-reactivity/01-core-reactivity.md -e docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md -e docs/reports/2026-08-20-reactivity/03-stores-and-persistence.md -e docs/reports/2026-08-20-reactivity/04-context-and-messaging.md)"`

## Step 5: Retire the html: path, update the records, gates green
level: L3
guard timeout: 3000
### Read first
- `docs/references/AGENTS.md`
- `docs/specs/AGENTS.md`
- `docs/AGENTS.md`
### Do
Depends on: steps 1 to 4.

1. `src/ui/app-helpers.mjs`: delete the `html` branch of `h()` (`else if (k === "html") el.innerHTML = v;`).
   - No caller is left: after step 4, `grep -rn 'html:' src/ui` finds only the generated `src/ui/describe-mcp-assets.js` data.
   - `src/ui/icons.js` keeps its own `innerHTML` for icon paths. Icons are not charts and stay out of scope; the ADR says so.
   - `scripts/bundle.mjs` stays untouched: this step adds no import. `app-helpers.mjs` only loses a branch, and `test/repo/dom-charts.mjs` and `test/smoke/smoke.mjs` are tests, not `MODS` entries. `npm test` runs the bundle preflight anyway.
2. `test/repo/dom-charts.mjs`, final form:
   - Drop the ALLOW map and check (b).
   - Assert zero `html:` attributes and zero `<svg` strings in every `src/ui/sections/*.js`, no `innerHTML` in `src/ui/app-helpers.mjs`, and no `innerHTML` or `<svg` in `src/ui/charts/*.mjs`.
   - Every FAIL line names its file. Keep reading through `readFileSync` from `node:fs`.
   - Pass line: `dom-charts: 0 html: attributes, 0 <svg strings in src/ui/sections, h() sets no innerHTML`.
   - Update the header comment.
3. Records. Stale context is a defect, so update all of these:
   - `.claude/CLAUDE.md`: delete the "SVG line charts set `fill: none`" bullet. Replace step 1's interim bullet ("The section functions still on SVG strings (`html:`) are the `ALLOW` list ...") with the convention:
     - Analysis charts are native DOM marks: HTML elements styled by CSS, with no SVG, no canvas and no `html:` attribute.
     - They are built with `renderChart(spec)` (`src/ui/charts/render.mjs`) over the pure `src/ui/charts/core.mjs`.
     - Series colour comes from `--series` (and `--dash`).
     - `test/repo/dom-charts.mjs` gates the convention.

     The new wording must not contain the literals `SVG-chart`, `an-svg` or `fill: none`, because the records criterion rejects them.
   - `.claude/skills/building-editor-sections/SKILL.md`:
     - The Left-analysis table cell (`.an-card`/`.an-svg`/`legend()`).
     - Step 3: `.an-chart`, `renderChart` and `legend()` replace `.an-svg` and the `fill: none` rule.
     - The `references/best-practices.md` row of its reference table ("the fill:none selector").
   - `references/best-practices.md`:
     - The `fill: none` selector bullet becomes the chart primitive: a spec in nominal px, `scaleLinear`, `--series` on the series class, and a hidden source table.
     - The `.an-svg` mention in the reuse bullet and the `fill:none` note in the Geometry walkthrough are removed.
   - `references/foundations.md`, the `h()` paragraph: `h()` no longer takes `html` ("innerHTML for SVG strings" goes).
   - `references/rubric.md` S4: "SVG lines set `fill:none` (qualified)" becomes "charts are native DOM marks".
   - `.claude/agents/change-reviewer-agent.md`: the description's "SVG fill:none traps" and the browser-traps bullet on SVG `fill: none` become the native-chart rule. The rule is: no `html:` attribute or SVG string in a section file, and `-webkit-mask-image` beside every `mask-image`.
   - `docs/references/component-inventory.md`:
     - Rows 15 to 17 and the prose for the hue wheel, the tone curve and the damping graph describe the native marks (`.an-chart`, `.ch-ribbon`, `.ch-band`, `.ch-dot`, `.ch-rule`, `.ch-circle`, `--series`), not SVG.
     - The general prose at the "data-viz marks (SVG/CSS ...)" line and the "non-interactive SVG/CSS marks" line says native DOM/CSS.
   - `docs/references/decision-records.md`: append an ADR before `## Quick map`.
     - Heading: `## ADR-<next>: Analysis charts are native DOM marks; the html: SVG exception is retired`.
     - `<next>` is one above the highest `## ADR-` number on this lane and on `origin/main` (`git show origin/main:docs/references/decision-records.md`). At plan time the lane's highest is ADR-033 (T-0027) and main's is ADR-034 (T-0021, compute layers), so it is ADR-035 unless a lane lands first. Do not reuse 034: the lane's resync would collide.
     - Context: the user's 2026-10-08 ruling, with the source project as a reference only.
     - Decision: core and renderer layering; nominal px boxes with percent polygons; snapshot-tier cards with no tooltip or keyboard path; a hidden source table; curved dashes by mask; the four geometric drawings ported; icons keep `innerHTML`.
     - Consequences, and a Status line in ADR-033's PROPOSED form.
     - Add its Quick-map row (`| ADR-<next> | ... |`) after the last `| ADR-0NN |` row of the Quick-map table.
4. `test/smoke/smoke.mjs`:
   - Cover the color editor rail, the Typography section and the Geometry section, each in light and in dark: set `${el}.theme = "light"` or `"dark"`, then `render()`.
   - Save `smoke-out/charts-<section>-<theme>.png` for each.
   - Assert:
     - at least 4 `.an-chart` in the color rail (L*xC, tone, chroma, hue wheel), at least 3 in typography and at least 3 in geometry;
     - every `.ch-ribbon` has a non-zero bounding box and no `NaN` in its `style`;
     - a `.ty-mono` ribbon computes a `maskImage` (or `webkitMaskImage`) other than `none`;
     - the centering card holds exactly 2 `.ch-rect`.
   - Restore `theme = "system"` afterwards.
5. Gates. Run each through `gate_lock.py`, exactly as the criteria write it (`SDLC_GATE_WORKERS=10`). Run `npm ci` first only if `node_modules` is missing; `npm run build` needs it.
   - `npm test`. Its generator prefix rewrites `figma/plugin/ui.html`. While the bundle is stale, the first run fails the shasum check; a second run passes. Keep the regenerated bytes for CI's drift gate (`.sdlc/adapter.md` section 1).
   - `npm run build`, then `npm run smoke`. Smoke runs the build first, and Chrome is on this host.
   - The sweep legs one at a time, never the chained `gate:sweeps`. Run `gate:corpus-reset` first (`test/ui/headless-boot.mjs --full`, the only leg this plan's files feed), then the seven colour legs.
   - Fix every red that steps 1 to 4 introduced, and repair any cite a fix moves (`node test/repo/citations.mjs`). Cites into `app-helpers.mjs`, which item 1 shifts: 10 in the inventory, 1 in `00-synthesis.md`, 6 in `03-stores-and-persistence.md`.
6. No push, PR or issue.
### Acceptance criteria
- (red) `! grep -qF 'innerHTML' src/ui/app-helpers.mjs`
- (red) `test -f test/repo/dom-charts.mjs && out=$(node test/repo/dom-charts.mjs) && printf '%s\n' "$out" | grep -qF 'h() sets no innerHTML'`
- `test -f test/repo/dom-charts.mjs && ! out=$(node --input-type=module -e 'import fs from "node:fs"; import { syncBuiltinESMExports } from "node:module"; const r = fs.readFileSync; fs.readFileSync = (p, ...a) => { const s = r(p, ...a); return String(p).endsWith("src/ui/sections/geometry.js") ? s + "\nconst zz = \"<svg></svg>\";\n" : s; }; syncBuiltinESMExports(); await import("./test/repo/dom-charts.mjs");' 2>&1) && printf '%s\n' "$out" | grep -qF 'src/ui/sections/geometry.js'`
- (red) `! grep -qE 'SVG-chart|an-svg|fill: none' .claude/CLAUDE.md && grep -qF 'src/ui/charts/' .claude/CLAUDE.md && ! git grep -qE 'an-svg|fill: ?none|innerHTML for SVG' -- .claude/skills/building-editor-sections .claude/agents/change-reviewer-agent.md && grep -qF 'renderChart' .claude/skills/building-editor-sections/SKILL.md`
- (red) `! grep -qE 'SVG polar plot|SVG L[*] curve' docs/references/component-inventory.md && ! grep -qE '^[|] 1[5-7] [|] [*][*][^|]*[*][*] [|] data-viz [|] SVG [|]' docs/references/component-inventory.md && grep -qF 'ch-ribbon' docs/references/component-inventory.md`
- (red) `f=docs/references/decision-records.md && n=$(grep -oE '^## ADR-[0-9]+: Analysis charts are native DOM' "$f" | grep -oE 'ADR-[0-9]+') && test -n "$n" && grep -qE "^[|] $n [|]" "$f" && awk -v h="## $n:" 'index($0, h) == 1 {a = NR} /^## Quick map/ {q = NR} END {exit !(a && q && a < q)}' "$f"`
- (red) `for s in color typography geometry; do for m in light dark; do grep -qF "charts-$s-$m.png" test/smoke/smoke.mjs || exit 1; done; done`
- `a=$(cat figma/plugin/ui.html src/ui/*-assets.js src/ui/categories/*.js docs/reference/data/adia-* | shasum) && SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name npm-test -- npm test && test "$a" = "$(cat figma/plugin/ui.html src/ui/*-assets.js src/ui/categories/*.js docs/reference/data/adia-* | shasum)"`
- `SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name build -- npm run build`
- `out=$(SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name smoke -- npm run smoke 2>&1) && printf '%s\n' "$out" | grep -qF 'SMOKE PASS' && for s in color typography geometry; do for m in light dark; do test -s "smoke-out/charts-$s-$m.png" || exit 1; done; done`
- (guard) `SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name corpus-reset -- npm run gate:corpus-reset`
- (guard) `rc=0; for g in corpus-tonal corpus-anchor sweep-prime corpus-contrast mode-isolation even-dips chroma-envelope; do if ! SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name "$g" -- npm run "gate:$g"; then echo "red leg: $g"; rc=1; fi; done; exit $rc`

## Assumptions
- Replan scope: steps 1 and 2 are done and committed (6445ea08; HEAD e74e3f11 adds only `.sdlc/` records). Their text is kept as written, except the change the conductor's `scope widened: step 2` entry already made in `step-2/handoff.md`: step 2's scope guard carries `-e scripts/bundle.mjs`, and its Do item 8 names the `MODS` and `KEY` entries. Steps 3 to 5 are rewritten.
- `scripts/bundle.mjs` needs no edit in steps 3 to 5, which is the plan defect's "or state why" branch.
  - Verified in `scripts/bundle.mjs`: `KEY` holds `"core.mjs": "chartsCore"` and `"render.mjs": "chartsRender"`, and `MODS` lists `chartsCore` and `chartsRender` after `appHelpers` and before `colorSection`, `typeSection` and `geomSection`. The preflight resolves an import by basename only, so `../charts/render.mjs` from typography.js or geometry.js maps to `chartsRender`.
  - `node scripts/bundle.mjs` exits 0 at e74e3f11 (`wrote dist/ultimate-tokens.html 4190.9 KB`, 0.13 s).
  - It goes red as intended. In a throwaway copy with `import { axisTicks } from "../charts/axis.mjs";` planted into typography.js, it exits 1 with `src/ui/sections/typography.js: import path "../charts/axis.mjs" is not registered in KEY`.
  - Keeping `scripts/bundle.mjs` out of the step 3 and 4 scope allow lists is deliberate, so an edit there shows up red instead of widening silently.
- The bundle guard is safe at split time, despite the lesson about spans that regenerate `figma/plugin/ui.html`.
  - It writes only `dist/ultimate-tokens.html`, which `.gitignore` ignores (`dist/`).
  - `steps.py` `tree_state` snapshots `git status --porcelain --untracked-files=all -z` without `--ignored`, so `split --only` and the specgate red check never see that write. `git status` showed no change outside `.sdlc/` after the run.
  - No `(red)` or `(guard)` span runs `npm test`, `npm run build`, `npm run smoke` or a `gen:*` script; those stay untagged in step 5. The step 3 and 4 headless criteria are untagged for time (about 5 minutes under load), not for side effects.
- Default-document facts the probes count against, re-verified at e74e3f11 with node over `defaultDocument()`:
  - `typeScaleFor(doc, "base")` has 15 voices: 13 with 3 steps, UI-control and UI-widget with 1, and three `-mono` voices.
  - `geomScaleFor(doc, "base")` is tier `product`, with 27 cells, 27 `orderedSizeNames` and 15 distinct heights. `TIERS` is content, product and micro, with 9 cells each.
  - `mdAnchor` is product-md-md: height 32, icon 16, inset 8.
  - The criteria derive these counts at run time. Step 4's probe derives distinct heights and tiers through `orderedSizeNames` and `TIERS`, which is what `graphGeomPower` and `graphGeomBands` iterate.
- Probe results at e74e3f11, with `SDLC_BASE_SHA` set to HEAD:
  - Every `(red)` criterion in steps 3 to 5 exits 1 because the behavior is missing, with no thrown error. The steps 3 and 4 render probes exit through their own `process.exit(1)`; a debug print of step 4's probe showed 0 rects, 0 ribbons and 0 dots, because the charts are still SVG strings.
  - Step 5's untagged planted-`<svg` control is green now. Today's gate prints `FAIL src/ui/sections/geometry.js: 4 <svg strings, ALLOW lists 3 chart functions` and exits 1, and the final gate must keep naming the file.
- Guards: every step 3 and 4 guard is green at e74e3f11, and each was seen red in the throwaway copy at `.worktrees/tmp/planner-L3-native-dom-charts-2/base`.
  - Bundle: red on the planted unregistered import above.
  - `node test/ui/charts.mjs`: red with `scaleLinear` returning 0 for a non-finite input (`FAIL scaleLinear(NaN) is NaN, not 0`).
  - `node test/repo/citations.mjs`: red after 60 lines were planted into typography.js. A 2-line shift stays NEAR, not STALE, so the guard bites on real moves only.
  - `node test/repo/em-dash.mjs`: red with U+2014 planted in core.mjs (`FAIL: 1 em dashes`).
  - Scope guard: red with a planted `src/ui/app.js` edit.
- Sweep guards for step 5, timed at e74e3f11 in a throwaway worktree under `gate_lock.py`:
  - `gate:corpus-reset` exit 0 in 161 s.
  - The seven colour legs: `gate:corpus-tonal` exit 0 in 283 s. The other six were still running when this plan was delivered, as a background job in the `sweeps` worktree. `.sdlc/geometry-maison-ladder/planner-L3-5.md` measured all seven on this host on 2026-10-07: 1004 s in total, corpus-anchor the longest at 360 s, all exit 0. This lane's merge base with main, #818 (b5f957ae), landed under the green-CI rule, where `sweeps` is a required job, and steps 1 to 4 change no file those legs read.
  - `guard timeout: 3000` applies per span, so the legs loop has about three times headroom. This plan changes no engine file those legs read.
- Citation counts come from `runAudit()` over `discoverDocs()` (12 docs) in `scripts/audit-citations.mjs`, filtered by target file. Numbers are per doc and per target, as listed in each step's Do.
- Contract dependents, from `git grep` of `an-svg`, `ty-line`, `ty-dot`, `gp-*`, `gc-*`, the six chart function names, `typeAnalysisCards` and `geomAnalysisCards` outside the section files and `styles.css`:
  - `test/repo/dom-charts.mjs`: steps 3, 4 and 5.
  - `test/ui/headless-boot.mjs`: the `(na)` calls `app.graphTypeScale([])` and `app.graphGeomPower({ cells: {} })` are kept, and each port step's headless criterion checks they are still there. The `(ty)` and `(geo)` `.an-card >= 4` checks and smoke's `.an-card` counts (`test/smoke/smoke.mjs`, the Typography and Geometry sections) still hold, because the cards remain.
  - `src/ui/app.js`, the `typeAnalysisCards`/`geomAnalysisCards` dispatch: signatures are unchanged, so it is untouched.
  - The records `.claude/CLAUDE.md`, `.claude/agents/change-reviewer-agent.md` and the four `building-editor-sections` files: step 5.
  - Prose that names `typeAnalysisCards` or `geomAnalysisCards` (`docs/references/changelog.md`, `glossary.md`, `docs/specs/app-shell.md`, the reactivity reports): the names do not change, so it is untouched.
  - `headless-boot.mjs`'s `innerHTML` reads at the icon checks are icons, not charts, so they are untouched.
- `scaleLinear` maps a degenerate domain to the range midpoint (`src/ui/charts/core.mjs`), while `typography.js`'s `X(i, n)` returns `pad` for `n <= 1`. That is why step 3 keeps the local lambdas.
- ADR number: the lane holds ADR-030 to ADR-033, and `origin/main` (1a88f731) also holds ADR-034 (compute layers). Step 5 takes the next number above both, and its criterion checks the title, the Quick-map row and the position, not the number.
- The rule against deleting wins over the brief's "remove them when done". The probe worktrees `.worktrees/tmp/planner-L3-native-dom-charts-2/base` (with planted edits), `sweeps` and `lint` are left for the run's tmp reaper.
- Validated on a scratch copy at `.worktrees/tmp/planner-L3-native-dom-charts-2/lint/.sdlc/ndc-replan/`:
  - `steps.py lint`, `specgate.py check` and `results.py validate --role planner` pass.
  - `specgate.py red --step` passes for steps 3, 4 and 5, with 4, 3 and 5 spans red. Specgate skips the two `for`-loop spans (step 4 criterion 1, step 5 criterion 7); both were probed red by hand above.
  - `steps.py split --only 3` and `--only 4` each wrote their handoff in 3 s, with every guard green and no tree change outside `.sdlc/`.
  - `split --only 5` was not dry-run, because its sweep guards take about 25 minutes.

## Risks
- Pixels are not proven headlessly.
  - The render probes prove structure and numbers. `npm run smoke` proves layout in step 5, but only in Chrome.
  - Safari is unverified: `clip-path: polygon()` (13.1+), `aspect-ratio` (15+), `mask-image` (unprefixed only from 15.4, so the `-webkit-` twin is required) and `color-mix`.
  - The pixel review at light and dark, and the 390px check the handoff names, belong to the conductor's review seat after step 5. The rail itself is a fixed 290px column.
- The mask-dash encoding may read poorly on steep runs, such as the geometry height diagonal and the non-kit tier lines. The fallback is a faint solid ribbon: drop `--dash` from the class. That is CSS only.
- Main has moved past this lane's merge base (b5f957ae) with #819 (T-0021) and 1a88f731. They touch `scripts/bundle.mjs` (13 lines), `test/ui/headless-boot.mjs`, `test/smoke/smoke.mjs`, `docs/references/decision-records.md` (ADR-034) and `src/ui/model.mjs`.
  - A resync before landing will conflict on `scripts/bundle.mjs` `MODS`, on `smoke.mjs` (step 5 adds screenshots there), and on the ADR append.
  - The criteria check structure, not line numbers, so they survive a resync, but the citation repairs may need redoing.
- The citation repair load is large: 53 cites into `styles.css` in the inventory alone. Step 2 repaired them by number in one pass, and steps 3 and 4 move fewer lines.
- Step 3 stays at L2 and is not merged with step 4. Raising it to L3 would make steps 3 and 4 a same-level sequential pair, and a merged step would hold 20 criteria, over the 12-criterion cap. If the L2 builder stalls on the CSS or citation load as step 2 did, escalation takes it to L3.
- `.sdlc/baseline.md`'s `npm test` row (54 test files) and `.sdlc/architecture.md`'s DD4 row (the retired CLAUDE.md line) read as drifted until the Orchestrator re-measures them at pre-land. Neither is part of `npm test`.
- The typography dash correction changes the look: Title and Kicker lose their dashes, and Body-mono gains one. If the user preferred the old look, it is a one-line CSS change.
