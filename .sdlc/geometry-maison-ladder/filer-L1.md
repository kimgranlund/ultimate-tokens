<!-- role=filer level=L1 model=sonnet effort=medium -->
## Warnings
None

## PR title
T-0017: Geometry system adopts the Maison ui-kit ladder (tier x scale x size)

## PR body
## Summary

Geometry is rebuilt on the Maison ui-kit ladder: 3 tiers (content, product, micro) x 3 scales (sm, md, lg) x 3 sizes, giving 27 cells, plus 4 radius modes (default, round, sharp, pill). Tokens use this repo's names. Each cell's text size still composes from the Type UI scale.

The old XS to 2XL ramp, `baseHeight`, `rampContrast`, treatments and `tokenOverrides` are retired. Saved kits migrate to persist schema v9. The design decisions are recorded in ADR-032, with the Maison-to-ours name mapping.

User rulings kept:
- UI-control and UI-widget keep one step, MD, with a derived size.
- The app shell rides the same engine as the exports.

## Changes

- Engine (`src/engine/geometry.mjs`, `type.mjs`): the 27-cell ladder with 14 fields per cell, `RADIUS_MODES`, a resolver CSS emitter, and `uiText`. UI-control and UI-widget are reduced to MD.
- Model and persist (`src/ui/model.mjs`, `persist.js`): `CURRENT_SCHEMA_VERSION = 9` with `migrateGeometry`. It maps legacy treatment and baseHeight onto (tier, scale), drops retired keys and reports them in `DROPPED_KEYS`.
- Exports (`src/engine/ds-export.js`, `exports.js`): CSS, DTCG and Figma modes emit `size/<cell>/*` (378) and `control/*` (126) variables, with ALIAS bindings from `control/product/md/height` into the cells.
- Brand-Kit MCP (`mcp/brand-kit-core.mjs`, `png-swatch-board.mjs`): `get_geometry` takes a tier and returns cell data.
- Figma binder (`figma/binder/migrations.mjs`, `mode-apply-plan.mjs`, `style-plan.mjs`): `GEOMETRY_FIELD_RENAME_MAP`, a `kebabWaveOldName` null path for the new cell fields, a `geometrySizeAliasMap` tiebreak, `geometryCellOrder`, and retired variables moved under `_deprecated/`.
- Geometry section and shell (`src/ui/sections/geometry.js`, `app.js`, `overlays/settings.js`, `styles.css`, `icons.js`): `data-cell` spec lines, tier/scale/radius pickers, and a `data-tier`/`data-scale`/`data-radius` resolver. The `--sh-control-*` and `--sh-chip-*` aliases drive buttons, inputs, segmented controls, chips, toggles and icons.
- Docs and skills: ADR-032, `geometry-system`, `geometry-tokens`, `type-scale` and `building-editor-sections` skills, `mcp/README.md`, plus citation repairs in seven docs. The gate report is `docs/reports/2026-10-07-geometry-maison-ladder.md`.

## How each was verified

All 14 steps passed their verifiers. Each red criterion was run against the base commit and went red there.

- Ladder: `node test/engine/geometry.mjs` checks the 27 cells and 108 radius sets against a vendored Maison fixture. The fixture's sha256 matches Maison's `geometry.ts`, and the verifier re-derived the 27 rows independently.
- Migration: the `geometry-migrate` group in `node test/ui/persist.mjs` covers the v8 compact/24, comfortable and touch cases, a mode `baseHeight` becoming a scale, re-hydration identity and allowlist parity.
- Real browser: `npm run smoke` printed `all 108 nested cases (27 cells x 4 radius modes) resolve --control-height and --radius-control to the engine's cell values`.
- Full gates on the final tree:
  - `npm test`: 54 of 54 test files passed, with generated assets unchanged.
  - `npm run build`: exit 0.
  - `npm run smoke`: exit 0.
  - The eight sweep legs (corpus-reset, corpus-tonal, corpus-anchor, sweep-prime, corpus-contrast, mode-isolation, even-dips, chroma-envelope): all exit 0.
  - Retired-name `git grep`: no matches.
- Not run locally: `panda-smoke`, which needs registry access and runs in CI only.

## Changelog entry
Geometry now follows the Maison ui-kit ladder: three tiers, three scales and three sizes (27 cells) with four radius modes, replacing the XS to 2XL size ramp, base height, ramp contrast and treatments. Saved kits migrate automatically (persist schema 9). CSS, DTCG, Figma, Brand-Kit MCP and the consumer skills now carry the cell tokens. UI-control and UI-widget type use a single MD step.

## Follow-ups
- fix-now: `test/plugin/geometry-tokens.mjs` has a comment that still says ".control-* class it names must match"; reword it for the `--control-*` and `--chip-*` roles.
- note: `docs/assets/geometry-tokens.json` is the frozen six-size (XS to 2XL) snapshot, still carrying retired fields such as `caret`. Nothing reads it, so regenerate it from the 27 cells or retire it.
- note: `panda-smoke` runs only in CI. Check that CI leg on the PR, since no local run covers it.
- note: main carries `b7b0360f` (#812, describe-eval only), which is not in the lane. Sync the branch with main before opening the PR.
