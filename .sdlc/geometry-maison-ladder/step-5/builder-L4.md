<!-- role=builder level=L4 model=opus effort=xhigh -->
## Status
done

## Changes
- figma/binder/migrations.mjs: `GEOMETRY_FIELD_RENAME_MAP` now holds the exact new literal, with keys in the order the handoff gives. The header comment is rewritten to say the targets are cell fields, that `font` now maps to `text`, and that fields with no target deprecate with their id kept. `kebabWaveOldName` now returns null for a `size/{cell}/*` name before it looks anything up in `OLD_FIELD`, with a one-line comment giving the reason. `OLD_FIELD`, `OLD_VOICE` and `OLD_PROP` are untouched.
- figma/binder/mode-apply-plan.mjs:
  - New pure `export function geometryCellOrder`, placed beside `nearestStepByHeight`. Cells sort by tier (product, content, micro), then size, the 3rd name segment (md, sm, lg), then scale, the 2nd segment (md, sm, lg). Keys that are not cells come after all cells, in their original order.
  - `geometrySizeAliasMap` now calls `nearestStepByHeight(h, geometryCellOrder(currentStepHeights))`, and its header example is updated.
  - `nearestStepByHeight` is byte-identical.
- figma/plugin/code.js:
  - Added `geometryCellOrderVM` as a hand mirror. `expandGeometryAliasMap` calls it at the same point where the module calls `geometryCellOrder`.
  - The `GEOMETRY_FIELD_RENAME_MAP` literal is copied byte-for-byte.
  - In `applyFloatPlans`, the literal-write loop now skips `type === "ALIAS"`. A second pass then creates each ALIAS variable as `"FLOAT"` when it is absent and writes `createVariableAlias(byName[pair.value])` for every mode. A missing target is skipped. Each ALIAS variable is added to `current` and to the variable count like a literal.
  - Two out-of-date comment examples updated.
- figma/binder/figma-semantic-binder/code.js: one hand edit, the `GEOMETRY_FIELD_RENAME_MAP` literal and its two comment lines. Every other change is output of `npm run gen:figma-assets`, which spliced in `geometryCellOrderVM` and the new `applyFloatPlans`.
- scripts/gen-figma-binder-code.mjs: `"geometryCellOrderVM"` added to `FLOAT_FNS`.
- src/ui/figma-plugin-assets.js: output of `npm run gen:figma-assets`.
- test/figma/plugin.mjs:
  - Imports `geometryCellOrder` and `geometryScale`, and loads `geometryCellOrderVM` from code.js.
  - libraryparity now compares `geometryCellOrder` with `geometryCellOrderVM` over 4 cases, including key order.
  - The field-bridge check now expects `size/xs/padding` to map to `size/xs/inset`.
  - New groups `legacy-cell-map` and `geom-alias-apply`, both added to `DECLARED`.
  - The Geometry half of `librarygrammar` is rebuilt on `GEOM.geomScale({})`. It expects:
    - 36 aliases, including `size/xs/padding` to `size/product-sm-sm/inset`, with a check that the live value is a real alias.
    - 18 deprecates, each ending in `/caret`, `/edgePadding` or `/gap`.
  - Its comments are updated to match.
- test/figma/binder.mjs: `librarygeom` now reads `size/product-md-sm/height` and `size/content-lg-lg/icon`, and its header and `OLD_STEPS` comments give the new targets. Two removal checks were loosened (see Notes).
- test/figma/migrations.mjs:
  - The interchange is built from `G.geomScale({})`.
  - `shouldCover` is now the `type/` names plus any `size/` name whose step is not a cell.
  - Added a check that all 378 cell names map to null, and the two frozen-table spot checks.
  - The header comment and PASS line say cells are excluded by design.

## Checks
- AC1, the `GEOMETRY_FIELD_RENAME_MAP` node one-liner: exit 0.
- AC2, the `kebabWaveOldName` node one-liner: exit 0.
- AC3 (guard), the grep for the frozen `OLD_FIELD` line: exit 0.
- AC4, the `geometrySizeAliasMap` tiebreak node one-liner: exit 0.
- AC5, the `geometryCellOrder` key-order node one-liner: exit 0.
- AC6 (guard), the `nearestStepByHeight` insertion-order tie: exit 0.
- AC7, the grep loop over both code.js files and the generator: exit 0.
- AC8, grep for `legacy-cell-map` and `geom-alias-apply` in plugin.mjs: exit 0.
- AC9, `size/product-sm-sm/inset` present and `size/xs/padding-wide` absent in plugin.mjs: exit 0.
- AC10, grep for `size/product-md-sm/height` and `size/content-lg-lg/icon` in binder.mjs: exit 0.
- AC11, `node test/figma/plugin.mjs`: exit 0, PASS. floatapply, readfloat, libraryparity, legacy-cell-map, geom-alias-apply, librarygrammar and report-static all pass.
- AC12, `for t in test/figma/binder.mjs test/figma/migrations.mjs test/figma/live-diff.mjs; do node "$t" || exit 1; done`: exit 0.
- Mutation check, restored afterwards:
  - Removing `geometryCellOrder` from `geometrySizeAliasMap` turns `legacy-cell-map` red ("sent size/XS/height to size/micro-lg-lg/height").
  - Writing a plain number instead of the alias in the ALIAS pass turns `geom-alias-apply` red.
- `npm test` in the step tree: exit 1, 3 of 54 files failed:
  - ui/headless-boot.mjs: geometry.js imports `GEOMETRY_TREATMENTS`, which the engine no longer exports.
  - plugin/geometry-tokens.mjs: the consumer skill has drifted from the engine.
  - repo/citations.mjs: 5 citation gate failures.
- `npm test` at base 2a30ac73, in a throwaway worktree: exit 1, 6 of 54 files failed. They are the same three plus figma/plugin.mjs, figma/binder.mjs and figma/migrations.mjs, which this step turns green. The failure lines from the two runs are identical. All three remaining failures are in files outside this step.
- `node test/repo/em-dash.mjs`: exit 0.

## Notes
- Handoff deviation: the Do says librarygeom's "0-removal and idempotent second-run checks hold unchanged". They did not hold.
  - Two checks in `test/figma/binder.mjs` compared names exactly: librarygeom's `stillThere` (was `:531`) and libraryidem's `oldPresent()` (was `:603`, read at `:606` and `:616`).
  - 5 of the 10 fixture FIELDS now deprecate by design and get renamed under `_deprecated/`: caret, icon-gap, padding-wide and the two compact pads. So both checks found only 15 of 30 old names after the code changes.
  - A one-off diagnostic, since removed, showed all 15 missing names present as `_deprecated/<name>`. None were removed.
  - Both checks now also accept the `_deprecated/` rename, using the same form as librarygeom's own second-run check (`:560`). The handoff does not mention libraryidem; this is its only edit.
- `figma/plugin/ui.html`: `npm test` regenerates it, and I restored it because this step does not own the file.
  - It was already out of date at base: regenerating at 2a30ac73 with no other change takes it from 4318860 to 4297837 bytes. This step adds about 3.2 KB on top.
  - The committed `ui.html` stays behind `figma-plugin-assets.js` until a later step or the lander runs `npm run build`.
- `geom-alias-apply` builds the default kit's Geometry plan as `modeApplyPlan(GEOM.geomTokensFigmaModes(geometryScale(defaultDocument()), []))`. Its base mode is `"Base"`, not the `Desktop` base name the app makes up when a doc has no modes. The asserted alias pair does not depend on the mode name.
- `legacy-cell-map` reads the 27 heights from the default plan, asserts they are in name-sorted order, and compares the result with a hand-written table. It also requires `expandGeometryAliasMap` to return exactly what `geometrySizeAliasMap` returns for the same inputs.
- The `GEOM.geomScale({ treatment: "comfortable", baseHeight: 28 })` calls in floatapply and binder.mjs are unchanged; the handoff only rewrites librarygrammar and migrations.mjs.
