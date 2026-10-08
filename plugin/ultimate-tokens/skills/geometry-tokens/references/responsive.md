# Responsive geometry: modes, what scales

## Breakpoint modes change the scale axis

The 27 cells are the same at every width. What a breakpoint changes is the **scale** axis: each
breakpoint file is one `@media` block whose `:root` flips the resolver's `--ctx-scale-*` indicators,
and every role (`--control-*`, `--chip-*`, `--radius-control…`) re-resolves from it. The standard set
(synthesized when the designer configured none) keeps the kit's scale on Desktop (1280 to 1727),
moves to `lg` on Desktop Lg (1728 to 2559) and Desktop Xl (2560 and up), and to `sm` on Tablet
(992 to 1279) and Mobile (below 992). A hand-configured kit may carry its own ladder; read the widths and scales from the
files. Load the breakpoint files after the base `geometry.css`.

A component that binds the roles restyles at each breakpoint with no CSS of its own. Don't
hand-write size `@media` overrides, you'd fight the exported files. An explicit `data-scale` on an
element wins over the breakpoint for that subtree (nearest ancestor wins), so pin a scale only where a
surface must not adapt.

**Mode-independent (declared once):** the cell primitives (`--size-*`), the radius ladder
(`--radius-*`), the space ladder (`--space-*`), the container tier (`--inset-*`, `--gap-*`), borders,
and the focus ring. So a card's `--inset-card` is constant across breakpoints while a control's
`--control-height` may change, by design (spacing rhythm is stable; control density adapts).

## What to reason about

- Don't assume a control's height is constant across breakpoints; read the role, which carries the
  per-breakpoint value.
- Two sizes in one scale never collapse to the same height, but the same height can appear in
  different cells (28px is `content-sm-sm`, `product-sm-md` and `product-lg-sm`).
- Never author fluid `clamp()`/`vw` sizing for controls or spacing, the modes are the mechanism and
  they land on the ladder's exact values.

## Composition with type

`--control-text`, `--control-caption-text` and `--chip-text` come from the type system's
height-indexed UI text table, so a control's text always matches its height at every breakpoint. Take
font family, weight and tracking from typography-tokens' UI-control voice and the size from the role;
you never re-pair box and text per media query.
