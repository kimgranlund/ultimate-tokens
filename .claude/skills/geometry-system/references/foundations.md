## Foundations: the model a geometry change leans on

The engine is the Maison ui-kit geometry system (ADR-032, T-0017) in our names. Maison is an external,
read-only repo (`ui-kit-maison`, `src/foundation/geometry/`); its data is vendored once into
`test/engine/fixtures/maison-geometry-rows.json` (source commit and sha256 recorded there), and every cell
is checked against that fixture, not against a second copy of the engine's formulas.

### 1. The pipeline: four params → 27 cells → tokens

```
{ tier, scale, radius, spaceBase }      (DEFAULT_GEOMETRY = product / md / round / 4)
   │  cellHeight(tier, scale, size) for all 27 cells, each a LADDER_ROWS lookup
   ▼
cells (27 × 14 fields) + cell (the kit default, {tier}-{scale}-md)
   │  + the container tier from spaceBase (radii, space, insets, gaps, borders, focus)
   ▼
geomTokensCSS (primitives + container + resolver) · geomTokensDTCG · geomTokensFigma · geomTokensFigmaModes
```

The kit's `tier` and `scale` pick the default context and the default cell; all 27 cells are always
emitted, so a consumer can address any of them with the attributes. The radius mode applies to every
cell's radius fields. Unknown ids and unknown keys fall back to `DEFAULT_GEOMETRY`.

### 2. The axes and the ladder

| Tier | Base | sm / md / lg offsets | Size step | Heights (scale sm / md / lg, each size sm-md-lg) |
|---|---|---|---|---|
| content | 48 | -12 / 0 / +16 | 8 | 28-36-44 · 40-48-56 · 56-64-72 |
| product | 32 | -4 / 0 / +4 | 8 | 20-28-36 · 24-32-40 · 28-36-44 |
| micro | 16 | -2 / 0 / +2 | 2 | 12-14-16 · 14-16-18 · 16-18-20 |

`LADDER_ROWS` is the CSV in its own descending order (96 to 12; the compact-row rule depends on that
order). Each row is `{ height, inset, icon }`; the text column moved to type.mjs as `UI_TEXT` (§4). Cell
order everywhere is Maison's geometryRows order: content, product, micro; then scale sm, md, lg; then size
sm, md, lg. `orderedSizeNames(scale)` returns it; never iterate `Object.keys(scale.cells)` for order.

### 3. The centering law and the cell

**inset = (height − icon) / 2** on every row: the glyph sits in a square icon box centered in the control.
The derived fields (`buildCell`):

| Field | Rule |
|---|---|
| `captionText`, `chipText` | the compact row's text; the compact row is the first row with height ≤ height − inset, else the smallest row |
| `chipHeight`, `chipInset` | min(compact height, height); the compact inset |
| `iconRatio` | icon / height, unitless, unrounded |
| `minWidth` | height |
| `radiusControl` | text · k.text + height · k.height |
| `radiusMark` | radiusControl · iconRatio |
| `radiusInset` | max(0, radiusControl − inset / 2) |
| `radiusCard` | radiusControl + inset / 2 |

`RADIUS_MODES` (Maison's k table): default `{ text 0.5 }`, round `{ text 1 }` (the default), sharp
`{ text 0.25 }`, pill `{ height 0.5 }`. At product-md-md (32, inset 8, icon 16, text 14): round gives
radiusControl 14, radiusMark 7, radiusInset 10, radiusCard 18; default 7, sharp 3.5, pill 16.

Glyph conventions Maison keeps in component CSS, not tokens (the consumer skill teaches them): an
indicator is text-sized inside the icon box; the icon-to-label gap is inset / 2; a badge is height −
inset tall with `--radius-inset`; an icon-only control is a height square.

### 4. The composition: one text table

`UI_TEXT` (type.mjs) maps the 25 ladder heights to control text (96 → 30, 32 → 14, 24 → 12, down to 14 → 7.5 and 12 → 7).
`uiText(height, factor = 1)` returns `round(UI_TEXT[height] · factor · 2) / 2` (the half-pixel grid; the
identity at factor 1) and throws `RangeError` off-table. `typeScale(config).uiText` is the whole table at
the scale's bodyBase factor; `modeFactor` never applies to it.

`geomScale(config, { typeScale })` reads `typeScale.uiText[height]` for each cell's text and compact text;
without `typeScale` it reads `uiText(height)`. The join is `geomScaleFor` in `src/ui/model.mjs`, which
always passes the BASE type scale (the Figma cells are mode-constant). UI-control and UI-widget each keep
one step, MD, sized `uiText(32)` (14) and `uiText(24)` (12): the text of product-md-md and of its compact
row.

### 5. The resolver and the roles

`geomResolverCSS(scale, { unit, prefix })` emits, in order:

1. `:where(:root)`: `--ctx-scale-{sm,md,lg}` (1 for the kit scale), `--ctx-size-{sm,md,lg}` (1 for md),
   `--ctx-radius-text/-height` (the kit radius pair), and the kit tier's nine cells as
   `--ctx-cell-{scale}-{size}-{field}: var(--size-{tier}-{scale}-{size}-{field})`.
2. `:where([data-tier="X"])`: the nine `--ctx-cell-*` reassigned to tier X.
3. `:where([data-scale="X"])`, `:where([data-size="X"])`: the indicators.
4. `:where([data-radius="X"])`: the radius pair.
5. `:where(*, :host)`: each role a `calc` sum over the nine cells of `cell · scale-indicator ·
   size-indicator` (each term falls back to the kit default), then the four radius roles from
   `--control-text`, `--control-height`, `--control-icon-ratio` and `--control-inset`.

The nine resolved fields map to `--control-height/-inset/-text/-icon/-caption-text/-icon-ratio` and
`--chip-height/-inset/-text`. No `--g-micro-*` equivalent (scoped out, ADR-032). The roles and every
`--ctx-*` name are never prefixed; the prefix reaches only the primitives the `--ctx-cell-*` reassignments
point at.

Breakpoints: `geomTokensBreakpointCSS(modes)` emits one file per mode whose `:root` sets only the
`--ctx-scale-*` indicators for that mode's `scale.scale`, bounded on its outward edge so ranges never
overlap. With no modes configured, `geomModeScales` synthesizes Desktop Lg (1728, lg), Desktop Xl (2560,
lg), Tablet (992, sm) and Mobile (476, sm).

### 6. The container tier

Derived from `spaceBase` alone, a separate concern from control geometry:

- `radii`: the Material 3 shape-corner scale, fixed (`none 0 · xs 4 · sm 8 · md 12 · lg 16 · xl 28 · full
  9999`). The control corner is the per-cell `radiusControl`, not a rung here.
- `space`: `SPACE_STEPS = [0, 1, 2, 3, 4, 6, 8, 12, 16, 24]` × spaceBase.
- `insets` (`controlGroup · card · panel · dialog · page`) and `gaps` (`cluster · stackTight · stack ·
  stackLoose · grid · section`), each a named space rung.
- `borders` (thin 1, thick 2) and `focus` (ringWidth 2, ringOffset 2), constants.

Emitted as `--radius-* / --space-* / --inset-* / --gap-* / --border-* / --focus-*` and the matching DTCG
and Figma groups. The `container-identity` group pins them to the pre-ADR-032 values at spaceBase 4.

### 7. The emitters: same numbers, several shapes

`CELL_FIELDS` is the single field list (14 kebab names with their cell keys) every emitter reads, so a new
field lands everywhere at once. CSS carries units (`px`, or rem/em via `dimUnit`); `icon-ratio` is
unitless on every surface. DTCG carries `dimension` tokens (`number` for `icon-ratio`); Figma carries
unitless numbers. `geomTokensFigmaModes` writes `size/{cell}/{field}` FLOATs with the same value in every
mode and `control/{tier}/{size}/{field}` ALIAS variables whose per-mode value names
`size/{tier}-{modeScale}-{size}/{field}`; `validateModeInterchange` accepts an ALIAS only when every mode
names a literal variable of the same collection.

### 8. The migration (persist schema v9)

`migrateGeometry` (`src/ui/persist.js`) rewrites a pre-v9 doc carrying `treatment` or the retired base-height key
(ADR-032 names every retired key). The legacy MD height is that base height, else the treatment's (`LEGACY_TREATMENT_GEOMETRY`: comfortable 28,
compact 24, spacious 32, touch 36, pill 28); tier and scale are the nearest md-cell height (ties product,
content, micro, then md, sm, lg); the radius mode comes from the treatment's radius style; spaceBase from
the treatment; a mode's legacy base height becomes its `scale` within the migrated tier. Every dropped key is
reported through `DROPPED_KEYS`.
