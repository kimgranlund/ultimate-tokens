#!/usr/bin/env node
// even-dips-gate.mjs - #701 U2, C4: the GATE-PATH even dip reading. test/engine/tonal.mjs's dip gate
// (iv) renders every palette WITH its anchor (the rendered path, what `projectView` emits for an
// anchored curated palette); this script renders the same palettes WITHOUT it, which is what a user's
// own, un-anchored palette renders through `paletteStops`'s non-anchored branch. Nothing else read that
// path after #681 moved the (iv) gate to the rendered one, so a regression there would ship silently.
//
// The predicate is a copy of tonal.mjs's `findDips` (an interior stop at least 3 CAM16 C below BOTH
// neighbours), with `anchor` omitted. A copy, not an import: `findDips` is a closure inside tonal.mjs's
// chroma-envelope block, and that file runs its whole gate suite at import time, so it cannot be
// imported for one function. Same corpus scope as the (iv) gate: every curated preset plus the default
// kit, `dampAmp` 0 documents only (the Adia kit's authored `dampAmp` 70 is skipped, as there), both stop
// sets (the 19-stop display ramp and the 25-stop export ramp).
//
// A full-corpus sweep, so per #713 it is a gate script (`npm run gate:even-dips`, a `gate:sweeps`
// member and a `sweeps` CI matrix leg), not a `test/run.mjs` TESTS entry. `--full` is accepted for the
// shared convention and not read: there is no sampled reading.
//
//   node test/engine/even-dips-gate.mjs [--full] [--floor-scale <k>]
//
// The negative control runs on every invocation: a data-URL copy of src/engine/tonal.js with
// `evenChroma`'s floor restored to its pre-#701 gamut-relative form (chromaFloor% * maxc at every stop,
// `floorRef` dropped) and scaled 1.6x must produce more than 0 dips, or the script fails with
// `negative control DID NOT bite`. `--floor-scale <k>` runs the MAIN sweep on that patched engine at
// scale k instead (the verifier's by-hand control: `--floor-scale 1.6` prints a non-zero count and
// FAIL). Why not the shipped floor scaled alone: the shipped floor is non-increasing away from the
// anchor for ANY scale (min(maxc, floorRef) does not depend on it), so scaling it cannot open a dip on
// either path (measured: 0 off-anchor dips at 1.6x, gate path and rendered). The control therefore
// removes the one thing the redesign added, which is what a regression would have to remove.
//
// The hueShift grid (#766), printed before the corpus lines. The curated corpus's largest |hueShift| is
// 10, and edge rotation is where a floor reference that moves along the ramp opens dips (#766 U2 pass 1
// read the reference at each stop's rotated hue: 0 corpus dips, 64 at hueShift 60 on this grid), so the
// corpus sweep alone cannot see that class. Two lines, same predicate, both must read 0:
//   (a) gate path: default-kit controls (curve, tension, lmin, lmax, damp, dampCurve, dampBias,
//       relChroma, chromaFloor, vibrancy), dampAmp 0, no anchor, hue 0 to 345 step 15, chroma 30/45/60,
//       hueShift +/-30/45/60, hueSameDir false and true, hueSpace oklch and cam16, both stop sets
//       (1,728 palettes);
//   (b) rendered path: the default kit's 16 palettes WITH their anchors, hueShift +/-60, hueSameDir
//       false and true, both hue spaces, both stop sets (128 palettes), stop 500 excluded (the owner's Q3
//       notch class, as tonal.mjs `dip-gate-even`). Only +/-60: at -30/-45 the kit's #774902 palette
//       carries an anchored stop-200 notch that predates #766 (#784), and this line gates #766's rule.
// Each line has its own data-URL control that puts back the rotation-following reading: (a) swaps
// GRID_TARGET's `baseHue` for the rotated `hue` (paletteStops), (b) drops CHROMA_AT_TARGET's
// `resolvedHue` so the final chroma line reads the reference at the rotated hue (paletteStopsAnchored).
// Each must print more than 0 dips or the script fails `negative control DID NOT bite`; a patch target
// that is not in src/engine/tonal.js exactly once fails the script too. `--floor-scale` skips the grid.
import { readFileSync } from "node:fs";
import { hydrate } from "../../src/ui/persist.js";
import { defaultDocument, rampChromaOf } from "../../src/ui/model.mjs";
import * as REAL from "../../src/engine/tonal.js";

const CATS = ["architecture", "brands", "cuisine", "film", "literature", "music", "nature", "travel"];
const FLOOR_TARGET = "const floorC = Math.min(((chromaFloor ?? 0) / 100) * Math.min(maxc, floorRef), intended);";
const CONTROL_SCALE = 1.6;
const GRID_TARGET = "floorRefAt(baseHue, maxc, tone500, tone450, tone550)";
const CHROMA_AT_TARGET = "chromaAt(hue, resolvedHue)";

const argScale = (() => {
  const i = process.argv.indexOf("--floor-scale");
  if (i < 0) return null;
  const k = Number(process.argv[i + 1]);
  if (!Number.isFinite(k) || k <= 0) { console.log(`FAIL: --floor-scale needs a positive number, got ${process.argv[i + 1]}`); process.exit(1); }
  return k;
})();

// a data-URL copy of src/engine/tonal.js with `target` (which must occur exactly once) replaced
async function patchedEngine(target, replacement, name) {
  const src = readFileSync(new URL("../../src/engine/tonal.js", import.meta.url), "utf8");
  if (src.split(target).length !== 2) {
    console.log(`FAIL: the patch target string was not found exactly once  -  the engine line moved, update ${name}`);
    process.exit(1);
  }
  const patched = src
    .replace('from "./hct.js"', `from "${new URL("../../src/engine/hct.js", import.meta.url).href}"`)
    .replace('from "./okhsl.js"', `from "${new URL("../../src/engine/okhsl.js", import.meta.url).href}"`)
    .replace(target, replacement);
  return import(`data:text/javascript;base64,${Buffer.from(patched).toString("base64")}`);
}

// the pre-#701 floor (floorRef dropped), scaled k
const scaledEngine = (k) => patchedEngine(FLOOR_TARGET, `const floorC = Math.min((((chromaFloor ?? 0) * ${k}) / 100) * maxc, intended);`, "FLOOR_TARGET");

const docs = [];
for (const slug of CATS) {
  const { PRESETS } = await import(`../../src/ui/categories/${slug}.js`);
  for (const preset of PRESETS) {
    const d = hydrate({ ...preset });
    d.__presetName = preset.name;
    docs.push(d);
  }
}
const kit = defaultDocument();
kit.__presetName = "default kit";

// tonal.mjs's findDips, with `anchor` omitted (the gate path).
function findDips(doc, stops, engine) {
  const out = [];
  for (const pal of doc.palettes) {
    const controls = { curve: doc.curve, tension: doc.tension, lmin: doc.lmin, lmax: doc.lmax, damp: doc.damp, dampCurve: doc.dampCurve, dampAmp: doc.dampAmp, dampBias: doc.dampBias, hueSpace: doc.hueSpace, relChroma: doc.relChroma, chromaFloor: doc.chromaFloor, vibrancy: doc.vibrancy, toneMode: "even" };
    const chroma = rampChromaOf(pal, doc);
    const ramp = engine.paletteStops({ hue: pal.hue, chroma, skew: pal.skew, lift: pal.lift, hueShift: pal.hueShift ?? 0, hueSameDir: pal.hueSameDir === true, cuspPull: pal.cuspPull }, controls, stops);
    for (let i = 1; i < ramp.length - 1; i++) {
      const a = ramp[i - 1].chroma, b = ramp[i].chroma, c = ramp[i + 1].chroma;
      if (b <= a - 3 && b <= c - 3) out.push(`${doc.__presetName}|${pal.name}|${ramp[i].stop}`);
    }
  }
  return out;
}

function sweep(engine) {
  const found = new Set();
  let corpusPalettes = 0;
  for (const doc of [...docs, kit]) {
    if ((doc.dampAmp ?? 0) !== 0) continue;
    if (doc !== kit) corpusPalettes += doc.palettes.length;
    for (const stops of [engine.STOPS, engine.EXPORT_STOPS]) for (const name of findDips(doc, stops, engine)) found.add(name);
  }
  return { dips: [...found].sort(), corpusPalettes };
}

// the hueShift grid (header). Each sweep returns its dip names; the predicate is findDips's.
function gridDips(ramp, key, skip500) {
  const out = [];
  for (let i = 1; i < ramp.length - 1; i++) {
    if (skip500 && ramp[i].stop === 500) continue;
    const a = ramp[i - 1].chroma, b = ramp[i].chroma, c = ramp[i + 1].chroma;
    if (b <= a - 3 && b <= c - 3) out.push(`${key}|${ramp[i].stop}`);
  }
  return out;
}
const gridControls = (hueSpace) => ({ curve: kit.curve, tension: kit.tension, lmin: kit.lmin, lmax: kit.lmax, damp: kit.damp, dampCurve: kit.dampCurve, dampAmp: 0, dampBias: kit.dampBias, hueSpace, relChroma: kit.relChroma, chromaFloor: kit.chromaFloor, vibrancy: kit.vibrancy, toneMode: "even" });
function gridGatePath(engine) {
  const out = [];
  let palettes = 0;
  for (const hueSpace of ["oklch", "cam16"]) {
    const controls = gridControls(hueSpace);
    for (let hue = 0; hue < 360; hue += 15) for (const chroma of [30, 45, 60]) for (const s of [30, 45, 60]) for (const hueShift of [s, -s]) for (const hueSameDir of [false, true]) {
      palettes++;
      for (const stops of [engine.STOPS, engine.EXPORT_STOPS]) {
        const ramp = engine.paletteStops({ hue, chroma, skew: 0, lift: 0, hueShift, hueSameDir }, controls, stops);
        out.push(...gridDips(ramp, `${hueSpace}|hue ${hue}|chroma ${chroma}|hueShift ${hueShift}|sameDir ${hueSameDir}|${stops.length} stops`, false));
      }
    }
  }
  return { dips: out, palettes };
}
function gridRendered(engine) {
  const out = [];
  let palettes = 0;
  for (const hueSpace of ["oklch", "cam16"]) {
    const controls = gridControls(hueSpace);
    for (const pal of kit.palettes) for (const hueShift of [60, -60]) for (const hueSameDir of [false, true]) {
      palettes++;
      const chroma = rampChromaOf(pal, kit);
      for (const stops of [engine.STOPS, engine.EXPORT_STOPS]) {
        const ramp = engine.paletteStops({ hue: pal.hue, chroma, skew: pal.skew, lift: pal.lift, hueShift, hueSameDir, cuspPull: pal.cuspPull, anchor: pal.anchor }, controls, stops);
        out.push(...gridDips(ramp, `${hueSpace}|${pal.name}|hueShift ${hueShift}|sameDir ${hueSameDir}|${stops.length} stops`, true));
      }
    }
  }
  return { dips: out, palettes };
}
let gridFailed = false;
if (argScale === null) {
  const lines = [
    ["(a) gate path (no anchor)", gridGatePath, GRID_TARGET, "floorRefAt(hue, maxc, tone500, tone450, tone550)", "GRID_TARGET", "stop 500 included"],
    ["(b) rendered (kit anchors, hueShift +/-60)", gridRendered, CHROMA_AT_TARGET, "chromaAt(hue)", "CHROMA_AT_TARGET", "stop 500 excluded"],
  ];
  for (const [label, sweepFn, target, replacement, name, note] of lines) {
    const ctl = sweepFn(await patchedEngine(target, replacement, name));
    console.log(`  negative control ${label} (reference at the rotated hue): ${ctl.dips.length} dips (want > 0)`);
    if (ctl.dips.length === 0) { console.log(`FAIL: negative control DID NOT bite  -  the rotation-following reference produced 0 grid dips on ${label}`); process.exit(1); }
    const real = sweepFn(REAL);
    for (const n of real.dips) console.log(`    dip ${n}`);
    console.log(`  dip-gate even hueShift grid ${label}: ${real.dips.length} dips (19 + 25 stops, ${real.palettes} palettes, ${note})`);
    if (real.dips.length > 0) gridFailed = true;
  }
}

// the in-script negative control runs first, so the last two lines of a green run are the gate line and
// PASS: the same sweep on the pre-#701 floor at 1.6x must see dips, or this gate is blind.
if (argScale === null) {
  const ctl = sweep(await scaledEngine(CONTROL_SCALE));
  console.log(`  negative control (pre-#701 floor, ${CONTROL_SCALE}x): ${ctl.dips.length} dips (want > 0)`);
  if (ctl.dips.length === 0) { console.log("FAIL: negative control DID NOT bite  -  the pre-#701 floor at 1.6x produced 0 gate-path dips, pick a different probe"); process.exit(1); }
}

const main = sweep(argScale === null ? REAL : await scaledEngine(argScale));
const scaleNote = argScale === null ? "" : `, pre-#701 floor scaled ${argScale}x`;
for (const n of main.dips) console.log(`    dip ${n}`);
console.log(`  dip-gate even gate-path (no anchor): ${main.dips.length} dips (19 + 25 stops, ${main.corpusPalettes} palettes + default kit ${kit.palettes.length}, no baseline${scaleNote})`);
const failed = gridFailed || main.dips.length > 0;
console.log(failed ? "FAIL" : "PASS");
process.exit(failed ? 1 : 0);
