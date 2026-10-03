// layers.mjs, the compute-layer registry (ADR-028, compute-layers U2; vanilla ESM, pure, no DOM).
//
// A layer is a named, versioned, pure stage of the brand-kit pipeline: { id, version, inputs,
// outputs, run }. `run` is the engine function that stage already is, strict-equal to its export, so
// the registry names today's code and adds none. `inputs` and `outputs` are the keys the stage reads
// and writes: an input is a key of the document (`defaultDocument()`) or another layer's output,
// written `<layer-id>.<name>`; test/engine/layers.mjs checks the graph (known inputs, no cycle, the
// type -> geometry and ramp -> roles orders). Every layer is at version 1 here; a version bump is a
// later unit's job (pins and frozen versions, U4).
//
// Not here yet, by plan: the evaluator that walks the graph (U3) and the document pins (U4). `run`
// of `roles` is `semanticRoles`, the 53-role table; U3 widens it to the whole role chain.
//
// `controls` declares the document keys resolveControls reads that the document names the same
// way. The ramp-chroma fallback is the one it does not list: the document names it differently from
// the resolver's `baseChroma` until persist's rename (U5), and src/engine never spells the document's
// own name for it (AC-004), so it joins the list when the document's key and the resolver's agree.

import { resolveControls } from "./controls.mjs";
import { rampChromaOf } from "./resolve.mjs";
import { paletteStops } from "./tonal.js";
import { primeSwatches } from "./prime.mjs";
import { semanticRoles } from "./semantic.js";
import { typeScale } from "./type.mjs";
import { geomScale } from "./geometry.mjs";

const layer = (id, inputs, outputs, run) => Object.freeze({ id, version: 1, inputs: Object.freeze(inputs), outputs: Object.freeze(outputs), run });

export const LAYERS = Object.freeze({
  controls: layer("controls",
    ["curve", "tension", "lmin", "lmax", "damp", "dampCurve", "dampAmp", "dampBias", "hueSpace", "relChroma", "chromaFloor", "toneMode", "vibrancy", "onColorMode", "accentRef", "primeChroma", "paletteGroups"],
    ["controls.resolved"], resolveControls),
  "group-chroma": layer("group-chroma",
    ["palettes", "paletteGroups", "controls.resolved"],
    ["group-chroma.rampChroma"], rampChromaOf),
  ramp: layer("ramp",
    ["palettes", "controls.resolved", "group-chroma.rampChroma"],
    ["ramp.stops"], paletteStops),
  prime: layer("prime",
    ["palettes", "controls.resolved"],
    ["prime.swatches"], primeSwatches),
  roles: layer("roles",
    ["palettes", "controls.resolved", "ramp.stops", "roleOverrides"],
    ["roles.table"], semanticRoles),
  type: layer("type",
    ["type"],
    ["type.scale"], typeScale),
  geometry: layer("geometry",
    ["geometry", "type.scale"],
    ["geometry.scale"], geomScale),
});
