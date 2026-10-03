#!/usr/bin/env node
// layers.mjs, the compute-layer registry (compute-layers U2, ADR-028).
//
// src/engine/layers.mjs's LAYERS names the seven pipeline stages. Three checks:
// (C2.1) exactly the seven ids, each { id, version: 1, inputs, outputs, run }, and `run` is
//        strict-equal to the engine export that stage already is;
// (C2.2) every declared input is another layer's output or a key of defaultDocument(), the graph is
//        acyclic, geometry sits after type and roles after ramp;
// (C2.3) no document/window/localStorage access in layers.mjs or controls.mjs.
// Each check is a function over a registry (or a source string), so it also runs on a corrupted copy
// and must report a failure there: the negative controls live in this file, not in a one-off edit.
import { readFileSync } from "node:fs";
import { LAYERS } from "../../src/engine/layers.mjs";
import { resolveControls } from "../../src/engine/controls.mjs";
import { rampChromaOf } from "../../src/engine/resolve.mjs";
import { paletteStops, DEFAULT_CONTROLS } from "../../src/engine/tonal.js";
import { primeSwatches } from "../../src/engine/prime.mjs";
import { semanticRoles } from "../../src/engine/semantic.js";
import { typeScale } from "../../src/engine/type.mjs";
import { geomScale } from "../../src/engine/geometry.mjs";
import { defaultDocument } from "../../src/ui/model.mjs";

const fails = [];
const FAIL = (name, msg) => { fails.push(name); console.error(`FAIL  ${name}: ${msg}`); };
const ok = (name, msg) => console.log(`  pass  ${name}: ${msg}`);

const IDS = ["controls", "group-chroma", "ramp", "prime", "roles", "type", "geometry"];
const RUNS = {
  controls: resolveControls, "group-chroma": rampChromaOf, ramp: paletteStops, prime: primeSwatches,
  roles: semanticRoles, type: typeScale, geometry: geomScale,
};
const DOC_KEYS = new Set(Object.keys(defaultDocument()));

// C2.1: problems with the registry's shape and its `run` bindings
function shapeProblems(layers) {
  const out = [];
  const ids = Object.keys(layers).sort();
  if (JSON.stringify(ids) !== JSON.stringify([...IDS].sort())) out.push(`ids [${ids.join(", ")}], want [${IDS.join(", ")}]`);
  for (const id of IDS) {
    const l = layers[id];
    if (!l) continue;
    const keys = Object.keys(l).sort().join(",");
    if (keys !== "id,inputs,outputs,run,version") out.push(`${id}: keys ${keys}`);
    if (l.id !== id) out.push(`${id}: id field ${l.id}`);
    if (l.version !== 1) out.push(`${id}: version ${l.version}`);
    for (const f of ["inputs", "outputs"]) {
      if (!Array.isArray(l[f]) || !l[f].every((s) => typeof s === "string" && s)) out.push(`${id}: ${f} is not a list of names`);
    }
    if (l.run !== RUNS[id]) out.push(`${id}: run is not the ${RUNS[id].name} export`);
  }
  return out;
}

// C2.2: problems with the input graph
function graphProblems(layers) {
  const out = [];
  const produced = new Map(); // output name -> producing layer id
  for (const [id, l] of Object.entries(layers)) {
    for (const o of l.outputs) {
      if (!o.startsWith(`${id}.`)) out.push(`${id}: output ${o} is not named ${id}.<name>`);
      if (DOC_KEYS.has(o)) out.push(`${id}: output ${o} collides with a document key`);
      if (produced.has(o)) out.push(`${id}: output ${o} also produced by ${produced.get(o)}`);
      produced.set(o, id);
    }
  }
  const deps = new Map(); // layer id -> producer ids it waits on
  for (const [id, l] of Object.entries(layers)) {
    const d = new Set();
    for (const i of l.inputs) {
      if (produced.has(i)) {
        if (produced.get(i) === id) out.push(`${id}: consumes its own output ${i}`);
        d.add(produced.get(i));
      } else if (!DOC_KEYS.has(i)) out.push(`${id}: input ${i} is neither a layer output nor a defaultDocument() key`);
    }
    deps.set(id, d);
  }
  // Kahn: peel layers whose producers are all placed; a leftover set is a cycle
  const order = [];
  const left = new Map(deps);
  while (left.size) {
    const ready = [...left].filter(([, d]) => [...d].every((p) => order.includes(p))).map(([id]) => id);
    if (!ready.length) { out.push(`cycle among ${[...left.keys()].join(", ")}`); break; }
    for (const id of ready) { order.push(id); left.delete(id); }
  }
  // geometry composes from type and roles reads the ramp: a declared edge, so the evaluator's order is forced
  const reaches = (a, b, seen = new Set()) => [...(deps.get(a) || [])].some((p) => p === b || (!seen.has(p) && seen.add(p) && reaches(p, b, seen)));
  if (!out.length) {
    if (!reaches("geometry", "type")) out.push("geometry is not after type");
    if (!reaches("roles", "ramp")) out.push("roles is not after ramp");
  }
  return { problems: out, order };
}

// C2.3: the DOM-global grep, over a source string
const DOM_GREP = /\b(document|window|localStorage)\./;
const domLines = (src) => src.split("\n").map((t, i) => [i + 1, t]).filter(([, t]) => DOM_GREP.test(t));

// ---- C2.1
{
  const p = shapeProblems(LAYERS);
  if (p.length) FAIL("c2.1-registry", p.join("; "));
  else ok("c2.1-registry", `${IDS.length} layers at version 1, every run is its engine export`);
  const badGeometry = { ...LAYERS, geometry: { ...LAYERS.geometry, run: typeScale } };
  if (!shapeProblems(badGeometry).length) FAIL("c2.1-control", "geometry run pointed at typeScale and the shape check stayed quiet");
  else ok("c2.1-control", "geometry run -> typeScale is caught");
  const extra = { ...LAYERS, stray: { ...LAYERS.ramp, id: "stray" } };
  if (!shapeProblems(extra).length) FAIL("c2.1-control", "an eighth layer was accepted");
  else ok("c2.1-control", "an eighth layer is caught");
  // the controls inputs track the resolver: every engine control plus the two chroma-policy fields
  const want = [...Object.keys(DEFAULT_CONTROLS), "primeChroma", "paletteGroups"].sort().join(",");
  if ([...LAYERS.controls.inputs].sort().join(",") !== want) FAIL("c2.1-controls-inputs", "controls.inputs drifted from DEFAULT_CONTROLS + primeChroma + paletteGroups");
  else ok("c2.1-controls-inputs", `${LAYERS.controls.inputs.length} inputs match DEFAULT_CONTROLS + 2`);
}

// ---- C2.2
{
  const g = graphProblems(LAYERS);
  if (g.problems.length) FAIL("c2.2-graph", g.problems.join("; "));
  else ok("c2.2-graph", `acyclic, order ${g.order.join(" > ")}`);
  const badInput = { ...LAYERS, geometry: { ...LAYERS.geometry, inputs: ["geometry", "type.nothing"] } };
  if (!graphProblems(badInput).problems.length) FAIL("c2.2-control", "an input nothing outputs was accepted");
  else ok("c2.2-control", "geometry input renamed to a name nothing outputs is caught");
  const cyc = { ...LAYERS, controls: { ...LAYERS.controls, inputs: [...LAYERS.controls.inputs, "ramp.stops"] } };
  if (!graphProblems(cyc).problems.some((m) => m.startsWith("cycle"))) FAIL("c2.2-control", "a controls <- ramp edge was not reported as a cycle");
  else ok("c2.2-control", "a controls <- ramp edge is caught as a cycle");
  const flat = { ...LAYERS, geometry: { ...LAYERS.geometry, inputs: ["geometry"] } };
  if (!graphProblems(flat).problems.includes("geometry is not after type")) FAIL("c2.2-control", "geometry without a type input passed the order check");
  else ok("c2.2-control", "geometry with no type input is caught by the order check");
}

// ---- C2.3
{
  for (const f of ["layers.mjs", "controls.mjs"]) {
    const src = readFileSync(new URL(`../../src/engine/${f}`, import.meta.url), "utf8");
    const hits = domLines(src);
    if (hits.length) FAIL("c2.3-dom", `${f}: ${hits.map(([n, t]) => `${n}: ${t.trim()}`).join("; ")}`);
    else ok("c2.3-dom", `${f}: no document/window/localStorage access`);
    if (domLines(`${src}\nwindow.x = 1;\n`).length !== 1) FAIL("c2.3-control", `${f}: an added window.x = 1 was not seen`);
  }
  ok("c2.3-control", "an added window.x = 1 prints exactly 1 line");
}

if (fails.length) { console.error(`FAIL: ${fails.length} check(s)`); process.exit(1); }
console.log("PASS: layers clears all checks");
