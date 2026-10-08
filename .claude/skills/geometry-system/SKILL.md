---
name: geometry-system
description: >
  Change the dimensional / GEOMETRY ENGINE in ultimate-tokens, the Maison ladder
  (tier × scale × size, 27 cells), the centering law, the radius modes, the CSS
  context resolver and its roles, the spacing and container ladders, and the
  composition with typography. Use whenever a change touches src/engine/geometry.mjs
  or src/ui/model.mjs geometryScale / geomScaleFor, or someone says "change the
  control heights / the ladder", "the control padding is off / un-centered", "tune
  the radius / spacing", "the --control-* / --chip-* / --radius-* roles are wrong",
  "the data-tier / data-scale resolver", "the geometry / dimension tokens are wrong",
  "the control text doesn't match the brand font", or "a geometry gate is red". The
  geometry sibling of the color-math skill (a few params → a systematic ladder → tokens).
disable-model-invocation: false
user-invocable: true
---

# Geometry / dimensional engine: ultimate-tokens

`src/engine/geometry.mjs` is the spatial analog of the color and type engines: **`{ tier, scale, radius,
spaceBase }` → 27 ladder cells → DTCG / CSS (with a context resolver) / Figma tokens.** Pure, no DOM, no
RNG. Since ADR-032 (T-0017) it is the **Maison ui-kit geometry system** in our token names: a fixed,
validated ladder, not a ramp with a height knob. Geometry is unforgiving the same way color is: a pad
hand-tuned to "look right" or a height off the ladder ships controls that *look* plausible and break the
standard. This skill is the procedure, the gotchas and the gates. The reference shape is owned by
`docs/references/geometry/README.md`, the decision and the Maison-to-ours name map by ADR-032 in
`docs/references/decision-records.md`; **cite them, don't re-derive.**

## THE LADDER (read first)

Three discrete axes address every cell, `{tier}-{scale}-{size}`:

```
height = TIERS[tier].base + TIERS[tier].offsets[scale] + SIZES[size] · TIERS[tier].step
```

`TIERS` is Maison's `definition.mjs` verbatim (content 48, product 32, micro 16), `SCALES = ["sm", "md",
"lg"]`, `SIZES = { sm: -1, md: 0, lg: 1 }`. All 27 heights land on `LADDER_ROWS`, Maison's 25-row
component-geometry CSV (height, inset, icon). A height off the table is a `RangeError` from `ladderRow`,
never a nearest match: a continuous knob over a discrete standard is exactly the drift the 27-cell
validation prevents. Depth: `references/foundations.md` §1-2.

## THE ONE LAW

**inset = (height − icon) / 2**: every glyph sits in one square icon box, centered in a control of side =
height; block-size is the vertical lever, never block-padding. The law holds on every ladder row (Maison's
generator asserts it); the `anatomy` group of `test/engine/geometry.mjs` checks it on all 27 cells and all
25 rows. The glyph rules that live in consumer CSS, not in tokens: an indicator is text-sized inside the
icon box, the icon-to-label gap is inset / 2, an icon-only control is a height square (`min-width`).

## THE CELL: 16 fields, one builder

`buildCell` (in `geometry.mjs`) derives every field from the ladder row, the text lookup and the radius
mode's `{ text, height }` coefficient pair (`RADIUS_MODES`: default 0.5, round 1, sharp 0.25 on text; pill
0.5 on height):

- `height`, `inset`, `icon`: the ladder row. `text`: the type scale's `uiText` at the height.
- The compact row: the first ladder row, by descending height, at or below height − inset. `captionText`
  = `chipText` = its text; `chipInset` its inset; `chipHeight` = min(its height, height).
- `iconRatio` = icon / height (unitless, unrounded); `minWidth` = height.
- `radiusControl` = text · k.text + height · k.height; `radiusMark` = radiusControl · iconRatio;
  `radiusInset` = max(0, radiusControl − inset / 2); `radiusCard` = radiusControl + inset / 2.
- The compound law (ADR-033): `partHeight` = height − inset; `partInset` = inset / 2. A control-sized
  container pads `partInset` and keeps `radiusControl`; each repeated part is `partHeight` tall, keeps
  `partInset` inline and takes `radiusInset`, so the corners stay concentric. Unlike the chip, which snaps
  to a ladder row, the part is exact.

## THE RESOLVER: attributes in, roles out

`geomResolverCSS` is Maison's context resolver in our names. It reads the primitives, never declares
them. `:where(:root)` sets the kit default context; `[data-tier]` reassigns the nine `--ctx-cell-*`
cells to that tier's primitives; `[data-scale]`, `[data-size]` and `[data-radius]` set 0/1 indicators
(`--ctx-scale-*`, `--ctx-size-*`) and the radius pair (`--ctx-radius-text/-height`); `:where(*, :host)`
resolves the roles as a sum of products over the nine cells. The roles are `--control-height/-inset/
-text/-icon/-caption-text/-icon-ratio`, `--chip-height/-inset/-text`, `--control-part-height/-inset` and
`--radius-control/-mark/-inset/-card`. Nearest ancestor wins per axis, so one page can mix sizes.

**The prefix contract.** The `prefix` option goes through `ns()` and renames only the cell primitives
(`--{pfx}-size-{cell}-{field}`) and the container ladders. The roles and `--ctx-*` are **never
prefixed**: they equal Maison's per-instance override hooks, so Maison's control CSS binds an exported kit
with no translation. Only the `var()` references inside the `--ctx-cell-*` reassignments follow the
prefix. The `emitters` group checks it.

## THE COMPOSITION: one table, two engines (the JOIN)

Control text per height is ONE table, `UI_TEXT` in `src/engine/type.mjs`; `uiText(height, factor)`
scales a row by the bodyBase factor onto the half-pixel grid, and `typeScale` exposes the whole table as
`uiText`. The join is `geomScaleFor` in `src/ui/model.mjs`:

```js
geomScaleFor(doc, modeKey) = geomScale(mode ? { ...g, scale: mode.scale } : g, { typeScale: typeScaleFor(doc, "base") })
```

`geometryScale(doc)` is `geomScaleFor(doc, "base")`. With `opts.typeScale`, every cell's text, caption
text and chip text read `opts.typeScale.uiText[height]`; without it, `uiText(height)` (factor 1). The
frame (height, inset, icon) never moves, so the law holds composed. Cells compose from the BASE type
scale at every mode, because the Figma cells are mode-constant; a mode changes only the scale axis.

## Map: what each export owns

| Export (`geometry.mjs`) | Owns |
|---|---|
| `TIERS` / `SCALES` / `SIZES` / `RADIUS_MODES` / `DEFAULT_GEOMETRY` | the axes, the radius k table, the default kit `product/md/round/4` |
| `LADDER_ROWS` / `ladderRow` / `cellHeight` | Maison's ladder and height formula; off-table throws |
| `geomScale(config, opts={typeScale})` | the resolved scale `{ tier, scale, radius, spaceBase, cells, cell, radii, space, insets, gaps, borders, focus }`; unknown ids fall back to `DEFAULT_GEOMETRY` |
| `orderedSizeNames` / `sizeAnchor` / `mdAnchor` / `LEGACY_SIZE_CELLS` | cell order (Maison's geometryRows order, never `Object.keys`), and legacy t-shirt names to cells (MD is the kit default cell; XS product-sm-sm, SM product-md-sm, LG product-lg-md, XL content-md-md, 2XL content-lg-md) |
| `geomTokensCSS` | the 27 × 16 primitives, the container lines, then the resolver |
| `geomTokensSizesCSS` | the primitives alone (issue #487), no container tier and no resolver |
| `geomResolverCSS` | the context resolver only (the app shell injects primitives + resolver) |
| `geomTokensBreakpointCSS` | one file per mode, setting only the `--ctx-scale-*` indicators |
| `geomTokensDTCG` / `geomTokensFigma` | a `size` group keyed by cell (kebab fields; `icon-ratio` a `number`), radius/space/container groups |
| `geomTokensFigmaModes` | the Geometry collection: 27 × 16 mode-constant FLOAT `size/{cell}/{field}` and 9 × 16 per-mode ALIAS `control/{tier}/{size}/{field}` |

The container tier is a separate concern from control geometry and derives from `spaceBase` alone: the
fixed M3 corner scale (`none 0 · xs 4 · sm 8 · md 12 · lg 16 · xl 28 · full 9999`), `SPACE_STEPS ×
spaceBase`, named `insets` and `gaps` over the space ladder, `borders` and the `focus` ring pair. At
spaceBase 4 it is byte-identical to the pre-ADR-032 output, which keeps the Tailwind/shadcn/Panda/Radix
seeds in `src/engine/exports.js` stable. Depth: `references/foundations.md` §5-6.

## Procedure: change → check → fix → re-check

1. **Locate it.** A cell value → the ladder (`LADDER_ROWS`, `TIERS`) or `buildCell`. A control-text bug →
   the composition (`UI_TEXT` in type.mjs, the join in `geomScaleFor`). A role or attribute bug → the
   resolver (`geomResolverCSS`). A container / space bug → `M3_CORNERS` / `SPACE_STEPS`. A token-shape
   bug → the matching emitter. A Figma bug → `geomTokensFigmaModes` and the `maintaining-figma-plugins`
   skill.
2. **The ladder is data, not a fit.** Never hand-edit a cell or add a knob that makes off-table heights.
   A Maison ladder change is re-vendored into `test/engine/fixtures/maison-geometry-rows.json` (with its
   source commit and sha256) and validated over all 27 cells.
3. **Keep the roles unprefixed and Maison-named.** A new role follows the name map in ADR-032; never
   route a role or `--ctx-*` through `ns()`.
4. **Emitters in lockstep.** A new per-cell field goes into `CELL_FIELDS` (every emitter reads it), the
   resolver's `RESOLVER_FIELDS` if it is a summed role (`partHeight` and `partInset` are in
   `CELL_FIELDS` only; their two roles are derived `calc()` lines at the end of `geomResolverCSS`'s
   `:where(*, :host)` block, 15 roles in all), the fixture-backed test, the consumer skill
   `plugin/ultimate-tokens/skills/geometry-tokens/` and its `scripts/dimension-parity.mjs`, and the
   Figma field map if a live file needs a rename.
5. **Saved kits migrate.** A doc-shape change bumps the persist schema and adds a `RENAME_MAPS` entry;
   `migrateGeometry` in `src/ui/persist.js` is the v9 model (nearest md-cell height, every dropped key
   reported through `DROPPED_KEYS`).

## Validate (the gate: draft → check → fix → re-check)

```
node test/engine/geometry.mjs   # groups: maison-ladder · anatomy · radius-modes · anchors · compound-law ·
                                # emitters (incl. the prefix contract) · container-identity
node test/figma/mode-apply.mjs  # the Geometry interchange (ALIAS variables) validates
npm test                        # the above + ui/figma/exports/mcp (node test/run.mjs)
```

On pass the verifier prints one summary line (`geometry PASS, the Maison ladder (27 cells vs the vendored
fixture), ...`) and exits 0. The real-browser leg (`npm run smoke`, CI only) renders the 108 nested
resolver cases (27 cells × 4 radius modes) and reads `--control-height`, `--radius-control`, `--control-part-height` and
`--control-part-inset` back with `getComputedStyle`. **Don't call it done until `node test/engine/geometry.mjs` AND `npm test` are green.**

## References

| Path | Use when |
|---|---|
| `references/foundations.md` | the axes, the ladder, the law, the cell fields, the resolver, the composition, the container tier, the emitters and the migration |
| `references/best-practices.md` | the non-obvious do/don't (ladder-is-data, roles-unprefixed, cell order, emitter lockstep, Figma ALIAS shape) |
| `references/rubric.md` | score the change before calling it done |
| `docs/references/geometry/README.md` | the reference token shape (cite, don't copy) |
| `docs/references/decision-records.md` ADR-032 | the decision, the user rulings and the Maison-to-ours name map |

Peers: [[type-scale]] (the UI text table) · [[adding-export-formats]] (the geometry emitter) ·
[[building-editor-sections]] (the Geometry section and the shell axes) · [[maintaining-figma-plugins]]
(the cell variables) · [[shipping-changes]].
