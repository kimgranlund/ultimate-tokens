# Geometry / dimensional tokens: reference shape

The geometry engine (`src/engine/geometry.mjs`) is the spatial analog of the color and type engines:
a few discrete axes, a fixed ladder, derived control geometry, then [DTCG](https://tr.designtokens.org/)
`dimension` tokens, CSS custom properties with a context resolver, and Figma variables. Since ADR-032
(T-0017) it is the **Maison ui-kit ladder** in our token names. The live shape is
`geomTokensDTCG(geomScale({}))`; the retired six-size ramp (XS to 2XL) has no file in the tree.

## The ladder: three axes, 27 cells

A kit picks `{ tier, scale, radius, spaceBase }` (default `product / md / round / 4`). Every cell is
addressed by three axes, `{tier}-{scale}-{size}`:

```
height = TIERS[tier].base + TIERS[tier].offsets[scale] + SIZES[size] · TIERS[tier].step
```

| Tier | Base | Scale offsets (sm / md / lg) | Size step |
|---|---|---|---|
| content | 48 | -12 / 0 / +16 | 8 |
| product | 32 | -4 / 0 / +4 | 8 |
| micro | 16 | -2 / 0 / +2 | 2 |

`SIZES = { sm: -1, md: 0, lg: 1 }`. The 27 heights all land on Maison's 25-row component-geometry
ladder (`LADDER_ROWS`: height, inset, icon). The kit default cell is `{tier}-{scale}-md`;
product-md-md is the 32px control. The editor shell sizes its own chrome from one cell too, product-sm-md
(28px) by default; its text roles, control anatomy, container composition and glyph motion are in
[shell-roles.md](shell-roles.md) (T-0044, ADR-036).

## The law (the one rule)

> **inset = (height − icon) / 2**: every glyph sits in one square icon box, centered in a control of
> side = height. `padding-block` is `0`; block-size is the vertical lever, never block-padding.

The law holds on every ladder row (Maison's generator asserts it, and `test/engine/geometry.mjs`'s
`anatomy` group checks all 27 cells and all 25 rows).

## Per-cell fields

| Field | Rule |
|---|---|
| `height`, `inset`, `icon` | the ladder row at the cell height |
| `text` | the type scale's UI text at the height (`uiText`, the height-indexed table `UI_TEXT` in `src/engine/type.mjs`) |
| `caption-text`, `chip-text` | the text of the compact row: the first ladder row, by descending height, at or below height − inset |
| `chip-height`, `chip-inset` | the compact row's height (capped at the cell height) and inset |
| `icon-ratio` | icon / height, unitless |
| `min-width` | height (an icon-only control is at least square) |
| `radius-control` | text · k.text + height · k.height, k from the kit's radius mode |
| `radius-mark` | radius-control · icon-ratio |
| `radius-inset` | max(0, radius-control − inset / 2) |
| `radius-card` | radius-control + inset / 2 |
| `part-height` | height − inset: a repeated part (segment, option) inside a control-sized container (the compound law, ADR-033) |
| `part-inset` | inset / 2: the container's padding and the part's own inline inset |

Radius modes (`RADIUS_MODES`): `default` (k.text 0.5), `round` (1, the default), `sharp` (0.25),
`pill` (k.height 0.5).

## Structure (`geomTokensDTCG`)

| Top-level key | What it is |
|---|---|
| `size` | one group per cell (`content-sm-sm` to `micro-lg-lg`) with the 16 kebab fields above, `dimension` tokens (`icon-ratio` is a `number`) |
| `radius` | the **Material 3 shape-corner scale**, `none 0 · xs 4 · sm 8 · md 12 · lg 16 · xl 28 · full 9999`; the control corner is the per-cell `radius-control`, a separate value |
| `space` | the `--space-*` layout scale (`SPACE_STEPS × spaceBase`), the space **between** components, a separate concern from control geometry |
| `inset` | the CONTAINER tier's padding, `control-group · card · panel · dialog · page`, each a named `space` rung |
| `gap` | the container tier's sibling spacing, `cluster · stack-tight · stack · stack-loose · grid · section`, same named-rung derivation |
| `border` | stroke constants, `thin (1) · thick (2)` |
| `focus` | the focus-ring pair, `ring-width (2) · ring-offset (2)` |

## The CSS resolver

`geomTokensCSS` emits the 27 × 16 primitives (`--size-{tier}-{scale}-{size}-{field}`), the container
lines, then the resolver (`geomResolverCSS`). The resolver reads four attributes on any ancestor,
nearest value wins: `data-tier`, `data-scale`, `data-size`, `data-radius`. It resolves them to the roles
`--control-height/-inset/-text/-icon/-caption-text/-icon-ratio`, `--chip-height/-inset/-text`,
`--control-part-height/-inset` and `--radius-control/-mark/-inset/-card`, through the context hooks `--ctx-cell-*`, `--ctx-scale-*`,
`--ctx-size-*` and `--ctx-radius-text/-height`. An export prefix renames the primitives and container
ladders only; roles and `--ctx-*` are never prefixed (ADR-032 holds the Maison-to-ours name map).

Size a component from the roles, never fixed px:
`min-block-size: var(--control-height); padding-inline: var(--control-inset); font-size: var(--control-text); border-radius: var(--radius-control)`.

Breakpoints change only the scale axis: each `geomTokensBreakpointCSS` file sets the `--ctx-scale-*`
indicators for its mode's scale. With no modes configured the app synthesizes Desktop Lg and Desktop Xl
(scale lg) and Tablet and Mobile (scale sm).

## Composition with typography (one number, two engines)

A control's box (geometry) and the text in it (typography) share one table: `UI_TEXT` lives in the type
engine, and the app resolves geometry with `geomScale(doc.geometry, { typeScale })` (`geomScaleFor` in
`src/ui/model.mjs`), so each cell's `text`, `caption-text` and `chip-text` read the type scale's
`uiText` at the cell's height. Changing the body base moves control text everywhere; the frame
(height, inset, icon) never moves, so the centering law still holds.

## Figma variables

`geomTokensFigmaModes` emits one Geometry collection: 27 × 16 mode-constant FLOAT `size/{cell}/{field}`
variables, 9 × 16 per-mode ALIAS variables `control/{tier}/{size}/{field}` (each mode names the
`size/{tier}-{modeScale}-{size}/{field}` cell for that mode's scale), and the radius, space, inset, gap,
border and focus FLOATs. `geomTokensFigma` emits the flat unitless shape.

## Mechanization

The engine is verified by `test/engine/geometry.mjs` against a vendored Maison fixture
(`test/engine/fixtures/maison-geometry-rows.json`): the 27 cells, the anatomy, 108 radius cases (27 cells
× 4 modes), the anchors, the emitters with the prefix contract, and the container identity. The
real-browser smoke renders the 108 nested resolver cases in CI.

> Status: **shipped**, `src/engine/geometry.mjs` and the Geometry editor section generate these tokens.
