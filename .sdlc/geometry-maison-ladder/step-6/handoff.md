## Task goal
Rebuild the Geometry system of ultimate-tokens on the Maison ui-kit geometry system (user decision 2026-10-07: "for the Geometry system, let's use the maison ui-kit system... we should name tokens according to our standards of course, but this is a standard system to follow for now"). Geometry's per-step text size still composes from the Type UI scale (project invariant).

## Step 6: Editor Geometry section on tier, scale and radius
level: L4
### Do
Depends on: steps 2 to 5. The headless boot also drives the ds-export bundle and the Figma apply plans, so it can only go green once steps 3 to 5 have landed. Pattern: the `building-editor-sections` skill (canvas header + `.canvas-scene` + left analysis cards + right inspector, lettered headless groups).
- `src/ui/sections/geometry.js`:
  - The inspector edits `doc.geometry.tier` (content, product, micro), `scale` (sm, md, lg), `radius` (default, round, sharp, pill) and `spaceBase` (4, 8) through `app.commit`. The treatment picker, base-height slider, ramp-contrast knob, linear-ladder toggle and per-cell height override editor retire; so do the `STANDARD_GEOM_RUNGS` baseHeight drop at `:28-30` and the `${base.baseHeight}px base` header at `:152`.
  - The canvas renders all 27 cells as live controls, in light and dark, from each cell's height, inset, text, icon and radiusControl: nine `.geom-spec-row` rows (tier x scale, in `orderedSizeNames` order), each holding three `.geom-spec-line` cells (size sm, md, lg). Each `.geom-spec-line` carries `data-cell="{tier}-{scale}-{size}"` and a `.geom-ctl` mock control; the kit default cell (`scale.cell.name`) is marked. So the light column has 27 `.geom-spec-line`, which `test/smoke/smoke.mjs:247` and the `(geo)` group count against `GEOM_SIZES`.
  - The left rail keeps its three `html:` SVG analysis charts (`h("div", { class: "an-svg", html: svg })`): the project CLAUDE.md ratifies 12 across the three sections, 3 of them here, so the count does not move.
  - The tokens table lists the 27 cells' fields from `orderedSizeNames`.
  - The mode editor writes `modes[].scale` with one sm/md/lg segmented control per mode. `_setActiveGeomBaseHeight(v)` is replaced by `_setActiveGeomScaleId(id)`, which writes the active mode's `scale`; `_activeGeomScale()` (`:188`) keeps returning the active mode's resolved scale.
  - Copy that cites the UI-control voice says per-cell text composes from Typography's height-indexed UI text table.
- `src/ui/overlays/drawer.js`, `src/ui/overlays/apply-gate.js`, `src/ui/app.js` (its `:45` import drops `GEOMETRY_TREATMENTS`): call sites move to the step 2 emitters and the step 3 model functions; no reader of `baseHeight`, `rampContrast`, `RAMP_LADDER` or `geomOverridesFor` remains. The drawer's Geometry CSS tab (`drawer.js:70`) previews `geomTokensCSS`; repoint `(mc9)` (`test/ui/headless-boot.mjs:823`) from `.control-` to `--control-height`.
- `test/ui/counts.mjs:21`: `export const GEOM_SIZES = 27;` with comment `(ladder cells, tier × scale × size)`.
- `test/ui/headless-boot.mjs`: rewrite the `(geo)` group (`:2679-2735`) for the new shape (the scale fields, the round-trip of `tier`/`scale`/`radius`, brandKit's `cells`, and `cells["product-md-md"].text === uc.MD.size` in place of the `sizes.MD.font` checks). Add groups `(gml1)` (the light column carries 27 distinct `data-cell` values, counted with the file's own tree-walk helpers), `(gml2)` (the inspector writes `doc.geometry.tier`, `scale` and `radius`) and `(gml3)` (`_setActiveGeomScaleId("lg")` writes `modes[].scale`).
  - After its assertions, `(gml1)` prints one info line with `console.log`, in the file's own idiom (the `(rst-corpus ...)` lines): two spaces, then `(gml1) N distinct Geometry cells render on the canvas`, N the measured count, interpolated. `ok()` records only failures, so the run criterion greps that line to prove the group ran and counted 27.
- `test/smoke/smoke.mjs` geometry block (`:243-264`): the section and mode assertions follow the new API: `_setActiveGeomScaleId("lg")` and `_activeGeomScale().scale === "lg"` replace `_setActiveGeomBaseHeight(40)` and `.baseHeight === 40`, the reset commit at `:262` writes `{ tier: "product", scale: "md", radius: "round", spaceBase: 4 }`, and the message at `:247` names the 27-cell ladder. Smoke runs only in CI (`.github/workflows/ci.yml:41`); this host checks syntax only.
- `test/ui/headless-boot.mjs` is red at this step's start because steps 2 to 5 changed the scale, doc and plan shapes; this step restores it.
### Acceptance criteria
- (red) `grep -qF 'data-cell' src/ui/sections/geometry.js`
- (red) `! grep -qE 'baseHeight|rampContrast|RAMP_LADDER|GEOMETRY_TREATMENTS|tokenOverrides' src/ui/sections/geometry.js`
- (red) `! grep -qE 'baseHeight|rampContrast|RAMP_LADDER|geomOverridesFor|GEOMETRY_TREATMENTS' src/ui/overlays/drawer.js src/ui/overlays/apply-gate.js src/ui/app.js`
- (red) `test "$(grep -cE '\(gml[1-3]\)' test/ui/headless-boot.mjs)" -ge 3`
- (red) `grep -qF 'GEOM_SIZES = 27;' test/ui/counts.mjs`
- (red) `! grep -qE '_setActiveGeomBaseHeight|baseHeight' test/smoke/smoke.mjs`
- (red) `! git grep -qE 'RAMP_LADDER|rampContrast|GEOMETRY_TREATMENTS|LADDER_SIZE_KEYS|geomOverridesFor' -- src scripts mcp ':!src/ui/persist.js' ':!src/ui/describe-mcp-assets.js'`
- `out=$(node test/ui/headless-boot.mjs) && printf '%s\n' "$out" | grep -qF '(gml1) 27 distinct Geometry cells render'`
- (guard) `node test/ui/zip.mjs`
- (guard) `test "$(grep -cE 'html: ' src/ui/sections/geometry.js)" -eq 3`
- (guard) `node --check test/smoke/smoke.mjs`

## Notes
Plan review 3 finding, user-ruled into this step: retiring treatments removes `_pickGeomTreatment` from `src/ui/app.js`, but the `(at)` advancedTreatments group in `test/ui/headless-boot.mjs` (about :2947-2962) calls it and asserts `doc.geometry.treatment`, so the boot would throw. Rewrite the `(at)` group to the tier/scale/radius picks. Decision 2 default: tier, scale and radius picks stay Pro-gated through the existing `_treatmentBlocked` path (keep the same Pro gate the retired select had, and update the flag copy in `src/ui/app-helpers.mjs:187` and `src/engine/flags.js` to match); do not leave the gate half-removed. The `(red)` grep on `app.js` for `GEOMETRY_TREATMENTS` and `baseHeight` still applies.
