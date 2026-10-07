// resolve.mjs, the two-layer chroma resolvers (SPEC spec-muted-base-key-spikes 0.3.0, REQ-002/004/008,
// Risk 0b: "one shared resolver imported by both, never two copies"). Pure, no DOM, no UI import,
// the SAME two functions are imported by src/ui/model.mjs's projectView AND this directory's own
// exports.js's derivePalette, so the canvas and every export format can never resolve a palette's
// chroma differently. Two layers, multiplied once here (#804): the palette's OWN `baseChroma` (0..100,
// absent means 100) and the two global k factors `controls` carries as `baseChroma`/`primeChroma`
// (0..100, absent means 100; never the document's own field name for the base factor, AC-004 bars
// it, in any form, under src/engine; model.mjs renames it at that one boundary before calling in here).
// There is no group layer: a palette's canvas group is grouping metadata only, it never reaches here.

// rampChromaOf(palette, controls), REQ-002: the chroma damper paletteStops applies to `palette`'s
// at-100 ramp (#785, R94: every stop's chroma times this / 100, tonal.js `dampStops`). The palette's
// own Base chroma times the global k, formed once. `dampStops` is linear in that ratio with an
// `r >= 1` no-op, so the product is order-free and a palette at 100 under k 100 is the ramp as sampled.
// A palette's own `chroma` never reaches this function's return.
export function rampChromaOf(palette, controls) {
  return ((palette.baseChroma ?? 100) * (controls.baseChroma ?? 100)) / 100;
}

// primeChromaOf(palette, controls), REQ-008: the global prime k factor, the same for every palette.
// There is no per-palette prime override any more; `palette` stays in the signature so both
// resolvers share one call shape.
export function primeChromaOf(palette, controls) {
  return controls.primeChroma ?? 100;
}
