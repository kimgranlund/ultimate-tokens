// resolve.mjs — the group-chroma resolvers (SPEC spec-muted-base-key-spikes 0.3.0, REQ-002/004/008,
// Risk 0b: "one shared resolver imported by both, never two copies"). Pure, no DOM, no UI import —
// the SAME two functions are imported by src/ui/model.mjs's projectView AND this directory's own
// exports.js's derivePalette, so the canvas and every export format can never resolve a palette's
// chroma differently. `palette.group` must already be a DEFINITE, resolved group id (the by-name
// default rule — Neutral -> material, etc — is a document-naming concern that lives in model.mjs's
// paletteGroup(), outside this module's scope); `paletteGroups` must already be default-filled
// (model.mjs's resolvePaletteGroups()); `controls` carries the two global fallbacks as `baseChroma`/
// `primeChroma` (never the document's own field name for that fallback — AC-004 bars it, in any
// form, under src/engine; model.mjs renames it at that one boundary before calling in here).

// rampChromaOf(palette, paletteGroups, controls) — REQ-002: the ABSOLUTE chroma target paletteStops
// shapes and damps for `palette`. There is no per-palette ramp override in any group any more — a
// palette's own chroma value, or any retired per-palette field it might still carry, never reaches
// this function's return.
export function rampChromaOf(palette, paletteGroups, controls) {
  const g = (paletteGroups && paletteGroups[palette.group]) || {};
  return g.baseChroma ?? controls.baseChroma;
}

// primeChromaOf(palette, paletteGroups, controls) — REQ-008: palette.primeChroma ?? group.primeChroma
// ?? controls.primeChroma, EXCEPT a locked group (Data) ignores the per-palette override entirely —
// it stays in storage, just unused while grouped as Data, and becomes live again the moment the
// palette moves to another group (the short-circuit below simply stops applying).
export function primeChromaOf(palette, paletteGroups, controls) {
  const g = (paletteGroups && paletteGroups[palette.group]) || {};
  if (g.locked) return g.primeChroma;
  return palette.primeChroma ?? g.primeChroma ?? controls.primeChroma;
}
