#!/usr/bin/env node
// layers.mjs, the compute-layer registry (compute-layers U2, ADR-028).
//
// src/engine/layers.mjs's LAYERS names the seven pipeline stages, and compute(doc) walks them (U3).
// (C2.1) exactly the seven ids, each { id, version: 1, inputs, outputs, run }, and `run` is
//        strict-equal to the engine export that stage already is;
// (C2.2) every declared input is another layer's output or a key of defaultDocument(), the graph is
//        acyclic, geometry sits after type and roles after ramp;
// (C2.3) no document/window/localStorage access in layers.mjs or controls.mjs;
// (C3.1) the role-override pass is called once, from layers.mjs, and from neither view;
// (C3.2) projectView and a standalone derivedAll agree, per enabled palette, on every stop hex and
//        every role ref + hex, over defaultDocument() and every curated preset.
// Each check is a function over a registry (or a source string), so it also runs on a corrupted copy
// and must report a failure there: the negative controls live in this file, not in a one-off edit.
import { readFileSync, readdirSync } from "node:fs";
import { LAYERS, resolveRoles } from "../../src/engine/layers.mjs";
import { resolveControls } from "../../src/engine/controls.mjs";
import { rampChromaOf } from "../../src/engine/resolve.mjs";
import { paletteStops, DEFAULT_CONTROLS } from "../../src/engine/tonal.js";
import { primeSwatches } from "../../src/engine/prime.mjs";
import { typeScale } from "../../src/engine/type.mjs";
import { geomScale } from "../../src/engine/geometry.mjs";
import { derivedAll } from "../../src/engine/exports.js";
import { defaultDocument, projectView, stateOf } from "../../src/ui/model.mjs";
import { hydrate } from "../../src/ui/persist.js";

const fails = [];
const FAIL = (name, msg) => { fails.push(name); console.error(`FAIL  ${name}: ${msg}`); };
const ok = (name, msg) => console.log(`  pass  ${name}: ${msg}`);

const IDS = ["controls", "group-chroma", "ramp", "prime", "roles", "type", "geometry"];
const RUNS = {
  controls: resolveControls, "group-chroma": rampChromaOf, ramp: paletteStops, prime: primeSwatches,
  roles: resolveRoles, type: typeScale, geometry: geomScale,
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

// ---- C3.1: one caller of the role-override pass, and it is compute's roles layer
{
  const src = (f) => readFileSync(new URL(`../../src/${f}`, import.meta.url), "utf8");
  const calls = (text) => text.split("applyRoleOverrides(").length - 1;
  const viewCalls = ["ui/model.mjs", "engine/exports.js"].map((f) => [f, calls(src(f))]);
  const own = calls(src("engine/layers.mjs"));
  if (viewCalls.some(([, c]) => c !== 0) || own !== 1) FAIL("c3.1-one-caller", `${viewCalls.map(([f, c]) => `${f} ${c}`).join(", ")}, layers.mjs ${own}`);
  else ok("c3.1-one-caller", "model.mjs 0, exports.js 0, layers.mjs 1");
  if (calls(`${src("ui/model.mjs")}\napplyRoleOverrides(x);\n`) !== 1) FAIL("c3.1-control", "an added applyRoleOverrides( call was not counted");
  else ok("c3.1-control", "an added applyRoleOverrides( call in model.mjs is counted");
}

// ---- C3.2: the two views over compute agree, per enabled palette and stop
// projectView(doc) runs compute(stateOf(doc)); derivedAll(stateOf(doc)) runs its own compute over the
// enabled palettes. Both must name the same stop hexes and the same role refs and hexes.
function viewProblems(view, derived) {
  const out = [];
  const on = view.palettes.filter((p) => p.on);
  if (on.length !== derived.length) return [`${on.length} enabled palettes in the view, ${derived.length} derived`];
  on.forEach((v, i) => {
    const d = derived[i];
    if (v.name !== d.name) out.push(`palette ${i}: ${v.name} vs ${d.name}`);
    const dStops = Object.keys(d.stops);
    if (dStops.length !== v.fullRamp.length) out.push(`${v.name}: ${v.fullRamp.length} stops vs ${dStops.length}`);
    for (const s of v.fullRamp) {
      const ds = d.stops[String(s.stop).padStart(3, "0")];
      if (!ds || ds.hex.toUpperCase() !== s.hex.toUpperCase()) out.push(`${v.name} ${s.stop}: ${s.hex} vs ${ds?.hex}`);
    }
    if (v.roles.length !== d.roles.length) out.push(`${v.name}: ${v.roles.length} roles vs ${d.roles.length}`);
    v.roles.forEach((r, j) => {
      const dr = d.roles[j];
      if (!dr || r.key !== dr.key) { out.push(`${v.name} role ${j}: ${r.key} vs ${dr?.key}`); return; }
      if (String(r.lightRef) !== String(dr.lightRef) || String(r.darkRef) !== String(dr.darkRef)) out.push(`${v.name} ${r.key}: refs ${r.lightRef}/${r.darkRef} vs ${dr.lightRef}/${dr.darkRef}`);
      if (r.lightHex.toUpperCase() !== dr.light.hex.toUpperCase() || r.darkHex.toUpperCase() !== dr.dark.hex.toUpperCase()) out.push(`${v.name} ${r.key}: hexes ${r.lightHex}/${r.darkHex} vs ${dr.light.hex}/${dr.dark.hex}`);
    });
  });
  return out;
}
{
  const docs = [["default kit", defaultDocument()]];
  const catDir = new URL("../../src/ui/categories/", import.meta.url);
  for (const f of readdirSync(catDir).filter((f) => f.endsWith(".js") && f !== "index.js").sort()) {
    const { PRESETS } = await import(new URL(f, catDir).href);
    for (const preset of PRESETS) docs.push([`${f.slice(0, -3)}/${preset.name}`, hydrate({ ...preset })]);
  }
  console.log(`  presets ${docs.length}`);
  let bad = 0;
  let firstPair = null;
  for (const [name, doc] of docs) {
    const view = projectView(doc);
    const derived = derivedAll(stateOf(doc));
    firstPair ??= [view, derived];
    const p = viewProblems(view, derived);
    if (p.length) { bad++; if (bad <= 5) FAIL("c3.2-views", `${name}: ${p.slice(0, 3).join("; ")}`); }
  }
  if (bad) FAIL("c3.2-views", `${bad} of ${docs.length} documents disagree`);
  else ok("c3.2-views", `${docs.length} documents: projectView and derivedAll agree on every stop hex, role ref and role hex`);
  // control: one role ref re-pointed in derivedAll's view must be reported
  const [view, derived] = firstPair;
  const r0 = derived[0].roles[0];
  const moved = derived.map((d, i) => (i ? d : { ...d, roles: [{ ...r0, lightRef: String(r0.lightRef) === "50" ? "100" : "50" }, ...d.roles.slice(1)] }));
  if (!viewProblems(view, moved).length) FAIL("c3.2-control", `${derived[0].name} ${r0.key} lightRef re-pointed and the parity check stayed quiet`);
  else ok("c3.2-control", `${derived[0].name} ${r0.key} lightRef re-pointed is caught`);
}

if (fails.length) { console.error(`FAIL: ${fails.length} check(s)`); process.exit(1); }
console.log("PASS: layers clears all checks");
