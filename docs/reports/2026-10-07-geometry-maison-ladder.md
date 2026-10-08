# Geometry on the Maison ladder: gate report (2026-10-07)

Evidence for T-0017 (`.sdlc/geometry-maison-ladder/`) and ADR-032 in
`docs/references/decision-records.md`. The Geometry system now follows the Maison ui-kit ladder: three
tiers (content, product, micro) by three scales (sm, md, lg) by three sizes, 27 cells, with four radius
modes, named to this project's token standards. Each cell's text size still composes from the Type UI
scale. This report records the gates on the finished lane, steps 1 to 13.

## Command

- Base: `git merge-base HEAD main` = `c7bfde0c26da79f3bb5015c19b8e7eed826d07cb` (#810, T-0015).
- Head: `plan/geometry-maison-ladder` at `d4645489a0b9f65673a758fb48355f798fc3b6ee` (steps 1 to 13).
  This step changed no source file, so every reading is the step 13 tree's.
- `GL` below is the version-free lock path,
  `$(ls -d ~/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)`.
  Every command ran with `SDLC_GATE_WORKERS=10`.

```
python3 "$GL" run --name npm-test -- npm test
python3 "$GL" run --name build -- npm run build
python3 "$GL" run --name smoke -- npm run smoke
python3 "$GL" run --name corpus-reset -- npm run gate:corpus-reset
python3 "$GL" run --name <leg> -- npm run gate:<leg>   # corpus-tonal corpus-anchor sweep-prime corpus-contrast mode-isolation even-dips chroma-envelope
node test/engine/geometry.mjs
node test/ui/persist.mjs
```

- `npm test` ran twice. The second run was wrapped in the asset drift check: a `shasum` of
  `figma/plugin/ui.html`, `src/ui/*-assets.js`, `src/ui/categories/*.js` and
  `docs/reference/data/adia-*` before and after, equal. Neither run left a tracked change:
  `figma/plugin/ui.html` (4,295,908 bytes) was already regenerated in step 13, so the expected
  first-run rewrite did not occur.
- The sweeps ran as eight separate legs, never the chained `gate:sweeps`, so one red leg cannot hide
  the legs after it. corpus-contrast ran after `npm test`, so it read the regenerated
  `src/ui/categories/*.js`.
- Load average about 9.3 to 9.6 during the run; seconds include lock waits.

## Gates

| Leg | Exit | Seconds |
|---|---|---|
| `npm test` (first run) | 0 | 218 |
| `npm test` (drift-wrapped run) | 0 | 219 |
| `npm run build` | 0 | 3 |
| `npm run smoke` | 0 | 27 |
| `gate:corpus-reset` | 0 | 120 |
| `gate:corpus-tonal` | 0 | 274 |
| `gate:corpus-anchor` | 0 | 350 |
| `gate:sweep-prime` | 0 | 97 |
| `gate:corpus-contrast` | 0 | 78 |
| `gate:mode-isolation` | 0 | 46 |
| `gate:even-dips` | 0 | 58 |
| `gate:chroma-envelope` | 0 | 79 |

`npm test` passed all 54 test files. `npm run smoke` printed `SMOKE PASS, gallery · category · editor ·
export dialog all render in a real browser`, in headless Chrome over CDP. The retired-name guard,
`git grep` for `RAMP_LADDER`, `rampContrast`, `GEOMETRY_TREATMENTS`, `LADDER_SIZE_KEYS`, `CONTROL_FONT`
and `GAP_UNIT` over `src`, `scripts`, `mcp`, `figma` and `plugin` (less `src/ui/persist.js`, which reads
them as legacy keys, and the generated `src/ui/describe-mcp-assets.js` and `figma/plugin/ui.html`),
found none.

## Ladder validation

- Real browser. The smoke run's resolver line:

```
✓ geometry.css resolver: all 108 nested cases (27 cells x 4 radius modes) resolve --control-height and --radius-control to the engine's cell values
```

  Each of the 27 cells is nested under each of the four radius modes in Chrome, and the computed
  `--control-height` and `--radius-control` equal the engine's cell values.
- Vendored Maison rows. `test/engine/geometry.mjs` reads Maison's own generated output, vendored as
  `test/engine/fixtures/maison-geometry-rows.json` (Maison's `geometryRows`, the per-tier resolver
  cells, and the component-geometry CSV). Its `maison-ladder` group checks that the 27 cells come in
  Maison's `geometryRows` order, that each cell's height, inset, text and icon equal Maison's row, that
  each resolver cell equals Maison's, and that an off-table cell throws; its `radius-modes` group checks
  `RADIUS_MODES` against Maison's k table over all 108 radius sets. The run printed
  `geometry PASS, the Maison ladder (27 cells vs the vendored fixture), anatomy, 108 radius cases,
  anchors, emitters + the prefix contract, container identity`.
- Saved-kit migration to schema v9. `CURRENT_SCHEMA_VERSION` in `src/ui/persist.js` is 9. The
  `geometry-migrate` group in `test/ui/persist.mjs` maps each pre-v9 `treatment` and `baseHeight` onto
  its (tier, scale), drops the retired geometry fields and the UI-control and UI-widget type overrides
  off MD and reports each in `DROPPED_KEYS` (11 for the v8 fixture), checks that re-hydrating a migrated
  document is the identity, that a v9 document round-trips byte-identical, and that a v9 snapshot is
  never migrated (stray legacy keys are reported, not translated). The run printed `pass
  geometry-migrate` and `PASS: ui-persistence clears all [gate] predicates`.

## Follow-ups

- `docs/assets/geometry-tokens.json` is the frozen six-size (XS to 2XL) snapshot from before the ladder,
  still carrying retired fields such as `caret`. Regenerate it from the 27 cells or retire it later;
  no test, script or source file reads it.
- `panda-smoke` runs only in CI, because it needs registry access, so it is not in the table above.
- main carries `b7b0360f` (#812, describe-eval files only), which is not in the lane. Sync the lane
  with main before the PR.
- No push, PR or issue was made.
