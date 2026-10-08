# Glyphs, marks, badges, hit targets, focus rings

## Icons and indicators: one box

There is no caret, gap, or glyph-size token. Every glyph sits in one square box,
`inline-size: var(--control-icon); block-size: var(--control-icon)`:

- An **icon** fills the box (`font-size: var(--control-icon)` for an icon font, or the SVG at 100%).
- An **indicator** (caret, chevron, dot, count) sits in the same box at
  `font-size: var(--control-text)`, so it is text-sized and still aligned with the icons beside it.
- The **icon-to-label gap** is `calc(var(--control-inset) / 2)`.

A standalone or decorative icon takes the `--control-icon` of the context it sits in; set `data-size`
on it to step it up or down. Icon color is color-tokens (icons inherit their text partner's role).

## Marks: checkbox, radio, switch

- Checkbox and radio boxes are `--control-icon` squares. The checkbox corner is
  `min(var(--radius-mark), calc(0.3 * var(--control-icon)))`; the radio is `50%` with a
  `calc(var(--control-icon) / 2)` dot.
- A switch track is `calc(1.75 * var(--control-icon))` by `--control-icon`, its thumb
  `calc(var(--control-icon) - 2 * <edge>)` with corner `--radius-mark`.
- A caption or note under a choice control is `font-size: var(--control-caption-text)`.

## Badges, tags, chips

- A **badge** is `calc(var(--control-height) - var(--control-inset))` tall with `--radius-inset`.
- A **tag** is full `--control-height` with `--radius-inset`.
- A **chip** (kbd, tooltip, stepper marker, breadcrumb separator, inline code, OTP cell) is the
  compact row: `block-size: var(--chip-height); padding-inline: var(--chip-inset);
  font-size: var(--chip-text)`.

## Hit targets and minimum size

An icon-only control is a height square, `inline-size: var(--control-height)`; the cell's
`min-width` field (`--size-{tier}-{scale}-{size}-min-width`) records that same 1:1 floor. For touch
surfaces, choose a context whose height clears the platform hit-target floor (about 44px):
`content-sm-lg`, `content-md-md` and up, or `product-lg-lg`. Don't drop an interactive control into
the `micro` tier on touch.

## Focus rings (every focusable element)

One recipe app-wide: `outline: var(--focus-ring-width) solid <accent>; outline-offset:
var(--focus-ring-offset);`, the WIDTH and OFFSET are geometry tokens; the COLOR is color-tokens'
accent (`--c-{p}`). The offset keeps the ring clear of the control edge so it survives any radius
(including the pill). Never remove a focus ring without replacing it, and never hardcode its width.

## Borders

`--border-thin` (1px hairlines, field borders, dividers, the default) and `--border-thick` (2px
emphasis). These are constants, NOT part of the space rhythm, a hairline is a hairline at every
density. Color comes from color-tokens' outline roles.

## The radius ladder vs the control roles

- `--radius-{none|xs|sm|md|lg|xl}`: the Material 3 ladder for free-standing CONTAINER corners.
- `--radius-full` (9999), a pill/circle: avatars, dots, standalone pills.
- `--radius-control`, `--radius-mark`, `--radius-inset`, `--radius-card`: the corners that follow
  the control's cell and the `data-radius` mode. Use these on controls and what nests in or wraps them.

## Don't

- Don't size an in-control icon independently of `--control-icon` (breaks centering).
- Don't add a gap token; the gap is `calc(var(--control-inset) / 2)`.
- Don't shrink interactive controls below the hit-target floor on touch.
- Don't hardcode focus-ring width/offset or border width.
