## Task goal
User ruling 2026-10-08: "for charts and graphs, you can learn how to do them properly here /Users/kimgranlund/Projects/nonoun/native-dom-charts", and, asked what to do with its rules, they chose "Rebuild charts as native DOM". Replace the app's analysis charts, today hand-built SVG strings set through `h("div", { class: "an-svg", html: svg })` (the ratified `html:` exception, 12 live uses: `src/ui/sections/color.js` :62 `graphLC`, :90 `graphTone`, :118 `graphChroma`, :208 `graphContrast`/`graphDamping`, :242 `graphHueWheel`, :633 hue/chroma disc; `geometry.js` :482 centering-law cell diagram, :517 icon and text vs height, :548 tier ladders; `typography.js` :54 type scale, :85 letter-spacing, :111 line-height ratio; classes in `src/ui/styles.css` ~:464-501, 836-839, 1389, 1526-1531), with native DOM charts: marks are HTML elements styled with CSS, no SVG and no Canvas, built with `h()` hyperscript.

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
- (guard) `test -n "$SDLC_BASE_SHA" && test -z "$( { git diff --name-only "$SDLC_BASE_SHA" -- . ":(exclude).sdlc"; git ls-files --others --exclude-standard -- . ":(exclude).sdlc"; } | grep -vxF -e src/ui/sections/typography.js -e src/ui/styles.css -e src/ui/charts/core.mjs -e src/ui/charts/render.mjs -e test/ui/charts.mjs -e test/repo/dom-charts.mjs -e figma/plugin/ui.html -e docs/references/component-inventory.md -e docs/specs/app-shell.md -e docs/reports/2026-08-20-reactivity/00-synthesis.md -e docs/reports/2026-08-20-reactivity/01-core-reactivity.md -e docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md -e docs/reports/2026-08-20-reactivity/03-stores-and-persistence.md -e docs/reports/2026-08-20-reactivity/04-context-and-messaging.md -e scripts/bundle.mjs)"`

## Scope widened
- `scripts/bundle.mjs`: allowed by a conductor scope decision (steps.py widen)
