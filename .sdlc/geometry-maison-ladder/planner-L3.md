<!-- role=planner level=L3 model=opus effort=xhigh -->
## Goal
Rebuild the Geometry system on the Maison ui-kit ladder (tier x scale x size, 27 validated cells, resolver roles `--control-*`, `--chip-*`, `--radius-*`, `--ctx-*`), with per-cell text composed from a height-indexed Type UI text table. Carry it through every export, the Figma binder and plugin, the MCP kit, saved-kit migration, the app shell, docs and skills, with `npm test` and `npm run build` green.

## Step 1: Type owns the height-indexed UI text table
level: L4
### Do
Depends on: none. Design source: `.sdlc/geometry-maison-ladder/architect-L1.md` (Approach para 4, Interfaces `type.mjs` line) and handoff Decision 1.
- `src/engine/type.mjs`: add `export const UI_TEXT`. It holds the Maison CSV height-to-text column verbatim, 25 entries keyed by height: 96:30, 92:29, 88:28, 84:27, 80:26, 76:25, 72:24, 68:23, 64:22, 60:21, 56:20, 52:19, 48:18, 44:17, 40:16, 36:15, 32:14, 28:13, 24:12, 22:11, 20:10, 18:9, 16:8, 14:7.5, 12:7. Source `/Users/kimgranlund/Projects/maison/ui-kit-maison/geometry/component-geometry.csv`, read only.
  - Add `export function uiText(height, factor = 1)`. It returns `Math.round(UI_TEXT[height] * factor * 2) / 2`, a half-pixel grid that is the identity at factor 1 because the CSV is on that grid. It throws a `RangeError` for a height not in the table.
  - `typeScale(config)` returns `uiText`, a plain object mapping all 25 heights to `uiText(h, factor)`, where `factor = bodyBase / Body base` (the existing factor).
  - `modeFactor` never applies to `uiText`. This matches today's freeze of the UI voices across Tablet and Mobile (`src/ui/model.mjs:122-123`).
- Retire the six fixed rows: `SIZES["UI-control"]`, `SIZES["UI-widget"]`, `RANKS6` and the six-row branch of `ranksFor`.
  - Per the `unresolved:` U1 item under Assumptions, this plan builds the recommended option B. Each of the two voices keeps exactly one step, `MD`, with a derived `size`: `uiText(32, factor)` for UI-control (14, the text of the default cell product-md-md) and `uiText(24, factor)` for UI-widget (12, the text of 32's compact row).
  - Every character field (weight, tracking, leading, case, box, `singleLineHeight`) is unchanged.
  - Sibling weights (`type.mjs:347`), voice fonts, `src/ui/sections/typography.js` (`:640` reads `.MD`) and `src/engine/ds-export.js:444` keep working because `MD` still exists.
  - If the user picks option A, this step is replanned.
- `src/ui/model.mjs`: drop the `fam6(["UI-control"], ...)` and `fam6(["UI-widget"], ...)` terms from `modeTierNudge` (`:118-125`). The Label/Tiny nudges stay.
- `figma/binder/style-plan.mjs`: comments and the `SINGLE_LINE_VOICES` path now serve one `md` step for the two voices. The step filter at `:162` already skips absent steps.
  - In a live file, the retired `type/ui-control/{xs,sm,lg,xl,2xl}/*` and `type/ui-widget/...` variables and their text styles deprecate id-preserving (left unbound, no rename target).
  - This is the same scope decision `figma/binder/migrations.mjs:100-115` records for `size/{step}/font`. Add a comment there saying so.
- Contract dependents in this step:
  - `test/engine/type.mjs`: new group `ui-text-table` covering 25 entries, the values above, the off-table `RangeError`, and factor 1.125 rounding.
  - `test/figma/style-plan.mjs`: the UI voices carry one `md` style family.
  - `test/engine/exports.mjs`: the type assertions that pin UI-control/UI-widget rows.
  - `plugin/ultimate-tokens/skills/typography-tokens/SKILL.md`: the Steps cell `xs/sm/md/lg/xl/2xl` for both voices becomes `md`. Also its `references/interface.md` and `references/responsive.md`, and the mutation fixture text in `test/plugin/typography-tokens.mjs:48`.
  - `test/ui/headless-boot.mjs` group `(ty)` (`:2437`): its `TYPE_STEPS` count of 13 voices x 3 plus the two UI voices x 6 becomes x 1. Its `(geo)` assertions at `:2747-2749` still hold here because `MD` survives; step 6 rewrites them.
- Left for later steps on purpose:
  - `src/engine/geometry.mjs` still composes `font` from `categories["UI-control"][step]`, so its MD font moves from 15 to 14 and `test/engine/geometry.mjs` may go red until step 2 rewrites both.
  - `type.tokenOverrides` keys on the retired UI steps are dropped by step 3's migration.
  - The type-scale maintainer skill and `docs/references/typography/` are repaired in step 13.
- Focused checks: the criteria below.
### Acceptance criteria
- (red) `node --input-type=module -e 'import("./src/engine/type.mjs").then((t) => { let threw = false; try { t.uiText(30); } catch (e) { threw = e instanceof RangeError; } const u = t.typeScale({}).uiText; const ok = threw && u && Object.keys(u).length === 25 && u[32] === 14 && u[96] === 30 && u[14] === 7.5 && u[12] === 7; process.exit(ok ? 0 : 1); })'`
- (red) `node --input-type=module -e 'import("./src/engine/type.mjs").then((t) => { const c = t.typeScale({}).categories; const ok = Object.keys(c["UI-control"]).join() === "MD" && Object.keys(c["UI-widget"]).join() === "MD" && c["UI-control"].MD.size === 14 && c["UI-widget"].MD.size === 12; process.exit(ok ? 0 : 1); })'`
- (red) `node --input-type=module -e 'import("./src/engine/type.mjs").then((t) => { const v = Object.values(t.typeTokensFigmaModes(t.typeScale({})).collections)[0].variables; const keys = Object.keys(v); const ok = keys.includes("type/ui-control/md/size") && !keys.some((k) => /^type\/ui-(control|widget)\/(xs|sm|lg|xl|2xl)\//.test(k)); process.exit(ok ? 0 : 1); })'`
- (red) `! grep -qF 'RANKS6' src/engine/type.mjs`
- (red) `! grep -qE 'fam6\(\["UI-(control|widget)"\]' src/ui/model.mjs`
- (red) `! grep -qF 'xs/sm/md/lg/xl/2xl' plugin/ultimate-tokens/skills/typography-tokens/SKILL.md`
- (red) `grep -qF 'ui-text-table' test/engine/type.mjs`
- (guard) `node test/engine/type.mjs`
- (guard) `node test/figma/style-plan.mjs`
- (guard) `node test/plugin/typography-tokens.mjs`
- (guard) `node test/engine/categories.mjs`
- (guard) `node test/ui/headless-boot.mjs`

## Step 2: Geometry engine on the 27-cell ladder
level: L4
### Do
Depends on: step 1 (`UI_TEXT`, `uiText`, `typeScale().uiText`). Design source: `.sdlc/geometry-maison-ladder/architect-L1.md` (Approach, Glyphs, Interfaces, and Carry forward for the Maison paths and the verified anatomy facts). Maison sources are read only, never edited.
- Fixture first: `test/engine/fixtures/maison-geometry-rows.json` has this shape:
  - `source`: `{ repo: "ui-kit-maison", path: "src/foundation/geometry/geometry.ts", commit: "ca56f2d90ed0ed8c9ae27748a97417054080ad34", sha256: "8d076600521cc028c390142ff38d59badcd4e0379b172d1b95a80a9ebfa58136" }`
  - `rows`: the 27 geometryRows from geometry.ts:409-653, with fields tier, scale, size, height, inset, text, icon.
  - `resolverCells`: 27 entries with caption-text, chip-height, chip-inset, chip-text and icon-height-ratio, read from geometry.ts's per-tier `--m-cell-*` declarations.
  - `ladder`: the 25 CSV rows.
- `src/engine/geometry.mjs` exports:
  - `TIERS`, definition.mjs verbatim: content {base 48, offsets sm -12 md 0 lg 16, step 8}, product {32, -4/0/4, 8}, micro {16, -2/0/2, 2}.
  - `SCALES = ["sm","md","lg"]` and `SIZES = { sm: -1, md: 0, lg: 1 }`.
  - `RADIUS_MODES = { default: { text: 0.5, height: 0 }, round: { text: 1, height: 0 }, sharp: { text: 0.25, height: 0 }, pill: { text: 0, height: 0.5 } }` (Maison `scripts/generate.mjs:58`).
  - `DEFAULT_GEOMETRY = { tier: "product", scale: "md", radius: "round", spaceBase: 4 }`.
  - `LADDER_ROWS`: 25 rows of height, inset, icon. Text comes from `type.mjs`'s `uiText`, so geometry imports type.mjs. type.mjs imports only collections.js and font-fallbacks.mjs, so there is no cycle.
  - `cellHeight(tier, scale, size)` = base + offsets[scale] + SIZES[size] * step, and a row lookup that throws `RangeError` off-table.
- Per cell (Maison `scripts/generate.mjs:36,47-52,70-73`):
  - `height`, `inset`, `icon` from the ladder row.
  - `text` = `opts.typeScale ? opts.typeScale.uiText[height] : uiText(height)`.
  - The compact row is the first ladder row, in descending height order, whose height is <= cell height - cell inset; if none, the smallest row.
  - `captionText` = `chipText` = the compact row's text, composed the same way. `chipHeight` = min(compact height, height). `chipInset` = the compact inset.
  - `iconRatio` = icon / height, unrounded. `minWidth` = height.
  - `radiusControl` = text * k.text + height * k.height for the kit's radius mode. `radiusMark` = radiusControl * iconRatio. `radiusInset` = max(0, radiusControl - inset / 2). `radiusCard` = radiusControl + inset / 2.
- `geomScale(config = {}, opts = {})`:
  - config is `{ tier, scale, radius, spaceBase }`; unknown ids fall back to `DEFAULT_GEOMETRY`.
  - It returns `{ tier, scale, radius, spaceBase, cells, cell, radii, space, insets, gaps, borders, focus }`.
  - `cells` holds all 27, keyed `{tier}-{scale}-{size}` in Maison's geometryRows order: content, product, micro; then scale sm, md, lg; then size sm, md, lg.
  - `cell` = `{ name: "{tier}-{scale}-md", ...cells[name] }`, the kit default.
  - `radii` (M3), `space`, `insets`, `gaps`, `borders` and `focus` derive from `spaceBase` exactly as today. They stay byte-identical at spaceBase 4, which keeps the Tailwind/shadcn/Panda/Radix seeds at `src/engine/exports.js:901,1037,1369` stable.
- Anchors:
  - `orderedSizeNames(scale)` returns the 27 names in that order.
  - `sizeAnchor(scale, name)` returns `{ name, size: scale.cells[name] }`. `MD` resolves to `scale.cell.name`, the kit default cell (product-md-md at defaults, architect Approach para 2). The other five come from the fixed legacy-height map (architect Carry forward): XS product-sm-sm, SM product-md-sm, LG product-lg-md, XL content-md-md, 2XL content-lg-md.
  - `mdAnchor(scale)` = `sizeAnchor(scale, "MD")`.
- Emitters. Role names come from handoff Decision 3; the prefix goes through the existing `ns()` helper (`geometry.mjs:330`).
  - `geomTokensSizesCSS`: one `:root` block of the 27 primitives `--{ns(pfx,"size")}-{tier}-{scale}-{size}-{field}`. Fields: height, inset, text, icon, caption-text, chip-height, chip-inset, chip-text, icon-ratio (unitless), min-width, radius-control, radius-mark, radius-inset, radius-card.
  - New `export function geomResolverCSS(scale, { unit, prefix })`: Maison's context resolver in our names.
    - `:where(:root)` carries the kit default context: the kit tier's cells as `--ctx-cell-{scale}-{size}-{field}`; the `--ctx-scale-*`/`--ctx-size-*` 0/1 indicators for the kit scale and size md; `--ctx-radius-text`/`--ctx-radius-height` for the kit radius mode.
    - `:where([data-tier="X"])` reassigns the `--ctx-cell-*` to tier X's primitives. `:where([data-scale="X"])`, `:where([data-size="X"])` and `:where([data-radius="X"])` set the indicators.
    - `:where(*, :host)` defines the roles `--control-height/-inset/-text/-icon/-caption-text/-icon-ratio` and `--chip-height/-inset/-text` as the sum of products over the nine cells.
    - It also defines `--radius-control: calc(var(--control-text) * var(--ctx-radius-text, 1) + var(--control-height) * var(--ctx-radius-height, 0))`, plus `--radius-mark`, `--radius-inset` and `--radius-card` by the formulas above (`generate.mjs:62,70-73`).
    - There is no `--g-micro-*` equivalent.
  - `geomTokensCSS`: the primitives, then the container tier lines as today (radius ladder, space, inset, gap, border, focus), then the resolver. `--density` and `--radius-default` are dropped: no treatment is left to pick a favoured level, so `radiusDefault` leaves the scale too. The `.control-{step}` classes retire.
  - `geomTokensBreakpointCSS(modes)`: each mode file's `:root` sets only the `--ctx-scale-*` indicators for that mode's `scale.scale`.
  - `geomTokensDTCG`: a `size` group keyed by cell with kebab fields (dimension; `icon-ratio` as `$type: "number"`).
  - `geomTokensFigma`: the same, as numbers.
  - `geomTokensFigmaModes(base, modes)`: mode-constant `size/{cell}/{field}` (27 x 14), plus per-mode alias variables `control/{tier}/{size}/{field}` (9 x 14) shaped `{ type: "ALIAS", values: { [mode]: "size/{tier}-{modeScale}-{size}/{field}" } }`, where modeScale is that mode's `scale.scale`. Radius, space, inset, gap, border and focus stay as today.
- Retire `RAMP_LADDER`, `GEOMETRY_RAMPS`, `LADDER_*`, `GEOMETRY_TREATMENTS`, `SIZE_KEYS`, `CONTROL_FONT`, `GAP_UNIT`, `buildSize*`, caret, gap, the four pads, density and `radiusPill`.
- Contract dependents in this step:
  - `test/engine/geometry.mjs`, rewritten with these groups: `maison-ladder` (27 cells deep-equal the fixture rows and resolverCells; off-table throws), `anatomy` (inset === (height - icon) / 2 for all 27), `radius-modes` (27 x 4 = 108 values), `anchors`, `emitters`, and `container-identity` (radii/space/insets/gaps/borders/focus deep-equal today's values at spaceBase 4).
  - `test/engine/exports.mjs` geometry assertions.
- Left for later steps on purpose; they read the old shape and stay red until then:
  - Step 3: `src/ui/model.mjs`, `src/ui/persist.js`, `test/ui/model.mjs`, `test/ui/persist.mjs`.
  - Step 4: `src/engine/ds-export.js` (including its `radiusDefault` reads at `:258` and `:1598`), `mcp/png-swatch-board.mjs`, `mcp/brand-kit-core.mjs`, `scripts/smoke-panda.mjs`, `scripts/gen-adia-derived-exports.mjs`.
  - Step 5: `figma/binder/migrations.mjs`, `figma/binder/mode-apply-plan.mjs`, `figma/plugin/code.js` and the `size/{step}` to `size/{cell}` rename map. This lands in the same PR, so no landed state carries the emitter rename without its map.
  - Step 6: `src/ui/sections/geometry.js`, `src/ui/overlays/drawer.js`, `src/ui/overlays/apply-gate.js`, `src/ui/app.js`, `test/ui/headless-boot.mjs`. They come after the exports and the Figma path because the headless boot also exercises those.
  - Step 12: `plugin/ultimate-tokens/skills/geometry-tokens/scripts/dimension-parity.mjs` and the skill's `--radius-default` and `.control-*` teaching.
- The untagged test runs in the criteria are not guards. Earlier steps leave them red at this step's start by design, so `steps.py split --only` must not run them first; they must be green after this step.
### Acceptance criteria
- (red) `node -e 'const f = require("./test/engine/fixtures/maison-geometry-rows.json"); process.exit(f.rows.length === 27 && f.resolverCells.length === 27 && f.ladder.length === 25 && f.source.sha256 === "8d076600521cc028c390142ff38d59badcd4e0379b172d1b95a80a9ebfa58136" ? 0 : 1)'`
- (red) `grep -qF 'maison-ladder' test/engine/geometry.mjs`
- (red) `node --input-type=module -e 'import("./src/engine/geometry.mjs").then((g) => { const s = g.geomScale({}); const md = s.cells["product-md-md"]; const ok = Object.keys(s.cells).length === 27 && g.orderedSizeNames(s).length === 27 && s.cell.name === "product-md-md" && g.mdAnchor(s).name === "product-md-md" && g.sizeAnchor(s, "LG").name === "product-lg-md" && md.height === 32 && md.inset === 8 && md.text === 14 && md.icon === 16 && md.chipHeight === 24 && md.radiusControl === 14; process.exit(ok ? 0 : 1); })'`
- (red) `node --input-type=module -e 'import("./src/engine/geometry.mjs").then((g) => { const r = (radius) => g.geomScale({ radius }).cells["product-md-md"]; const ok = r("default").radiusControl === 7 && r("sharp").radiusControl === 3.5 && r("pill").radiusControl === 16 && r("round").radiusMark === 7 && r("round").radiusInset === 10 && r("round").radiusCard === 18; process.exit(ok ? 0 : 1); })'`
- (red) `out=$(node --input-type=module -e 'import("./src/engine/geometry.mjs").then((g) => console.log(g.geomTokensCSS(g.geomScale({}))))') && for s in '--size-product-md-md-height: 32px' '[data-tier="micro"]' '[data-radius="pill"]' '--control-height:' '--chip-text:' '--radius-mark:' '--ctx-scale-md:'; do printf '%s\n' "$out" | grep -qF -- "$s" || exit 1; done`
- (red) `out=$(node --input-type=module -e 'import("./src/engine/geometry.mjs").then((g) => { const s = g.geomScale({}); console.log(g.geomTokensCSS(s) + JSON.stringify(g.geomTokensDTCG(s)) + JSON.stringify(g.geomTokensFigmaModes(s, []))); })') && test -n "$out" && ! printf '%s\n' "$out" | grep -qE 'caret|icon-gap|padding-wide|\.control-'`
- (red) `node --input-type=module -e 'import("./src/engine/geometry.mjs").then((g) => { const m = g.geomTokensFigmaModes(g.geomScale({}), [{ name: "Mobile", scale: g.geomScale({ scale: "sm" }) }]); const v = Object.values(m.collections)[0].variables; const keys = Object.keys(v); const c = v["control/product/md/height"]; const ok = keys.filter((k) => k.startsWith("size/")).length === 378 && keys.filter((k) => k.startsWith("control/")).length === 126 && c.type === "ALIAS" && c.values.Base === "size/product-md-md/height" && c.values.Mobile === "size/product-sm-md/height"; process.exit(ok ? 0 : 1); })'`
- (red) `node --input-type=module -e 'import("./src/engine/geometry.mjs").then((g) => { const d = g.geomTokensDTCG(g.geomScale({})); process.exit(Object.keys(d.size).length === 27 && d.size["content-lg-lg"].height.$value === "72px" ? 0 : 1); })'`
- (red) `grep -qE '^export function geomResolverCSS' src/engine/geometry.mjs`
- (red) `! grep -qE 'RAMP_LADDER|rampContrast|baseHeight|CONTROL_FONT|GAP_UNIT|GEOMETRY_TREATMENTS' src/engine/geometry.mjs`
- `node test/engine/geometry.mjs`
- `node test/engine/exports.mjs`

## Step 3: Document shape and saved-kit migration
level: L4
### Read first
- `docs/AGENTS.md`
### Do
Depends on: step 2 (`TIERS`, `SCALES`, `SIZES`, `RADIUS_MODES`, `DEFAULT_GEOMETRY`, `geomScale`). Design source: `.sdlc/geometry-maison-ladder/architect-L1.md` (Approach para 4 migration, Interfaces `model.mjs`/`persist.js`), handoff Decision 2 and the T-0014 ordering note.
- `src/ui/model.mjs`:
  - `geomScaleFor(doc, modeKey)` = `geomScale(mode ? { ...g, scale: mode.scale } : g, { typeScale: typeScaleFor(doc, "base") })`. Cells compose from the base type scale at every mode because the Figma cells are mode-constant (architect decision 5, accepted).
  - `geometryScale(doc, opts)` keeps its signature and returns `geomScaleFor(doc, "base")`. `geomOverridesFor` and every height-override path retire.
  - `geomModeScales(doc)`: configured modes map to `{ name, minWidth, scale: geomScaleFor(doc, m.id) }`. With none configured, the synthesized set is Desktop Lg (1728, scale lg), Desktop Xl (2560, lg), Tablet (992, sm), Mobile (476, sm) (architect Interfaces).
  - `geomEffectiveModes` follows the `modes[].scale` shape.
- `src/ui/persist.js`:
  - `clampGeometry` returns `{ tier, scale, radius, spaceBase, modes?, baseName? }`. spaceBase is a positive integer 1..16, default 4. modes is `[{ id, name, scale, minWidth? }]`.
  - Allowlists: `GEOMETRY_TIERS = ["content","product","micro"]`, `GEOMETRY_SCALES = ["sm","md","lg"]`, `GEOMETRY_SIZES = ["sm","md","lg"]`, `GEOMETRY_RADIUS = ["default","round","sharp","pill"]`. Each is parity-gated in `test/ui/persist.mjs` against the engine's `Object.keys(TIERS)`, `SCALES`, `Object.keys(SIZES)` and `Object.keys(RADIUS_MODES)`.
  - The old `GEOMETRY_TREATMENTS` and `GEOMETRY_RAMPS` exports retire.
- Schema: bump `CURRENT_SCHEMA_VERSION` by exactly one from the build-start value.
  - That is 9 if T-0014 (issue #804) has landed its v8 first, as the handoff assumes, and 8 otherwise. Whichever of the two tickets lands second takes the next number.
  - Add one `RENAMES` entry whose `version` equals the new value, and document it in the version comment block above `:384`.
- Migration, for a doc stamped below the new version that carries `geometry.treatment` or `geometry.baseHeight`:
  - The legacy MD height h is `baseHeight`, or else the treatment's own: comfortable 28, compact 24, spacious 32, touch 36, pill 28. The migration-only copy of the retired treatment table lives in persist.js.
  - (tier, scale) is the nearest md-cell height: product sm/md/lg 28/32/36, content 36/48/64, micro 14/16/18. Ties break by tier (product > content > micro), then by scale (md > sm > lg).
  - `radius` comes from the treatment's radiusStyle: sharp to sharp, soft to default, round to round, pill to pill.
  - `spaceBase` comes from the treatment: comfortable 4, compact 4, spacious 8, touch 8, pill 4.
  - `modes[].baseHeight` becomes `modes[].scale` by nearest md-cell height within the migrated tier.
  - `rampContrast`, `ramp`, `geometry.tokenOverrides`, and `type.tokenOverrides` keys on UI-control/UI-widget steps other than MD go through `DROPPED_KEYS` with a reason.
- `docs/reference/colors/categories/brands.json`: remove the Adia preset's `"ramp": "linear4"` (`:350`), then run `npm run gen:categories` so the generated `src/ui/categories/brands.js` follows.
- Contract dependents in this step:
  - `test/ui/persist.mjs`: allowlist parity, a v7 fixture with the old keys, and a current-version doc that round-trips byte-identical.
  - `test/ui/model.mjs`: the geometry join, the synthesized modes, and the UI nudge rows gone.
- Left for later steps: the section, drawer, apply-gate and app.js still read the old doc and scale shapes until step 6.
- The untagged test runs in the criteria are not guards. Earlier steps leave them red at this step's start by design, so `steps.py split --only` must not run them first; they must be green after this step.
### Acceptance criteria
- (red) `test "$(grep -oE 'CURRENT_SCHEMA_VERSION = [0-9]+' src/ui/persist.js | grep -oE '[0-9]+$')" -eq "$(( $(git show "$SDLC_BASE_SHA":src/ui/persist.js | grep -oE 'CURRENT_SCHEMA_VERSION = [0-9]+' | grep -oE '[0-9]+$') + 1 ))"`
- (red) `node --input-type=module -e 'import("./src/ui/persist.js").then((U) => { const d = U.hydrate({ schemaVersion: 7, geometry: { treatment: "compact", baseHeight: 24, ramp: "linear4", rampContrast: 0.5, tokenOverrides: { "MD|base": 30 } } }); const g = d.geometry; const dropped = JSON.stringify(d[U.DROPPED_KEYS]); const ok = g.tier === "product" && g.scale === "sm" && g.radius === "sharp" && g.spaceBase === 4 && !("ramp" in g) && !("rampContrast" in g) && !("tokenOverrides" in g) && dropped.includes("tokenOverrides"); process.exit(ok ? 0 : 1); })'`
- (red) `node --input-type=module -e 'import("./src/ui/persist.js").then((U) => { const a = U.hydrate({ schemaVersion: 7, geometry: { treatment: "comfortable" } }).geometry; const b = U.hydrate({ schemaVersion: 7, geometry: { treatment: "touch" } }).geometry; const ok = a.tier === "product" && a.scale === "sm" && a.radius === "default" && a.spaceBase === 4 && b.tier === "product" && b.scale === "lg" && b.spaceBase === 8; process.exit(ok ? 0 : 1); })'`
- (red) `node --input-type=module -e 'import("./src/ui/persist.js").then((U) => { const g = U.hydrate({ schemaVersion: 7, geometry: { treatment: "comfortable", baseHeight: 28, modes: [{ id: "m1", name: "Mobile", minWidth: 476, baseHeight: 24 }] } }).geometry; const m = g.modes[0]; process.exit(m.scale === "sm" && !("baseHeight" in m) ? 0 : 1); })'`
- (red) `node --input-type=module -e 'Promise.all([import("./src/ui/persist.js"), import("./src/engine/geometry.mjs")]).then(([U, G]) => { const ok = U.GEOMETRY_TIERS.join() === Object.keys(G.TIERS).join() && U.GEOMETRY_RADIUS.join() === Object.keys(G.RADIUS_MODES).join() && U.GEOMETRY_SCALES.join() === "sm,md,lg"; process.exit(ok ? 0 : 1); })'`
- (red) `node --input-type=module -e 'import("./src/ui/model.mjs").then((M) => { const doc = { palettes: [], geometry: { tier: "product", scale: "md", radius: "round", spaceBase: 4 } }; const modes = M.geomModeScales(doc).map((m) => m.name + ":" + m.scale.scale).join(); const ok = M.geomScaleFor(doc, "base").cell.name === "product-md-md" && modes === "Desktop Lg:lg,Desktop Xl:lg,Tablet:sm,Mobile:sm"; process.exit(ok ? 0 : 1); })'`
- (red) `! grep -qE 'baseHeight|rampContrast|RAMP_LADDER|GEOMETRY_TREATMENTS|geomOverridesFor' src/ui/model.mjs`
- (red) `! grep -qF '"ramp": "linear4"' docs/reference/colors/categories/brands.json`
- `node test/ui/persist.mjs`
- `node test/ui/model.mjs`

## Step 4: Downstream exports read cells
level: L3
### Read first
- `docs/AGENTS.md`
### Do
Depends on: steps 2 and 3.
- `src/engine/ds-export.js`:
  - `dsGeometryLayer` publishes `cells` (27, keyed by cell name) instead of `sizes`.
  - `dsIconLayer` maps every cell name to its `icon`.
  - The Buttons card's size row renders the kit's three cells `{tier}-{scale}-{sm,md,lg}`, the sizes a kit author uses at their axes.
  - Every `RAMP_LADDER`/ladder branch (`:445-454`) retires, and with it the `density` and `radiusDefault` fields (`:258`) and the `--radius-default` line (`:1598`).
  - The control text reads `mdAnchor(geomSc).size.text`.
  - The icon-size guidance at `:858-868` lists the kit's three cells.
- `mcp/png-swatch-board.mjs` (`:193-198`): the mock controls size from `sizeAnchor(kit.geometry, "LG")` (product-lg-md), and the thumbs from its `icon` and `radiusMark`. The inline ladder re-implementation retires.
- `mcp/brand-kit-core.mjs`: the `get_geometry` description (`:129`) and the instructions line (`:87`) name the tier x scale x size ladder, the 27 cells and the resolver roles instead of the XS to 2XL ramp. Run `npm run gen:mcp-assets` so the generated MCP assets follow. `src/ui/describe-mcp-assets.js` embeds the model code and matches step 6's retired-symbol grep until it is regenerated.
- `scripts/smoke-panda.mjs` and `scripts/gen-adia-derived-exports.mjs` follow the new emitters and shape; the Adia comment at `:16` no longer cites `ramp`. Run `npm run gen:adia-exports`.
  - `docs/reference/data/adia-*` must stay byte-identical because radii/space/borders are unchanged.
  - If a byte moves, follow that file's own bump policy and record the reason in the commit-ready summary.
- Contract dependents in this step: `test/engine/ds-gates.mjs`, `test/mcp/brand-kit.mjs`, `test/mcp/png-swatch-board.mjs`, `test/mcp/describe-kit-core.mjs`, `test/mcp/brand-kit-merged-core.mjs`, `test/engine/adia-derived-exports.mjs`.
- The panda smoke (`scripts/smoke-panda.mjs`) runs only in CI (`panda-smoke` job); this host does not prove it.
- The untagged test runs in the criteria are not guards. Earlier steps leave them red at this step's start by design, so `steps.py split --only` must not run them first; they must be green after this step.
### Acceptance criteria
- (red) `! grep -qE 'RAMP_LADDER|LADDER|\.sizes\b' src/engine/ds-export.js`
- (red) `! grep -qE 'geometry\.sizes|lgKey' mcp/png-swatch-board.mjs`
- (red) `grep -qE 'name: "get_geometry".*tier' mcp/brand-kit-core.mjs`
- `node test/engine/ds-gates.mjs`
- `node test/mcp/brand-kit.mjs`
- `node test/mcp/png-swatch-board.mjs`
- `node test/mcp/describe-kit-core.mjs`
- `node test/mcp/brand-kit-merged-core.mjs`
- `node test/engine/adia-derived-exports.mjs`

## Step 5: Figma binder and plugin follow the cells
level: L4
### Do
Depends on: step 2 (variable paths and the ALIAS shape). Skill: `maintaining-figma-plugins`.
- `figma/binder/migrations.mjs`:
  - Add `export const GEOMETRY_CELL_MAP = { XS: "product-sm-sm", SM: "product-md-sm", MD: "product-sm-md", LG: "product-lg-md", XL: "content-md-md", "2XL": "content-lg-md" }`. These are the pixel-preserving legacy heights from the architect Carry forward.
  - Extend `GEOMETRY_FIELD_RENAME_MAP` (`:117`) so old spellings land on the new fields: `padding-narrow` and `padding` to `inset`, `font` to `text`, `pill-radius` and `radius` to `radius-control`, `minWidth` to `min-width`.
  - `caret`, `icon-gap`, `gap`, `padding-wide`, `edgePadding` and the two compact pads have no target. They deprecate id-preserving, as `font` did in #498; a comment says so.
- `figma/binder/mode-apply-plan.mjs`:
  - `nearestStepByHeight` (used by `geometrySizeAliasMap`, `:226`) breaks height ties deterministically: by tier (product > content > micro), then size (md > sm > lg), then scale (md > sm > lg). Computed over the three cells at each of 28 and 36, this order is what maps the legacy LG height 36 to product-lg-md and MD 28 to product-sm-md.
  - Old `size/{0..9}` and `size/{xs..2xl}` variables alias to cells through it.
  - `applyFloatPlans` accepts the step 2 per-mode `{ type: "ALIAS", values: { [mode]: path } }` shape beside the existing single-`target` ALIAS (`:458-466`).
- `figma/plugin/code.js`: hand-mirror `GEOMETRY_CELL_MAP`, the field map, the tiebreak and the per-mode ALIAS write (`:677`, `:1068`), kept in lockstep with the binder (gated by `renameparity` in `test/figma/binder.mjs`). Then run `npm run gen:figma-assets`, which regenerates `figma/binder/figma-semantic-binder/code.js` and `src/ui/figma-plugin-assets.js`; never hand-edit those two.
- Contract dependents in this step: `test/figma/migrations.mjs` (new group `legacy-cell-map` asserting the six legacy steps and the tiebreak), `test/figma/mode-apply.mjs`, `test/figma/binder.mjs`, `test/figma/plugin.mjs`, `test/figma/live-diff.mjs`, `test/figma/style-plan.mjs`.
- No live Figma file is touched. The `figma-file-migration` skill covers that by hand later.
- The untagged test runs in the criteria are not guards. Earlier steps leave them red at this step's start by design, so `steps.py split --only` must not run them first; they must be green after this step.
### Acceptance criteria
- (red) `node --input-type=module -e 'import("./figma/binder/migrations.mjs").then((M) => { const c = M.GEOMETRY_CELL_MAP; const ok = c.XS === "product-sm-sm" && c.SM === "product-md-sm" && c.MD === "product-sm-md" && c.LG === "product-lg-md" && c.XL === "content-md-md" && c["2XL"] === "content-lg-md"; process.exit(ok ? 0 : 1); })'`
- (red) `node --input-type=module -e 'import("./figma/binder/migrations.mjs").then((M) => { const f = M.GEOMETRY_FIELD_RENAME_MAP; const ok = f["padding-narrow"] === "inset" && f.padding === "inset" && f.font === "text" && f["pill-radius"] === "radius-control" && f.radius === "radius-control"; process.exit(ok ? 0 : 1); })'`
- (red) `node --input-type=module -e 'import("./figma/binder/mode-apply-plan.mjs").then((P) => { const cur = { "content-sm-sm": 28, "product-lg-sm": 28, "product-sm-md": 28, "content-sm-md": 36, "product-sm-lg": 36, "product-lg-md": 36, "micro-lg-lg": 20, "product-sm-sm": 20 }; const m = P.geometrySizeAliasMap({ XS: 20, MD: 28, LG: 36 }, cur, ["height"]); const ok = m["size/XS/height"] === "size/product-sm-sm/height" && m["size/MD/height"] === "size/product-sm-md/height" && m["size/LG/height"] === "size/product-lg-md/height"; process.exit(ok ? 0 : 1); })'`
- (red) `for s in GEOMETRY_CELL_MAP '"radius-control"' '"product-lg-md"'; do grep -qF -- "$s" figma/plugin/code.js || exit 1; done`
- (red) `grep -qF 'legacy-cell-map' test/figma/migrations.mjs`
- `node test/figma/migrations.mjs`
- `node test/figma/mode-apply.mjs`
- `node test/figma/binder.mjs`
- `node test/figma/plugin.mjs`
- `node test/figma/live-diff.mjs`
- `node test/figma/style-plan.mjs`

## Step 6: Editor Geometry section on tier, scale and radius
level: L4
### Do
Depends on: steps 2 to 5. The headless boot also drives the ds-export bundle and the Figma apply plans, so it can only go green once steps 4 and 5 have landed. Pattern: the `building-editor-sections` skill (canvas header + `.canvas-scene` + left analysis cards + right inspector, lettered headless groups).
- `src/ui/sections/geometry.js`:
  - The inspector edits `doc.geometry.tier` (content, product, micro), `scale` (sm, md, lg), `radius` (default, round, sharp, pill) and `spaceBase` (4, 8) through `app.commit`.
  - The treatment picker, base-height slider, ramp-contrast knob, linear-ladder toggle and per-cell height override editor retire.
  - The canvas renders all 27 cells as live controls in light and dark, using each cell's height, inset, text, icon and radiusControl. It has one row per tier x scale and one column per size. Each control element carries `data-cell="{tier}-{scale}-{size}"`, and the kit default cell (`scale.cell.name`) is marked.
  - The tokens table lists the 27 cells' fields from `orderedSizeNames`.
  - The mode editor writes `modes[].scale`, with one sm/md/lg segmented control per mode.
  - Copy that cites the UI-control voice says per-cell text composes from Typography's height-indexed UI text table.
- `src/ui/overlays/drawer.js`, `src/ui/overlays/apply-gate.js`, `src/ui/app.js`: call sites move to the step 2 emitters and the step 3 model functions. No reader of `baseHeight`, `rampContrast`, `RAMP_LADDER` or `geomOverridesFor` remains in them. The drawer's Geometry CSS tab previews `geomTokensCSS`; assertion `(mc9)` in `test/ui/headless-boot.mjs` looks for `.control-`, so repoint it at `--control-height`.
- `test/ui/headless-boot.mjs`: add groups `(gml1)` (27 `data-cell` controls render on the Geometry canvas), `(gml2)` (the inspector writes `doc.geometry.tier`, `scale` and `radius`) and `(gml3)` (a mode edit writes `modes[].scale`). Fix every older geometry assertion the new shape breaks.
- This file is red at this step's start because steps 2 to 5 changed the scale, doc and plan shapes; this step restores it. Smoke screenshots of the canvas run only in CI (`.github/workflows/ci.yml:41`); this host does not prove them.
- The untagged test runs in the criteria are not guards. Earlier steps leave them red at this step's start by design, so `steps.py split --only` must not run them first; they must be green after this step.
### Acceptance criteria
- (red) `grep -qF 'data-cell' src/ui/sections/geometry.js`
- (red) `! grep -qE 'baseHeight|rampContrast|RAMP_LADDER|GEOMETRY_TREATMENTS|tokenOverrides' src/ui/sections/geometry.js`
- (red) `! grep -qE 'baseHeight|rampContrast|RAMP_LADDER|geomOverridesFor' src/ui/overlays/drawer.js src/ui/overlays/apply-gate.js src/ui/app.js`
- (red) `test "$(grep -cE '\(gml[1-3]\)' test/ui/headless-boot.mjs)" -ge 3`
- (red) `! git grep -qE 'RAMP_LADDER|rampContrast|GEOMETRY_TREATMENTS|LADDER_SIZE_KEYS|geomOverridesFor' -- src scripts mcp ':!src/ui/persist.js'`
- `node test/ui/headless-boot.mjs`
- (guard) `node test/ui/zip.mjs`

## Step 7: Shell receives the geometry roles
level: L3
### Do
Depends on: steps 2 to 6 (`geomResolverCSS`, `geomScaleFor`, the doc shape, a green headless boot). Handoff Decision 4: the shell rides with the engine; its selector groups are steps 8 to 11.
- `src/ui/app.js`:
  - On connect, and whenever the doc or the override changes, set the host attributes `data-tier`, `data-scale` and `data-radius` from the effective shell geometry, plus `data-size="md"`.
  - The effective shell geometry is the app pref `this.shellGeometry` (null means follow the kit), else `doc.geometry` (defaults product, md, round).
  - Keep one `<style id="ut-geometry-roles">` in `document.head`, created once with its `textContent` refreshed, holding `geomResolverCSS(geomScaleFor(doc, "base"), { prefix: "ut" })`.
  - Persist `shellGeometry` with the other app prefs (`_saveAppPrefs`, the same store as `theme`).
- `src/ui/overlays/settings.js`: in the Appearance panel, add a "Shell geometry" row offering Follow kit (the default) or an explicit tier, scale and radius. It writes `this.shellGeometry`, then calls `_saveAppPrefs()` and `render()`.
- `src/ui/styles.css`: add one alias block on the `ultimate-tokens` selector, because the host carries the attributes and the `:root` block at `:18` does not.
  - Its fallbacks are the product-md-md round cell: `--sh-control-height: var(--control-height, 32px); --sh-control-inset: var(--control-inset, 8px); --sh-control-text: var(--control-text, 14px); --sh-control-icon: var(--control-icon, 16px); --sh-control-radius: var(--radius-control, 14px); --sh-radius-inset: var(--radius-inset, 10px); --sh-chip-height: var(--chip-height, 24px); --sh-chip-inset: var(--chip-inset, 5.5px); --sh-chip-text: var(--chip-text, 12px);`.
  - No selector reads them yet. `--hh`, `--ch`, `--fh` (chrome layout heights) and `--r-sm/--r/--r-lg` stay literal.
- `test/ui/headless-boot.mjs`: add groups `(shg1)` (a fresh doc's host carries product, md, md, round), `(shg2)` (a `doc.geometry` commit updates them), `(shg3)` (a Settings override wins over the doc) and `(shg4)` (`#ut-geometry-roles` exists and its text contains `--control-height`).
- This host does not prove pixels: `npm run smoke` runs only in CI (`build-test`, `.github/workflows/ci.yml:41`).
### Acceptance criteria
- (red) `grep -qF 'data-tier' src/ui/app.js`
- (red) `grep -qF 'ut-geometry-roles' src/ui/app.js`
- (red) `grep -qF 'shellGeometry' src/ui/overlays/settings.js`
- (red) `for v in control-height control-inset control-text control-icon control-radius radius-inset chip-height chip-inset chip-text; do grep -qE "^ *--sh-$v: var\(--" src/ui/styles.css || exit 1; done`
- (red) `test "$(grep -cE '\(shg[1-4]\)' test/ui/headless-boot.mjs)" -ge 4`
- (guard) `node test/ui/headless-boot.mjs`
- (guard) `node test/ui/shell.mjs`

## Step 8: Shell buttons and inputs size from the roles
level: L2
### Do
Depends on: step 7. Only the two base rules change.
- `src/ui/styles.css` `button {` (`:156`): replace `padding: 4px 9px`, `gap: 6px` and `border-radius: var(--r-sm)` with `min-block-size: var(--sh-control-height); padding-block: 0; padding-inline: var(--sh-control-inset); font-size: var(--sh-control-text); gap: calc(var(--sh-control-inset) / 2); border-radius: var(--sh-control-radius);`. This follows the Maison usage in the handoff; gap = inset / 2 is the glyph rule from the architect Glyphs section. Keep `font: inherit` before the new `font-size`.
- `input[type="text"], input[type="search"], select {` (`:190`): the same, minus `gap`.
- Every other selector is untouched. This host does not prove pixels (smoke is CI only).
### Acceptance criteria
- (red) `blk=$(awk '/^button \{/{f=1} f{print} f&&/\}/{exit}' src/ui/styles.css) && test -n "$blk" && for s in 'var(--sh-control-height)' 'var(--sh-control-inset)' 'var(--sh-control-text)' 'var(--sh-control-radius)'; do printf '%s\n' "$blk" | grep -qF -- "$s" || exit 1; done`
- (red) `blk=$(awk '/^button \{/{f=1} f{print} f&&/\}/{exit}' src/ui/styles.css) && test -n "$blk" && ! printf '%s\n' "$blk" | grep -qE 'padding: *[0-9.]+px'`
- (red) `blk=$(awk '/^input\[type="text"\], input\[type="search"\], select \{/{f=1} f{print} f&&/\}/{exit}' src/ui/styles.css) && test -n "$blk" && printf '%s\n' "$blk" | grep -qF 'var(--sh-control-height)' && ! printf '%s\n' "$blk" | grep -qE 'padding: *[0-9.]+px'`
- (guard) `node test/ui/headless-boot.mjs`

## Step 9: Shell segmented controls size from the roles
level: L2
### Do
Depends on: step 7.
- `src/ui/styles.css` `.segmented button {` (`:871`): `min-block-size: calc(var(--sh-control-height) - 6px); padding-block: 0; padding-inline: var(--sh-control-inset); font-size: var(--sh-control-text); border-radius: var(--sh-radius-inset);`. The group's 2px padding and 1px border on each side make the whole group one control height.
- `.segmented.seg-sm button` (`:885`) takes the chip row: `min-block-size: var(--sh-chip-height); padding-block: 0; padding-inline: var(--sh-chip-inset); font-size: var(--sh-chip-text);`.
- `.canvas-seg button` (`:886`) and `.app-header .section-seg button` (`:1356`) take `padding-block: 0; padding-inline: calc(var(--sh-control-inset) * 2);`, which keeps their wider stance.
- This host does not prove pixels (smoke is CI only).
### Acceptance criteria
- (red) `blk=$(awk '/^\.segmented button \{/{f=1} f{print} f&&/\}/{exit}' src/ui/styles.css) && test -n "$blk" && printf '%s\n' "$blk" | grep -qF 'var(--sh-control-height)' && ! printf '%s\n' "$blk" | grep -qE 'padding: *[0-9.]+px'`
- (red) `blk=$(awk '/^\.segmented\.seg-sm button \{/{f=1} f{print} f&&/\}/{exit}' src/ui/styles.css) && test -n "$blk" && printf '%s\n' "$blk" | grep -qF 'var(--sh-chip-height)' && ! printf '%s\n' "$blk" | grep -qE 'font-size: *[0-9.]+px'`
- (red) `for sel in '^[.]canvas-seg button [{]' '^[.]app-header [.]section-seg button [{]'; do blk=$(awk -v re="$sel" '$0 ~ re {f=1} f{print} f&&/[}]/{exit}' src/ui/styles.css); test -n "$blk" || exit 1; printf '%s\n' "$blk" | grep -qF 'var(--sh-control-inset)' || exit 1; done`
- (guard) `node test/ui/headless-boot.mjs`

## Step 10: Shell chips and switch size from the roles
level: L2
### Do
Depends on: step 7.
- `src/ui/styles.css` `.chip {` (`:791`): `min-block-size: var(--sh-chip-height); padding-block: 0; padding-inline: var(--sh-chip-inset); font-size: var(--sh-chip-text); gap: calc(var(--sh-chip-inset) / 2);`. `border-radius: 999px` stays, because the shell chip is a pill by design.
- Switch (Maison `choice.mjs:21-22`, via the architect Carry forward):
  - Remove `--ctl-thumb: 15px` from the `:root` block (`:51`). Declare `--ctl-thumb: calc(var(--sh-control-icon) - 4px);` in the `ultimate-tokens` alias block instead: a 2px edge on each side, and `--sh-control-icon` resolves only on the host.
  - `.toggle .track` (`:957`) becomes `inline-size: calc(1.75 * var(--sh-control-icon)); block-size: var(--sh-control-icon);` with its px width/height removed.
  - `.toggle.on .track::after` (`:967`) translates by `calc(0.75 * var(--sh-control-icon))`.
  - The range thumbs (`:939`, `:944`) keep reading `--ctl-thumb`.
- This host does not prove pixels (smoke is CI only).
### Acceptance criteria
- (red) `blk=$(awk '/^\.chip \{/{f=1} f{print} f&&/\}/{exit}' src/ui/styles.css) && test -n "$blk" && printf '%s\n' "$blk" | grep -qF 'var(--sh-chip-height)' && ! printf '%s\n' "$blk" | grep -qE 'padding: *[0-9.]+px|font-size: *[0-9.]+px'`
- (red) `! grep -qE -- '--ctl-thumb: *[0-9]' src/ui/styles.css`
- (red) `blk=$(awk '/^\.toggle \.track \{/{f=1} f{print} f&&/\}/{exit}' src/ui/styles.css) && test -n "$blk" && printf '%s\n' "$blk" | grep -qF 'var(--sh-control-icon)'`
- (red) `! grep -qF 'translateX(15px)' src/ui/styles.css`
- (guard) `node test/ui/headless-boot.mjs`

## Step 11: Shell icons size from the control icon role
level: L2
### Do
Depends on: step 7.
- `src/ui/icons.js` `icon(name, { size = 16 })` (`:45-55`): keep the `width`/`height` attributes at the literal, as the no-CSS fallback and because the shim reads attributes. Add an inline style on the `<svg>`: `width:var(--sh-control-icon, ${size}px);height:var(--sh-control-icon, ${size}px)`. Every shell icon then sizes from the control icon role (handoff Decision 4, manifest a36), with the per-call literal as fallback.
- This host does not prove pixels (smoke is CI only).
### Acceptance criteria
- (red) `grep -qF 'var(--sh-control-icon, ${size}px)' src/ui/icons.js`
- (guard) `grep -qF 'width="${size}" height="${size}"' src/ui/icons.js`
- (guard) `node test/ui/headless-boot.mjs`

## Step 12: Consumer parity and real-browser resolver cases
level: L3
### Do
Depends on: steps 2 and 7.
- `plugin/ultimate-tokens/skills/geometry-tokens/` (SKILL.md and references, `references/detail.md` included) teaches, per the architect Glyphs section:
  - The axes: `data-tier`, `data-scale`, `data-size` and `data-radius`, where the nearest ancestor wins.
  - The cell primitives `--size-{tier}-{scale}-{size}-{field}`.
  - The roles `--control-height/-inset/-text/-icon/-caption-text/-icon-ratio`, `--chip-height/-inset/-text` and `--radius-control/-mark/-inset/-card`.
  - The glyph rules: an indicator is text-sized inside the icon box; the icon-to-label gap is inset / 2; badge height is height - inset, with `--radius-inset`; an icon-only control is a height square.
  - That the `--size-{step}-caret/-gap/-padding-*` tokens and `.control-{step}` classes are gone, with a migration note.
- `scripts/dimension-parity.mjs` re-targets the 27 cells and the roles against the engine. `test/plugin/geometry-tokens.mjs` stays its runner.
- `test/smoke/smoke.mjs`:
  - Add a resolver block that loads `geomTokensCSS(geomScale({}))` into a page and renders the 108 nested cases: 27 cells x 4 radius modes, in Maison's spec shape (`tests/first-wave-foundation.spec.js:60`). It asserts that `getComputedStyle` of `--control-height` and `--radius-control` equals the engine's cell values.
  - Re-baseline the 18 shell layout probes (`:104-157`) to the new control heights.
  - This runs only in CI (`build-test`). Locally only syntax is checked; this step does not prove the runtime behavior.
- The untagged test runs in the criteria are not guards. Earlier steps leave them red at this step's start by design, so `steps.py split --only` must not run them first; they must be green after this step.
### Acceptance criteria
- (red) `grep -qF 'data-radius' test/smoke/smoke.mjs`
- (red) `grep -qF -- '--radius-control' test/smoke/smoke.mjs`
- (guard) `node --check test/smoke/smoke.mjs`
- (red) `grep -qF -- '--control-height' plugin/ultimate-tokens/skills/geometry-tokens/SKILL.md`
- (red) `! grep -rqE -- '--size-[a-z0-9-]+-(caret|gap|padding-wide)' plugin/ultimate-tokens/skills/geometry-tokens`
- `node test/plugin/geometry-tokens.mjs`

## Step 13: Records: ADR, skills and docs
level: L3
### Read first
- `docs/references/AGENTS.md`
- `docs/references/typography/AGENTS.md`
### Do
Depends on: steps 1 to 12 (the records cite the final names).
- `docs/references/decision-records.md`: add a new ADR titled "Geometry adopts the Maison ui-kit ladder" (the next free number; the check greps the title), placed before the Quick map (`:920`). It records the decision, the user decisions of 2026-10-07 and the Maison-to-ours name map:
  - `--g-height/-inset/-text/-icon/-caption-text/-icon-height-ratio` to `--control-height/-inset/-text/-icon/-caption-text/-icon-ratio`
  - `--g-chip-height/-inset/-text` to `--chip-*`
  - `--r-control/-mark/-inset/-card` to `--radius-*`
  - `--m-cell-*`, `--m-scale-*`, `--m-size-*`, `--r-k-text/-height` to `--ctx-cell-*`, `--ctx-scale-*`, `--ctx-size-*`, `--ctx-radius-text/-height`
  - `--g-micro-*` scoped out; attribute names and radius ids kept verbatim.
- Repair these to the new system in the same change:
  - `.claude/skills/geometry-system/` (SKILL.md and references).
  - `.claude/skills/type-scale/`: the UI text table and the one-step UI voices.
  - `.claude/skills/building-editor-sections/`: the shell axes and the `--sh-*` aliases.
  - `.claude/skills/maintaining-brand-kit-mcp/`: the `get_geometry` shape.
  - `.claude/skills/maintaining-figma-plugins/`: the cell variables, `control/` aliases and the legacy cell map.
  - `docs/references/geometry/README.md`, `docs/references/typography/README.md` and `intended-use.md` (UI voices), and `mcp/README.md`.
- No mention of `baseHeight`, `rampContrast`, `linear4`, `CONTROL_FONT` or `GAP_UNIT` survives, except as history inside the ADR.
- The untagged test runs in the criteria are not guards. Earlier steps leave them red at this step's start by design, so `steps.py split --only` must not run them first; they must be green after this step.
### Acceptance criteria
- (red) `grep -qF 'Geometry adopts the Maison ui-kit ladder' docs/references/decision-records.md`
- (red) `awk '/Geometry adopts the Maison ui-kit ladder/{if(!a)a=NR} /^## Quick map/{q=NR} END{exit !(a && q && a < q)}' docs/references/decision-records.md`
- (red) `grep -qF -- '--g-chip-height' docs/references/decision-records.md`
- (red) `! grep -rqE 'baseHeight|rampContrast|linear4|CONTROL_FONT|GAP_UNIT' .claude/skills/geometry-system docs/references/geometry/README.md mcp/README.md`
- (red) `grep -rqF 'uiText' .claude/skills/type-scale`
- (red) `grep -rqF 'data-tier' .claude/skills/building-editor-sections`
- `node test/repo/citations.mjs`

## Step 14: Gates green
level: L3
guard timeout: 900
### Do
Depends on: steps 1 to 13.
- In the lane worktree, run `npm ci` first if `node_modules` is missing (it is untracked).
- Run each gate through `gate_lock.py run --name <gate> -- <cmd>` (SDLC_GATE_WORKERS=10, per the handoff): `npm test` (regenerates the committed assets, then runs `test/run.mjs`) and `npm run build`.
- Fix every red that steps 1 to 13 introduced, including regenerated assets: `figma/plugin/ui.html`, `src/ui/*-assets.js`, `src/ui/categories/*.js`, `docs/reference/data/adia-*`.
- `npm run gate:sweeps` is not run: every sweep in it gates the color engine, which this plan does not touch.
- `npm run smoke` and `panda-smoke` run only in CI; say so in the summary.
- No push, PR or issue.
### Acceptance criteria
- (guard) `npm test`
- (guard) `npm run build`
- (red) `! git grep -qE 'RAMP_LADDER|rampContrast|GEOMETRY_TREATMENTS|LADDER_SIZE_KEYS|CONTROL_FONT|GAP_UNIT' -- src scripts mcp figma plugin ':!src/ui/persist.js'`
- (guard) `node test/repo/em-dash.mjs`

## Assumptions
- resolved by the user on 2026-10-07 (option B, one MD step each, see handoff `## Plan review`): U1, what the UI-control and UI-widget voices emit once their six fixed rows retire. Decision 1 says only "lose their six fixed size rows"; the user decides which contract replaces them. Choosing A replans step 1 only.
  - (B, recommended, and what step 1 builds) Each voice keeps one derived `MD` step: UI-control `uiText(32)` = 14, UI-widget the 32-cell compact-row text = 12. Sibling weights, voice fonts, the typography section, `ds-export.js:444` and one Figma text-style family per voice survive. The five other steps' variables and text styles deprecate id-preserving.
  - (A, the architect's literal "typeTokensFigmaModes stops emitting control fonts") The two voices carry character only, with no size row in any type emitter. Their Figma text styles retire, and sibling weights (`type.mjs:347`), `typography.js:640` and `ds-export.js:444` are refactored to read the voice character.
- Cells compose text from the base type scale at every mode, and a mode changes only the scale axis: verified by the accepted architect decision 5 in the handoff (27 mode-constant Figma cells), which per-mode text would contradict.
- `uiText` scales by the kit's bodyBase factor on a half-pixel grid and ignores the breakpoint modeFactor: verified by `src/ui/model.mjs:122-123` (UI voices frozen at Desktop on Tablet and Mobile) and by the CSV being on the half grid (`14,3,7.5,8`).
- Height ties resolve by tier, then size, then scale: verified by computing the three cells at 28 (product-sm-md, product-lg-sm, content-sm-sm) and at 36 (product-sm-lg, product-lg-md, content-sm-md) against `definition.mjs`. Only size-before-scale reproduces the architect's legacy map (MD product-sm-md, LG product-lg-md).
- `sizeAnchor(scale, "MD")` is the kit default cell (product-md-md at defaults), while the Figma legacy map sends MD to product-sm-md. Verified by the architect Approach para 2 ("MD to product-md-md") against Carry forward's pixel-preserving legacy map. The two maps serve different readers: previews and live-file bindings.
- Maison values: the CSV and `definition.mjs` read at `/Users/kimgranlund/Projects/maison/ui-kit-maison` commit `ca56f2d9`, `geometry.ts` sha256 `8d0766...8136`. Compact row and radius formulas from `scripts/generate.mjs:36,47-52,58,70-73`. Verified by reading them.
- Schema numbering: HEAD has `CURRENT_SCHEMA_VERSION = 7` (`src/ui/persist.js:384`). The handoff says plan against v9 assuming T-0014 lands v8 first, so step 3 checks "base + 1". That is 9 under that ordering and stays correct if the order flips.
- The shell has no live geometry stylesheet today and only `data-theme` on the host (`src/ui/app.js:587`, `src/ui/styles.css:75-77`), so step 7 injects the resolver into `document.head`. The `--control-*` roles are the public role names and are visible to an embedding page.
- At the base commit on this host, `npm test` takes 168 s (all 54 files pass, tree clean after) and `npm run build` takes 3.4 s (with the main checkout's `node_modules`). Step 14's `guard timeout: 900` covers either with margin. Verified by timed runs in a detached base worktree.
- `npm run smoke` runs only in CI: verified at `.github/workflows/ci.yml:41` (`build-test` job). No step proves pixels or the resolver cascade locally.
- `gate:sweeps` only gates the color engine: verified by its member script names in `package.json:38` (corpus-tonal, corpus-anchor, sweep-prime, corpus-reset, corpus-contrast, mode-isolation, even-dips, chroma-envelope).

## Risks
- U1 is open. Option A would widen step 1 into type.mjs sibling weights, the typography section and ds-export.
- Long red stretch. `test/ui/headless-boot.mjs` is red from step 2 until step 6, the ds/mcp tests until step 4, the figma tests until step 5, and `test/plugin/geometry-tokens.mjs` until step 12. Each step's Do names what it leaves red, and `npm test` is only expected green at step 14. If the lane commits between steps, the guards still hold; if a builder reads an earlier step's red as `inherited red`, point it at the Do.
- `src/ui/styles.css`, `src/ui/app.js`, `src/ui/overlays/settings.js` and `src/ui/sections/geometry.js` are also touched by T-0013, T-0014 and T-0016. The shell checks are block-scoped greps, so a main sync keeps them meaningful, but merges will conflict.
- The shell grows. product-md-md is 32px against today's roughly 23px buttons, the round radius is 14px, and every icon becomes 16px; only CI smoke screenshots show it.
- The Figma collection grows to 27 x 14 constant variables plus 9 x 14 alias variables per mode. Apply time at that size is untested.
- Users lose saved `tokenOverrides` and the treatments' density and gap feel. Each loss is reported through DROPPED_KEYS, not preserved.
- The Maison repo is external and read only. If its CSV, `definition.mjs` or conventions change, the vendored fixture and the consumer skill go stale until someone re-vendors them.
- The planner's base worktree stays at `.worktrees/tmp/planner-L3-geometry-maison-ladder/base`, with a `node_modules` symlink. This role never deletes, so the conductor or `run.sh` removes it.
