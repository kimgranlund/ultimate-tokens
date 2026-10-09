// layers.mjs, the compute-layer registry (ADR-034, compute-layers #788; vanilla ESM, pure, no DOM).
//
// A layer is a named, versioned, pure stage of the brand-kit pipeline: { id, version, inputs,
// outputs, run }. `run` is the engine function that stage already is, strict-equal to its export, so
// the registry names today's code and adds none. `inputs` and `outputs` are the keys the stage reads
// and writes: an input is a key of the document (`defaultDocument()`) or another layer's output,
// written `<layer-id>.<name>`; test/engine/layers.mjs checks the graph (known inputs, no cycle, the
// type -> geometry and ramp -> roles orders).
//
// Six layers: controls, ramp, prime, roles, type, geometry. There is no `group-chroma` layer: the
// group chroma stage was retired by #804 (ADR-030), a palette's canvas group carries no chroma, and
// each palette's ramp and prime chroma are its own Base chroma times the two global k factors, formed
// in resolve.mjs. compute() forms them below as input shaping for the ramp and prime layers.
//
// Versions and pins. LAYERS holds each layer's latest version; REGISTRY holds every runnable
// version, LAYERS's plus each earlier version frozen as `./layers/<id>@<n>.mjs` (never edited once
// landed, hash-gated by ./layers/FROZEN.json). A document's `layers` map pins one version per id
// (layer-pins.mjs's rule, clamped to the registry's latest); compute and runOf run the pinned
// version, never the latest by default. A new document and a preset pin the latest (model.mjs's
// defaultDocument, persist.js's presetDoc); a stored document keeps its pins (R100).
//
// compute(doc) is the one evaluator of the colour layers: it walks them in graph order and returns
// their outputs, and model.mjs's projectView and exports.js's derivedAll are both views over that one
// result, so the canvas and every export run the role chain once, in one place. `run` of `roles` is
// resolveRoles below, the whole chain (table, accent ref, on-colour policy, per-doc overrides).
//
// type and geometry are mode layers: compute does not walk them, because their scales are indexed by
// breakpoint mode (one per mode, each with that mode's token overrides). model.mjs's
// typeScaleFor/geomScaleFor stay the per-mode evaluator and call the pinned version through runOf;
// geometry composes from the base type scale (`geomScale(config, { typeScale })`, the 27-cell
// ladder, ADR-032).
//
// `controls` declares the document keys resolveControls reads that the document names the same
// way. The global Base chroma k is the one it does not list: the document keeps its own name for it
// and src/engine never spells that name (AC-004), so model.mjs renames it to `baseChroma` before
// calling in, and the field stays out of this list.

import { resolveControls } from "./controls.mjs";
import { rampChromaOf, primeChromaOf } from "./resolve.mjs";
import { paletteStops, EXPORT_STOPS } from "./tonal.js";
import { paletteStops as paletteStopsV1 } from "./layers/ramp@1.mjs";
import { primeSwatches } from "./prime.mjs";
import { semanticRoles, applyAccentRef, applyOnColorContrast, applyRoleOverrides } from "./semantic.js";
import { typeScale } from "./type.mjs";
import { geomScale } from "./geometry.mjs";
import { pinsOf } from "./layer-pins.mjs";

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

const layer = (id, version, inputs, outputs, run) => Object.freeze({ id, version, inputs: Object.freeze(inputs), outputs: Object.freeze(outputs), run });

export const LAYERS = Object.freeze({
  controls: layer("controls", 1,
    ["curve", "tension", "lmin", "lmax", "damp", "dampCurve", "dampAmp", "dampBias", "hueSpace", "relChroma", "matchPeerLightness", "chromaFloor", "toneMode", "vibrancy", "onColorMode", "accentRef", "primeChroma"],
    ["controls.resolved"], resolveControls),
  ramp: layer("ramp", 2,
    ["palettes", "controls.resolved"],
    ["ramp.stops"], paletteStops),
  prime: layer("prime", 1,
    ["palettes", "controls.resolved"],
    ["prime.swatches"], primeSwatches),
  roles: layer("roles", 1,
    ["palettes", "controls.resolved", "ramp.stops", "roleOverrides"],
    ["roles.table"], resolveRoles),
  type: layer("type", 1,
    ["type"],
    ["type.scale"], typeScale),
  geometry: layer("geometry", 1,
    ["geometry", "type.scale"],
    ["geometry.scale"], geomScale),
});

// REGISTRY, every runnable layer version: each layer's latest (LAYERS) plus the frozen earlier
// versions under ./layers/ (ramp@1, the ramp before T-0040; a version bump imports the frozen file and
// lists it here). A test registers its own versions by passing a longer list as `registry`.
export const REGISTRY = Object.freeze([...Object.values(LAYERS), layer("ramp", 1, ["palettes", "controls.resolved"], ["ramp.stops"], paletteStopsV1)]);

// latestOf(registry), { [id]: highest registered version }, in registry order.
export function latestOf(registry) {
  const out = {};
  for (const l of registry) if (out[l.id] === undefined || l.version > out[l.id]) out[l.id] = l.version;
  return out;
}

// layerAt(registry, id, version), the one registered layer at that version; an unregistered pair
// throws (a pin is always clamped into the registry's range, so this is a registry gap, not input).
export function layerAt(registry, id, version) {
  const l = registry.find((x) => x.id === id && x.version === version);
  if (!l) throw new Error(`layers: ${id}@${version} is not registered`);
  return l;
}

// docPins(doc, registry), the document's pins over the registry: layer-pins.mjs's rule with the
// registry's latest as the bound.
export const docPins = (doc, registry = REGISTRY) => pinsOf(doc && doc.layers, latestOf(registry));

// runOf(doc, id, registry), the `run` of the version of layer `id` the document pins.
export const runOf = (doc, id, registry = REGISTRY) => layerAt(registry, id, docPins(doc, registry)[id]).run;

// pinLatest(doc, registry), the document with `layers` set to every layer's latest version.
export const pinLatest = (doc, registry = REGISTRY) => ({ ...doc, layers: latestOf(registry) });

// The scope of each id compute does not call once per document: the palette layers run once per
// palette (below), the mode layers once per breakpoint mode (model.mjs, through runOf). Every other
// registered id is a document layer: compute calls its run with the document and returns the output
// under the layer's id (`controls` is one).
const PALETTE_LAYERS = new Set(["ramp", "prime", "roles"]);
const MODE_LAYERS = new Set(["type", "geometry"]);

// compute(doc, registry), the colour layers evaluated once over an exporter-shaped document (model.mjs's
// stateOf: the global Base chroma k under its exporter name `baseChroma`). Every layer runs at the
// version `doc.layers` pins. Every palette is computed, enabled or not, in document order; a view
// filters. Each palette's ramp chroma (its own Base chroma times the global k) and prime chroma (the
// global prime k) are formed by resolve.mjs's rampChromaOf/primeChromaOf as input shaping, then the
// ramp, prime and roles layers run. Returns each document layer's output under its id (`controls`,
// the `controls.resolved` output) and, per palette, `{ palette, n, rampChroma, primeChroma, stops,
// prime, roles }`: `ramp.stops` (the 25 EXPORT_STOPS), `prime.swatches` and `roles.table`. Each layer
// is called with one fixed call shape per id, the shape a later version of that layer keeps.
export function compute(doc, registry = REGISTRY) {
  const pins = docPins(doc, registry);
  const run = (id) => layerAt(registry, id, pins[id]).run;
  const documentOutputs = {};
  for (const id of Object.keys(pins)) if (!PALETTE_LAYERS.has(id) && !MODE_LAYERS.has(id)) documentOutputs[id] = run(id)(doc);
  const controls = documentOutputs.controls;
  const palettes = (doc.palettes ?? []).map((p) => {
    const n = slug(p.name);
    const rampChroma = rampChromaOf(p, controls);
    const primeChroma = primeChromaOf(p, controls);
    const stops = run("ramp")(
      { hue: p.hue, chroma: rampChroma, skew: p.skew, lift: p.lift, hueShift: p.hueShift, hueSameDir: p.hueSameDir, cuspPull: p.cuspPull, anchor: p.anchor },
      controls,
      EXPORT_STOPS,
    );
    // the prime ladder reads the palette's OWN chroma (never the ramp's damper) and the resolved prime
    // k; `primeChroma` is cleared on the palette so prime.mjs's own `palette.primeChroma ??
    // controls.primeChroma` falls through to that resolved value, whatever a stray palette carries.
    const prime = run("prime")(
      { hue: p.hue, chroma: p.chroma, skew: p.skew, hueShift: p.hueShift, hueSameDir: p.hueSameDir, anchor: p.anchor, primeChroma: undefined },
      { ...controls, primeChroma },
    );
    const roles = run("roles")(n, stops, controls, doc.roleOverrides);
    return { palette: p, n, rampChroma, primeChroma, stops, prime, roles };
  });
  return { ...documentOutputs, palettes };
}
