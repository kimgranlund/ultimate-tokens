## Task goal
User ruling 2026-10-08: "for charts and graphs, you can learn how to do them properly here /Users/kimgranlund/Projects/nonoun/native-dom-charts", and, asked what to do with its rules, they chose "Rebuild charts as native DOM". Replace the app's analysis charts, today hand-built SVG strings set through `h("div", { class: "an-svg", html: svg })` (the ratified `html:` exception, 12 live uses: `src/ui/sections/color.js` :62 `graphLC`, :90 `graphTone`, :118 `graphChroma`, :208 `graphContrast`/`graphDamping`, :242 `graphHueWheel`, :633 hue/chroma disc; `geometry.js` :482 centering-law cell diagram, :517 icon and text vs height, :548 tier ladders; `typography.js` :54 type scale, :85 letter-spacing, :111 line-height ratio; classes in `src/ui/styles.css` ~:464-501, 836-839, 1389, 1526-1531), with native DOM charts: marks are HTML elements styled with CSS, no SVG and no Canvas, built with `h()` hyperscript.

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
- (guard) `test -n "$SDLC_BASE_SHA" && test -z "$( { git diff --name-only "$SDLC_BASE_SHA" -- . ":(exclude).sdlc"; git ls-files --others --exclude-standard -- . ":(exclude).sdlc"; } | grep -vxF -e src/ui/sections/color.js -e src/ui/styles.css -e src/ui/charts/core.mjs -e src/ui/charts/render.mjs -e test/ui/charts.mjs -e test/repo/dom-charts.mjs -e test/ui/headless-boot.mjs -e test/smoke/smoke.mjs -e figma/plugin/ui.html -e docs/references/component-inventory.md -e docs/specs/app-shell.md -e docs/reports/2026-07-17-cto-app.md -e docs/reports/2026-08-20-reactivity/00-synthesis.md -e docs/reports/2026-08-20-reactivity/01-core-reactivity.md -e docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md -e docs/reports/2026-08-20-reactivity/03-stores-and-persistence.md -e docs/reports/2026-08-20-reactivity/04-context-and-messaging.md -e scripts/bundle.mjs)"`

## Scope widened
- `scripts/bundle.mjs`: allowed by a conductor scope decision (steps.py widen)
