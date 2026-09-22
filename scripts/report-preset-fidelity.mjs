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
//
// `--identity-control` (#715 U2, closing C4's other yellow row) is a SEPARATE mode: it renders the
// base tree's 8 category files plus its default kit on TWO engine copies (the base tree named by
// `--base <rev>` or `--base-dir <dir>`, and this file's own working tree) and diffs every emitted
// cell, so a ramp move shows up cell by cell against any named base, not just as a hand measurement.
//
//   node scripts/report-preset-fidelity.mjs --identity-control (--base <rev> | --base-dir <dir>)
//     [--authored] [--only <category>|default-kit] [--perturb]
//
// `--authored` keeps each palette's `anchor`/`sourceAnchor` (the default strips both, since the
// unanchored path is blind to a mutation on the anchored construction  -  see the adapter's
// `ramp-identity` row). `--only` narrows the subjects to one category or `default-kit`. `--perturb`
// is this mode's own negative control (the `--damp-amp` pattern above): it flips the last hex digit
// of the first rendered cell on the HEAD side before the compare, so a green run can be told apart
// from a compare that silently never ran.
import { readFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { join as pathJoin, resolve as pathResolve, dirname } from "node:path";
import { hydrate } from "../src/ui/persist.js";
import { defaultDocument, rampChromaOf, EXPORT_STOPS, lstarFromRgb } from "../src/ui/model.mjs";
import * as T from "../src/engine/tonal.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = pathJoin(HERE, "..");
// declared here, ahead of the identity-control dispatch below, because that dispatch runs (and can
// call process.exit) before this module's own top-level `const` lines further down are reached
const IDENTITY_CATS = ["architecture", "brands", "cuisine", "film", "literature", "music", "nature", "travel"];
const IDENTITY_MODES = ["perceptual", "peak", "even"];

const args = process.argv.slice(2);
const mode_envelope = args.includes("--envelope");
const mode_identity = args.includes("--identity-control");
const dampAmpIdx = args.indexOf("--damp-amp");
const dampAmpOverride = dampAmpIdx >= 0 ? Number(args[dampAmpIdx + 1]) : null;

const USAGE =
  "usage: node scripts/report-preset-fidelity.mjs --envelope [--damp-amp N]\n" +
  "       node scripts/report-preset-fidelity.mjs --identity-control (--base <rev> | --base-dir <dir>) [--authored] [--only <category>|default-kit] [--perturb]";

if (!mode_envelope && !mode_identity) {
  console.error(USAGE);
  process.exit(2);
}

if (mode_identity) {
  await runIdentityControl(args);
  // runIdentityControl always exits the process itself; nothing below this line runs for this mode.
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

// ── --identity-control ──────────────────────────────────────────────────────────────────────────
// C4's ramp half (the plan's own named command, #715 U2): loads a BASE tree (a git revision unpacked
// to a scratch directory, or an existing directory) and this file's own working tree side by side,
// renders the base tree's 8 category files plus its default kit on BOTH, and diffs every emitted
// cell. This proves whether the CURRENT working tree moved a ramp against the named base, it is
// blind to anything the base tree itself already carried (a stripped-anchor mutation on the
// anchored path, for one, see the adapter's `ramp-identity` row for when `--authored` is required).
// (IDENTITY_CATS / IDENTITY_MODES are declared near the top of this file, ahead of the dispatch.)

function identityRender(engine, pal, doc, mode) {
  const controls = {
    curve: doc.curve, tension: doc.tension, lmin: doc.lmin, lmax: doc.lmax,
    damp: doc.damp, dampCurve: doc.dampCurve, dampAmp: doc.dampAmp, dampBias: doc.dampBias,
    hueSpace: doc.hueSpace, relChroma: doc.relChroma, chromaFloor: doc.chromaFloor,
    vibrancy: doc.vibrancy, toneMode: mode,
  };
  const chroma = engine.rampChromaOf(pal, doc);
  return engine.paletteStops(
    { hue: pal.hue, chroma, skew: pal.skew, lift: pal.lift, hueShift: pal.hueShift ?? 0, hueSameDir: pal.hueSameDir === true, cuspPull: pal.cuspPull, anchor: pal.anchor },
    controls,
    engine.EXPORT_STOPS,
  );
}

function stripAnchor(pal) {
  const { anchor, sourceAnchor, ...rest } = pal;
  return rest;
}

function newIdentityAgg() {
  return { palettesTotal: 0, palettesDiff: 0, cellsTotal: 0, cellsDiff: 0, maxDL: 0, witnesses: [] };
}

async function runIdentityControl(args) {
  const baseIdx = args.indexOf("--base");
  const baseDirIdx = args.indexOf("--base-dir");
  const authored = args.includes("--authored");
  const perturb = args.includes("--perturb");
  const onlyIdx = args.indexOf("--only");
  const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null;

  if ((baseIdx < 0) === (baseDirIdx < 0)) {
    // neither given, or both given, exactly one is required
    console.error(USAGE);
    process.exit(2);
  }
  if (only !== null && only !== "default-kit" && !IDENTITY_CATS.includes(only)) {
    console.error(`usage: --only must be one of ${IDENTITY_CATS.join(", ")} or default-kit, got "${only}"`);
    process.exit(2);
  }

  let baseDir = null;
  let scratch = null;
  if (baseDirIdx >= 0) {
    baseDir = pathResolve(process.cwd(), args[baseDirIdx + 1]);
  } else {
    const rev = args[baseIdx + 1];
    if (!rev) {
      console.error(USAGE);
      process.exit(2);
    }
    scratch = mkdtempSync(pathJoin(tmpdir(), "ramp-identity-"));
    // removed on every exit path below: the try/catch here, exitIdentity() everywhere else, and this
    // process-exit backstop for any path that terminates without going through exitIdentity()
    process.on("exit", () => { try { rmSync(scratch, { recursive: true, force: true }); } catch { /* best effort */ } });
    try {
      const archive = execFileSync("git", ["archive", rev, "src"], { cwd: REPO_ROOT, maxBuffer: 1024 * 1024 * 256 });
      execFileSync("tar", ["-x", "-C", scratch], { input: archive });
    } catch (e) {
      console.error(`usage: --base ${rev} could not be archived: ${e.message}`);
      process.exit(2);
    }
    baseDir = scratch;
  }

  function exitIdentity(code) {
    if (scratch) { try { rmSync(scratch, { recursive: true, force: true }); } catch { /* best effort */ } }
    process.exit(code);
  }

  const REQUIRED_FILES = ["src/ui/persist.js", "src/ui/model.mjs", "src/engine/tonal.js"];
  for (const rel of REQUIRED_FILES) {
    if (!existsSync(pathJoin(baseDir, rel))) {
      console.error(`usage: base tree at ${baseDir} is missing ${rel}`);
      exitIdentity(2);
      return;
    }
  }

  let baseModule;
  try {
    const [basePersist, baseModel, baseTonal] = await Promise.all([
      import(pathToFileURL(pathJoin(baseDir, "src/ui/persist.js")).href),
      import(pathToFileURL(pathJoin(baseDir, "src/ui/model.mjs")).href),
      import(pathToFileURL(pathJoin(baseDir, "src/engine/tonal.js")).href),
    ]);
    baseModule = { persist: basePersist, model: baseModel, tonal: baseTonal };
  } catch (e) {
    console.error(`usage: base tree at ${baseDir} failed to load: ${e.message}`);
    exitIdentity(2);
    return;
  }
  const NEED = { persist: ["hydrate"], model: ["defaultDocument", "rampChromaOf", "EXPORT_STOPS"], tonal: ["paletteStops"] };
  for (const [key, names] of Object.entries(NEED)) {
    for (const name of names) {
      if (!(name in baseModule[key])) {
        console.error(`usage: base tree at ${baseDir} is missing the export ${name}`);
        exitIdentity(2);
        return;
      }
    }
  }

  const baseEngine = {
    rampChromaOf: baseModule.model.rampChromaOf,
    paletteStops: baseModule.tonal.paletteStops,
    EXPORT_STOPS: baseModule.model.EXPORT_STOPS,
  };
  const headEngine = { rampChromaOf, paletteStops: T.paletteStops, EXPORT_STOPS };

  const wantKit = only === null || only === "default-kit";
  const wantCats = only === null ? IDENTITY_CATS : (only === "default-kit" ? [] : [only]);

  const corpusSubjects = [];
  for (const slug of wantCats) {
    const catPath = pathJoin(baseDir, `src/ui/categories/${slug}.js`);
    if (!existsSync(catPath)) {
      console.error(`usage: base tree at ${baseDir} is missing category ${slug}`);
      exitIdentity(2);
      return;
    }
    const catModule = await import(pathToFileURL(catPath).href);
    if (!("PRESETS" in catModule)) {
      console.error(`usage: base tree at ${baseDir} category ${slug} is missing the export PRESETS`);
      exitIdentity(2);
      return;
    }
    const { PRESETS } = catModule;
    for (const preset of PRESETS) {
      const doc = baseModule.persist.hydrate({ ...preset });
      for (const pal of doc.palettes) corpusSubjects.push({ label: `${slug}/${preset.name}/${pal.name}`, pal, doc });
    }
  }
  const kitSubjects = [];
  if (wantKit) {
    const doc = baseModule.model.defaultDocument();
    for (const pal of doc.palettes) kitSubjects.push({ label: `default-kit/${pal.name}`, pal, doc });
  }

  // a full run (no --only) that loads no palettes at all is a vacuity FAIL, not a usage error, since
  // it is the same shape as loading N and rendering fewer than N: nothing was actually compared
  const noPalettesLoaded = only === null && corpusSubjects.length === 0 && kitSubjects.length === 0;

  let perturbDone = false;
  let renderedCount = 0;
  let loadedCount = corpusSubjects.length + kitSubjects.length;

  function sweep(subjects) {
    const agg = {};
    for (const mode of IDENTITY_MODES) agg[mode] = newIdentityAgg();
    for (const { label, pal, doc } of subjects) {
      const palForRender = authored ? pal : stripAnchor(pal);
      let renderedAllModes = true;
      for (const mode of IDENTITY_MODES) {
        let baseRamp, headRamp;
        try {
          baseRamp = identityRender(baseEngine, palForRender, doc, mode);
          headRamp = identityRender(headEngine, palForRender, doc, mode);
        } catch (e) {
          renderedAllModes = false;
          continue;
        }
        if (perturb && !perturbDone) {
          const cell = headRamp[0];
          const lastChar = cell.hex.slice(-1);
          const flipped = lastChar === "0" ? "1" : (lastChar === "F" ? "E" : (parseInt(lastChar, 16) ^ 1).toString(16).toUpperCase());
          cell.hex = cell.hex.slice(0, -1) + flipped;
          perturbDone = true;
        }
        const a = agg[mode];
        a.palettesTotal++;
        let paletteDiffered = false;
        const n = Math.min(baseRamp.length, headRamp.length);
        for (let i = 0; i < n; i++) {
          a.cellsTotal++;
          if (baseRamp[i].hex !== headRamp[i].hex) {
            a.cellsDiff++;
            paletteDiffered = true;
            const dL = Math.abs(lstarFromRgb(baseRamp[i].rgb) - lstarFromRgb(headRamp[i].rgb));
            if (dL > a.maxDL) a.maxDL = dL;
            if (a.witnesses.length < 3) a.witnesses.push(`${label} at stop ${baseRamp[i].stop}`);
          }
        }
        if (paletteDiffered) a.palettesDiff++;
      }
      if (renderedAllModes) renderedCount++;
    }
    return agg;
  }

  const corpusAgg = wantCats.length ? sweep(corpusSubjects) : null;
  const kitAgg = wantKit ? sweep(kitSubjects) : null;

  let totalDiff = 0;
  function printAgg(agg, suffix) {
    for (const mode of IDENTITY_MODES) {
      const a = agg[mode];
      totalDiff += a.cellsDiff;
      const witnessText = a.witnesses.length ? ` (e.g. ${a.witnesses.join(", ")})` : "";
      console.log(`identity ${mode}${suffix}: ${a.palettesDiff}/${a.palettesTotal} palettes, ${a.cellsDiff}/${a.cellsTotal} cells differ, max dL* ${a.maxDL.toFixed(4)}${witnessText}`);
    }
  }
  if (corpusAgg) printAgg(corpusAgg, "");
  if (kitAgg) printAgg(kitAgg, " default kit");

  const vacuityFail = noPalettesLoaded || renderedCount !== loadedCount;

  if (vacuityFail) {
    // the FAIL line prints last, and the total below is skipped, so a reader grepping only
    // `^0 differing cells$` (the passing needle) can never read this run as green
    console.log(`FAIL: vacuity, rendered ${renderedCount} of ${loadedCount} loaded palette(s)`);
    exitIdentity(1);
    return;
  }

  console.log(`${totalDiff} differing cells`);
  exitIdentity(totalDiff > 0 ? 1 : 0);
}
