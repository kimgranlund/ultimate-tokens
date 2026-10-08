<!-- role=verifier level=L3 model=fable effort=xhigh -->
## Verdict
pass

## Criteria
- (red) `grep -qF 'data-cell' src/ui/sections/geometry.js`: pass. Evidence: exit 0 at head; exit 1 in the throwaway worktree at base 0b5e4551. `src/ui/sections/geometry.js:396` sets `"data-cell": name` on every `.geom-spec-line`.
- (red) `! grep -qE 'baseHeight|rampContrast|RAMP_LADDER|GEOMETRY_TREATMENTS|tokenOverrides' src/ui/sections/geometry.js`: pass. Evidence: exit 0 at head; exit 1 at base.
- (red) `! grep -qE 'baseHeight|rampContrast|RAMP_LADDER|geomOverridesFor|GEOMETRY_TREATMENTS' src/ui/overlays/drawer.js src/ui/overlays/apply-gate.js src/ui/app.js`: pass. Evidence: exit 0 at head; exit 1 at base. `src/ui/app.js:45` import no longer names `GEOMETRY_TREATMENTS`; `apply-gate.js` needed no change (already on `geomTokensFigmaModes(this._geomScaleFor("base"), ...)`).
- (red) `test "$(grep -cE '\(gml[1-3]\)' test/ui/headless-boot.mjs)" -ge 3`: pass. Evidence: count 19 at head, exit 0; exit 1 at base. Groups at `test/ui/headless-boot.mjs:2713-2757`: `(gml1)` counts `data-cell` with the file's `walk(colCol(0), ...)` helper and prints the info line at `:2722`; `(gml2)` dispatches `change` on the `gi:tier`/`gi:scale`/`gi:radius` selects and asserts `doc.geometry.tier/scale/radius`; `(gml3)` calls `_setActiveGeomScaleId("lg")` on `std-tablet` and asserts `modes[].scale`.
- (red) `grep -qF 'GEOM_SIZES = 27;' test/ui/counts.mjs`: pass. Evidence: exit 0 at head (`test/ui/counts.mjs:21`, comment `(ladder cells, tier × scale × size)`); exit 1 at base. Importers `test/smoke/smoke.mjs:16,247` and `test/ui/headless-boot.mjs:12` both consume the new value; headless run observed green.
- (red) `! grep -qE '_setActiveGeomBaseHeight|baseHeight' test/smoke/smoke.mjs`: pass. Evidence: exit 0 at head; exit 1 at base. `test/smoke/smoke.mjs:260-262` calls `_setActiveGeomScaleId("lg")`, asserts `_activeGeomScale().scale==="lg"`, resets with `{ tier: "product", scale: "md", radius: "round", spaceBase: 4 }`; `:247` names the 27-cell ladder. First `.geom-ctl` is content-sm-sm at height 28 (engine check: cell heights 12 to 72), inside the smoke 18 to 80 bound.
- (red) `! git grep -qE 'RAMP_LADDER|rampContrast|GEOMETRY_TREATMENTS|LADDER_SIZE_KEYS|geomOverridesFor' -- src scripts mcp ':!src/ui/persist.js' ':!src/ui/describe-mcp-assets.js'`: pass. Evidence: exit 0 at head; exit 1 at base.
- `out=$(node test/ui/headless-boot.mjs) && printf '%s\n' "$out" | grep -qF '(gml1) 27 distinct Geometry cells render'`: pass. Evidence: run verbatim, exit 0; output contains `  (gml1) 27 distinct Geometry cells render on the canvas` and ends `HEADLESS BOOT PASS, all Phase-3 interaction assertions hold`. At base the same command exits 1 (the boot throws on import) with no `(gml1)` line, so the check bites. The run also covers the Do items that are runtime behavior: `(geo)` nine `.geom-spec-row` rows of three, kit cell `product-md-md` marked once per column, `cells["product-md-md"].text === uc.MD.size` at bodyBase 20 (`:2708`), brandKit `cells`, the tier/scale/radius/spaceBase persist round-trip, `(mc9)` at `:823` now greps `--control-height` (engine check: `geomTokensCSS` emits `--control-height`, no `.control-`), and the rewritten `(at)` group (`:2869-2893`) gates tier/scale/radius picks through `_treatmentBlocked` and routes to Account.
- (guard) `node test/ui/zip.mjs`: pass. Evidence: exit 0.
- (guard) `test "$(grep -cE 'html: ' src/ui/sections/geometry.js)" -eq 3`: pass. Evidence: count 3, exit 0 (`geomAnalysisCards` at `src/ui/sections/geometry.js:450-459` keeps three SVG charts plus the composition card).
- (guard) `node --check test/smoke/smoke.mjs`: pass. Evidence: exit 0.

Neighbors run: `node test/repo/em-dash.mjs` clean (1458 files), `node test/repo/branding.mjs` clean (1483 files). The one relaxed assertion, `(ty-fig)` accepting ALIAS beside FLOAT, matches the landed emitter contract at `figma/binder/mode-apply-plan.mjs:113-137` (Geometry's per-mode `control/` roles are ALIAS by design), so it is a shape update, not a mask. No remaining caller of `_pickGeomTreatment`, `_setActiveGeomBaseHeight`, `geomSize` or `setGeomTokenOverride` in `src`/`test`/`figma` source (only the generated `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js`, which `npm test` regenerates at step 14, and a comment at `src/ui/model.mjs:69`).

## Out of scope changes
None. `src/engine/flags.js` and `src/ui/app-helpers.mjs` carry the flag-copy update the handoff Notes call for.

## For the next attempt
None
