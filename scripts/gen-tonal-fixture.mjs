#!/usr/bin/env node
// gen-tonal-fixture.mjs, regenerates test/engine/fixtures/tonal-legacy.json, the AC-003 byte-diff fixture
// (SPEC spec-muted-base-key-spikes): every role-table default palette x EXPORT_STOPS x both ramp paths
// (perceptual + even) at DEFAULT_CONTROLS, as hex. Run ONLY by hand, from the engine you want to pin
// (it was first generated from the pre-intensity engine at commit 83756bb); `npm test` never runs it.
//   node scripts/gen-tonal-fixture.mjs
import { readFileSync, writeFileSync } from "node:fs";
import * as T from "../src/engine/tonal.js";

const RT = JSON.parse(readFileSync(new URL("../docs/reference/data/role-table.json", import.meta.url), "utf8"));
const out = { generatedFrom: process.argv[2] || "hand", paths: {} };
for (const toneMode of ["perceptual", "even"]) {
  const ctl = { ...T.DEFAULT_CONTROLS, toneMode };
  out.paths[toneMode] = {};
  for (const p of RT.defaults) {
    // `anchor` is deliberately OMITTED from this narrowed literal (#681 U2, re-diagnosis Finding 8):
    // this fixture pins the LEGACY, pre-anchor ramp construction (first captured at 83756bb, before
    // ticket #681 added the field) as a byte-diff regression check, so it must keep calling the
    // un-anchored `paletteStops` path on purpose. This is NOT the same "subset-object gap" #681 U2
    // fixed in model.mjs/exports.js, which silently dropped `anchor` from a call that SHOULD have
    // forwarded it, this call never should.
    out.paths[toneMode][p.name] = T.paletteStops({ hue: p.hue, chroma: p.chroma, skew: p.skew, lift: p.lift }, ctl, T.EXPORT_STOPS).map((r) => r.hex);
  }
}
const dest = new URL("../test/engine/fixtures/tonal-legacy.json", import.meta.url);
writeFileSync(dest, JSON.stringify(out, null, 1) + "\n");
console.log(`wrote ${dest.pathname}: ${Object.keys(out.paths.even).length} palettes x ${T.EXPORT_STOPS.length} stops x 2 paths`);
