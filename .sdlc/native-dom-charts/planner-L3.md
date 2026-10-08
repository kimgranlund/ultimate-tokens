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
- (guard) `test -n "$SDLC_BASE_SHA" && test -z "$( { git diff --name-only "$SDLC_BASE_SHA" -- . ":(exclude).sdlc"; git ls-files --others --exclude-standard -- . ":(exclude).sdlc"; } | grep -vxF -e src/ui/sections/color.js -e src/ui/styles.css -e src/ui/charts/core.mjs -e src/ui/charts/render.mjs -e test/ui/charts.mjs -e test/repo/dom-charts.mjs -e test/ui/headless-boot.mjs -e test/smoke/smoke.mjs -e figma/plugin/ui.html -e docs/references/component-inventory.md -e docs/specs/app-shell.md -e docs/reports/2026-07-17-cto-app.md -e docs/reports/2026-08-20-reactivity/00-synthesis.md -e docs/reports/2026-08-20-reactivity/01-core-reactivity.md -e docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md -e docs/reports/2026-08-20-reactivity/03-stores-and-persistence.md -e docs/reports/2026-08-20-reactivity/04-context-and-messaging.md)"`

## Step 3: Port the Typography charts
level: L2
### Read first
- `docs/references/AGENTS.md`
- `docs/specs/AGENTS.md`
- `docs/AGENTS.md`
### Do
Depends on: step 2. This step copies the chart CSS, the `--series`/`--dash` pattern and the ported color charts from that step.

1. `src/ui/sections/typography.js`: `graphTypeScale`, `graphTypeTracking` and `graphTypeLeading` build specs and return `renderChart(spec)` beside the existing `this.legend(...)`. Imports are as in step 2.
   - One line series per voice, with class `ty-s<gi>`, plus `ty-mono` when the voice name ends in `-mono`. Each series has `dot: 1.6`, and `v` is the plotted pair (step name or size, then the value).
   - Axes are two `lc-axis` rules. The tracking zero line is a `dg-unity` horizontal rule at `Y(0)`. The axis texts are labels.
   - Keep the `.an-empty` return (headless `(na)` calls `app.graphTypeScale([])`), the W/H/pad constants and the mappings.
2. `src/ui/styles.css`:
   - `.ty-s0` to `.ty-s14` each set `--series` to today's colour and drop `stroke`, `fill` and `stroke-dasharray`. `.ty-mono` sets `--dash`.
   - Why dash by voice name: today the dashes sit on `.ty-s3`, `.ty-s9`, `.ty-s10` and `.ty-s12`, whose comments say mono. The live voice order, from `typeScaleFor(defaultDocument(), "base")`, is Display, Headline, Sub-heading, Title, Sub-title, Lead, Body, Body-mono, Label, Label-mono, Kicker, Tiny, Tiny-mono, UI-control, UI-widget. So Title (3) and Kicker (10) are dashed and Body-mono (7) is not. Dashing by voice name fixes that drift and survives a voice reorder.
   - Correct the per-class comments to the live order.
   - Delete `.an-svg .ty-line`, `.ty-dot` and the comment above them. The legend marks `.an-leg-mark.ty.sN` stay as they are.
3. `test/repo/dom-charts.mjs`: the typography.js ALLOW entry becomes empty.
4. If this port exposes a renderer or core defect, fix it in `src/ui/charts/` and add a `test/ui/charts.mjs` case. Dashed ribbons get their first multi-series use here.
5. Citations: repair by number any cite the line shifts made stale. There are 5 cites into `sections/typography.js`, 13 written `typography.js:N`, and 51 into `styles.css`.

Focused checks: the criteria below, then the `npm test` floor.
### Acceptance criteria
- (red) `test "$(grep -cE 'html:[[:space:]]*[A-Za-z_]|<svg' src/ui/sections/typography.js)" -eq 0 && grep -qE '^import [{][^}]*renderChart[^}]*[}] from "[.][.]/charts/render[.]mjs";' src/ui/sections/typography.js`
- (red) `node --input-type=module -e 'const mk = (t) => ({ tagName: t.toUpperCase(), className: "", attrs: {}, children: [], nodeType: 1, setAttribute(k, v) { this.attrs[k] = String(v); }, append(...k) { this.children.push(...k); }, addEventListener() {} }); globalThis.document = { createElement: mk, createTextNode: (s) => ({ nodeType: 3, textContent: String(s) }) }; const all = (n, o = []) => { o.push(n); (n.children ?? []).forEach((c) => all(c, o)); return o; }; const has = (n, c) => String(n.className ?? "").split(/ +/).includes(c); const M = await import("./src/ui/model.mjs"); const { TypeSectionImpl: T } = await import("./src/ui/sections/typography.js"); const doc = M.defaultDocument(); const sc = M.typeScaleFor(doc, "base"); const t = Object.assign(Object.create(T.prototype), { doc, legend: () => null, _activeTypeScale: () => sc }); const cards = t.typeAnalysisCards({}).slice(0, 3).map((c) => all(c)); const cats = Object.entries(sc.categories).map(([k, v]) => [k, Object.keys(v ?? {}).length]); const steps = cats.reduce((s, c) => s + c[1], 0); const multi = cats.filter((c) => c[1] > 1).length; const mono = cats.filter((c) => c[1] > 1 && c[0].endsWith("-mono")).length; const good = (a) => { const rb = a.filter((n) => has(n, "ch-ribbon")); return a.some((n) => has(n, "an-chart")) && !a.some((n) => has(n, "an-svg")) && !a.some((n) => n.innerHTML) && rb.length === multi && a.filter((n) => has(n, "ch-dot")).length === steps && rb.filter((n) => has(n, "ty-mono")).length === mono && rb.every((n) => /clip-path: ?polygon[(]/.test(n.attrs.style ?? "") && !/NaN/.test(n.attrs.style)); }; process.exit(mono > 0 && cards.every(good) && cards[1].some((n) => has(n, "ch-rule") && has(n, "dg-unity")) ? 0 : 1)'`
- (red) `test -f test/repo/dom-charts.mjs && node test/repo/dom-charts.mjs && ! grep -qE '"(graphTypeScale|graphTypeTracking|graphTypeLeading)"' test/repo/dom-charts.mjs`
- (red) `grep -qE '^[.]ty-mono[ ,{][^}]*--dash' src/ui/styles.css && ! grep -qE '^[.]ty-s[0-9]+[^{]*[{][^}]*(stroke|fill)[[:space:]]*:' src/ui/styles.css && ! grep -qE 'ty-line|ty-dot' src/ui/styles.css`
- `node test/ui/headless-boot.mjs && grep -qF 'app.graphTypeScale([])' test/ui/headless-boot.mjs`
- (guard) `node test/repo/citations.mjs`
- (guard) `node test/repo/em-dash.mjs`
- (guard) `test -n "$SDLC_BASE_SHA" && test -z "$( { git diff --name-only "$SDLC_BASE_SHA" -- . ":(exclude).sdlc"; git ls-files --others --exclude-standard -- . ":(exclude).sdlc"; } | grep -vxF -e src/ui/sections/typography.js -e src/ui/styles.css -e src/ui/charts/core.mjs -e src/ui/charts/render.mjs -e test/ui/charts.mjs -e test/repo/dom-charts.mjs -e figma/plugin/ui.html -e docs/references/component-inventory.md -e docs/specs/app-shell.md -e docs/reports/2026-07-17-cto-app.md -e docs/reports/2026-08-20-reactivity/00-synthesis.md -e docs/reports/2026-08-20-reactivity/01-core-reactivity.md -e docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md -e docs/reports/2026-08-20-reactivity/03-stores-and-persistence.md -e docs/reports/2026-08-20-reactivity/04-context-and-messaging.md)"`

## Step 4: Port the Geometry charts and delete the SVG chart CSS
level: L3
### Read first
- `docs/references/AGENTS.md`
- `docs/specs/AGENTS.md`
- `docs/AGENTS.md`
### Do
Depends on: step 3. T-0027 (compound insets in `src/engine/geometry.mjs`) is already merged under step 2's precondition. These charts read `scale.cells[n].height`, `icon`, `text` and `inset`; T-0027 adds to those fields but does not rename them.

1. `src/ui/sections/geometry.js` (imports as in step 2):
   - `graphGeomCentering`: a spec with no series.
     - Two rects: `gc-cell` at x0, y0 with side `side`, and `gc-glyph` at gx, gy with side `g`.
     - Two horizontal `gc-pad` rules: one at `gy` from `x0` to `gx`, one at `gy + g` from `gx + g` to `x0 + side`.
     - No axes and no table; the `.geom-an-cap` caption under the chart states the numbers. Keep the caption.
   - `graphGeomPower`: series `gp-ref` (the height diagonal, stroke `STROKE.ref`, dashed by CSS), plus `gp-icon` and `gp-font`, each with `dot: 1.8`. `v: [height, value]`. Axes and labels as today; keep the legend.
   - `graphGeomBands`: one series per tier that has more than one cell. The kit tier (`scale.tier`) is `gp-font` with `dot: 1.9`; the others are `gp-ref` with no dots. `v: [cell name, height]`.
   - Keep the `.an-empty` returns (headless `(na)` calls `app.graphGeomPower({ cells: {} })`) and the W/H/pad constants.
2. `src/ui/styles.css`:
   - `.gp-ref` gets `--series: var(--ink-faint)` and `--dash`. `.gp-icon`, `.gp-font`, `.gp-dot-icon` and `.gp-dot-font` move to `--series`.
   - `.gc-cell` becomes a 1.5px `var(--line)` border with radius 2px.
   - `.gc-glyph` becomes a `color-mix(in srgb, var(--accent) 24%, transparent)` fill with a 1.5px `var(--accent)` border.
   - `.gc-pad` sets `--series: var(--ink-faint)` and `--chart-ref: 3px`. The ends are square; a 3px pad reads the same at this size.
   - This step ports the last SVG chart, so delete every SVG chart rule that is left: `.an-svg`, `.an-svg svg`, `.an-svg text`, and the `stroke`/`fill` declarations on `.lc-axis`, `.dg-unity`, `.gp-*` and `.gc-*`.
   - After this step, `src/ui/styles.css` contains no `an-svg` and no `stroke` anywhere, comments included.
3. `test/repo/dom-charts.mjs`: the geometry.js ALLOW entry becomes empty, and the pass line reads `dom-charts: 0 html: attributes in 0 allowlisted chart functions ...`.
4. If this port exposes a renderer or core defect, fix it in `src/ui/charts/` and add a `test/ui/charts.mjs` case. Rects and thick rules get their first real use here.
5. Citations: repair by number any cite the line shifts made stale. There are 5 cites into `sections/geometry.js`, 9 written `geometry.js:N`, and 51 into `styles.css`.

Focused checks: the criteria below, then the `npm test` floor.
### Acceptance criteria
- (red) `for f in src/ui/sections/*.js; do ! grep -qE 'html:[[:space:]]*[A-Za-z_]|<svg' "$f" || exit 1; done && grep -qE '^import [{][^}]*renderChart[^}]*[}] from "[.][.]/charts/render[.]mjs";' src/ui/sections/geometry.js`
- (red) `node --input-type=module -e 'const mk = (t) => ({ tagName: t.toUpperCase(), className: "", attrs: {}, children: [], nodeType: 1, setAttribute(k, v) { this.attrs[k] = String(v); }, append(...k) { this.children.push(...k); }, addEventListener() {} }); globalThis.document = { createElement: mk, createTextNode: (s) => ({ nodeType: 3, textContent: String(s) }) }; const all = (n, o = []) => { o.push(n); (n.children ?? []).forEach((c) => all(c, o)); return o; }; const has = (n, c) => String(n.className ?? "").split(/ +/).includes(c); const M = await import("./src/ui/model.mjs"); const { GeomSectionImpl: G } = await import("./src/ui/sections/geometry.js"); const doc = M.defaultDocument(); const sc = M.geomScaleFor(doc, "base"); const g = Object.assign(Object.create(G.prototype), { doc, legend: () => null, _activeGeomScale: () => sc }); const [c0, c1, c2] = g.geomAnalysisCards({}).slice(0, 3).map((c) => all(c)); const n = (a, c) => a.filter((x) => has(x, c)).length; const clean = (a) => a.some((x) => has(x, "an-chart")) && !a.some((x) => has(x, "an-svg")) && !a.some((x) => x.innerHTML) && a.filter((x) => has(x, "ch-ribbon")).every((x) => /clip-path: ?polygon[(]/.test(x.attrs.style ?? "") && !/NaN/.test(x.attrs.style)); const hs = new Set(Object.values(sc.cells).map((c) => c.height)).size; const rb2 = c2.filter((x) => has(x, "ch-ribbon")); process.exit([c0, c1, c2].every(clean) && n(c0, "ch-rect") === 2 && c0.filter((x) => has(x, "ch-rule") && has(x, "gc-pad")).length === 2 && n(c1, "ch-ribbon") === 3 && n(c1, "ch-dot") === 2 * hs && rb2.length === 3 && rb2.filter((x) => has(x, "gp-font")).length === 1 ? 0 : 1)'`
- (red) `test -f test/repo/dom-charts.mjs && out=$(node test/repo/dom-charts.mjs) && printf '%s\n' "$out" | grep -qE '^dom-charts: 0 html: attributes' && ! grep -qE '"(graphGeomCentering|graphGeomPower|graphGeomBands)"' test/repo/dom-charts.mjs`
- (red) `! grep -qE 'an-svg|stroke' src/ui/styles.css && grep -qE '^[.]gp-ref[ ,{][^}]*--dash' src/ui/styles.css`
- `node test/ui/headless-boot.mjs && grep -qF 'app.graphGeomPower({ cells: {} })' test/ui/headless-boot.mjs`
- (guard) `node test/repo/citations.mjs`
- (guard) `node test/repo/em-dash.mjs`
- (guard) `test -n "$SDLC_BASE_SHA" && test -z "$( { git diff --name-only "$SDLC_BASE_SHA" -- . ":(exclude).sdlc"; git ls-files --others --exclude-standard -- . ":(exclude).sdlc"; } | grep -vxF -e src/ui/sections/geometry.js -e src/ui/styles.css -e src/ui/charts/core.mjs -e src/ui/charts/render.mjs -e test/ui/charts.mjs -e test/repo/dom-charts.mjs -e figma/plugin/ui.html -e docs/references/component-inventory.md -e docs/specs/app-shell.md -e docs/reports/2026-07-17-cto-app.md -e docs/reports/2026-08-20-reactivity/00-synthesis.md -e docs/reports/2026-08-20-reactivity/01-core-reactivity.md -e docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md -e docs/reports/2026-08-20-reactivity/03-stores-and-persistence.md -e docs/reports/2026-08-20-reactivity/04-context-and-messaging.md)"`

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
2. `test/repo/dom-charts.mjs`, final form:
   - Drop the ALLOW map and check (b).
   - Assert zero `html:` attributes and zero `<svg` strings in every `src/ui/sections/*.js`, no `innerHTML` in `src/ui/app-helpers.mjs`, and no `innerHTML` or `<svg` in `src/ui/charts/*.mjs`.
   - Every FAIL line names its file. Keep reading through `readFileSync` from `node:fs`.
   - Pass line: `dom-charts: 0 html: attributes, 0 <svg strings in src/ui/sections, h() sets no innerHTML`.
   - Update the header comment.
3. Records. Stale context is a defect, so update all of these:
   - `.claude/CLAUDE.md`: delete the "SVG line charts set `fill: none`" bullet. Replace step 1's interim bullet with the convention:
     - Analysis charts are native DOM marks: HTML elements styled by CSS, with no SVG, no canvas and no `html:` attribute.
     - They are built with `renderChart(spec)` (`src/ui/charts/render.mjs`) over the pure `src/ui/charts/core.mjs`.
     - Series colour comes from `--series` (and `--dash`).
     - `test/repo/dom-charts.mjs` gates the convention.

     The new wording must not contain the literals `SVG-chart`, `an-svg` or `fill: none`, because the records criterion rejects them.
   - `.claude/skills/building-editor-sections/SKILL.md`:
     - The Left-analysis table cell.
     - Step 3: `.an-chart`, `renderChart` and `legend()` replace `.an-svg` and the `fill: none` rule.
     - The `references/best-practices.md` row of its reference table.
   - `references/best-practices.md`:
     - The `fill: none` selector bullet becomes the chart primitive: a spec in nominal px, `scaleLinear`, `--series` on the series class, and a hidden source table.
     - The `.an-svg` mentions and the `fill:none` note in the Geometry walkthrough are removed.
   - `references/foundations.md` section 4: `h()` no longer takes `html`.
   - `references/rubric.md` S4: "SVG lines set fill:none" becomes "charts are native DOM marks".
   - `.claude/agents/change-reviewer-agent.md`: the description's "SVG fill:none traps" and the browser-traps bullet on SVG `fill: none` become the native-chart rule. The rule is: no `html:` attribute or SVG string in a section file, and `-webkit-mask-image` beside every `mask-image`.
   - `docs/references/component-inventory.md`: rows 14 to 18 and sections 15 to 17 describe the native marks (`.an-chart`, `.ch-ribbon`, `.ch-band`, `.ch-dot`, `.ch-rule`, `.ch-circle`, `--series`), not SVG.
   - `docs/references/decision-records.md`: append an ADR before `## Quick map`.
     - Heading: `## ADR-<next>: Analysis charts are native DOM marks; the html: SVG exception is retired`. `<next>` is one above the highest `## ADR-` number at build time. That was ADR-033 when this plan was written, but another lane may take it first.
     - Context: the user's 2026-10-08 ruling, with the source project as a reference only.
     - Decision: core and renderer layering; nominal px boxes with percent polygons; snapshot-tier cards with no tooltip or keyboard path; a hidden source table; curved dashes by mask; the four geometric drawings ported; icons keep `innerHTML`.
     - Consequences, and a Status line in ADR-032's PROPOSED form.
     - Add its Quick-map row (`| ADR-<next> | ... |`) after the ADR-032 row.
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
   - Fix every red that steps 1 to 4 introduced, and repair any cite a fix moves (`node test/repo/citations.mjs`).
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
- The twelve `html:` sites are the whole exception, and no other `src/ui` caller passes `html:`.
  - Verified by `grep -n 'html:' src/ui/sections/*.js` (color.js 6, geometry.js 3, typography.js 3) and `grep -rln 'html:' src/ui` (those three plus the generated `src/ui/describe-mcp-assets.js` data).
  - `src/ui/app-helpers.mjs` has one `innerHTML`, the `h()` branch. `src/ui/icons.js:50` has its own, which stays.
- `h()` and the three section modules import and run under a five-method `document` stub with no DOM.
  - Verified at `710f2b05` by calling `graphLC`, `graphTone`, `graphChroma`, `graphDamping`, `graphHueWheel`, `_hueCircle`, `typeAnalysisCards` and `geomAnalysisCards` through that stub. Each returned its `.an-svg` wrapper, in 0.75 s wall time.
  - The render-probe criteria rely on this.
- Default-document facts that the probes count against:
  - 16 enabled palettes; context palettes 0 and 1 both carry `keyOklch`.
  - The type scale has 15 voices: 13 with 3 steps, UI-control and UI-widget with 1, and three `-mono` voices.
  - The geometry scale is tier `product`, with 27 cells and 15 distinct heights.
  - Verified by node probes over `defaultDocument()`, `projectView`, `typeScaleFor(doc, "base")` and `geomScaleFor(doc, "base")`.
  - The criteria derive these counts at run time instead of pinning them. The one exception is the color disc's 3 dots, which the probe sets itself (two context palettes plus the proposed colour).
- `tsc` does not type-check the new `.mjs` files: `tsconfig.json` has no `allowJs` or `checkJs`, so the chart modules' typing does not affect `npm run build`.
- The headless shim's `querySelectorAll` takes one class, and its `querySelector` matches only the last class token over the whole subtree (`test/ui/headless-boot.mjs`, `querySelectorAll` and `querySelector`). That is why step 2's q3 rewrite queries from the `.damp-graph` element.
- The planted-attribute control works by stubbing `fs.readFileSync` and calling `syncBuiltinESMExports()`. Run against today's `test/repo/svg-rules.mjs`, it printed `FAIL html: 13 html: attributes, .claude/CLAUDE.md states 12` and exited 1. So a gate that reads through `readFileSync` from `node:fs` sees the plant.
- Contract dependents, found by `git grep` and assigned to steps:
  - `test/run.mjs`, the `svg-rules.mjs` entry: step 1.
  - `test/smoke/smoke.mjs`, the `.newpal-hc svg` query: step 2.
  - `test/ui/headless-boot.mjs`: the q3 `innerHTML` diff (step 2), and the `(na)` empty-state calls to `graphTone`, `graphTypeScale` and `graphGeomPower`. Those calls are kept, and each port step's headless criterion checks they are still there.
  - The citations gate (`node test/repo/citations.mjs`, green at `710f2b05`, 12 docs, STALE 0). It covers 51 cites into `styles.css`, 53 into `color.js`, 18 into `typography.js`, 14 into `geometry.js` and 15 into `app-helpers.mjs`. Steps 2 to 5 repair them by number.
  - The records `.claude/CLAUDE.md`, `.claude/agents/change-reviewer-agent.md`, the four `building-editor-sections` files and `docs/references/component-inventory.md`: step 5.
  - `.sdlc/` records that name `svg-rules.mjs` are run history and stay as written.
- The four drawings the architect flagged for a possible user decision are settled here, not marked `unresolved:`. They are the hue wheel, the hue/chroma disc, the centering cell, and dashed curves by mask.
  - The user ruled "Rebuild charts as native DOM" for charts and graphs.
  - The architect classified all twelve charts as portable with native primitives (`architect-L1.md` Approach, Rejected alternatives).
  - The mask-dash look has a CSS-only fallback (see Risks).
- Dashing typography by voice name (`ty-mono`) instead of today's indices 3, 9, 10 and 12 corrects a drift; it is not a redesign. The CSS comments label the dashed classes mono. The live order, printed by `typeScaleFor(defaultDocument(), "base")`, puts Title at 3 and Kicker at 10, while Body-mono (7) is solid.
- `git mv` keeps the gate swap free of a delete. The `TESTS` count goes from 54 to 55 with `ui/charts.mjs`.
- Probe results at `710f2b05`, in a clean detached worktree with `SDLC_BASE_SHA` set to that commit:
  - Every guard is green: `node test/repo/em-dash.mjs`, `node test/repo/citations.mjs` and the four scope guards.
  - Each scope guard exits 1 with `SDLC_BASE_SHA` unset, and also with a 2026-10-05 base that leaves 276 files in the diff.
  - Every `(red)` criterion exits 1 because the behavior is missing. The step 1 core and renderer criteria fail on `ERR_MODULE_NOT_FOUND` for the new modules. The steps 2 to 4 render probes exit through their own `process.exit(1)` with no thrown error. The rest fail on the absent gate, ports and records.
  - `node test/ui/headless-boot.mjs` is green there, at about 5 minutes per run at load average 41 to 53. So the steps 2 to 4 headless criteria start green and must stay green.
- `steps.py lint`, `specgate.py check` and a dry `steps.py split` pass on this plan text; the split wrote all five step handoffs.
- `npm test`, `npm run build` and `npm run smoke` in step 5 are untagged, not `(guard)`. All three rewrite `figma/plugin/ui.html`, which `steps.py split --only` counts as a tree change. `.sdlc/geometry-maison-ladder/planner-L3-6.md` step 14 made the same call. The sweep legs are read-only, so they are guards.
- Sweep timing behind `guard timeout: 3000`:
  - `npm run gate:corpus-reset` took 274 s at `710f2b05` on this host (exit 0, `HEADLESS BOOT PASS`, with other lanes running).
  - The seven colour legs were not re-timed, to stay within budget. `.sdlc/geometry-maison-ladder/planner-L3-5.md` measured them on this host on 2026-10-07: 1004 s in total, corpus-anchor the longest at 360 s, all exit 0.
  - The timeout applies per span, so the loop span has about three times headroom.
  - This plan changes no engine file those legs read.
- Steps 2 and 3 check the removed SVG declarations line by line, so a multi-line rule could slip past them. Step 4's `! grep -qE 'an-svg|stroke'` over the whole file is the check that the SVG chart CSS is gone.
- My probe worktree is `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/tmp/planner-L3-native-dom-charts/base`, detached at `710f2b05`, with scratch `.sdlc/ndc-lint/` and `.sdlc/ndc-lint2/` copies of this plan. It is left for the run's tmp reaper, per the no-delete rule.
- T-0025 and T-0027 landing before step 2 cannot be a criterion, because no sha exists yet to pin. It is the conductor's precondition, stated in step 2's Do.

## Risks
- Pixels are not proven headlessly.
  - The render probes prove structure and numbers. `npm run smoke` proves layout in step 5, but only in Chrome.
  - Safari is unverified: `clip-path: polygon()` (13.1+), `aspect-ratio` (15+), `mask-image` (unprefixed only from 15.4, so the `-webkit-` twin is required) and `color-mix`.
  - The pixel review at light and dark belongs to the conductor's review seat after step 5. So does the 390px check the handoff names; the rail itself is a fixed 290px column in the `styles.css` grid.
- The mask-dash encoding may read poorly on steep runs, such as the chroma ceiling at the ramp ends and the geometry height diagonal. The fallback is a faint solid ribbon: drop `--dash` from the class. That is CSS only, with no core or spec change.
- The hidden source table adds about three nodes per sample on every `liveRefresh`. If the rail re-render slows, the table can become opt-in per spec without a core change.
- Sequencing: if T-0025 or T-0027 lands after step 2 starts, the lane resyncs, and `color.js`, `styles.css` and `headless-boot.mjs` will conflict. The criteria check structure, not line numbers, so they survive a resync, but the citation repairs may need redoing.
- The citation repair load is large: 51 cites into `styles.css` and 53 into `color.js`, most of them in `docs/references/component-inventory.md`. A port that moves many lines may make dozens of cites stale at once. The builder repairs them by number, as the maison ladder run did.
- `.sdlc/baseline.md`'s `npm test` row records 54 test files, and after step 1 `TESTS` holds 55.
  - `sh .sdlc/checks/baseline-agrees-check.sh` will then report one more STALE line until the Orchestrator re-measures the baseline at pre-land. That check is not part of `npm test` and is already STALE on the `ui.html` size.
  - `.sdlc/architecture.md`'s DD4 doc-drift row quotes the retired CLAUDE.md line and will read as drifted.
- The typography dash correction changes the look: Title and Kicker lose their dashes and Body-mono gains one. If the user preferred the old look, it is a one-line CSS change.
- ADR number: another lane may append ADR-033 first (T-0027 is an L4 ticket). Step 5 numbers the ADR from the highest number at build time, and its criterion checks title and position, not the number.
