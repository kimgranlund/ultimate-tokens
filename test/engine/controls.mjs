#!/usr/bin/env node
// controls.mjs, the one controls resolver (compute-layers U1, #788).
//
// engine/controls.mjs's resolveControls is the only place a missing control is defaulted: the canvas
// (ui/model.mjs: projectView, stateOf) and every exporter (exports.js: derivedAll) resolve through it.
// (a) a state with no hueSpace resolves to the engine default "oklch" through BOTH paths;
// (b) exportJSON of such a raw state is byte-equal to exportJSON of the same state with hueSpace
//     "oklch" added (the cross-tree half, HEAD vs the merge-base render, is recorded in the unit handoff).
// Each check also proves it can fail: the "cam16" render of the same state must differ.
import { readFileSync } from "node:fs";
import { resolveControls } from "../../src/engine/controls.mjs";
import { DEFAULT_CONTROLS } from "../../src/engine/tonal.js";
import { derivedAll, exportJSON } from "../../src/engine/exports.js";
import { defaultDocument, projectView, stateOf } from "../../src/ui/model.mjs";

const fails = [];
const FAIL = (name, msg) => { fails.push(name); console.error(`FAIL  ${name}: ${msg}`); };
const ok = (name, msg) => console.log(`  pass  ${name}: ${msg}`);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// a raw state the way the MCP server or a hand-built caller sends it: no hueSpace, no baseChroma
const palettes = [
  { name: "Brand", hue: 250, chroma: 80, skew: 0, lift: 0, hueShift: 0, hueSameDir: false, on: true },
  { name: "Warm", hue: 40, chroma: 60, skew: 0, lift: 0, hueShift: 0, hueSameDir: false, on: true },
];
const RAW = { palettes, curve: "logistic", tension: 0, lmin: 5, lmax: 100, damp: 80, theme: "auto" };
const withSpace = (hueSpace) => ({ ...RAW, hueSpace });

// resolver: defaults come from tonal.js DEFAULT_CONTROLS, plus the three chroma-policy fields
{
  const r = resolveControls({});
  const bad = Object.keys(DEFAULT_CONTROLS).filter((k) => r[k] !== DEFAULT_CONTROLS[k]);
  if (bad.length) FAIL("defaults", `not DEFAULT_CONTROLS: ${bad.join(", ")}`);
  else if (r.hueSpace !== "oklch") FAIL("defaults", `hueSpace ${r.hueSpace}`);
  else if (r.baseChroma !== 100 || r.primeChroma !== 100 || !same(r.paletteGroups, {})) FAIL("defaults", "baseChroma/primeChroma/paletteGroups");
  else ok("defaults", `${Object.keys(DEFAULT_CONTROLS).length} engine controls + 3 chroma-policy fields`);
  if (resolveControls({ hueSpace: "cam16", baseChroma: 40 }).hueSpace !== "cam16") FAIL("explicit", "an explicit hueSpace was overwritten");
  else ok("explicit", "an explicit value survives");
}

// (a) hueSpace-less -> "oklch" through both drivers
{
  const doc = { ...defaultDocument(), palettes };
  delete doc.hueSpace;
  const viaView = projectView(doc);
  const viaViewOklch = projectView({ ...doc, hueSpace: "oklch" });
  const viaViewCam = projectView({ ...doc, hueSpace: "cam16" });
  if (!same(viaView.palettes, viaViewOklch.palettes)) FAIL("a-canvas", "projectView of a hueSpace-less doc is not the oklch render");
  else if (same(viaView.palettes, viaViewCam.palettes)) FAIL("a-canvas", "oklch and cam16 renders are identical, the check cannot bite");
  else ok("a-canvas", "projectView: no hueSpace renders as oklch");
  if (stateOf(doc).hueSpace !== "oklch") FAIL("a-canvas", `stateOf hueSpace ${stateOf(doc).hueSpace}`);

  const viaExport = derivedAll(RAW);
  if (!same(viaExport, derivedAll(withSpace("oklch")))) FAIL("a-export", "derivedAll of a hueSpace-less state is not the oklch render");
  else if (same(viaExport, derivedAll(withSpace("cam16")))) FAIL("a-export", "oklch and cam16 renders are identical, the check cannot bite");
  else ok("a-export", "derivedAll: no hueSpace renders as oklch");
}

// (b) byte-equal exportJSON, raw vs hueSpace "oklch" added
{
  const raw = exportJSON(RAW);
  const oklch = exportJSON(withSpace("oklch"));
  const cam = exportJSON(withSpace("cam16"));
  const rawS = JSON.stringify(raw), oklchS = JSON.stringify(oklch);
  if (rawS !== oklchS) FAIL("b-bytes", "exportJSON(raw) differs from exportJSON(raw + hueSpace oklch)");
  else if (rawS === JSON.stringify(cam)) FAIL("b-bytes", "cam16 render identical, the check cannot bite");
  else ok("b-bytes", `exportJSON byte-equal (${rawS.length} bytes), cam16 differs`);
}

// C1.1: neither driver keeps a private copy any more
{
  const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
  const copies = ["../../src/ui/model.mjs", "../../src/engine/exports.js"].filter((p) => /function controlsOf\b/.test(read(p)));
  if (copies.length) FAIL("one-resolver", `controlsOf still defined in ${copies.join(", ")}`);
  else ok("one-resolver", "no controlsOf copy in model.mjs or exports.js");
}

if (fails.length) { console.error(`\nFAIL: ${fails.length} check(s)`); process.exit(1); }
console.log("\nPASS: controls clears all checks");
process.exit(0);
