## Task goal
User ruling 2026-10-08: "for charts and graphs, you can learn how to do them properly here /Users/kimgranlund/Projects/nonoun/native-dom-charts", and, asked what to do with its rules, they chose "Rebuild charts as native DOM". Replace the app's analysis charts, today hand-built SVG strings set through `h("div", { class: "an-svg", html: svg })` (the ratified `html:` exception, 12 live uses: `src/ui/sections/color.js` :62 `graphLC`, :90 `graphTone`, :118 `graphChroma`, :208 `graphContrast`/`graphDamping`, :242 `graphHueWheel`, :633 hue/chroma disc; `geometry.js` :482 centering-law cell diagram, :517 icon and text vs height, :548 tier ladders; `typography.js` :54 type scale, :85 letter-spacing, :111 line-height ratio; classes in `src/ui/styles.css` ~:464-501, 836-839, 1389, 1526-1531), with native DOM charts: marks are HTML elements styled with CSS, no SVG and no Canvas, built with `h()` hyperscript.

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
- (guard) `test -n "$SDLC_BASE_SHA" && test -z "$( { git diff --name-only "$SDLC_BASE_SHA" -- . ":(exclude).sdlc"; git ls-files --others --exclude-standard -- . ":(exclude).sdlc"; } | grep -vxF -e src/ui/sections/geometry.js -e src/ui/styles.css -e src/ui/charts/core.mjs -e src/ui/charts/render.mjs -e test/ui/charts.mjs -e test/repo/dom-charts.mjs -e figma/plugin/ui.html -e docs/references/component-inventory.md -e docs/specs/app-shell.md -e docs/reports/2026-08-20-reactivity/00-synthesis.md -e docs/reports/2026-08-20-reactivity/01-core-reactivity.md -e docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md -e docs/reports/2026-08-20-reactivity/03-stores-and-persistence.md -e docs/reports/2026-08-20-reactivity/04-context-and-messaging.md -e scripts/bundle.mjs)"`

## Scope widened
- `scripts/bundle.mjs`: allowed by a conductor scope decision (steps.py widen)
