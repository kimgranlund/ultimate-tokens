#!/usr/bin/env node
// report-preset-fidelity.mjs  -  C6's Q4-ruled envelope-shape table (`--envelope`), the plan's own named
// command (preset-intent-fidelity.md, C6). Reports the median/p90 of emitted CAM16 chroma at stops
// 100/300/700/900 as a percentage of stop 500's own CAM16 chroma, over the corpus C6 names (curated
// palettes at source chroma >= 10, plus the 8 default-kit semantic families  -  Neutral through Danger,
// not Data 1-8), on the RENDERED path (rampChromaOf, matching src/ui/model.mjs's projectView  -  never a
// palette's raw stored `chroma`, per the C6(i)/(ii) rendered-path fix this same unit made), in all
// three tone modes.
//
// `--movement` (U4's own criterion, C6-iv/C9) is NOT built here  -  out of this unit's lane. This file
// exists so U4 can add that mode to it rather than invent a second script.
//
//   node scripts/report-preset-fidelity.mjs --envelope [--damp-amp N]
//
// `--damp-amp N` is the plan's own negative control: forces every palette's `dampAmp` control to N
// (overriding whatever the source document carries) before measuring, to prove the above-100% count
// tracks the mechanism rather than being a static, uninspected number.
import { readFileSync } from "node:fs";
import { hydrate } from "../src/ui/persist.js";
import { defaultDocument, rampChromaOf } from "../src/ui/model.mjs";
import * as T from "../src/engine/tonal.js";

const args = process.argv.slice(2);
const mode_envelope = args.includes("--envelope");
const dampAmpIdx = args.indexOf("--damp-amp");
const dampAmpOverride = dampAmpIdx >= 0 ? Number(args[dampAmpIdx + 1]) : null;

if (!mode_envelope) {
  console.error("usage: node scripts/report-preset-fidelity.mjs --envelope [--damp-amp N]");
  process.exit(2);
}

const CATS = ["architecture", "brands", "cuisine", "film", "literature", "music", "nature", "travel"];
const RT = JSON.parse(readFileSync(new URL("../docs/reference/data/role-table.json", import.meta.url), "utf8"));
const DEFAULT_KIT_NAMES = new Set(RT.defaults.filter((d) => !/^Data \d+$/.test(d.name)).map((d) => d.name)); // the 8 semantic families, not Data 1-8

// The C6 corpus: curated palettes at source chroma >= 10, plus the 8 default-kit semantic families.
// ADIA_CARVEOUT  -  the one named, owner-ruled AUTHORED (dampAmp>0) exception (test/engine/tonal.mjs
// carries the gating copy of this set; this script's is for REPORTING only, so a FAIL/OK line reads
// true rather than perpetually flagging the allowed Adia population).
const ADIA_CARVEOUT = new Set(["Adia · The product's own design system"]);
const instances = []; // { label, presetName, pal, doc }
let totalCurated = 0;
for (const slug of CATS) {
  const { PRESETS } = await import(`../src/ui/categories/${slug}.js`);
  for (const preset of PRESETS) {
    const doc = hydrate({ ...preset });
    for (const pal of doc.palettes) {
      totalCurated++;
      if (pal.chroma >= 10) instances.push({ label: `${slug}/${preset.name}/${pal.name}`, presetName: preset.name, pal, doc });
    }
  }
}
const roleDoc = defaultDocument();
for (const p of roleDoc.palettes) {
  if (DEFAULT_KIT_NAMES.has(p.name)) instances.push({ label: `default/${p.name}`, presetName: null, pal: p, doc: roleDoc });
}

function percentile(sorted, p) {
  if (sorted.length === 0) return NaN;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

const REPORT_STOPS = [100, 300, 700, 900];
const MODES = ["perceptual", "peak", "even"];
const results = {};
const aboveWitnesses = { perceptual: [], peak: [], even: [] };
let aboveTotal = { perceptual: 0, peak: 0, even: 0 };
let adiaAboveTotal = { perceptual: 0, peak: 0, even: 0 };
// CUSP_RUN_BOUND  -  perceptual's owner-ruled bound (#681 U3 pass 6, ruling (f), plan revision 20):
// 189.3005% of stop 500's own chroma, EXACT  -  the corpus's fresh-measured worst cusp-stop excess
// (89.3005pp, cuisine "Sushi & sashimi · the cypress counter"/primary-muted, cusp stop 650), frozen at
// this precise value, not rounded. Even and peak keep the literal "0 above 100%" reading; perceptual is
// reported under its own ruled clause instead (one contiguous above-anchor run, every stop in it at or
// under this bound)  -  see test/engine/tonal.mjs's gating copy (C6 iii-b) for the enforced version; this
// script's copy is for REPORTING only.
const CUSP_RUN_BOUND = 1.893005;
const perceptualRunFails = { runs: [], bound: [] }; // witnesses, non-Adia only

for (const mode of MODES) {
  const ratios = { 100: [], 300: [], 700: [], 900: [] };
  for (const { label, presetName, pal, doc } of instances) {
    const controls = {
      curve: doc.curve, tension: doc.tension, lmin: doc.lmin, lmax: doc.lmax,
      damp: doc.damp, dampCurve: doc.dampCurve,
      dampAmp: dampAmpOverride !== null ? dampAmpOverride : doc.dampAmp,
      dampBias: doc.dampBias, hueSpace: doc.hueSpace, relChroma: doc.relChroma,
      chromaFloor: doc.chromaFloor, vibrancy: doc.vibrancy, toneMode: mode,
    };
    const chroma = rampChromaOf(pal, doc);
    // anchor: pal.anchor (U4 pass 2, addendum 2): this call omitted the anchor field, so every ramp it
    // reported rendered on the NON-anchored construction regardless of whether the source preset is
    // anchored - the same fault the dip gate had. Passing anchor through matches projectView's own call
    // shape (src/ui/model.mjs, "the SAME resolved-chroma call" this file's own header already claimed).
    const ramp = T.paletteStops(
      { hue: pal.hue, chroma, skew: pal.skew, lift: pal.lift, hueShift: pal.hueShift ?? 0, hueSameDir: pal.hueSameDir === true, cuspPull: pal.cuspPull, anchor: pal.anchor },
      controls,
      T.STOPS,
    );
    const at = (s) => ramp.find((r) => r.stop === s);
    const c500 = at(500).chroma;
    if (c500 <= 1e-9) continue; // undefined ratio at a near-zero anchor; excluded rather than divide-by-zero
    for (const s of REPORT_STOPS) {
      const pct = (at(s).chroma / c500) * 100;
      ratios[s].push(pct);
    }
    const isAdia = ADIA_CARVEOUT.has(presetName);
    if (mode === "perceptual") {
      // Ruling (f): report by RUN, not by raw stop count  -  a palette's natural cusp shoulder can span
      // several adjacent stops; only a SECOND separate run, or any stop past CUSP_RUN_BOUND, is a fail.
      let runs = 0, inRun = false, worstRatio = 0;
      for (const s of T.STOPS) {
        const pct = at(s).chroma / c500;
        if (pct > 1 + 1e-6) { if (!inRun) runs++; inRun = true; worstRatio = Math.max(worstRatio, pct); }
        else inRun = false;
      }
      if (runs > 0 && isAdia) adiaAboveTotal[mode]++;
      if (!isAdia) {
        let bad = false;
        if (runs > 1) { bad = true; if (perceptualRunFails.runs.length < 3) perceptualRunFails.runs.push(`${label} (${runs} runs)`); }
        if (worstRatio > CUSP_RUN_BOUND + 1e-6) { bad = true; if (perceptualRunFails.bound.length < 3) perceptualRunFails.bound.push(`${label} (${(worstRatio * 100).toFixed(2)}%)`); }
        if (bad) aboveTotal[mode]++;
      }
    } else {
      let roseAboveHere = false;
      for (const s of T.STOPS) {
        const pct = (at(s).chroma / c500) * 100;
        if (pct > 100 + 1e-6) roseAboveHere = true;
      }
      if (roseAboveHere) {
        if (isAdia) adiaAboveTotal[mode]++;
        else {
          aboveTotal[mode]++;
          if (aboveWitnesses[mode].length < 3) aboveWitnesses[mode].push(label);
        }
      }
    }
  }
  results[mode] = {};
  for (const s of REPORT_STOPS) {
    const sorted = [...ratios[s]].sort((a, b) => a - b);
    results[mode][s] = { median: percentile(sorted, 50), p90: percentile(sorted, 90), n: sorted.length };
  }
}

// env(500) = 1 exactly, swept over damp/dampCurve/dampAmp/dampBias/lift/toneMode: the C6 anchor
// property. toneMode is swept explicitly (#681 U3 review 3, N6): chromaEnvelope branches internally on
// `controls.toneMode === "even"` to apply EVEN_DAMP_FACTOR, so omitting it here silently tested only the
// non-even branch, even for a doc whose OWN toneMode is "even". This sweep is toneMode-independent
// reporting, not tied to any one document, so it covers both branches directly.
let envFails = 0;
for (const damp of [0, 40, 70, 80, 100]) for (const dampCurve of [0.5, 1.5, 3]) for (const dampAmp of [0, 55, 100]) for (const dampBias of [-50, 0, 50]) for (const lift of [-40, -20, 0, 20, 40]) for (const toneMode of ["perceptual", "peak", "even"]) {
  const v = T.chromaEnvelope(500, 500, lift, { damp, dampCurve, dampAmp, dampBias, toneMode });
  if (Math.abs(v - 1) > 1e-9) envFails++;
}

// SECOND READING (Q4's other name, "envelope numbers"  -  the chromaEnvelope multiplier itself, not the
// emitted pixel chroma): env(500) is always exactly 1 by construction (the sweep above), so this is
// just each palette's own env(stop) at 100/300/700/900, and "above 100%" here means env(stop) > 1 at
// ANY stop for that palette, which only a non-zero dampAmp's shoulder term can cause
// (shoulder = (dampAmp/100)*4*uG*(1-uG), C6's own comment on chromaEnvelope).
const envResults = {};
const envAboveTotal = { perceptual: 0, peak: 0, even: 0 };
const envAboveWitnesses = { perceptual: [], peak: [], even: [] };
const envAdiaAboveTotal = { perceptual: 0, peak: 0, even: 0 };
for (const mode of MODES) {
  const ratios = { 100: [], 300: [], 700: [], 900: [] };
  for (const { label, presetName, pal, doc } of instances) {
    const controls = {
      damp: doc.damp, dampCurve: doc.dampCurve,
      dampAmp: dampAmpOverride !== null ? dampAmpOverride : doc.dampAmp,
      dampBias: doc.dampBias, toneMode: mode, // #681 U3 review 3, N6: was missing, so this loop always
      // read the non-even branch of chromaEnvelope, even when mode === "even"
    };
    let roseAboveHere = false;
    for (const s of REPORT_STOPS) {
      const v = T.chromaEnvelope(s, 500, pal.lift, controls) * 100;
      ratios[s].push(v);
    }
    for (const s of T.STOPS) {
      const v = T.chromaEnvelope(s, 500, pal.lift, controls);
      if (v > 1 + 1e-9) roseAboveHere = true;
    }
    if (roseAboveHere) {
      // Only a non-zero dampAmp's shoulder term can trigger this (see the reading's own comment above),
      // so in practice only the named Adia carve-out (dampAmp 70) ever does  -  same carve-out as reading
      // (a), applied here too so this line doesn't perpetually misreport an allowed population as FAIL.
      if (ADIA_CARVEOUT.has(presetName)) envAdiaAboveTotal[mode]++;
      else {
        envAboveTotal[mode]++;
        if (envAboveWitnesses[mode].length < 5) envAboveWitnesses[mode].push(label);
      }
    }
  }
  envResults[mode] = {};
  for (const s of REPORT_STOPS) {
    const sorted = [...ratios[s]].sort((a, b) => a - b);
    envResults[mode][s] = { median: percentile(sorted, 50), p90: percentile(sorted, 90), n: sorted.length };
  }
}

console.log(`report-preset-fidelity --envelope${dampAmpOverride !== null ? ` --damp-amp ${dampAmpOverride}` : ""}`);
console.log(`corpus: ${totalCurated} curated palettes, ${instances.length} instances at source chroma >= 10 or in the 8 default-kit semantic families`);
console.log(`env(500) = 1 sweep: ${envFails === 0 ? "PASS" : `FAIL (${envFails} combinations off)`}`);
console.log("");
console.log("=== READING (a): emitted CAM16 chroma at each stop, as % of the emitted chroma at stop 500 ===");
console.log("(the literal text of C6: \"CAM16 chroma at stops 100/300/700/900 over stop 500\")");

const TARGET = { 100: { median: 25, p90: 35 }, 300: { median: 75, p90: 90 }, 700: { median: 75, p90: 90 }, 900: { median: 25, p90: 35 } };
let anyFail = envFails > 0;
for (const mode of MODES) {
  console.log(`${mode}:`);
  for (const s of REPORT_STOPS) {
    const r = results[mode][s];
    const t = TARGET[s];
    const medOk = r.median <= t.median, p90Ok = r.p90 <= t.p90;
    if (!medOk || !p90Ok) anyFail = true;
    console.log(`  stop ${s}: median ${r.median.toFixed(1)}% (<=${t.median} ${medOk ? "OK" : "FAIL"}) / p90 ${r.p90.toFixed(1)}% (<=${t.p90} ${p90Ok ? "OK" : "FAIL"}) n=${r.n}`);
  }
  const aboveOk = aboveTotal[mode] === 0;
  if (!aboveOk) anyFail = true;
  if (mode === "perceptual") {
    const witnesses = [...perceptualRunFails.runs, ...perceptualRunFails.bound].slice(0, 3);
    console.log(`  clause: one cusp run, at or under ${(CUSP_RUN_BOUND * 100).toFixed(4)}% of stop 500 (#55 cusp-pull ships unchanged; ruling (f))`);
    console.log(`  rule violations (second run or past-bound stop): ${aboveTotal[mode]} ${aboveOk ? "OK" : "FAIL"}${witnesses.length ? ` (e.g. ${witnesses.join(", ")})` : ""}`);
    console.log(`  (${adiaAboveTotal[mode]} additional instance(s) from the named Adia carve-out, exempt from this clause)`);
  } else {
    console.log(`  clause: 0 above 100% of stop 500 (generated palettes, dampAmp 0)`);
    console.log(`  above 100% of stop 500: ${aboveTotal[mode]} ${aboveOk ? "OK" : "FAIL"}${aboveWitnesses[mode].length ? ` (e.g. ${aboveWitnesses[mode].join(", ")})` : ""}`);
    console.log(`  (${adiaAboveTotal[mode]} additional instance(s) from the named Adia carve-out, exempt from this clause)`);
  }
}

console.log("");
console.log("=== READING (b): the chromaEnvelope MULTIPLIER itself, as % (Q4's other name, \"envelope numbers\") ===");
console.log("(env(500) is always exactly 1 by construction, so \"above 100%\" here means the shoulder term,");
console.log(" (dampAmp/100)*4*uG*(1-uG), pushed a stop's own multiplier above the anchor's  -  only a");
console.log(" non-zero dampAmp can do this)");
let envAnyFail = false;
for (const mode of MODES) {
  console.log(`${mode}:`);
  for (const s of REPORT_STOPS) {
    const r = envResults[mode][s];
    const t = TARGET[s];
    const medOk = r.median <= t.median, p90Ok = r.p90 <= t.p90;
    if (!medOk || !p90Ok) envAnyFail = true;
    console.log(`  stop ${s}: median ${r.median.toFixed(1)}% (<=${t.median} ${medOk ? "OK" : "FAIL"}) / p90 ${r.p90.toFixed(1)}% (<=${t.p90} ${p90Ok ? "OK" : "FAIL"}) n=${r.n}`);
  }
  const aboveOk = envAboveTotal[mode] === 0;
  if (!aboveOk) envAnyFail = true;
  console.log(`  above 100% of stop 500: ${envAboveTotal[mode]} ${aboveOk ? "OK" : "FAIL"}${envAboveWitnesses[mode].length ? ` (e.g. ${envAboveWitnesses[mode].join(", ")})` : ""}`);
  console.log(`  (${envAdiaAboveTotal[mode]} additional instance(s) from the named Adia carve-out, exempt from this clause)`);
}
// C6 (v): Q7 ratchet companion (owner's addendum, 2026-09-20). test/engine/tonal.mjs's C6 (v) gates the
// anchored PEAK violator count and max overshoot ratio corpus-wide (19-stop set, generated palettes,
// Adia excluded by name) and pins today's measured figures as a ratchet, not a bar - the rendered cells
// are report-only per #701. The anchored-EVEN companion figure used to be measured in that same gate too
// (also report-only, never gated) at a corpus-wide cost of ~9.4s, the dominant share of that gate's own
// perf regression this round; it moved HERE per team-lead's direction ("a figure that is never asserted
// does not belong in the test suite... let the blast-radius report carry it"). This uses the gate's OWN
// corpus scope (full 8-category sweep, dampAmp 0, Adia excluded by name), NOT the chroma>=10 `instances`
// scope above READING (a)/(b) use - the two are different populations and must not be conflated. Prints
// both peak (an independent cross-check of the gated pin) and even (the authoritative, report-only
// figure); neither affects this script's own exit code, matching Q7's ruling that this population is
// diagnostic, not enforced.
console.log("");
console.log("=== C6 (v): anchored-construction overshoot beyond stop 500 (Q7 ratchet companion) ===");
console.log("(full 8-category corpus, generated palettes (dampAmp 0), Adia excluded by name, 19-stop set -");
console.log(" the SAME scope test/engine/tonal.mjs's C6 (v) gates for peak; even is report-only, per the ruling)");
{
  const v5Docs = [];
  for (const slug of CATS) {
    const { PRESETS } = await import(`../src/ui/categories/${slug}.js`);
    for (const preset of PRESETS) {
      const d = hydrate({ ...preset });
      d.__presetName = preset.name;
      v5Docs.push(d);
    }
  }
  const measureAnchoredOvershoot = (mode) => {
    let violators = 0, maxRatio = 0, witness = "", total = 0;
    for (const doc of v5Docs) {
      if ((doc.dampAmp ?? 0) !== 0) continue;
      if (ADIA_CARVEOUT.has(doc.__presetName)) continue;
      const controls = { curve: doc.curve, tension: doc.tension, lmin: doc.lmin, lmax: doc.lmax, damp: doc.damp, dampCurve: doc.dampCurve, dampAmp: doc.dampAmp, dampBias: doc.dampBias, hueSpace: doc.hueSpace, relChroma: doc.relChroma, chromaFloor: doc.chromaFloor, vibrancy: doc.vibrancy, toneMode: mode };
      for (const pal of doc.palettes) {
        total++;
        const chroma = rampChromaOf(pal, doc);
        const ramp = T.paletteStops({ hue: pal.hue, chroma, skew: pal.skew, lift: pal.lift, hueShift: pal.hueShift ?? 0, hueSameDir: pal.hueSameDir === true, cuspPull: pal.cuspPull, anchor: pal.anchor }, controls, T.STOPS);
        const c500row = ramp.find((r) => r.stop === 500);
        if (!c500row) continue;
        const c500 = c500row.chroma;
        if (c500 <= 1e-9) continue;
        let localMax = 0;
        for (const row of ramp) localMax = Math.max(localMax, row.chroma / c500);
        if (localMax > 1 + 1e-6) {
          violators++;
          if (localMax > maxRatio) { maxRatio = localMax; witness = `${doc.__presetName}/${pal.name}`; }
        }
      }
    }
    return { violators, maxRatio, witness, total };
  };
  const peak = measureAnchoredOvershoot("peak");
  const even = measureAnchoredOvershoot("even");
  console.log(`  peak (gated in test/engine/tonal.mjs C6 (v)): ${peak.violators}/${peak.total} violator(s), max ${peak.maxRatio.toFixed(6)}x stop 500's own chroma, e.g. ${peak.witness}`);
  console.log(`  even (report-only, not gated anywhere): ${even.violators}/${even.total} violator(s), max ${even.maxRatio.toFixed(6)}x stop 500's own chroma, e.g. ${even.witness}`);
}

console.log("");
console.log(`READING (a) (emitted chroma): ${anyFail ? "FAIL" : "PASS"}`);
console.log(`READING (b) (envelope multiplier): ${envAnyFail ? "FAIL" : "PASS"}`);
console.log("");
console.log((anyFail || envAnyFail) ? "FAIL: the envelope table does not clear the plan's ruled targets under at least one reading" : "PASS: envelope table clears the plan's ruled targets under both readings");
process.exit((anyFail || envAnyFail) ? 1 : 0);
