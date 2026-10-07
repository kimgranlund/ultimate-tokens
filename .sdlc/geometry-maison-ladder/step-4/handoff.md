## Task goal
Rebuild the Geometry system of ultimate-tokens on the Maison ui-kit geometry system (user decision 2026-10-07: "for the Geometry system, let's use the maison ui-kit system... we should name tokens according to our standards of course, but this is a standard system to follow for now"). Geometry's per-step text size still composes from the Type UI scale (project invariant).

## Step 4: MCP kit and generated exports read cells
level: L3
### Read first
- `docs/AGENTS.md`
### Do
Depends on: step 3 (`model.mjs` and `ds-export.js` load again and publish `cells`).
- `mcp/png-swatch-board.mjs` (`:181-198`): the mock controls size from `sizeAnchor(kit.geometry, "LG")` (product-lg-md), the thumbs from its `icon` and `radiusMark`. The inline ladder re-implementation (`lgKey`) retires.
- `mcp/brand-kit-core.mjs` (edit only these two lines): the `get_geometry` description (`:129`) and the instructions line (`:87`) name the tier x scale x size ladder, the 27 cells and the resolver roles instead of the XS to 2XL ramp. Run `npm run gen:mcp-assets` so `src/ui/mcp-assets.js` and `src/ui/describe-mcp-assets.js` follow. The latter embeds `src/ui/model.mjs` and `src/ui/persist.js` verbatim (`scripts/gen-describe-mcp-assets.mjs:30-31`), so it keeps persist.js's migration strings (`rampContrast`); the retired-symbol greps in steps 6 and 14 exclude it and `figma/plugin/ui.html` (the app bundle) for that reason, and check the sources directly.
- `scripts/smoke-panda.mjs` and `scripts/gen-adia-derived-exports.mjs` follow the new emitters and shape; the Adia comment at `:16` no longer cites `ramp`. Run `npm run gen:adia-exports`. `docs/reference/data/adia-*` must stay byte-identical because radii/space/borders are unchanged; if a byte moves, follow that file's own bump policy and record the reason in the builder summary.
- Contract dependents in this step: `test/engine/ds-gates.mjs`, `test/mcp/brand-kit.mjs` (its `:173` MD-font check, red since step 1, reads `cells["product-md-md"].text` and the `get_geometry` shape), `test/mcp/png-swatch-board.mjs`, `test/mcp/describe-kit-core.mjs`, `test/mcp/brand-kit-merged-core.mjs`, `test/engine/adia-derived-exports.mjs`. Keep T-0014's assertions in `brand-kit.mjs` and `describe-kit-core.mjs`.
- The panda smoke (`scripts/smoke-panda.mjs`) runs only in CI (`panda-smoke`); this host does not prove it.
- The untagged test runs below are not guards: they are red at this step's start by design and must be green after it.
### Acceptance criteria
- (red) `! grep -qE 'geometry\.sizes|lgKey' mcp/png-swatch-board.mjs`
- (red) `grep -qE 'name: "get_geometry".*tier' mcp/brand-kit-core.mjs`
- `node test/engine/ds-gates.mjs`
- `node test/mcp/brand-kit.mjs`
- `node test/mcp/png-swatch-board.mjs`
- `node test/mcp/describe-kit-core.mjs`
- `node test/mcp/brand-kit-merged-core.mjs`
- `node test/engine/adia-derived-exports.mjs`

## Notes
Plan review 3 finding, user-ruled into this step: `test/mcp/core.mjs` (its `get_geometry` block, `geo.sizes.MD.paddingNarrow` and `geo.sizes.MD.font === 15`) and `test/mcp/brand-kit.mjs:75-79` (the geometry `tokenOverrides` reaching `kit.geometry.sizes.MD.height`) go red once `sizes` becomes `cells` and UI-control MD becomes 14. This step owns rewriting both assertions to read cells, in addition to the contract dependents named above. Re-run both files before finishing.
