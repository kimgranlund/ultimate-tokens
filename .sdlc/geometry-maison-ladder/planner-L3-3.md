<!-- role=planner level=L3 model=opus effort=xhigh -->
## Goal
Rebuild the Geometry system on the Maison ui-kit ladder (tier x scale x size, 27 validated cells, resolver roles `--control-*`, `--chip-*`, `--radius-*`, `--ctx-*`), with per-cell text composed from a height-indexed Type UI text table, and carry it through every export, the Figma binder and plugin, the MCP kit, saved-kit migration (persist schema v9, after T-0014's v8), the app shell, docs and skills, with `npm test` and `npm run build` green.
guard timeout: 900

## Step 1: Type owns the height-indexed UI text table
level: L4
### Do
Depends on: none. Builds on T-0014's landed tree (handoff `## Plan review`: build only after T-0014 lands); every line cite below was read in T-0014's branch `plan/prime-anchor-follows-chroma` plus its uncommitted step 3 diff. Design source: `.sdlc/geometry-maison-ladder/architect-L1.md` (Approach para 4, Interfaces `type.mjs` line) and handoff Decision 1.
- `src/engine/type.mjs`: add `export const UI_TEXT`, the Maison CSV height-to-text column verbatim, 25 entries keyed by height: 96:30, 92:29, 88:28, 84:27, 80:26, 76:25, 72:24, 68:23, 64:22, 60:21, 56:20, 52:19, 48:18, 44:17, 40:16, 36:15, 32:14, 28:13, 24:12, 22:11, 20:10, 18:9, 16:8, 14:7.5, 12:7. Source `/Users/kimgranlund/Projects/maison/ui-kit-maison/geometry/component-geometry.csv`, read only.
  - Add `export function uiText(height, factor = 1)`: returns `Math.round(UI_TEXT[height] * factor * 2) / 2` (half-pixel grid, the identity at factor 1) and throws a `RangeError` for a height not in the table.
  - `typeScale(config)` (`:284`) returns `uiText`, a plain object mapping all 25 heights to `uiText(h, factor)`, where `factor = bodyBase / Body base` (the existing factor). `modeFactor` never applies to `uiText`, matching today's freeze of the UI voices on Tablet and Mobile (`src/ui/model.mjs:123-124`).
- Retire the six fixed rows: `SIZES["UI-control"]` (`:46`), `SIZES["UI-widget"]`, `RANKS6` (`:50`) and the six-row branch of `ranksFor` (`:51`).
  - User ruling option B (handoff `## Plan review`, U1): each of the two voices keeps exactly one step, `MD`, with a derived `size`: `uiText(32, factor)` for UI-control (14, the text of product-md-md) and `uiText(24, factor)` for UI-widget (12, the text of 32's compact row). Every character field (weight, tracking, leading, case, box, `singleLineHeight`) is unchanged.
  - Sibling weights, voice fonts, `src/ui/sections/typography.js:640` (reads `.MD`) and `src/engine/ds-export.js:444` keep working because `MD` still exists.
- `src/ui/model.mjs` `modeTierNudge` (`:114-126`): drop the `fam6(["UI-control"], ...)` and `fam6(["UI-widget"], ...)` terms on all four mode lines (`:123-126`). The Label and Tiny nudges stay.
- `figma/binder/style-plan.mjs`: the two `SINGLE_LINE_VOICES` (`:68`) now serve one `md` step; the step loop at `:164` already filters absent steps. In a live file the retired `type/ui-control/{xs,sm,lg,xl,2xl}/*` and `type/ui-widget/...` variables and text styles deprecate id-preserving (no rename target), the same scope decision `figma/binder/migrations.mjs:109-113` records for `size/{step}/font`; add a comment there saying so.
- The specimen count moves from 51 to 41 steps (13 voices x 3 + 2 voices x 1). Repair every code and test copy here (plan-reviewer finding, step 1 scope):
  - `test/ui/counts.mjs:20`: `export const TYPE_STEPS = 41;` with its comment `(13 voices × 3 + 2 interactive voices × 1)`. `test/ui/headless-boot.mjs` and `test/smoke/smoke.mjs` read it.
  - `src/ui/sections/typography.js:525` and `:995` comments: `all 41 steps`.
  - `test/ui/headless-boot.mjs`: `:2418` and `:2655` comments `(41)`; the `(ty)` message at `:2421` says `× 1`; the `(tyc)` check at `:2422` adds `\b51 steps\b` as a standalone alternative beside `\b53 steps\b` in its retired-count regex, and its message reads `(live: 15 voices, 41 steps)`.
  - `test/smoke/smoke.mjs:196` comment: `41-step`.
  - The doc and skill copies (`docs/references/typography/README.md:52`, `.claude/skills/type-scale/references/best-practices.md:77`) are repaired in step 13.
- Other contract dependents in this step:
  - `test/engine/type.mjs`: new group `ui-text-table` covering 25 entries, the values above, the off-table `RangeError`, and factor 1.125 rounding.
  - `test/figma/style-plan.mjs`: the UI voices carry one `md` style family.
  - `plugin/ultimate-tokens/skills/typography-tokens/SKILL.md`: the Steps cell `xs/sm/md/lg/xl/2xl` for both voices becomes `md`; also `references/interface.md`, `references/responsive.md`, and the mutation fixture text in `test/plugin/typography-tokens.mjs:48`.
- Left for later steps on purpose: `src/engine/geometry.mjs` (`:270`, `:287`) still composes `font` from `categories["UI-control"][step]` and falls back to `CONTROL_FONT` for the retired steps, so `test/engine/geometry.mjs` and `test/engine/exports.mjs` may go red until step 2 rewrites them; `type.tokenOverrides` keys on retired UI steps are dropped by step 3's migration.
### Acceptance criteria
- (red) `node --input-type=module -e 'import("./src/engine/type.mjs").then((t) => { let threw = false; try { t.uiText(30); } catch (e) { threw = e instanceof RangeError; } const u = t.typeScale({}).uiText; const ok = threw && u && Object.keys(u).length === 25 && u[32] === 14 && u[96] === 30 && u[14] === 7.5 && u[12] === 7; process.exit(ok ? 0 : 1); })'`
- (red) `node --input-type=module -e 'import("./src/engine/type.mjs").then((t) => { const c = t.typeScale({}).categories; const ok = Object.keys(c["UI-control"]).join() === "MD" && Object.keys(c["UI-widget"]).join() === "MD" && c["UI-control"].MD.size === 14 && c["UI-widget"].MD.size === 12; process.exit(ok ? 0 : 1); })'`
- (red) `node --input-type=module -e 'import("./src/engine/type.mjs").then((t) => { const v = Object.values(t.typeTokensFigmaModes(t.typeScale({})).collections)[0].variables; const keys = Object.keys(v); const ok = keys.includes("type/ui-control/md/size") && !keys.some((k) => /^type\/ui-(control|widget)\/(xs|sm|lg|xl|2xl)\//.test(k)); process.exit(ok ? 0 : 1); })'`
- (red) `! grep -qF 'RANKS6' src/engine/type.mjs && ! grep -qE 'fam6\(\["UI-(control|widget)"\]' src/ui/model.mjs`
- (red) `! grep -qF 'xs/sm/md/lg/xl/2xl' plugin/ultimate-tokens/skills/typography-tokens/SKILL.md`
- (red) `grep -qF 'ui-text-table' test/engine/type.mjs`
- (red) `grep -qF 'TYPE_STEPS = 41;' test/ui/counts.mjs && ! git grep -qE '51 steps|all 51 |51-step|\(51\)|voices × 6|TYPE_STEPS = 51' -- src test`
- (guard) `node test/engine/type.mjs`
- (guard) `node test/figma/style-plan.mjs`
- (guard) `node test/plugin/typography-tokens.mjs`
- (guard) `node test/engine/categories.mjs`
- (guard) `node test/ui/headless-boot.mjs`

## Step 2: Geometry engine on the 27-cell ladder, and the interchange that carries it
level: L4
### Do
Depends on: step 1 (`UI_TEXT`, `uiText`, `typeScale().uiText`). Design source: `.sdlc/geometry-maison-ladder/architect-L1.md` (Approach, Glyphs, Interfaces, Carry forward for the Maison paths and anatomy facts). Maison sources are read only, never edited.
- Fixture first: `test/engine/fixtures/maison-geometry-rows.json`:
  - `source`: `{ repo: "ui-kit-maison", path: "src/foundation/geometry/geometry.ts", commit: "05d1c8c5e1b8a9f8bb90194600b049f4b6888591", sha256: "8d076600521cc028c390142ff38d59badcd4e0379b172d1b95a80a9ebfa58136" }`. The CSV, `geometry.ts`, `definition.mjs` and `scripts/generate.mjs` are byte-identical to `ca56f2d9`, which the architect read (`git diff --stat ca56f2d9 HEAD` touches only Maison's README, component.md, contract.json and manifest.json).
  - `rows`: the 27 geometryRows from `geometry.ts:409-653` (tier, scale, size, height, inset, text, icon). `resolverCells`: 27 entries with caption-text, chip-height, chip-inset, chip-text and icon-height-ratio from geometry.ts's per-tier `--m-cell-*` declarations. `ladder`: the 25 CSV rows.
- `src/engine/geometry.mjs` exports:
  - `TIERS` (definition.mjs verbatim): content {base 48, offsets sm -12 md 0 lg 16, step 8}, product {32, -4/0/4, 8}, micro {16, -2/0/2, 2}. `SCALES = ["sm","md","lg"]`, `SIZES = { sm: -1, md: 0, lg: 1 }`.
  - `RADIUS_MODES = { default: { text: 0.5, height: 0 }, round: { text: 1, height: 0 }, sharp: { text: 0.25, height: 0 }, pill: { text: 0, height: 0.5 } }` (Maison `scripts/generate.mjs:58`).
  - `DEFAULT_GEOMETRY = { tier: "product", scale: "md", radius: "round", spaceBase: 4 }`.
  - `LADDER_ROWS` (25 rows of height, inset, icon; text comes from `type.mjs`'s `uiText`, and type.mjs imports neither geometry nor model, so there is no cycle). `cellHeight(tier, scale, size)` = base + offsets[scale] + SIZES[size] * step; a row lookup throws `RangeError` off-table.
  - `LEGACY_SIZE_CELLS = { XS: "product-sm-sm", SM: "product-md-sm", LG: "product-lg-md", XL: "content-md-md", "2XL": "content-lg-md" }`, the pixel-preserving legacy heights from the architect Carry forward. Its reader is `sizeAnchor`; there is no `MD` key because MD is the kit default cell.
- Per cell (Maison `scripts/generate.mjs:36,47-52,70-73`): `height`, `inset`, `icon` from the ladder row; `text` = `opts.typeScale ? opts.typeScale.uiText[height] : uiText(height)`; the compact row is the first ladder row, in descending height, whose height is <= height - inset (else the smallest row); `captionText` = `chipText` = the compact row's text, composed the same way; `chipHeight` = min(compact height, height); `chipInset` = the compact inset; `iconRatio` = icon / height, unrounded; `minWidth` = height; `radiusControl` = text * k.text + height * k.height for the kit's radius mode; `radiusMark` = radiusControl * iconRatio; `radiusInset` = max(0, radiusControl - inset / 2); `radiusCard` = radiusControl + inset / 2.
- `geomScale(config = {}, opts = {})`: config is `{ tier, scale, radius, spaceBase }`, unknown ids fall back to `DEFAULT_GEOMETRY`. Returns `{ tier, scale, radius, spaceBase, cells, cell, radii, space, insets, gaps, borders, focus }`. `cells` holds all 27 keyed `{tier}-{scale}-{size}` in Maison's geometryRows order (content, product, micro; then scale sm, md, lg; then size sm, md, lg). `cell` = `{ name: "{tier}-{scale}-md", ...cells[name] }`. `radii` (M3, `:78`), `space`, `insets`, `gaps`, `borders` and `focus` derive from `spaceBase` exactly as today and stay byte-identical at spaceBase 4, which keeps the Tailwind/shadcn/Panda/Radix seeds in `src/engine/exports.js` stable.
- Anchors: `orderedSizeNames(scale)` returns the 27 names in that order. `sizeAnchor(scale, name)` returns `{ name, size: scale.cells[name] }`, where `MD` resolves to `scale.cell.name` and the other five come from `LEGACY_SIZE_CELLS`. `mdAnchor(scale)` = `sizeAnchor(scale, "MD")`.
- Prefix contract (plan-reviewer finding, step 7 interfaces). The `prefix` option goes through the existing `ns()` helper (`geometry.mjs:330`) and covers only the cell primitives (`--{ns(p,"size")}-{tier}-{scale}-{size}-{field}`) and the container ladders (radius, space, inset, gap, border, focus lines), exactly as it covers `--{p}-size-*` and `--{p}-radius-*` today. The resolver's roles (`--control-*`, `--chip-*`, `--radius-control/-mark/-inset/-card`) and context hooks (`--ctx-*`) are never prefixed, whatever `prefix` is: handoff Decision 3 makes them equal to Maison's override hooks, and Maison's control CSS reads them unprefixed (`ui-kit-maison/src/foundation/control/control.mjs:10-13`, `var(--control-height, var(--g-height))`). Only the `var()` references inside the `--ctx-cell-*` reassignments follow the prefix, to reach the prefixed primitives.
- Emitters (role names from handoff Decision 3):
  - `geomTokensSizesCSS(scale, { unit, prefix })`: one `:root` block of the 27 x 14 primitives. Fields: height, inset, text, icon, caption-text, chip-height, chip-inset, chip-text, icon-ratio (unitless), min-width, radius-control, radius-mark, radius-inset, radius-card.
  - New `export function geomResolverCSS(scale, { unit, prefix })`, Maison's context resolver in our names, emitting the resolver only (it reads the primitives, it does not declare them):
    - `:where(:root)`: the kit default context, the kit tier's cells as `--ctx-cell-{scale}-{size}-{field}: var(--{ns(p,"size")}-{tier}-{scale}-{size}-{field})`, the `--ctx-scale-*`/`--ctx-size-*` 0/1 indicators for the kit scale and size md, and `--ctx-radius-text`/`--ctx-radius-height` for the kit radius mode.
    - `:where([data-tier="X"])` reassigns the `--ctx-cell-*` to tier X's primitives; `:where([data-scale="X"])`, `:where([data-size="X"])` and `:where([data-radius="X"])` set the indicators.
    - `:where(*, :host)` defines `--control-height/-inset/-text/-icon/-caption-text/-icon-ratio` and `--chip-height/-inset/-text` as the sum of products over the nine cells, plus `--radius-control: calc(var(--control-text) * var(--ctx-radius-text, 1) + var(--control-height) * var(--ctx-radius-height, 0))` and `--radius-mark`, `--radius-inset`, `--radius-card` by the formulas above (`generate.mjs:62,70-73`). No `--g-micro-*` equivalent.
  - `geomTokensCSS`: the primitives, then the container lines as today, then the resolver. `--density`, `--radius-default` and `radiusDefault` leave the scale (no treatment is left to pick a favoured level); the `.control-{step}` classes retire.
  - `geomTokensBreakpointCSS(modes)`: each mode file's `:root` sets only the `--ctx-scale-*` indicators for that mode's `scale.scale`.
  - `geomTokensDTCG`: a `size` group keyed by cell with kebab fields (dimension; `icon-ratio` as `$type: "number"`). `geomTokensFigma`: the same, as numbers.
  - `geomTokensFigmaModes(base, modes)`: mode-constant FLOAT `size/{cell}/{field}` (27 x 14), plus per-mode alias variables `control/{tier}/{size}/{field}` (9 x 14) shaped `{ type: "ALIAS", values: { [mode]: "size/{tier}-{modeScale}-{size}/{field}" } }`, where modeScale is that mode's `scale.scale`. Radius, space, inset, gap, border and focus stay as today.
- The interchange carries the new shape (plan-reviewer finding, step 5 interfaces; moved here because this step creates the shape):
  - `figma/binder/mode-apply-plan.mjs` `validateModeInterchange` (`:113`): a variable whose `type` is `"ALIAS"` is valid when, for every mode, its value is a string naming another variable of the same collection whose `type` is in `FIGMA_VAR_TYPES` (`:36`, one hop, never an ALIAS); otherwise it pushes `<coll>/<var>: ALIAS target "<t>" for mode "<m>" is not a literal variable of this collection`. `FIGMA_VAR_TYPES` keeps the four Figma types; the type check at `:134` skips `"ALIAS"`.
  - `modeApplyPlan` (`:85`) is unchanged: it already passes `values[m]` through, so a plan variable reads `{ name, type: "ALIAS", values: [{ mode, value: "<target name>" }] }`. `valueChanged` (`:465`) already returns true for `"ALIAS"`; update the header comment at `:458` ("Geometry, `type` is never ALIAS here") to say Geometry's `control/` variables are per-mode ALIAS.
  - `mergeModeInterchanges` back-fills a missing mode with the half's default-mode value, which for an ALIAS is its default target name; no change.
  - `src/ui/overlays/apply-gate.js:277-283` needs no change: it keeps the Geometry half once the validator accepts it.
  - `test/figma/mode-apply.mjs` (`:26-30`): the Geometry interchange is built from `G.geomScale({})` and `[{ name: "Desktop", scale: G.geomScale({ scale: "lg" }) }]`; `validateModeInterchange(geomIx).length === 0` stays; the value-complete assertion at `:30` checks finite numbers for FLOAT variables and a string naming a `size/` FLOAT variable for ALIAS ones; add one assertion that an ALIAS to a missing name is reported.
- Retire `RAMP_LADDER`, `GEOMETRY_RAMPS`, `LADDER_*`, `GEOMETRY_TREATMENTS`, `SIZE_KEYS`, `CONTROL_FONT`, `GAP_UNIT`, `buildSize*`, caret, gap, the four pads, density and `radiusPill`.
- Contract dependents in this step: `test/engine/geometry.mjs`, rewritten with groups `maison-ladder` (27 cells deep-equal the fixture rows and resolverCells; off-table throws), `anatomy` (inset === (height - icon) / 2 for all 27), `radius-modes` (27 x 4 = 108 values), `anchors` (MD is the kit default; XS, SM, LG, XL, 2XL equal `LEGACY_SIZE_CELLS`), `emitters` (including the prefix contract), and `container-identity` (radii/space/insets/gaps/borders/focus deep-equal today's values at spaceBase 4); `test/engine/exports.mjs` geometry assertions; `test/figma/mode-apply.mjs` as above.
- Left for later steps on purpose; they read the old shape and stay red until then: step 3 (`src/ui/model.mjs`, `src/ui/persist.js`, `test/ui/model.mjs`, `test/ui/persist.mjs`); step 4 (`src/engine/ds-export.js` including its `radiusDefault` reads at `:258` and `:1598`, `mcp/png-swatch-board.mjs`, `mcp/brand-kit-core.mjs`, `scripts/smoke-panda.mjs`, `scripts/gen-adia-derived-exports.mjs`); step 5 (`figma/binder/migrations.mjs`, `geometrySizeAliasMap`, `figma/plugin/code.js` including the `applyFloatPlans` ALIAS write, `test/figma/plugin.mjs`, `test/figma/binder.mjs`); step 6 (`src/ui/sections/geometry.js`, `src/ui/overlays/drawer.js`, `src/ui/app.js`, `test/ui/headless-boot.mjs`); step 12 (`plugin/ultimate-tokens/skills/geometry-tokens/scripts/dimension-parity.mjs`).
- The untagged test runs below are not guards: they are red or untouched at this step's start by design and must be green after it.
### Acceptance criteria
- (red) `node -e 'const f = require("./test/engine/fixtures/maison-geometry-rows.json"); process.exit(f.rows.length === 27 && f.resolverCells.length === 27 && f.ladder.length === 25 && f.source.sha256 === "8d076600521cc028c390142ff38d59badcd4e0379b172d1b95a80a9ebfa58136" ? 0 : 1)' && grep -qF 'maison-ladder' test/engine/geometry.mjs`
- (red) `node --input-type=module -e 'import("./src/engine/geometry.mjs").then((g) => { const s = g.geomScale({}); const md = s.cells["product-md-md"]; const ok = Object.keys(s.cells).length === 27 && g.orderedSizeNames(s).length === 27 && s.cell.name === "product-md-md" && g.mdAnchor(s).name === "product-md-md" && g.sizeAnchor(s, "LG").name === "product-lg-md" && g.sizeAnchor(s, "XS").name === "product-sm-sm" && g.sizeAnchor(s, "2XL").name === "content-lg-md" && md.height === 32 && md.inset === 8 && md.text === 14 && md.icon === 16 && md.chipHeight === 24 && md.radiusControl === 14; process.exit(ok ? 0 : 1); })'`
- (red) `node --input-type=module -e 'import("./src/engine/geometry.mjs").then((g) => { const r = (radius) => g.geomScale({ radius }).cells["product-md-md"]; const ok = r("default").radiusControl === 7 && r("sharp").radiusControl === 3.5 && r("pill").radiusControl === 16 && r("round").radiusMark === 7 && r("round").radiusInset === 10 && r("round").radiusCard === 18; process.exit(ok ? 0 : 1); })'`
- (red) `out=$(node --input-type=module -e 'import("./src/engine/geometry.mjs").then((g) => { const s = g.geomScale({}); console.log(g.geomTokensCSS(s) + JSON.stringify(g.geomTokensDTCG(s)) + JSON.stringify(g.geomTokensFigmaModes(s, []))); })') && for s in '--size-product-md-md-height: 32px' '[data-tier="micro"]' '[data-radius="pill"]' '--control-height:' '--chip-text:' '--radius-mark:' '--ctx-scale-md:'; do printf '%s\n' "$out" | grep -qF -- "$s" || exit 1; done && ! printf '%s\n' "$out" | grep -qE 'caret|icon-gap|padding-wide|\.control-'`
- (red) `node --input-type=module -e 'import("./src/engine/geometry.mjs").then((g) => { const m = g.geomTokensFigmaModes(g.geomScale({}), [{ name: "Mobile", scale: g.geomScale({ scale: "sm" }) }]); const v = Object.values(m.collections)[0].variables; const keys = Object.keys(v); const c = v["control/product/md/height"] || {}; const ok = keys.filter((k) => k.startsWith("size/")).length === 378 && keys.filter((k) => k.startsWith("control/")).length === 126 && c.type === "ALIAS" && c.values.Base === "size/product-md-md/height" && c.values.Mobile === "size/product-sm-md/height"; process.exit(ok ? 0 : 1); })'`
- (red) `node --input-type=module -e 'import("./src/engine/geometry.mjs").then((g) => { const d = g.geomTokensDTCG(g.geomScale({})); process.exit(d.size && Object.keys(d.size).length === 27 && d.size["content-lg-lg"].height.$value === "72px" ? 0 : 1); })'`
- (red) `out=$(node --input-type=module -e 'import("./src/engine/geometry.mjs").then((g) => console.log(g.geomResolverCSS(g.geomScale({}), { prefix: "md" })))') && printf '%s\n' "$out" | grep -qE '(^|[;{[:space:]])--control-height:' && printf '%s\n' "$out" | grep -qF 'var(--md-size-product-md-md-height)' && ! printf '%s\n' "$out" | grep -qE -- '--md-(control|chip|ctx)-|--md-radius-(control|mark|inset|card)'`
- (red) `node --input-type=module -e 'Promise.all([import("./src/engine/geometry.mjs"), import("./figma/binder/mode-apply-plan.mjs")]).then(([g, a]) => { const ix = g.geomTokensFigmaModes(g.geomScale({}), [{ name: "Mobile", scale: g.geomScale({ scale: "sm" }) }]); const bad = JSON.parse(JSON.stringify(ix)); const cv = Object.values(bad.collections)[0].variables["control/product/md/height"]; if (!cv) process.exit(1); cv.values.Base = "size/nope/height"; const ok = a.validateModeInterchange(ix).length === 0 && a.validateModeInterchange(bad).length > 0 && a.modeApplyPlan(ix)[0].variables.some((v) => v.type === "ALIAS"); process.exit(ok ? 0 : 1); })'`
- (red) `grep -qE '^export function geomResolverCSS' src/engine/geometry.mjs && ! grep -qE 'RAMP_LADDER|rampContrast|baseHeight|CONTROL_FONT|GAP_UNIT|GEOMETRY_TREATMENTS' src/engine/geometry.mjs`
- `node test/engine/geometry.mjs`
- `node test/engine/exports.mjs`
- `node test/figma/mode-apply.mjs`

## Step 3: Document shape and saved-kit migration (schema v9)
level: L4
### Read first
- `docs/AGENTS.md`
### Do
Depends on: step 2 (`TIERS`, `SCALES`, `SIZES`, `RADIUS_MODES`, `DEFAULT_GEOMETRY`, `geomScale`). Design source: `.sdlc/geometry-maison-ladder/architect-L1.md` (Approach para 4 migration, Interfaces `model.mjs`/`persist.js`), handoff Decision 2, and the user ruling that T-0017 builds after T-0014 and takes schema v9.
- `src/ui/model.mjs` (T-0014's tree):
  - `geomScaleFor(doc, modeKey)` (`:171`) = `geomScale(mode ? { ...g, scale: mode.scale } : g, { typeScale: typeScaleFor(doc, "base") })`. Cells compose from the base type scale at every mode because the Figma cells are mode-constant (architect decision 5, accepted).
  - `geometryScale(doc, opts)` (`:55`) keeps its signature and returns `geomScaleFor(doc, "base")`. `geomOverridesFor` (`:151`) and every height-override path retire.
  - `geomModeScales(doc)` (`:216`): configured modes map to `{ name, minWidth, scale: geomScaleFor(doc, m.id) }`. With none configured, the synthesized set is Desktop Lg (1728, scale lg), Desktop Xl (2560, lg), Tablet (992, sm), Mobile (476, sm) (architect Interfaces). `geomEffectiveModes` (`:98`) follows the `modes[].scale` shape.
- `src/ui/persist.js` (T-0014's tree):
  - `clampGeometry` (`:858`) returns `{ tier, scale, radius, spaceBase, modes?, baseName? }`. spaceBase is an integer 1..16, default 4. modes is `[{ id, name, scale, minWidth? }]`.
  - Allowlists: `GEOMETRY_TIERS = ["content","product","micro"]`, `GEOMETRY_SCALES = ["sm","md","lg"]`, `GEOMETRY_SIZES = ["sm","md","lg"]` (replacing the old size-name list at `:854`), `GEOMETRY_RADIUS = ["default","round","sharp","pill"]`, each parity-gated in `test/ui/persist.mjs` against `Object.keys(TIERS)`, `SCALES`, `Object.keys(SIZES)` and `Object.keys(RADIUS_MODES)`. `GEOMETRY_TREATMENTS` (`:843`) and `GEOMETRY_RAMPS` (`:857`) retire.
- Schema: `CURRENT_SCHEMA_VERSION` (`:366`) goes from T-0014's 8 to 9. Add one entry to `RENAME_MAPS` (`:385`), after T-0014's `version: 8` entry: `{ version: 9, migrateGeometry: true }` with a comment in the v7/v8 style, plus a `// v9 (T-0017, #803)` paragraph in the version comment block above `:366`. In `applyRenameMaps` (`:491`), beside the `entry.foldGroups` branch (`:528`), add `if (entry.migrateGeometry && s && typeof s === "object") s = migrateGeometry(s, drop);`, and define `function migrateGeometry(s, drop)` next to `foldGroups`, in its comment style. The runner's `if (fromVersion >= entry.version) continue;` (`:496`) already limits it to docs stamped below 9.
- `migrateGeometry`, for a doc whose `geometry` carries `treatment` or `baseHeight`:
  - The legacy MD height h is `baseHeight`, else the treatment's own: comfortable 28, compact 24, spacious 32, touch 36, pill 28 (`src/engine/geometry.mjs:61-69` today). The migration-only copy of that table lives in persist.js as `LEGACY_TREATMENT_GEOMETRY` (never the retired name `GEOMETRY_TREATMENTS`, which steps 6 and 14 grep for).
  - (tier, scale) is the nearest md-cell height: product sm/md/lg 28/32/36, content 36/48/64, micro 14/16/18. Ties break by tier (product > content > micro), then scale (md > sm > lg).
  - `radius` from the treatment's radiusStyle: sharp to sharp, soft to default, round to round, pill to pill. `spaceBase` from the treatment: comfortable 4, compact 4, spacious 8, touch 8, pill 4.
  - `modes[].baseHeight` becomes `modes[].scale` by nearest md-cell height within the migrated tier.
  - `treatment`, `baseHeight`, `rampContrast`, `ramp`, `geometry.tokenOverrides`, and `type.tokenOverrides` keys on UI-control/UI-widget steps other than MD are removed, each reported through `drop` (so `DROPPED_KEYS`, `:373`) with a reason.
- `docs/reference/colors/categories/brands.json`: remove the Adia preset's `"ramp": "linear4"` (`:350`), then run `npm run gen:categories` so `src/ui/categories/brands.js` follows.
- Contract dependents in this step: `test/ui/persist.mjs` (allowlist parity, a v8 fixture with the old keys, a v9 doc that round-trips byte-identical) and `test/ui/model.mjs` (the geometry join, the synthesized modes, the UI nudge rows gone). Both files carry T-0014's edits; add to them, do not revert them.
- Left for later steps: the section, drawer, apply-gate and app.js still read the old doc and scale shapes until step 6.
- The untagged test runs below are not guards: they are red at this step's start by design and must be green after it.
### Acceptance criteria
- (red) `grep -qE '^export const CURRENT_SCHEMA_VERSION = 9;' src/ui/persist.js && grep -qE '^ *version: 9,' src/ui/persist.js && grep -qF 'function migrateGeometry' src/ui/persist.js`
- (red) `node --input-type=module -e 'import("./src/ui/persist.js").then((U) => { const d = U.hydrate({ schemaVersion: 8, geometry: { treatment: "compact", baseHeight: 24, ramp: "linear4", rampContrast: 0.5, tokenOverrides: { "MD|base": 30 } } }); const g = d.geometry; const dropped = JSON.stringify(d[U.DROPPED_KEYS]); const ok = g.tier === "product" && g.scale === "sm" && g.radius === "sharp" && g.spaceBase === 4 && !("ramp" in g) && !("rampContrast" in g) && !("tokenOverrides" in g) && !("treatment" in g) && dropped.includes("tokenOverrides"); process.exit(ok ? 0 : 1); })'`
- (red) `node --input-type=module -e 'import("./src/ui/persist.js").then((U) => { const a = U.hydrate({ schemaVersion: 8, geometry: { treatment: "comfortable" } }).geometry; const b = U.hydrate({ schemaVersion: 8, geometry: { treatment: "touch" } }).geometry; const ok = a.tier === "product" && a.scale === "sm" && a.radius === "default" && a.spaceBase === 4 && b.tier === "product" && b.scale === "lg" && b.spaceBase === 8; process.exit(ok ? 0 : 1); })'`
- (red) `node --input-type=module -e 'import("./src/ui/persist.js").then((U) => { const g = U.hydrate({ schemaVersion: 8, geometry: { treatment: "comfortable", baseHeight: 28, modes: [{ id: "m1", name: "Mobile", minWidth: 476, baseHeight: 24 }] } }).geometry; const m = (g.modes || [])[0] || {}; process.exit(m.scale === "sm" && !("baseHeight" in m) ? 0 : 1); })'`
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
  - The import at `:24` drops `RAMP_LADDER`. `dsGeometryLayer` publishes `cells` (27, keyed by cell name) instead of `sizes` (`:256`), and the `density`/`radiusDefault` fields (`:258`) and the `--radius-default` line (`:1598`) retire. `dsIconLayer` (`:296`) maps every cell name to its `icon`.
  - Every `RAMP_LADDER`/ladder branch (`:445-454`, `:470`, `:532-537`) retires; the control text reads `mdAnchor(geomSc).size.text`; the Buttons card's size row renders the kit's three cells `{tier}-{scale}-{sm,md,lg}`; the icon-size guidance at `:858` lists the kit's three cells.
- `mcp/png-swatch-board.mjs` (`:193-197`): the mock controls size from `sizeAnchor(kit.geometry, "LG")` (product-lg-md), the thumbs from its `icon` and `radiusMark`. The inline ladder re-implementation (`lgKey`) retires.
- `mcp/brand-kit-core.mjs` (T-0014 touched this file; edit only these two lines): the `get_geometry` description (`:129`) and the instructions line (`:87`) name the tier x scale x size ladder, the 27 cells and the resolver roles instead of the XS to 2XL ramp. Run `npm run gen:mcp-assets` so `src/ui/mcp-assets.js` and `src/ui/describe-mcp-assets.js` follow. The latter embeds `src/ui/model.mjs` and `src/ui/persist.js` verbatim (`scripts/gen-describe-mcp-assets.mjs:30-31`), so it keeps persist.js's migration strings (`rampContrast`); the retired-symbol greps in steps 6 and 14 exclude it and `figma/plugin/ui.html` (the app bundle) for that reason, and check the sources directly.
- `scripts/smoke-panda.mjs` and `scripts/gen-adia-derived-exports.mjs` follow the new emitters and shape; the Adia comment at `:16` no longer cites `ramp`. Run `npm run gen:adia-exports`. `docs/reference/data/adia-*` must stay byte-identical because radii/space/borders are unchanged; if a byte moves, follow that file's own bump policy and record the reason in the builder summary.
- Contract dependents in this step: `test/engine/ds-gates.mjs`, `test/mcp/brand-kit.mjs`, `test/mcp/png-swatch-board.mjs`, `test/mcp/describe-kit-core.mjs`, `test/mcp/brand-kit-merged-core.mjs`, `test/engine/adia-derived-exports.mjs`. The T-0014-edited ones (`brand-kit.mjs`, `describe-kit-core.mjs`) keep T-0014's assertions.
- The panda smoke (`scripts/smoke-panda.mjs`) runs only in CI (`panda-smoke`); this host does not prove it.
- The untagged test runs below are not guards: they are red at this step's start by design and must be green after it.
### Acceptance criteria
- (red) `! grep -qE 'RAMP_LADDER|LADDER|radiusDefault|\.sizes[^A-Za-z]' src/engine/ds-export.js`
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
Depends on: step 2 (cell names, the per-mode ALIAS shape, the validator). Skill: `maintaining-figma-plugins`. No live Figma file is touched; the `figma-file-migration` skill covers that by hand later.
- Field spellings. `figma/binder/migrations.mjs` `GEOMETRY_FIELD_RENAME_MAP` (`:117`) becomes exactly `{ "padding-narrow": "inset", padding: "inset", font: "text", "pill-radius": "radius-control", radius: "radius-control", minWidth: "min-width" }`. `edgePadding`, `gap`, `caret`, `icon-gap`, `padding-wide` and the two compact pads have no target and deprecate id-preserving, as `font` did in #498; rewrite the header comment (`:101-116`) to say so and to say `font` now maps to `text`.
  - The map has three hand copies, all gated by `renameparity` (`test/figma/binder.mjs:810-850`, which already enumerates the three constants and the binder and flagship files): `figma/plugin/code.js:549` and `figma/binder/figma-semantic-binder/code.js:91`. Copy the literal into both byte-for-byte. The renameparity gate needs no new constant.
- There is no `GEOMETRY_CELL_MAP` constant (plan-reviewer finding: it had no reader and would be a fourth renameparity copy). A live file's old `size/{XS..2XL}` and `size/{0..9}` variables alias to cells by their own live heights through `geometrySizeAliasMap`, and the six default-height pairs live as an expected table in the test below.
- Geometry tiebreak (plan-reviewer finding: never in the shared helper). `nearestStepByHeight` (`figma/binder/mode-apply-plan.mjs:209`) stays byte-identical: its type callers `typeStepAliasMap` (`:310`) and `typeWeightAliasMap` (`:333`) keep its insertion-order tie rule.
  - Add `export function geometryCellOrder(stepHeights)` beside it, pure: returns a new object with the same entries, keys re-ordered so names matching `^(content|product|micro)-(sm|md|lg)-(sm|md|lg)$` sort by tier (product, content, micro), then size (md, sm, lg), then scale (md, sm, lg); every other key follows all cells, in its original order.
  - `geometrySizeAliasMap` (`:226`) calls `nearestStepByHeight(h, geometryCellOrder(currentStepHeights))`. Why it is required: Maison's row order and `modeApplyPlan`'s name sort both put `content-*` first, so a bare insertion-order tie would send the legacy 28 and 36 heights to content cells. Computed over the three cells at 28 (product-sm-md, product-lg-sm, content-sm-sm) and at 36 (product-sm-lg, product-lg-md, content-sm-md), only this order gives MD 28 to product-sm-md and LG 36 to product-lg-md.
- `figma/plugin/code.js`:
  - Add `geometryCellOrderVM`, a hand mirror of `geometryCellOrder`, and call it in `expandGeometryAliasMap` (`:510`) exactly where the binder calls `geometryCellOrder`.
  - `applyFloatPlans` (`:1681`): the write loop (`:1764-1769`) skips `type === "ALIAS"` variables; after it, a second pass, once every literal variable of the plan exists in `byName`, creates each ALIAS variable with `figma.variables.createVariable(v.name, coll, "FLOAT")` when absent and, for every mode, writes `figma.variables.createVariableAlias(byName[pair.value])`; a missing target is skipped, never thrown (the `:1068-1076` idiom of `applyFontPrimitivesModes`). It joins `current` and the variable count like a literal. `valueChangedVM` (`:676`) already returns true for ALIAS.
  - Add `"geometryCellOrderVM"` to `FLOAT_FNS` in `scripts/gen-figma-binder-code.mjs:44-51`, then run `npm run gen:figma-assets` (it runs `gen-figma-binder-code.mjs`, which splices `FLOAT_FNS` into the binder, then `gen-figma-assets.mjs`). Never hand-edit the spliced functions in the binder or `src/ui/figma-plugin-assets.js`.
- Contract dependents in this step:
  - `test/figma/plugin.mjs`: its VM-versus-module parity block (`:1715-1790`) adds `geometryCellOrder` against `geometryCellOrderVM`; new group `legacy-cell-map` asserts `geometrySizeAliasMap({ XS: 20, SM: 24, MD: 28, LG: 36, XL: 48, "2XL": 64 }, <the 27 default cell heights in name-sorted order>, ["height"])` sends XS to product-sm-sm, SM to product-md-sm, MD to product-sm-md, LG to product-lg-md, XL to content-md-md and 2XL to content-lg-md, and that `expandGeometryAliasMap` agrees; new group `geom-alias-apply` runs the mock `applyFloatPlans` on the default kit's Geometry plan and asserts `control/product/md/height` holds, at the base mode, `{ type: "VARIABLE_ALIAS", id }` with the id of `size/product-md-md/height` (the mock implements `createVariableAlias`, `test/figma/plugin.mjs:167`). It carries T-0014's edits; add to it.
  - `test/figma/binder.mjs` (floatparity and renameparity), `test/figma/migrations.mjs`, `test/figma/live-diff.mjs`.
- `test/figma/style-plan.mjs` imports only `figma/binder/style-plan.mjs`, `src/engine/exports.js` and `src/engine/type.mjs`, none of which steps 2 to 5 change, so here it is a `(guard)` that the binder edits leave the style planner green.
- The untagged test runs below are not guards: they are red at this step's start by design and must be green after it.
### Acceptance criteria
- (red) `node --input-type=module -e 'import("./figma/binder/migrations.mjs").then((M) => { const f = M.GEOMETRY_FIELD_RENAME_MAP; const ok = f["padding-narrow"] === "inset" && f.padding === "inset" && f.font === "text" && f["pill-radius"] === "radius-control" && f.radius === "radius-control" && f.minWidth === "min-width" && !("edgePadding" in f) && !("gap" in f); process.exit(ok ? 0 : 1); })'`
- (red) `node --input-type=module -e 'import("./figma/binder/mode-apply-plan.mjs").then((P) => { const cur = { "content-sm-sm": 28, "product-lg-sm": 28, "product-sm-md": 28, "content-sm-md": 36, "product-sm-lg": 36, "product-lg-md": 36, "micro-lg-lg": 20, "product-sm-sm": 20 }; const m = P.geometrySizeAliasMap({ XS: 20, MD: 28, LG: 36 }, cur, ["height"]); const ok = m["size/XS/height"] === "size/product-sm-sm/height" && m["size/MD/height"] === "size/product-sm-md/height" && m["size/LG/height"] === "size/product-lg-md/height"; process.exit(ok ? 0 : 1); })'`
- (red) `node --input-type=module -e 'import("./figma/binder/mode-apply-plan.mjs").then((P) => { const o = Object.keys(P.geometryCellOrder({ "x-step": 1, "content-sm-sm": 28, "micro-lg-lg": 20, "product-lg-sm": 28, "product-sm-md": 28 })); process.exit(o.join() === "product-sm-md,product-lg-sm,content-sm-sm,micro-lg-lg,x-step" ? 0 : 1); })'`
- (guard) `node --input-type=module -e 'import("./figma/binder/mode-apply-plan.mjs").then((P) => process.exit(P.nearestStepByHeight(28, { b: 28, a: 28 }) === "b" ? 0 : 1))'`
- (red) `for f in figma/plugin/code.js figma/binder/figma-semantic-binder/code.js; do grep -qF 'geometryCellOrderVM' "$f" || exit 1; grep -qF '"padding-narrow": "inset"' "$f" || exit 1; done && grep -qF '"geometryCellOrderVM"' scripts/gen-figma-binder-code.mjs`
- (red) `grep -qF 'legacy-cell-map' test/figma/plugin.mjs && grep -qF 'geom-alias-apply' test/figma/plugin.mjs`
- `node test/figma/plugin.mjs`
- `node test/figma/binder.mjs`
- `node test/figma/migrations.mjs`
- `node test/figma/live-diff.mjs`
- (guard) `node test/figma/style-plan.mjs`

## Step 6: Editor Geometry section on tier, scale and radius
level: L4
### Do
Depends on: steps 2 to 5. The headless boot also drives the ds-export bundle and the Figma apply plans, so it can only go green once steps 4 and 5 have landed. Pattern: the `building-editor-sections` skill (canvas header + `.canvas-scene` + left analysis cards + right inspector, lettered headless groups).
- `src/ui/sections/geometry.js`:
  - The inspector edits `doc.geometry.tier` (content, product, micro), `scale` (sm, md, lg), `radius` (default, round, sharp, pill) and `spaceBase` (4, 8) through `app.commit`. The treatment picker, base-height slider (`:747`), ramp-contrast knob, linear-ladder toggle and per-cell height override editor retire.
  - The canvas renders all 27 cells as live controls, in light and dark, from each cell's height, inset, text, icon and radiusControl: nine `.geom-spec-row` rows (tier x scale, in `orderedSizeNames` order), each holding three `.geom-spec-line` cells (size sm, md, lg). Each `.geom-spec-line` carries `data-cell="{tier}-{scale}-{size}"` and a `.geom-ctl` mock control; the kit default cell (`scale.cell.name`) is marked. So the light column has 27 `.geom-spec-line`, which `test/smoke/smoke.mjs:247` and the `(geo)` group count against `GEOM_SIZES`.
  - The left rail keeps its three `html:` SVG analysis charts (`h("div", { class: "an-svg", html: svg })`): the project CLAUDE.md ratifies 12 across the three sections, 3 of them here, so the count does not move.
  - The tokens table lists the 27 cells' fields from `orderedSizeNames`.
  - The mode editor writes `modes[].scale` with one sm/md/lg segmented control per mode. `_setActiveGeomBaseHeight(v)` (`:290`) is replaced by `_setActiveGeomScaleId(id)`, which writes the active mode's `scale`; `_activeGeomScale()` (`:188`) keeps returning the active mode's resolved scale.
  - Copy that cites the UI-control voice says per-cell text composes from Typography's height-indexed UI text table.
- `src/ui/overlays/drawer.js`, `src/ui/overlays/apply-gate.js`, `src/ui/app.js`: call sites move to the step 2 emitters and the step 3 model functions; no reader of `baseHeight`, `rampContrast`, `RAMP_LADDER` or `geomOverridesFor` remains. The drawer's Geometry CSS tab (`drawer.js:70`) previews `geomTokensCSS`; repoint `(mc9)` (`test/ui/headless-boot.mjs:823`) from `.control-` to `--control-height`.
- `test/ui/counts.mjs:21`: `export const GEOM_SIZES = 27;` with comment `(ladder cells, tier × scale × size)`.
- `test/ui/headless-boot.mjs`: rewrite the `(geo)` group (`:2679-2735`) for the new shape (the scale fields, the round-trip of `tier`/`scale`/`radius`, brandKit's `cells`, and `cells["product-md-md"].text === uc.MD.size` in place of the `sizes.MD.font` checks at `:2732-2733`). Add groups `(gml1)` (the light column carries 27 distinct `data-cell` values, counted with the file's own tree-walk helpers), `(gml2)` (the inspector writes `doc.geometry.tier`, `scale` and `radius`) and `(gml3)` (`_setActiveGeomScaleId("lg")` writes `modes[].scale`).
  - After its assertions, `(gml1)` prints one info line with `console.log`, in the file's own idiom (the `(rst-corpus ...)` lines at `:4244-4248`): two spaces, then `(gml1) N distinct Geometry cells render on the canvas`, N the measured count, interpolated. `ok()` records only failures, so the run criterion greps that line to prove the group ran and counted 27.
- `test/smoke/smoke.mjs` geometry block (`:243-264`): the section and mode assertions follow the new API: `_setActiveGeomScaleId("lg")` and `_activeGeomScale().scale === "lg"` replace `_setActiveGeomBaseHeight(40)` and `.baseHeight === 40`, the reset commit at `:262` writes `{ tier: "product", scale: "md", radius: "round", spaceBase: 4 }`, and the message at `:247` names the 27-cell ladder. Smoke runs only in CI (`.github/workflows/ci.yml:41`); this host checks syntax only.
- This file is red at this step's start because steps 2 to 5 changed the scale, doc and plan shapes; this step restores it.
### Acceptance criteria
- (red) `grep -qF 'data-cell' src/ui/sections/geometry.js`
- (red) `! grep -qE 'baseHeight|rampContrast|RAMP_LADDER|GEOMETRY_TREATMENTS|tokenOverrides' src/ui/sections/geometry.js`
- (red) `! grep -qE 'baseHeight|rampContrast|RAMP_LADDER|geomOverridesFor' src/ui/overlays/drawer.js src/ui/overlays/apply-gate.js src/ui/app.js`
- (red) `test "$(grep -cE '\(gml[1-3]\)' test/ui/headless-boot.mjs)" -ge 3`
- (red) `grep -qF 'GEOM_SIZES = 27;' test/ui/counts.mjs`
- (red) `! grep -qE '_setActiveGeomBaseHeight|baseHeight' test/smoke/smoke.mjs`
- (red) `! git grep -qE 'RAMP_LADDER|rampContrast|GEOMETRY_TREATMENTS|LADDER_SIZE_KEYS|geomOverridesFor' -- src scripts mcp ':!src/ui/persist.js' ':!src/ui/describe-mcp-assets.js'`
- `out=$(node test/ui/headless-boot.mjs) && printf '%s\n' "$out" | grep -qF '(gml1) 27 distinct Geometry cells render'`
- (guard) `node test/ui/zip.mjs`
- (guard) `test "$(grep -cE 'html: ' src/ui/sections/geometry.js)" -eq 3`
- (guard) `node --check test/smoke/smoke.mjs`

## Step 7: Shell receives the geometry roles
level: L3
### Do
Depends on: steps 2 to 6 (`geomTokensSizesCSS`, `geomResolverCSS`, `_geomScaleFor`, the doc shape, a green headless boot). Handoff Decision 4: the shell rides with the engine; its selector groups are steps 8 to 11.
- `src/ui/app.js`:
  - On connect, and whenever the doc or the override changes, set the host attributes `data-tier`, `data-scale` and `data-radius` from the effective shell geometry, plus `data-size="md"`, next to `this.dataset.theme` (`:583`). The effective shell geometry is the app pref `this.shellGeometry` (null means follow the kit), else `doc.geometry` (defaults product, md, round).
  - Hold one style element on the instance, `this._geomRolesStyle`: created once with `document.createElement("style")`, `id = "ut-geometry-roles"`, appended to `document.head`, its `textContent` refreshed on every doc or override change, holding `geomTokensSizesCSS(sc) + "\n" + geomResolverCSS(sc)` for `sc = this._geomScaleFor("base")`, both with the default empty prefix. Never look it up with `document.getElementById`: the headless shim's returns null (`test/ui/headless-boot.mjs:106`), though it has `head` (`:102`). Prefix contract (step 2): roles and `--ctx-*` are never prefixed, so the aliases below read them unprefixed; the shell passes no prefix, so the primitives are the plain `--size-*` cells the resolver reads.
  - Persist `shellGeometry` with the other app prefs in `_loadAppPrefs`/`_saveAppPrefs` (`:2298`, `:2310`, the same store as `theme`).
- `src/ui/overlays/settings.js` `_settingsPanelAppearance` (`:151`): add a "Shell geometry" row offering Follow kit (the default) or an explicit tier, scale and radius. It writes `this.shellGeometry`, then calls `_saveAppPrefs()` and `render()`, like the App theme row at `:156-157`.
- `src/ui/styles.css`: add one alias block on the `ultimate-tokens` selector (beside `:74`), because the host carries the attributes and the `:root` block at `:18` does not. Fallbacks are the product-md-md round cell: `--sh-control-height: var(--control-height, 32px); --sh-control-inset: var(--control-inset, 8px); --sh-control-text: var(--control-text, 14px); --sh-control-icon: var(--control-icon, 16px); --sh-control-radius: var(--radius-control, 14px); --sh-radius-inset: var(--radius-inset, 10px); --sh-chip-height: var(--chip-height, 24px); --sh-chip-inset: var(--chip-inset, 5.5px); --sh-chip-text: var(--chip-text, 12px);`. No selector reads them yet. `--hh`, `--ch`, `--fh` (chrome heights, `:52-54`) and `--r-sm/--r/--r-lg` (`:45-47`) stay literal.
- `test/ui/headless-boot.mjs`: add groups `(shg1)` (a fresh doc's host carries product, md, md, round), `(shg2)` (a `doc.geometry` commit updates them), `(shg3)` (a Settings override wins over the doc) and `(shg4)` (`app._geomRolesStyle` has id `ut-geometry-roles` and is a child of `document.head`; its `textContent` matches `/(^|[;{\s])--control-height:/`, so a prefixed `--ut-control-height:` cannot satisfy it, and contains `--size-product-md-md-height:`).
- This host does not prove pixels: `npm run smoke` runs only in CI (`build-test`, `.github/workflows/ci.yml:41`).
### Acceptance criteria
- (red) `grep -qF 'data-tier' src/ui/app.js`
- (red) `grep -qF 'ut-geometry-roles' src/ui/app.js && grep -qF 'geomResolverCSS(' src/ui/app.js`
- (red) `grep -qF 'shellGeometry' src/ui/overlays/settings.js`
- (red) `for v in control-height control-inset control-text control-icon control-radius radius-inset chip-height chip-inset chip-text; do grep -qE "^ *--sh-$v: var\(--" src/ui/styles.css || exit 1; done`
- (red) `test "$(grep -cE '\(shg[1-4]\)' test/ui/headless-boot.mjs)" -ge 4`
- (guard) `node test/ui/headless-boot.mjs`
- (guard) `node test/ui/shell.mjs`

## Step 8: Shell buttons and inputs size from the roles
level: L2
### Do
Depends on: step 7. Only the two base rules change.
- `src/ui/styles.css` `button {` (`:157`): replace `padding: 4px 9px`, `gap: 6px` and `border-radius: var(--r-sm)` with `min-block-size: var(--sh-control-height); padding-block: 0; padding-inline: var(--sh-control-inset); font-size: var(--sh-control-text); gap: calc(var(--sh-control-inset) / 2); border-radius: var(--sh-control-radius);`. This follows the Maison usage in the handoff; gap = inset / 2 is the glyph rule from the architect Glyphs section. Keep `font: inherit` before the new `font-size`.
- `input[type="text"], input[type="search"], select {` (`:192`): the same, minus `gap`.
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
- `src/ui/styles.css` `.segmented button {` (`:867`): `min-block-size: calc(var(--sh-control-height) - 6px); padding-block: 0; padding-inline: var(--sh-control-inset); font-size: var(--sh-control-text); border-radius: var(--sh-radius-inset);`. The group's 2px padding and 1px border on each side make the whole group one control height.
- `.segmented.seg-sm button` (`:881`) takes the chip row: `min-block-size: var(--sh-chip-height); padding-block: 0; padding-inline: var(--sh-chip-inset); font-size: var(--sh-chip-text);`.
- `.canvas-seg button` (`:882`) and `.app-header .section-seg button` (`:1340`) take `padding-block: 0; padding-inline: calc(var(--sh-control-inset) * 2);`, which keeps their wider stance.
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
- `src/ui/styles.css` `.chip {` (`:787`): `min-block-size: var(--sh-chip-height); padding-block: 0; padding-inline: var(--sh-chip-inset); font-size: var(--sh-chip-text); gap: calc(var(--sh-chip-inset) / 2);`. `border-radius: 999px` stays, because the shell chip is a pill by design.
- Switch (Maison `choice.mjs:21-22`, via the architect Carry forward):
  - Remove `--ctl-thumb: 15px` from the `:root` block (`:51`). Declare `--ctl-thumb: calc(var(--sh-control-icon) - 4px);` in the `ultimate-tokens` alias block instead: a 2px edge on each side, and `--sh-control-icon` resolves only on the host.
  - `.toggle .track` (`:953`) becomes `inline-size: calc(1.75 * var(--sh-control-icon)); block-size: var(--sh-control-icon);` with its px width/height removed. `.toggle.on .track::after` (`:963`) translates by `calc(0.75 * var(--sh-control-icon))`. The range thumbs (`:935`, `:940`) keep reading `--ctl-thumb`.
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
- `src/ui/icons.js` `icon(name, opts = {})` (`:44`): keep the `width="${size}" height="${size}"` attributes on the `<svg>` (`:51`) as the no-CSS fallback and because the shim reads attributes. Add an inline style on the same `<svg>`: `width:var(--sh-control-icon, ${size}px);height:var(--sh-control-icon, ${size}px)`. Every shell icon then sizes from the control icon role (handoff Decision 4, manifest a36), with the per-call literal as fallback.
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
  - The axes `data-tier`, `data-scale`, `data-size` and `data-radius`, nearest ancestor wins; the cell primitives `--size-{tier}-{scale}-{size}-{field}`; the roles `--control-height/-inset/-text/-icon/-caption-text/-icon-ratio`, `--chip-height/-inset/-text` and `--radius-control/-mark/-inset/-card`, which an export prefix never renames (step 2 prefix contract).
  - The glyph rules: an indicator is text-sized inside the icon box; the icon-to-label gap is inset / 2; badge height is height - inset, with `--radius-inset`; an icon-only control is a height square.
  - That the `--size-{step}-caret/-gap/-padding-*` tokens, the `.control-{step}` classes, `rampContrast`, `linear4` and `baseHeight` are gone, with a migration note. Today they appear at `SKILL.md:59` and `:87`, `references/responsive.md:18` and `scripts/dimension-parity.mjs:17-18`.
- `scripts/dimension-parity.mjs` (in that skill) re-targets the 27 cells and the roles against the engine. `test/plugin/geometry-tokens.mjs` stays its runner.
- `test/smoke/smoke.mjs`: add a resolver block that loads `geomTokensCSS(geomScale({}))` into a page and renders the 108 nested cases, 27 cells x 4 radius modes, in Maison's spec shape (`tests/first-wave-foundation.spec.js:60`), asserting that `getComputedStyle` of `--control-height` and `--radius-control` equals the engine's cell values. The `.geom-ctl` box check at `:253` keeps its 18 to 80 px window (the first light-column cell is content-sm-sm, 28px). This runs only in CI (`build-test`); locally only syntax is checked, so this step does not prove the runtime behavior.
- The untagged test run below is not a guard: it is red at this step's start by design and must be green after it.
### Acceptance criteria
- (red) `grep -qF 'data-radius' test/smoke/smoke.mjs && grep -qF -- '--radius-control' test/smoke/smoke.mjs`
- (guard) `node --check test/smoke/smoke.mjs`
- (red) `grep -qF -- '--control-height' plugin/ultimate-tokens/skills/geometry-tokens/SKILL.md`
- (red) `! grep -rqE -- '--size-[a-z0-9-]+-(caret|gap|padding-wide)' plugin/ultimate-tokens/skills/geometry-tokens && ! grep -rqE 'rampContrast|linear4|baseHeight|RAMP_LADDER' plugin/ultimate-tokens/skills/geometry-tokens`
- `node test/plugin/geometry-tokens.mjs`

## Step 13: Records: ADR, skills and docs
level: L3
### Read first
- `docs/references/AGENTS.md`
- `docs/references/typography/AGENTS.md`
### Do
Depends on: steps 1 to 12 (the records cite the final names).
- `docs/references/decision-records.md`: add `## ADR-031: Geometry adopts the Maison ui-kit ladder` (the next free number after T-0014's ADR-030; if another lane took 031 first, the next free one; the check greps the title), placed before `## Quick map` (`:967` before T-0014's ADR). It records the decision, the user decisions of 2026-10-07 (option B on U1, shell rides with the engine, retirements, `--control-*` names, schema v9 after T-0014) and the Maison-to-ours name map:
  - `--g-height/-inset/-text/-icon/-caption-text/-icon-height-ratio` to `--control-height/-inset/-text/-icon/-caption-text/-icon-ratio`; `--g-chip-height/-inset/-text` to `--chip-*`; `--r-control/-mark/-inset/-card` to `--radius-*`; `--m-cell-*`, `--m-scale-*`, `--m-size-*`, `--r-k-text/-height` to `--ctx-cell-*`, `--ctx-scale-*`, `--ctx-size-*`, `--ctx-radius-text/-height`.
  - The prefix contract (an export prefix renames primitives and container ladders, never roles or `--ctx-*`), `--g-micro-*` scoped out, attribute names and radius ids kept verbatim, the Figma `control/` per-mode ALIAS variables.
- Repair to the new system in the same change: `.claude/skills/geometry-system/` (SKILL.md and references); `.claude/skills/type-scale/` (the UI text table, the one-step UI voices, and `references/best-practices.md:77`'s 51-step count, now 41); `.claude/skills/building-editor-sections/` (the shell axes and the `--sh-*` aliases); `.claude/skills/maintaining-brand-kit-mcp/` (the `get_geometry` shape); `.claude/skills/maintaining-figma-plugins/` (the cell variables, `control/` aliases, `geometryCellOrder` and the legacy height table); `docs/references/geometry/README.md`; `docs/references/typography/README.md` (`:52`'s 51 steps, now 41, and the UI voices) and `intended-use.md`; `mcp/README.md`.
- No mention of `baseHeight`, `rampContrast`, `linear4`, `CONTROL_FONT` or `GAP_UNIT` survives in those files, except as history inside the ADR.
- The untagged test run below is not a guard: it must be green after this step.
### Acceptance criteria
- (red) `grep -qF 'Geometry adopts the Maison ui-kit ladder' docs/references/decision-records.md && grep -qF -- '--g-chip-height' docs/references/decision-records.md`
- (red) `awk '/Geometry adopts the Maison ui-kit ladder/{if(!a)a=NR} /^## Quick map/{q=NR} END{exit !(a && q && a < q)}' docs/references/decision-records.md`
- (red) `! grep -rqE 'baseHeight|rampContrast|linear4|CONTROL_FONT|GAP_UNIT' .claude/skills/geometry-system docs/references/geometry/README.md mcp/README.md`
- (red) `grep -rqF 'uiText' .claude/skills/type-scale && ! grep -rqF '51 steps' .claude/skills/type-scale docs/references/typography`
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
- `npm run gate:sweeps` is not run: every sweep in it gates the color engine (`package.json` `gate:sweeps`: corpus-tonal, corpus-anchor, sweep-prime, corpus-reset, corpus-contrast, mode-isolation, even-dips, chroma-envelope), which this plan does not touch.
- `npm run smoke` and `panda-smoke` run only in CI; say so in the summary. No push, PR or issue.
### Acceptance criteria
- (guard) `npm test`
- (guard) `npm run build`
- (red) `! git grep -qE 'RAMP_LADDER|rampContrast|GEOMETRY_TREATMENTS|LADDER_SIZE_KEYS|CONTROL_FONT|GAP_UNIT' -- src scripts mcp figma plugin ':!src/ui/persist.js' ':!src/ui/describe-mcp-assets.js' ':!figma/plugin/ui.html'`
- (guard) `node test/repo/em-dash.mjs`

## Assumptions
- resolved by the user on 2026-10-07 (option B, one MD step each, handoff `## Plan review`): U1, what UI-control and UI-widget emit once their six rows retire. Each keeps one derived `MD` step (14 and 12); the other five steps' variables and text styles deprecate id-preserving.
- The build base is T-0014's landed tree: verified by reading `plan/prime-anchor-follows-chroma` (88a6313e) plus its uncommitted step 3 diff in a detached snapshot; `CURRENT_SCHEMA_VERSION = 8` at `src/ui/persist.js:366`, `RENAME_MAPS` at `:385` with a `version: 8` entry (`foldGroups`, `vibrancyDefault`), runner `applyRenameMaps` at `:491`. T-0017 takes v9 (handoff user ruling); the schema criterion is the literal 9, so it needs no `$SDLC_BASE_SHA`.
- T-0014 does not change `src/engine/geometry.mjs`, `src/engine/type.mjs`, `src/ui/styles.css`, `src/ui/app.js`, `src/ui/icons.js`, `src/ui/overlays/settings.js`, `src/ui/sections/geometry.js`, `src/ui/sections/typography.js`, the figma binder or `figma/plugin/code.js`: verified by `git diff --stat main plan/prime-anchor-follows-chroma` and the uncommitted file list. It does change `src/ui/model.mjs`, `src/ui/persist.js`, `src/ui/overlays/drawer.js`, `mcp/brand-kit-core.mjs`, `test/ui/headless-boot.mjs`, `test/ui/model.mjs`, `test/ui/persist.mjs`, `test/ui/shell.mjs`, `test/figma/plugin.mjs`, `test/mcp/brand-kit.mjs`, `test/mcp/describe-kit-core.mjs` and `test/engine/exports.mjs`; steps that touch them say to add to T-0014's edits.
- The Figma per-mode alias contract (`{ type: "ALIAS", values: { [mode]: "<target>" } }`): verified that `validateModeInterchange` rejects it today (`figma/binder/mode-apply-plan.mjs:36`, `:134`), that `modeApplyPlan` passes values through (`:85-105`), that `valueChanged` and `valueChangedVM` already return true for ALIAS (`:466`, `figma/plugin/code.js:677`), that `applyFloatPlans` writes only finite numbers today (`code.js:1767`), and that the existing font-primitives path writes literals then aliases with `createVariableAlias` (`code.js:955`, `:1068-1076`).
- The tiebreak lives only in the geometry path: verified that `nearestStepByHeight` ties break toward insertion order (`mode-apply-plan.mjs:205-216`), that type callers depend on it (`:310`, `:333`, `code.js:567`, `:586`), and that `expandGeometryAliasMap` and `nearestStepByHeightVM` are spliced into the binder from `FLOAT_FNS` (`scripts/gen-figma-binder-code.mjs:44-51`).
- renameparity already covers the field map's three copies: verified at `test/figma/binder.mjs:810-850` (`CANON_RENAME` holds `GEOMETRY_FIELD_RENAME_MAP`; the binder and flagship rows list it).
- The legacy default heights are XS 20, SM 24, MD 28, LG 36, XL 48, 2XL 64: verified by running today's `geomScale({})` (comfortable, base 28). Treatment heights, radius styles and space bases from `src/engine/geometry.mjs:61-69`.
- Cells compose text from the base type scale at every mode, and a mode changes only the scale axis: the accepted architect decision 5 (27 mode-constant Figma cells).
- `uiText` scales by the kit's bodyBase factor on a half-pixel grid and ignores modeFactor: `src/ui/model.mjs:123-124` (UI voices frozen at Desktop on Tablet and Mobile) and the CSV's half grid (`14,3,7.5,8`).
- `sizeAnchor(scale, "MD")` is the kit default cell (product-md-md at defaults) while the Figma height match sends a live MD 28 to product-sm-md: they serve different readers (previews versus live-file bindings), per the architect Approach para 2 and Carry forward.
- Maison data: CSV, `definition.mjs`, `geometry.ts` (sha256 `8d0766...8136`) and `scripts/generate.mjs` are unchanged from `ca56f2d9` to HEAD `05d1c8c5`: verified by `git diff --stat ca56f2d9 HEAD` on those paths. Maison's control CSS reads `--control-height`/`--control-inset`/`--control-text` unprefixed (`src/foundation/control/control.mjs:10-13`).
- `src/ui/describe-mcp-assets.js` embeds `src/ui/model.mjs` and `src/ui/persist.js` (`scripts/gen-describe-mcp-assets.mjs:30-31`) and `figma/plugin/ui.html` bundles the app, so both keep persist.js's migration strings: verified by `git grep -lE rampContrast`, which lists them beside persist.js; steps 6 and 14 exclude them from the retired-symbol greps.
- The headless shim has `document.head` and `createElement` but `getElementById` always returns null (`test/ui/headless-boot.mjs:102-106`), so step 7 holds the roles style on the instance.
- The 51-step count has one code source, `test/ui/counts.mjs:20`, read by `test/ui/headless-boot.mjs` and `test/smoke/smoke.mjs`; the other copies are comments and messages, found by `git grep -nP '51[- ](step|steps)|all 51|\(51\)'` over src, test, scripts, mcp, figma, plugin, docs and `.claude/skills`.
- The `html:` SVG-chart count is 3 in `src/ui/sections/geometry.js`, 3 in typography.js, 6 in color.js (12, the CLAUDE.md figure): verified by `grep -cE 'html: '`.
- `npm test` took 168 s and `npm run build` 3.4 s at the 2026-10-07 base in a detached worktree (planner-L3-2 measured it; not re-timed on T-0014's tree). `guard timeout: 900` covers either with margin.
- `npm run smoke` runs only in CI: `.github/workflows/ci.yml:41` (`build-test`). No step proves pixels or the resolver cascade locally.

## Risks
- Long red stretch: `test/engine/geometry.mjs` and `test/engine/exports.mjs` may be red from step 1 until step 2, `test/ui/headless-boot.mjs` from step 2 until step 6, the ds/mcp tests until step 4, `test/figma/plugin.mjs` and `binder.mjs` until step 5, and `test/plugin/geometry-tokens.mjs` until step 12. Each step's Do names what it leaves red; `npm test` is only expected green at step 14. A builder that reads an earlier step's red as `inherited red` should be pointed at the Do.
- Cites were read in T-0014's tree before its steps 3 and 4 committed. If T-0014 changes `src/ui/persist.js`, `src/ui/model.mjs`, `test/ui/headless-boot.mjs` or `test/ui/shell.mjs` again before it lands, line numbers in steps 1, 3, 6 and 7 shift; every criterion is line-free, so only the Do pointers go stale.
- If T-0014's landed `CURRENT_SCHEMA_VERSION` is not 8 (or another lane takes 9 first), step 3's literal-9 criteria are wrong and the plan needs the schema number changed; the handoff rules v9.
- `src/ui/styles.css`, `src/ui/app.js`, `src/ui/overlays/settings.js` and `src/ui/sections/geometry.js` are also touched by T-0013, T-0016 and T-0015 work; merges will conflict. The shell checks are block-scoped greps, so a main sync keeps them meaningful.
- The shell resolver lives in `document.head`, so `--control-*`, `--chip-*`, `--radius-control/...`, `--ctx-*` and the `--size-*` primitives are global to an embedding page; a page that loads its own exported kit CSS shares those names (same values for the same kit; the later stylesheet wins).
- The shell grows: product-md-md is 32px against today's roughly 23px buttons, the round radius is 14px and every icon becomes 16px; only CI smoke screenshots show it.
- The Figma collection grows to 27 x 14 constant variables plus 9 x 14 alias variables per mode; apply time at that size is untested, and every apply rewrites all 126 alias variables because ALIAS values always count as changed (the existing policy).
- Users lose saved `tokenOverrides` and the treatments' density and gap feel; each loss is reported through DROPPED_KEYS, not preserved.
- The Maison repo is external and read only; if its CSV or `definition.mjs` changes, the vendored fixture and the consumer skill go stale until someone re-vendors them.
- Step 6's run criterion depends on the exact `(gml1)` info-line text the Do settles; a reworded line keeps the criterion red on a green boot, and the verifier should read the Do before calling that a code defect.
- This planner's probe worktree `.worktrees/tmp/planner-L3-geometry-maison-ladder-3/t14` (a detached checkout of `plan/prime-anchor-follows-chroma` with T-0014's uncommitted diff applied) and the lint copy under `.worktrees/tmp/planner-L3-geometry-maison-ladder-3/plan/` stay on disk: this role never deletes, so the conductor or `run.sh` removes them.
