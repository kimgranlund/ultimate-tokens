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
//   node scripts/report-preset-fidelity.mjs --envelope [--damp-amp N] [--damp N] [--damp-curve N] [--gate-path]
//
// `--damp-amp N` is the plan's own negative control: forces every palette's `dampAmp` control to N
// (overriding whatever the source document carries) before measuring, to prove the above-100% count
// tracks the mechanism rather than being a static, uninspected number. `--damp N` and `--damp-curve N`
// (#725 U3) force the damp and dampCurve sliders the same way, for a retune's counterfactual reads; the
// engine's own mode-scoped mapping (tonal.js OKHSL_DAMP_D) still applies to what they set.
//
// The READING (a) corpus loop is scripts/lib/envelope-measure.mjs's `measureEnvelope` (#725 U1), the
// same function test/engine/chroma-envelope-gate.mjs ratchets against its fixture; this report only
// prints it against the ruled bars.
//
// READING (a) prints TWICE per mode (#725 R74, option A, C2.2): a `gate path` block (each palette
// rendered WITHOUT its own `anchor`, what a user's own non-anchored palette renders) that carries the
// ruled bars (`TARGET`, unchanged) and their OK/FAIL suffixes, and an `anchored` block (the RENDERED
// path, anchor passed, since fa0264fa) that prints each median and p90 with no bar, the count of
// instances over 90% at stop 300, and the clause lines. The anchored cells are held by the
// chroma-envelope gate's ratchet, not by a bar: their stop-300 excess is a lightness effect (a dark
// anchor's stop 500 sits below its hue's cusp lightness, stop 300 on it) that no chroma cap reaches.
// The anchored clause lines stay barred for perceptual (the cusp-run rule, L*-window scoped) and peak
// (0 above 100%); even's anchored clause is reported only (#701 Q2), its barred clause is the gate path's.
//
// `--gate-path` (#701 U1, C5): prints the `gate path` block only, and renders the C6 (v) companion
// below without `anchor` too (the construction the since-retired `EVEN_DIP_BASELINE`'s `findDips` and
// this same file's pre-fa0264fa reading both used). #701's C5 extraction reads its even block.
//
// `--group-chroma` (#785 U2) is a SEPARATE mode: the movement a group's Base chroma slider makes. It
// renders the HEAD tree's `defaultDocument()` (so the head's `GROUP_DEFAULTS` and `persist.js` feed both
// sides) through `projectView` twice: the reference side with `paletteGroups[<group>].baseChroma` at the
// first value, on the base tree's `projectView` (`--base <rev>` or `--base-dir <dir>`; this file's own
// tree when neither is given), and the subject side at the second value on this file's own tree. It
// keeps the group's palettes and prints, per palette, the display-ramp hexes moved, the signed CAM16 C
// move at stop 500 (`dC@500`, the ramp row's own `chroma`) and the largest |dC| over the ramp, once
// with each palette's `anchor` kept (what the kit renders) and once with it stripped (the unanchored
// path). `--values A,A` with no base is its own negative control: every column prints 0.
// `--defaults` instead renders each tree's OWN `defaultDocument()` (the base tree's model and persist
// against this tree's, every group at its own default, anchors kept), once per toneMode, one row per
// palette: what a fresh document moves between the two trees. `--saved-material N` (with `--defaults`)
// compares this tree's default render against a saved document storing material N, hydrated through
// this tree's `persist.js` as a load would (no migration, R98), so it reads how an old save renders.
//
//   node scripts/report-preset-fidelity.mjs --group-chroma --group <material|brand|system|data>
//     --values A,B [--tone-mode perceptual|peak|even] [--base <rev> | --base-dir <dir>]
//   node scripts/report-preset-fidelity.mjs --group-chroma --defaults [--saved-material N]
//     [--base <rev> | --base-dir <dir>]
//
// It reports and exits 0 (1 when the group holds no palette, nothing was compared); the bounds (#785
// C2.1, C2.2, C2.7) are read off its output by the verifier, not enforced here.
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
//
// `--floor-ref` (#766 U1) is a THIRD, separate mode: the movement report for the even-mode chroma floor's
// gamut reference (`evenChroma`'s `floorRef`). It loads the same base tree as `--identity-control`
// (`--base <rev>` or `--base-dir <dir>`) and renders every curated document plus the default
// kit, `toneMode` forced to "even" (the way test/engine/even-dips-gate.mjs does), on the base engine and
// on this file's own tree, then diffs the cells. Each subject renders twice: `rendered` (the palette's
// own `anchor` passed, what projectView emits) and `gate` (anchor omitted, what a user's own palette
// renders), on `STOPS` (19) and on `EXPORT_STOPS` (25). Per path and stop set it prints cells, cells
// moved by hex, palettes and documents moved, the max dC (CAM16 C, the ramp row's own `chroma`), the dC
// histogram at <0.5 / <1 / <2 / <4 / >=4, the palettes moved with `hueShift` 0 (a counter-example list;
// on the gate path the per-stop reading and the per-ramp one are the same number there, so it stays
// empty), and the 12 largest movers. A moved cell means the head renders a different hex than the base
// for the same palette, controls and stop (controls are the doc's own fields, the even-dips-gate shape, not
// projectView's slice: equivalent while hydrate fills every field): a run against the tree's own head prints 0 everywhere.
// The `rendered` rows read the dampAmp-0 documents and the kit; the `gate` rows read every document. The
// scope is the one #766's own cell counts imply (rendered `STOPS` 71,820, gate `STOPS` 72,124). The dampAmp-70
// document (Adia) is left off the rendered rows because none of its palettes is anchored, so its rendered
// path equals its gate path, which the gate rows already count; the edge-rotated palettes that can move on
// the gate path sit in it, which is why the gate rows must read it.
//
//   node scripts/report-preset-fidelity.mjs --floor-ref (--base <rev> | --base-dir <dir>)
//     [--only <category>|default-kit]
//
// `--only` narrows the subjects to one category or `default-kit`, as in `--identity-control`. The mode
// reports and exits 0; the bounds (#766 C2.1/C2.2) are read off its output by the verifier, not enforced
// here.
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { join as pathJoin, resolve as pathResolve, dirname } from "node:path";
import { hydrate } from "../src/ui/persist.js";
import { rampChromaOf, EXPORT_STOPS, lstarFromRgb } from "../src/ui/model.mjs";
import * as T from "../src/engine/tonal.js";
import { CATS, REPORT_STOPS, MODES, ADIA_CARVEOUT, CUSP_RUN_BOUND, OVER_90_AT_300, percentile, measureEnvelope } from "./lib/envelope-measure.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = pathJoin(HERE, "..");
// declared here, ahead of the identity-control dispatch below, because that dispatch runs (and can
// call process.exit) before this module's own top-level `const` lines further down are reached
const IDENTITY_CATS = ["architecture", "brands", "cuisine", "film", "literature", "music", "nature", "travel"];
const IDENTITY_MODES = ["perceptual", "peak", "even"];
const FLOOR_BANDS = ["<0.5", "<1", "<2", "<4", ">=4"];
const floorBand = (dC) => (dC < 0.5 ? "<0.5" : dC < 1 ? "<1" : dC < 2 ? "<2" : dC < 4 ? "<4" : ">=4");

const args = process.argv.slice(2);
const mode_envelope = args.includes("--envelope");
const mode_identity = args.includes("--identity-control");
const mode_groupChroma = args.includes("--group-chroma");
const mode_floorRef = args.includes("--floor-ref");
const dampAmpIdx = args.indexOf("--damp-amp");
const dampAmpOverride = dampAmpIdx >= 0 ? Number(args[dampAmpIdx + 1]) : null;
const dampIdx = args.indexOf("--damp");
const dampOverride = dampIdx >= 0 ? Number(args[dampIdx + 1]) : null;
const dampCurveIdx = args.indexOf("--damp-curve");
const dampCurveOverride = dampCurveIdx >= 0 ? Number(args[dampCurveIdx + 1]) : null;
const gatePath = args.includes("--gate-path");

const USAGE =
  "usage: node scripts/report-preset-fidelity.mjs --envelope [--damp-amp N] [--damp N] [--damp-curve N] [--gate-path]\n" +
  "       node scripts/report-preset-fidelity.mjs --identity-control (--base <rev> | --base-dir <dir>) [--authored] [--only <category>|default-kit] [--perturb]\n" +
  "       node scripts/report-preset-fidelity.mjs --group-chroma --group <material|brand|system|data> --values A,B [--tone-mode perceptual|peak|even] [--base <rev> | --base-dir <dir>]\n" +
  "       node scripts/report-preset-fidelity.mjs --group-chroma --defaults [--saved-material N] [--base <rev> | --base-dir <dir>]\n" +
  "       node scripts/report-preset-fidelity.mjs --floor-ref (--base <rev> | --base-dir <dir>) [--only <category>|default-kit]";

if (!mode_envelope && !mode_identity && !mode_groupChroma && !mode_floorRef) {
  console.error(USAGE);
  process.exit(2);
}

if (mode_identity) {
  await runIdentityControl(args);
  // runIdentityControl always exits the process itself; nothing below this line runs for this mode.
}
if (mode_groupChroma) {
  await runGroupChroma(args);
  // runGroupChroma always exits the process itself; nothing below this line runs for this mode.
}
if (mode_floorRef) {
  await runFloorRef(args);
  // runFloorRef always exits the process itself; nothing below this line runs for this mode.
}

// The C6 corpus and READING (a)'s loop live in scripts/lib/envelope-measure.mjs (#725 U1), which
// test/engine/chroma-envelope-gate.mjs imports too: one measurement, two callers.
// The gate path is always measured (its cells carry the bars); the anchored set only on the default run.
const gateRun = await measureEnvelope({ dampAmpOverride, dampOverride, dampCurveOverride, gatePath: true });
const anchoredRun = gatePath ? null : await measureEnvelope({ dampAmpOverride, dampOverride, dampCurveOverride, gatePath: false });
const { instances, totalCurated } = gateRun;

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
      damp: dampOverride !== null ? dampOverride : doc.damp,
      dampCurve: dampCurveOverride !== null ? dampCurveOverride : doc.dampCurve,
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

console.log(`report-preset-fidelity --envelope${dampAmpOverride !== null ? ` --damp-amp ${dampAmpOverride}` : ""}${dampOverride !== null ? ` --damp ${dampOverride}` : ""}${dampCurveOverride !== null ? ` --damp-curve ${dampCurveOverride}` : ""}${gatePath ? " --gate-path" : ""}`);
console.log(`corpus: ${totalCurated} curated palettes, ${instances.length} instances at source chroma >= 10 or in the 8 default-kit semantic families`);
console.log(`env(500) = 1 sweep: ${envFails === 0 ? "PASS" : `FAIL (${envFails} combinations off)`}`);
console.log("");
console.log("=== READING (a): emitted CAM16 chroma at each stop, as % of the emitted chroma at stop 500 ===");
console.log("(the literal text of C6: \"CAM16 chroma at stops 100/300/700/900 over stop 500\")");

const TARGET = { 100: { median: 25, p90: 35 }, 300: { median: 75, p90: 90 }, 700: { median: 75, p90: 90 }, 900: { median: 25, p90: 35 } };
let anyFail = envFails > 0;
// One READING (a) block: `barCells` puts the ruled bars and OK/FAIL on each cell; `barClause` does the
// same for the clause line. Every bar that prints FAIL sets `anyFail`; an unbarred line never does.
function printReadingA(m, mode, heading, { barCells, barClause }) {
  const { results, aboveTotal, adiaAboveTotal, aboveWitnesses, perceptualRunFails, namedAbove, namedExceptions } = m;
  console.log(`  ${heading}:`);
  for (const s of REPORT_STOPS) {
    const r = results[mode][s];
    if (!barCells) { console.log(`    stop ${s}: median ${r.median.toFixed(1)}% / p90 ${r.p90.toFixed(1)}% n=${r.n}`); continue; }
    const t = TARGET[s];
    const medOk = r.median <= t.median, p90Ok = r.p90 <= t.p90;
    if (!medOk || !p90Ok) anyFail = true;
    console.log(`    stop ${s}: median ${r.median.toFixed(1)}% (<=${t.median} ${medOk ? "OK" : "FAIL"}) / p90 ${r.p90.toFixed(1)}% (<=${t.p90} ${p90Ok ? "OK" : "FAIL"}) n=${r.n}`);
  }
  if (!m.gatePath) console.log(`    over ${OVER_90_AT_300} at stop 300: ${m.over90At300[mode]} of ${results[mode][300].n}`);
  // A named exception (NAMED_EXCEPTIONS, #725 R76 Q2) is counted and printed; the verdict reads the rest.
  const aboveOk = aboveTotal[mode] - namedAbove[mode] === 0;
  if (barClause && !aboveOk) anyFail = true;
  const verdict = barClause ? ` ${aboveOk ? "OK" : "FAIL"}` : " (reported, not barred)";
  if (mode === "perceptual") {
    const witnesses = [...perceptualRunFails.runs, ...perceptualRunFails.bound].slice(0, 3);
    console.log(`    clause: one cusp run, at or under ${(CUSP_RUN_BOUND * 100).toFixed(4)}% of stop 500 (#55 cusp-pull ships unchanged; ruling (f))`);
    if (!m.gatePath) {
      console.log(`    window: anchors with L* in [${T.RAMP_L_MIN}, ${T.RAMP_L_MAX}] count; ${m.outsideWindow} anchored instance(s) outside it, ${m.perceptualWindowExcluded.length} violation(s) excluded${m.perceptualWindowExcluded.length ? ":" : ""}`);
      for (const x of m.perceptualWindowExcluded) console.log(`      excluded: ${x.label} anchor ${x.anchor} L* ${x.lstar.toFixed(1)} (${x.why})`);
    }
    const named = namedExceptions[mode].length ? ` (named exception: ${namedExceptions[mode].join("; ")})` : "";
    console.log(`    rule violations (second run or past-bound stop): ${aboveTotal[mode]}${named}${verdict}${witnesses.length ? ` (e.g. ${witnesses.join(", ")})` : ""}`);
  } else {
    console.log(`    clause: 0 above 100% of stop 500 (generated palettes, dampAmp 0)`);
    console.log(`    above 100% of stop 500: ${aboveTotal[mode]}${verdict}${aboveWitnesses[mode].length ? ` (e.g. ${aboveWitnesses[mode].join(", ")})` : ""}`);
  }
  console.log(`    (${adiaAboveTotal[mode]} additional instance(s) from the named Adia carve-out, exempt from this clause)`);
}
for (const mode of MODES) {
  console.log(`${mode}:`);
  printReadingA(gateRun, mode, `gate path (anchor omitted; the ruled bars apply)`, { barCells: true, barClause: true });
  if (anchoredRun) {
    printReadingA(anchoredRun, mode, `anchored (rendered path; reported, no bar, ratcheted by test/engine/fixtures/chroma-envelope.json)`,
      { barCells: false, barClause: mode !== "even" });
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
        const ramp = T.paletteStops({ hue: pal.hue, chroma, skew: pal.skew, lift: pal.lift, hueShift: pal.hueShift ?? 0, hueSameDir: pal.hueSameDir === true, cuspPull: pal.cuspPull, anchor: gatePath ? undefined : pal.anchor }, controls, T.STOPS);
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
console.log(`READING (a) (emitted chroma; gate-path cells and the barred clause lines): ${anyFail ? "FAIL" : "PASS"}`);
console.log(`READING (b) (envelope multiplier): ${envAnyFail ? "FAIL" : "PASS"}`);
console.log("");
console.log((anyFail || envAnyFail) ? "FAIL: the envelope table does not clear the plan's ruled targets under at least one reading" : "PASS: envelope table clears the plan's ruled targets under both readings");
process.exit((anyFail || envAnyFail) ? 1 : 0);

// ── --group-chroma ──────────────────────────────────────────────────────────────────────────────
// #785 U2: the group Base chroma movement report (see the header). The reference side may run on a
// base tree's `projectView`; the document is always the head's own `defaultDocument()`.

async function runGroupChroma(args) {
  // local, not module-level: the dispatch near the top calls this before any later top-level `const` runs
  const GROUP_CHROMA_GROUPS = ["material", "brand", "system", "data"];
  const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
  const group = flag("--group");
  const values = (flag("--values") ?? "").split(",").map(Number);
  const toneMode = flag("--tone-mode") ?? "perceptual";
  const baseRev = flag("--base");
  const baseDirArg = flag("--base-dir");
  const defaults = args.includes("--defaults");
  const savedMaterial = args.includes("--saved-material") ? Number(flag("--saved-material")) : null;
  const badGroupArgs = !GROUP_CHROMA_GROUPS.includes(group) || values.length !== 2 || values.some((v) => !Number.isFinite(v)) || !IDENTITY_MODES.includes(toneMode);
  if ((defaults ? (savedMaterial !== null && !Number.isFinite(savedMaterial)) : (badGroupArgs || savedMaterial !== null)) ||
      (args.includes("--base") && !baseRev) || (baseRev && baseDirArg)) {
    console.error(USAGE);
    process.exit(2);
  }

  const { defaultDocument, projectView, paletteGroup } = await import("../src/ui/model.mjs");
  let baseProjectView = projectView, baseDefaultDocument = defaultDocument;
  let baseLabel = "this tree";
  if (baseRev || baseDirArg) {
    let baseDir;
    if (baseDirArg) {
      baseDir = pathResolve(process.cwd(), baseDirArg);
    } else {
      const scratch = mkdtempSync(pathJoin(tmpdir(), "group-chroma-"));
      process.on("exit", () => { try { rmSync(scratch, { recursive: true, force: true }); } catch { /* best effort */ } });
      try {
        const archive = execFileSync("git", ["archive", baseRev, "src"], { cwd: REPO_ROOT, maxBuffer: 1024 * 1024 * 256 });
        execFileSync("tar", ["-x", "-C", scratch], { input: archive });
      } catch (e) {
        console.error(`usage: --base ${baseRev} could not be archived: ${e.message}`);
        process.exit(2);
      }
      baseDir = scratch;
    }
    try {
      ({ projectView: baseProjectView, defaultDocument: baseDefaultDocument } = await import(pathToFileURL(pathJoin(baseDir, "src/ui/model.mjs")).href));
    } catch (e) {
      console.error(`usage: base tree at ${baseDir} failed to load: ${e.message}`);
      process.exit(2);
    }
    if (typeof baseProjectView !== "function") {
      console.error(`usage: base tree at ${baseDir} is missing the export projectView`);
      process.exit(2);
    }
    baseLabel = baseRev ?? baseDir;
  }

  const render = (pv, value, keepAnchors) => {
    const doc = defaultDocument();
    doc.toneMode = toneMode;
    doc.paletteGroups[group].baseChroma = value;
    if (!keepAnchors) doc.palettes = doc.palettes.map(({ anchor, sourceAnchor, ...rest }) => rest);
    const view = pv(doc);
    return doc.palettes.map((p, i) => ({ name: p.name, group: paletteGroup(p), ramp: view.palettes[i].ramp })).filter((r) => r.group === group);
  };
  const fmt = (n) => (Math.abs(n) < 0.005 ? "0.00" : n.toFixed(2));
  const row = (name, r, s) => {
    const moved = s.filter((c, k) => c.hex !== r[k].hex).length;
    const dC = s.map((c, k) => c.chroma - r[k].chroma);
    const k500 = s.findIndex((c) => c.stop === 500);
    return `  ${name.padEnd(12)} hex moved ${moved}/${s.length}  dC@500 ${fmt(dC[k500])}  max dC ${fmt(Math.max(...dC.map(Math.abs)))}`;
  };

  if (defaults) {
    // The reference side: the base tree's own fresh document (or, with --saved-material, this tree's);
    // the subject side: this tree's fresh document (or the saved one, hydrated here).
    const savedDoc = () => {
      const doc = hydrate(JSON.parse(JSON.stringify(defaultDocument())));
      doc.paletteGroups = { ...doc.paletteGroups, material: { ...doc.paletteGroups.material, baseChroma: savedMaterial } };
      return hydrate(JSON.parse(JSON.stringify(doc)));
    };
    const refLabel = savedMaterial !== null ? "this tree's defaults" : `${baseLabel} defaults`;
    const subLabel = savedMaterial !== null ? `a saved doc with material ${savedMaterial}, hydrated on this tree` : "this tree's defaults";
    console.log(`group-chroma --defaults: ${refLabel} to ${subLabel}, anchors kept`);
    let rows = 0;
    for (const mode of IDENTITY_MODES) {
      const refDoc = savedMaterial !== null ? defaultDocument() : baseDefaultDocument();
      const subDoc = savedMaterial !== null ? savedDoc() : defaultDocument();
      refDoc.toneMode = mode;
      subDoc.toneMode = mode;
      const ref = (savedMaterial !== null ? projectView : baseProjectView)(refDoc).palettes;
      const sub = projectView(subDoc).palettes;
      console.log(`toneMode ${mode}`);
      for (const s of sub) {
        const r = ref.find((x) => x.name === s.name);
        if (!r || r.ramp.length !== s.ramp.length) { console.log(`  ${s.name.padEnd(12)} no matching reference ramp`); continue; }
        console.log(row(s.name, r.ramp, s.ramp));
        rows++;
      }
    }
    if (rows === 0) {
      console.log("FAIL: vacuity, no palette compared");
      process.exit(1);
    }
    process.exit(0);
  }

  console.log(`group-chroma: group ${group}, ${values[0]} (${baseLabel}) to ${values[1]} (this tree), toneMode ${toneMode}`);
  let rows = 0;
  for (const [label, keep] of [["anchors kept", true], ["anchors stripped", false]]) {
    const ref = render(baseProjectView, values[0], keep);
    const sub = render(projectView, values[1], keep);
    console.log(label);
    for (const s of sub) {
      const r = ref.find((x) => x.name === s.name);
      if (!r || r.ramp.length !== s.ramp.length) continue;
      console.log(row(s.name, r.ramp, s.ramp));
      rows++;
    }
  }
  if (rows === 0) {
    console.log(`FAIL: vacuity, the ${group} group holds no palette in the default kit`);
    process.exit(1);
  }
  process.exit(0);
}

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

// ── --floor-ref ─────────────────────────────────────────────────────────────────────────────────
// #766 U1: the even-mode floor-reference movement report (see the header). Reads the same base tree
// shape as --identity-control, renders both engines in "even", and reports the per-stop movement.

async function runFloorRef(args) {
  const baseIdx = args.indexOf("--base");
  const baseDirIdx = args.indexOf("--base-dir");
  const onlyIdx = args.indexOf("--only");
  const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null;
  if ((baseIdx < 0) === (baseDirIdx < 0)) { console.error(USAGE); process.exit(2); }
  if (only !== null && only !== "default-kit" && !IDENTITY_CATS.includes(only)) {
    console.error(`usage: --only must be one of ${IDENTITY_CATS.join(", ")} or default-kit, got "${only}"`);
    process.exit(2);
  }

  let baseDir;
  if (baseDirIdx >= 0) {
    baseDir = pathResolve(process.cwd(), args[baseDirIdx + 1]);
  } else {
    const rev = args[baseIdx + 1];
    if (!rev) { console.error(USAGE); process.exit(2); }
    const scratch = mkdtempSync(pathJoin(tmpdir(), "floor-ref-"));
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

  const need = { "src/ui/persist.js": ["hydrate"], "src/ui/model.mjs": ["defaultDocument", "rampChromaOf"], "src/engine/tonal.js": ["paletteStops"] };
  const mods = {};
  for (const rel of Object.keys(need)) {
    if (!existsSync(pathJoin(baseDir, rel))) { console.error(`usage: base tree at ${baseDir} is missing ${rel}`); process.exit(2); }
    try { mods[rel] = await import(pathToFileURL(pathJoin(baseDir, rel)).href); }
    catch (e) { console.error(`usage: base tree at ${baseDir} failed to load: ${e.message}`); process.exit(2); }
    for (const name of need[rel]) {
      if (!(name in mods[rel])) { console.error(`usage: base tree at ${baseDir} is missing the export ${name}`); process.exit(2); }
    }
  }
  const basePersist = mods["src/ui/persist.js"], baseModel = mods["src/ui/model.mjs"], baseTonal = mods["src/engine/tonal.js"];
  const engines = {
    base: { rampChromaOf: baseModel.rampChromaOf, paletteStops: baseTonal.paletteStops },
    head: { rampChromaOf, paletteStops: T.paletteStops },
  };

  const subjects = [];
  const wantKit = only === null || only === "default-kit";
  const wantCats = only === null ? IDENTITY_CATS : (only === "default-kit" ? [] : [only]);
  let docCount = 0, skippedAmp = 0;
  // Every curated doc and the default kit is a subject. The rendered path reads only the dampAmp-0 docs and
  // the kit, the gate path reads all of them (the scope #766's own cell counts imply). A dampAmp != 0 doc
  // (Adia) has no anchored palette, so its rendered path equals its gate path, already counted by the gate
  // rows; and its edge-rotated (hueShift != 0) palettes are the gate row's only possible movers, so the
  // gate rows must read it. Both sides render each doc as given.
  const addDoc = (slug, name, doc, always = false) => {
    const ampZero = always || (doc.dampAmp ?? 0) === 0;
    if (!ampZero) skippedAmp++;
    docCount++;
    for (const pal of doc.palettes) subjects.push({ label: `${slug}/${name}/${pal.name}`, docLabel: `${slug}/${name}`, pal, doc, ampZero });
  };
  for (const slug of wantCats) {
    const catPath = pathJoin(baseDir, `src/ui/categories/${slug}.js`);
    if (!existsSync(catPath)) { console.error(`usage: base tree at ${baseDir} is missing category ${slug}`); process.exit(2); }
    const { PRESETS } = await import(pathToFileURL(catPath).href);
    for (const preset of PRESETS) addDoc(slug, preset.name, basePersist.hydrate({ ...preset }));
  }
  if (wantKit) addDoc("default-kit", "kit", baseModel.defaultDocument(), true);
  if (subjects.length === 0) { console.log("FAIL: vacuity, no palettes loaded"); process.exit(1); }

  const render = (engine, pal, doc, stops, withAnchor) => {
    const controls = {
      curve: doc.curve, tension: doc.tension, lmin: doc.lmin, lmax: doc.lmax,
      damp: doc.damp, dampCurve: doc.dampCurve, dampAmp: doc.dampAmp, dampBias: doc.dampBias,
      hueSpace: doc.hueSpace, relChroma: doc.relChroma, chromaFloor: doc.chromaFloor,
      vibrancy: doc.vibrancy, toneMode: "even",
    };
    return engine.paletteStops(
      { hue: pal.hue, chroma: engine.rampChromaOf(pal, doc), skew: pal.skew, lift: pal.lift, hueShift: pal.hueShift ?? 0, hueSameDir: pal.hueSameDir === true, cuspPull: pal.cuspPull, ...(withAnchor && pal.anchor ? { anchor: pal.anchor } : {}) },
      controls, stops,
    );
  };

  console.log(`report-preset-fidelity --floor-ref (#766 U1)${only ? ` --only ${only}` : ""}`);
  console.log(`base: ${baseDir}`);
  console.log(`subjects: ${docCount} document(s), ${subjects.length} palettes (${skippedAmp} dampAmp != 0 doc(s), gate path only), toneMode forced to even`);

  let totalMoved = 0;
  for (const [path, withAnchor] of [["rendered", true], ["gate", false]]) {
    for (const [setName, stops] of [["STOPS", T.STOPS], ["EXPORT_STOPS", EXPORT_STOPS]]) {
      let cells = 0, moved = 0, maxDC = 0, palsMoved = 0;
      const docsMoved = new Set(), hist = Object.fromEntries(FLOOR_BANDS.map((b) => [b, 0])), movers = [], zeroShiftMoved = new Set();
      for (const { label, docLabel, pal, doc, ampZero } of subjects) {
        if (withAnchor && !ampZero) continue;
        const a = render(engines.base, pal, doc, stops, withAnchor);
        const b = render(engines.head, pal, doc, stops, withAnchor);
        let pm = false;
        const n = Math.min(a.length, b.length);
        for (let i = 0; i < n; i++) {
          cells++;
          if (a[i].hex === b[i].hex) continue;
          const dC = Math.abs(a[i].chroma - b[i].chroma);
          moved++; pm = true;
          if (dC > maxDC) maxDC = dC;
          hist[floorBand(dC)]++;
          movers.push({ label, stop: a[i].stop, from: a[i].hex, to: b[i].hex, dC, hueShift: pal.hueShift ?? 0 });
        }
        if (pm) {
          palsMoved++; docsMoved.add(docLabel);
          if ((pal.hueShift ?? 0) === 0) zeroShiftMoved.add(label);
        }
      }
      totalMoved += moved;
      console.log("");
      console.log(`=== ${path} path, ${setName} (${stops.length} stops) ===`);
      console.log(`  cells ${cells} · moved ${moved}${cells ? ` (${(100 * moved / cells).toFixed(1)}%)` : ""} · palettes moved ${palsMoved} · docs moved ${docsMoved.size} · max dC ${maxDC.toFixed(2)} C`);
      console.log(`  histogram (dC): ${FLOOR_BANDS.map((k) => `${k}: ${hist[k]}`).join(" · ")}`);
      console.log(`  moved in hueShift 0 palettes: ${zeroShiftMoved.size} palette(s)${!withAnchor && zeroShiftMoved.size ? ` (counter-examples: ${[...zeroShiftMoved].slice(0, 5).join(", ")})` : ""}`);
      movers.sort((x, y) => y.dC - x.dC);
      console.log(`  ${Math.min(12, movers.length)} largest mover(s):`);
      for (const m of movers.slice(0, 12)) console.log(`    ${m.dC.toFixed(2)} C  ${m.label} stop ${m.stop}  ${m.from} -> ${m.to}  (hueShift ${m.hueShift})`);
    }
  }
  console.log("");
  console.log(`${totalMoved} moved cell(s) in total`);
  process.exit(0);
}
