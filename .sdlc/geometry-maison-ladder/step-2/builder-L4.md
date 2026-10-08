<!-- role=builder level=L4 model=opus effort=xhigh -->
## Status
done

## Changes
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/test/engine/fixtures/maison-geometry-rows.json` (new): `source` (commit 05d1c8c5, sha256 8d0766...), 27 `rows`, 27 `resolverCells`, 25 `ladder` rows. Vendored with `git show 05d1c8c5:<path>` from ui-kit-maison, read only.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/src/engine/geometry.mjs` (rewritten): `TIERS`, `SCALES`, `SIZES`, `RADIUS_MODES`, `DEFAULT_GEOMETRY`, `LADDER_ROWS`, `ladderRow`, `cellHeight`, `LEGACY_SIZE_CELLS`, the 27-cell `geomScale`, anchors over cells, `geomResolverCSS`, and the CSS, size-only, breakpoint, DTCG, Figma and Figma-modes emitters. The retired names are gone.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/figma/binder/mode-apply-plan.mjs`: `validateModeInterchange` accepts ALIAS when every mode's value names a literal-typed variable in the same collection (one hop), and reports a bad target with the handoff's message. Updated the header and `valueChanged` comments.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/test/engine/geometry.mjs` (rewritten): groups `maison-ladder`, `anatomy`, `radius-modes`, `anchors`, `emitters` (with the prefix contract) and `container-identity`.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/test/figma/mode-apply.mjs`: the Geometry interchange is built from `geomScale({})` plus Desktop at `{ scale: "lg" }`. The value-complete check now covers FLOAT and ALIAS. Added a check that an ALIAS to a missing name is reported. Three more blocks (base lines 53, 58 and 71, now lines 61, 66 and 79) built geometry from `{ treatment, baseHeight }`, which now resolves to the default kit, so they use `{ scale }` configs. The merge back-fill assertions moved from the retired `size/md/height` to `control/product/md/height`.

## Checks
- C1 fixture lengths and sha256, plus `grep -qF 'maison-ladder' test/engine/geometry.mjs`: exit 0
- C2 27 cells, anchors, product-md-md fields: exit 0
- C3 radius modes on product-md-md: exit 0
- C4 CSS + DTCG + FigmaModes required strings present, no `caret|icon-gap|padding-wide|\.control-`: exit 0
- C5 378 `size/` + 126 `control/`, ALIAS Base/Mobile targets: exit 0
- C6 DTCG 27 cells, `content-lg-lg` height 72px: exit 0
- C7 resolver prefix contract (`--control-height:` bare, `var(--md-size-product-md-md-height)`, nothing `--md-` on roles or ctx): exit 0
- C8 validator accepts the real interchange, rejects `size/nope/height`, plan carries ALIAS: exit 0
- C9 `geomResolverCSS` exported, no retired names in the engine: exit 0
- `node test/engine/geometry.mjs`: PASS
- `node test/figma/mode-apply.mjs`: PASS
- All nine (red) commands were run verbatim from the handoff. C4 and C7 ran inside `( ... )` so their `exit 1` could not end the shell.
- Mutation checks, each restored afterwards and confirmed with `cmp`. Against the engine: compact rule `<=` changed to `<`, `max(0, ...)` dropped from radiusInset, pill k.height set to 0.4, and the ctx-cell `var()` made to ignore the prefix. `test/engine/geometry.mjs` killed all four. Against the validator: ALIAS target check removed, and the ALIAS type skip removed. `test/figma/mode-apply.mjs` killed both.
- `npm test` was not run. It regenerates `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js`, which are outside this step, and it is red by design until step 3 (handoff line 39).

## Notes
- Red by design, per the handoff's import-graph note: every module graph through `src/ui/model.mjs` or `src/engine/ds-export.js` fails to load until step 3. That covers the files of steps 3, 4, 5, 6 and 12. `test/engine/anchor.mjs` also loads `model.mjs` (`:1083-1098`), so it is red for the same reason even though the handoff list does not name it.
- `figma/binder/style-plan.mjs:285` says mode-apply-plan's `FIGMA_VAR_TYPES` / `validateModeInterchange` "never recognize" ALIAS. That comment is now stale. It is outside this step, so it was left for step 5.
- `size/{cell}/{field}` Figma variables are written from the base scale in every mode, so they are mode-constant by construction. Only `control/` (ALIAS) and the container groups vary per mode.
- Added an exported `ladderRow(height)`, which throws RangeError off-table, because no valid `(tier, scale, size)` reaches an off-table height. `cellHeight` throws RangeError on an unknown axis id.
- `geomTokensBreakpointCSS` now takes only `{ desktopMinWidth }`, since `--ctx-scale-*` indicators are never prefixed and carry no unit. Callers that still pass `unit` or `prefix` are unaffected.
- In the resolver, each sum-of-products term falls back to the kit-default literal (`var(--ctx-cell-sm-sm-height, 20px) * var(--ctx-scale-sm, 0) * ...`), as Maison's do. The `--ctx-cell-*` reassignments are bare `var(--{ns}-size-...)` with no fallback.
- Radius values derived from `iconRatio` keep full float precision in the emitted CSS (for example `--size-micro-sm-sm-radius-mark: 4.083333333333334px`), since the handoff leaves them unrounded.
