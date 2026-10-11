# Adia → Radix / Park UI adaptation pattern

Distilled from the source document supplied for issue #588 (`ADIA-RADIX-PARK-ADAPTATION.md`,
not committed verbatim, see below) plus the canonical table now committed at
`docs/reference/data/radix-projection.json`. This doc is the durable, in-repo record; the
Desktop original is no longer the reference copy.

## The core rule

Radix is a compatibility PROJECTION over Adia tokens, never the source color system. Adia's
tonal ramp, prime swatches, and scrim alphas remain the source of truth; the Radix 1–12 (and
`a1–a12`) shape exists only so Park UI recipes and Panda `colorPalette` semantics can consume
Adia colors through the interface they expect.

**Source-of-truth direction is never inverted.** The dependency graph is one-way:

```
Adia primitives (050–950, prime-*, scrim-*)
      -> Adia semantics (background, surface, primary, on-surface, …)
      -> Radix compatibility projection (1–12, a1–a12)
      -> Panda colorPalette / Park UI recipes
```

Adia primitives must never be authored or adjusted in terms of Radix step numbers; the arrow
only ever points from Adia toward Radix/Panda/Park.

## Prime and Scrim stay separate namespaces

Adia's `prime-*` (expressive/brand-oriented, high-chroma) and `scrim-*` (alpha compositing
primitives) families keep their own namespace (`colors.{family}.prime.*`, `colors.{family}.scrim.*`)
alongside the projected ladder; they are never renamed or folded into it. Since ADR-038 (T-0047,
2026-10-11) the ladder READS four prime rungs: steps 7 to 10 point at the saturated identity
swatches rather than base ramp stops, so step 9 is the brand colour itself, as in Radix. The rungs
stay prime primitives (`--{pfx}-{family}-prime-*`); the ladder references them, it does not copy
them into a new name. Scrims are still never projected.

## Exceptions are data, not hidden component fixes

The projection is one typed mapping object, applied uniformly to every compatible family
(`neutral, primary, secondary, tertiary, info, success, warning, danger, data-1..8`), never
hand-authored per family. A family whose default mapping fails (WCAG contrast, indistinguishable
interactive states, gamut clipping, etc.) gets a named override entry in the SAME table
(e.g. `radixOverrides.warning[9] = { light: "500", dark: "400" }`), never a special-cased fix
buried in a component or recipe.

## The four-layer architecture

1. **Adia primitives**: the dense opaque 050–950 ramp, plus `prime-*` and `scrim-*`, per family.
2. **Adia semantics**: mode-aware aliases (`background`, `surface`, `primary`, `on-surface`, …),
   valid and useful independently of Radix.
3. **Radix compatibility projection**: the canonical 1–12 mapping in
   `docs/reference/data/radix-projection.json`, generated from one typed table, never sampled
   evenly across the ramp (Radix numbers are functional roles, not tone samples).
4. **Panda / Park UI**: `colorPalette` semantic tokens and Park recipes consume the projected
   ladder only; they stay unaware of Adia's own primitive stop numbers.

## Canonical table (2026-09-11, issue #588; steps 7 to 10 since 2026-10-11, ADR-038)

Steps 1–6 are RAW RAMP STOPS, opaque values read directly from each family's own tonal ramp at
the exact stop listed, never role-indirected and never flattened over white/black. Steps 7–10
read the family's PRIME LADDER (ADR-038, T-0047), mode-independent swatches, so step 9 is the same
brand colour in both modes; dark step 7 keeps the raw stop 700, because no rung lies between stop
750 and `prime-dim` in dark mode. Steps 11–12 are role-derived (`on-surface-variant` /
`on-surface`), unchanged from the original ratification:

| Step | Light | Dark | Functional role |
|---|---|---|---|
| 1 | 100 | 900 | app background |
| 2 | 125 | 875 | subtle background |
| 3 | 150 | 850 | component background |
| 4 | 175 | 825 | component hover background |
| 5 | 200 | 800 | component active/selected background |
| 6 | 250 | 750 | subtle border/separator |
| 7 | prime-brightest | 700 | interactive border |
| 8 | prime-brighter | prime-dim | strong border/focus |
| 9 | prime | prime | solid accent |
| 10 | prime-dim | prime-bright | solid accent hover |
| 11 | 750 | 250 | secondary text |
| 12 | 950 | 050 | primary text |

The solid foreground (`on-accent`) is measured against the fill it sits on, the prime: under the
default `contrast` on-colour policy it is the better of the ramp ends 050/950 if that clears WCAG
AA, else white or black, one value in both modes (ADR-038).

## Source material

The full worked-example CSS (`adia-tokens.css`, ~1600 lines / 147 KB) is not committed here,
it is a generated example output, not the pattern itself. The pattern and the table above are
what's durable; regenerate a worked example from `docs/reference/data/radix-projection.json`
plus this repo's own engine rather than diffing against the Desktop file.
