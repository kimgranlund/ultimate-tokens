<!-- role=builder level=L4 model=opus effort=xhigh -->
## Status
done

## Changes
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/src/ui/sections/geometry.js` (rewritten):
  - Canvas: nine `.geom-spec-row` rows (tier x scale, in `orderedSizeNames` order), three `.geom-spec-line[data-cell]` each, every cell a `.geom-ctl` drawn from height, inset, text, icon and radiusControl, in light and dark. The kit cell (`scale.cell.name`) carries `.is-kit`.
  - Inspector, Ladder tab (id stays `ramp`): `tier`, `scale` and `radius` selects (`data-fk gi:{key}`, locked options labelled " · Pro") write through `app._pickGeomAxis`. A 4/8 segmented control writes `spaceBase` through `_setGeomSpaceBase`. A read-only list shows the kit tier's nine cells.
  - Mode editor: one sm/md/lg segmented control (`gmode-scale:{id}`) per mode. New `_setActiveGeomScaleId(id)` writes the active mode's `modes[].scale`, materializing a Standard-set rung first. On Base or Compare it routes through the gated `_pickGeomAxis("scale", id)`. `_activeGeomScale()` is unchanged.
  - Tokens table: 27 rows (`orderedSizeNames`) x 14 fields, read-only, kit row marked.
  - Left rail: three `html:` SVG charts (centering law on the kit cell, icon and text vs height, the three tier ladders) plus the composition card. Copy says per-cell text composes from Typography's height-indexed UI text table.
  - Retired: treatment select, base-height slider, ramp-contrast slider, linear-ladder toggle, per-cell height overrides, `_geomTokenColumns`, the `STANDARD_GEOM_RUNGS` drop and the `${base.baseHeight}px base` header.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/src/ui/app.js`:
  - The `:45` import drops `GEOMETRY_TREATMENTS`.
  - `_pickGeomTreatment` is replaced by `_pickGeomAxis(key, id)` for tier, scale and radius, gated by `_treatmentBlocked(id, DEFAULT_GEOMETRY[key])`.
  - `this.geomSize` is removed.
  - The gate comment and the toast now say "option" instead of "treatment".
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/src/ui/overlays/drawer.js`: comments only, plus the zip README `geometry/` row. Call sites already used the step 2 emitters and step 3 model functions.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/src/ui/app-helpers.mjs`: the `advancedTreatments` dev-toggle description now names the Geometry tier, scale and radius picks.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/src/engine/flags.js`: two comment lines on what `advancedTreatments` gates.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/test/ui/counts.mjs`: `export const GEOM_SIZES = 27;` with comment `(ladder cells, tier × scale × size)`.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/test/ui/headless-boot.mjs`:
  - Geometry block rewritten: `(geo)`, `(geo-palette)`, `(geo-row)`, `(geo-tok)`, `(geo-bp)`, `(geo-cmp)`. Includes the round-trip of tier, scale, radius and spaceBase, brandKit `cells`, and `cells["product-md-md"].text === uc.MD.size` at bodyBase 20.
  - New groups `(gml1)`, `(gml2)` and `(gml3)`. `(gml1)` prints `  (gml1) N distinct Geometry cells render on the canvas`.
  - `(at)` rewritten to the tier, scale and radius picks.
  - `(mc9)` checks for `--control-height`.
  - Groups outside the named ones that also broke on the new shapes: `(ee)` sizes-file regex, `(rxr4)`, `(std)` geometry half, `(na)`, and the `(ty-fig)` value-complete check.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/test/smoke/smoke.mjs`: the geometry block calls `_setActiveGeomScaleId("lg")` and checks `_activeGeomScale().scale === "lg"`. The reset commit is `{ tier: "product", scale: "md", radius: "round", spaceBase: 4 }`, and the messages and comments name the 27-cell ladder.

## Checks
- All 7 `(red)` criteria, run verbatim: PASS.
- `out=$(node test/ui/headless-boot.mjs) && printf '%s\n' "$out" | grep -qF '(gml1) 27 distinct Geometry cells render'`: PASS (exit 0, `HEADLESS BOOT PASS`).
- (guard) `node test/ui/zip.mjs`: PASS.
- (guard) `test "$(grep -cE 'html: ' src/ui/sections/geometry.js)" -eq 3`: PASS.
- (guard) `node --check test/smoke/smoke.mjs`: PASS.
- Mutation M1, `data-cell` removed from the canvas cells: headless-boot exit 1, and `(gml1)`, `(geo)` and `(geo-cmp)` failed. Restored, confirmed with `cmp`.
- Mutation M2, `_setActiveGeomScaleId` writing the base scale on a breakpoint: headless-boot exit 1, and `(gml3)` failed 3 times plus `(geo-tok)`. Restored, confirmed with `cmp`.
- `node test/repo/em-dash.mjs`: clean.
- Passed: `test/engine/flags.mjs`, `test/repo/branding.mjs`, `test/repo/svg-rules.mjs`, `test/repo/doc-mutation-lane.mjs`, `test/ui/model.mjs`, `test/ui/persist.mjs`.
- `node test/repo/citations.mjs`: red. It is red at base `0b5e4551` too (5 failures, run in a throwaway worktree that has since been removed). At head it has 8 failures; see Notes.
- `npm test` and `npm run smoke` were not run. Smoke runs in CI only; its syntax was checked.

## Notes
- `src/ui/overlays/apply-gate.js` is on the handoff's file list. I read it and it needed no change: its `geomTokensFigmaModes(this._geomScaleFor("base"), this._geomModeScales(), this._geomBaseOpts())` call already uses the step 2 and 3 API, and none of the forbidden names appear in it.
- `test/repo/citations.mjs` is not one of this step's criteria, but this step makes it worse:
  - One record this step invalidated directly: `.claude/skills/building-editor-sections/SKILL.md:80` names `setGeomTokenOverride`, which this step retired.
  - The rest is line-number drift in docs that cite `sections/geometry.js` or `app.js`: `docs/references/component-inventory.md`, `docs/specs/app-shell.md` and `docs/reports/2026-08-20-reactivity/*`.
  - All of these files are outside this step. Step 13 (Records: ADR, skills and docs) names `citations.mjs` and `building-editor-sections`.
- `npm test` was not run because its generators rewrite files outside this step. The committed artifact that embeds the app, `figma/plugin/ui.html` (from `gen:figma-ui`, built from the `scripts/bundle.mjs` output), is now stale against `sections/geometry.js` and `app.js`. Step 14 runs `npm test`.
- `.geom-spec-row` has no rule in `src/ui/styles.css`, which is outside this step. The three-column grid is an inline style on each row.
- The `(ty-fig)` assertion required every plan variable to be FLOAT. Step 2 added per-mode `control/` ALIAS variables, so it now accepts FLOAT (finite) or ALIAS (naming a `size/` FLOAT in the plan), the same rule as `test/figma/mode-apply.mjs:31`. This is a test-shape update, not a code change.
- Retired test groups, because they exercised retired levers: `(geo-ramp)`, `(gsz)`, `(geo-slider-automat)`, `(geo-tok-automat)`, `(geo-tok-ov)`, `(geo-tok-clamp)`, `(geo-tok-orphan)`. `(gml3)` now covers materialize-on-first-write.
- The handoff's line numbers had drifted: `(geo)` was at :2648-2871 and `(at)` at :2916.
- Design choices the handoff left open:
  - The inspector's three selects always edit the doc base. The per-mode scale lives in the mode editor.
  - Per-mode scale picks are not Pro-gated; the retired base-height slider was not gated either.
  - The canvas glyph-to-label gap is `inset / 2`. It is a mock spacing only, not a token.
