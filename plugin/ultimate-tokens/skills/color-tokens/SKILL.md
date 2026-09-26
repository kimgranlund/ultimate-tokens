---
name: color-tokens
description: >
  Use when choosing the COLOR of any UI in a project that carries an Ultimate Tokens export, the
  color/hue/palette/role for a button, control, text, card, modal, nav, toast, border, or state
  ("which color should this use", "what token for this background/text", "add hover/disabled colors",
  "wire the color theme", "make the colors work in dark mode", "why is this the wrong color"). The
  consumption guide for the 53-role semantic COLOR layer: how to find and bind the project's exported
  palettes, the pairing laws that keep every foreground on a legal background, the state families, and
  per-surface role maps for interactive elements, text, containers, feedback, and navigation. Never
  guess a hex and never use a raw stop, this names the semantic role for every job. Scope is COLOR
  only (not font/size/weight, not radius/spacing/density, those are the sibling token skills).
---

# Using Ultimate Tokens color roles

An Ultimate Tokens export gives every palette the same **53 semantic roles** as CSS custom
properties. Your job is never to invent a color, it is to pick the right **role** from the right
**palette**. Raw stops exist only as the substrate the roles reference.
Each palette also carries a `prime` group: seven raw swatches, `--{n}-prime-brightest` through
`--{n}-prime-dimmest` (centered on bare `--{n}-prime`). These are primitives, not roles: one
mode-independent set, the same in light and dark, computed on the key colour's own lightness ladder
rather than the ramp. No role aliases a prime swatch and none ever will (SPEC REQ-054). Reach for one
only where the design itself steps outside role territory: a hero or brand moment that wants the
identity colour at full intensity, or a data-viz series that needs several shades of one hue (a
heatmap, an intensity bar). Every ordinary surface, text, control, and state still binds to a role; a
bare prime swatch in component code is the same defect as a raw stop.

**Data series.** The default kit's eight-hue `data-1`…`data-8` family (step 2 below) is not a
special construct, each is an ordinary palette, chroma peers of one another by construction (SPEC
0.3.0), that happens to make a good chart-series set: the same 53 roles, and its own `prime` swatches
for a series that needs several shades of one hue. They bind to shadcn's `--chart-N` slots (read the
export's own generated CSS for how many the kit at hand defines); use those shadcn vars as a chart
library's series-color source, and the data palettes' own roles for everything else around the chart
(legends, tooltips, axis text).

## Bind to the project first (always step 1)

1. **Find the export.** A CSS file whose `:root` sets `color-scheme: light dark` and defines the
   colour variables via `light-dark(...)` (often `palette.css` / `tokens.css`; a DTCG
   `*.tokens.json` may sit beside it). If none exists, stop and ask, do not fabricate tokens.
   **The prefix is configurable:** the default is `--c-*`, but a kit may export a Material-flavoured
   `--md-sys-color-*` or a custom `--{brand}-*` prefix, **read the actual prefix from the file** and
   use it throughout; the examples below use `--c-` as the default, but the role grammar after the
   prefix (`-{palette}-{role}`) is identical. *This guide is for the CSS export;* the Tailwind
   (`--color-*`), shadcn, Panda CSS, and Radix exports use different grammars, the role SEMANTICS
   still hold. Panda CSS: `colors.{palette}.{role}` in the preset object maps to `--colors-{palette}-
   {role}` at runtime, with the bare accent role as the group's `DEFAULT` (`colors.{palette}.DEFAULT`).
   Radix: driver-aliased semantic keys (`colorPalette.solid.bg` and its `accent`/`gray` siblings, the
   same shape Park UI/Panda consume), `accent` is the brand's primary palette, `gray` is its neutral,
   not a literal palette name. A palette actually named after one of the seven alias keys (`accent`,
   `gray`, `error`, `fg`, `canvas`, `border`, `bg`) is exported under `<slug>-palette` instead. A kit
   may hand you either of two Radix files: the values form (`{s}.preset.mjs`, baked `oklch(...)`
   colors, self-contained) or the reference form (`{s}.refs.preset.mjs`, every numbered step a
   `var(--c-*)` link); the reference form only resolves once the kit's CSS or OKLCH export is also
   loaded, since its step values are links into that layer, not colors of their own.
2. **Enumerate the palettes.** Every `--c-<slug>-050` line marks a palette. The default kit ships
   a neutral, a brand accent plus its own supporting accents, the four intents, and an eight-hue
   data family (currently sixteen palettes), but kits vary; read what's actually there rather than
   assuming the default set.
3. **Classify them.** The **chrome palette** (usually `neutral`, the lowest-chroma one) drives
   backgrounds, surfaces, text, and outlines app-wide. The **brand accent** (usually `primary`)
   drives CTAs, links, focus, selection. **Intent palettes** (`info/success/warning/danger`) are
   reserved for meaning, never decoration. Remaining palettes are supporting accents.
4. **Know the grammar.** Semantic = `--c-{p}{suffix}` (the accent itself is bare `--c-{p}`; e.g.
   `--c-neutral-on-surface`, `--c-primary-hover`). Raw = `--c-{p}-050…950` solids and
   `--c-{p}-scrim-{step}` translucents (ADR-016), **never use raws in UI code**.

## The laws (violating any of these is a defect)

1. **Roles, not raws, not hexes.** If a color isn't a semantic role, it doesn't go in UI code.
2. **The pairing law.** A foreground sits only on its own base family: `-on-primary` only on
   `--c-{p}` fills (and their hover/active); the `-on-surface` family only on that same palette's
   background/surface/container tiers. Never cross palettes mid-pair (text `--c-neutral-on-surface`
   on a `--c-success-container` fill is a violation, use `--c-success-on-surface`).
3. **States ship as families.** Wherever a reference lists a `-hover` / `-active` / `-disabled`
   sibling, use it verbatim, never synthesize a state with `opacity`, `color-mix()`, or a raw
   stop. If a state role exists, hand-rolling it is a defect. (Not every role has states, the
   references are the exact map; don't assume a sibling that isn't listed.)
4. **The scheme is baked in.** Every role flips via `light-dark()`, write each color ONCE, no
   `@media (prefers-color-scheme)` per-color overrides, no `.dark` class swaps. To force a subtree
   into one scheme (a preview pane, an always-dark hero), set `color-scheme: light` / `dark` on it,
   the roles follow.
5. **Elevation is a surface ladder, not a shadow.** Raise/recess with `-surface-low/-high` (…`est`)
   and `-surface-dim/-bright`; shadows are optional garnish on top. See containers.md for the
   mirror/non-mirror distinction, it's exact and easy to get wrong.
6. **On-colors are fixed light BY DESIGN (do not "fix" this).** `-on-primary` / `-on-primary-variant`
   resolve to the palette's light end in BOTH modes, for all palettes, a deliberate brand decision
   (the product's ADR-003/OD-001) that intentionally overrides per-pair contrast math (e.g. white on
   a warning-yellow fill). Do not swap in black text, auto-contrast logic, or your own dark variant.
   If a client insists on WCAG-floor text on fills, raise it as a kit-level decision, never patch it
   locally.

## Surface map: where to look things up

| Building… | Reference |
|---|---|
| Buttons (all variants + states), inputs, selects, checkboxes/radios/switches, sliders, placeholder/focus/selection | [`references/interactive.md`](references/interactive.md) |
| Text hierarchy, headings, links-in-prose, code, disabled text, the accent `-dim/-bright/-low/-high` variants | [`references/text.md`](references/text.md) |
| Cards, panes, sheets, modals, canvas, page background, elevation tiers, dividers/borders | [`references/containers.md`](references/containers.md) |
| Status/intent UI (info·success·warning·danger), toasts/snackbars, banners, overlays & scrims, skeletons/loading, badges | [`references/feedback.md`](references/feedback.md) |
| Navs, tabs, menus, selection/highlight, links-as-chrome, icons, focus rings, data-viz series | [`references/navigation.md`](references/navigation.md) |

## Verify before you ship

- Every color in the diff is a `--c-*{role}` semantic var (grep the diff for `#`, `rgb(`, `oklch(`,
  and `--c-.*-\d` raws, all four should come up empty in UI code).
- Every fg/bg pair obeys the pairing law (same palette, matching family).
- Interactive elements use the full state family (hover, active, disabled, not just base).
- Skill maintainers: `node scripts/role-parity.mjs` gates every role named in these files against
  the product's canonical role table (runs in the product repo's `npm test`; outside it, it no-ops).
