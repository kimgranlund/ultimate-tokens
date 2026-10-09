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
// The negative control runs on every invocation: a data-URL copy of the frozen ramp@1 layer
// (src/engine/layers/ramp@1.mjs, since T-0040: ramp@2's band blend absorbs these dips, see scaledEngine)
// with `evenChroma`'s floor restored to its pre-#701 gamut-relative form (chromaFloor% * maxc at every stop,
// `floorRef` dropped) and scaled 1.6x must produce more than 0 dips, or the script fails with
// `negative control DID NOT bite`. `--floor-scale <k>` runs the MAIN sweep on that patched engine at
// scale k instead (the verifier's by-hand control: `--floor-scale 1.6` prints a non-zero count and
// FAIL). Why not the shipped floor scaled alone: where every stop reads one hue and nothing rotates
// (the gate path at hueShift 0) the shipped floor is non-increasing away from the anchor for ANY scale (min(maxc, floorRef) does not depend
// on it), so scaling it cannot open a dip there (measured at #701: 0 off-anchor dips at 1.6x, gate path and
// rendered); on the anchored OKLCH path each stop reads its own solved hue (#766), so the rendered zero is
// a measurement, not a structural property. The control therefore
// removes the one thing the redesign added, which is what a regression would have to remove.
//
// The hueShift grid (#766), printed before the corpus lines. The curated corpus's largest |hueShift| is
// 10, and edge rotation is where a floor reference that moves along the ramp opens dips (#766 U2 pass 1
// read the reference at each stop's rotated hue: 0 corpus dips, 64 at hueShift 60 on this grid), so the
// corpus sweep alone cannot see that class. Three lines, same predicate, each held to its bound:
//   (a) gate path: default-kit controls (curve, tension, lmin, lmax, damp, dampCurve, dampBias,
//       relChroma, chromaFloor, vibrancy), dampAmp 0, no anchor, hue 0 to 345 step 15, chroma 30/45/60/100,
//       hueShift +/-30/45/60, hueSameDir false and true, hueSpace oklch and cam16, both stop sets
//       (2,304 palettes), bound 0. Why 100 (#785, #766): since #785 `palette.chroma` reaches `evenChroma`,
//       the one place #766's floor reference acts, only at 100; every other value renders at 100 and is
//       then scaled by g/100 (the damper), which shrinks each dip's depth by that ratio. The predicate is
//       absolute (3 C below both neighbours), so a dip at g needs a chroma-100 depth of at least 300/g, and
//       the chroma-100 cell is the only undamped render, so it bounds every g. 30/45/60 stay as the damper's
//       composition cells but cannot see the rotation-following reference on their own (c161f252 read 0
//       dips from control (a) there);
//   (b1) rendered path: the default kit's 16 palettes WITH their anchors, hueShift +/-60 and -30/-45, plus
//       the kit's #774902 palette ("Warning") at every integer hueShift from -26 to -32, hueSameDir false
//       and true, both hue spaces, both stop sets (280 palettes), stop 500 excluded (the owner's Q3 notch
//       class, as tonal.mjs `dip-gate-even`), bound 0. The -30/-45 and -26..-32 cells are #784's: the
//       #774902 palette carried an anchored stop-200 notch there (oklch, hueShift -30: 17.73 / 11.80 /
//       15.51 at 100 / 200 / 300), a floor that rose with the rotated hue's gamut ceiling, which
//       `evenChroma`'s floorMaxc cap (the stop's ceiling at the unrotated hue) retires. -45 was already
//       clean before the cap (its control cells do not dip), so the -45 cells are held by the cap's
//       identity with the unrotated floor, and the bite proof is the -30 notch. Since T-0040 ramp@2's band
//       tint reads the same capped ceiling (`fm`, paletteStopsAnchored's chromaAt): read at the rotated hue
//       it dipped at stop 100 under +/-60 (oklch Success +60: 10.43 / 6.86 / 12.30 at 075 / 100 / 125), so
//       both controls below put the tint back on the rotated ceiling along with the floor;
//   (b2) rendered path, random: RANDOM_PALETTES anchored palettes drawn from mulberry32(RANDOM_SEED) over
//       the persisted control domain (randomPalette below, draw order fixed), the kit's curve, tension,
//       lmin, lmax, damp, dampCurve, dampBias and vibrancy, both stop sets, stop 500 excluded. The chroma
//       draw is still consumed in its slot (so every later draw keeps its value) but the palette renders at
//       chroma 100, the same reason as (a): a drawn chroma below 100 never reaches `evenChroma` since #785.
//       Not 0: the per-stop OKLCH solve trades dips on random anchored input under rotation (#766 review p2
//       F1, owner R87, measured and accepted), so the bound is RANDOM_PIN, this same block's count on the
//       merge-base engine, and the line fails if the head count exceeds it.
// Each line has a data-URL control that puts back the rotation-following reading: (a) swaps GRID_TARGET's
// `baseHue` for the rotated `hue` (paletteStops); (b1) and (b2) share one engine that drops
// CHROMA_AT_TARGET's `resolvedHue`, so the final chroma line reads the reference at the rotated hue
// (paletteStopsAnchored). Each control must print more dips than its line's bound or the script fails
// `negative control DID NOT bite`; a patch target that is not in src/engine/tonal.js exactly once fails the
// script too. (b1) has a second control, #784's: the engine with FLOOR_MAXC_TARGET's cap dropped (`fm` =
// `mc`, the floor reading the stop's own rotated-hue ceiling), which must print dips on (b1)'s grid and,
// on the frozen ramp@1 layer (T-0040: ramp@2's band rule closes the notch even uncapped), reproduce the
// notch on the #774902 palette at hueShift -30 (oklch), with the pinned neighbours NOTCH_PIN (19 stops
// 150/200/250 = 16.58/11.80/15.51, 25 stops 175/200/250 = 15.23/11.80/15.51) and 11.80 at stop 200, while
// the shipped engine holds no dip there. Each control and line prints its own ms. `--floor-scale` skips
// the grid.
import { readFileSync } from "node:fs";
import { hydrate } from "../../src/ui/persist.js";
import { defaultDocument, rampChromaOf } from "../../src/ui/model.mjs";
import * as REAL from "../../src/engine/tonal.js";

const CATS = ["architecture", "brands", "cuisine", "film", "literature", "music", "nature", "travel"];
const FLOOR_TARGET = "const floorC = Math.min(((chromaFloor ?? 0) / 100) * Math.min(floorMaxc, floorRef), intended);";
const CONTROL_SCALE = 1.6;
const GRID_TARGET = "floorRefAt(baseHue, maxc, tone500, tone450, tone550)";
const CHROMA_AT_TARGET = "chromaAt(hue, resolvedHue)";
const FLOOR_MAXC_TARGET = "const fm = Math.min(mc, maxChromaInGamut(hRef, tone));";
// (b1)'s hueShift grid: +/-60 (#766's rule) and -30/-45 (#784), every kit palette; plus, for the kit's
// anchored #774902 palette (the notch palette, "Warning"), every integer shift from -26 to -32.
const RENDERED_SHIFTS = [60, -60, -30, -45];
const NOTCH_ANCHOR = "#774902";
const NOTCH_SHIFTS = [-26, -27, -28, -29, -30, -31, -32];
// #784's pinned neighbours of the notch on the engine WITHOUT the floorMaxc cap (what the gate's control
// prints): the kit's #774902 palette at hueShift -30, oklch, kit controls, dampAmp 0, toneMode even. 19
// stops: 150 / 200 / 250; 25 stops: 175 / 200 / 250. Stop 200 sits more than 3 C under both neighbours.
// Read on the frozen ramp@1 layer since T-0040 (ADR-037): ramp@2 without the cap reads 16.62 / 13.87 /
// 17.83 (19 stops) and 13.64 / 13.87 / 17.83 (25 stops), no notch to pin, so the #784 notch is reproduced
// where it occurred (src/engine/layers/ramp@1.mjs, never edited) and the pin cannot drift.
const NOTCH_PIN = { 19: ["16.58", "11.80", "15.51"], 25: ["15.23", "11.80", "15.51"] };
const RAMP_V1 = "../../src/engine/layers/ramp@1.mjs";
const RANDOM_SEED = 766;
const RANDOM_PALETTES = 1000;
// (b2)'s bound: this block's dip count on the merge-base engine, 8428280e (floorref-hue U2 pass 3, read
// by importing that tree's src/engine/tonal.js as REAL, the block at chroma 100): 8 dip cells in 5
// palettes. R87's rule is unchanged; the population moved (the block rendered the drawn chroma until
// #785, which read 7 dip cells in 4 palettes on the same tree, the earlier pin), so the count did too.
const RANDOM_PIN = 8;

const argScale = (() => {
  const i = process.argv.indexOf("--floor-scale");
  if (i < 0) return null;
  const k = Number(process.argv[i + 1]);
  if (!Number.isFinite(k) || k <= 0) { console.log(`FAIL: --floor-scale needs a positive number, got ${process.argv[i + 1]}`); process.exit(1); }
  return k;
})();

// a data-URL copy of `file` (src/engine/tonal.js, or the frozen ramp@1 layer for #784's notch pin) with
// `target` (which must occur exactly once) replaced; its relative imports are resolved against `file`
async function patchedEngine(target, replacement, name, file = "../../src/engine/tonal.js") {
  const url = new URL(file, import.meta.url);
  const src = readFileSync(url, "utf8");
  if (src.split(target).length !== 2) {
    console.log(`FAIL: the patch target string was not found exactly once in ${file}  -  the engine line moved, update ${name}`);
    process.exit(1);
  }
  const patched = src
    .replace(/from "(\.\.?\/[^"]+)"/g, (_, rel) => `from "${new URL(rel, url).href}"`)
    .replace(target, replacement);
  return import(`data:text/javascript;base64,${Buffer.from(patched).toString("base64")}`);
}

// the pre-#701 floor (floorRef dropped), scaled k, on the frozen ramp@1 layer since T-0040 (ADR-037):
// ramp@2 blends every stop but 500 toward the band tint (weight 0 at 500, 1 at the band edge), which
// absorbs the scaled floor's gate-path dips (ramp@2 reads 0 at 1.6x, 2x, 2.5x and 3x; ramp@1's are all
// at stop 400), so the control is read where the pre-#701 floor's dips occur
const scaledEngine = (k) => patchedEngine(FLOOR_TARGET, `const floorC = Math.min((((chromaFloor ?? 0) * ${k}) / 100) * maxc, intended);`, "FLOOR_TARGET", RAMP_V1);

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
    for (let hue = 0; hue < 360; hue += 15) for (const chroma of [30, 45, 60, 100]) for (const s of [30, 45, 60]) for (const hueShift of [s, -s]) for (const hueSameDir of [false, true]) {
      palettes++;
      for (const stops of [engine.STOPS, engine.EXPORT_STOPS]) {
        const ramp = engine.paletteStops({ hue, chroma, skew: 0, lift: 0, hueShift, hueSameDir }, controls, stops);
        out.push(...gridDips(ramp, `${hueSpace}|hue ${hue}|chroma ${chroma}|hueShift ${hueShift}|sameDir ${hueSameDir}|${stops.length} stops`, false));
      }
    }
  }
  return { dips: out, palettes };
}
const renderedShifts = (pal) => (pal.anchor === NOTCH_ANCHOR ? [...new Set([...RENDERED_SHIFTS, ...NOTCH_SHIFTS])] : RENDERED_SHIFTS);
function gridRendered(engine) {
  const out = [];
  let palettes = 0;
  for (const hueSpace of ["oklch", "cam16"]) {
    const controls = gridControls(hueSpace);
    for (const pal of kit.palettes) for (const hueShift of renderedShifts(pal)) for (const hueSameDir of [false, true]) {
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
// (b2): mulberry32, and per palette, in this order: hueSpace, hue, chroma, skew, lift, hueShift,
// hueSameDir, the anchor's three channels, chromaFloor, relChroma. Re-ordering a draw changes the set. The
// chroma draw is consumed and discarded (`(rnd(), 100)`): the palette renders at 100 (header).
function randomPalette(rnd) {
  const hueSpace = rnd() < 0.5 ? "oklch" : "cam16";
  const pal = { hue: rnd() * 360, chroma: (rnd(), 100), skew: rnd() * 200 - 100, lift: rnd() * 80 - 40, hueShift: Math.round(rnd() * 120 - 60), hueSameDir: rnd() < 0.5 };
  pal.anchor = "#" + [0, 0, 0].map(() => Math.floor(rnd() * 256).toString(16).padStart(2, "0")).join("").toUpperCase();
  const chromaFloor = Math.round(rnd() * 100), relChroma = rnd() < 0.5;
  return { pal, controls: { ...gridControls(hueSpace), chromaFloor, relChroma } };
}
function gridRandom(engine) {
  let a = RANDOM_SEED >>> 0;
  const rnd = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const out = [];
  for (let i = 0; i < RANDOM_PALETTES; i++) {
    const { pal, controls } = randomPalette(rnd);
    for (const stops of [engine.STOPS, engine.EXPORT_STOPS]) {
      const ramp = engine.paletteStops(pal, controls, stops);
      out.push(...gridDips(ramp, `#${i}|${controls.hueSpace}|anchor ${pal.anchor}|hueShift ${pal.hueShift}|sameDir ${pal.hueSameDir}|chromaFloor ${controls.chromaFloor}|relChroma ${controls.relChroma}|${stops.length} stops`, true));
    }
  }
  return { dips: out, palettes: RANDOM_PALETTES, dipPalettes: new Set(out.map((n) => n.split("|")[0])).size };
}
let gridFailed = false;
if (argScale === null) {
  const engines = new Map();
  const engineFor = async (target, replacement, name) => {
    if (!engines.has(target)) engines.set(target, await patchedEngine(target, replacement, name));
    return engines.get(target);
  };
  const lines = [
    ["(a) gate path (no anchor)", gridGatePath, GRID_TARGET, "floorRefAt(hue, maxc, tone500, tone450, tone550)", "GRID_TARGET", "stop 500 included", 0],
    ["(b1) rendered (kit anchors, hueShift +/-60, -30/-45, #774902 -26 to -32)", gridRendered, CHROMA_AT_TARGET, "chromaAt(hue)", "CHROMA_AT_TARGET", "stop 500 excluded", 0],
    [`(b2) rendered (random anchored, seed ${RANDOM_SEED})`, gridRandom, CHROMA_AT_TARGET, "chromaAt(hue)", "CHROMA_AT_TARGET", "stop 500 excluded", RANDOM_PIN],
  ];
  for (const [label, sweepFn, target, replacement, name, note, bound] of lines) {
    let t0 = performance.now();
    const ctl = sweepFn(await engineFor(target, replacement, name));
    const pinNote = bound > 0 ? ", the pinned merge-base count" : "";
    console.log(`  negative control ${label} (reference at the rotated hue): ${ctl.dips.length} dips (want > ${bound}${pinNote}) ${Math.round(performance.now() - t0)} ms`);
    if (ctl.dips.length <= bound) { console.log(`FAIL: negative control DID NOT bite  -  the rotation-following reference produced ${ctl.dips.length} grid dips on ${label}, not more than ${bound}`); process.exit(1); }
    t0 = performance.now();
    const real = sweepFn(REAL);
    for (const n of real.dips) console.log(`    dip ${n}`);
    const inPalettes = real.dipPalettes === undefined ? "" : ` in ${real.dipPalettes} palettes`;
    console.log(`  dip-gate even hueShift grid ${label}: ${real.dips.length} dips${inPalettes} (19 + 25 stops, ${real.palettes} palettes, ${note}, bound ${bound}${pinNote}) ${Math.round(performance.now() - t0)} ms`);
    if (real.dips.length > bound) gridFailed = true;
  }

  // (b1)'s #784 control: the engine without the floorMaxc cap (`fm` = the stop's own rotated-hue maxc, the
  // floor of the head before #784). It must print dips on (b1)'s grid (the real engine's bound there is 0)
  // and, read on the frozen ramp@1 layer (NOTCH_PIN), reproduce the notch on the kit's #774902 palette at
  // hueShift -30 (oklch) at stop 200, with the pinned neighbours, on both stop sets; a patch target that is
  // not in tonal.js or ramp@1.mjs exactly once fails the script.
  const t0 = performance.now();
  const notchPal = kit.palettes.find((p) => p.anchor === NOTCH_ANCHOR);
  if (!notchPal) { console.log(`FAIL: the default kit has no ${NOTCH_ANCHOR} palette  -  update NOTCH_ANCHOR`); process.exit(1); }
  const noCap = await engineFor(FLOOR_MAXC_TARGET, "const fm = mc;", "FLOOR_MAXC_TARGET");
  const noCapV1 = await patchedEngine(FLOOR_MAXC_TARGET, "const fm = mc;", "FLOOR_MAXC_TARGET", RAMP_V1);
  const notchRamp = (engine, stops) => engine.paletteStops({ hue: notchPal.hue, chroma: rampChromaOf(notchPal, kit), skew: notchPal.skew, lift: notchPal.lift, hueShift: -30, hueSameDir: false, cuspPull: notchPal.cuspPull, anchor: notchPal.anchor }, gridControls("oklch"), stops);
  const chromaAtStop = (ramp, stop) => ramp.find((r) => r.stop === stop).chroma.toFixed(2);
  const ctl = gridRendered(noCap);
  console.log(`  negative control (b1) no floorMaxc cap (#784): ${ctl.dips.length} dips (want > 0) ${Math.round(performance.now() - t0)} ms`);
  if (ctl.dips.length === 0) { console.log("FAIL: negative control DID NOT bite  -  the floor read at the rotated hue produced 0 (b1) dips"); process.exit(1); }
  for (const stops of [REAL.STOPS, REAL.EXPORT_STOPS]) {
    const n = stops.length, at = n === 19 ? [150, 200, 250] : [175, 200, 250];
    const got = at.map((s) => chromaAtStop(notchRamp(noCapV1, stops), s));
    const want = NOTCH_PIN[n];
    const real = at.map((s) => chromaAtStop(notchRamp(REAL, stops), s));
    console.log(`  notch pin ${n} stops, stops ${at.join("/")}: control (ramp@1) ${got.join(" / ")} (pinned ${want.join(" / ")}), engine ${real.join(" / ")}`);
    if (got.join() !== want.join()) { console.log(`FAIL: the control's notch neighbours moved off the pin on ${n} stops  -  the notch is no longer the #784 one, re-pin NOTCH_PIN`); process.exit(1); }
    const key = `notch ${n} stops`;
    if (gridDips(notchRamp(noCapV1, stops), key, true).length === 0) { console.log(`FAIL: negative control DID NOT bite  -  no stop-200 notch on ${n} stops at hueShift -30`); process.exit(1); }
    if (gridDips(notchRamp(REAL, stops), key, true).length !== 0) { console.log(`FAIL: the engine still has the #784 notch on ${n} stops at hueShift -30`); gridFailed = true; }
  }
}

// the in-script negative control runs first, so the last two lines of a green run are the gate line and
// PASS: the same sweep on the pre-#701 floor at 1.6x must see dips, or this gate is blind.
if (argScale === null) {
  const ctl = sweep(await scaledEngine(CONTROL_SCALE));
  console.log(`  negative control (pre-#701 floor, ${CONTROL_SCALE}x, ramp@1): ${ctl.dips.length} dips (want > 0)`);
  if (ctl.dips.length === 0) { console.log("FAIL: negative control DID NOT bite  -  the pre-#701 floor at 1.6x produced 0 gate-path dips, pick a different probe"); process.exit(1); }
}

const main = sweep(argScale === null ? REAL : await scaledEngine(argScale));
const scaleNote = argScale === null ? "" : `, pre-#701 floor scaled ${argScale}x on ramp@1`;
for (const n of main.dips) console.log(`    dip ${n}`);
console.log(`  dip-gate even gate-path (no anchor): ${main.dips.length} dips (19 + 25 stops, ${main.corpusPalettes} palettes + default kit ${kit.palettes.length}, no baseline${scaleNote})`);
const failed = gridFailed || main.dips.length > 0;
console.log(failed ? "FAIL" : "PASS");
process.exit(failed ? 1 : 0);
