---
name: geometry-tokens
description: >
  Use when sizing or spacing any UI in a project that carries an Ultimate Tokens export, the
  height/padding/radius of a control, the inset of a card, the gap between elements, the icon size, a
  focus ring, a border ("what size/spacing token for this", "how tall should this control be", "what
  padding/gap/radius", "space these out", "why is this the wrong size", "make the layout denser").
  The consumption guide for the dimensional system: the `data-tier` / `data-scale` / `data-size` /
  `data-radius` context axes, the resolved `--control-*` / `--chip-*` / `--radius-control` roles, the
  `--size-{tier}-{scale}-{size}-{field}` cell primitives, the glyph rules, and the container tier
  (`--space-*` / `--inset-*` / `--gap-*` / `--radius-*` / `--border-*` / `--focus-*`). Never hardcode
  a px height/padding/radius, this names the semantic dimension token for every job. Scope is SIZE &
  SPACE only (colour is color-tokens; font family/weight is typography-tokens).
---

# Using Ultimate Tokens geometry roles

An Ultimate Tokens export gives a **dimensional system** as CSS custom properties, in two tiers:
**control geometry** (a fixed ladder of 27 cells, addressed by context attributes and read through
resolved roles such as `--control-height`) and **container geometry** (`--inset-* / --gap-* /
--space-*`, the spacing between and around components). Your job is never to type a px value, it's to
pick the context and bind the role.

## Bind to the project first (always step 1)

1. **Find the export.** A CSS file defining the dimensional variables (often `geometry.css` /
   `tokens.css`; a DTCG `*.tokens.json` may sit beside it). It holds a `:root` block of primitives
   and a context resolver (`:where([data-tier=…])` rules ending in a `:where(*, :host)` block). If none
   exists, stop and ask, do not hardcode dimensions.
2. **Read the prefix.** The default is native (`--size-*`, `--radius-md`, `--space-*`). A Material
   scheme or a brand prefix namespaces the cell primitives and the container tier under one root,
   `--md-size-*` / `--md-radius-md` / `--md-space-*`. The 13 resolved roles (`--control-*`, `--chip-*`,
   `--radius-control/-mark/-inset/-card`) and the resolver's `--ctx-*` hooks are **never prefixed**, so
   component CSS reads the same names under every export.
3. **Know the context axes.** Four attributes pick the geometry for a subtree, and the **nearest
   ancestor wins** on each axis independently:
   - `data-tier`: `content` · `product` · `micro` (the base height family: content forms and marketing,
     product UI, micro widgets).
   - `data-scale`: `sm` · `md` · `lg` (the density of the tier, the axis breakpoints change).
   - `data-size`: `sm` · `md` · `lg` (the control's own size within the scale).
   - `data-radius`: `default` · `round` · `sharp` · `pill` (the corner mode).
   Unset axes fall back to the kit default (the kit's tier and scale, size `md`, the kit's radius mode).
4. **Know the grammar.** Cell primitives: `--size-{tier}-{scale}-{size}-{field}`, field ∈ `height ·
   inset · text · icon · caption-text · chip-height · chip-inset · chip-text · icon-ratio · min-width ·
   radius-control · radius-mark · radius-inset · radius-card`. Resolved roles: `--control-height`,
   `--control-inset`, `--control-text`, `--control-icon`, `--control-caption-text`,
   `--control-icon-ratio`, `--chip-height`, `--chip-inset`, `--chip-text`, `--radius-control`,
   `--radius-mark`, `--radius-inset`, `--radius-card`. Container tier: the Material 3 corner ladder
   `--radius-{none|xs|sm|md|lg|xl|full}`, `--space-{0…9}`,
   `--inset-{control-group|card|panel|dialog|page}`,
   `--gap-{cluster|stack-tight|stack|stack-loose|grid|section}`, `--border-{thin|thick}`,
   `--focus-{ring-width|ring-offset}`.

## The laws (violating any of these is a defect)

1. **Tokens, not px.** If a height, padding, radius, gap, or border isn't a role, a `--size-*`
   primitive, or a container-tier var, it doesn't belong in UI code.
2. **Components bind roles; context picks the cell.** A component reads `--control-height`,
   `--control-inset`, `--control-text`, `--control-icon` and `--radius-control`, never a fixed cell.
   To make a control smaller or denser, set `data-size` or `data-scale` on it or an ancestor; the
   roles re-resolve. Reach for a raw `--size-{tier}-{scale}-{size}-{field}` primitive only for a fixed
   one-off that must not follow context. See [`references/controls.md`](references/controls.md).
3. **One inset, the centering law.** `height = icon + 2 × inset` on every cell, so a glyph in the
   icon box sits centered in a height-square. The inline edge padding is `--control-inset`; never set
   a control's padding independently of its height.
4. **The glyph rules.** Every glyph sits in one square box, `--control-icon` by `--control-icon`. An
   icon fills the box; an indicator (caret, chevron, dot, count) sits in the same box at
   `font-size: var(--control-text)`. The icon-to-label gap is `calc(var(--control-inset) / 2)`. A badge
   is `calc(var(--control-height) - var(--control-inset))` tall with `--radius-inset`. An icon-only
   control is a `--control-height` square. See [`references/detail.md`](references/detail.md).
5. **Container spacing is the container tier, not raw `--space-N`.** Reach for a semantic
   `--inset-*` / `--gap-*` first; drop to a raw `--space-{0…9}` only for a one-off the tier doesn't
   name. See [`references/containers.md`](references/containers.md).
6. **Radius: roles for controls, the M3 ladder for containers.** A control's corner is
   `--radius-control` (it follows `data-radius` and the control's text and height); marks use
   `--radius-mark`, nested insets and badges `--radius-inset`, a card wrapping controls
   `--radius-card`. Free-standing containers pick off the Material 3 ladder `--radius-{xs|sm|md|lg|xl}`;
   `--radius-full` is for avatars and dots.
7. **Focus ring is one recipe.** `outline-width: var(--focus-ring-width)` +
   `outline-offset: var(--focus-ring-offset)` on every focusable element (the COLOR is color-tokens'
   accent). Borders are `--border-thin` / `--border-thick`, never a hardcoded `1px`.
8. **Responsive changes the scale axis.** Breakpoint files flip only the scale indicators, so every
   role re-resolves at each width. Don't hand-write size `@media` overrides. See
   [`references/responsive.md`](references/responsive.md).

## Surface map: where to look things up

| Sizing… | Reference |
|---|---|
| Buttons, inputs, selects, toggles, chips, the 27-cell ladder, the axes, control radius | [`references/controls.md`](references/controls.md) |
| Cards, panels, dialogs, page layout, insets, the gap scale, section rhythm, dividers/borders | [`references/containers.md`](references/containers.md) |
| Icons and indicators, marks, badges, the min-width/hit-target floor, focus rings | [`references/detail.md`](references/detail.md) |
| Breakpoint modes, what scales vs what's fixed | [`references/responsive.md`](references/responsive.md) |

## Migrating from the step ramp

Kits exported before the 27-cell ladder carried a six-step t-shirt ramp. Those tokens are gone:

- `--size-{step}-*` with steps XS to 2XL. Each step's pixels live on a cell now: XS
  `product-sm-sm`, SM `product-md-sm`, MD the kit default cell, LG `product-lg-md`, XL
  `content-md-md`, 2XL `content-lg-md`. Prefer the roles plus `data-*` context over binding a cell.
- `--size-{step}-caret`: an indicator is text-sized inside the icon box (`--control-text`).
- `--size-{step}-gap`: the icon-to-label gap is `calc(var(--control-inset) / 2)`.
- `--size-{step}-padding-narrow`, `-padding-wide` and both `-compact` twins: one inset,
  `--control-inset`.
- `--size-{step}-font` is `--control-text`, `--size-{step}-radius` is `--radius-control`,
  `--size-{step}-min` is the `min-width` cell field (an icon-only control is a height square).
- The `.control-{step}` utility classes: bind the roles on your own selector.
- The treatment presets, the density multiplier, the base-height and ramp-contrast knobs, the
  numbered-ladder prototype ramp and `--radius-default`: the tier, scale and radius axes replace them.

## Verify before you ship

- Every dimension in the diff is a role, a `--size-*` primitive, or a container-tier var; grep the
  diff for `px`/`rem`/`em` literals on height, padding, margin, gap, border, border-radius, outline in
  UI code (should be var-backed).
- Controls read the roles; density changes go through `data-tier` / `data-scale` / `data-size`.
- Container spacing uses the `--inset-*`/`--gap-*` tier before any raw `--space-N`.
- Skill maintainers: `node scripts/dimension-parity.mjs` gates every dimension token named here
  against the engine (runs in the product repo's npm test; no-ops outside it).
