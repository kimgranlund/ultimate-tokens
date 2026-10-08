<!-- role=filer level=L1 model=sonnet effort=medium -->
## Warnings
None

## PR title
T-0026: Figma apply keeps legacy size/* variables and their bindings on an existing file

## PR body
### Summary
Fixes the data-loss path found in review of PR #813 (T-0017, Maison geometry ladder). The flagship defaults to classic mode (`libraryMode=false`), where the new `size/{cell}/*` names got no rename entry. The first Apply on an existing Figma file therefore pruned every old `size/{step}/*` and non-md `type/ui-control|ui-widget/*` variable, and every bound layer and text style detached. Classic mode now emits id-preserving renames from the old names to the cell names. It also fixes review minor 8: the 126 `control/` alias variables always reported "changed".

### Changes
- `figma/binder/migrations.mjs`: new `legacySizeRenames(currentNames, mdCell)`, with `LEGACY_SIZE_FIELDS` and frozen retired-UI-step tables, built on the engine's `LEGACY_SIZE_CELLS`.
  - It returns 240 entries.
  - `size/{step}/{field}` maps to `size/{cell}/{field}`. The md step takes the md cell first, so a clash resolves deterministically.
  - Fields with no target, and the retired `type/ui-control|ui-widget/{xs,sm,lg,xl,2xl}/*`, deprecate under `_deprecated/` with their ids kept. This follows the existing `size/{step}/font` precedent.
  - `OLD_FIELD`, `kebabWaveOldName` and `kebabWaveVarRenames` are untouched.
- `src/ui/overlays/apply-gate.js`:
  - `_figmaFloatPlans(opts)` merges the legacy map only when `opts.legacyRenames === true`. A bare call is unchanged.
  - `applyToFigma` reads `_libraryMode()` once, sends it as `libraryMode`, and passes `legacyRenames: !libraryMode`. Library mode does not get the map.
- `figma/binder/mode-apply-plan.mjs` and the `figma/plugin/code.js` mirror: `valueChanged` and `libraryModeReport` now compare an ALIAS variable by its live alias target name through a new `idToName` argument. An unchanged file reports 0 value updates. The `applyFloatPlans` call passes `idToName`. The `applyFontPrimitivesModes` call and `live-diff.mjs` are untouched.
- `docs/references/decision-records.md`: the ADR-032 Figma bullet now says the aliasing holds in published-library mode only. An `Amendment (2026-10-08)` bullet names `legacySizeRenames`.
- Regenerated, not hand-edited: `figma/binder/figma-semantic-binder/code.js`, `src/ui/figma-plugin-assets.js`, `figma/plugin/ui.html`.

### Verification
Step 1, `legacySizeRenames` and the classic wiring. The verifier passed it and ran each acceptance check at the pre-build HEAD in a throwaway worktree, where each went red.
- The 240-entry map, the spot pairs, the md-first clash and a null `mdCell`.
- Classic-mode apply over 120 legacy variables: with the renames, 0 ids are lost and `size/md/height` becomes `size/product-md-md/height`. Without the renames, all 120 ids are lost.
- The binder run on 36 legacy variables gives 36 lost without the renames and 0 with them.
- The posted apply message carries the map in classic mode only, and `libraryMode` is sent.
- New checks bite, shown by mutants:
  - Walking md last turned `test/figma/migrations.mjs` red.
  - Making every rename deprecate turned all three figma suites red.
  - Flipping the `legacyRenames` condition failed `(xl)` in `test/ui/headless-boot.mjs`.
- `OLD_FIELD` and `kebabWaveOldName` are byte-equal to base, and the diff touches only the eight allowed paths.
- The regenerated `ui.html` is `cmp`-identical to a fresh regen.

Step 2, the alias changed-count. The verifier passed it, and AC1 and AC3 were red at base 735f2bf3.
- `valueChanged`, `libraryModeReport` and VM parity cases pass.
- The mock re-apply of the merged default plan with `libraryMode: false` reports 0 `valueUpdates`.
- The builder's negative control (passing `undefined` for `idToName`) reported 126 `valueUpdates` and turned `test/figma/plugin.mjs` red. The verifier did not re-run that mutant. It checked the call site in the diff.
- `npm test` through `gate_lock` passed (all 54 test files, em-dash and citations included). `npm run build` passed.
- Step 2 wrote its checks into `test/figma/plugin.mjs` only.

## Changelog entry
Fixed: applying to an existing Figma file in classic mode no longer prunes the legacy `size/{step}/*` variables. They are renamed to their `size/{cell}/*` equivalents with ids preserved, so bound layers and text styles keep their bindings. Fields with no cell target, and the retired non-md `type/ui-control|ui-widget` steps, move under `_deprecated/` with ids kept. The gate's Geometry changed-count now reaches 0 on an unchanged file, because alias variables are compared by target. ADR-032 now says the aliasing is library-mode only.

## Follow-ups
- decide: when both the kebab name and its pre-wave spelling (`size/MD/height`) exist in one file, both map to the same target. The rename loop renames the first and skips the second, because the target already exists, so the second is pruned. Decide whether that is acceptable or needs a guard or a disclosure.
- note: no run exercised a live Figma file; checks used mock and VM plans only. Run the `figma-file-migration` skill against a real previously applied file to confirm the bindings survive.
- note: the retired `type/ui-control|ui-widget/{xs,sm,lg,xl,2xl}/*` variables deprecate with ids kept rather than map to `md`. Layers bound to them keep a deprecated variable, not an md one.
