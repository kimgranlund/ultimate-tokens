// layers.mjs, the compute-layer registry (ADR-033, compute-layers #788; vanilla ESM, pure, no DOM).
//
// A layer is a named, versioned, pure stage of the brand-kit pipeline: { id, version, inputs,
// outputs, run }. `run` is the engine function that stage already is, strict-equal to its export, so
// the registry names today's code and adds none. `inputs` and `outputs` are the keys the stage reads
// and writes: an input is a key of the document (`defaultDocument()`) or another layer's output,
// written `<layer-id>.<name>`; test/engine/layers.mjs checks the graph (known inputs, no cycle, the
// type -> geometry and ramp -> roles orders). Every layer is at version 1 here; a version bump is a
// later unit's job (pins and frozen versions, U4).
//
// Six layers: controls, ramp, prime, roles, type, geometry. There is no `group-chroma` layer: the
// group chroma stage was retired by #804 (ADR-030), a palette's canvas group carries no chroma, and
// each palette's ramp and prime chroma are its own Base chroma times the two global k factors, formed
// in resolve.mjs. compute() forms them below as input shaping for the ramp and prime layers.
//
// compute(doc) is the one evaluator: it walks the colour layers in graph order and returns their
// outputs, and model.mjs's projectView and exports.js's derivedAll are both views over that one
// result, so the canvas and every export run the role chain once, in one place. `run` of `roles` is
// resolveRoles below, the whole chain (table, accent ref, on-colour policy, per-doc overrides). Not
// here yet, by plan: the document pins (U4).
//
// type and geometry are registered but compute does not walk them: their scales are indexed by
// breakpoint mode (one per mode, each with that mode's token overrides), and model.mjs's
// typeScaleFor/geomScaleFor stay their evaluator; geometry composes from the base type scale
// (`geomScale(config, { typeScale })`, the 27-cell ladder, ADR-032).
//
// `controls` declares the document keys resolveControls reads that the document names the same
// way. The global Base chroma k is the one it does not list: the document keeps its own name for it
// and src/engine never spells that name (AC-004), so model.mjs renames it to `baseChroma` before
// calling in, and the field stays out of this list.

import { resolveControls } from "./controls.mjs";
import { rampChromaOf, primeChromaOf } from "./resolve.mjs";
import { paletteStops, EXPORT_STOPS } from "./tonal.js";
import { primeSwatches } from "./prime.mjs";
import { semanticRoles, applyAccentRef, applyOnColorContrast, applyRoleOverrides } from "./semantic.js";
import { typeScale } from "./type.mjs";
import { geomScale } from "./geometry.mjs";

// slug, a palette name as its token prefix ("Data 1" -> "data-1"); the roles are keyed on it.
export function slug(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// relLum, WCAG relative luminance of an 8-bit sRGB triple: the on-colour policy's contrast input.
export const relLum = (rgb) => {
  const c = rgb.map((v) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

// resolveRoles(n, stops, controls, overrides), the role chain: the 53-role table keyed on slug `n`,
// the accent ref ("single" re-points the accents at the prime 500), the on-colour policy (in
// "contrast" mode an accent on-colour flips to the better-contrasting end over its fill on `stops`),
// then the per-doc overrides last, so an explicit re-point always wins. Returns the roles as refs.
export function resolveRoles(n, stops, controls, overrides) {
  const byStop = new Map(stops.map((s) => [s.stop, s.rgb]));
  const lumOf = (ref) => { const rgb = byStop.get(Number(ref)); return rgb ? relLum(rgb) : 0; };
  const accented = applyAccentRef(semanticRoles(n), controls.accentRef);
  return applyRoleOverrides(applyOnColorContrast(accented, n, lumOf, controls.onColorMode), overrides);
}

const layer = (id, inputs, outputs, run) => Object.freeze({ id, version: 1, inputs: Object.freeze(inputs), outputs: Object.freeze(outputs), run });

export const LAYERS = Object.freeze({
  controls: layer("controls",
    ["curve", "tension", "lmin", "lmax", "damp", "dampCurve", "dampAmp", "dampBias", "hueSpace", "relChroma", "chromaFloor", "toneMode", "vibrancy", "onColorMode", "accentRef", "primeChroma"],
    ["controls.resolved"], resolveControls),
  ramp: layer("ramp",
    ["palettes", "controls.resolved"],
    ["ramp.stops"], paletteStops),
  prime: layer("prime",
    ["palettes", "controls.resolved"],
    ["prime.swatches"], primeSwatches),
  roles: layer("roles",
    ["palettes", "controls.resolved", "ramp.stops", "roleOverrides"],
    ["roles.table"], resolveRoles),
  type: layer("type",
    ["type"],
    ["type.scale"], typeScale),
  geometry: layer("geometry",
    ["geometry", "type.scale"],
    ["geometry.scale"], geomScale),
});

// compute(doc, registry), the colour layers evaluated once over an exporter-shaped document (model.mjs's
// stateOf: the global Base chroma k under its exporter name `baseChroma`). Every palette is computed,
// enabled or not, in document order; a view filters. Each palette's ramp chroma (its own Base chroma
// times the global k) and prime chroma (the global prime k) are formed by resolve.mjs's
// rampChromaOf/primeChromaOf as input shaping, then the ramp, prime and roles layers run. Returns the
// `controls.resolved` output and, per palette, `{ palette, n, rampChroma, primeChroma, stops, prime,
// roles }`: `ramp.stops` (the 25 EXPORT_STOPS), `prime.swatches` and `roles.table`. Each layer is
// called through its registry entry with one fixed call shape per id, the shape a later version of
// that layer keeps.
export function compute(doc, registry = LAYERS) {
  const controls = registry.controls.run(doc);
  const palettes = (doc.palettes ?? []).map((p) => {
    const n = slug(p.name);
    const rampChroma = rampChromaOf(p, controls);
    const primeChroma = primeChromaOf(p, controls);
    const stops = registry.ramp.run(
      { hue: p.hue, chroma: rampChroma, skew: p.skew, lift: p.lift, hueShift: p.hueShift, hueSameDir: p.hueSameDir, cuspPull: p.cuspPull, anchor: p.anchor },
      controls,
      EXPORT_STOPS,
    );
    // the prime ladder reads the palette's OWN chroma (never the ramp's damper) and the resolved prime
    // k; `primeChroma` is cleared on the palette so prime.mjs's own `palette.primeChroma ??
    // controls.primeChroma` falls through to that resolved value, whatever a stray palette carries.
    const prime = registry.prime.run(
      { hue: p.hue, chroma: p.chroma, skew: p.skew, hueShift: p.hueShift, hueSameDir: p.hueSameDir, anchor: p.anchor, primeChroma: undefined },
      { ...controls, primeChroma },
    );
    const roles = registry.roles.run(n, stops, controls, doc.roleOverrides);
    return { palette: p, n, rampChroma, primeChroma, stops, prime, roles };
  });
  return { controls, palettes };
}
