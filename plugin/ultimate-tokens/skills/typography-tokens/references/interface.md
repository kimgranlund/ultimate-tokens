# Interface text: the `UI-control` + `UI-widget` voices (and `label`, `kicker`, the monos)

Everything you *operate* is one of the two INTERACTIVE voices: **UI-control**
(buttons, inputs, selects, menu items, control-box text) and **UI-widget** (tags, badges, switches,
checks, compact widget text), both on `--font-ui`, both one step, `md` (sized from the
height-indexed UI text table), both with a
**single-line height** (`-line-single`, leading 1.0) for text locked in a box. **Label** is the
STATIC label voice, field labels, table cells, captions-adjacent chrome, prose flow (it may
wrap; it has `-line` only, no `-line-single`).

## Control & component text

| Element | Class | Line |
|---|---|---|
| default button / input value / menu item | `.type-ui-control-md` | `-line-single` (single-line control) |
| large / prominent button | `.type-ui-control-md` | `-line-single` |
| small / dense button, compact control | `.type-ui-control-md` | `-line-single` |
| badge / chip / tag / switch label | `.type-ui-widget-md` | `-line-single` |
| field label, table cell, column header | `.type-label-sm` / `-md` | `-line` (static text, may wrap) |
| helper / error text under a field | `.type-label-sm` | `-line` |
| caption / metadata / timestamp | `.type-tiny-md` | `-line` (prose, `tiny` rides `ui`'s font but wraps) |
| tooltip | `.type-label-sm` | `-line` |

**Single-line vs multi-line:** interactive text that never wraps (a button, an input value, a badge)
uses `--type-ui-control-md-line-single` / `--type-ui-widget-md-line-single` so the box height
is exact; anything that may wrap (labels, helper text, tooltips) is `label`/`tiny` with `-line`. The
`.type-ui-control-*` classes ship the multi-line `-line`; switch to `-line-single` explicitly on
single-line controls (or the box grows on wrap).

## Composing with control geometry

Control TEXT is the `UI-control` voice; the control's BOX (height, padding, radius) is
geometry-tokens' `--size-*`. They compose: a `.control-md` box (geometry) pairs with
`.type-ui-control-md` text. The voice's one size is the height-indexed UI text table's row for
the 32px control, and a per-cell override on the voice (`UI-control|MD`, say) moves that size.
Match the step across the two systems, `.control-md` with `.type-ui-control-md`, and let the
box fit the text.

## Monospace in the interface

`body-mono` (pegged to `body`'s own sizes) for keyboard shortcuts (`.type-body-mono-sm`), technical
values, tabular figures in a table (`.type-body-mono-md` for alignment), inline tokens in settings.
`label-mono` (pegged to `label`'s own sizes) is the same idea at label scale, an ID, a version tag,
a status readout (`.type-label-mono-sm`) where `label` itself would be the right size but the wrong
(proportional) face. Both are prose-flow voices, `-line` only; single-line box text is
the UI voices' job.

## Don't

- Don't use `body` for buttons, interactive chrome is `UI-control`/`UI-widget` (body's leading and
  rhythm are tuned for reading paragraphs, not fitting a control).
- Don't use `label` for a button or badge, `label` is static text; it has no
  `-line-single` and its rhythm is prose.
- Don't set control `line-height` by hand, use `-line-single`; that IS the fit.
- Don't invent sizes between steps, each voice's own ramp is fixed (sm/md/lg, or the two interactive voices'
  one md step); there's a step for it.
