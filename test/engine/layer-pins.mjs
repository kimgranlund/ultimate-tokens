#!/usr/bin/env node
// layer-pins.mjs, document pins of the compute-layer versions (compute-layers #788, ADR-034, R100, R101).
//
// (C4.1) serialize(defaultDocument()).layers is { [id]: latest } over the shipped LAYERS, and the
//        LATEST table persist.js pins against (src/engine/layer-pins.mjs) is latestOf(REGISTRY);
// (C4.2) persist.js's presetDoc pins every layer latest: over every curated preset plus
//        defaultDocument(), with the synthetic test-layer@1/@2 registered so its latest is 2;
// (C4.3) a stored v9 document (no `layers`) hydrates pinned to 1 everywhere through the v10 stamp,
//        and compute runs test-layer@1 for it; a v10 document's pins are clamped, an unknown id
//        dropped and reported;
// (C4.4) a pin runs its own version: pinned 1 gets test-layer@1's output, pinned 2 gets @2's (the
//        frozen files' hash gate is test/engine/layers.mjs's C4.4);
// (C4.5) EXPORT_SCHEMA_VERSION is the value before #788 (6) plus 1, and each of the 10 exporters
//        carries every shipped layer id with the document's pinned version.
// Each check is a function over the code under test (a hydrate, a presetDoc, a registry, a set of
// outputs), so the negative controls run in this file on a corrupted stand-in and must fail.
import { readdirSync } from "node:fs";
import { LAYERS, REGISTRY, latestOf, docPins, compute } from "../../src/engine/layers.mjs";
import { LATEST } from "../../src/engine/layer-pins.mjs";
import { layer as testLayer1 } from "../../src/engine/layers/test-layer@1.mjs";
import { layer as testLayer2 } from "../../src/engine/layers/test-layer@2.mjs";
import {
  EXPORT_SCHEMA_VERSION, exportCSS, exportOKLCH, exportJSON, exportDTCG, exportUI3, exportTailwind, exportShadcn,
  exportPanda, exportPandaModule, exportRadix, exportRadixModule,
} from "../../src/engine/exports.js";
import { exportDesignSystemBundle } from "../../src/engine/ds-export.js";
import { defaultDocument, stateOf, typeScaleFor, geomScaleFor } from "../../src/ui/model.mjs";
import { hydrate, serialize, presetDoc, DROPPED_KEYS } from "../../src/ui/persist.js";

const fails = [];
const FAIL = (name, msg) => { fails.push(name); console.error(`FAIL  ${name}: ${msg}`); };
const ok = (name, msg) => console.log(`  pass  ${name}: ${msg}`);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const show = (o) => Object.entries(o).map(([id, v]) => `${id}@${v}`).join(" ");

// the registry with the synthetic test-layer at both versions (never shipped, C4.4)
const TEST_REGISTRY = [...REGISTRY, testLayer1, testLayer2];
const SHIPPED_LATEST = Object.fromEntries(Object.values(LAYERS).map((l) => [l.id, l.version]));
// two palettes, so test-layer@1 and @2 disagree (their outputs differ on any document with two)
// stateOf pins over the shipped registry, so a test-registry pin (test-layer) is carried over by hand
const computeOf = (doc, registry) => compute({ ...stateOf(doc), layers: doc.layers }, registry);
// a v9 stored document: saved before pins, so it carries no `layers`
const STORED = { schemaVersion: 9, palettes: [{ name: "Alpha", hue: 30, chroma: 40 }, { name: "Beta", hue: 250, chroma: 30 }] };

// ---- C4.1
// pinProblems(serializeFn): the stored form of a fresh document must pin every shipped layer latest
const pinProblems = (serializeFn) => {
  const got = serializeFn(defaultDocument()).layers;
  return same(got, SHIPPED_LATEST) ? [] : [`serialize(defaultDocument()).layers is ${got ? show(got) : got}, want ${show(SHIPPED_LATEST)}`];
};
{
  const p = pinProblems(serialize);
  if (p.length) FAIL("c4.1-new-doc", p.join("; "));
  else ok("c4.1-new-doc", `serialize(defaultDocument()).layers = ${show(SHIPPED_LATEST)}`);
  const dropped = (doc) => { const { layers: _drop, ...rest } = serialize(doc); return rest; };
  if (!pinProblems(dropped).length) FAIL("c4.1-control", "a serialize that drops `layers` passed");
  else ok("c4.1-control", "a serialize that drops `layers` is caught");
  if (!same(LATEST, latestOf(REGISTRY))) FAIL("c4.1-latest-table", `layer-pins.mjs LATEST ${show(LATEST)} != latestOf(REGISTRY) ${show(latestOf(REGISTRY))}`);
  else ok("c4.1-latest-table", "layer-pins.mjs LATEST equals latestOf(REGISTRY)");
  if (same({ ...LATEST, ramp: LATEST.ramp + 1 }, latestOf(REGISTRY))) FAIL("c4.1-control", `a LATEST with ramp ${LATEST.ramp + 1} matched the registry`);
  else ok("c4.1-control", `a LATEST table with ramp ${LATEST.ramp + 1} is caught`);
}

// ---- C4.2
const presets = [["default kit", defaultDocument()]];
{
  const catDir = new URL("../../src/ui/categories/", import.meta.url);
  for (const f of readdirSync(catDir).filter((f) => f.endsWith(".js") && f !== "index.js").sort()) {
    const { PRESETS } = await import(new URL(f, catDir).href);
    for (const preset of PRESETS) presets.push([`${f.slice(0, -3)}/${preset.name}`, preset]);
  }
}
// presetProblems(open): every preset opened by `open(preset, registry)` must pin the registry's latest;
// returns the names that do not, first one with its pins
function presetProblems(open) {
  const want = latestOf(TEST_REGISTRY);
  const bad = presets.filter(([, p]) => !same(open(p, TEST_REGISTRY).layers, want)).map(([name]) => name);
  return bad.length ? [`${bad.length} of ${presets.length}, first ${bad[0]} pinned ${show(open(presets.find(([n]) => n === bad[0])[1], TEST_REGISTRY).layers)}`] : [];
}
{
  console.log(`  presets ${presets.length}`);
  const p = presetProblems((preset, registry) => presetDoc(preset, { latest: latestOf(registry) }));
  if (p.length) FAIL("c4.2-preset-latest", p.join("; "));
  else ok("c4.2-preset-latest", `${presets.length} documents open pinned ${show(latestOf(TEST_REGISTRY))}`);
  const hydrateOnly = (preset, registry) => hydrate(preset, { latest: latestOf(registry) });
  const c = presetProblems(hydrateOnly);
  if (!c.length) FAIL("c4.2-control", "presetDoc as hydrate alone passed");
  else ok("c4.2-control", `presetDoc as hydrate alone is caught: ${c[0]}`);
}

// ---- C4.3
// prePinProblems(hydrateFn): a v9 stored document (no `layers`) must load pinned to 1 everywhere and
// compute must run test-layer@1 for it
function prePinProblems(hydrateFn) {
  const out = [];
  const doc = hydrateFn(STORED, { latest: latestOf(TEST_REGISTRY) });
  const want = Object.fromEntries(Object.keys(latestOf(TEST_REGISTRY)).map((id) => [id, 1]));
  if (!same(doc.layers, want)) out.push(`hydrated pins ${show(doc.layers)}, want ${show(want)}`);
  const got = computeOf(doc, TEST_REGISTRY)["test-layer"];
  if (!same(got, testLayer1.run(doc))) out.push(`compute's test-layer output ${JSON.stringify(got)}, want @1's ${JSON.stringify(testLayer1.run(doc))}`);
  return out;
}
{
  const p = prePinProblems(hydrate);
  if (p.length) FAIL("c4.3-pre-pin", p.join("; "));
  else ok("c4.3-pre-pin", "a v9 stored document with no `layers` loads pinned 1 everywhere (test-layer 1), compute runs test-layer@1");
  const hydrateLatest = (s, opts) => ({ ...hydrate(s, opts), layers: { ...opts.latest } });
  const c = prePinProblems(hydrateLatest);
  if (!c.length) FAIL("c4.3-control", "a hydrate that pins latest passed");
  else ok("c4.3-control", `a hydrate that pins latest is caught: ${c[0]}`);
}
// a v10 document's stored pin is clamped into [1, latest] per id, and an id the registry does not
// name is dropped and reported on DROPPED_KEYS
{
  const doc = hydrate({ ...STORED, schemaVersion: 10, layers: { ramp: 9, roles: 0.4, "test-layer": 7, bogus: 2 } }, { latest: latestOf(TEST_REGISTRY) });
  const dropped = (doc[DROPPED_KEYS] || []).filter((d) => d.facet === "layers").map((d) => d.key);
  const want = { ...Object.fromEntries(Object.keys(latestOf(TEST_REGISTRY)).map((id) => [id, 1])), ramp: latestOf(TEST_REGISTRY).ramp, "test-layer": 2 };
  if (!same(doc.layers, want) || !same(dropped, ["bogus"])) FAIL("c4.3-clamp", `pins ${show(doc.layers)}, dropped [${dropped}]; want ${show(want)}, dropped [bogus]`);
  else ok("c4.3-clamp", `ramp 9 -> ${latestOf(TEST_REGISTRY).ramp}, roles 0.4 -> 1, test-layer 7 -> 2, bogus dropped and reported`);
}

// ---- C4.4
// pinRunProblems(registry): pinned 1 must give test-layer@1's output, pinned 2 @2's, and the two differ
function pinRunProblems(registry) {
  const out = [];
  const at = (v) => hydrate({ ...STORED, layers: { "test-layer": v } }, { latest: latestOf(registry) });
  for (const [v, l] of [[1, testLayer1], [2, testLayer2]]) {
    const doc = at(v);
    const got = computeOf(doc, registry)["test-layer"];
    if (!same(got, l.run(doc))) out.push(`pinned ${v}: ${JSON.stringify(got)}, want test-layer@${v}'s ${JSON.stringify(l.run(doc))}`);
  }
  if (same(testLayer1.run(at(1)), testLayer2.run(at(2)))) out.push("test-layer@1 and @2 give the same output, so the pin is unobservable");
  return out;
}
{
  const p = pinRunProblems(TEST_REGISTRY);
  if (p.length) FAIL("c4.4-pin-runs", p.join("; "));
  else ok("c4.4-pin-runs", `pinned 1 runs test-layer@1 (${JSON.stringify(testLayer1.run(STORED))}), pinned 2 runs @2 (${JSON.stringify(testLayer2.run(STORED))})`);
  const routed = [...REGISTRY, { ...testLayer1, run: testLayer2.run }, testLayer2];
  const c = pinRunProblems(routed);
  if (!c.length) FAIL("c4.4-control", "pin 1 routed to test-layer@2's run passed");
  else ok("c4.4-control", `pin 1 routed to @2 is caught: ${c[0]}`);
}

// ---- C4.5
const BASE_SCHEMA = 6; // EXPORT_SCHEMA_VERSION before #788 (8811720d, after #804 took 5 to 6)
const PINS_LINE = /^\/\* ultimate-tokens layers (.*) \*\/$/;
const fromLine = (text) => {
  const m = String(text).split("\n")[1]?.match(PINS_LINE);
  return m ? Object.fromEntries(m[1].split(" ").map((t) => { const [id, v] = t.split("@"); return [id, Number(v)]; })) : null;
};
// the 10 exporters on one document, each reduced to the pins map it carries (null: none found)
function exportedPins(doc) {
  const state = stateOf(doc);
  const ds = exportDesignSystemBundle(state, typeScaleFor(doc, "base"), geomScaleFor(doc, "base"), { date: "2026-01-01" });
  const dtcg = exportDTCG(state);
  const dtcgPins = Object.values(dtcg).map((f) => f.$extensions?.["com.ultimate-tokens"]?.layers);
  return {
    exportCSS: fromLine(exportCSS(state)),
    exportOKLCH: fromLine(exportOKLCH(state)),
    exportJSON: exportJSON(state).meta?.layers ?? null,
    exportDTCG: dtcgPins.every((p) => same(p, dtcgPins[0])) ? dtcgPins[0] ?? null : null,
    exportUI3: exportUI3(state).$layers ?? null,
    exportTailwind: fromLine(exportTailwind(state)),
    exportShadcn: fromLine(exportShadcn(state)),
    exportPandaModule: fromLine(exportPandaModule(exportPanda(state), { layers: state.layers })),
    exportRadixModule: fromLine(exportRadixModule(exportRadix(state), { layers: state.layers })),
    exportDesignSystemBundle: JSON.parse(ds.find((f) => f.name === "tokens.json").data).$layers ?? null,
  };
}
// stampProblems(found, want, version): every exporter carries every shipped id at the document's pin, and
// the schema is the pre-#788 value plus 1
function stampProblems(found, want, version) {
  const out = [];
  if (version !== BASE_SCHEMA + 1) out.push(`EXPORT_SCHEMA_VERSION ${version}, want ${BASE_SCHEMA + 1} (${BASE_SCHEMA} before #788 plus 1)`);
  for (const [fn, pins] of Object.entries(found)) {
    const missing = Object.keys(SHIPPED_LATEST).filter((id) => !pins || pins[id] !== want[id]);
    if (missing.length) out.push(`${fn}: ${missing.map((id) => `${id}@${want[id]}`).join(" ")} not found (has ${pins ? show(pins) : "no pins"})`);
  }
  return out;
}
{
  const doc = defaultDocument();
  const found = exportedPins(doc);
  const want = docPins(doc);
  const p = stampProblems(found, want, EXPORT_SCHEMA_VERSION);
  const hit = Object.keys(found).filter((fn) => !p.some((m) => m.startsWith(`${fn}:`))).length;
  console.log(`  ${hit}/${Object.keys(found).length}`);
  if (p.length) FAIL("c4.5-stamps", p.join("; "));
  else ok("c4.5-stamps", `schema ${EXPORT_SCHEMA_VERSION}, ${Object.keys(found).length} exporters carry ${show(want)}`);
  if (!stampProblems(found, want, BASE_SCHEMA).length) FAIL("c4.5-control", "EXPORT_SCHEMA_VERSION at the pre-#788 value passed");
  else ok("c4.5-control", "EXPORT_SCHEMA_VERSION at the pre-#788 value is caught");
  const c = stampProblems({ ...found, exportRadixModule: null }, want, EXPORT_SCHEMA_VERSION);
  if (!(c.length === 1 && c[0].startsWith("exportRadixModule:"))) FAIL("c4.5-control", `pins removed from exportRadixModule gave [${c.join("; ")}]`);
  else ok("c4.5-control", `pins removed from exportRadixModule are caught: ${c[0]}`);
}

if (fails.length) { console.error(`FAIL: ${fails.length} check(s)`); process.exit(1); }
console.log("PASS: layer-pins clears all checks");
