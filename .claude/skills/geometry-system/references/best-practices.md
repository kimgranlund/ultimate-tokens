## Best practices: changing the geometry engine

The non-obvious do/don't for `src/engine/geometry.mjs` and its join. The model is in `foundations.md`;
the decision and the name map are ADR-032.

### The ladder is data, not a fit

The 27 cells are Maison's validated standard. Never hand-tune a cell, add a continuous knob, or round a
height to "something close": `ladderRow` throws off-table on purpose. If Maison's ladder changes,
re-vendor `test/engine/fixtures/maison-geometry-rows.json` (rows, resolverCells, ladder, source commit and
sha256), then let the `maison-ladder` group prove all 27 cells against it. Maison is read only; never
edit it.

### The law is a derivation: keep it one

`inset = (height − icon) / 2` holds on every ladder row because the rows were authored that way. A row
that breaks it is a data error, not a tolerance to widen. Never add `padding-block` to center text; size
a control with `min-block-size: var(--control-height)` and `padding-block: 0`.

### Roles are Maison's hooks: never prefix them

`--control-*`, `--chip-*`, `--radius-control/-mark/-inset/-card` and `--ctx-*` equal Maison's
per-instance override hooks, so Maison's control CSS (`var(--control-height, var(--g-height))`) binds
an exported kit with no translation. Routing a role through `ns()` silently breaks every consumer that
uses a prefix: the role would come out `--md-control-height` and nothing reads it. The `emitters` group
asserts the resolver under `{ prefix: "md" }` keeps every role bare while the primitives it reads become
`--md-size-*`.

### Cell order is authored once

Never order cells with `Object.keys(scale.cells)` or by height (shared heights tie: 28, 36 and others
occur in several tiers). Use `orderedSizeNames(scale)`. For legacy t-shirt names use `sizeAnchor(scale,
name)` / `mdAnchor(scale)`; never assume `scale.cells.MD` exists (there is no such key).

### Legacy heights are a reader concern, not an engine one

Two different maps resolve old sizes, for two readers:

- `LEGACY_SIZE_CELLS` + `sizeAnchor` (previews, MCP swatch boards): MD is the KIT default cell, the
  other five hold the legacy pixels (XS product-sm-sm, SM product-md-sm, LG product-lg-md, XL
  content-md-md, 2XL content-lg-md).
- Figma's `geometrySizeAliasMap` (live-file bindings): an old `size/{step}` variable aliases to the cell
  nearest its LIVE height, tiebreak `geometryCellOrder`, so a live MD 28 lands on product-sm-md. The
  shared `nearestStepByHeight` keeps its insertion-order tie rule for its type callers; the geometry
  tiebreak never goes there.

### The composition moves text, never the frame

Cells read text from the type scale's `uiText`; height, inset and icon never depend on type. Pass the
BASE type scale at every mode (the Figma cells are mode-constant). Never reintroduce a geometry-owned
text row: control text per height is one table, `UI_TEXT` in type.mjs.

### Emitters in lockstep through `CELL_FIELDS`

Every emitter iterates `CELL_FIELDS`; a new field added there reaches CSS, DTCG, Figma and the Figma
modes at once. A field the resolver should expose also joins `RESOLVER_FIELDS` and gets a role name from
the ADR-032 map. Then update the fixture-backed test, the consumer skill
(`plugin/ultimate-tokens/skills/geometry-tokens/`) and its parity script. The cell carries 16 fields since ADR-033
added `part-height` and `part-inset` (roles `--control-part-height/-inset`, our names; Maison has no
part role).

### Figma ALIAS variables are per-mode names

`control/{tier}/{size}/{field}` is `{ type: "ALIAS", values: { [mode]: "size/{cell}/{field}" } }`, one
hop to a literal FLOAT of the same collection. Never alias an alias; `validateModeInterchange` rejects
it and the apply gate then drops the whole Geometry half.

### Determinism

Pure functions, no DOM, no RNG, no clock. The same config yields byte-identical CSS, DTCG and Figma
output; the container tier at spaceBase 4 is byte-identical to the pre-ADR-032 output, which keeps the
framework seeds in `src/engine/exports.js` stable.
