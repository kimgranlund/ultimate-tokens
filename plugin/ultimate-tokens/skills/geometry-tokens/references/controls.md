# Controls: the cell ladder, the axes, the roles, radius

A control binds the resolved roles; the context attributes around it pick which of the 27 cells those
roles resolve to. Everything inside the control derives from that one cell.

## The ladder: tier x scale x size

A cell is `{tier}-{scale}-{size}`. Its height is the tier's base, plus the scale's offset, plus the
size's step (`sm` one step down, `lg` one step up):

| Tier | Typical use | `sm` scale (sm/md/lg) | `md` scale (sm/md/lg) | `lg` scale (sm/md/lg) |
|---|---|---|---|---|
| `content` | marketing, content forms, touch-first | 28 / 36 / 44 | 40 / 48 / 56 | 56 / 64 / 72 |
| `product` | product UI, the default | 20 / 28 / 36 | 24 / 32 / 40 | 28 / 36 / 44 |
| `micro` | dense widgets, table-cell controls | 12 / 14 / 16 | 14 / 16 / 18 | 16 / 18 / 20 |

Pick the tier for the surface, the scale for its density, then the size per control (a secondary
button `data-size="sm"` beside a primary at `md`). Every height is a row of one fixed table, so there
is no in-between value to reach for.

## Setting the context

```html
<section data-tier="product" data-scale="md" data-radius="round">
  <button class="btn">Save</button>
  <button class="btn" data-size="sm">Cancel</button>
  <div data-scale="sm"><!-- a denser toolbar --></div>
</section>
```

Each axis resolves to its nearest ancestor independently: `data-scale="sm"` on the toolbar keeps the
section's tier and radius. Unset axes fall back to the kit default. The attributes work inside shadow
roots too (the resolver also matches `:host`).

## The roles (what a control reads)

| Role | What it is |
|---|---|
| `--control-height` | the control's block-size, and the side of an icon-only square |
| `--control-inset` | the inline edge padding, `(height − icon) / 2` (the centering law) |
| `--control-text` | the label's font-size, composed from the type system's UI text at this height |
| `--control-icon` | the icon box, a square every glyph sits in |
| `--control-caption-text` | the font-size of a caption or note under a choice control |
| `--control-icon-ratio` | `icon / height`, unitless; the resolver uses it to form `--radius-mark` |
| `--chip-height` / `--chip-inset` / `--chip-text` | the compact row inside the control: kbd, tooltip, stepper markers, inline code, OTP cells |
| `--control-part-height` | `height − inset`: a repeated part (segment, tab, option) inside a control-sized container |
| `--control-part-inset` | `inset / 2`: the container's padding and the part's own inline inset |
| `--radius-control` | the control's corner (follows `data-radius`) |
| `--radius-mark` | the corner of a checkbox, switch thumb, legend swatch |
| `--radius-inset` | the corner of a badge or tag nested in the control |
| `--radius-card` | the corner of a card or popover that wraps controls |

The roles double as per-instance hooks: `style="--control-height: 45px"` on one element overrides that
element (its `--radius-*` roles follow), while its descendants re-resolve from context as usual.

## Recipes

**Button**: `block-size: var(--control-height); padding-inline: var(--control-inset);
font-size: var(--control-text); border-radius: var(--radius-control); gap: calc(var(--control-inset) / 2);`
(font family and weight are typography-tokens' UI-control voice).

- **With a leading icon:** the icon is `inline-size: var(--control-icon); block-size: var(--control-icon)`;
  the padding stays `--control-inset`.
- **Icon-only:** `inline-size: var(--control-height)` (a height square), padding 0, the icon centered.
- **Dropdown/select:** the caret sits in a `--control-icon` box at `font-size: var(--control-text)`.

**Input / select field**: `block-size: var(--control-height)`, `padding-inline: var(--control-inset)`,
border `--border-thin` (color from color-tokens), radius `--radius-control`, value text
`font-size: var(--control-text)`.

**Tag / badge / kbd**: see [`detail.md`](detail.md).

## Compound containers: segmented controls, tabs, listboxes, menus

A container of repeated parts takes half of the part's inset, and the part gives up the same half, so
the part's content and the container's outer size stay where a lone control would put them. The radius
composes the same way: the container keeps `--radius-control`, the part takes `--radius-inset` (the
control radius minus that half), so the two corners stay concentric.

```css
.segmented {
  display: inline-flex;
  min-block-size: var(--control-height);
  padding: calc(var(--control-part-inset) - var(--border-thin));
  border: var(--border-thin) solid;
  border-radius: var(--radius-control);
}
.segmented > .segment {
  block-size: var(--control-part-height);
  padding-inline: var(--control-part-inset);
  font-size: var(--control-text);
  border-radius: var(--radius-inset);
}
.listbox {
  padding: var(--control-part-inset);
  border-radius: var(--radius-card);
}
.listbox > [role="option"] {
  min-block-size: var(--control-height);
  padding-inline: var(--control-inset);
  border-radius: var(--radius-control);
}
.icon-button {
  inline-size: var(--control-height);
  block-size: var(--control-height);
  padding: 0;
  display: inline-grid;
  place-items: center;
}
```

A listbox or menu wrap goes the other way round: its options are full controls, so the wrap takes
`--radius-card` (the control radius plus half the inset) around `--radius-control` options.

`--chip-*` is a different thing. The chip snaps to a ladder row at or below `height − inset`, so it is
a real row of the table; the part is exact arithmetic on the cell. On the three smallest micro cells no
ladder row sits that low, so the chip is taller than the part there; size a segment from the part,
never from the chip.

## Radius modes

`data-radius` sets how `--radius-control` follows the cell: `round` (the control's text size), `default`
(half the text size), `sharp` (a quarter of it), `pill` (half the height, a full pill). The other three
radius roles derive from it, so one attribute restyles every corner in the subtree.

## Raw cell primitives

`--size-{tier}-{scale}-{size}-{field}` (for example `--size-product-md-md-height`) is one cell's value,
fixed regardless of context. Use it only for a one-off that must not follow context, such as a
specimen of a specific cell. The primitive's `radius-*` fields carry the kit's radius mode, not the
nearest `data-radius`.

## Don't

- Don't hardcode a control height (`height: 40px`); bind `--control-height` and set the context.
- Don't set padding that isn't `--control-inset`; you'll un-center the glyph.
- Don't put `--radius-md` on a control; use `--radius-control` so it follows the radius mode.
- Don't bind a raw `--size-*` primitive in a component; the component stops following context.
